'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This Module supports the creation and use of workoutSegment
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Architecture.md#session-interval-and-split-boundaries-in-sessionmanagerjs|the description of the concepts used}
 */
/* eslint-disable max-lines -- This contains a lot of checks on individual metrics, so it is long */
import { createWLSLinearSeries } from './WLSLinearSeries.js'
import { createInfiniteSeriesMetrics } from './InfiniteSeriesMetrics.js'
import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

/**
 * @description This function creates a workoutsegment
 */
export function createWorkoutSegment (config) {
  const numOfDataPointsForAveraging = config.numOfPhasesForAveragingScreenData
  const distanceOverTime = createWLSLinearSeries(Math.min(4, numOfDataPointsForAveraging))
  const caloriesOverTime = createWLSLinearSeries(Math.min(4, numOfDataPointsForAveraging))
  const _averageForce = createInfiniteSeriesMetrics()
  const _power = createInfiniteSeriesMetrics()
  const _linearVelocity = createInfiniteSeriesMetrics()
  const _strokerate = createInfiniteSeriesMetrics()
  const _strokedistance = createInfiniteSeriesMetrics()
  const _caloriesPerHour = createInfiniteSeriesMetrics()
  const _dragFactor = createInfiniteSeriesMetrics()
  let _type = 'justrow'
  let _startTimestamp
  let _startMovingTime = 0
  let _startLinearDistance = 0
  let _startStrokeNumber = 0
  let _startWork = 0
  let _startCalories = 0
  let _targetTime = 0
  let _targetDistance = 0
  let _targetCalories = 0
  let _endMovingTime = 0
  let _endLinearDistance = 0
  let _endCalories = 0
  let _totalNumberIntervals = 0
  let _split = {
    type: 'justrow',
    targetDistance: 0,
    targetTime: 0
  }

  /**
   * @description This function sets the starting point of a workout segment
   */
  function setStart (baseMetrics) {
    resetSegmentMetrics()
    _startMovingTime = (baseMetrics.totalMovingTime !== undefined && baseMetrics.totalMovingTime > 0 ? baseMetrics.totalMovingTime : 0)
    _startLinearDistance = (baseMetrics.totalLinearDistance !== undefined && baseMetrics.totalLinearDistance > 0 ? baseMetrics.totalLinearDistance : 0)
    _startTimestamp = baseMetrics.timestamp
    _startWork = baseMetrics.totalWork
    _startCalories = baseMetrics.totalCalories
    _startStrokeNumber = baseMetrics.totalNumberOfStrokes
  }

  function setStartTimestamp (timestamp) {
    _startTimestamp = timestamp
  }

  function getStartTimestamp () {
    return _startTimestamp
  }

  /**
   * @description This function summarizes a group of intervals into a single workout
   */
  function summarize (intervals) {
    let intervalNumber = 0
    let totalDistance = 0
    let totalTime = 0
    let totalCalories = 0
    let containsJustRow = false
    _totalNumberIntervals = Math.max(intervals.length, 1)
    switch (true) {
      case (intervals.length === 0):
        setEnd({ type: 'justrow' })
        break
      case (intervals.length === 1):
        setEnd(intervals[0])
        break
      case (intervals.length > 1):
        while (intervalNumber < intervals.length) {
          switch (true) {
            case (intervals[intervalNumber].type === 'rest' && intervals[intervalNumber].targetTime > 0):
              // As a rest has no impact on the (target) total moving time and distance, there is nothing to do here
              break
            case (intervals[intervalNumber].type === 'distance' && intervals[intervalNumber].targetDistance > 0):
              totalDistance = totalDistance + Number(intervals[intervalNumber].targetDistance)
              break
            case (intervals[intervalNumber].type === 'time' && intervals[intervalNumber].targetTime > 0):
              totalTime = totalTime + Number(intervals[intervalNumber].targetTime)
              break
            case (intervals[intervalNumber].type === 'calories' && intervals[intervalNumber].targetCalories > 0):
              totalCalories = totalCalories + intervals[intervalNumber].targetCalories
              break
            case (intervals[intervalNumber].type === 'justrow'):
              containsJustRow = true
              break
            default:
              containsJustRow = true
          }
          intervalNumber++
        }
        switch (true) {
          case (containsJustRow):
            setEnd({ type: 'justrow' })
            break
          case (totalDistance > 0 && totalTime === 0 && totalCalories === 0):
            setEnd({ type: 'distance', targetDistance: totalDistance })
            break
          case (totalTime > 0 && totalDistance === 0 && totalCalories === 0):
            setEnd({ type: 'time', targetTime: totalTime })
            break
          case (totalCalories > 0 && totalTime === 0 && totalDistance === 0):
            setEnd({ type: 'calories', targetCalories: totalCalories })
            break
          default:
            setEnd({ type: 'justrow' })
        }
        break
      default:
        setEnd({ type: 'justrow' })
    }
  }

  /**
   * @description This function sets the segment parameters used
   */
  function setEnd (intervalSettings) {
    // Set the primairy parameters
    switch (true) {
      case (intervalSettings.type === 'rest' && Number(intervalSettings.targetTime) > 0):
        // A target time is set for a rest interval
        _type = 'rest'
        _targetTime = Number(intervalSettings.targetTime)
        _targetDistance = 0
        _targetCalories = 0
        _endMovingTime = _startMovingTime + Number(intervalSettings.targetTime)
        _endLinearDistance = 0
        _endCalories = 0
        log.debug(`  Workout parser, recognised ${_type} interval/split, ${_targetTime} seconds`)
        break
      case (intervalSettings.type === 'rest'):
        // An undefined rest interval
        _type = 'rest'
        _targetTime = 0
        _targetDistance = 0
        _targetCalories = 0
        _endMovingTime = _startMovingTime
        _endLinearDistance = 0
        _endCalories = 0
        log.debug(`  Workout parser, recognised undetermined ${_type} interval`)
        break
      case (intervalSettings.type === 'distance' && Number(intervalSettings.targetDistance) > 0):
        // A target distance is set
        _type = 'distance'
        _targetTime = 0
        _targetDistance = Number(intervalSettings.targetDistance)
        _targetCalories = 0
        _endMovingTime = 0
        _endLinearDistance = _startLinearDistance + Number(intervalSettings.targetDistance)
        _endCalories = 0
        log.debug(`  Workout parser, recognised ${_type} interval/split, ${_targetDistance} meters`)
        break
      case (intervalSettings.type === 'time' && Number(intervalSettings.targetTime) > 0):
        // A target time is set
        _type = 'time'
        _targetTime = Number(intervalSettings.targetTime)
        _targetDistance = 0
        _targetCalories = 0
        _endMovingTime = _startMovingTime + Number(intervalSettings.targetTime)
        _endLinearDistance = 0
        _endCalories = 0
        log.debug(`  Workout parser, recognised ${_type} interval/split, ${_targetTime} seconds`)
        break
      case (intervalSettings.type === 'calories' && Number(intervalSettings.targetCalories) > 0):
        // A target time is set
        _type = 'calories'
        _targetTime = 0
        _targetDistance = 0
        _targetCalories = Number(intervalSettings.targetCalories)
        _endMovingTime = 0
        _endLinearDistance = 0
        _endCalories = _startCalories + Number(intervalSettings.targetCalories)
        log.debug(`  Workout parser, recognised ${_type} interval/split, ${_targetCalories} kCal`)
        break
      case (intervalSettings.type === 'justrow'):
        _type = 'justrow'
        _targetTime = 0
        _targetDistance = 0
        _targetCalories = 0
        _endMovingTime = 0
        _endLinearDistance = 0
        _endCalories = 0
        log.debug(`  Workout parser, recognised ${_type} interval/split`)
        break
      default:
        log.error(`Workout parser, unknown interval type '${intervalSettings.type}', defaulting to a 'justrow' interval`)
        _type = 'justrow'
        _targetTime = 0
        _targetDistance = 0
        _targetCalories = 0
        _endMovingTime = 0
        _endLinearDistance = 0
        _endCalories = 0
    }

    // Set the split parameters
    switch (true) {
      case (intervalSettings.type === 'rest'):
        // A rest interval has no split defined
        _split = {
          type: 'rest',
          targetDistance: 0,
          targetTime: _targetTime,
          targetCalories: 0
        }
        break
      case (!!intervalSettings.split && intervalSettings.split !== undefined && intervalSettings.split.type === 'distance' && Number(intervalSettings.split.targetDistance) > 0):
        // A target distance is set
        _split = {
          type: 'distance',
          targetDistance: Number(intervalSettings.split.targetDistance),
          targetTime: 0,
          targetCalories: 0
        }
        break
      case (!!intervalSettings.split && intervalSettings.split !== undefined && intervalSettings.split.type === 'time' && Number(intervalSettings.split.targetTime) > 0):
        // A target time is set
        _split = {
          type: 'time',
          targetDistance: 0,
          targetTime: Number(intervalSettings.split.targetTime),
          targetCalories: 0
        }
        break
      case (!!intervalSettings.split && intervalSettings.split !== undefined && intervalSettings.split.type === 'calories' && Number(intervalSettings.split.targetCalories) > 0):
        // A target time is set
        _split = {
          type: 'calories',
          targetDistance: 0,
          targetTime: 0,
          targetCalories: Number(intervalSettings.split.targetCalories)
        }
        break
      case (!!intervalSettings.split && intervalSettings.split !== undefined && intervalSettings.split.type === 'justrow'):
        _split = {
          type: _type,
          targetDistance: _targetDistance,
          targetTime: _targetTime,
          targetCalories: _targetCalories
        }
        break
      case (!intervalSettings.split):
        // Split is left empty, we default to the entire interval
        _split = {
          type: _type,
          targetDistance: _targetDistance,
          targetTime: _targetTime,
          targetCalories: _targetCalories
        }
        break
      default:
        log.error(`Workout parser, unknown split type '${intervalSettings.split.type}', defaulting to copying interval type`)
        _split = {
          type: _type,
          targetDistance: _targetDistance,
          targetTime: _targetTime,
          targetCalories: _targetCalories
        }
    }
  }

  /**
   * @returns {string} the type of the workoutSegment
   */
  function type () {
    return _type
  }

  /*
   * @description This function is return the underlying split of a workoutsegment (typically an interval)
   */
  function getSplit () {
    return _split
  }

  /**
   * @returns {boolean} If the boundary of the planned segment has been reached
   */
  function isEndReached (baseMetrics) {
    switch (_type) {
      case 'distance':
        if (_endLinearDistance > 0 && baseMetrics.totalLinearDistance >= _endLinearDistance) {
          return true
        } else {
          return false
        }
      case 'time':
        if (_endMovingTime > 0 && baseMetrics.totalMovingTime >= _endMovingTime) {
          return true
        } else {
          return false
        }
      case 'calories':
        if (_endCalories > 0 && baseMetrics.totalCalories >= _endCalories) {
          return true
        } else {
          return false
        }
      default:
        return false
    }
  }

  /**
   * @description This function returns the remaining split (used for managing unplanned pauses)
   */
  function remainder (baseMetrics) {
    switch (_type) {
      case ('distance'):
        return {
          type: _type,
          targetDistance: distanceToEnd(baseMetrics)
        }
      case ('time'):
        return {
          type: _type,
          targetTime: timeToEnd(baseMetrics)
        }
      case ('calories'):
        return {
          type: _type,
          targetCalories: caloriesToEnd(baseMetrics)
        }
      default:
        return {
          type: _type,
          targetTime: 0
        }
    }
  }

  /**
   * @description Updates projectiondata and segment metrics
   */
  function push (baseMetrics) {
    distanceOverTime.push(baseMetrics.totalMovingTime, baseMetrics.totalLinearDistance, 1)
    caloriesOverTime.push(baseMetrics.totalMovingTime, baseMetrics.totalCalories, 1)
    if (!!baseMetrics.cyclePower && !isNaN(baseMetrics.cyclePower) && baseMetrics.cyclePower > 0) { _power.push(baseMetrics.cyclePower) }
    if (!!baseMetrics.driveAverageHandleForce && !isNaN(baseMetrics.driveAverageHandleForce) && baseMetrics.driveAverageHandleForce > 0) { _averageForce.push(baseMetrics.driveAverageHandleForce) }
    if (!!baseMetrics.cycleLinearVelocity && !isNaN(baseMetrics.cycleLinearVelocity) && baseMetrics.cycleLinearVelocity > 0) { _linearVelocity.push(baseMetrics.cycleLinearVelocity) }
    if (!!baseMetrics.cycleStrokeRate && !isNaN(baseMetrics.cycleStrokeRate) && baseMetrics.cycleStrokeRate > 0) { _strokerate.push(baseMetrics.cycleStrokeRate) }
    if (!!baseMetrics.cycleDistance && !isNaN(baseMetrics.cycleDistance) && baseMetrics.cycleDistance > 0) { _strokedistance.push(baseMetrics.cycleDistance) }
    if (!!baseMetrics.totalCaloriesPerHour && !isNaN(baseMetrics.totalCaloriesPerHour) && baseMetrics.totalCaloriesPerHour > 0) { _caloriesPerHour.push(baseMetrics.totalCaloriesPerHour) }
    if (!!baseMetrics.dragFactor && !isNaN(baseMetrics.dragFactor) && baseMetrics.dragFactor > 0) { _dragFactor.push(baseMetrics.dragFactor) }
  }

  /*
   * @description This function is used to precisely calculate the end of a workout segment after the sessionManager conlcudes it has passed the workoutSegment's boundary
   */
  function interpolateEnd (prevMetrics, currMetrics) {
    const projectedMetrics = { ...prevMetrics }
    projectedMetrics.modified = false
    switch (true) {
      case (_type === 'distance' && _endLinearDistance > 0 && currMetrics.totalLinearDistance > _endLinearDistance):
        // We are in a distance based interval, and overshot the targetDistance
        projectedMetrics.totalMovingTime = interpolatedTime(prevMetrics, currMetrics, _endLinearDistance)
        projectedMetrics.totalLinearDistance = _endLinearDistance
        projectedMetrics.totalCalories = interpolatedCaloriesFromTime(prevMetrics, currMetrics, projectedMetrics.totalMovingTime)
        projectedMetrics.modified = true
        break
      case (_type === 'time' && _endMovingTime > 0 && currMetrics.totalMovingTime > _endMovingTime):
        // We are in a time based interval, and overshot the targetTime
        projectedMetrics.totalLinearDistance = interpolatedDistance(prevMetrics, currMetrics, _endMovingTime)
        projectedMetrics.totalMovingTime = _endMovingTime
        projectedMetrics.totalCalories = interpolatedCaloriesFromTime(prevMetrics, currMetrics, _endMovingTime)
        projectedMetrics.modified = true
        break
      case (_type === 'calories' && _endCalories > 0 && currMetrics.totalCalories > _endCalories):
        // We are in a calorie based interval, and overshot the targetCalories
        projectedMetrics.totalCalories = _endCalories
        projectedMetrics.totalMovingTime = interpolatedTimeFromCalories(prevMetrics, currMetrics, _endCalories)
        projectedMetrics.totalLinearDistance = interpolatedDistance(prevMetrics, currMetrics, projectedMetrics.totalMovingTime)
        projectedMetrics.modified = true
        break
      default:
        // Nothing to do
    }
    projectedMetrics.timestamp = new Date(currMetrics.timestamp.getTime() - ((currMetrics.totalMovingTime - projectedMetrics.totalMovingTime) * 1000))
    // Prevent the edge case where we trigger two strokes at milliseconds apart when using the interpolation function
    projectedMetrics.metricsContext.isDriveStart = false
    projectedMetrics.metricsContext.isRecoveryStart = false
    projectedMetrics.metricsContext.isSessionStart = false
    projectedMetrics.metricsContext.isIntervalEnd = false
    projectedMetrics.metricsContext.isSplitEnd = false
    projectedMetrics.metricsContext.isPauseStart = false
    projectedMetrics.metricsContext.isPauseEnd = false
    projectedMetrics.metricsContext.isSessionStop = false
    return projectedMetrics
  }

  /*
   * @description This function is used to precisely calculate the end time of a workout segment based on a target distance
   * @see {@link https://en.wikipedia.org/wiki/Linear_interpolation|the math behind interpolation}
   * @returns {float} the exact time where the distance barrier was crossed
   */
  function interpolatedTime (prevMetrics, currMetrics, targetDistance) {
    if (prevMetrics.totalLinearDistance < targetDistance && targetDistance < currMetrics.totalLinearDistance) {
      return (prevMetrics.totalMovingTime + ((currMetrics.totalMovingTime - prevMetrics.totalMovingTime) * ((targetDistance - prevMetrics.totalLinearDistance) / (currMetrics.totalLinearDistance - prevMetrics.totalLinearDistance))))
    } else {
      return currMetrics.totalMovingTime
    }
  }

  /*
   * @description This function is used to precisely calculate the end distance of a workout segment based on a target time
   * @see {@link https://en.wikipedia.org/wiki/Linear_interpolation|the math behind interpolation}
   * @returns {float} the exact distance where the time barrier was crossed
   */
  function interpolatedDistance (prevMetrics, currMetrics, targetTime) {
    if (prevMetrics.totalMovingTime < targetTime && targetTime < currMetrics.totalMovingTime) {
      return (prevMetrics.totalLinearDistance + ((currMetrics.totalLinearDistance - prevMetrics.totalLinearDistance) * ((targetTime - prevMetrics.totalMovingTime) / (currMetrics.totalMovingTime - prevMetrics.totalMovingTime))))
    } else {
      return currMetrics.totalLinearDistance
    }
  }

  /*
   * @description This function is used to precisely calculate the end time of a workout segment based on a target calories
   * @see {@link https://en.wikipedia.org/wiki/Linear_interpolation|the math behind interpolation}
   * @returns {float} the exact time where the calories barrier was crossed
   */
  function interpolatedTimeFromCalories (prevMetrics, currMetrics, targetCalories) {
    if (prevMetrics.totalCalories < targetCalories && targetCalories < currMetrics.totalCalories) {
      return (prevMetrics.totalMovingTime + ((currMetrics.totalMovingTime - prevMetrics.totalMovingTime) * ((targetCalories - prevMetrics.totalCalories) / (currMetrics.totalCalories - prevMetrics.totalCalories))))
    } else {
      return currMetrics.totalMovingTime
    }
  }

  /*
   * @description This function is used to precisely calculate the end calories of a workout segment based on a target time
   * @see {@link https://en.wikipedia.org/wiki/Linear_interpolation|the math behind interpolation}
   * @returns {float} the exact calories where the time barrier was crossed
   */
  function interpolatedCaloriesFromTime (prevMetrics, currMetrics, targetTime) {
    if (prevMetrics.totalMovingTime < targetTime && targetTime < currMetrics.totalMovingTime) {
      // See https://en.wikipedia.org/wiki/Linear_interpolation
      return (prevMetrics.totalCalories + ((currMetrics.totalCalories - prevMetrics.totalCalories) * ((targetTime - prevMetrics.totalMovingTime) / (currMetrics.totalMovingTime - prevMetrics.totalMovingTime))))
    } else {
      return currMetrics.totalCalories
    }
  }

  /**
   * @description This function returns all the workoutSegment metrics for the current workoutSegment
   */
  function metrics (baseMetrics) {
    return {
      type: _type,
      ...(_totalNumberIntervals > 0 ? { numberOfIntervals: _totalNumberIntervals } : {}),
      numberOfStrokes: numberOfStrokes(baseMetrics),
      distance: {
        absoluteStart: _startLinearDistance,
        fromStart: distanceFromStart(baseMetrics),
        target: targetDistance(),
        toEnd: distanceToEnd(baseMetrics),
        projectedEnd: projectedEndDistance()
      },
      movingTime: {
        absoluteStart: _startMovingTime,
        sinceStart: movingTimeSinceStart(baseMetrics),
        target: targetTime(),
        toEnd: timeToEnd(baseMetrics),
        projectedEnd: projectedEndTime()
      },
      timeSpent: {
        total: totalTime(baseMetrics),
        moving: movingTimeSinceStart(baseMetrics),
        rest: Math.max(restTime(baseMetrics), 0)
      },
      linearVelocity: {
        average: averageLinearVelocity(baseMetrics),
        minimum: _linearVelocity.minimum(),
        maximum: _linearVelocity.maximum()
      },
      pace: {
        average: linearVelocityToPace(averageLinearVelocity(baseMetrics)),
        minimum: linearVelocityToPace(_linearVelocity.minimum()),
        maximum: linearVelocityToPace(_linearVelocity.maximum())
      },
      power: {
        average: _power.average(),
        minimum: _power.minimum(),
        maximum: _power.maximum()
      },
      averageForce: {
        average: _averageForce.average(),
        minimum: _averageForce.minimum(),
        maximum: _averageForce.maximum()
      },
      work: {
        absoluteStart: _startWork,
        sinceStart: Math.max(baseMetrics.totalWork - _startWork, 0)
      },
      calories: {
        absoluteStart: _startCalories,
        sinceStart: spentCalories(baseMetrics),
        target: targetCalories(),
        toEnd: caloriesToEnd(baseMetrics),
        totalSpent: spentCalories(baseMetrics),
        averagePerHour: _caloriesPerHour.average()
      },
      caloriesSpent: {
        total: totalCalories(baseMetrics),
        moving: spentCalories(baseMetrics),
        rest: restCalories(baseMetrics)
      },
      strokeDistance: {
        average: _strokedistance.average(),
        minimum: _strokedistance.minimum(),
        maximum: _strokedistance.maximum()
      },
      strokerate: {
        average: _strokerate.average(),
        minimum: _strokerate.minimum(),
        maximum: _strokerate.maximum()
      },
      dragfactor: {
        average: _dragFactor.average(),
        minimum: _dragFactor.minimum(),
        maximum: _dragFactor.maximum()
      }
    }
  }

  /**
   * @returns {number} the number of strokes since the start of the segment
   */
  function numberOfStrokes (baseMetrics) {
    if (!isNaN(_startStrokeNumber) && _startStrokeNumber >= 0 && !isNaN(baseMetrics.totalNumberOfStrokes) && baseMetrics.totalNumberOfStrokes > _startStrokeNumber) {
      return baseMetrics.totalNumberOfStrokes - _startStrokeNumber
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the distance from the start of the workoutsegment
   */
  function distanceFromStart (baseMetrics) {
    if (!isNaN(_startLinearDistance) && _startLinearDistance >= 0 && !isNaN(baseMetrics.totalLinearDistance) && baseMetrics.totalLinearDistance > _startLinearDistance) {
      return baseMetrics.totalLinearDistance - _startLinearDistance
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the target distance for this workoutsegment from the workout plan  (only if type === 'distance')
   */
  function targetDistance () {
    if (_type === 'distance' && _endLinearDistance > 0) {
      return _targetDistance
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the remaining distance to the end of the workoutsegment
   */
  function distanceToEnd (baseMetrics) {
    if (_type === 'distance' && _endLinearDistance > 0) {
      // We have set a distance boundary
      return _endLinearDistance - baseMetrics.totalLinearDistance
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the projected distance at the end of the workoutsegment (if type !== 'distance')
   */
  function projectedEndDistance () {
    switch (true) {
      case (_type === 'distance' && _endLinearDistance > 0):
        return _targetDistance
      case (_type === 'time' && _endMovingTime > 0 && distanceOverTime.reliable()):
        // We are in a time based interval, so we need to project
        return (distanceOverTime.projectX(_endMovingTime) - _startLinearDistance)
      case (_type === 'calories' && _endCalories > 0 && distanceOverTime.reliable() && caloriesOverTime.reliable()):
        return (distanceOverTime.projectX(caloriesOverTime.projectY(_endCalories)) - _startLinearDistance)
      default:
        return undefined
    }
  }

  /**
   * @returns {float} the moving time since the start of the workoutsegment
   */
  function movingTimeSinceStart (baseMetrics) {
    if (!isNaN(_startMovingTime) && _startMovingTime >= 0 && !isNaN(baseMetrics.totalMovingTime) && baseMetrics.totalMovingTime > _startMovingTime) {
      return Math.max(baseMetrics.totalMovingTime - _startMovingTime, 0)
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the target time for this workoutsegment from the workout plan (only if type === 'time')
   */
  function targetTime () {
    if (_type === 'time' && _endMovingTime > 0) {
      // We have a distance boundary
      return _targetTime
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the remaining time to the end of the workoutsegment
   */
  function timeToEnd (baseMetrics) {
    if ((_type === 'time' || _type === 'rest') && _endMovingTime > 0) {
      // We are in a time based interval
      return _endMovingTime - baseMetrics.totalMovingTime
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the projected time to the end of the workoutsegment  (if type !== 'time')
   */
  function projectedEndTime () {
    switch (true) {
      case (_type === 'distance' && _endLinearDistance > 0 && distanceOverTime.reliable()):
        // We are in a distance based interval, so we need to project
        return (distanceOverTime.projectY(_endLinearDistance) - _startMovingTime)
      case (_type === 'time' && _endMovingTime > 0):
        return _targetTime
      case (_type === 'calories' && _endCalories > 0 && caloriesOverTime.reliable()):
        return (caloriesOverTime.projectY(_endCalories) - _startMovingTime)
      default:
        return undefined
    }
  }

  /**
   * @returns {float} the total time since start of the workoutsegment
   */
  function totalTime (baseMetrics) {
    if (!isNaN(_startTimestamp) && _startTimestamp >= 0 && !isNaN(baseMetrics.timestamp) && baseMetrics.timestamp >= _startTimestamp) {
      return Math.max(movingTimeSinceStart(baseMetrics), (baseMetrics.timestamp.getTime() - _startTimestamp.getTime()) / 1000)
    } else {
      return Math.max(movingTimeSinceStart(baseMetrics), 0)
    }
  }

  /**
   * @returns {float} the time spent not moving since start of the workoutsegment
   */
  function restTime (baseMetrics) {
    if (!isNaN(_startMovingTime) && !isNaN(_startTimestamp) && _startTimestamp >= 0 && !isNaN(baseMetrics.totalMovingTime) && !isNaN(baseMetrics.timestamp) && baseMetrics.timestamp > _startTimestamp) {
      return (Math.max(baseMetrics.timestamp.getTime() - _startTimestamp.getTime(), 0) / 1000) - Math.max(baseMetrics.totalMovingTime - _startMovingTime, 0)
    } else {
      return 0
    }
  }

  /**
   * @returns {float} average linear velocity since the start of the workoutsgment
   */
  function averageLinearVelocity (baseMetrics) {
    if (movingTimeSinceStart(baseMetrics) > 0) {
      return Math.max(distanceFromStart(baseMetrics) / movingTimeSinceStart(baseMetrics), 0)
    } else {
      return (_linearVelocity.average() > 0 ? _linearVelocity.average() : 0)
    }
  }

  /**
   * @param {float} linear velocity
   * @returns {float} pace per 500 meters
   */
  function linearVelocityToPace (linearVel) {
    if (!isNaN(linearVel) && linearVel > 0) {
      return (500.0 / linearVel)
    } else {
      return Infinity
    }
  }

  /**
   * @returns {float} the target calories for this workoutsegment from the workout plan (only if type === 'calories')
   */
  function targetCalories () {
    if (_type === 'calories' && _endCalories > 0) {
      return _targetCalories
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the calories spent moving since the start of the workoutsegment (i.e. active calories)
   */
  function spentCalories (baseMetrics) {
    if (!isNaN(_startCalories) && _startCalories >= 0 && !isNaN(baseMetrics.totalCalories) && baseMetrics.totalCalories > _startCalories) {
      return baseMetrics.totalCalories - _startCalories
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the remaining calories to the end of the workoutsegment
   */
  function caloriesToEnd (baseMetrics) {
    if (_type === 'calories' && _endCalories > 0) {
      // We are in a time based interval
      return _endCalories - baseMetrics.totalCalories
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the total calories since the start (active + rest) of the workoutSegment
   */
  function totalCalories (baseMetrics) {
    return spentCalories(baseMetrics) + restCalories(baseMetrics)
  }

  /**
   * @returns {float} the rest calories since the start of the workoutSegment
   * Based on crude Basal Metabolic Rates, see https://my.clevelandclinic.org/health/body/basal-metabolic-rate-bmr
   */
  function restCalories (baseMetrics) {
    if (config.userSettings.sex === 'male') {
      return 0.0196296296296296 * restTime(baseMetrics)
    } else {
      return 0.0163194444444444 * restTime(baseMetrics)
    }
  }

  /**
   * @description This internal function resets the metrics of the segment, this is called after setting a new target
   */
  function resetSegmentMetrics () {
    _linearVelocity.reset()
    _strokerate.reset()
    _strokedistance.reset()
    _caloriesPerHour.reset()
    _power.reset()
    _dragFactor.reset()
    _type = 'justrow'
    _startTimestamp = undefined
    _startMovingTime = 0
    _startLinearDistance = 0
    _startStrokeNumber = 0
    _startWork = 0
    _startCalories = 0
    _targetTime = 0
    _targetDistance = 0
    _endMovingTime = 0
    _endLinearDistance = 0
    _split = {
      type: 'justrow',
      targetDistance: 0,
      targetTime: 0
    }
  }

  /**
   * @description This externally exposed function resets all data from a workoutsegment, including the regressor used for projections
   */
  function reset () {
    resetSegmentMetrics()
    distanceOverTime.reset()
    caloriesOverTime.reset()
  }

  return {
    setStart,
    setStartTimestamp,
    getStartTimestamp,
    summarize,
    setEnd,
    isEndReached,
    interpolateEnd,
    metrics,
    movingTimeSinceStart,
    timeToEnd,
    type,
    push,
    getSplit,
    remainder,
    reset
  }
}

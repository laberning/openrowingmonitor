'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file The Rowing Engine models the physics of a real rowing boat. It takes impulses from the flywheel of a rowing machine
 * and calculates parameters such as work, stroke rates and linear movement.
 *
 * This implementation uses concepts that are described here:
 * - @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/physics_openrowingmonitor.md#relevant-linear-metrics|the description of our underlying physics model}
 * - @see {@link https://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html|Physics of Ergometers by Anu Dudhia}
 * - @see {@link https://dvernooy.github.io/projects/ergware|Dave Vernooy's good explanation of the physics involved}
 */
/* eslint-disable max-lines -- There is a lot of state machine dependent math going on here. Hard to keep short while maintaining readability */
import loglevel from 'loglevel'
import { createFlywheel } from './Flywheel.js'
import { createCurveMetrics } from './utils/curveMetrics.js'

const log = loglevel.getLogger('RowingEngine')

export function createRower (rowerSettings) {
  const flywheel = createFlywheel(rowerSettings)
  const sprocketRadius = rowerSettings.sprocketRadius / 100
  const driveHandleForce = createCurveMetrics()
  const driveHandleVelocity = createCurveMetrics()
  const driveHandlePower = createCurveMetrics()
  let _strokeState = 'WaitingForDrive'
  let _totalNumberOfStrokes = -1.0
  let recoveryPhaseStartTime = 0.0
  let _recoveryDuration
  let drivePhaseStartTime = 0.0
  let _driveDuration
  let drivePhaseStartFlywheelWork = 0.0
  let _driveFlywheelWork = 0.0
  let drivePhaseStartAngularPosition = 0.0
  let drivePhaseAngularDisplacement = 0.0
  let _driveLinearDistance = 0.0
  let recoveryPhaseStartAngularPosition = 0.0
  let recoveryPhaseAngularDisplacement = 0.0
  let _recoveryLinearDistance = 0.0
  const minimumCycleDuration = rowerSettings.minimumDriveTime + rowerSettings.minimumRecoveryTime
  let _cycleDuration
  let _cycleLinearVelocity
  let _cyclePower
  let totalLinearDistance = 0.0
  let preliminaryTotalLinearDistance = 0.0
  let _driveLength = 0.0

  flywheel.maintainStateOnly()

  // called if the sensor detected an impulse, currentDt is an interval in seconds
  function handleRotationImpulse (currentDt) {
    // Provide the flywheel with new data
    flywheel.pushValue(currentDt)

    // This is the core of the finite state machine that defines all state transitions
    switch (true) {
      case (_strokeState === 'Stopped'):
        // We are in a stopped state, so don't do anything
        break
      case (_strokeState === 'WaitingForDrive' && flywheel.isAboveMinimumSpeed() && flywheel.isPowered()):
        // We are above the minimum speed, so we can leave the WaitingForDrive state
        // As we are not certain what caused the "WaitingForDrive", we explicitly start the flywheel maintaining metrics again
        flywheel.maintainStateAndMetrics()
        // We change into the "Drive" phase since were waiting for a drive phase, and we see a clear force exerted on the flywheel
        log.debug(`*** Rowing (re)started with a DRIVE phase at time: ${flywheel.spinningTime().toFixed(4)} sec`)
        _strokeState = 'Drive'
        startDrivePhase()
        break
      case (_strokeState === 'WaitingForDrive' && flywheel.isAboveMinimumSpeed() && flywheel.isUnpowered()):
        // We are above the minimum speed, so we can leave the WaitingForDrive state
        // As we are not certain what caused the "WaitingForDrive", we explicitly start the flywheel maintaining metrics again
        flywheel.maintainStateAndMetrics()
        // We change into the "REcovery" phase, as somehow there is a force exerted on the flywheel consistent with a dragforce
        // We need to update the _totalNumberOfStrokes manually as startDrivePhase() normally does this
        log.debug(`*** Rowing (re)started with a RECOVERY phase at time: ${flywheel.spinningTime().toFixed(4)} sec`)
        _totalNumberOfStrokes++
        _strokeState = 'Recovery'
        startRecoveryPhase()
        break
      case (_strokeState === 'WaitingForDrive'):
        // We can't change into the "Drive" phase since we are waiting for a drive phase, but there isn't a clear force exerted on the flywheel. So, there is nothing more to do
        break
      case (_strokeState === 'Drive' && ((flywheel.spinningTime() - drivePhaseStartTime) >= rowerSettings.minimumDriveTime || _totalNumberOfStrokes < 1) && flywheel.isUnpowered()):
        // We change into the "Recovery" phase since we have been long enough in the Drive phase, and we see a clear lack  of power exerted on the flywheel
        // In the first stroke, we might not exceed the minimumdrivetime in the first stroke, so we shouldn't allow it to limit us.
        log.debug(`*** RECOVERY phase started at time: ${flywheel.spinningTime().toFixed(4)} sec`)
        _strokeState = 'Recovery'
        endDrivePhase()
        startRecoveryPhase()
        break
      case (_strokeState === 'Drive' && flywheel.isUnpowered()):
        // We seem to have lost power to the flywheel, but it is too early according to the settings. We stay in the Drive Phase
        log.debug(`Time: ${flywheel.spinningTime().toFixed(4)} sec: Delta Time trend is upwards, suggests no power, but waiting for drive phase length (${(flywheel.spinningTime() - drivePhaseStartTime).toFixed(4)} sec) to exceed minimumDriveTime (${rowerSettings.minimumDriveTime} sec)`)
        updateDrivePhase()
        break
      case (_strokeState === 'Drive'):
        // We stay in the "Drive" phase as the decceleration is lacking
        updateDrivePhase()
        break
      case (_strokeState === 'Recovery' && ((flywheel.spinningTime() - drivePhaseStartTime) >= rowerSettings.maximumStrokeTimeBeforePause) && flywheel.isDwelling()):
        // The Flywheel is spinning too slowly to create valid CurrentDt's and the last Drive started over maximumStrokeTime ago, we consider it a pause
        log.debug(`*** PAUSED rowing at time: ${flywheel.spinningTime().toFixed(4)} sec, rower hasn't moved in ${(flywheel.spinningTime() - drivePhaseStartTime).toFixed(4)} seconds and flywheel is dwelling`)
        flywheel.maintainStateOnly()
        _strokeState = 'WaitingForDrive'
        endRecoveryPhase()
        break
      case (_strokeState === 'Recovery' && ((flywheel.spinningTime() - recoveryPhaseStartTime) >= rowerSettings.minimumRecoveryTime) && flywheel.isPowered()):
        // We change into the "Drive" phase since we have been long enough in the Recovery phase, and we see a clear force
        // exerted on the flywheel
        log.debug(`*** DRIVE phase started at time: ${flywheel.spinningTime().toFixed(4)} sec`)
        _strokeState = 'Drive'
        endRecoveryPhase()
        startDrivePhase()
        break
      case (_strokeState === 'Recovery' && flywheel.isPowered()):
        // We see a force, but the "Recovery" phase has been too short, we stay in the "Recovery" phase
        log.debug(`Time: ${flywheel.spinningTime().toFixed(4)} sec: Delta Time trend is downwards, suggesting power, but waiting for recovery phase length (${(flywheel.spinningTime() - recoveryPhaseStartTime).toFixed(4)} sec) to exceed minimumRecoveryTime (${rowerSettings.minimumRecoveryTime} sec)`)
        updateRecoveryPhase()
        break
      case (_strokeState === 'Recovery'):
        // No force on the flywheel, let's continue the "Recovery" phase of the stroke
        updateRecoveryPhase()
        break
      default:
        log.error(`Time: ${flywheel.spinningTime().toFixed(4)} sec, state ${_strokeState} found in the Rowing Engine, which is not captured by Finite State Machine`)
    }
  }

  function startDrivePhase () {
    // Next, we start the Drive Phase
    _totalNumberOfStrokes++
    drivePhaseStartTime = flywheel.spinningTime()
    drivePhaseStartAngularPosition = flywheel.angularPosition()
    driveHandleForce.reset()
    const forceOnHandle = flywheel.torque() / sprocketRadius
    driveHandleForce.push(flywheel.deltaTime(), forceOnHandle)
    driveHandleVelocity.reset()
    const velocityOfHandle = flywheel.angularVelocity() * sprocketRadius
    driveHandleVelocity.push(flywheel.deltaTime(), velocityOfHandle)
    driveHandlePower.reset()
    const powerOnHandle = flywheel.torque() * flywheel.angularVelocity()
    driveHandlePower.push(flywheel.deltaTime(), powerOnHandle)
  }

  function updateDrivePhase () {
    // Update the key metrics on each impulse
    drivePhaseAngularDisplacement = flywheel.angularPosition() - drivePhaseStartAngularPosition
    _driveLinearDistance = calculateLinearDistance(drivePhaseAngularDisplacement, (flywheel.spinningTime() - drivePhaseStartTime))
    preliminaryTotalLinearDistance = totalLinearDistance + _driveLinearDistance
    const forceOnHandle = flywheel.torque() / sprocketRadius
    driveHandleForce.push(flywheel.deltaTime(), forceOnHandle)
    const velocityOfHandle = flywheel.angularVelocity() * sprocketRadius
    driveHandleVelocity.push(flywheel.deltaTime(), velocityOfHandle)
    const powerOnHandle = flywheel.torque() * flywheel.angularVelocity()
    driveHandlePower.push(flywheel.deltaTime(), powerOnHandle)
  }

  function endDrivePhase () {
    // Here, we conclude the Drive Phase
    // The FSM guarantees that we have a credible driveDuration and cycletime in normal operation, but NOT at the start
    _driveDuration = flywheel.spinningTime() - drivePhaseStartTime
    _driveFlywheelWork = flywheel.totalWork() - drivePhaseStartFlywheelWork
    drivePhaseStartFlywheelWork = flywheel.totalWork()
    drivePhaseAngularDisplacement = flywheel.angularPosition() - drivePhaseStartAngularPosition
    _driveLength = drivePhaseAngularDisplacement * sprocketRadius
    _driveLinearDistance = calculateLinearDistance(drivePhaseAngularDisplacement, _driveDuration)
    totalLinearDistance += _driveLinearDistance
    preliminaryTotalLinearDistance = totalLinearDistance
    if (_driveDuration >= rowerSettings.minimumDriveTime && _recoveryDuration >= rowerSettings.minimumRecoveryTime) {
      _cycleDuration = _recoveryDuration + _driveDuration
      _cycleLinearVelocity = calculateLinearVelocity(drivePhaseAngularDisplacement + recoveryPhaseAngularDisplacement, _cycleDuration)
      _cyclePower = calculateCyclePower()
    } else {
      _cycleDuration = undefined
      _cycleLinearVelocity = undefined
      _cyclePower = undefined
    }
  }

  function startRecoveryPhase () {
    // Next, we start the Recovery Phase
    recoveryPhaseStartTime = flywheel.spinningTime()
    recoveryPhaseStartAngularPosition = flywheel.angularPosition()
    flywheel.markRecoveryPhaseStart()
  }

  function updateRecoveryPhase () {
    // Update the key metrics on each impulse
    recoveryPhaseAngularDisplacement = flywheel.angularPosition() - recoveryPhaseStartAngularPosition
    _recoveryLinearDistance = calculateLinearDistance(recoveryPhaseAngularDisplacement, (flywheel.spinningTime() - recoveryPhaseStartTime))
    preliminaryTotalLinearDistance = totalLinearDistance + _recoveryLinearDistance
  }

  function endRecoveryPhase () {
    // First, we conclude the recovery phase
    // The FSM guarantees that we have a credible recoveryDuration and cycletime in normal operation, but NOT at the start
    flywheel.markRecoveryPhaseCompleted() // This MUST be executed before the dragfactor is used in any calculation here!
    _recoveryDuration = flywheel.spinningTime() - recoveryPhaseStartTime
    recoveryPhaseAngularDisplacement = flywheel.angularPosition() - recoveryPhaseStartAngularPosition
    _recoveryLinearDistance = calculateLinearDistance(recoveryPhaseAngularDisplacement, _recoveryDuration)
    totalLinearDistance += _recoveryLinearDistance
    preliminaryTotalLinearDistance = totalLinearDistance
    if (_driveDuration >= rowerSettings.minimumDriveTime && _recoveryDuration >= rowerSettings.minimumRecoveryTime) {
      _cycleDuration = _recoveryDuration + _driveDuration
      _cycleLinearVelocity = calculateLinearVelocity(drivePhaseAngularDisplacement + recoveryPhaseAngularDisplacement, _cycleDuration)
      _cyclePower = calculateCyclePower()
    } else {
      _cycleDuration = undefined
      _cycleLinearVelocity = undefined
      _cyclePower = undefined
    }
  }

  function calculateLinearDistance (baseAngularDisplacement, baseTime) {
    if (baseAngularDisplacement >= 0) {
      return Math.pow((flywheel.dragFactor() / rowerSettings.magicConstant), 1.0 / 3.0) * baseAngularDisplacement
    } else {
      log.error(`Time: ${flywheel.spinningTime().toFixed(4)} sec: calculateLinearDistance error: Angular Displacement of ${baseAngularDisplacement} was not credible, baseTime = ${baseTime}`)
      return 0
    }
  }

  function calculateLinearVelocity (baseAngularDisplacement, baseTime) {
    // Here we calculate the AVERAGE speed for the displays, NOT the topspeed of the stroke
    const prevLinearVelocity = _cycleLinearVelocity
    if (baseAngularDisplacement > 0 && baseTime > 0) {
      // let's prevent division's by zero and make sure data is credible
      const baseAngularVelocity = baseAngularDisplacement / baseTime
      return Math.pow((flywheel.dragFactor() / rowerSettings.magicConstant), 1.0 / 3.0) * baseAngularVelocity
    } else {
      log.error(`Time: ${flywheel.spinningTime().toFixed(4)} sec: calculateLinearVelocity error, Angular Displacement = ${baseAngularDisplacement}, baseTime = ${baseTime}`)
      return prevLinearVelocity
    }
  }

  function calculateCyclePower () {
    // Here we calculate the AVERAGE power for the displays, NOT the top power of the stroke
    const prevCyclePower = _cyclePower
    if (_driveDuration >= rowerSettings.minimumDriveTime && _cycleDuration >= minimumCycleDuration) {
      // let's prevent division's by zero and make sure data is credible
      return flywheel.dragFactor() * Math.pow((recoveryPhaseAngularDisplacement + drivePhaseAngularDisplacement) / _cycleDuration, 3.0)
    } else {
      log.error(`Time: ${flywheel.spinningTime().toFixed(4)} sec: calculateCyclePower error: driveDuration = ${_driveDuration.toFixed(4)} sec, _cycleDuration = ${_cycleDuration.toFixed(4)} sec`)
      return prevCyclePower
    }
  }

  function strokeState () {
    return _strokeState
  }

  function totalNumberOfStrokes () {
    return _totalNumberOfStrokes
  }

  function totalMovingTimeSinceStart () {
    return flywheel.spinningTime()
  }

  function totalFlywheelWorkSinceStart () {
    return flywheel.totalWork()
  }

  function driveLastStartTime () {
    return drivePhaseStartTime
  }

  function totalLinearDistanceSinceStart () {
    return Math.max(preliminaryTotalLinearDistance, totalLinearDistance)
  }

  function cycleDuration () {
    if (_driveDuration >= rowerSettings.minimumDriveTime && _recoveryDuration >= rowerSettings.minimumRecoveryTime) {
      return _cycleDuration
    } else {
      return undefined
    }
  }

  function cycleLinearDistance () {
    if (_driveDuration >= rowerSettings.minimumDriveTime && _recoveryDuration >= rowerSettings.minimumRecoveryTime) {
      return _driveLinearDistance + _recoveryLinearDistance
    } else {
      return undefined
    }
  }

  function cycleLinearVelocity () {
    if (_driveDuration >= rowerSettings.minimumDriveTime && _recoveryDuration >= rowerSettings.minimumRecoveryTime) {
      return _cycleLinearVelocity
    } else {
      return undefined
    }
  }

  function cyclePower () {
    if (_driveDuration >= rowerSettings.minimumDriveTime && _recoveryDuration >= rowerSettings.minimumRecoveryTime) {
      return _cyclePower
    } else {
      return undefined
    }
  }
  function driveDuration () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return _driveDuration
    } else {
      return undefined
    }
  }

  function driveLinearDistance () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return _driveLinearDistance
    } else {
      return undefined
    }
  }

  function driveLength () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return _driveLength
    } else {
      return undefined
    }
  }

  function driveFlywheelWork () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return _driveFlywheelWork
    } else {
      return undefined
    }
  }

  function driveAverageHandleForce () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return driveHandleForce.average()
    } else {
      return undefined
    }
  }

  function drivePeakHandleForce () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return driveHandleForce.peak()
    } else {
      return undefined
    }
  }

  function drivePeakHandleForceNormalizedPosition () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return driveHandleForce.peakNormalizedPosition()
    } else {
      return undefined
    }
  }

  function driveHandleForceCurve () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return driveHandleForce.curve()
    } else {
      return undefined
    }
  }

  function driveHandleVelocityCurve () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return driveHandleVelocity.curve()
    } else {
      return undefined
    }
  }

  function driveHandlePowerCurve () {
    if (_driveDuration >= rowerSettings.minimumDriveTime) {
      return driveHandlePower.curve()
    } else {
      return undefined
    }
  }

  function recoveryDuration () {
    if (_recoveryDuration >= rowerSettings.minimumRecoveryTime) {
      return _recoveryDuration
    } else {
      return undefined
    }
  }

  function recoveryDragFactor () {
    if (flywheel.dragFactorIsReliable()) {
      return flywheel.dragFactor() * 1000000
    } else {
      return undefined
    }
  }

  function instantHandlePower () {
    if (_strokeState === 'Drive') {
      return flywheel.torque() * flywheel.angularVelocity()
    } else {
      return 0
    }
  }

  function allowMovement () {
    if (_strokeState === 'Stopped') {
      // We have to check whether there actually was a stop/pause, in order to prevent weird behaviour from the state machine
      log.debug(`*** ALLOW MOVEMENT command by RowingEngine recieved at time: ${flywheel.spinningTime().toFixed(4)} sec`)
      _strokeState = 'WaitingForDrive'
    }
  }

  function pauseMoving () {
    log.debug(`*** PAUSE MOVING command recieved by RowingEngine at time: ${flywheel.spinningTime().toFixed(4)} sec, distance: ${preliminaryTotalLinearDistance.toFixed(2)} meters`)
    flywheel.maintainStateOnly()
    _strokeState = 'WaitingForDrive'
  }

  function stopMoving () {
    log.debug(`*** STOP MOVING command recieved by RowingEngine at time: ${flywheel.spinningTime().toFixed(4)} sec, distance: ${preliminaryTotalLinearDistance.toFixed(2)} meters`)
    flywheel.maintainStateOnly()
    _strokeState = 'Stopped'
  }

  function reset () {
    _strokeState = 'WaitingForDrive'
    flywheel.reset()
    driveHandleForce.reset()
    driveHandleVelocity.reset()
    driveHandlePower.reset()
    _totalNumberOfStrokes = -1.0
    drivePhaseStartTime = 0.0
    drivePhaseStartAngularPosition = 0.0
    _driveDuration = 0.0
    drivePhaseStartFlywheelWork = 0.0
    _driveFlywheelWork = 0.0
    drivePhaseAngularDisplacement = 0.0
    _driveLinearDistance = 0.0
    recoveryPhaseStartTime = 0.0
    _recoveryDuration = 0.0
    recoveryPhaseStartAngularPosition = 0.0
    recoveryPhaseAngularDisplacement = 0.0
    _recoveryLinearDistance = 0.0
    _cycleDuration = 0.0
    _cycleLinearVelocity = 0.0
    totalLinearDistance = 0.0
    preliminaryTotalLinearDistance = 0.0
    _cyclePower = 0.0
    _driveLength = 0.0
  }

  return {
    handleRotationImpulse,
    allowMovement,
    pauseMoving,
    stopMoving,
    strokeState,
    totalNumberOfStrokes,
    driveLastStartTime,
    totalMovingTimeSinceStart,
    totalLinearDistanceSinceStart,
    totalFlywheelWorkSinceStart,
    cycleDuration,
    cycleLinearDistance,
    cycleLinearVelocity,
    cyclePower,
    driveDuration,
    driveLinearDistance,
    driveLength,
    driveFlywheelWork,
    driveAverageHandleForce,
    drivePeakHandleForce,
    drivePeakHandleForceNormalizedPosition,
    driveHandleForceCurve,
    driveHandleVelocityCurve,
    driveHandlePowerCurve,
    recoveryDuration,
    recoveryDragFactor,
    instantHandlePower,
    reset
  }
}

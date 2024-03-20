'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The Rowing Engine models the physics of a real rowing boat.
  It takes impulses from the flywheel of a rowing machine and estimates
  parameters such as energy, stroke rates and movement.

  This implementation uses concepts that are described here:
  Physics of Rowing by Anu Dudhia: http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics
  Also Dave Vernooy has some good explanations here: https://dvernooy.github.io/projects/ergware
*/

import loglevel from 'loglevel'
import { createFlywheel } from './Flywheel.js'
import { createCurveMetrics } from './utils/curveMetrics.js'

const log = loglevel.getLogger('RowingEngine')

function createRower (rowerSettings) {
  const flywheel = createFlywheel(rowerSettings)
  const sprocketRadius = rowerSettings.sprocketRadius / 100
  const driveHandleForce = createCurveMetrics()
  const driveHandleVelocity = createCurveMetrics()
  const driveHandlePower = createCurveMetrics()
  let _strokeState = 'WaitingForDrive'
  let _totalNumberOfStrokes = -1.0
  let recoveryPhaseStartTime = 0.0
  let _recoveryDuration = 0.0
  let drivePhaseStartTime = 0.0
  let _driveDuration = 0.0
  let drivePhaseStartAngularPosition = 0.0
  let drivePhaseAngularDisplacement = 0.0
  let _driveLinearDistance = 0.0
  let recoveryPhaseStartAngularPosition = 0.0
  let recoveryPhaseAngularDisplacement = 0.0
  let _recoveryLinearDistance = 0.0
  const minimumCycleDuration = rowerSettings.minimumDriveTime + rowerSettings.minimumRecoveryTime
  let _cycleDuration = minimumCycleDuration
  let _cycleLinearVelocity = 0.0
  let _cyclePower = 0.0
  let totalLinearDistance = 0.0
  let preliminaryTotalLinearDistance = 0.0
  let _driveLength = 0.0

  // called if the sensor detected an impulse, currentDt is an interval in seconds
  function handleRotationImpulse (currentDt) {
    // Provide the flywheel with new data
    flywheel.pushValue(currentDt)

    // This is the core of the finite state machine that defines all state transitions
    switch (true) {
      case (_strokeState === 'Stopped'):
        // We are in a stopped state, so don't do anything
        break
      case (_strokeState === 'WaitingForDrive' && flywheel.isPowered() && flywheel.isAboveMinimumSpeed()):
        // We change into the "Drive" phase since were waiting for a drive phase, and we see a clear force exerted on the flywheel
        log.debug(`*** Rowing (re)started with a DRIVE phase at time: ${flywheel.spinningTime().toFixed(4)} sec`)
        // As we are not certain what caused the "WaitingForDrive" (a fresh start or a restart after pause),, we explicitly start the flywheel maintaining metrics again
        flywheel.maintainStateAndMetrics()
        _strokeState = 'Drive'
        startDrivePhase()
        break
      case (_strokeState === 'WaitingForDrive'):
        // We can't change into the "Drive" phase since we are waiting for a drive phase, but there isn't a clear force exerted on the flywheel. So, there is nothing more to do
        break
      case (_strokeState === 'Drive' && ((flywheel.spinningTime() - drivePhaseStartTime) >= rowerSettings.minimumDriveTime) && flywheel.isUnpowered()):
        // We change into the "Recovery" phase since we have been long enough in the Drive phase, and we see a clear lack  of power exerted on the flywheel
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
    // The FSM guarantees that we have a credible driveDuration and cycletime
    _driveDuration = flywheel.spinningTime() - drivePhaseStartTime
    _cycleDuration = _recoveryDuration + _driveDuration
    drivePhaseAngularDisplacement = flywheel.angularPosition() - drivePhaseStartAngularPosition
    _driveLength = drivePhaseAngularDisplacement * sprocketRadius
    _driveLinearDistance = calculateLinearDistance(drivePhaseAngularDisplacement, _driveDuration)
    totalLinearDistance += _driveLinearDistance
    _cyclePower = calculateCyclePower()
    _cycleLinearVelocity = calculateLinearVelocity(drivePhaseAngularDisplacement + recoveryPhaseAngularDisplacement, _cycleDuration)
    preliminaryTotalLinearDistance = totalLinearDistance
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
    // The FSM guarantees that we have a credible recoveryDuration and cycletime
    _recoveryDuration = flywheel.spinningTime() - recoveryPhaseStartTime
    _cycleDuration = _recoveryDuration + _driveDuration
    recoveryPhaseAngularDisplacement = flywheel.angularPosition() - recoveryPhaseStartAngularPosition
    _recoveryLinearDistance = calculateLinearDistance(recoveryPhaseAngularDisplacement, _recoveryDuration)
    totalLinearDistance += _recoveryLinearDistance
    preliminaryTotalLinearDistance = totalLinearDistance
    _cycleLinearVelocity = calculateLinearVelocity(drivePhaseAngularDisplacement + recoveryPhaseAngularDisplacement, _cycleDuration)
    _cyclePower = calculateCyclePower()
    flywheel.markRecoveryPhaseCompleted()
  }

  function calculateLinearDistance (baseAngularDisplacement, baseTime) {
    if (baseAngularDisplacement >= 0) {
      return Math.pow((flywheel.dragFactor() / rowerSettings.magicConstant), 1.0 / 3.0) * baseAngularDisplacement
    } else {
      log.error(`Time: ${flywheel.spinningTime().toFixed(4)} sec: calculateLinearDistance error: baseAngularDisplacement was not credible, baseTime: ${baseAngularDisplacement}`)
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

  function driveLastStartTime () {
    return drivePhaseStartTime
  }

  function totalLinearDistanceSinceStart () {
    return Math.max(preliminaryTotalLinearDistance, totalLinearDistance)
  }

  function cycleDuration () {
    // ToDo: return 0 in the situation where the first cycle hasn't completed yet
    return _cycleDuration
  }

  function cycleLinearDistance () {
    // ToDo: return 0 in the situation where the first cycle hasn't completed yet
    return _driveLinearDistance + _recoveryLinearDistance
  }

  function cycleLinearVelocity () {
    // ToDo: return 0 in the situation where the first cycle hasn't completed yet
    return _cycleLinearVelocity
  }

  function cyclePower () {
    // ToDo: return 0 in the situation where the first cycle hasn't completed yet
    return _cyclePower
  }

  function driveDuration () {
    return _driveDuration
  }

  function driveLinearDistance () {
    return _driveLinearDistance
  }

  function driveLength () {
    return _driveLength
  }

  function driveAverageHandleForce () {
    return driveHandleForce.average()
  }

  function drivePeakHandleForce () {
    return driveHandleForce.peak()
  }

  function driveHandleForceCurve () {
    return driveHandleForce.curve()
  }

  function driveHandleVelocityCurve () {
    return driveHandleVelocity.curve()
  }

  function driveHandlePowerCurve () {
    return driveHandlePower.curve()
  }

  function recoveryDuration () {
    return _recoveryDuration
  }

  function recoveryDragFactor () {
    return flywheel.dragFactor() * 1000000
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
    _totalNumberOfStrokes = -1.0
    drivePhaseStartTime = 0.0
    drivePhaseStartAngularPosition = 0.0
    _driveDuration = 0.0
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
    cycleDuration,
    cycleLinearDistance,
    cycleLinearVelocity,
    cyclePower,
    driveDuration,
    driveLinearDistance,
    driveLength,
    driveAverageHandleForce,
    drivePeakHandleForce,
    driveHandleForceCurve,
    driveHandleVelocityCurve,
    driveHandlePowerCurve,
    recoveryDuration,
    recoveryDragFactor,
    instantHandlePower,
    reset
  }
}

export { createRower }

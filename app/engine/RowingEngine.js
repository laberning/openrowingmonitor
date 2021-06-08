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
import { createMovingAverager } from './MovingAverager.js'
import { createMovingFlankDetector } from './MovingFlankDetector.js'

const log = loglevel.getLogger('RowingEngine')

function createRowingEngine (rowerSettings) {
  let workoutHandler
  const flankDetector = createMovingFlankDetector(rowerSettings)
  let cyclePhase = 'Drive'
  let totalTime = 0.0
  let totalNumberOfImpulses = 0.0
  // let strokeNumber = 0.0
  const angularDisplacementPerImpulse = (2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution
  let drivePhaseStartTime = 0.0
  let drivePhaseStartAngularDisplacement = 0.0
  let drivePhaseLength = rowerSettings.minimumDriveTime
  let drivePhaseAngularDisplacement = rowerSettings.numOfImpulsesPerRevolution
  // let driveStartAngularVelocity = ((2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution) / rowerSettings.maximumTimeBetweenImpulses
  // let driveEndAngularVelocity = ((2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution) / rowerSettings.minimumTimeBetweenImpulses
  let driveLinearDistance = 0.0
  // let drivePhaseEnergyProduced = 0.0
  let recoveryPhaseStartTime = 0.0
  let recoveryPhaseStartAngularDisplacement = 0.0
  let recoveryPhaseAngularDisplacement = rowerSettings.numOfImpulsesPerRevolution
  let recoveryPhaseLength = rowerSettings.minimumRecoveryTime
  let recoveryStartAngularVelocity = ((2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution) / rowerSettings.minimumTimeBetweenImpulses
  let recoveryEndAngularVelocity = ((2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution) / rowerSettings.maximumTimeBetweenImpulses
  let recoveryLinearDistance = 0.0
  let dragFactor = rowerSettings.dragFactor
  let currentDragFactor = rowerSettings.dragFactor
  const movingDragAverage = createMovingAverager(5, rowerSettings.dragFactor)
  let cycleLenght = 0.0
  // let linearCycleVelocity = 0.0
  // let totalLinearDistance = 0.0
  let averagedCyclePower = 0.0

  // called if the sensor detected an impulse, currentDt is an interval in seconds
  function handleRotationImpulse (currentDt) {
    // impulses that take longer than 3 seconds are considered a pause
    if (currentDt > rowerSettings.maxCycleTimeBeforePause) {
      workoutHandler.handlePause(currentDt)
      return
    }

    totalTime += currentDt
    totalNumberOfImpulses++

    // STEP 2: detect where we are in the rowing phase (drive or recovery)
    flankDetector.pushValue(currentDt)

    // Here we implement the finite state machine that goes between "Drive" and "Recovery" phases,
    // It will allow a phase-change provinding sufficient time has passed and there is a credible flank
    if (cyclePhase === 'Drive') {
      // We wcurrently are in the "Drive" phase, lets determine what the next phase is
      drivePhaseLength = (totalTime - flankDetector.timeToBeginOfFlank()) - drivePhaseStartTime
      if ((drivePhaseLength > rowerSettings.minimumDriveTime) && flankDetector.isDecelerating()) {
        // We change into the Revocevery phase since we have been long enough in the Drive phase, and we see a clear deceleration
        startRecoveryPhase(currentDt)
        cyclePhase = 'Recovery'
      } else {
        updateDrivePhase(currentDt)
      }
    } else {
      // We wcurrently are in the "Recovery" phase, lets determine what the next phase is
      recoveryPhaseLength = (totalTime - flankDetector.timeToBeginOfFlank()) - recoveryPhaseStartTime
      if ((recoveryPhaseLength > rowerSettings.minimumRecoveryTime) && flankDetector.isAccelerating()) {
        // We change into the Drive phase if we have been  long enough in the Recovery phase, and we see a clear acceleration
        startDrivePhase(currentDt)
        cyclePhase = 'Drive'
      } else {
        updateRecoveryPhase(currentDt)
      }
    }

    // Do some metrics update here??
  }

  function startDrivePhase (currentDt) {
    // First, we conclude the recovery phase
    // Precondition guarantees recoveryPhaseLength < rowerSettings.minimumRecoveryTime
    log.debug('*** recovery phase completed')
    cycleLenght = recoveryPhaseLength + drivePhaseLength
    recoveryPhaseAngularDisplacement = (totalNumberOfImpulses - recoveryPhaseStartAngularDisplacement) * angularDisplacementPerImpulse
    recoveryEndAngularVelocity = angularDisplacementPerImpulse / flankDetector.impulseLengthAtBeginFlank()
    if (recoveryPhaseLength !== 0 && recoveryStartAngularVelocity !== 0 && recoveryEndAngularVelocity !== 0) {
      currentDragFactor = -1 * rowerSettings.flywheelInertia * ((1 / recoveryStartAngularVelocity) - (1 / recoveryEndAngularVelocity)) / recoveryPhaseLength
      if (rowerSettings.autoAdjustDampingConstant) {
        movingDragAverage.pushValue(currentDragFactor)
        dragFactor = movingDragAverage.getMovingAverage()
      }
      log.debug(`Calculated drag factor: ${currentDragFactor}`)
    }
    recoveryLinearDistance = Math.pow((dragFactor / rowerSettings.magicConstant), 1.0 / 3.0) * recoveryPhaseAngularDisplacement
    // totalLinearDistance += recoveryLinearDistance
    // linearCycleVelocity = Math.pow((dragFactor / rowerSettings.magicConstant), 1.0 / 3.0) * ((recoveryPhaseAngularDisplacement + drivePhaseAngularDisplacement) / cycleLenght)
    if (workoutHandler) {
      workoutHandler.handleStrokeStateChanged({
        //    power: averagedCyclePower,
        //    duration: cycleLenght,
        //    durationDrivePhase: drivePhaseLength,
        //    distance: (driveLinearDistance + recoveryLinearDistance),
        strokeState: 'DRIVING'
      })
    }

    // Next, we start the Drive Phase
    log.debug('*** drive phase started')
    // strokeNumber++
    drivePhaseStartTime = totalTime - flankDetector.timeToBeginOfFlank()
    drivePhaseStartAngularDisplacement = totalNumberOfImpulses
    // driveStartAngularVelocity = angularDisplacementPerImpulse / flankDetector.impulseLengthAtBeginFlank()
  }

  function updateDrivePhase (currentDt) {
    // Room for updating temporary distance and power metrics
  }

  function startRecoveryPhase (currentDt) {
    // First, we conclude the Drive Phase
    // Precondition guarantees drivePhaseLength < rowerSettings.minimumDriveTime
    log.debug('*** drive phase completed')
    cycleLenght = recoveryPhaseLength + drivePhaseLength
    drivePhaseAngularDisplacement = (totalNumberOfImpulses - drivePhaseStartAngularDisplacement) * angularDisplacementPerImpulse
    // driveEndAngularVelocity = angularDisplacementPerImpulse / flankDetector.impulseLengthAtBeginFlank()
    driveLinearDistance = Math.pow((dragFactor / rowerSettings.magicConstant), 1.0 / 3.0) * drivePhaseAngularDisplacement
    // totalLinearDistance += driveLinearDistance
    // We display the AVERAGE speed in the display, NOT the topspeed of the stroke
    // linearCycleVelocity = Math.pow((dragFactor / rowerSettings.magicConstant), 1.0 / 3.0) * ((drivePhaseAngularDisplacement + recoveryPhaseAngularDisplacement) / cycleLenght)
    if (drivePhaseLength !== 0) {
      // drivePhaseEnergyProduced = rowerSettings.flywheelInertia * ((driveEndAngularVelocity - driveStartAngularVelocity) / drivePhaseLength) * drivePhaseAngularDisplacement + dragFactor * Math.pow(driveEndAngularVelocity, 2) * drivePhaseAngularDisplacement
      averagedCyclePower = dragFactor * Math.pow((recoveryPhaseAngularDisplacement + drivePhaseAngularDisplacement) / cycleLenght, 3.0)
    }

    if (workoutHandler) {
      workoutHandler.handleStroke({
        power: averagedCyclePower,
        duration: cycleLenght,
        durationDrivePhase: drivePhaseLength,
        distance: (driveLinearDistance + recoveryLinearDistance),
        strokeState: 'RECOVERY'
      })
    }
    // Next, we start the Recovery Phase
    log.debug('*** recovery phase started')
    recoveryPhaseStartTime = totalTime - flankDetector.timeToBeginOfFlank()
    recoveryPhaseStartAngularDisplacement = totalNumberOfImpulses
    recoveryStartAngularVelocity = angularDisplacementPerImpulse / flankDetector.impulseLengthAtBeginFlank()
  }

  function updateRecoveryPhase (currentDt) {
    // Room for updating temporary distance and power metrics
  }

  function notify (receiver) {
    workoutHandler = receiver
  }

  return {
    handleRotationImpulse,
    notify
  }
}

export { createRowingEngine }

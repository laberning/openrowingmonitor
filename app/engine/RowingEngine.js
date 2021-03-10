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
import log from 'loglevel'
import { createAverager } from './Averager.js'
import { createTimer } from './Timer.js'

// *****************************************************
//  These constants are specific to your Rowing Machine
// *****************************************************

// How many impulses are triggered per revolution of the flywheel
// i.e. the number of magnets if used with a reed sensor
const numOfImpulsesPerRevolution = 2

// Needed to determine the damping constant of the rowing machine. This value can be measured in the recovery phase
// of the stroke (some ergometers do this constantly).
// However I still keep it constant here, as I still have to figure out the damping physics of a water rower (see below)
// To measure it for your rowing machine, comment in the logging at the end of "startDrivePhase" function. Then do some
// strokes on the rower and estimate a value.
const omegaDotDivOmegaSquare = 0.056

// The moment of inertia of the flywheel kg*m^2
// A way to measure it is outlined here: https://dvernooy.github.io/projects/ergware/, "Flywheel moment of inertia"
// You could also roughly estimate it by just doing some strokes and the comparing the calculated power values for
// plausibility. Note that the power also depends on omegaDotDivOmegaSquare (see above).
const jMoment = 0.55

// Set this to true if you are using a water rower
// The mass of the water starts rotating, when you pull the handle, and therefore acts
// like a massive flywheel
// Liquids are a tricky thing and therefore the dumping constant does not seem to be
// that constant on water rowers...
// This is WIP, but for now this setting is used to figure out the drive and recovery phases
// differently on water rowers
const liquidFlywheel = true

// A constant that is commonly used to convert flywheel revolutions to a rowed distance
// see here: http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html#section9
const c = 2.8

// jMoment * ωdot = -kDamp * ω^2 during non-power part of stroke
const kDamp = jMoment * omegaDotDivOmegaSquare

// s = (k/c)^(1/3)*θ
const distancePerRevolution = 2.0 * Math.PI * Math.pow((kDamp / c), 1.0 / 3.0)

function createRowingEngine () {
  let workoutHandler

  const kDampEstimatorAverager = createAverager(3)

  let kPower = 0.0
  let jPower = 0.0
  let kDampEstimator = 0.0
  let strokeElapsed = 0.0
  let driveElapsed = 0.0
  let strokeDistance = 0.0
  const omegaVector = new Array(2)
  const omegaDotVector = new Array(2)
  let omegaDotDot = 0.0

  const timer = createTimer()

  omegaVector.fill(0.0)
  omegaDotVector.fill(0.0)
  let isInDrivePhase = true
  let wasInDrivePhase = false

  // a rowing session always starts with a drive phase
  timer.start('drive')
  timer.start('stroke')

  // called if the sensor detected an impulse, currentDt is an interval in seconds
  function handleRotationImpulse (currentDt) {
    // impulses that take longer than 3 seconds are considered a pause
    if (currentDt > 3.0) {
      workoutHandler.handlePause(currentDt)
      return
    }

    // each revolution of the flywheel adds distance of distancePerRevolution
    strokeDistance += distancePerRevolution / numOfImpulsesPerRevolution

    omegaVector[1] = omegaVector[0]

    // angular speed ω = 2π𝑛, revolutions per minute 𝑛 = 1/𝑑t, 𝑑t is the time for one revolution of flywheel
    // => ω = 2π/measured time for last impulse * impulses per revolution
    omegaVector[0] = (2.0 * Math.PI) / (currentDt * numOfImpulsesPerRevolution)
    // angular velocity ωdot = 𝑑ω/𝑑t
    omegaDotVector[1] = omegaDotVector[0]
    omegaDotVector[0] = (omegaVector[0] - omegaVector[1]) / (currentDt)
    // we use the derivative of the velocity (ωdotdot) to classify the different phases of the stroke
    omegaDotDot = (omegaDotVector[0] - omegaDotVector[1]) / (currentDt)

    // a stroke consists of a drive phase (when you pull the handle) and a recovery phase (when the handle returns)
    // calculate screeners to find drive portion of stroke - see spreadsheet if you want to understand this
    // if ((omegaDotDot > -40.0) && (omegaDotDot < 40.0)) {

    // the acceleration is constant if ωdotdot is 0, we expand the range, since measurements are imperfect
    const accelerationIsChanging = !((omegaDotDot > -20.0) && (omegaDotDot < 20.0))

    // the acceleration is positive if ωdot > 0, we expand the range, since measurements are imperfect
    // used to be 15
    const accelerationIsPositive = omegaDotVector[0] > 0

    wasInDrivePhase = isInDrivePhase

    if (liquidFlywheel) {
      // Identification of drive and recovery phase on water rowers is still Work in Progress
      // ω does not seem to decay that linear on water rower in recovery phase, so this would not be
      // a good indicator here.
      // Currently we just differentiate by checking if we are accelerating. This gives a stable indicator
      // but probably we are missing the final part of the drive phase by doing so.
      // This would mean, that the stroke ratio and the estimation of kDamp is a bit off.
      // todo: do some measurements and find a better stable indicator for water rowers
      isInDrivePhase = accelerationIsPositive
    } else {
      // ω decays linear on rowers with a solid flywheel, so we can use that to differentiate the phases
      isInDrivePhase = accelerationIsChanging || (accelerationIsPositive && wasInDrivePhase)
    }

    // handle the current impulse, depending on where we are in the stroke
    if (isInDrivePhase && !wasInDrivePhase) { startDrivePhase(currentDt) }
    if (!isInDrivePhase && wasInDrivePhase) { startRecoveryPhase() }
    if (isInDrivePhase && wasInDrivePhase) { updateDrivePhase(currentDt) }
    if (!isInDrivePhase && !wasInDrivePhase) { updateRecoveryPhase(currentDt) }

    timer.updateTimers(currentDt)
    log.debug(`𝑑t: ${currentDt} ω: ${omegaVector[0].toFixed(2)} ωdot: ${omegaDotVector[0].toFixed(2)} ωdotdot: ${omegaDotDot.toFixed(2)} aPos: ${accelerationIsPositive} aChange: ${accelerationIsChanging}`)
  }

  function startDrivePhase (currentDt) {
    log.debug('*** drive phase started')
    timer.start('drive')
    jPower = 0.0
    kPower = 0.0
    if (strokeElapsed - driveElapsed !== 0) {
      kDampEstimatorAverager.pushValue(kDampEstimator / (strokeElapsed - driveElapsed))
    }
    log.debug(`estimated kDamp: ${jMoment * (-1 * kDampEstimatorAverager.weightedAverage())}`)
    log.debug(`estimated omegaDotDivOmegaSquare: ${-1 * kDampEstimatorAverager.weightedAverage()}`)
  }

  function updateDrivePhase (currentDt) {
    jPower = jPower + jMoment * omegaVector[0] * omegaDotVector[0] * currentDt
    kPower = kPower + kDamp * (omegaVector[0] * omegaVector[0] * omegaVector[0]) * currentDt
    log.debug(`Jpower: ${jPower}, kPower: ${kPower}`)
  }

  function startRecoveryPhase () {
    driveElapsed = timer.getValue('drive')
    timer.stop('drive')
    strokeElapsed = timer.getValue('stroke')
    timer.stop('stroke')
    log.debug(`driveElapsed: ${driveElapsed}, strokeElapsed: ${strokeElapsed}`)
    timer.start('stroke')

    if (strokeElapsed !== 0 && workoutHandler) {
      workoutHandler.handleStroke({
        power: (jPower + kPower) / strokeElapsed,
        duration: strokeElapsed,
        durationDrivePhase: driveElapsed,
        distance: strokeDistance
      })
    }

    // stroke finished, reset stroke specific measurements
    kDampEstimator = 0.0
    strokeDistance = 0
    log.debug('*** recovery phase started')
  }

  function updateRecoveryPhase (currentDt) {
    kDampEstimator = kDampEstimator + (omegaDotVector[0] / (omegaVector[0] * omegaVector[0])) * currentDt
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

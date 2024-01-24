'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This file contains the rower specific settings for different models of ergometers.

  These have been generated by the community. If your rower is not listed here, please follow
  https://github.com/laberning/openrowingmonitor/blob/main/docs/rower_settings.md to find the right settings
  After you found good settings for your rowing device please send them to us (together with a raw recording
  of at least 10 strokes) so we can add the device here and start to maintain it.
*/
export default {

  // The default rower profile
  DEFAULT: {
    // How many impulses are triggered per revolution of the flywheel
    // i.e. the number of magnets if used with a reed sensor
    numOfImpulsesPerRevolution: 1,

    // How big the sprocket is that attaches your belt/chain to your flywheel. This determines both the force on the handle
    // as well as the drive length. If all goes well, you end up with average forces around 400 to 800 N and drive lengths around 1.20 to 1.35 m
    sprocketRadius: 7.0,

    // NOISE FILTER SETTINGS
    // Filter Settings to reduce noise in the measured data
    // Minimum and maximum duration between impulses in seconds during active rowing. Measurements above the maximum are filtered, so setting these liberaly
    // might help here
    minimumTimeBetweenImpulses: 0.014,
    maximumTimeBetweenImpulses: 0.5,

    // Smoothing determines the length of the running average for filtering the currentDt, 1 effectively turns it off
    smoothing: 1,

    // STROKE DETECTION SETTINGS
    // Flank length determines the minimum number of consecutive increasing/decreasing measuments that are needed before the stroke detection
    // considers a drive phase change
    flankLength: 3,

    // This is the minimum force that has to be on the handle before ORM considers it a stroke, in Newtons. So this is about 2 Kg or 4.4 Lbs.
    minumumForceBeforeStroke: 20,

    // The minimal inclination of the currentDt's before it is considered a recovery. When set to 0, it will look for a pure increase/decrease
    minumumRecoverySlope: 0,

    // The minimum quality level of the stroke detection: 1.0 is perfect, 0.1 pretty bad. Normally around 0.33. Setting this too high will stop
    // the recovery phase from being detected through the slope angle (i.e. it will completely rely on the absence of the minumumForceBeforeStroke).
    minimumStrokeQuality: 0.34,

    // ORM can automatically calculate the recovery slope and adjust it dynamically. For this to work, autoAdjustDragFactor MUST be set to true
    autoAdjustRecoverySlope: false,

    // The margin used between the automatically calculated recovery slope and a next recovery. Don't touch unless you know what you are doing.
    autoAdjustRecoverySlopeMargin: 0.05,

    // Error reducing settings for the rowing phase detection (in seconds)
    minimumDriveTime: 0.300, // minimum time of the drive phase
    minimumRecoveryTime: 0.900, // minimum time of the recovery phase

    // Needed to determine the drag factor of the rowing machine. This value can be measured in the recovery phase
    // of the stroke.
    // To display it for your rowing machine, set the logging level of the RowingEngine to 'info'. Then start rowing and
    // you will see the measured values in the log.
    // Just as a frame of reference: the Concept2 can display this factor from the menu, where it is multiplied with 1.000.000
    // For a new Concept2 the Drag Factor ranges between 80 (Damper setting 1) and 220 (Damper setting 10). Other rowers are
    // in the range of 150 to 450 (NordicTrack).
    // Open Rowing Monitor can also automatically adjust this value based on the measured damping. To do so, set the setting
    // autoAdjustDragFactor to true (see below).
    dragFactor: 1500,

    // Set this to true, if you want to automatically update the drag factor based on the measured
    // values in the stroke recovery phase. If your rower produces stable damping values, then this could be a good
    // option to dynamically adjust your measurements to the damper setting of your rower.
    // When your machine's power and speed readings are too volatile it is wise to turn it off
    autoAdjustDragFactor: false,

    // If autoAdjustDragFactor is set to true, it will calculate the drag each recovery phase and update it accordingly to calculate speed,
    // distance, etc.. As this calculation that is prone to noise in the measuremnts, it is wise to apply smoothing to prevent this noise
    // from throwing off your key metrics. The default value is a running average of the drag factor of 5 strokes
    dragFactorSmoothing: 5,

    // When drag is calculated, we also get a quality indication. Based on this quality indication (1.0 is best, 0.1 pretty bad), low quality
    // drag factors are rejected to prevent drag poisoning
    minimumDragQuality: 0.83,

    // The moment of inertia of the flywheel kg*m^2
    // A way to measure it is outlined here: https://dvernooy.github.io/projects/ergware/, "Flywheel moment of inertia"
    // You could also roughly estimate it by just doing some strokes and the comparing the calculated power values for
    // plausibility. Note that the power also depends on the drag factor (see above).
    flywheelInertia: 0.5,

    // The time before a stroke is considered paused
    maximumStrokeTimeBeforePause: 6.0,

    // A constant that is commonly used to convert flywheel revolutions to a rowed distance
    // see here: http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html#section9
    // Concept2 seems to use 2.8, which they admit is an arbitrary number which came close
    // to their expectations. So for your rower, you have to find a plausible distance for your effort.
    // Also note that the rowed distance also depends on flywheelInertia, so please calibrate that before changing this constant.
    // PLEASE NOTE: Increasing this number decreases your rowed meters
    magicConstant: 2.8
  },

  // Cheap Clone of Concept2 RowErg Model D
  // https://zocobodyfit.ro/produs/aparat-de-vaslit-zoco-body-fit-air-rower-pliabil-ecran-lcd-eficient-si-util-negru/
  Generic_Air_Rower: {
    numOfImpulsesPerRevolution: 1,
    sprocketRadius: 1.55,
    minimumTimeBetweenImpulses: 0.007,
    smoothing: 1,
    flankLength: 6,
    minumumForceBeforeStroke: 2,
    minimumStrokeQuality: 0.6,
    minimumDriveTime: 0.200, // minimum time of the drive phase
    minimumRecoveryTime: 0.600, // minimum time of the recovery phase
    dragFactor: 108,
    autoAdjustDragFactor: true,
    dragFactorSmoothing: 1,
    minimumDragQuality: 0.97,
    flywheelInertia: 0.073,
    maximumStrokeTimeBeforePause: 6.0
  },

  // Concept2 RowErg, Model D, E and RowErg
  Concept2_RowErg: {
    numOfImpulsesPerRevolution: 6,
    sprocketRadius: 1.4,
    maximumStrokeTimeBeforePause: 6.0,
    dragFactor: 110,
    autoAdjustDragFactor: true,
    minimumDragQuality: 0.95,
    dragFactorSmoothing: 3,
    minimumTimeBetweenImpulses: 0.005,
    maximumTimeBetweenImpulses: 0.0145,
    flankLength: 12,
    smoothing: 1,
    minimumStrokeQuality: 0.36,
    minumumForceBeforeStroke: 11,
    minumumRecoverySlope: 0.00070,
    autoAdjustRecoverySlope: true,
    autoAdjustRecoverySlopeMargin: 0.01,
    minimumDriveTime: 0.40,
    minimumRecoveryTime: 0.90,
    flywheelInertia: 0.10148,
    magicConstant: 2.8
  },

  // DKN R-320 Air Rower
  DKN_R320: {
    numOfImpulsesPerRevolution: 1,
    flywheelInertia: 0.94,
    dragFactor: 8522
  },

  // Force USA R3 Air Rower
  ForceUSA_R3: {
    numOfImpulsesPerRevolution: 6,
    minimumTimeBetweenImpulses: 0.005,
    maximumTimeBetweenImpulses: 0.022,
    flywheelInertia: 0.1015,
    flankLength: 10,
    dragFactor: 135,
    autoAdjustDragFactor: true,
    // new engine settings
    sprocketRadius: 1.5,
    minimumStrokeQuality: 0.50,
    minumumRecoverySlope: 0.00070,
    autoAdjustRecoverySlope: true,
    autoAdjustRecoverySlopeMargin: 0.035,
    minumumForceBeforeStroke: 20,
    minimumDriveTime: 0.46,
    minimumRecoveryTime: 0.80,
    minimumDragQuality: 0.83,
    dragFactorSmoothing: 3,
    maximumStrokeTimeBeforePause: 4
  },

  // NordicTrack RX800 Air Rower
  NordicTrack_RX800: {
    numOfImpulsesPerRevolution: 4,
    minimumTimeBetweenImpulses: 0.005,
    maximumTimeBetweenImpulses: 0.022,
    sprocketRadius: 3.0,
    autoAdjustDragFactor: true,
    minimumDragQuality: 0.83,
    dragFactorSmoothing: 3,
    flywheelInertia: 0.180,
    dragFactor: 225,
    flankLength: 11,
    minimumStrokeQuality: 0.34,
    minumumRecoverySlope: 0.001,
    autoAdjustRecoverySlope: true,
    autoAdjustRecoverySlopeMargin: 0.036,
    minumumForceBeforeStroke: 80,
    minimumDriveTime: 0.30,
    minimumRecoveryTime: 0.90
  },

  // Sportstech WRX700
  Sportstech_WRX700: {
    numOfImpulsesPerRevolution: 2,
    minimumTimeBetweenImpulses: 0.005,
    maximumTimeBetweenImpulses: 0.5,
    minumumRecoverySlope: 0,
    flywheelInertia: 0.72,
    dragFactor: 32000
  }
}

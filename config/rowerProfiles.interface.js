/**
 * @typedef {Object} RowerProfile
 * @property {number} numOfImpulsesPerRevolution - Number of impulses triggered per revolution of the flywheel.
 * @property {number} sprocketRadius - Radius of the sprocket that attaches the belt/chain to the flywheel.
 * @property {number} minimumTimeBetweenImpulses - Minimum duration between impulses in seconds during active rowing.
 * @property {number} maximumTimeBetweenImpulses - Maximum duration between impulses in seconds during active rowing.
 * @property {number} smoothing - Length of the running average for filtering the currentDt.
 * @property {number} flankLength - Number of measurements used for determining the angular velocity and angular acceleration.
 * @property {number} minimumForceBeforeStroke - Minimum force on the handle before it is considered a stroke, in Newtons.
 * @property {number} minimumRecoverySlope - Minimum inclination of the currentDt's before it is considered a recovery.
 * @property {number} minimumStrokeQuality - Minimum quality level of the stroke detection.
 * @property {boolean} autoAdjustRecoverySlope - Indicates if the recovery slope should be adjusted dynamically.
 * @property {number} autoAdjustRecoverySlopeMargin - Margin used between the automatically calculated recovery slope and a next recovery.
 * @property {number} minimumDriveTime - Minimum time of the drive phase in seconds.
 * @property {number} minimumRecoveryTime - Minimum time of the recovery phase in seconds.
 * @property {number} dragFactor - Drag factor of the rowing machine.
 * @property {boolean} autoAdjustDragFactor - Indicates if the drag factor should be adjusted dynamically.
 * @property {number} dragFactorSmoothing - Running average of the drag factor over a number of strokes.
 * @property {number} minimumDragQuality - Minimum quality indication for the drag factor calculation.
 * @property {number} flywheelInertia - Moment of inertia of the flywheel in kg*m^2.
 * @property {number} maximumStrokeTimeBeforePause - Time before a stroke is considered paused in seconds.
 * @property {number} magicConstant - Constant used to convert flywheel revolutions to rowed distance.
 */
/**
 * The default rower profiles for different models of ergometers.
 * @type {{
 * DEFAULT: RowerProfile,
 * Generic_Air_Rower: RowerProfile,
 * Concept2_Model_C: RowerProfile,
 * Concept2_RowErg: RowerProfile,
 * DKN_R320: RowerProfile,
 * ForceUSA_R3: RowerProfile,
 * NordicTrack_RX800: RowerProfile,
 * Sportstech_WRX700: RowerProfile,
 * KayakFirst_Blue: RowerProfile,
 * virtufit: RowerProfile,
 * Merach_R50: RowerProfile
 * }}
 */

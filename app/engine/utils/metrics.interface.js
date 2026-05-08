/**
 * @typedef {{isMoving: boolean,
 * isDriveStart: boolean,
 * isRecoveryStart: boolean,
 * isSessionStart: boolean,
 * isIntervalStart: boolean,
 * isSplitEnd: boolean,
 * isPauseStart: boolean,
 * isPauseEnd: boolean,
 * isSessionStop: boolean
 * }} MetricsContext
 */
/**
 * @typedef {'justrow'|
 * 'time'|
 * 'distance'|
 * 'calories'|
 * 'rest'
 * } SessionType
 */
/**
 * @typedef {'WaitingForStart'|
 * 'Rowing'|
 * 'Paused'|
 * 'Stopped'
 * } SessionState
 */
/**
 * @typedef {'WaitingForDrive'|
 * 'Drive'|
 * 'Recovery'|
 * 'Stopped'
 * } StrokeState
 */
/**
 * @typedef {{
 * metricsContext: MetricsContext,
 * sessionStatus: SessionState,
 * strokeState: StrokeState,
 * timestamp: number,
 * cyclePower: number,
 * totalLinearDistance: number,
 * totalMovingTime: number,
 * totalNumberOfStrokes: number,
 * driveLastStartTime: number,
 * driveLength: number,
 * driveDuration: number,
 * driveHandleForceCurve: Array<number>,
 * driveHandleVelocityCurve: Array<number>,
 * driveHandlePowerCurve: Array<number>,
 * drivePeakHandleForce: number,
 * driveAverageHandleForce: number,
 * cycleStrokeRate: number,
 * cyclePace: number,
 * cycleLinearVelocity: number,
 * cycleDistance: number,
 * cycleDuration: number,
 * cycleProjectedEndTime: number,
 * cycleProjectedEndLinearDistance: number
 * recoveryDuration: number,
 * strokeCalories: number,
 * totalCalories: number,
 * totalCaloriesPerHour: number,
 * totalCaloriesPerMinute: number,
 * strokeWork: number,
 * dragFactor: number,
 * heartrate?: number,
 * heartRateBatteryLevel?: number
 * splitNumber: number
 * }} Metrics
 */
/**
 * @typedef {{
 * totalMovingTime: number,
 * totalLinearDistance: number
 *  }} SplitTimeDistanceData
 */

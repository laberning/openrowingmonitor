'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * @file Defines the initial global state of the webclient, before the webserver pushes actual data
 */
export const APP_STATE = {
  // contains all the rowing metrics that are delivered from the backend
  metrics: {
    strokeState: 'WaitingForDrive',
    sessionState: 'WaitingForStart',
    totalMovingTime: 0,
    pauseCountdownTime: 0,
    totalNumberOfStrokes: 0,
    totalLinearDistance: 0,
    cyclePace: Infinity,
    cyclePower: 0,
    cycleStrokeRate: 0,
    driveLength: 0,
    driveDuration: 0,
    driveHandleForceCurve: [],
    drivePeakHandleForce: 0,
    driveDistance: 0,
    recoveryDuration: 0,
    dragFactor: undefined,
    interval: {
      type: 'justrow',
      movingTime: {
        sinceStart: 0,
        toEnd: 0
      },
      distance: {
        fromStart: 0,
        toEnd: 0
      }
    }
  },
  config: {
    // currently can be FTMS, FTMSBIKE, PM5, CSC, CPS, OFF
    blePeripheralMode: '',
    // currently can be ANT, BLE, OFF
    hrmPeripheralMode: '',
    // currently can be FE, OFF
    antPeripheralMode: '',
    // true if manual upload to strava, intervals or rowsandall is enabled
    uploadEnabled: false,
    // true if remote device shutdown is enabled
    shutdownEnabled: false,
    guiConfigs: {
      dashboardMetrics: ['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk', 'calories'],
      showIcons: true,
      maxNumberOfTiles: 8,
      trueBlackTheme: false,
      forceCurveDivisionMode: 0
    }
  }
}

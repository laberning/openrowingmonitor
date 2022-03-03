/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Defines the global state of the app
*/

export interface Metrics {
  sessionState: string
  durationTotal: number
  durationTotalFormatted: string
  strokesTotal: number
  distanceTotal: number
  caloriesTotal: number
  caloriesPerMinute: number
  caloriesPerHour: number
  strokeTime: number
  distance: number
  power: number
  powerRaw: number
  split: number
  splitFormatted: string
  powerRatio: number
  instantaneousTorque: number
  strokesPerMinute: number
  speed: number
  strokeState: string
  heartrate: number
  heartrateBatteryLevel: number
}

export interface AppState {
  // currently can be STANDALONE (Mobile Home Screen App), KIOSK (Raspberry Pi deployment) or '' (default)
  appMode: string
  // currently can be DASHBOARD or 'ROWINGGAMES'
  activeRoute: string
  // contains all the rowing metrics that are delivered from the backend
  metrics: Metrics,
  config: {
    // currently can be FTMS, FTMSBIKE or PM5
    peripheralMode: string
    // true if upload to strava is enabled
    stravaUploadEnabled: boolean
    // true if remote device shutdown is enabled
    shutdownEnabled: boolean
  }
}

export const APP_STATE: AppState = {
  // currently can be STANDALONE (Mobile Home Screen App), KIOSK (Raspberry Pi deployment) or '' (default)
  appMode: '',
  // currently can be DASHBOARD or 'ROWINGGAMES'
  activeRoute: 'DASHBOARD',
  // contains all the rowing metrics that are delivered from the backend
  metrics: {
    sessionState: 'waitingForStart',
    durationTotal: 0,
    durationTotalFormatted: '--',
    strokesTotal: 0,
    distanceTotal: 0,
    caloriesTotal: 0,
    caloriesPerMinute: 0,
    caloriesPerHour: 0,
    strokeTime: 0,
    distance: 0,
    power: 0,
    powerRaw: 0,
    split: Infinity,
    splitFormatted: '--',
    powerRatio: 0,
    instantaneousTorque: 0,
    strokesPerMinute: 0,
    speed: 0,
    strokeState: 'RECOVERY',
    heartrate: 0,
    heartrateBatteryLevel: 0,
  },
  config: {
    // currently can be FTMS, FTMSBIKE or PM5
    peripheralMode: '',
    // true if upload to strava is enabled
    stravaUploadEnabled: false,
    // true if remote device shutdown is enabled
    shutdownEnabled: false
  }
}

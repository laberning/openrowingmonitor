'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 */

import { html } from 'lit'
import { formatDistance, formatNumber, secondsToTimeString } from '../lib/helper'
import { iconBolt, iconClock, iconAlarmclock, iconFire, iconHeartbeat, iconPaddle, iconRoute, iconStopwatch, rowerIcon } from '../lib/icons'
import '../components/DashboardForceCurve.js'
import '../components/DashboardMetric.js'
import '../components/BatteryIcon.js'

export const DASHBOARD_METRICS = {
  distance: {
    displayName: 'Distance',
    size: 1,
    template: (metrics, config, onWorkoutOpen) => {
      let distance
      switch (true) {
        case (metrics?.interval?.type === 'rest' && metrics?.pauseCountdownTime > 0):
          distance = 0
          break
        case (metrics?.interval?.type === 'distance'):
          distance = Math.max(metrics?.interval?.distance?.toEnd, 0)
          break
        default:
          distance = Math.max(metrics?.interval?.distance?.fromStart, 0)
      }
      const linearDistance = formatDistance(distance ?? 0)

      return html`<dashboard-metric
        style="cursor:pointer"
        @click=${() => onWorkoutOpen?.('distance')}
        .icon=${config?.guiConfigs?.showIcons ? iconRoute : ''}
        .unit=${linearDistance.unit}
        .value=${linearDistance.distance}
      ></dashboard-metric>`
    }
  },

  pace: { displayName: 'Pace/500', size: 1, template: (metrics, config) => simpleMetricFactory(secondsToTimeString(metrics?.cyclePace), '/500m', config?.guiConfigs?.showIcons ? iconStopwatch : '') },

  power: { displayName: 'Power', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cyclePower), 'watt', config?.guiConfigs?.showIcons ? iconBolt : '') },

  stkRate: { displayName: 'Stroke rate', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cycleStrokeRate), '/min', config?.guiConfigs?.showIcons ? iconPaddle : '') },
  heartRate: {
    displayName: 'Heart rate',
    size: 1,
    template: (metrics, config) => html`<dashboard-metric .icon=${config?.guiConfigs?.showIcons ? iconHeartbeat : ''} unit="bpm" .value=${formatNumber(metrics?.heartrate)}>
      ${metrics?.heartRateBatteryLevel > 0 ?
        html`<battery-icon .batteryLevel=${metrics?.heartRateBatteryLevel}></battery-icon>` :
        ''}
    </dashboard-metric>`
  },

  totalStk: { displayName: 'Total strokes', size: 1, template: (metrics, config) => simpleMetricFactory(metrics?.interval?.numberOfStrokes, 'stk', config?.guiConfigs?.showIcons ? iconPaddle : '') },

  calories: {
    displayName: 'Calories',
    size: 1,
    template: (metrics, config, onWorkoutOpen) => {
      const calories = metrics?.interval?.type === 'calories' ? Math.max(metrics?.interval?.calories?.toEnd, 0) : Math.max(metrics?.interval?.calories?.sinceStart, 0)

      return html`<dashboard-metric
        style="cursor:pointer"
        @click=${() => onWorkoutOpen?.('calories')}
        .icon=${config?.guiConfigs?.showIcons ? iconFire : ''}
        .unit=${'kcal'}
        .value=${formatNumber(calories ?? 0)}
      ></dashboard-metric>`
    }
  },

  timer: {
    displayName: 'Timer',
    size: 1,
    template: (metrics, config, onWorkoutOpen) => {
      let time
      let icon
      switch (true) {
        case (metrics?.interval?.type === 'rest' && metrics?.pauseCountdownTime > 0):
          time = metrics?.pauseCountdownTime
          icon = iconAlarmclock
          break
        case (metrics?.interval?.type === 'time'):
          time = Math.max(metrics?.interval?.movingTime?.toEnd, 0)
          icon = iconClock
          break
        default:
          time = Math.max(metrics?.interval?.movingTime?.sinceStart, 0)
          icon = iconClock
      }

      return html`<dashboard-metric
        style="cursor:pointer"
        @click=${() => onWorkoutOpen?.('time')}
        .icon=${config?.guiConfigs?.showIcons ? icon : ''}
        .unit=${''}
        .value=${secondsToTimeString(time ?? 0)}
      ></dashboard-metric>`
    }
  },

  distancePerStk: { displayName: 'Dist per Stroke', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cycleDistance, 1), 'm', config?.guiConfigs?.showIcons ? rowerIcon : '') },

  dragFactor: { displayName: 'Drag factor', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.dragFactor), '', config?.guiConfigs?.showIcons ? 'Drag' : '') },

  driveLength: { displayName: 'Drive length', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.driveLength, 2), 'm', config?.guiConfigs?.showIcons ? 'Drive' : '') },

  driveDuration: { displayName: 'Drive duration', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.driveDuration, 2), 'sec', config?.guiConfigs?.showIcons ? 'Drive' : '') },

  recoveryDuration: { displayName: 'Recovery duration', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.recoveryDuration, 2), 'sec', config?.guiConfigs?.showIcons ? 'Recovery' : '') },

  forceCurve: { displayName: 'Force curve', size: 2, template: (metrics, config) => html`
    <dashboard-force-curve 
      .updateForceCurve=${metrics.metricsContext?.isRecoveryStart} 
      .value=${metrics?.driveHandleForceCurve} 
      .divisionMode=${config?.guiConfigs?.forceCurveDivisionMode ?? 0} 
      style="grid-column: span 2"
    ></dashboard-force-curve>
  ` },

  peakForce: { displayName: 'Peak Force', size: 1, template: (metrics) => simpleMetricFactory(formatNumber(metrics?.drivePeakHandleForce), 'N', 'Peak Force') },

  strokeRatio: {
    displayName: 'Stroke Ratio',
    size: 1,
    template: (metrics) => {
      // Check to make sure both values are truthy
      // no 0, null, or undefined
      const validRatio = metrics?.driveDuration && metrics?.recoveryDuration
      let ratio

      if (validRatio) {
        ratio = `1:${(metrics.recoveryDuration / metrics.driveDuration).toFixed(1)}`
      } else {
        ratio = undefined
      }

      return simpleMetricFactory(ratio, '', 'Ratio')
    }
  }
}

/**
  * Helper function to create a simple metric tile
  * @param {string | number} value The metric to show
  * @param {string} unit The unit of the metric.
  * @param {string | import('lit').TemplateResult<2>} icon The number of decimal places to round to (default: 0).
*/
function simpleMetricFactory (value = '--', unit = '', icon = '') {
  return html`<dashboard-metric .icon=${icon} .unit=${unit} .value=${value}></dashboard-metric>`
}

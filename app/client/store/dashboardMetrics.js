import { html } from 'lit'
import { formatDistance, formatNumber, secondsToTimeString } from '../lib/helper'
import { icon_bolt, icon_clock, icon_fire, icon_heartbeat, icon_paddle, icon_route, icon_stopwatch, rower_icon } from '../lib/icons'
import '../components/DashboardForceCurve.js'
import '../components/DashboardActions.js'
import '../components/DashboardMetric.js'
import '../components/BatteryIcon.js'

export const DASHBOARD_METRICS = {
  distance: {
    displayName: 'Distance',
    size: 1,
    template: (metrics, config) => {
      const distance = metrics?.sessiontype === 'Distance' ? Math.max(metrics?.intervalTargetDistance - metrics?.intervalLinearDistance, 0) : metrics?.totalLinearDistance
      const linearDistance = formatDistance(distance ?? 0)

      return simpleMetricFactory(linearDistance.distance, linearDistance.unit, config.guiConfigs.showIcons ? icon_route : '')
    }
  },

  pace: { displayName: 'Pace/500', size: 1, template: (metrics, config) => simpleMetricFactory(secondsToTimeString(500 / metrics?.cycleLinearVelocity), '/500m', config.guiConfigs.showIcons ? icon_stopwatch : '') },

  power: { displayName: 'Power', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cyclePower), 'watt', config.guiConfigs.showIcons ? icon_bolt : '') },

  stkRate: { displayName: 'Stroke rate', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cycleStrokeRate), '/min', config.guiConfigs.showIcons ? icon_paddle : '') },
  heartRate: {
    displayName: 'Heart rate',
    size: 1,
    template: (metrics, config) => html`<dashboard-metric .icon=${config.guiConfigs.showIcons ? icon_heartbeat : ''} unit="bpm" .value=${formatNumber(metrics?.heartrate)}>
      ${metrics?.heartRateBatteryLevel > 0
        ? html`<battery-icon .batteryLevel=${metrics?.heartRateBatteryLevel}></battery-icon>`
        : ''}
    </dashboard-metric>`
  },

  totalStk: { displayName: 'Total strokes', size: 1, template: (metrics, config) => simpleMetricFactory(metrics?.totalNumberOfStrokes, 'stk', config.guiConfigs.showIcons ? icon_paddle : '') },

  calories: {
    displayName: 'Calories',
    size: 1,
    template: (metrics, config) => {
      const calories = metrics?.sessiontype === 'Calories' ? Math.max(metrics?.intervalTargetCalories - metrics?.intervalLinearCalories, 0) : metrics?.totalCalories

      return simpleMetricFactory(formatNumber(calories ?? 0), 'kcal', config.guiConfigs.showIcons ? icon_fire : '')
    }
  },

  timer: {
    displayName: 'Timer',
    size: 1,
    template: (metrics, config) => {
      const time = metrics?.sessiontype === 'Time' ? Math.max(metrics?.intervalTargetTime - metrics?.intervalMovingTime, 0) : metrics?.totalMovingTime

      return simpleMetricFactory(secondsToTimeString(time ?? 0), '', config.guiConfigs.showIcons ? icon_clock : '')
    }
  },

  distancePerStk: { displayName: 'Dist per Stroke', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cycleDistance, 1), 'm', config.guiConfigs.showIcons ? rower_icon : '') },

  dragFactor: { displayName: 'Drag factor', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.dragFactor), '', config.guiConfigs.showIcons ? 'Drag' : '') },

  driveLength: { displayName: 'Drive length', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.driveLength, 2), 'm', config.guiConfigs.showIcons ? 'Drive' : '') },

  driveDuration: { displayName: 'Drive duration', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.driveDuration, 2), 'sec', config.guiConfigs.showIcons ? 'Drive' : '') },

  recoveryDuration: { displayName: 'Recovery duration', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.recoveryDuration, 2), 'sec', config.guiConfigs.showIcons ? 'Recovery' : '') },

  forceCurve: { displayName: 'Force curve', size: 2, template: (metrics) => html`<dashboard-force-curve .value=${metrics.driveHandleForceCurve} style="grid-column: span 2"></dashboard-force-curve>` },

  actions: { displayName: 'Actions', size: 1, template: (_, config) => html`<dashboard-actions .config=${config}></dashboard-actions>` }
}

/**
  * Helper function to create a simple metric tile
  *
  * @param {string | number} value The metric to show
  * @param {string} unit The unit of the metric.
  * @param {string | import('lit').TemplateResult<2>} icon The number of decimal places to round to (default: 0).
*/
function simpleMetricFactory (value = '--', unit = '', icon = '') {
  return html`<dashboard-metric .icon=${icon} .unit=${unit} .value=${value}></dashboard-metric>`
}

import { html } from 'lit'
import { simpleMetricFactory, formatDistance, formatNumber, secondsToPace } from '../lib/helper'
import { icon_bolt, icon_clock, icon_fire, icon_heartbeat, icon_paddle, icon_route, icon_stopwatch } from '../lib/icons'
import '../components/DashboardForceCurve.js'
import '../components/DashboardActions.js'
import '../components/BatteryIcon.js'

export const DASHBOARD_METRICS = {
  distance: {
    displayName: 'Distance',
    size: 1,
    template: (metrics, showIcon) => {
      const linearDistance = formatDistance(metrics?.totalLinearDistance)

      return simpleMetricFactory(linearDistance.distance, linearDistance.unit, showIcon ? icon_route : '')
    }
  },
  pace: { displayName: 'Pace/500', size: 1, template: (metrics, showIcon) => simpleMetricFactory(secondsToPace(500 / metrics?.cycleLinearVelocity), '/500m', showIcon ? icon_stopwatch : '') },
  power: { displayName: 'Power', size: 1, template: (metrics, showIcon) => simpleMetricFactory(formatNumber(metrics?.cyclePower), 'watt', showIcon ? icon_bolt : '') },
  stkRate: { displayName: 'Stroke rate', size: 1, template: (metrics, showIcon) => simpleMetricFactory(formatNumber(metrics?.cycleStrokeRate), '/min', showIcon ? icon_paddle : '') },
  heartRate: {
    displayName: 'Heart rate',
    size: 1,
    template: (metrics, showIcon) => html`<dashboard-metric .icon=${showIcon ? icon_heartbeat : ''} unit="bpm" .value=${formatNumber(metrics?.heartrate)}>
  ${metrics?.heartrateBatteryLevel
  ? html`<battery-icon .batteryLevel=${metrics?.heartrateBatteryLevel}></battery-icon>`
  : ''}
</dashboard-metric>`
  },
  totalStk: { displayName: 'Total strokes', size: 1, template: (metrics, showIcon) => simpleMetricFactory(metrics?.totalNumberOfStrokes, 'stk', showIcon ? icon_paddle : '') },
  calories: { displayName: 'Calories', size: 1, template: (metrics, showIcon) => simpleMetricFactory(formatNumber(metrics?.totalCalories), 'kcal', showIcon ? icon_fire : '') },
  timer: { displayName: 'Timer', size: 1, template: (metrics, showIcon) => simpleMetricFactory(secondsToPace(metrics?.totalMovingTime), '', showIcon ? icon_clock : '') },
  forceCurve: { displayName: 'Force curve', size: 2, template: (metrics) => html`<dashboard-force-curve .value=${metrics.driveHandleForceCurve} style="grid-column: span 2"></dashboard-force-curve>` },
  actions: { displayName: 'Actions', size: 1, template: () => html`<dashboard-actions></dashboard-actions>` }
}

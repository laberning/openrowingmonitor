'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the dashboard
*/

import { customElement, property } from 'lit/decorators.js'
import { metricUnit, metricValue } from '../lib/helper.js'
import { icon_bolt, icon_clock, icon_fire, icon_heartbeat, icon_paddle, icon_route, icon_stopwatch } from '../lib/icons.js'
import { APP_STATE } from '../store/appState.js'
import { AppElement, css, html } from './AppElement.js'
import './BatteryIcon.js'
import './DashboardActions.js'
import './DashboardMetric.js'

@customElement('performance-dashboard')
export class PerformanceDashboard extends AppElement {
  static get styles () {
    return css`
      :host {
        display: grid;
        height: calc(100vh - 2vw);
        padding: 1vw;
        grid-gap: 1vw;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        grid-template-rows: repeat(2, minmax(0, 1fr));
      }

      @media (orientation: portrait) {
        :host {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(4, minmax(0, 1fr));
        }
      }

      dashboard-metric, dashboard-actions {
        background: var(--theme-widget-color);
        text-align: center;
        position: relative;
        padding: 0.5em 0.2em 0 0.2em;
        border-radius: var(--theme-border-radius);
      }

      dashboard-actions {
        padding: 0.5em 0 0 0;
      }
    `
  }

  @property({ type: Object })
    appState = APP_STATE

  render () {
    const metrics = this.appState.metrics
    return html`
      <dashboard-metric .icon=${icon_route} .unit=${metricUnit(metrics, 'distanceTotal')} .value=${metricValue(metrics, 'distanceTotal')}></dashboard-metric>
      <dashboard-metric .icon=${icon_stopwatch} unit="/500m" .value=${metricValue(metrics, 'splitFormatted')}></dashboard-metric>
      <dashboard-metric .icon=${icon_bolt} unit="watt" .value=${metricValue(metrics, 'power')}></dashboard-metric>
      <dashboard-metric .icon=${icon_paddle} unit="/min" .value=${metricValue(metrics, 'strokesPerMinute')}></dashboard-metric>
      ${metrics?.heartrate?.value
        ? html`
          <dashboard-metric .icon=${icon_heartbeat} unit="bpm" .value=${metricValue(metrics, 'heartrate')}>
            ${metrics?.heartrateBatteryLevel?.value
              ? html`
                <battery-icon .batteryLevel=${metrics?.heartrateBatteryLevel?.value}></battery-icon>
              `
              : ''
            }
          </dashboard-metric>`
        : html`<dashboard-metric .icon=${icon_paddle} unit="total" .value=${metricValue(metrics, 'strokesTotal')}></dashboard-metric>`}
      <dashboard-metric .icon=${icon_fire} unit="kcal" .value=${metricValue(metrics, 'caloriesTotal')}></dashboard-metric>
      <dashboard-metric .icon=${icon_clock} .value=${metricValue(metrics, 'durationTotalFormatted')}></dashboard-metric>
      <dashboard-actions .appState=${this.appState}></dashboard-actions>
    `
  }
}

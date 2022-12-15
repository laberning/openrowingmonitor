'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { APP_STATE } from '../store/appState.js'
import { customElement, property } from 'lit/decorators.js'
import './DashboardMetric.js'
import './DashboardActions.js'
import './BatteryIcon.js'
import { icon_route, icon_stopwatch, icon_bolt, icon_paddle, icon_heartbeat, icon_fire, icon_clock } from '../lib/icons.js'

@customElement('performance-dashboard')
export class PerformanceDashboard extends AppElement {
  static styles = css`
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

  @property({ type: Object })
    metrics

  @property({ type: Object })
    appState = APP_STATE

  render () {
    const metrics = this.calculateFormattedMetrics(this.appState.metrics)
    return html`
      <dashboard-metric .icon=${icon_route} .unit=${metrics?.totalLinearDistanceFormatted?.unit || 'm'} .value=${metrics?.totalLinearDistanceFormatted?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_stopwatch} unit="/500m" .value=${metrics?.cyclePaceFormatted?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_bolt} unit="watt" .value=${metrics?.cyclePower?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_paddle} unit="/min" .value=${metrics?.cycleStrokeRate?.value}></dashboard-metric>
      ${metrics?.heartrate?.value
        ? html`
          <dashboard-metric .icon=${icon_heartbeat} unit="bpm" .value=${metrics?.heartrate?.value}>
            ${metrics?.heartrateBatteryLevel?.value
              ? html`
                <battery-icon .batteryLevel=${metrics?.heartrateBatteryLevel?.value}></battery-icon>
              `
              : ''
            }
          </dashboard-metric>`
        : html`<dashboard-metric .icon=${icon_paddle} unit="total" .value=${metrics?.totalNumberOfStrokes?.value}></dashboard-metric>`}
      <dashboard-metric .icon=${icon_fire} unit="kcal" .value=${metrics?.totalCalories?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_clock} .value=${metrics?.totalMovingTimeFormatted?.value}></dashboard-metric>
      <dashboard-actions .appState=${this.appState}></dashboard-actions>
    `
  }

  // todo: so far this is just a port of the formatter from the initial proof of concept client
  // we could split this up to make it more readable and testable
  calculateFormattedMetrics (metrics) {
    const fieldFormatter = {
      totalLinearDistanceFormatted: (value) => value >= 10000
        ? { value: (value / 1000).toFixed(2), unit: 'km' }
        : { value: Math.round(value), unit: 'm' },
      totalCalories: (value) => Math.round(value),
      cyclePower: (value) => Math.round(value),
      cycleStrokeRate: (value) => Math.round(value)
    }

    const formattedMetrics = {}
    for (const [key, value] of Object.entries(metrics)) {
      const valueFormatted = fieldFormatter[key] ? fieldFormatter[key](value) : value
      if (valueFormatted.value !== undefined && valueFormatted.unit !== undefined) {
        formattedMetrics[key] = {
          value: valueFormatted.value,
          unit: valueFormatted.unit
        }
      } else {
        formattedMetrics[key] = {
          value: valueFormatted
        }
      }
    }
    return formattedMetrics
  }
}

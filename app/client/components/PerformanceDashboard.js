'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css } from './AppElement'
import { APP_STATE } from '../store/appState'
import { customElement, property } from 'lit/decorators.js'
import './DashboardMetric'
import './DashboardActions'
import { icon_route, icon_stopwatch, icon_bolt, icon_paddle, icon_heartbeat, icon_fire, icon_clock } from '../lib/icons'

@customElement('performance-dashboard')
export class PerformanceDashboard extends AppElement {
  static get styles () {
    return css`
      `
  }

  @property({ type: Object })
  metrics

  @property({ type: Object })
  appState = APP_STATE

  render () {
    const metrics = this.calculateFormattedMetrics(this.appState.metrics)
    return html`
      <dashboard-metric .icon=${icon_route} .unit=${metrics?.distanceTotal?.unit || 'm'} .value=${metrics?.distanceTotal?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_stopwatch} unit="/500m" .value=${metrics?.splitFormatted?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_bolt} unit="watt" .value=${metrics?.power?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_paddle} unit="/min" .value=${metrics?.strokesPerMinute?.value}></dashboard-metric>
      ${metrics?.heartrate?.value
        ? html`<dashboard-metric .icon=${icon_heartbeat} unit="bpm"
          .value=${metrics?.heartrate?.value}
          .batteryLevel=${metrics?.heartrateBatteryLevel?.value}></dashboard-metric>`
        : html`<dashboard-metric .icon=${icon_paddle} unit="total" .value=${metrics?.strokesTotal?.value}></dashboard-metric>`}
      <dashboard-metric .icon=${icon_fire} unit="kcal" .value=${metrics?.caloriesTotal?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_clock} .value=${metrics?.durationTotalFormatted?.value}></dashboard-metric>
      <dashboard-actions .appState=${this.appState}></dashboard-actions>
    `
  }

  calculateFormattedMetrics (metrics) {
    const fieldFormatter = {
      distanceTotal: (value) => value >= 10000
        ? { value: (value / 1000).toFixed(1), unit: 'km' }
        : { value: Math.round(value), unit: 'm' },
      caloriesTotal: (value) => Math.round(value),
      power: (value) => Math.round(value),
      strokesPerMinute: (value) => Math.round(value)
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

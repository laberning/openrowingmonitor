'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css } from './AppElement'
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

  render () {
    return html`
      <dashboard-metric .icon=${icon_route} .unit=${this.metrics?.distanceTotal?.unit} .value=${this.metrics?.distanceTotal?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_stopwatch} unit="/500m" .value=${this.metrics?.splitFormatted?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_bolt} unit="watt" .value=${this.metrics?.power?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_paddle} unit="/min" .value=${this.metrics?.strokesPerMinute?.value}></dashboard-metric>
      ${this.metrics?.heartrate?.value
        ? html`<dashboard-metric .icon=${icon_heartbeat} unit="bpm"
          .value=${this.metrics?.heartrate?.value}
          .batteryLevel=${this.metrics?.heartrateBatteryLevel?.value}></dashboard-metric>`
        : html`<dashboard-metric .icon=${icon_paddle} unit="total" .value=${this.metrics?.strokesTotal?.value}></dashboard-metric>`}
      <dashboard-metric .icon=${icon_fire} unit="kcal" .value=${this.metrics?.caloriesTotal?.value}></dashboard-metric>
      <dashboard-metric .icon=${icon_clock} .value=${this.metrics?.durationTotalFormatted?.value}></dashboard-metric>
      <dashboard-actions .peripheralMode=${this.metrics?.peripheralMode?.value}></dashboard-actions>
    `
  }
}

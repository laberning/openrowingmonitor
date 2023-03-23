'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, state } from 'lit/decorators.js'
import './DashboardForceCurve.js'
import './DashboardMetric.js'
import './DashboardActions.js'
import './BatteryIcon.js'
import './SettingsDialog'
import { icon_route, icon_stopwatch, icon_bolt, icon_paddle, icon_heartbeat, icon_fire, icon_clock, icon_settings } from '../lib/icons.js'

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

    dashboard-metric, dashboard-actions, dashboard-force-curve {
      background: var(--theme-widget-color);
      text-align: center;
      position: relative;
      padding: 0.5em 0.2em 0 0.2em;
      border-radius: var(--theme-border-radius);
    }

    dashboard-actions {
      padding: 0.5em 0 0 0;
    }

    .settings {
      padding: 0.1em 0;
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 20;
    }

    .settings .icon {
      cursor: pointer;
      height: 1em;
    }

    .settings:hover .icon {
      filter: brightness(150%);
    }
  `
  @state()
    _dialog

  dashboardMetricComponents = (formattedMetrics, appState) => ({
    distance: html`<dashboard-metric .icon=${this.appState.config.guiConfigs.showIcons ? icon_route : ''} .unit=${formattedMetrics?.totalLinearDistanceFormatted?.unit || 'm'} .value=${formattedMetrics?.totalLinearDistanceFormatted?.value}></dashboard-metric>`,

    pace: html`<dashboard-metric .icon=${this.appState.config.guiConfigs.showIcons ? icon_stopwatch : ''} unit="/500m" .value=${formattedMetrics?.cyclePaceFormatted?.value}></dashboard-metric>`,

    power: html`<dashboard-metric .icon=${this.appState.config.guiConfigs.showIcons ? icon_bolt : ''} unit="watt" .value=${formattedMetrics?.cyclePower?.value}></dashboard-metric>`,

    stkRate: html`<dashboard-metric .icon=${this.appState.config.guiConfigs.showIcons ? icon_paddle : ''} unit="/min" .value=${formattedMetrics?.cycleStrokeRate?.value}></dashboard-metric>`,

    heartRate: html`<dashboard-metric .icon=${this.appState.config.guiConfigs.showIcons ? icon_heartbeat : ''} unit="bpm" .value=${formattedMetrics?.heartrate?.value}>
          ${formattedMetrics?.heartrateBatteryLevel?.value
          ? html`<battery-icon .batteryLevel=${formattedMetrics?.heartrateBatteryLevel?.value}></battery-icon>`
            : ''}
    </dashboard-metric>`,

    totalStk: html`<dashboard-metric .icon=${this.appState.config.guiConfigs.showIcons ? icon_paddle : ''} unit="total" .value=${formattedMetrics?.totalNumberOfStrokes?.value}></dashboard-metric>`,

    calories: html`<dashboard-metric .icon=${this.appState.config.guiConfigs.showIcons ? icon_fire : ''} unit="kcal" .value=${formattedMetrics?.totalCalories?.value}></dashboard-metric>`,

    timer: html`<dashboard-metric .icon=${this.appState.config.guiConfigs.showIcons ? icon_clock : ''} .value=${formattedMetrics?.totalMovingTimeFormatted?.value}></dashboard-metric>`,

    forceCurve: html`<dashboard-force-curve .value=${appState?.metrics.driveHandleForceCurve} style="grid-column: span 2"></dashboard-force-curve>`,

    actions: html`<dashboard-actions .appState=${appState}></dashboard-actions>`
  })

  render () {
    const metricConfig = [...new Set(this.appState.config.guiConfigs.dashboardMetrics)].reduce((prev, metricName) => {
      prev.push(this.dashboardMetricComponents(this.metrics, this.appState)[metricName])
      return prev
    }, [])

    this.metrics = this.calculateFormattedMetrics(this.appState.metrics)
    return html`
      <div class="settings" @click=${this.openSettings}>
        ${icon_settings}
        ${this._dialog ? this._dialog : ''}
      </div>

      ${metricConfig}
    `
  }

  openSettings () {
    this._dialog = html`<settings-dialog .config=${this.appState.config.guiConfigs} @close=${dialogClosed}></settings-dialog>`

    function dialogClosed (event) {
      this._dialog = undefined
    }
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
      if (valueFormatted?.value !== undefined && valueFormatted?.unit !== undefined) {
        formattedMetrics[key] = {
          value: valueFormatted?.value,
          unit: valueFormatted?.unit
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

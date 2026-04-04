'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import './DashboardToolbar.js'
import './WorkoutDialog.js'
import { DASHBOARD_METRICS } from '../store/dashboardMetrics.js'

@customElement('performance-dashboard')
export class PerformanceDashboard extends AppElement {
  static styles = css`
    :host {
      display: grid;
      grid-template:
        "toolbar" auto
        "metrics" 1fr
        / 1fr;
      height: 100vh;
      gap: 1vw;
      box-sizing: border-box;
    }

    dashboard-toolbar {
      grid-area: toolbar;
    }

    .metrics-grid {
      grid-area: metrics;
      display: grid;
      gap: 1vw;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      min-height: 0; /* prevent grid blowout */
    }

    .metrics-grid.rows-3 {
      grid-template-rows: repeat(3, 1fr);
    }

    @media (orientation: portrait) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(4, 1fr);
      }

      .metrics-grid.rows-3 {
        grid-template-rows: repeat(6, 1fr);
      }
    }

    /* This should be defined within the component */
    dashboard-metric,
    dashboard-force-curve {
      background: var(--theme-widget-color);
      text-align: center;
      padding: 0.2em;
      border-radius: var(--theme-border-radius);
      position: relative;
      min-height: 0; /* prevent grid blowout */
    }
  `
  @property()
  accessor appState = {}

  @state()
  accessor _dialog = null

  _handleWorkoutOpen = (type) => {
    this.sendEvent('workout-open', type)
    this._dialog = html`
      <workout-dialog
        .type=${type}
        @close=${() => { this._dialog = null }}
      ></workout-dialog>
    `
  }

  dashboardMetricComponentsFactory = (appState) => {
    const metrics = appState.metrics
    const configs = appState.config

    const dashboardMetricComponents = Object.keys(DASHBOARD_METRICS).reduce((dashboardMetrics, key) => {
      dashboardMetrics[key] = DASHBOARD_METRICS[key].template(metrics, configs, this._handleWorkoutOpen)

      return dashboardMetrics
    }, {})

    return dashboardMetricComponents
  }

  render () {
    const metricConfig = [...new Set(this.appState.config.guiConfigs.dashboardMetrics)].reduce((prev, metricName) => {
      prev.push(this.dashboardMetricComponentsFactory(this.appState)[metricName])
      return prev
    }, [])

    const gridClass = this.appState.config.guiConfigs.maxNumberOfTiles === 12 ? 'rows-3' : ''

    return html`
      <dashboard-toolbar .config=${this.appState.config}></dashboard-toolbar>
      <section class="metrics-grid ${gridClass}">${metricConfig}</section>
      ${this._dialog ? this._dialog : ''}
    `
  }
}

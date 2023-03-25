'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import './SettingsDialog'
import { icon_settings } from '../lib/icons.js'
import { DASHBOARD_METRICS } from '../store/dashboardMetrics.js'

@customElement('performance-dashboard')
export class PerformanceDashboard extends AppElement {
  static styles = css`
    :host {
      display: grid;
      height: calc(100vh - 2vw);
      padding: 1vw;
      grid-gap: 1vw;
      grid-template-columns: repeat(4, minmax(0, 1fr));
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
  @property()
    appState = {}

  @state()
    _dialog

  dashboardMetricComponentsFactory = (appState) => {
    const metrics = appState.metrics
    const configs = appState.config

    const dashboardMetricComponents = Object.keys(DASHBOARD_METRICS).reduce((dashboardMetrics, key) => {
      dashboardMetrics[key] = DASHBOARD_METRICS[key].template(metrics, configs)

      return dashboardMetrics
    }, {})

    return dashboardMetricComponents
  }

  render () {
    const metricConfig = [...new Set(this.appState.config.guiConfigs.dashboardMetrics)].reduce((prev, metricName) => {
      prev.push(this.dashboardMetricComponentsFactory(this.appState)[metricName])
      return prev
    }, [])

    return html`
      <style type="text/css">
        :host {
          ${this.appState.config.guiConfigs.maxNumberOfTiles === 12 ? 'grid-template-rows: repeat(3, minmax(0, 1fr));' : 'grid-template-rows: repeat(2, minmax(0, 1fr));'}
        }
      </style>
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
}

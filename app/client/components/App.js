'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Main Component of the Open Rowing Monitor App
*/

import { AppElement, html, css } from './AppElement'
import { APP_STATE } from '../store/appState'
import { customElement, state } from 'lit/decorators.js'
import { createApp } from '../lib/network'
import './PerformanceDashboard'

@customElement('web-app')
export class App extends AppElement {
  static get styles () {
    return css`
     `
  }

  @state()
  globalAppState = APP_STATE

  constructor () {
    super()
    this.app = createApp(this.globalAppState)
    window.app = this.app
    this.app.setMetricsCallback(metrics => this.metricsUpdated(metrics))

    // this is how we implement changes to the global state:
    // once any child component sends this CustomEvent we update the global state according
    // to the changes that were passed to us
    this.addEventListener('app-state-changed', (event) => {
      const newState = event.detail
      this.globalAppState = newState
    })
  }

  static properties = {
    metrics: { state: true }
  };

  render () {
    return html`
      <performance-dashboard
        .appState=${this.globalAppState}
        .metrics=${this.metrics}
      ></performance-dashboard>
    `
  }

  metricsUpdated (metrics) {
    this.metrics = Object.assign({}, metrics)
  }

  createRenderRoot () {
    return this
  }
}

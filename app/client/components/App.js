'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Main Component of the Open Rowing Monitor App
*/

import { AppElement, html, css } from './AppElement'
import { customElement } from 'lit/decorators.js'
import { createApp } from '../lib/network.js'
import './PerformanceDashboard'

@customElement('web-app')
export class App extends AppElement {
  static get styles () {
    return css`
     `
  }

  constructor () {
    super()
    this.app = createApp()
    window.app = this.app
    this.app.setMetricsCallback(metrics => this.metricsUpdated(metrics))
  }

  static properties = {
    metrics: { state: true }
  };

  render () {
    return html`
      <performance-dashboard .metrics=${this.metrics}></performance-dashboard>
    `
  }

  metricsUpdated (metrics) {
    this.metrics = Object.assign({}, metrics)
  }

  createRenderRoot () {
    return this
  }
}

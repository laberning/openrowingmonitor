'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders a metric of the dashboard
*/

import { AppElement, html, svg, css } from './AppElement'
import { customElement, property } from 'lit/decorators.js'

@customElement('dashboard-metric')
export class DashboardMetric extends AppElement {
  static get styles () {
    return css`
       `
  }

  @property({ type: Object })
  icon

  @property({ type: String })
  unit = ''

  @property({ type: String })
  value = ''

  @property({ type: String })
  batteryLevel = ''

  render () {
    return html`
      <div class="label">${this.icon}</div>
      <div class="content">
        <span class="metric-value">${this.value}</span>
        <span class="metric-unit">${this.unit}</span>
      </div>
      ${this.batteryLevel
        ? html`<div id="heartrate-battery-container">${this.batteryIcon}</div>`
        : ''}
     `
  }

  get batteryIcon () {
    // 416 is the max width value of the battery bar in the SVG graphic
    const batteryWidth = this.batteryLevel * 416 / 100

    return svg`
      <svg aria-hidden="true" focusable="false" class="icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <path fill="currentColor" d="M544 160v64h32v64h-32v64H64V160h480m16-64H48c-26.51 0-48 21.49-48 48v224c0 26.51 21.49 48 48 48h512c26.51 0 48-21.49 48-48v-16h8c13.255 0 24-10.745 24-24V184c0-13.255-10.745-24-24-24h-8v-16c0-26.51-21.49-48-48-48z"></path>
        <rect fill="currentColor" id="battery-level" x="96" y="192" width=${batteryWidth} height="128"></rect>
      </svg>

    `
  }
}

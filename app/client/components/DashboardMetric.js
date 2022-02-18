'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders a metric of the dashboard
*/

import { customElement, property } from 'lit/decorators.js'
import { AppElement, css, html } from './AppElement.js'

@customElement('dashboard-metric')
export class DashboardMetric extends AppElement {
  static get styles () {
    return css`
      .label, .content {
        padding: 0.1em 0;
      }

      .icon {
        height: 1.8em;
      }

      .metric-value {
          font-size: 150%;
      }

      .metric-unit {
          font-size: 80%;
      }

      ::slotted(*) {
        right: 0.2em;
        bottom: 0;
        position: absolute;
      }
    `
  }

  @property({ type: Object })
    icon

  @property({ type: String })
    unit = ''

  @property({ type: String })
    value = ''

  render () {
    return html`
      <div class="label">${this.icon}</div>
      <div class="content">
        <span class="metric-value">${this.value}</span>
        <span class="metric-unit">${this.unit}</span>
      </div>
      <slot></slot>
    `
  }
}

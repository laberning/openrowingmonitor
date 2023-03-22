'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the action buttons of the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, queryAll } from 'lit/decorators.js'
import { icon_settings } from '../lib/icons.js'
import './AppDialog.js'

@customElement('settings-dialog')
export class DashboardActions extends AppElement {
  static styles = css`
    .metric-selector-feedback{
      font-size: 0.4em;
      padding-top: 8px;
    }

    .metric-selector-feedback>div {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      grid-template-rows: repeat(2, max-content);
      gap: 8px;
    }

    .settings-dialog>div.metric-selector{
      display: grid;
      grid-template-columns: repeat(4,max-content);
      grid-template-rows: repeat(3, max-content);
      gap: 8px;

    }

    .settings-dialog>div>label{
      font-size: 0.6em;
    }

    input[type="checkbox"]{
      cursor: pointer;
      align-self: center;
      width: 1.5em;
      height: 1.5em;
    }

    .icon {
      height: 1.6em;
    }

    legend{
      text-align: center;
    }

    table {
      min-height: 70px;
      margin-top: 8px;
      width: 100%;
    }

    table, th, td {
      font-size: 0.8em;
      border: 1px solid white;
      border-collapse: collapse;
    }

    tr {
      height: 50%;
    }

    th, td {
      padding: 8px;
      text-align: center;
      background-color: var(--theme-widget-color);
    }
  `

  @property({ type: Object })
    config

  @queryAll('input')
    inputs

  static get properties () {
    return {
      selectedMetrics: { type: Array },
      sumSelectedSlots: { type: Number },
      isValid: { type: Boolean }
    }
  }

  constructor () {
    super()
    this.selectedMetrics = []
    this.sumSelectedSlots = 0
    this.isValid = false
  }

  @property({ type: Object })
    icon

  render () {
    return html`
    <app-dialog class="settings-dialog" .isValid=${this.isValid} @close=${this.close}>
    <legend>${icon_settings}<br/>Settings</legend>

    <p>Select metrics to be shown:</p>
    <div class="metric-selector">
      <label for="distance">Distance</label>
      <input @change=${this.toggleCheck} name="distance" size=1 type="checkbox" />
      <label for="timer">Timer</label>
      <input @change=${this.toggleCheck} name="timer" size=1 type="checkbox" />
      <label for="pace">Pace</label>
      <input @change=${this.toggleCheck} name="pace" size=1 type="checkbox" />
      <label for="power">Power</label>
      <input @change=${this.toggleCheck} name="power" size=1 type="checkbox" />
      <label for="stk">Stroke Rate</label>
      <input @change=${this.toggleCheck} name="stkRate" size=1 type="checkbox" />
      <label for="totalStrokes">Total Strokes</label>
      <input @change=${this.toggleCheck} name="totalStk" size=1 type="checkbox" />
      <label for="calories">Calories</label>
      <input @change=${this.toggleCheck} name="calories" size=1 type="checkbox" />
      <label for="actions">Heart Rate</label>
      <input @change=${this.toggleCheck} name="heartRate" size=1 type="checkbox" />
      <label for="forceCurve">Force Curve</label>
      <input @change=${this.toggleCheck} name="forceCurve" size=2 type="checkbox" />
      <label for="actions">Actions</label>
      <input @change=${this.toggleCheck} name="actions" size=1 type="checkbox" />
    </div>
    <div class="metric-selector-feedback">Slots remaining:  ${8 - this.sumSelectedSlots}
      <table>
        ${this.renderSelectedMetrics()}
      </table>
    </div>
    </app-dialog>
  `
  }

  firstUpdated () {
    this.selectedMetrics = this.config.dashboardMetrics
    this.sumSelectedSlots = this.selectedMetrics.length
    if (this.sumSelectedSlots === 8) {
      this.isValid = true
    } else {
      this.isValid = false
    }
    [...this.inputs].forEach(input => {
      input.checked = this.selectedMetrics.find(metric => metric === input.name) !== undefined
    })
  }

  renderSelectedMetrics () {
    const selectedMetrics = [html`<tr>${[0, 1, 2, 3].map(index => html`<td style="${this.selectedMetrics[3] === this.selectedMetrics[4] && index === 3 ? 'color: red' : ''}">${this.selectedMetrics[index]}</td>`)}</tr>`]
    selectedMetrics.push(html`<tr>${[4, 5, 6, 7].map(index => html`<td  style="${this.selectedMetrics[3] === this.selectedMetrics[4] && index === 4 ? 'color: red' : ''}">${this.selectedMetrics[index]}</td>`)}</tr>`)

    return selectedMetrics
  }

  toggleCheck (e) {
    if ((e.target.checked && this.selectedMetrics.length < 4 && e.target.size > 1 && this.selectedMetrics.length + e.target.size > 4) || (e.target.checked && this.sumSelectedSlots + 1 > 8)) {
      this.isValid = this.isFormValid()
      e.target.checked = false
      return
    }

    if (e.target.checked) {
      for (let index = 0; index < e.target.size; index++) {
        this.selectedMetrics = [...this.selectedMetrics, e.target.name]
      }
    } else {
      for (let index = 0; index < e.target.size; index++) {
        this.selectedMetrics.splice(this.selectedMetrics.findIndex(metric => metric === e.target.name), 1)
      }
    }

    this.sumSelectedSlots = this.selectedMetrics.length
    if (this.isFormValid()) {
      this.isValid = true
    } else {
      this.isValid = false
    }
  }

  isFormValid () {
    return this.sumSelectedSlots === 8 && this.selectedMetrics[3] !== this.selectedMetrics[4]
  }

  close (event) {
    this.dispatchEvent(new CustomEvent('close'))
    if (event.detail === 'confirm') {
      this.dispatchEvent(new CustomEvent('changeGuiSetting', {
        detail: {
          ...this.appState,
          config: {
            ...this.appState.config,
            guiConfigs: {
              dashboardMetrics: this.selectedMetrics
            }
          }
        },
        bubbles: true,
        composed: true
      }))
    }
  }
}

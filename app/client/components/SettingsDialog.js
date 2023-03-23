'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the action buttons of the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, query, queryAll, state } from 'lit/decorators.js'
import { icon_settings } from '../lib/icons.js'
import './AppDialog.js'
import { DASHBOARD_METRICS } from '../store/dashboardMetrics.js'

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

    .show-icons-selector {
      display: flex;
      gap: 8px;
    }

    app-dialog > *:last-child {
      margin-bottom: -24px;
    }
  `

  @property({ type: Object })
    config = {}

  @queryAll('.metric-selector>input')
    _inputs

  @query('input[name="showIcons"]')
    _showIconInput

  @state()
    _selectedMetrics = []

  @state()
    _sumSelectedSlots = 0

  @state()
    _isValid = false

  @state()
    _showIcons = true

  render () {
    return html`
    <app-dialog class="settings-dialog" .isValid=${this._isValid} @close=${this.close}>
    <legend>${icon_settings}<br/>Settings</legend>

    <p>Select metrics to be shown:</p>
    <div class="metric-selector">
      ${this.renderAvailableMetricList()}
    </div>
    <div class="metric-selector-feedback">Slots remaining:  ${8 - this._sumSelectedSlots}
      <table>
        ${this.renderSelectedMetrics()}
      </table>
    </div>
    <p class="show-icons-selector">
      <label for="actions">Show icons</label>
      <input @change=${this.toggleIcons} name="showIcons" type="checkbox" />
    </p>
    </app-dialog>
  `
  }

  firstUpdated () {
    this._selectedMetrics = [...this.config.dashboardMetrics]
    this._sumSelectedSlots = this._selectedMetrics.length
    this._showIcons = this.config.showIcons
    if (this._sumSelectedSlots === 8) {
      this._isValid = true
    } else {
      this._isValid = false
    }
    [...this._inputs].forEach(input => {
      input.checked = this._selectedMetrics.find(metric => metric === input.name) !== undefined
    })
    this._showIconInput.checked = this._showIcons
  }

  renderAvailableMetricList () {
    return Object.keys(DASHBOARD_METRICS).map(key => html`
      <label for=${key}>${DASHBOARD_METRICS[key].displayName}</label>
      <input @change=${this.toggleCheck} name=${key} size=${DASHBOARD_METRICS[key].size} type="checkbox" />
    `)
  }

  renderSelectedMetrics () {
    const selectedMetrics = [html`<tr>${[0, 1, 2, 3].map(index => html`<td style="${this._selectedMetrics[3] === this._selectedMetrics[4] && index === 3 ? 'color: red' : ''}">${this._selectedMetrics[index]}</td>`)}</tr>`]
    selectedMetrics.push(html`<tr>${[4, 5, 6, 7].map(index => html`<td  style="${this._selectedMetrics[3] === this._selectedMetrics[4] && index === 4 ? 'color: red' : ''}">${this._selectedMetrics[index]}</td>`)}</tr>`)

    return selectedMetrics
  }

  toggleCheck (e) {
    if ((e.target.checked && this._selectedMetrics.length < 4 && e.target.size > 1 && this._selectedMetrics.length + e.target.size > 4) || (e.target.checked && this._sumSelectedSlots + 1 > 8)) {
      this._isValid = this.isFormValid()
      e.target.checked = false
      return
    }

    if (e.target.checked) {
      for (let index = 0; index < e.target.size; index++) {
        this._selectedMetrics = [...this._selectedMetrics, e.target.name]
      }
    } else {
      for (let index = 0; index < e.target.size; index++) {
        this._selectedMetrics.splice(this._selectedMetrics.findIndex(metric => metric === e.target.name), 1)
        this._selectedMetrics = [...this._selectedMetrics]
      }
    }

    this._sumSelectedSlots = this._selectedMetrics.length
    if (this.isFormValid()) {
      this._isValid = true
    } else {
      this._isValid = false
    }
  }

  toggleIcons (e) {
    this._showIcons = e.target.checked
  }

  isFormValid () {
    return this._sumSelectedSlots === 8 && this._selectedMetrics[3] !== this._selectedMetrics[4]
  }

  close (event) {
    this.dispatchEvent(new CustomEvent('close'))
    if (event.detail === 'confirm') {
      this.sendEvent('changeGuiSetting', {
        ...this.appState,
        config: {
          ...this.appState.config,
          guiConfigs: {
            dashboardMetrics: this._selectedMetrics,
            showIcons: this._showIcons
          }
        }
      })
    }
  }
}

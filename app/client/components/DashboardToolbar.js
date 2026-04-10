'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Toolbar component combining settings and action buttons
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import { iconSettings, iconUndo, iconExpand, iconCompress, iconPoweroff, iconBluetooth, iconUpload, iconHeartbeat, iconAntplus } from '../lib/icons.js'
import './SettingsDialog.js'
import './AppDialog.js'

@customElement('dashboard-toolbar')
export class DashboardToolbar extends AppElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5em;
      padding: 0.2em 0.3em;
      background: var(--theme-widget-color);
      border-radius: var(--theme-border-radius);
    }

    .button-group {
      display: flex;
      align-items: center;
      gap: 0.3em;
      flex-wrap: wrap;
    }

    button {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 2.5em;
      height: 2.5em;
      padding: 0;
      border: 0;
      border-radius: var(--theme-border-radius);
      background: var(--theme-button-color);
      color: var(--theme-font-color);
      font-size: 0.4em;
      cursor: pointer;
    }

    button:hover {
      filter: brightness(150%);
    }

    button .text {
      position: absolute;
      left: 2px;
      bottom: 2px;
      font-size: 40%;
    }

    .icon {
      height: 1.2em;
    }

    .peripheral-mode-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.1em;
    }

    .peripheral-mode {
      font-size: 0.3em;
    }

    .fullscreen-icon { display: flex; }
    .windowed-icon { display: none; }

    @media (display-mode: fullscreen) {
      .fullscreen-icon { display: none; }
      .windowed-icon { display: flex; }
    }
  `

  @property({ type: Object })
  accessor config = {}

  @state()
  accessor _appMode = 'BROWSER'

  @state()
  accessor _dialog

  render () {
    return html`
      <div class="button-group">
        <button @click=${this.openSettings} title="Settings">
          ${iconSettings}
        </button>
        <button @click=${this.reset} title="Reset">
          ${iconUndo}
        </button>
        ${this.renderOptionalButtons()}
      </div>

      <div class="button-group">
        <button @click=${this.switchHrmPeripheralMode} title="Heart Rate Monitor">
          ${iconHeartbeat}
          <div class="text">${this.config?.hrmPeripheralMode}</div>
        </button>
        <button @click=${this.switchAntPeripheralMode} title="ANT+ Mode">
          ${iconAntplus}
          <div class="text">${this.config?.antPeripheralMode}</div>
        </button>
        <div class="peripheral-mode-container">
          <button @click=${this.switchBlePeripheralMode} title="Bluetooth Mode">
            ${iconBluetooth}
          </button>
          <div class="peripheral-mode">${this.blePeripheralMode()}</div>
        </div>
      </div>

      ${this._dialog ? this._dialog : ''}
    `
  }

  firstUpdated () {
    switch (new URLSearchParams(window.location.search).get('mode')) {
      case 'standalone':
        this._appMode = 'STANDALONE'
        break
      case 'kiosk':
        this._appMode = 'KIOSK'
        break
      default:
        this._appMode = 'BROWSER'
    }
  }

  renderOptionalButtons () {
    const buttons = []
    if (this._appMode === 'BROWSER' && document.documentElement.requestFullscreen) {
      buttons.push(html`
        <button @click=${this.toggleFullscreen} title="Toggle Fullscreen">
          <span class="fullscreen-icon">${iconExpand}</span>
          <span class="windowed-icon">${iconCompress}</span>
        </button>
      `)
    }
    if (this._appMode === 'KIOSK' && this.config?.shutdownEnabled) {
      buttons.push(html`
        <button @click=${this.shutdown} title="Shutdown">${iconPoweroff}</button>
      `)
    }
    if (this.config?.uploadEnabled) {
      buttons.push(html`
        <button @click=${this.uploadTraining} title="Upload Training">${iconUpload}</button>
      `)
    }
    return buttons
  }

  blePeripheralMode () {
    const value = this.config?.blePeripheralMode
    switch (value) {
      case 'PM5':
        return 'C2 PM5'
      case 'FTMSBIKE':
        return 'FTMS Bike'
      case 'CSC':
        return 'Bike Speed + Cadence'
      case 'CPS':
        return 'Bike Power'
      case 'FTMS':
        return 'FTMS Rower'
      default:
        return 'Off'
    }
  }

  openSettings () {
    this._dialog = html`<settings-dialog .config=${this.config.guiConfigs} @close=${() => {
      this._dialog = undefined
    }}></settings-dialog>`
  }

  toggleFullscreen () {
    const fullscreenElement = document.getElementsByTagName('web-app')[0]
    if (!document.fullscreenElement) {
      fullscreenElement.requestFullscreen({ navigationUI: 'hide' })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  reset () {
    this.sendEvent('triggerAction', { command: 'reset' })
  }

  switchBlePeripheralMode () {
    this.sendEvent('triggerAction', { command: 'switchBlePeripheralMode' })
  }

  switchAntPeripheralMode () {
    this.sendEvent('triggerAction', { command: 'switchAntPeripheralMode' })
  }

  switchHrmPeripheralMode () {
    this.sendEvent('triggerAction', { command: 'switchHrmMode' })
  }

  uploadTraining () {
    this._dialog = html`
      <app-dialog @close=${(event) => {
        // this._dialog = undefined
        if (event.detail === 'confirm') {
          this.sendEvent('triggerAction', { command: 'upload' })
        }
      }}>
        <legend>${iconUpload}<br/>Upload training?</legend>
        <p>Do you want to finish your workout and upload it to webservices (Strava, Intervals.icu and RowsAndAll)?</p>
      </app-dialog>
    `
  }

  shutdown () {
    this._dialog = html`
      <app-dialog @close=${(event) => {
        this._dialog = undefined
        if (event.detail === 'confirm') {
          this.sendEvent('triggerAction', { command: 'shutdown' })
        }
      }}>
        <legend>${iconPoweroff}<br/>Shutdown Open Rowing Monitor?</legend>
        <p>Do you want to shutdown the device?</p>
      </app-dialog>
    `
  }
}

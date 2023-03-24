'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the action buttons of the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import { icon_undo, icon_expand, icon_compress, icon_poweroff, icon_bluetooth, icon_upload, icon_heartbeat, icon_antplus } from '../lib/icons.js'
import './AppDialog.js'

@customElement('dashboard-actions')
export class DashboardActions extends AppElement {
  static styles = css`
    button {
      position: relative;
      outline:none;
      background-color: var(--theme-button-color);
      border: 0;
      border-radius: var(--theme-border-radius);
      color: var(--theme-font-color);
      margin: 0.2em 4px;
      font-size: 60%;
      text-decoration: none;
      display: inline-flex;
      width: 3.2em;
      min-width: 3.2em;
      height: 2.2em;
      justify-content: center;
      align-items: center;
    }

    button:hover {
      filter: brightness(150%);
    }

    button > div.text {
      position: absolute;
      left: 2px;
      bottom: 2px;
      font-size: 40%;
    }

    #fullscreen-icon {
        display: inline-flex;
    }

    .top-button-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }

    #windowed-icon {
      display: none;
    }

    .icon {
      height: 1.7em;
    }

    .peripheral-mode {
      font-size: 50%;
    }

    @media (display-mode: fullscreen) {
      #fullscreen-icon {
        display: none;
      }
      #windowed-icon {
        display: inline-flex;
      }
    }
  `

  @property({ type: Object })
    config = {}

  @property({ type: Object })
    appMode = 'BROWSER'

  @state()
    _dialog

  render () {
    return html`
    <div class="top-button-group">
      <button @click=${this.reset}>${icon_undo}</button>
      ${this.renderOptionalButtons()}
      <button @click=${this.switchHrmPeripheralMode}>
        ${icon_heartbeat}
        <div class="text">${this.config?.hrmPeripheralMode}</div>
      </button>
      <button @click=${this.switchAntPeripheralMode}>
        ${icon_antplus}
        <div class="text">${this.config?.antPeripheralMode}</div>
      </button>
    </div>
      <div class="text-button">
      <button @click=${this.switchBlePeripheralMode}>${icon_bluetooth}</button>
        <div class="peripheral-mode">${this.blePeripheralMode()}</div>
    </div>
    ${this._dialog ? this._dialog : ''}
  `
  }

  renderOptionalButtons () {
    const buttons = []
    // changing to fullscreen mode only makes sence when the app is openend in a regular
    // webbrowser (kiosk and standalone mode are always in fullscreen view) and if the
    // browser supports this feature
    if (this.appMode === 'BROWSER' && document.documentElement.requestFullscreen) {
      buttons.push(html`
      <button @click=${this.toggleFullscreen}>
        <div id="fullscreen-icon">${icon_expand}</div>
        <div id="windowed-icon">${icon_compress}</div>
      </button>
    `)
    }
    // add a button to power down the device, if browser is running on the device in kiosk mode
    // and the shutdown feature is enabled
    // (might also make sence to enable this for all clients but then we would need visual feedback)
    if (this.appMode === 'KIOSK' && this.config?.shutdownEnabled) {
      buttons.push(html`
      <button @click=${this.shutdown}>${icon_poweroff}</button>
    `)
    }

    if (this.config?.stravaUploadEnabled) {
      buttons.push(html`
      <button @click=${this.uploadTraining}>${icon_upload}</button>
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
      <app-dialog @close=${dialogClosed}>
        <legend>${icon_upload}<br/>Upload to Strava?</legend>
        <p>Do you want to finish your workout and upload it to Strava?</p>
      </app-dialog>
    `
    function dialogClosed (event) {
      this._dialog = undefined
      if (event.detail === 'confirm') {
        this.sendEvent('triggerAction', { command: 'uploadTraining' })
      }
    }
  }

  shutdown () {
    this._dialog = html`
      <app-dialog @close=${dialogClosed}>
        <legend>${icon_poweroff}<br/>Shutdown Open Rowing Monitor?</legend>
        <p>Do you want to shutdown the device?</p>
      </app-dialog>
    `
    function dialogClosed (event) {
      this._dialog = undefined
      if (event.detail === 'confirm') {
        this.sendEvent('triggerAction', { command: 'shutdown' })
      }
    }
  }
}

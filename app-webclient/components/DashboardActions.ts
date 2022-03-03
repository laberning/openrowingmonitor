/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the action buttons of the dashboard
*/

import { customElement, state } from 'lit/decorators.js'
import { icon_bluetooth, icon_compress, icon_expand, icon_gamepad, icon_poweroff, icon_undo, icon_upload } from '../lib/icons.js'
import { buttonStyles } from '../lib/styles.js'
import './AppDialog'
import { AppElement, css, html, TemplateResult } from './AppElement'
@customElement('dashboard-actions')
export class DashboardActions extends AppElement {
  static get styles () {
    return [
      buttonStyles,
      css`
        #fullscreen-icon {
            display: inline-flex;
        }

        #windowed-icon {
          display: none;
        }

        .peripheral-mode {
          font-size: 80%;
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
    ]
  }

  @state()
    dialog: TemplateResult<1> | undefined = undefined

  render () {
    return html`
    <button @click=${this.reset}>${icon_undo}</button>
    ${this.renderOptionalButtons()}
    <button @click=${this.openRowingGames}>${icon_gamepad}</button>
    <button @click=${this.switchPeripheralMode}>${icon_bluetooth}</button>
    <div class="peripheral-mode">${this.peripheralMode()}</div>
    ${this.dialog ? this.dialog : ''}
  `
  }

  renderOptionalButtons () {
    const buttons = []
    // changing to fullscreen mode only makes sence when the app is openend in a regular
    // webbrowser (kiosk and standalone mode are always in fullscreen view) and if the
    // browser supports this feature
    if (this.appState?.appMode === 'BROWSER' && document.documentElement.requestFullscreen) {
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
    if (this.appState?.appMode === 'KIOSK' && this.appState?.config?.shutdownEnabled) {
      buttons.push(html`
      <button @click=${this.shutdown}>${icon_poweroff}</button>
    `)
    }

    if (this.appState?.config?.stravaUploadEnabled) {
      buttons.push(html`
      <button @click=${this.uploadTraining}>${icon_upload}</button>
    `)
    }
    return buttons
  }

  peripheralMode () {
    const value = this.appState?.config?.peripheralMode
    if (value === 'PM5') {
      return 'C2 PM5'
    } else if (value === 'FTMSBIKE') {
      return 'FTMS Bike'
    } else if (value === 'FTMS') {
      return 'FTMS Rower'
    } else {
      return ''
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

  openRowingGames () {
    this.sendEvent('triggerAction', { command: 'openRowingGames' })
  }

  switchPeripheralMode () {
    this.sendEvent('triggerAction', { command: 'switchPeripheralMode' })
  }

  uploadTraining () {
    const dialogClosed = (event: any) => {
      this.dialog = undefined
      if (event.detail === 'confirm') {
        this.sendEvent('triggerAction', { command: 'uploadTraining' })
      }
    }

    this.dialog = html`
      <app-dialog @close=${dialogClosed}>
        <legend>${icon_upload}<br/>Upload to Strava?</legend>
        <p>Do you want to finish your workout and upload it to Strava?</p>
      </app-dialog>
    `
  }

  shutdown () {
    const dialogClosed = (event: any) => {
      this.dialog = undefined
      if (event.detail === 'confirm') {
        this.sendEvent('triggerAction', { command: 'shutdown' })
      }
    }

    this.dialog = html`
      <app-dialog @close=${dialogClosed}>
        <legend>${icon_poweroff}<br/>Shutdown Open Rowing Monitor?</legend>
        <p>Do you want to shutdown the device?</p>
      </app-dialog>
    `
  }
}

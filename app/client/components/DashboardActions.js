'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the action buttons of the dashboard
*/

import { AppElement, html, css } from './AppElement'
import { customElement } from 'lit/decorators.js'
import { icon_undo, icon_expand, icon_compress, icon_poweroff, icon_bluetooth } from '../lib/icons'

@customElement('dashboard-actions')
export class DashboardActions extends AppElement {
  static get styles () {
    return css`
    `
  }

  render () {
    return html`
      <button @click=${this.reset}>${icon_undo}</button>
      ${this.renderOptionalButtons()}
      <button @click=${this.switchPeripheralMode}>${icon_bluetooth}</button>
      <div class="metric-unit">${this.appState?.metrics?.peripheralMode?.value}</div>
     `
  }

  renderOptionalButtons () {
    const buttons = []
    // changing to fullscreen mode only makes sence when the app is openend in a regular
    // webbrowser (kiosk and standalone mode are always in fullscreen view)
    if (this.appState.appMode === '') {
      buttons.push(html`
      <button @click=${this.toggleFullscreen}>
          <div id="fullscreen-icon">${icon_expand}</div>
          <div id="windowed-icon">${icon_compress}</div>
      </button>
    `)
    }
    // a shutdown button only makes sence when the app is openend as app on a mobile
    // device. at some point we might also think of using this to power down the raspi
    // when we are running in kiosk mode
    if (this.appState.appMode === 'STANDALONE') {
      buttons.push(html`
        <button @click=${this.close} id="close-button">${icon_poweroff}</button>
      `)
    }
    return buttons
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

  close () {
    window.close()
  }

  reset () {
    this.sendEvent('triggerAction', { command: 'reset' })
  }

  switchPeripheralMode () {
    this.sendEvent('triggerAction', { command: 'switchPeripheralMode' })
  }
}

'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders the action buttons of the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement } from 'lit/decorators.js'
import { icon_undo, icon_expand, icon_compress, icon_poweroff, icon_bluetooth } from '../lib/icons.js'

@customElement('dashboard-actions')
export class DashboardActions extends AppElement {
  static styles = css`
    button {
      outline:none;
      background-color: var(--theme-button-color);
      border: 0;
      color: var(--theme-font-color);
      padding: 0.5em 0.9em 0.3em 0.9em;
      margin: 0.2em 0;
      font-size: 60%;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      width: 3.5em;
    }

    #windowed-icon {
      display: none;
    }

    .icon {
      height: 1.8em;
    }

    .peripheral-mode {
      font-size: 80%;
    }

    @media (display-mode: fullscreen) {
      #fullscreen-icon {
        display: none;
      }
      #windowed-icon {
        display: inline;
      }
    }
  `

  render () {
    return html`
      <button @click=${this.reset}>${icon_undo}</button>
      ${this.renderOptionalButtons()}
      <button @click=${this.switchPeripheralMode}>${icon_bluetooth}</button>
      <div class="peripheral-mode">${this.peripheralMode()}</div>
    `
  }

  renderOptionalButtons () {
    const buttons = []
    // changing to fullscreen mode only makes sence when the app is openend in a regular
    // webbrowser (kiosk and standalone mode are always in fullscreen view) and if the
    // browser supports this feature
    if (this.appState.appMode === 'BROWSER' && document.documentElement.requestFullscreen) {
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
        <button @click=${this.close}>${icon_poweroff}</button>
      `)
    }
    return buttons
  }

  peripheralMode () {
    const value = this.appState?.peripheralMode
    if (value === 'PM5') {
      return 'C2 PM5'
    } else if (value === 'FTMSBIKE') {
      return 'FTMS Bike'
    } else {
      return 'FTMS Rower'
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

'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Wrapper for the Open Rowing Monitor rowing games
*/

import { customElement } from 'lit/decorators.js'
import { createRowingGames } from '../arcade/RowingGames.js'
import { icon_exit } from '../lib/icons.js'
import { AppElement, css, html } from './AppElement.js'
@customElement('game-component')
export class GameComponent extends AppElement {
  static styles = css`
    :host {
      width: 100vw;
      height: 100vh;
      display: flex;
    }
    #arcade {
      width: 100vh;
      height: 100vh;
    }
    @media (orientation: portrait) {
      :host {
        flex-direction: column
      }
      #arcade {
        width: 100vw;
        height: 100vw;
      }
    }

    button {
      outline:none;
      background-color: var(--theme-button-color);
      border: 0;
      border-radius: var(--theme-border-radius);
      color: var(--theme-font-color);
      margin: 0.2em 0;
      font-size: 60%;
      text-decoration: none;
      display: inline-flex;
      width: 3.5em;
      height: 2.5em;
      justify-content: center;
      align-items: center;
    }
    button:hover {
      filter: brightness(150%);
    }
    .icon {
      height: 1.7em;
    }
    #controls {
      width: 100%;
      text-align: center;
      position: relative;
    }
    #buttons {
      padding: 0.5em 0 0.5em 0;
      margin: 1vw;
      background: var(--theme-widget-color);
      border-radius: var(--theme-border-radius);
    }
  `
  render () {
    return html`
      <canvas id="arcade"></canvas>
      <div id="controls">
        <div id="buttons">
          <button @click=${this.openDashboard}>${icon_exit}</button>
        </div>
      </div>
    `
  }

  openDashboard () {
    this.sendEvent('triggerAction', { command: 'openDashboard' })
  }

  firstUpdated () {
    const canvas = this.renderRoot.querySelector('#arcade')
    // @ts-ignore
    this.rowingGames = createRowingGames(canvas, canvas.clientWidth, canvas.clientHeight)
  }

  updated (changedProperties) {
    if (changedProperties.has('appState')) {
      if (this.rowingGames !== undefined) {
        this.rowingGames.appState(changedProperties.get('appState'))
      }
    }
  }

  disconnectedCallback () {
    if (this.rowingGames !== undefined) {
      this.rowingGames.dispose()
    }
  }
}

'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Wrapper for the Open Rowing Monitor rowing games
*/

import { customElement } from 'lit/decorators.js'
import { createRowingGames } from '../arcade/RowingGames.js'
import { AppElement, css, html } from './AppElement.js'

@customElement('game-component')
export class GameComponent extends AppElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      display: block;
    }
    #arcade {
      width: 100%;
      height: 100%;
    }
  `
  render () {
    return html`<canvas id="arcade"></canvas>`
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
}

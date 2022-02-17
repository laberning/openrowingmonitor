'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Wrapper for the Open Rowing Monitor rowing games
*/

import { customElement } from 'lit/decorators.js'
import { createRowingGames } from '../arcade/RowingGames.js'
import { icon_bolt, icon_exit, icon_heartbeat, icon_paddle, icon_route, icon_stopwatch } from '../lib/icons.js'
import { buttonStyles } from '../lib/styles.js'
import { AppElement, css, html } from './AppElement.js'
@customElement('game-component')
export class GameComponent extends AppElement {
  static get styles () {
    return [
      buttonStyles,
      css`
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
        div > .icon {
          height: 0.8em;
          width: 1.5em;
        }
        #container {
          width: 100%;
          text-align: left;
          position: relative;
        }
        #widget {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          padding: 0.5em;
          margin: 1vw;
          background: var(--theme-background-color);
          border-radius: var(--theme-border-radius);
        }
        .metric-unit {
          font-size: 80%
        }
        #widget div {
          width: 6.5em;
          white-space: nowrap;
        }
        #buttons {
          padding: 0.5em;
          flex-basis: 100%;
        }
      `
    ]
  }

  render () {
    const metrics = this.appState.metrics
    return html`
      <canvas id="arcade"></canvas>
      <div id="container">
        <div id="widget">
          <!-- todo: should use the same calculations as PerformanceDashboard -->
          <div>${icon_route}${Math.round(metrics.distanceTotal)}<span class="metric-unit">m</span></div>
          <div>${icon_stopwatch}${metrics.splitFormatted}<span class="metric-unit">/500m</span></div>
          <div>${icon_bolt}${Math.round(metrics.powerRaw)}<span class="metric-unit">watt</span></div>
          <div>${icon_paddle}${Math.round(metrics.strokesPerMinute)}<span class="metric-unit">/min</span></div>
          ${metrics?.heartrate ? html`<div>${icon_heartbeat}${Math.round(metrics.heartrate)}<span class="metric-unit">bpm</span></div>` : ''}
          <div>${icon_bolt}${metrics.instantaneousTorque.toFixed(2)}<span class="metric-unit">trq</span></div>
          <div>${icon_bolt}${metrics.powerRatio.toFixed(2)}<span class="metric-unit">ratio</span></div>
          <div>${icon_bolt}${metrics.strokeState}</div>

          <div id='buttons'>
            <button @click=${this.openDashboard}>${icon_exit}</button>
          </div>
        </div>
      </div>
    `
  }

  openDashboard () {
    this.sendEvent('triggerAction', { command: 'openDashboard' })
  }

  firstUpdated () {
    // todo: haven't decided at what resolution to render the game.
    // might use the screen resolution for this, but then the game would look and behave differently
    // depending on the resolution
    // using a square screen has the advantage that it works well on portrait and landscape screens
    // for now will set it to a fixed square resolution and let css take care of scaling it
    const gameSize = 600
    const canvas = this.renderRoot.querySelector('#arcade')
    // this.rowingGames = createRowingGames(canvas, canvas.clientWidth, canvas.clientHeight)
    // @ts-ignore
    this.rowingGames = createRowingGames(canvas, gameSize, gameSize)
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

'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Wrapper for the Open Rowing Monitor rowing games
*/

import { customElement } from 'lit/decorators.js'
import { createRowingGames } from '../arcade/RowingGames.js'
import { icon_bolt, icon_exit, icon_heartbeat, icon_paddle, icon_route, icon_stopwatch } from '../lib/icons.js'
import { metricValue, metricUnit } from '../lib/helper.js'
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
          height: 100%;
          text-align: left;
          position: relative;
        }
        #widget {
          position: absolute;
          bottom: 0;
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
          padding: 0.5em 0.5em 0 0.5em;
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
          <div>${icon_route}${metricValue(metrics, 'distanceTotal')}<span class="metric-unit">${metricUnit(metrics, 'distanceTotal')}</span></div>
          <div>${icon_stopwatch}${metricValue(metrics, 'splitFormatted')}<span class="metric-unit">/500m</span></div>
          <div>${icon_bolt}${metricValue(metrics, 'powerRaw')}<span class="metric-unit">watt</span></div>
          <div>${icon_paddle}${metricValue(metrics, 'strokesPerMinute')}<span class="metric-unit">/min</span></div>
          ${metrics?.heartrate
            ? html`<div>${icon_heartbeat}${metricValue(metrics, 'heartrate')}<span class="metric-unit">bpm</span></div>`
            : ''}
          <div>${icon_bolt}${metricValue(metrics, 'instantaneousTorque')}<span class="metric-unit">trq</span></div>
          <div>${icon_bolt}${metricValue(metrics, 'powerRatio')}<span class="metric-unit">ratio</span></div>
          <div>${icon_bolt}${metricValue(metrics, 'strokeState')}</div>

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

    // This mitigates a problem with delayed app state updates in the kaboom game.
    // If we use the change events from our Web Component to notify the game (i.e. by using the
    // change notifiers available in this component), then the state changes will be processed by the
    // game with a certain delay. This is pretty weird, since they are processed by this component at
    // the correct time. Also when we look at timestamps in the games callback, then it seems that they
    // are called completely in sync with the event and without dely.
    // This problem only occures, when the update events are created from a web request (i.e. by receiving
    // new rowing metrics via web socket).
    // By delivering the app state updates directly here from index.js, this problem does not occure.
    this.sendEvent('setGameStateUpdater', (appState) => { this.gameAppState(appState) })
  }

  gameAppState (appState) {
    if (this.rowingGames) this.rowingGames.appState(appState)
  }

  disconnectedCallback () {
    if (this.rowingGames !== undefined) {
      this.rowingGames.dispose()
    }
  }
}

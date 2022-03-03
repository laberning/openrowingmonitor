/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Main Initialization Component of the Web Component App
*/

import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './components/GameComponent.js'
import './components/PerformanceDashboard.js'
import { createApp } from './lib/app.js'
import { AppState, APP_STATE } from './store/appState.js'

@customElement('web-app')
export class App extends LitElement {
  @state()
    appState: AppState = APP_STATE

  private app: {
    handleAction: (action: object) => void
  }
  private gameStateUpdater?: (state: AppState) => void

  constructor () {
    super()

    this.app = createApp({
      updateState: this.updateState,
      getState: this.getState
      // todo: we also want a mechanism here to get notified of state changes
    })

    // this is how we implement changes to the global state:
    // once any child component sends this CustomEvent we update the global state according
    // to the changes that were passed to us
    this.addEventListener('appStateChanged', (event) => {
      // @ts-ignore
      this.updateState(event.detail)
    })

    // notify the app about the triggered action
    this.addEventListener('triggerAction', (event) => {
      // @ts-ignore
      this.app.handleAction(event.detail)
    })

    // sets the handler to notify games about new app states
    this.addEventListener('setGameStateUpdater', (event) => {
      // @ts-ignore
      this.gameStateUpdater = event.detail
    })
  }

  /**
   * the global state is updated by replacing the appState with a copy of the new state
   * todo: maybe it is more convenient to just pass the state elements that should be changed?
   * i.e. do something like this.appState = { ..this.appState, ...newState }
   * @param {AppState} newState the new state of the application
   */
  updateState = (newState: AppState) => {
    this.appState = { ...newState }
    // notify games about new app state
    if (this.gameStateUpdater) this.gameStateUpdater(this.appState)
  }

  /**
   * return a deep copy of the state to other components to minimize risk of side effects
   * @returns Object
   */
  getState = () => {
    // could use structuredClone once the browser support is wider
    // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
    return JSON.parse(JSON.stringify(this.appState))
  }

  // currently just toggle between games and dashboard, if this gets more complex we might use a router here...
  render () {
    return this.appState?.activeRoute === 'DASHBOARD' ? this.renderDashboard() : this.renderRowingGames()
  }

  renderDashboard () {
    return html`
      <performance-dashboard
        .appState=${this.appState}
      ></performance-dashboard>
    `
  }

  renderRowingGames () {
    return html`
      <game-component
        .appState=${this.appState}
      ></game-component>
    `
  }

  // there is no need to put this initialization component into a shadow root
  createRenderRoot () {
    return this
  }
}

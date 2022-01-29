'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Main Initialization Component of the Web Component App
*/

import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { APP_STATE } from './store/appState.js'
import { createApp } from './lib/app.js'
import './components/PerformanceDashboard.js'

@customElement('web-app')
export class App extends LitElement {
  @state()
    appState = APP_STATE

  @state()
    metrics

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
      this.updateState(event.detail)
    })

    // notify the app about the triggered action
    this.addEventListener('triggerAction', (event) => {
      this.app.handleAction(event.detail)
    })
  }

  // the global state is updated by replacing the appState with a copy of the new state
  // todo: maybe it is more convenient to just pass the state elements that should be changed?
  // i.e. do something like this.appState = { ..this.appState, ...newState }
  updateState = (newState) => {
    this.appState = { ...newState }
  }

  // return a deep copy of the state to other components to minimize risk of side effects
  getState = () => {
    // could use structuredClone once the browser support is wider
    // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
    return JSON.parse(JSON.stringify(this.appState))
  }

  // once we have multiple views, then we would rather reference some kind of router here
  // instead of embedding the performance-dashboard directly
  render () {
    return html`
      <performance-dashboard
        .appState=${this.appState}
        .metrics=${this.metrics}
      ></performance-dashboard>
    `
  }

  // there is no need to put this initialization component into a shadow root
  createRenderRoot () {
    return this
  }
}

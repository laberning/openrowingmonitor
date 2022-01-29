'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Base Component for all other App Components
*/

import { LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { APP_STATE } from '../store/appState.js'
export * from 'lit'

export class AppElement extends LitElement {
  // this is how we implement a global state: a global state object is passed via properties
  // to child components
  @property({ type: Object })
    appState = APP_STATE

  // ..and state changes are send back to the root component of the app by dispatching
  // a CustomEvent
  updateState () {
    this.sendEvent('appStateChanged', this.appState)
  }

  // a helper to dispatch events to the parent components
  sendEvent (eventType, eventData) {
    this.dispatchEvent(
      new CustomEvent(eventType, {
        detail: eventData,
        bubbles: true,
        composed: true
      })
    )
  }
}

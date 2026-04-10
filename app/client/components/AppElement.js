'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Base Component for all other App Components
*/

import { LitElement } from 'lit'
export * from 'lit'

export class AppElement extends LitElement {
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

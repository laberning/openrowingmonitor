'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Base Component for all other App Components
*/

import { LitElement } from 'lit'
export * from 'lit'

export class AppElement extends LitElement {
  // todo: should use shadow root once the global style file is dissolved into the components
  createRenderRoot () {
    return this
  }
}

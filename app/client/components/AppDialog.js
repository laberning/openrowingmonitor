'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders a html dialog
*/

import { customElement, property } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { AppElement, css, html } from './AppElement.js'

@customElement('app-dialog')
export class AppDialog extends AppElement {
  constructor () {
    super()
    this.dialog = createRef()
  }

  static styles = css`
    dialog {
      border: none;
      color: var(--theme-font-color);
      background-color: var(--theme-widget-color);
      border-radius: var(--theme-border-radius);
      box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
      padding: 1.6rem;
      max-width: 80%;
    }
    dialog::backdrop {
      background: none;
      backdrop-filter: contrast(15%) blur(2px);
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
      width: 4em;
      height: 2.5em;
      justify-content: center;
      align-items: center;
    }
    button:hover {
      filter: brightness(150%);
    }

    fieldset {
      border: 0;
      margin: unset;
      padding: unset;
      margin-block-end: 1em;
    }
    ::slotted(*) { font-size: 80%; }
    ::slotted(p) { font-size: 55%; }

    menu {
      display: flex;
      gap: 0.5em;
      justify-content: flex-end;
      margin: 0;
      padding: 0;
    }
  `

  @property({ type: Boolean, reflect: true })
    dialogOpen

  render () {
    return html`
    <dialog ${ref(this.dialog)} @close=${this.close}>
      <form method="dialog">
        <fieldset role="document">
          <slot></slot>
        </fieldset>
        <menu>
          <button value="cancel">Cancel</button>
          <button value="confirm">OK</button>
        </menu>
      </form>
    </dialog>
    `
  }

  close (event) {
    if (event.target.returnValue !== 'confirm') {
      this.dispatchEvent(new CustomEvent('close', { detail: 'cancel' }))
    } else {
      this.dispatchEvent(new CustomEvent('close', { detail: 'confirm' }))
    }
  }

  firstUpdated () {
    // @ts-ignore
    this.dialog.value.showModal()
  }

  updated (changedProperties) {
    if (changedProperties.has('dialogOpen')) {
      if (this.dialogOpen) {
        // @ts-ignore
        this.dialog.value.showModal()
      } else {
        // @ts-ignore
        this.dialog.value.close()
      }
    }
  }
}

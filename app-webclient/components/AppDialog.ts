/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders a html dialog
*/

import { customElement, property } from 'lit/decorators.js'
import { buttonStyles } from '../lib/styles.js'
import { createRef, ref, Ref } from 'lit/directives/ref.js'
import { AppElement, css, html } from './AppElement'

@customElement('app-dialog')
export class AppDialog extends AppElement {
  dialog: Ref<Element>
  constructor () {
    super()
    this.dialog = createRef()
  }

  static get styles () {
    return [
      buttonStyles,
      css`
        button {
          width: 4em;
        }
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
    ]
  }

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

  close (event: any) {
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
}

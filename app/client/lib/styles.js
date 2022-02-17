'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Common styles for UI elements
*/

import { css } from 'lit-element'

export const buttonStyles = css`
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
      width: 3.5em;
      height: 2.5em;
      justify-content: center;
      align-items: center;
    }
    button:hover {
      filter: brightness(150%);
    }
    button .icon {
      height: 1.7em;
    }
  `

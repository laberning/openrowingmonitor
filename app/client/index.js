'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file Main Initialization Component of the Web Component App
 */

import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { APP_STATE } from './store/appState.js'
import { DASHBOARD_METRICS } from './store/dashboardMetrics.js'
import { createApp } from './lib/app.js'
import './components/PerformanceDashboard.js'

// Catch async update errors from Lit 3.x (they are re-fired asynchronously)
window.addEventListener('unhandledrejection', (event) => {
  // eslint-disable-next-line no-console -- Needed for debugging
  console.error('Unhandled promise rejection (may be Lit update error):', event.reason)
})

@customElement('web-app')
export class App extends LitElement {
  @state()
  accessor _appState = APP_STATE

  constructor () {
    super()

    this.app = createApp({
      updateState: this.updateState,
      getState: this.getState
      // todo: we also want a mechanism here to get notified of state changes
    })

    const config = this._appState.config.guiConfigs
    Object.keys(config).forEach((key) => {
      let savedValue = JSON.parse(localStorage.getItem(key))

      // Validate dashboardMetrics against known valid keys
      if (key === 'dashboardMetrics' && Array.isArray(savedValue)) {
        savedValue = savedValue.filter((metric) => DASHBOARD_METRICS[metric] !== undefined)
      }

      config[key] = savedValue ?? config[key]
    })

    // apply theme based on saved preference
    this.applyTheme(config.trueBlackTheme)

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

    // notify the app about the triggered action
    this.addEventListener('changeGuiSetting', (event) => {
      const detail = { ...event.detail }

      // Validate dashboardMetrics against known valid keys before saving
      if (Array.isArray(detail.dashboardMetrics)) {
        detail.dashboardMetrics = detail.dashboardMetrics.filter((metric) => DASHBOARD_METRICS[metric] !== undefined)
      }

      Object.keys(detail).forEach((key) => {
        localStorage.setItem(key, JSON.stringify(detail[key]))
      })
      const newGuiConfigs = {
        ...this._appState.config.guiConfigs,
        ...detail
      }
      this.updateState({
        config: {
          ...this._appState.config,
          guiConfigs: newGuiConfigs
        }
      })
      this.applyTheme(newGuiConfigs.trueBlackTheme)
    })
  }

  applyTheme (trueBlackTheme) {
    if (trueBlackTheme) {
      document.documentElement.setAttribute('data-theme', 'true-black')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // the global state is updated by replacing the appState with a copy of the new state
  // todo: maybe it is more convenient to just pass the state elements that should be changed?
  // i.e. do something like this.appState = { ..this.appState, ...newState }
  updateState = (newState) => {
    this._appState = { ...this._appState, ...newState }
  }

  // return a deep copy of the state to other components to minimize risk of side effects
  getState = () =>
    // could use structuredClone once the browser support is wider
    // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
     JSON.parse(JSON.stringify(this._appState))

  // once we have multiple views, then we would rather reference some kind of router here
  // instead of embedding the performance-dashboard directly
  render () {
    return html`
      <performance-dashboard
        .appState=${{ ...this._appState }}
      ></performance-dashboard>
    `
  }

  // there is no need to put this initialization component into a shadow root
  createRenderRoot () {
    return this
  }
}

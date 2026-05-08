'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders a metric of the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement } from 'chart.js'

/** @type {import('chart.js').Plugin<'line', {positions: number[]}>} */
const divisionLinesPlugin = {
  id: 'divisionLines',
  afterDatasetsDraw (chart, args, options) {
    if (!options.positions?.length) { return }
    const { ctx, chartArea: { top, bottom } } = chart
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 5
    ctx.setLineDash([5, 5])
    options.positions.forEach((xPos) => {
      const xPixel = chart.scales.x.getPixelForValue(xPos)
      ctx.beginPath()
      ctx.moveTo(xPixel, top)
      ctx.lineTo(xPixel, bottom)
      ctx.stroke()
    })
    ctx.restore()
  }
}

Chart.register(ChartDataLabels, Legend, Filler, LinearScale, LineController, PointElement, LineElement, divisionLinesPlugin)

@customElement('dashboard-force-curve')
export class DashboardForceCurve extends AppElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
    }

    .title {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      font-size: 80%;
      text-align: center;
      padding: 0.2em 0;
      z-index: 1;  /* ensures title stays above canvas */
    }

    canvas {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  `

  @property({
    type: Boolean
  })
  accessor updateForceCurve = false

  @property({
    type: Array
  })
  accessor value = []

  /** @type {0 | 2 | 3} */
  @property({
    type: Number
  })
  accessor divisionMode = 0

  @state()
  accessor _chart

  /** @type {0 | 2 | 3} */
  @state()
  accessor _divisionMode = 0

  shouldUpdate (changedProperties) {
    return this.updateForceCurve || changedProperties.has('divisionMode') || this._chart === undefined
  }

  _handleClick () {
    const modes = /** @type {(0 | 2 | 3)[]} */ ([0, 2, 3])
    const nextMode = modes[(modes.indexOf(this.divisionMode) + 1) % modes.length]
    this.sendEvent('changeGuiSetting', { forceCurveDivisionMode: nextMode })
  }

  _updateDivisionLines () {
    if (!this._chart?.options?.plugins) { return }
    const dataLength = this.value?.length || 0
    const positions = this.divisionMode > 0 && dataLength > 0 ?
      Array.from({ length: this.divisionMode - 1 }, (_, i) => ((i + 1) * dataLength) / this.divisionMode) :
      []
    // @ts-ignore - divisionLines is a custom plugin not in Chart.js types
    this._chart.options.plugins.divisionLines.positions = positions
  }

  willUpdate () {
    if (this._chart?.data) {
      this._chart.data.datasets[0].data = this.value?.map((data, index) => ({ y: data, x: index }))
      this._updateDivisionLines()
    }
  }

  // Updated runs _after_ DOM elements exist, which is what chart.js expects.
  updated () {
    this._chart.update()
  }

  firstUpdated () {
    const ctx = this.renderRoot.querySelector('#chart').getContext('2d')
    this._chart = new Chart(
      ctx,
      {
        type: 'line',
        data: {
          datasets: [
            {
              fill: true,
              data: this.value?.map((data, index) => ({ y: data, x: index })),
              pointRadius: 1,
              borderColor: 'rgb(255,255,255)',
              backgroundColor: 'rgb(220,220,220)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              display: false
            },
            legend: {
              display: false
            },
            // @ts-ignore - divisionLines is a custom plugin not in Chart.js types
            divisionLines: {
              positions: []
            }
          },
          scales: {
            x: {
              type: 'linear',
              display: false
            },
            y: {
              ticks: {
                color: 'rgb(255,255,255)'
              }
            }
          },
          animations: {
            tension: {
              duration: 200,
              easing: 'easeInQuad'
            },
            y: {
              duration: 200,
              easing: 'easeInQuad'
            },
            x: {
              duration: 200,
              easing: 'easeInQuad'
            }
          }
        }
      }
    )
  }

  render () {
    return html`
      <!== Only show label if no chart -->
      ${this._chart?.data.datasets[0].data.length ?
        '' :
        html`<div class="title"> Force Curve </div>`
      }
      <canvas @click="${this._handleClick}" id="chart"></canvas>
    `
  }
}

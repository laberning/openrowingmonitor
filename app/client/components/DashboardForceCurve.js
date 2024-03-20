'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders a metric of the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement } from 'chart.js'

@customElement('dashboard-force-curve')
export class DashboardForceCurve extends AppElement {
  static styles = css`
    canvas {
      margin-top: 24px;
    }
  `

  constructor () {
    super()
    Chart.register(ChartDataLabels, Legend, Filler, LinearScale, LineController, PointElement, LineElement)
  }

  @property({ type: Object })
    value = []

  @state()
    _chart

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
              anchor: 'center',
              align: 'top',
              formatter: (value) => `Peak: ${Math.round(value.y)}`,
              display: (ctx) => Math.max(
                ...ctx.dataset.data.map((point) => point.y)
              ) === ctx.dataset.data[ctx.dataIndex].y,
              font: {
                size: 16
              },
              color: 'rgb(255,255,255)'
            },
            legend: {
              title: {
                display: true,
                text: 'Force Curve',
                color: 'rgb(255,255,255)',
                font: {
                  size: 32
                },
                padding: {
                }
              },
              labels: {
                boxWidth: 0,
                font: {
                  size: 0
                }
              }
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
    if (this._chart?.data) {
      this._chart.data.datasets[0].data = this.value?.map((data, index) => ({ y: data, x: index }))
      this.forceCurve = this.value
      this._chart.update()
    }

    return html`
    <canvas id="chart"></canvas>
    `
  }
}

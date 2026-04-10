'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This Module broadcastst the rowing metrics to a MQTT broker
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Integrations.md#recieving-metrics|the description of the metrics provided}
 * Please note: as most brokers get easily flooded by highly frequent reporting, so we only report on a per-stroke basis
 *
 * The MQTT peripheral also allows setting of workout parameters
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Integrations.md#pushing-workouts|the workout setup}
 */
import log from 'loglevel'
import EventEmitter from 'node:events'
import mqtt from 'mqtt'

/**
 * @param {Config} config
 */
export function createMQTTPeripheral (config) {
  const emitter = new EventEmitter()
  const protocol = 'mqtt'
  const host = `${config.mqtt.mqttBroker}`
  const port = '1883'
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
  const metricsTopic = `OpenRowingMonitor/${config.mqtt.machineName}/metrics`
  const workoutsTopic = `OpenRowingMonitor/${config.mqtt.machineName}/workoutplans`
  const connectUrl = `${protocol}://${host}:${port}`
  /**
   * @type {Metrics}
   */
  let lastMetrics = {
    .../** @type {Metrics} */({}),
    timestamp: new Date(),
    interval: { type: 'justrow' },
    sessionState: 'WaitingForStart',
    strokeState: 'WaitingForDrive',
    metricsContext: {
      isMoving: false,
      isDriveStart: false,
      isRecoveryStart: false,
      isSessionStart: false,
      isPauseStart: false,
      isPauseEnd: false,
      isSessionStop: false,
      isIntervalEnd: false,
      isSplitEnd: false
    },
    totalNumberOfStrokes: 0,
    totalMovingTime: 0,
    totalLinearDistance: 0,
    totalCalories: 0,
    split: {
      number: 0
    },
    heartrate: NaN,
    cycleLinearVelocity: 0,
    cyclePace: 0,
    cyclePower: 0,
    driveDuration: NaN,
    driveLength: 0,
    recoveryDuration: NaN,
    cycleDuration: NaN,
    cycleStrokeRate: NaN,
    cycleDistance: NaN,
    drivePeakHandleForce: NaN,
    driveAverageHandleForce: NaN,
    driveHandleForceCurve: [],
    driveHandleVelocityCurve: [],
    driveHandlePowerCurve: [],
    dragFactor: NaN
  }

  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    ...(config.mqtt.username !== '' ? { username: config.mqtt.username } : {}),
    ...(config.mqtt.password !== '' ? { password: config.mqtt.password } : {}),
    reconnectPeriod: 1000
  })

  client.on('connect', () => {
    log.debug(`MQTT Publisher: connected to ${host}, publishing metrics in ${metricsTopic} topic`)
    publishMetrics(lastMetrics)
  })

  client.subscribe([workoutsTopic], () => {
    log.debug(`MQTT Listener: connected to ${host}, listening to ${workoutsTopic} topic`)
  })

  client.on('message', (topic, payload) => {
    // Be aware: application-level input validation of the payload is done centrally at ./engine/utils/workoutSegments.js
    try {
      const parsedData = JSON.parse(payload.toString())
      log.debug('MQTT Listener: Received Message from ', topic, parsedData)
      emitter.emit('control', {
        req: {
          name: 'updateIntervalSettings',
          data: JSON.parse(payload.toString()),
          client: null
        }
      })
    } catch (error) {
      log.debug('MQTT Listener, Error parsing JSON:', payload, error)
    }
  })

  /**
   * @param {Metrics} metrics
   */
  async function notifyData (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        publishMetrics(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        publishMetrics(metrics)
        break
      case (metrics.metricsContext.isIntervalEnd):
        publishMetrics(metrics)
        break
      case (metrics.metricsContext.isPauseStart):
        publishMetrics(metrics)
        break
      case (metrics.metricsContext.isPauseEnd):
        publishMetrics(metrics)
        break
      case (metrics.metricsContext.isSplitEnd):
        publishMetrics(metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        publishMetrics(metrics)
        break
      // no default
    }
    lastMetrics = metrics
  }

  /**
   * @param {Metrics} metrics
   */
  async function publishMetrics (metrics) {
    const jsonMetrics = {
      timestamp: (metrics.timestamp / 1000).toFixed(3),
      intervaltype: metrics.interval.type,
      sessionState: metrics.sessionState,
      strokeState: metrics.strokeState,
      isMoving: metrics.metricsContext.isMoving,
      isDriveStart: metrics.metricsContext.isDriveStart,
      isRecoveryStart: metrics.metricsContext.isRecoveryStart,
      isSessionStart: metrics.metricsContext.isSessionStart,
      isPauseStart: metrics.metricsContext.isPauseStart,
      isPauseEnd: metrics.metricsContext.isPauseEnd,
      isSessionStop: metrics.metricsContext.isSessionStop,
      totalNumberOfStrokes: metrics.totalNumberOfStrokes.toFixed(0),
      totalMovingTime: metrics.totalMovingTime.toFixed(5),
      totalDistance: metrics.totalLinearDistance.toFixed(1),
      totalCalories: metrics.totalCalories.toFixed(1),
      splitNumber: metrics.split.number.toFixed(0),
      heartrate: (metrics.heartrate !== undefined ? metrics.heartrate.toFixed(0) : NaN),
      velocity: (metrics.totalNumberOfStrokes > 0 && metrics.cycleLinearVelocity > 0 ? metrics.cycleLinearVelocity.toFixed(2) : NaN),
      pace: (metrics.totalNumberOfStrokes > 0 && metrics.cyclePace > 0 ? metrics.cyclePace.toFixed(2) : NaN),
      power: (metrics.totalNumberOfStrokes > 0 && metrics.cyclePower > 0 ? metrics.cyclePower.toFixed(0) : NaN),
      driveDuration: (metrics.driveDuration > 0 ? (metrics.driveDuration * 1000).toFixed(0) : NaN),
      driveLength: (metrics.totalNumberOfStrokes > 0 && metrics.driveLength ? metrics.driveLength.toFixed(2) : NaN),
      recoveryDuration: (metrics.recoveryDuration > 0 ? (metrics.recoveryDuration * 1000).toFixed(0) : NaN),
      strokeDuration: (metrics.cycleDuration > 0 ? (metrics.cycleDuration * 1000).toFixed(0) : NaN),
      strokeRate: (metrics.cycleStrokeRate > 0 ? metrics.cycleStrokeRate.toFixed(1) : NaN),
      distancePerStroke: (metrics.cycleDistance > 0 ? metrics.cycleDistance.toFixed(2) : NaN),
      peakHandleForce: (metrics.totalNumberOfStrokes > 0 && metrics.drivePeakHandleForce > 0 ? metrics.drivePeakHandleForce.toFixed(1) : NaN),
      averageHandleForce: (metrics.totalNumberOfStrokes > 0 && metrics.driveAverageHandleForce > 0 ? metrics.driveAverageHandleForce.toFixed(1) : NaN),
      dragfactor: (metrics.dragFactor > 0 ? metrics.dragFactor.toFixed(1) : NaN)
    }

    client.publish(metricsTopic, JSON.stringify(jsonMetrics), { qos: 0, retain: false }, (error) => {
      if (error) {
        log.debug(`MQTT publisher, Error: ${error}`)
      }
    })
  }

  async function destroy () {
    // Publish the last metrics
    await publishMetrics(lastMetrics)
    // Disconnect the client gracefully
    client.end()
  }

  return Object.assign(emitter, {
    notifyData,
    destroy
  })
}

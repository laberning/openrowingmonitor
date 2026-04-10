'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import fs from 'fs/promises'
import { createFileWriter } from './fileWriter.js'
import { createLogRecorder } from './logRecorder.js'
import { createRawRecorder } from './rawRecorder.js'
import { createTCXRecorder } from './tcxRecorder.js'
import { createFITRecorder } from './fitRecorder.js'
import { createRowingDataRecorder } from './rowingDataRecorder.js'
import { createRowsAndAllInterface } from './rowsAndAllInterface.js'
import { createIntervalsInterface } from './intervalsInterface.js'
import { createStravaInterface } from './stravaInterface.js'

export function createRecordingManager (config) {
  let startTime
  let allRecordingsHaveBeenUploaded = true // ToDo: Make this an uploader responsibility!
  const fileWriter = createFileWriter()
  const logRecorder = createLogRecorder()
  const rawRecorder = createRawRecorder()
  const tcxRecorder = createTCXRecorder(config)
  const fitRecorder = createFITRecorder(config)
  const rowingDataRecorder = createRowingDataRecorder(config)
  const rowsAndAllInterface = createRowsAndAllInterface(config)
  const intervalsInterface = createIntervalsInterface(config)
  const stravaInterface = createStravaInterface(config)
  const recordRawData = config.createRawDataFiles
  const recordTcxData = config.createTcxFiles || config.stravaClientId !== ''
  const recordFitData = config.createFitFiles || config.userSettings.intervals.allowUpload || config.userSettings.strava.allowUpload
  const recordRowingData = config.createRowingDataFiles || config.userSettings.rowsAndAll.allowUpload
  let writeTimer
  let uploadTimer

  /**
   * This function handles all incomming commands. As all commands are broadasted to all managers, we need to filter here what is relevant
   * for the recorders and what is not
   *
   * For the 'start', 'startOrResume', 'pause' and 'stop' commands, we await the official SessionManager reaction
   *
   * @param {Command} Name of the command to be executed by the commandhandler
   * @param {unknown} data for executing the command
   *
   * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Architecture.md#command-flow|The command flow documentation}
  */
  async function handleCommand (commandName, data) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        executeCommandsInParralel(commandName, data)
        break
      case ('start'):
        break
      case ('startOrResume'):
        break
      case ('pause'):
        break
      case ('stop'):
        break
      case ('reset'):
        clearTimeout(writeTimer)
        clearTimeout(uploadTimer)
        await executeCommandsInParralel(commandName, data)
        await writeRecordings()
        await uploadRecordings()
        startTime = undefined
        resetRecordings()
        break
      case 'switchBlePeripheralMode':
        break
      case 'switchAntPeripheralMode':
        break
      case 'switchHrmMode':
        break
      case 'refreshPeripheralConfig':
        break
      case 'upload':
        log.debug('RecordingManager: Manual upload requested')
        if (config.userSettings.rowsAndAll.allowUpload && !config.userSettings.rowsAndAll.autoUpload) { await rowsAndAllInterface.uploadSessionResults(rowingDataRecorder) }
        if (config.userSettings.intervals.allowUpload && !config.userSettings.intervals.autoUpload) { await intervalsInterface.uploadSessionResults(fitRecorder) }
        if (config.userSettings.strava.allowUpload && !config.userSettings.strava.autoUpload) { await stravaInterface.uploadSessionResults(fitRecorder) }
        break
      case 'shutdown':
        await executeCommandsInParralel(commandName, data)
        await writeRecordings()
        await uploadRecordings()
        break
      default:
        log.error(`RecordingManager: Recieved unknown command: ${commandName}`)
    }
  }

  async function recordRotationImpulse (impulse) {
    if (startTime === undefined && (recordRawData || recordTcxData || recordFitData || recordRowingData)) {
      await nameFilesAndCreateDirectory()
    }
    if (recordRawData) { await rawRecorder.recordRotationImpulse(impulse) }
  }

  async function recordMetrics (metrics) {
    if (startTime === undefined && (recordRawData || recordTcxData || recordFitData || recordRowingData)) {
      await nameFilesAndCreateDirectory()
    }
    logRecorder.recordRowingMetrics(metrics)
    if (recordRawData) { rawRecorder.recordRowingMetrics(metrics) }
    if (recordTcxData) { tcxRecorder.recordRowingMetrics(metrics) }
    if (recordFitData) { fitRecorder.recordRowingMetrics(metrics) }
    if (recordRowingData) { rowingDataRecorder.recordRowingMetrics(metrics) }
    allRecordingsHaveBeenUploaded = false

    if (metrics.metricsContext.isPauseEnd) {
      clearTimeout(writeTimer)
      clearTimeout(uploadTimer)
    }

    if (metrics.metricsContext.isSessionStop || metrics.metricsContext.isPauseStart) {
      // Cancel any old timers before setting new ones as it makes them impossible to cancel later on
      clearTimeout(writeTimer)
      clearTimeout(uploadTimer)
      writeRecordings()
      const delayTime = 1000 * Math.max(metrics.pauseCountdownTime, 180)
      writeTimer = setTimeout(writeRecordings, (delayTime + 10000))
      uploadTimer = setTimeout(uploadRecordings, (delayTime + 15000))
    }
  }

  async function recordHeartRate (hrmData) {
    logRecorder.recordHeartRate(hrmData)
    if (recordTcxData) { tcxRecorder.recordHeartRate(hrmData) }
    if (recordFitData) { fitRecorder.recordHeartRate(hrmData) }
    if (recordRowingData) { rowingDataRecorder.recordHeartRate(hrmData) }
  }

  async function executeCommandsInParralel (commandName, data) {
    const parallelCalls = []
    parallelCalls.push(logRecorder.handleCommand(commandName, data))
    if (recordRawData) { parallelCalls.push(rawRecorder.handleCommand(commandName, data)) }
    if (recordTcxData) { parallelCalls.push(tcxRecorder.handleCommand(commandName, data)) }
    if (recordFitData) { parallelCalls.push(fitRecorder.handleCommand(commandName, data)) }
    if (recordRowingData) { parallelCalls.push(rowingDataRecorder.handleCommand(commandName, data)) }
    await Promise.all(parallelCalls)
  }

  async function nameFilesAndCreateDirectory () {
    // Determine the filename, directoryname and base filename to be used by all recorders
    startTime = new Date()
    const stringifiedStartTime = startTime.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '')
    const directory = `${config.dataDirectory}/recordings/${startTime.getFullYear()}/${(startTime.getMonth() + 1).toString().padStart(2, '0')}`
    const fileBaseName = `${directory}/${stringifiedStartTime}`

    // Create the directory if needed
    try {
      await fs.mkdir(directory, { recursive: true })
    } catch (error) {
      if (error.code !== 'EEXIST') {
        log.error(`can not create directory ${directory}`, error)
      }
    }

    // Set the base filename for all writers an uploaders
    fileWriter.setBaseFileName(fileBaseName)
    rowsAndAllInterface.setBaseFileName(fileBaseName)
    stravaInterface.setBaseFileName(fileBaseName)
  }

  async function writeRecordings () {
    // The await is necessary to prevent a 'reset' to occur during the writing process caused by the same reset
    if (config.createRawDataFiles) { await fileWriter.writeFile(rawRecorder, config.gzipRawDataFiles) }
    if (config.createRowingDataFiles) { await fileWriter.writeFile(rowingDataRecorder, false) }
    if (config.createFitFiles) { await fileWriter.writeFile(fitRecorder, config.gzipFitFiles) }
    if (config.createTcxFiles) { await fileWriter.writeFile(tcxRecorder, config.gzipTcxFiles) }
  }

  async function uploadRecordings () {
    // The await is necessary to prevent the 'reset' to execute (and thus clear file content!) before the uploads has been completed
    if (allRecordingsHaveBeenUploaded === true) { return }
    if (config.userSettings.rowsAndAll.allowUpload && config.userSettings.rowsAndAll.autoUpload) { await rowsAndAllInterface.uploadSessionResults(rowingDataRecorder) }
    if (config.userSettings.intervals.allowUpload && config.userSettings.intervals.autoUpload) { await intervalsInterface.uploadSessionResults(fitRecorder) }
    if (config.userSettings.strava.allowUpload && config.userSettings.strava.autoUpload) { await stravaInterface.uploadSessionResults(fitRecorder) }
    allRecordingsHaveBeenUploaded = true
  }

  async function resetRecordings () {
    // The await is necessary to prevent writes already occuring during a reset
    if (recordRawData) { await rawRecorder.reset() }
    if (recordTcxData) { await tcxRecorder.reset() }
    if (recordFitData) { await fitRecorder.reset() }
    if (recordRowingData) { await rowingDataRecorder.reset() }
  }

  return {
    handleCommand,
    recordHeartRate,
    recordRotationImpulse,
    recordMetrics
  }
}

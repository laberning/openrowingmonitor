'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module is the interface to the RowsAndAll.com webservice
*/
import log from 'loglevel'
import { createName, createDragLine, createVO2MaxLine, createHRRLine } from './utils/decorators.js'
import fetch, { FormData } from 'node-fetch'

export function createRowsAndAllInterface (config) {
  let basefilename = ''

  async function setBaseFileName (name) {
    basefilename = name
  }

  async function uploadSessionResults (recorder) {
    // we need enough data
    if (!recorder.minimumDataAvailable()) {
      log.info(`${recorder.presentationName} file has not been uploaded to RowsAndAll.com, as there was not enough data recorded`)
      return
    }

    const form = new FormData()

    const sessionName = createName(recorder.totalRecordedDistance(), recorder.totalRecordedMovingTime())
    form.append('title', sessionName)

    const fileContent = await recorder.fileContent()
    const file = new File([fileContent], `${basefilename}${recorder.postfix}.${recorder.type}`, { type: 'text/plain' })
    form.append('file', file)

    form.append('boattype', 'static')
    form.append('workouttype', 'rower')

    const dragLine = createDragLine(recorder.sessionDrag())
    const VO2MaxLine = createVO2MaxLine(recorder.sessionVO2Max())
    log.info(`RowsAndAll HRR Data: ${recorder.sessionHRR()}`)
    const HRRLine = createHRRLine(recorder.sessionHRR())
    const sessionNote = `${dragLine}${VO2MaxLine}${HRRLine}`
    form.append('notes', sessionNote)

    try {
      await fetch('https://rowsandall.com/rowers/api/rowingdata/', {
        method: 'POST',
        headers: {
          'User-Agent': 'curl/7.87.0',
          Authorization: `${config.userSettings.rowsAndAll.apiKey}`
        },
        body: form
      })
      log.info('RowsAndAll interface: uploaded session data')
    } catch (error) {
      log.error(`RowsAndAll interface error: ${error}`)
    }
  }

  return {
    setBaseFileName,
    uploadSessionResults
  }
}

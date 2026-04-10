'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module is the interface to the Intervsals.icu webservice
*/
import log from 'loglevel'
import { createName, createDragLine, createVO2MaxLine, createHRRLine } from './utils/decorators.js'
import fetch, { FormData } from 'node-fetch'

export function createIntervalsInterface (config) {
  let basefilename = ''

  async function setBaseFileName (name) {
    basefilename = name
  }

  async function uploadSessionResults (recorder) {
    // we need enough data
    if (!recorder.minimumDataAvailable()) {
      log.info(`${recorder.presentationName} file has not been uploaded to Intervals.icu, as there was not enough data recorded`)
      return
    }

    const form = new FormData()

    const sessionName = createName(recorder.totalRecordedDistance(), recorder.totalRecordedMovingTime())
    form.append('name', sessionName)

    const fileContent = await recorder.fileContent()
    const file = new File([fileContent], `${basefilename}${recorder.postfix}.${recorder.type}`, { type: 'text/plain' })
    form.append('file', file)

    const dragLine = createDragLine(recorder.sessionDrag())
    const VO2MaxLine = createVO2MaxLine(recorder.sessionVO2Max())
    log.info(`Intervals HRR Data: ${recorder.sessionHRR()}`)
    const HRRLine = createHRRLine(recorder.sessionHRR())
    const sessionNote = `${dragLine}${VO2MaxLine}${HRRLine}`
    form.append('description', sessionNote)

    form.append('type', 'Rowing')
    form.append('trainer', true)
    form.append('indoor', true)
    form.append('moving_time', recorder.totalRecordedMovingTime())
    form.append('distance', recorder.totalRecordedDistance())
    form.append('total_elevation_gain', '0')

    try {
      await fetch(`https://intervals.icu/api/v1/athlete/${config.userSettings.intervals.athleteId}/activities`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`API_KEY:${config.userSettings.intervals.apiKey}`)
        },
        body: form
      })
      log.info('Intervals.icu interface: uploaded session data')
    } catch (error) {
      log.error(`Intervals.icu interface error: ${error}`)
    }
  }

  return {
    setBaseFileName,
    uploadSessionResults
  }
}

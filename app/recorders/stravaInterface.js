'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This Module is the interface to the Strava.com webservice
 * @see {@link https://developers.strava.com/|Official Strava documentation}
 * @see {@link https://gist.github.com/michaellihs/bb262e2c6ee93093485361de282c242d|this practical application}
 */
/* eslint-disable camelcase -- As Strava's url parameters use underscores, not much we can do about it */
import log from 'loglevel'
import { createName, createDragLine, createVO2MaxLine, createHRRLine } from './utils/decorators.js'
import fetch, { FormData } from 'node-fetch'
import { replaceInFile } from 'replace-in-file'

export function createStravaInterface (config) {
  let basefilename = ''

  async function setBaseFileName (name) {
    basefilename = name
  }

  /* eslint-disable max-statements -- Setting up and processing strava communication requires a lot of steps */
  async function uploadSessionResults (recorder) {
    // we need enough data
    if (!recorder.minimumDataAvailable()) {
      log.info(`${recorder.presentationName} file has not been uploaded to Strava.com, as there was not enough data recorded`)
      return
    } else {
      log.info(`Attempting upload to ${recorder.presentationName} file to Strava.com`)
    }

    // ToDo: check if the uploaded file has changed since last upload based on total recorded movingtime

    let response = await fetch('https://www.strava.com/api/v3/oauth/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: config.userSettings.strava.clientId,
        client_secret: config.userSettings.strava.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: config.userSettings.strava.refreshToken
      })
    })

    let responseJson = await response.json()
    const newRefreshToken = responseJson.refresh_token
    const accessToken = responseJson.access_token
    if (newRefreshToken !== config.userSettings.strava.refreshToken) {
      try {
        replaceInFile({
          files: '/opt/openrowingmonitor/config/config.js',
          from: config.userSettings.strava.refreshToken,
          to: newRefreshToken
        })
        log.debug('Strava interface: replaced refresh token in config file')
      } catch (error) {
        log.error('Strava Interface: error replacing refresh token in config file:', error)
      }
    }

    const form = new FormData()
    const sessionName = createName(recorder.totalRecordedDistance(), recorder.totalRecordedMovingTime())
    form.append('name', sessionName)

    const fileContent = await recorder.fileContent()
    const file = new File([fileContent], `${basefilename}${recorder.postfix}.${recorder.type}`, { type: 'text/plain' })
    form.append('file', file)
    form.append('data_type', recorder.type)

    const dragLine = createDragLine(recorder.sessionDrag())
    const VO2MaxLine = createVO2MaxLine(recorder.sessionVO2Max())
    const HRRLine = createHRRLine(recorder.sessionHRR())
    const sessionNote = `${dragLine}${VO2MaxLine}${HRRLine}`
    form.append('description', sessionNote)

    form.append('trainer', true)
    form.append('commute', false)

    try {
      response = await fetch('https://www.strava.com/api/v3/uploads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: form
      })
      log.info('Strava.com interface: uploaded session data')
      responseJson = await response.json()
      log.debug('upload response: %j', responseJson)
    } catch (error) {
      log.error(`Strava.com interface error: ${error}`)
    }
  }
  /* eslint-enable max-statements */

  return {
    setBaseFileName,
    uploadSessionResults
  }
}

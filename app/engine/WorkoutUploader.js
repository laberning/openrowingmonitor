'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Handles uploading workout data to different cloud providers
*/
import log from 'loglevel'
import EventEmitter from 'events'
import { createStravaAPI } from '../tools/StravaAPI.js'
import config from '../tools/ConfigManager.js'

function createWorkoutUploader (workoutRecorder) {
  const emitter = new EventEmitter()

  let stravaAuthorizationCodeResolver
  let requestingClient

  function getStravaAuthorizationCode () {
    return new Promise((resolve) => {
      emitter.emit('authorizeStrava', { stravaClientId: config.stravaClientId }, requestingClient)
      stravaAuthorizationCodeResolver = resolve
    })
  }

  const stravaAPI = createStravaAPI(getStravaAuthorizationCode)

  function stravaAuthorizationCode (stravaAuthorizationCode) {
    if (stravaAuthorizationCodeResolver) {
      stravaAuthorizationCodeResolver(stravaAuthorizationCode)
      stravaAuthorizationCodeResolver = undefined
    }
  }

  async function upload (client) {
    log.debug('uploading workout to strava...')
    try {
      requestingClient = client
      // todo: we might signal back to the client whether we had success or not
      const tcxActivity = await workoutRecorder.activeWorkoutToTcx()
      if (tcxActivity !== undefined) {
        await stravaAPI.uploadActivityTcx(tcxActivity)
        emitter.emit('resetWorkout')
      } else {
        log.error('can not upload an empty workout to strava')
      }
    } catch (error) {
      log.error('can not upload workout to strava:', error.message)
    }
  }

  return Object.assign(emitter, {
    upload,
    stravaAuthorizationCode
  })
}

export { createWorkoutUploader }

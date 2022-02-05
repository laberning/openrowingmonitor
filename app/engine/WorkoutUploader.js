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

  function getStravaAuthorizationCode () {
    return new Promise((resolve) => {
      log.info('please open https://www.strava.com/oauth/authorize?client_id=&response_type=code&redirect_uri=http://localhost/index.html&approval_prompt=force&scope=activity:write')
      emitter.emit('authorizeStrava', { stravaClientId: config.stravaClientId })
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

  async function upload () {
    if (workoutRecorder.canCreateRecordings()) {
      log.debug('uploading workout to strava...')
      await stravaAPI.uploadActivityTcx(await workoutRecorder.activeWorkoutToTcx())
    } else {
      log.debug('workout is shorter than minimum workout time, skipping upload')
    }
  }

  return Object.assign(emitter, {
    upload,
    stravaAuthorizationCode
  })
}

export { createWorkoutUploader }

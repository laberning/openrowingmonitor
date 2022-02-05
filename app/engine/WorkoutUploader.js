'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Handles uploading workout data to different cloud providers
*/
import log from 'loglevel'
import { createStravaAPI } from '../tools/StravaAPI.js'

function createWorkoutUploader (workoutRecorder) {
  function getStravaAuthorizationCode () {
    return new Promise((resolve) => {
      log.info('please open https://www.strava.com/oauth/authorize?client_id=&response_type=code&redirect_uri=http://localhost/index.html&approval_prompt=force&scope=activity:write')
      setTimeout(() => { resolve('') }, 10)
    })
  }

  const stravaAPI = createStravaAPI(getStravaAuthorizationCode)

  async function upload () {
    if (workoutRecorder.canCreateRecordings()) {
      log.debug('uploading workout to strava...')
      await stravaAPI.uploadActivityTcx(await workoutRecorder.activeWorkoutToTcx())
    } else {
      log.debug('workout is shorter than minimum workout time, skipping upload')
    }
  }

  return {
    upload
  }
}

export { createWorkoutUploader }

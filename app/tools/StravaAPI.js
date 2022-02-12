'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements required parts of the Strava API (https://developers.strava.com/)
*/
import zlib from 'zlib'
import FormData from 'form-data'
import { promisify } from 'util'
import { createAuthorizedConnection } from './AuthorizedStravaConnection.js'
const gzip = promisify(zlib.gzip)

function createStravaAPI (getStravaAuthorizationCode) {
  const authorizedStravaConnection = createAuthorizedConnection(getStravaAuthorizationCode)

  async function uploadActivityTcx (tcxRecord) {
    const form = new FormData()

    form.append('file', await gzip(tcxRecord.tcx), tcxRecord.filename)
    form.append('data_type', 'tcx.gz')
    form.append('name', 'Indoor Rowing Session')
    form.append('description', 'Uploaded from Open Rowing Monitor')
    form.append('trainer', 'true')
    form.append('activity_type', 'Rowing')

    return await authorizedStravaConnection.post('/uploads', form)
  }

  async function getAthlete () {
    return (await authorizedStravaConnection.get('/athlete')).data
  }

  return {
    uploadActivityTcx,
    getAthlete
  }
}
export {
  createStravaAPI
}

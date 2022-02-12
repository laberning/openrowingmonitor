'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates an OAuth authorized connection to Strava (https://developers.strava.com/)
*/
import log from 'loglevel'
import axios from 'axios'
import FormData from 'form-data'
import config from './ConfigManager.js'
import fs from 'fs/promises'

const clientId = config.stravaClientId
const clientSecret = config.stravaClientSecret
const stravaTokenFile = './config/stravatoken'

function createAuthorizedConnection (getStravaAuthorizationCode) {
  let accessToken
  let refreshToken

  const authorizedConnection = axios.create({
    baseURL: 'https://www.strava.com/api/v3'
  })

  authorizedConnection.interceptors.request.use(async config => {
    if (!refreshToken) {
      try {
        refreshToken = await fs.readFile(stravaTokenFile, 'utf-8')
      } catch (error) {
        log.info('no strava token available yet')
      }
    }
    // if no refresh token is set, then the app has not yet been authorized with Strava
    // start oAuth authorization process
    if (!refreshToken) {
      const authorizationCode = await getStravaAuthorizationCode();
      ({ accessToken, refreshToken } = await authorize(authorizationCode))
      await writeToken('', refreshToken)
    // otherwise we just need to get a valid accessToken
    } else {
      const oldRefreshToken = refreshToken;
      ({ accessToken, refreshToken } = await getAccessTokens(refreshToken))
      if (!refreshToken) {
        log.error(`strava token is invalid, deleting ${stravaTokenFile}...`)
        await fs.unlink(stravaTokenFile)
      // if the refreshToken has changed, persist it
      } else {
        await writeToken(oldRefreshToken, refreshToken)
      }
    }

    if (!accessToken) {
      log.error('strava authorization not successful')
    }

    Object.assign(config.headers, { Authorization: `Bearer ${accessToken}` })
    if (config.data instanceof FormData) {
      Object.assign(config.headers, config.data.getHeaders())
    }
    return config
  })

  authorizedConnection.interceptors.response.use(function (response) {
    return response
  }, function (error) {
    if (error?.response?.status === 401 || error?.message === 'canceled') {
      return Promise.reject(new Error('user unauthorized'))
    } else {
      return Promise.reject(error)
    }
  })

  async function oAuthTokenRequest (token, grantType) {
    let responsePayload
    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: grantType
    }
    if (grantType === 'authorization_code') {
      payload.code = token
    } else {
      payload.refresh_token = token
    }

    try {
      const response = await axios.post('https://www.strava.com/oauth/token', payload)
      if (response?.status === 200) {
        responsePayload = response.data
      } else {
        log.error(`response error at strava oAuth request for ${grantType}: ${response?.data?.message || response}`)
      }
    } catch (e) {
      log.error(`general error at strava oAuth request for ${grantType}: ${e?.response?.data?.message || e}`)
    }
    return responsePayload
  }

  async function authorize (authorizationCode) {
    const response = await oAuthTokenRequest(authorizationCode, 'authorization_code')
    return {
      refreshToken: response?.refresh_token,
      accessToken: response?.access_token
    }
  }

  async function getAccessTokens (refreshToken) {
    const response = await oAuthTokenRequest(refreshToken, 'refresh_token')
    return {
      refreshToken: response?.refresh_token,
      accessToken: response?.access_token
    }
  }

  async function writeToken (oldToken, newToken) {
    if (oldToken !== newToken) {
      try {
        await fs.writeFile(stravaTokenFile, newToken, 'utf-8')
      } catch (error) {
        log.info(`can not write strava token to file ${stravaTokenFile}`, error)
      }
    }
  }

  return authorizedConnection
}

export {
  createAuthorizedConnection
}

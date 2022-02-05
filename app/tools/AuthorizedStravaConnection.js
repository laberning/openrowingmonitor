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

function createAuthorizedConnection (getStravaAuthorizationCode) {
  const controller = new AbortController()
  let accessToken
  let refreshToken

  const authorizedConnection = axios.create({
    baseURL: 'https://www.strava.com/api/v3',
    signal: controller.signal
  })

  authorizedConnection.interceptors.request.use(async config => {
    if (!refreshToken) {
      try {
        refreshToken = await fs.readFile('./config/stravatoken', 'utf-8')
      } catch (error) {
        log.info('no strava token available yet')
      }
    }
    // if no refresh token is set, then the app has not yet been authorized with Strava
    if (!refreshToken) {
      const authorizationCode = await getStravaAuthorizationCode();
      ({ accessToken, refreshToken } = await authorize(authorizationCode))
    } else {
      ({ accessToken, refreshToken } = await getAccessTokens(refreshToken))
      if (!refreshToken) {
        log.error('strava token is invalid, delete config/stravatoken and try again')
      } else {
        try {
          await fs.writeFile('./config/stravatoken', refreshToken, 'utf-8')
        } catch (error) {
          log.info('can not persist strava token', error)
        }
      }
    }

    if (!accessToken) {
      log.error('strava authorization not successful')
      controller.abort()
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

  return authorizedConnection
}

export {
  createAuthorizedConnection
}

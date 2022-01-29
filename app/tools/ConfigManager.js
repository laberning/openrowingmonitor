'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Merges the different config files and presents the configuration to the application
*/
import defaultConfig from '../../config/default.config.js'
import { deepMerge } from './Helper.js'

async function getConfig () {
  let customConfig
  try {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    customConfig = await import('../../config/config.js')
  } catch (exception) {}

  return customConfig !== undefined ? deepMerge(defaultConfig, customConfig.default) : defaultConfig
}

const config = await getConfig()

export default config

'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Merges the different config files and presents the configuration to the application
*/
import defaultConfig from '../../config/default.config.js'

async function getConfig () {
  let customConfig
  try {
    customConfig = await import('../../config/config.js')
  } catch (exception) {}

  return customConfig !== undefined ? deepMerge(defaultConfig, customConfig.default) : defaultConfig
}

function deepMerge (...objects) {
  const isObject = obj => obj && typeof obj === 'object'

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key]
      const oVal = obj[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal)
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = deepMerge(pVal, oVal)
      } else {
        prev[key] = oVal
      }
    })

    return prev
  }, {})
}

const config = await getConfig()

export default config

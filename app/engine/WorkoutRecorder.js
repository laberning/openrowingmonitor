'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.

  Todo: split this into multiple modules
*/
import log from 'loglevel'
import zlib from 'zlib'
import fs from 'fs/promises'
import xml2js from 'xml2js'
import config from '../tools/ConfigManager.js'
import { promisify } from 'util'
const gzip = promisify(zlib.gzip)

function createWorkoutRecorder () {
  let strokes = []
  let rotationImpulses = []
  let startTime

  function recordRotationImpulse (impulse) {
    if (startTime === undefined) {
      startTime = new Date()
    }
    // impulse recordings a currently only used to create raw data files, so we can skip it
    // if raw data file creation is disabled
    if (config.createRawDataFiles) {
      rotationImpulses.push(impulse)
    }
  }

  function recordStroke (stroke) {
    if (startTime === undefined) {
      startTime = new Date()
    }
    strokes.push(stroke)
  }

  async function createRawDataFile () {
    const stringifiedStartTime = startTime.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '')
    const directory = `${config.dataDirectory}/recordings/${startTime.getFullYear()}/${(startTime.getMonth() + 1).toString().padStart(2, '0')}`
    const filename = `${directory}/${stringifiedStartTime}_raw.csv${config.gzipRawDataFiles ? '.gz' : ''}`
    log.info(`saving session as raw data file ${filename}...`)

    try {
      await fs.mkdir(directory, { recursive: true })
    } catch (error) {
      if (error.code !== 'EEXIST') {
        log.error(`can not create directory ${directory}`, error)
      }
    }
    await createFile(rotationImpulses.join('\n'), filename, config.gzipRawDataFiles)
  }

  async function createTcxFile () {
    const tcxRecord = await activeWorkoutToTcx()
    if (tcxRecord === undefined) {
      log.error('error creating tcx file')
      return
    }
    const directory = `${config.dataDirectory}/recordings/${startTime.getFullYear()}/${(startTime.getMonth() + 1).toString().padStart(2, '0')}`
    const filename = `${directory}/${tcxRecord.filename}${config.gzipTcxFiles ? '.gz' : ''}`
    log.info(`saving session as tcx file ${filename}...`)

    try {
      await fs.mkdir(directory, { recursive: true })
    } catch (error) {
      if (error.code !== 'EEXIST') {
        log.error(`can not create directory ${directory}`, error)
      }
    }

    await createFile(tcxRecord.tcx, `${filename}`, config.gzipTcxFiles)
  }

  async function activeWorkoutToTcx () {
    // we need at least two strokes to generate a valid tcx file
    if (strokes.length < 2) return
    const stringifiedStartTime = startTime.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '')
    const filename = `${stringifiedStartTime}_rowing.tcx`

    const tcx = await workoutToTcx({
      id: startTime.toISOString(),
      startTime,
      strokes
    })

    return {
      tcx,
      filename
    }
  }

  async function workoutToTcx (workout) {
    let versionArray = process.env.npm_package_version.split('.')
    if (versionArray.length < 3) versionArray = [0, 0, 0]
    const lastStroke = workout.strokes[strokes.length - 1]

    const tcxObject = {
      TrainingCenterDatabase: {
        $: { xmlns: 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'xmlns:ns2': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2' },
        Activities: {
          Activity: {
            $: { Sport: 'Other' },
            Id: workout.id,
            Lap: [
              {
                $: { StartTime: workout.startTime.toISOString() },
                TotalTimeSeconds: workout.strokes.reduce((acc, stroke) => acc + stroke.strokeTime, 0).toFixed(1),
                DistanceMeters: lastStroke.distanceTotal.toFixed(1),
                // tcx uses meters per second as unit for speed
                MaximumSpeed: (workout.strokes.map((stroke) => stroke.speed).reduce((acc, speed) => Math.max(acc, speed)) / 3.6).toFixed(2),
                Calories: Math.round(lastStroke.caloriesTotal),
                /* todo: calculate heart rate metrics...
                AverageHeartRateBpm: { Value: 76 },
                MaximumHeartRateBpm: { Value: 76 },
                */
                Intensity: 'Active',
                // todo: calculate average SPM
                // Cadence: 20,
                TriggerMethod: 'Manual',
                Track: {
                  Trackpoint: (() => {
                    let trackPointTime = workout.startTime

                    return workout.strokes.map((stroke) => {
                      trackPointTime = new Date(trackPointTime.getTime() + stroke.strokeTime * 1000)
                      const trackpoint = {
                        Time: trackPointTime.toISOString(),
                        DistanceMeters: stroke.distanceTotal.toFixed(2),
                        Cadence: Math.round(stroke.strokesPerMinute),
                        Extensions: {
                          'ns2:TPX': {
                            // tcx uses meters per second as unit for speed
                            'ns2:Speed': (stroke.speed / 3.6).toFixed(2),
                            'ns2:Watts': Math.round(stroke.power)
                          }
                        }
                      }
                      if (stroke.heartrate !== undefined) {
                        trackpoint.HeartRateBpm = { Value: stroke.heartrate }
                      }
                      return trackpoint
                    })
                  })()
                },
                Extensions: {
                  'ns2:LX': {
                    /* todo: calculate these metrics...
                    'ns2:AvgSpeed': 12,
                    'ns2:AvgWatts': 133,
                    */
                    'ns2:MaxWatts': Math.round(workout.strokes.map((stroke) => stroke.power).reduce((acc, power) => Math.max(acc, power)))
                  }
                }
              }
            ],
            Notes: 'Rowing Session'
          }
        },
        Author: {
          $: { 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance', 'xsi:type': 'Application_t' },
          Name: 'Open Rowing Monitor',
          Build: {
            Version: {
              VersionMajor: versionArray[0],
              VersionMinor: versionArray[1],
              BuildMajor: versionArray[2],
              BuildMinor: 0
            },
            LangID: 'en',
            PartNumber: 'OPE-NROWI-NG'
          }
        }
      }
    }

    const builder = new xml2js.Builder()
    return builder.buildObject(tcxObject)
  }

  async function reset () {
    await createRecordings()
    strokes = []
    rotationImpulses = []
    startTime = undefined
  }

  async function createFile (content, filename, compress = false) {
    if (compress) {
      const gzipContent = await gzip(content)
      await fs.writeFile(filename, gzipContent, (err) => { if (err) log.error(err) })
    } else {
      await fs.writeFile(filename, content, (err) => { if (err) log.error(err) })
    }
  }

  function handlePause () {
    createRecordings()
  }

  async function createRecordings () {
    if (!config.createRawDataFiles && !config.createTcxFiles) {
      return
    }

    if (!minimumRecordingTimeHasPassed()) {
      log.debug('workout is shorter than minimum workout time, skipping automatic creation of recordings...')
      return
    }

    const parallelCalls = []

    if (config.createRawDataFiles) {
      parallelCalls.push(createRawDataFile())
    }
    if (config.createTcxFiles) {
      parallelCalls.push(createTcxFile())
    }
    await Promise.all(parallelCalls)
  }

  function minimumRecordingTimeHasPassed () {
    const minimumRecordingTimeInSeconds = 10
    const rotationImpulseTimeTotal = rotationImpulses.reduce((acc, impulse) => acc + impulse, 0)
    const strokeTimeTotal = strokes.reduce((acc, stroke) => acc + stroke.strokeTime, 0)
    return (Math.max(rotationImpulseTimeTotal, strokeTimeTotal) > minimumRecordingTimeInSeconds)
  }

  return {
    recordStroke,
    recordRotationImpulse,
    handlePause,
    activeWorkoutToTcx,
    reset
  }
}

export { createWorkoutRecorder }

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
import { createVO2max } from './VO2max.js'
import { promisify } from 'util'
const gzip = promisify(zlib.gzip)

function createWorkoutRecorder () {
  let strokes = []
  let rotationImpulses = []
  let postExerciseHR = []
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

  async function createRowingDataFile () {
    const stringifiedStartTime = startTime.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '')
    const directory = `${config.dataDirectory}/recordings/${startTime.getFullYear()}/${(startTime.getMonth() + 1).toString().padStart(2, '0')}`
    const filename = `${directory}/${stringifiedStartTime}_rowingData.csv`
    let currentstroke
    let trackPointTime
    let timestamp
    let i

    log.info(`saving session as RowingData file ${filename}...`)

    // Required file header, please note this includes a typo and odd spaces as the specification demands it!
    let RowingData = ',index, Stroke Number, lapIdx,TimeStamp (sec), ElapsedTime (sec), HRCur (bpm),DistanceMeters, Cadence (stokes/min), Stroke500mPace (sec/500m), Power (watts), StrokeDistance (meters),' +
    ' DriveTime (ms), DriveLength (meters), StrokeRecoveryTime (ms),Speed, Horizontal (meters), Calories (kCal), DragFactor, PeakDriveForce (N), AverageDriveForce (N),' +
    'Handle_Force_(N),Handle_Velocity_(m/s),Handle_Power_(W)\n'

    // Add the strokes
    i = 0
    while (i < strokes.length) {
      currentstroke = strokes[i]
      trackPointTime = new Date(startTime.getTime() + currentstroke.totalMovingTime * 1000)
      timestamp = trackPointTime.getTime() / 1000

      RowingData += `${currentstroke.totalNumberOfStrokes.toFixed(0)},${currentstroke.totalNumberOfStrokes.toFixed(0)},${currentstroke.totalNumberOfStrokes.toFixed(0)},${currentstroke.intervalNumber.toFixed(0)},${timestamp.toFixed(5)},` +
      `${currentstroke.totalMovingTime.toFixed(5)},${(currentstroke.heartrate > 30 ? currentstroke.heartrate.toFixed(0) : NaN)},${currentstroke.totalLinearDistance.toFixed(1)},` +
      `${currentstroke.cycleStrokeRate.toFixed(1)},${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.cyclePace.toFixed(2) : NaN)},${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.cyclePower.toFixed(0) : NaN)},` +
      `${currentstroke.cycleDistance.toFixed(2)},${(currentstroke.driveDuration * 1000).toFixed(0)},${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.driveLength.toFixed(2) : NaN)},${(currentstroke.recoveryDuration * 1000).toFixed(0)},` +
      `${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.cycleLinearVelocity.toFixed(2) : 0)},${currentstroke.totalLinearDistance.toFixed(1)},${currentstroke.totalCalories.toFixed(1)},${currentstroke.dragFactor.toFixed(1)},` +
      `${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.drivePeakHandleForce.toFixed(1) : NaN)},${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.driveAverageHandleForce.toFixed(1) : 0)},"${currentstroke.driveHandleForceCurve.map(value => value.toFixed(2))}",` +
      `"${currentstroke.driveHandleVelocityCurve.map(value => value.toFixed(3))}","${currentstroke.driveHandlePowerCurve.map(value => value.toFixed(1))}"\n`
      i++
    }

    try {
      await fs.mkdir(directory, { recursive: true })
    } catch (error) {
      if (error.code !== 'EEXIST') {
        log.error(`can not create directory ${directory}`, error)
      }
    }
    await createFile(RowingData, `${filename}`, false)
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
    if (strokes.length < 5) return
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
    if (versionArray.length < 3) versionArray = ['0', '0', '0']
    const lastStroke = workout.strokes[strokes.length - 1]
    const drag = workout.strokes.reduce((sum, s) => sum + s.dragFactor, 0) / strokes.length

    // VO2Max calculation for the remarks section
    let VO2maxoutput = 'UNDEFINED'
    const VO2max = createVO2max(config)
    const VO2maxResult = VO2max.calculateVO2max(strokes)
    if (VO2maxResult > 10 && VO2maxResult < 60) {
      VO2maxoutput = `${VO2maxResult.toFixed(1)} mL/(kg*min)`
    }

    // Addition of HRR data
    let hrrAdittion = ''
    if (postExerciseHR.length > 1 && (postExerciseHR[0] > (0.7 * config.userSettings.maxHR))) {
      // Recovery Heartrate is only defined when the last excercise HR is above 70% of the maximum Heartrate
      if (postExerciseHR.length === 2) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM)`
      }
      if (postExerciseHR.length === 3) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM), HRR2: ${postExerciseHR[2] - postExerciseHR[0]} (${postExerciseHR[2]} BPM)`
      }
      if (postExerciseHR.length >= 4) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM), HRR2: ${postExerciseHR[2] - postExerciseHR[0]} (${postExerciseHR[2]} BPM), HRR3: ${postExerciseHR[3] - postExerciseHR[0]} (${postExerciseHR[3]} BPM)`
      }
    }

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
                TotalTimeSeconds: lastStroke.totalMovingTime.toFixed(1),
                DistanceMeters: lastStroke.totalLinearDistance.toFixed(1),
                MaximumSpeed: (workout.strokes.map((stroke) => stroke.cycleLinearVelocity).reduce((acc, cycleLinearVelocity) => Math.max(acc, cycleLinearVelocity))).toFixed(2),
                Calories: Math.round(lastStroke.totalCalories),
                /* ToDo Fix issue with IF-statement not being accepted here?
                if (lastStroke.heartrate !== undefined && lastStroke.heartrate > 30) {
                  AverageHeartRateBpm: VO2max.averageObservedHR(),
                  MaximumHeartRateBpm: VO2max.maxObservedHR,
                  //AverageHeartRateBpm: { Value: (workout.strokes.reduce((sum, s) => sum + s.heartrate, 0) / workout.strokes.length).toFixed(2) },
                  //MaximumHeartRateBpm: { Value: Math.round(workout.strokes.map((stroke) => stroke.power).reduce((acc, heartrate) => Math.max(acc, heartrate))) },
                }
                */
                Intensity: 'Active',
                Cadence: Math.round(workout.strokes.reduce((sum, s) => sum + s.cycleStrokeRate, 0) / (workout.strokes.length - 1)),
                TriggerMethod: 'Manual',
                Track: {
                  Trackpoint: (() => {
                    return workout.strokes.map((stroke) => {
                      const trackPointTime = new Date(workout.startTime.getTime() + stroke.totalMovingTime * 1000)
                      const trackpoint = {
                        Time: trackPointTime.toISOString(),
                        DistanceMeters: stroke.totalLinearDistance.toFixed(2),
                        Cadence: Math.round(stroke.cycleStrokeRate),
                        Extensions: {
                          'ns2:TPX': {
                            'ns2:Speed': stroke.cycleLinearVelocity.toFixed(2),
                            'ns2:Watts': Math.round(stroke.cyclePower)
                          }
                        }
                      }
                      if (stroke.heartrate !== undefined && stroke.heartrate > 30) {
                        trackpoint.HeartRateBpm = { Value: stroke.heartrate }
                      }
                      return trackpoint
                    })
                  })()
                },
                Extensions: {
                  'ns2:LX': {
                    'ns2:Steps': lastStroke.totalNumberOfStrokes.toFixed(0),
                    // please note, the -1 is needed as we have a stroke 0, with a speed and power of 0. The - 1 corrects this.
                    'ns2:AvgSpeed': (workout.strokes.reduce((sum, s) => sum + s.cycleLinearVelocity, 0) / (workout.strokes.length - 1)).toFixed(2),
                    'ns2:AvgWatts': (workout.strokes.reduce((sum, s) => sum + s.cyclePower, 0) / (workout.strokes.length - 1)).toFixed(0),
                    'ns2:MaxWatts': Math.round(workout.strokes.map((stroke) => stroke.cyclePower).reduce((acc, cyclePower) => Math.max(acc, cyclePower)))
                  }
                }
              }
            ],
            Notes: `Indoor Rowing, Drag factor: ${drag.toFixed(1)} 10-6 N*m*s2, Estimated VO2Max: ${VO2maxoutput}${hrrAdittion}`
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
    postExerciseHR = []
    startTime = undefined
  }

  async function createFile (content, filename, compress = false) {
    if (compress) {
      const gzipContent = await gzip(content)
      try {
        await fs.writeFile(filename, gzipContent)
      } catch (err) {
        log.error(err)
      }
    } else {
      try {
        await fs.writeFile(filename, content)
      } catch (err) {
        log.error(err)
      }
    }
  }

  function handlePause () {
    createRecordings()
  }

  async function createRecordings () {
    if (!config.createRawDataFiles && !config.createTcxFiles && !config.createRowingDataFiles) {
      return
    }

    if (!minimumRecordingTimeHasPassed()) {
      log.debug('workout is shorter than minimum workout time, skipping automatic creation of recordings...')
      return
    }

    postExerciseHR = []

    const parallelCalls = []

    if (config.createRawDataFiles) {
      parallelCalls.push(createRawDataFile())
    }
    if (config.createTcxFiles) {
      parallelCalls.push(createTcxFile())
    }
    if (config.createRowingDataFiles) {
      parallelCalls.push(createRowingDataFile())
    }
    await Promise.all(parallelCalls)
  }

  async function updateHRRecovery (hrmetrics) {
    postExerciseHR = hrmetrics
    createTcxFile()
  }

  function minimumRecordingTimeHasPassed () {
    const minimumRecordingTimeInSeconds = 10
    const rotationImpulseTimeTotal = rotationImpulses.reduce((acc, impulse) => acc + impulse, 0)
    if (strokes.length > 0) {
      const strokeTimeTotal = strokes[strokes.length - 1].totalMovingTime
      return (Math.max(rotationImpulseTimeTotal, strokeTimeTotal) > minimumRecordingTimeInSeconds)
    } else {
      return (rotationImpulseTimeTotal > minimumRecordingTimeInSeconds)
    }
  }

  return {
    recordStroke,
    recordRotationImpulse,
    handlePause,
    activeWorkoutToTcx,
    writeRecordings: createRecordings,
    updateHRRecovery,
    reset
  }
}

export { createWorkoutRecorder }

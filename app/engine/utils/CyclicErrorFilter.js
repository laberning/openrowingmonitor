'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This implements a cyclic error filter. This is used to create a profile
 * The filterArray does the calculation, the slope and intercept arrays contain the results for easy retrieval
 * the slopeCorrection and interceptCorrection ensure preventing time dilation due to excessive corrections
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Mathematical_Foundations.md|for the underlying math description)
 */
import loglevel from 'loglevel'
import { createSeries } from './Series.js'
import { createWLSLinearSeries } from './WLSLinearSeries.js'

const log = loglevel.getLogger('RowingEngine')

/**
 * @param {object} rowerSettings - The rower settings configuration object
 * @param {integer} rowerSettings.numOfImpulsesPerRevolution - Number of impulses per flywheel revolution
 * @param {integer} rowerSettings.flankLength - Length of the flank used
 * @param {boolean} rowerSettings.autoAdjustDragFactor - Indicates if the Flywheel.js is allowed to automatically adjust dragfactor (false turns the filter off)
 * @param {float} rowerSettings.systematicErrorAgressiveness - Agressiveness of the systematic error correction algorithm (0 turns the filter off)
 * @param {integer} rowerSettings.systematicErrorNumberOfDatapoints - size of the systematic error correction algorithm filter
 * @param {float} rowerSettings.minimumTimeBetweenImpulses - minimum expected time between impulses (in seconds)
 * @param {float} rowerSettings.maximumTimeBetweenImpulses - maximum expected time between impulses (in seconds)
 * @param {function} deltaTime - injection of the linear regression function used for the drag calculation
 */
export function createCyclicErrorFilter (rowerSettings, deltaTime) {
  const CECFilterEnabled = (rowerSettings.autoAdjustDragFactor && rowerSettings.numOfImpulsesPerRevolution > 1 && rowerSettings.systematicErrorNumberOfDatapoints > 0 && rowerSettings.systematicErrorAgressiveness > 0)
  const _numberOfMagnets = rowerSettings.numOfImpulsesPerRevolution
  const _flankLength = rowerSettings.flankLength
  const _agressiveness = Math.min(Math.max(rowerSettings.systematicErrorAgressiveness, 0), 1.5)
  const _invAgressiveness = Math.min(Math.max(1 - _agressiveness, 0), 1)
  const _numberOfFilterSamples = Math.max(Math.round((rowerSettings.systematicErrorNumberOfDatapoints / _numberOfMagnets)), 5)
  const _minimumTimeBetweenImpulses = rowerSettings.minimumTimeBetweenImpulses
  const _maximumTimeBetweenImpulses = rowerSettings.maximumTimeBetweenImpulses
  const raw = createSeries(_flankLength)
  const clean = createSeries(_flankLength)
  const goodnessOfFit = createSeries(_flankLength)
  const linearRegressor = deltaTime
  const domainBorder = (_minimumTimeBetweenImpulses > 0 ? _minimumTimeBetweenImpulses : 0.0001)
  let recordedRelativePosition = []
  let recordedAbsolutePosition = []
  let recordedRawValue = []
  let filterArray = []
  let slope = []
  let intercept = []
  let startPosition
  let lowerCursor
  let upperCursor
  let slopeSum = _numberOfMagnets
  let interceptSum = 0
  let slopeCorrection = 1
  let interceptCorrection = 0
  resetFilterConfiguration()

  /**
   * @param {float} the raw recorded value to be cleaned up
   * @param {integer} the position of the flywheel
   * @returns {object} result
   * @returns {float} result.clean - the resulting clean value
   * @returns {float} result.goodnessOfFit - The goodness of fit indication for the specific datapoint
   * @description Applies the filter on the raw value for the given position (i.e. magnet). Please note: this function is NOT stateless, it also fills a hystoric buffer of raw and clean values
   */
  function applyFilter (rawValue, position) {
    if (startPosition === undefined) { startPosition = position + _flankLength }
    const magnet = position % _numberOfMagnets
    raw.push(rawValue)

    if (CECFilterEnabled) {
      const cleanValue = projectX(magnet, rawValue)
      clean.push(cleanValue)
      goodnessOfFit.push(filterArray[magnet].goodnessOfFit() * domainFit(rawValue) * domainFit(cleanValue))
    } else {
      // In essence, the filter is turned off
      clean.push(rawValue)
      goodnessOfFit.push(domainFit(rawValue) * domainFit(rawValue))
    }

    return {
      clean: clean.atSeriesEnd(),
      goodnessOfFit: goodnessOfFit.atSeriesEnd()
    }
  }

  /**
   * @param {integer} magnet - the magnet number
   * @param {float} rawValue - the raw value to be projected by the function for that magnet
   * @returns {float} projected result
   */
  function projectX (magnet, rawValue) {
    return (rawValue * slope[magnet] * slopeCorrection) + (intercept[magnet] - interceptCorrection)
  }

  /**
   * @param {float} rawValue - the raw value to be mapped onto the domain
   * @returns {float} an indication of the fit with the domain
   * @description a very crude approach to downgrade the weight outliers bring to the Weighed TS algorithms. Extremely crude, but it works.
   */
  function domainFit (value) {
    switch (true) {
      case (value < _minimumTimeBetweenImpulses):
        // We are below the intended range
        return Math.min(Math.max(1 - ((_minimumTimeBetweenImpulses - value) / domainBorder), 0.001), 1)
      case (value > _maximumTimeBetweenImpulses):
        // We are above the intended range
        return Math.min(Math.max(1 - ((value - _maximumTimeBetweenImpulses) / domainBorder), 0.001), 1)
      default:
        // We are inside the intended range
        return 1
    }
  }

  /**
   * @returns {object} result - provides the (oldest) object at the head of the FiFo buffer, as once returned as a repsonse to the 'applyFilter()' function
   * @returns {float} result.clean - the resulting clean value as once returned
   * @returns {float} result.raw - the initial (raw) datapoint before applying the filter
   * @returns {float} result.goodnessOfFit - The goodness of fit indication for the specific datapoint
   */
  function atSeriesBegin () {
    if (clean.length() >= _flankLength) {
      return {
        clean: clean.atSeriesBegin(),
        raw: raw.atSeriesBegin(),
        goodnessOfFit: goodnessOfFit.atSeriesBegin()
      }
    } else {
      return {
        clean: undefined,
        raw: undefined,
        goodnessOfFit: 0
      }
    }
  }

  /**
   * @param {integer} relativePosition - the position of the recorded datapoint (i.e the sequence number of the datapoint)
   * @param {float} absolutePosition - the total spinning time of the flywheel
   * @param {float} rawValue - the raw value
   */
  function recordRawDatapoint (relativePosition, absolutePosition, rawValue) {
    if (CECFilterEnabled && rawValue >= _minimumTimeBetweenImpulses && _maximumTimeBetweenImpulses >= rawValue) {
      recordedRelativePosition.push(relativePosition)
      recordedAbsolutePosition.push(absolutePosition)
      recordedRawValue.push(rawValue)
    }
  }

  /**
   * @description This processes a next two datapoints from the queue
   */
  function processNextRawDatapoint () {
    let perfectCurrentDt
    let weightCorrectedCorrectedDatapoint
    let GoF

    // If the Filter isn't active, don't even start processing data, as there is nothing there
    if (!CECFilterEnabled || recordedRawValue.length < 1) { return }

    if (lowerCursor === undefined || upperCursor === undefined) {
      lowerCursor = Math.ceil(recordedRelativePosition.length * 0.1)
      upperCursor = Math.floor(recordedRelativePosition.length * 0.9)
    }

    if (lowerCursor < upperCursor && recordedRelativePosition[lowerCursor] > startPosition) {
      perfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[lowerCursor])
      weightCorrectedCorrectedDatapoint = (_invAgressiveness * recordedRawValue[lowerCursor]) + (_agressiveness * perfectCurrentDt)
      GoF = linearRegressor.goodnessOfFit() * linearRegressor.localGoodnessOfFit(lowerCursor)
      updateFilter(recordedRelativePosition[lowerCursor] % _numberOfMagnets, recordedRawValue[lowerCursor], weightCorrectedCorrectedDatapoint, GoF)
    }
    lowerCursor++

    if (lowerCursor < upperCursor && recordedRelativePosition[upperCursor] > startPosition) {
      perfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[upperCursor])
      weightCorrectedCorrectedDatapoint = (_invAgressiveness * recordedRawValue[upperCursor]) + (_agressiveness * perfectCurrentDt)
      GoF = linearRegressor.goodnessOfFit() * linearRegressor.localGoodnessOfFit(upperCursor)
      updateFilter(recordedRelativePosition[upperCursor] % _numberOfMagnets, recordedRawValue[upperCursor], weightCorrectedCorrectedDatapoint, GoF)
    }
    upperCursor--
  }

  /**
   * @description Helper function to actually update the filter and calculate all dependent parameters
   */
  function updateFilter (magnet, rawDatapoint, correctedDatapoint, goodnessOfFit) {
    slopeSum -= slope[magnet]
    interceptSum -= intercept[magnet]
    filterArray[magnet].push(rawDatapoint, correctedDatapoint, goodnessOfFit)
    slope[magnet] = filterArray[magnet].slope()
    slopeSum += slope[magnet]
    if (slopeSum !== 0) { slopeCorrection = _numberOfMagnets / slopeSum }
    intercept[magnet] = filterArray[magnet].intercept()
    interceptSum += intercept[magnet]
    interceptCorrection = interceptSum / _numberOfMagnets
  }

  /**
   * @description This function is used for forcefully clearing the buffers when the buffer is filled with a recovery with too weak GoF
   */
  function forceFlushDatapointBuffer () {
    if (recordedRawValue.length > 1) { log.info('*** Cyclic error filter: cleared datapoint buffer before processing its datapoints has started (recovery GoF was too weak)') }
    clearDatapointBuffer()
  }

  /**
   * @description This function is used for clearing the buffers in order to prepare to record for a new set of datapoints
   */
  function clearDatapointBuffer () {
    // Only clear the buffer if there is something to clear
    if (CECFilterEnabled && recordedRawValue.length > 0) {
      recordedRelativePosition = []
      recordedAbsolutePosition = []
      recordedRawValue = []
      lowerCursor = undefined
      upperCursor = undefined
    }
  }

  /**
   * @description This function is used for clearing the predictive buffers as the flywheel seems to have stopped
   */
  function resetFilterConfiguration () {
    if (slopeSum !== _numberOfMagnets || interceptSum !== 0) { log.debug('*** WARNING: cyclic error filter has configuration forcefully been reset') }
    const noIncrements = _numberOfFilterSamples
    const increment = (_maximumTimeBetweenImpulses - _minimumTimeBetweenImpulses) / noIncrements

    lowerCursor = undefined
    clearDatapointBuffer()

    let i = 0
    let j = 0
    let datapoint = 0
    while (i < _numberOfMagnets) {
      if (i < filterArray.length) {
        filterArray[i]?.reset()
      } else {
        filterArray[i] = createWLSLinearSeries(_numberOfFilterSamples)
      }
      j = 0
      while (j <= noIncrements) {
        // This initializes this filter with an identity function (the clean value will be identical to the raw value), to allow a controlled startup of the filter
        datapoint = _maximumTimeBetweenImpulses - (j * increment)
        filterArray[i].push(datapoint, datapoint, 0.5)
        j++
      }
      slope[i] = 1
      intercept[i] = 0
      i++
    }
    slopeSum = _numberOfMagnets
    interceptSum = 0
    slopeCorrection = 1
    interceptCorrection = 0
    startPosition = undefined
  }

  /**
   * @description This function is used for clearing all buffers (i.e. the currentDt's maintained in the flank and the predictive buffers) when the flywheel is completely reset
   */
  function reset () {
    log.debug('*** WARNING: cyclic error filter is reset')
    slopeSum = _numberOfMagnets
    interceptSum = 0
    resetFilterConfiguration()
    raw.reset()
    clean.reset()
    goodnessOfFit.reset()
  }

  return {
    applyFilter,
    recordRawDatapoint,
    processNextRawDatapoint,
    updateFilter,
    atSeriesBegin,
    forceFlushDatapointBuffer,
    clearDatapointBuffer,
    resetFilterConfiguration,
    reset
  }
}

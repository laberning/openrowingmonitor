'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This Module tests the behaviour of the workout segments
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createWorkoutSegment } from './workoutSegment.js'

const basicConfig = {
  numOfPhasesForAveragingScreenData: 4,
  userSettings: {
    sex: 'male'
  }
}

test('Test workoutSegment initialisation behaviour without setting an interval', () => {
  const startingPoint = {
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0,
    metricsContext: {}
  }

  const testSegment = createWorkoutSegment(basicConfig)
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, undefined)
  testTimeToEnd(testSegment, startingPoint, undefined)
  testTargetTime(testSegment, startingPoint, undefined)
  testTargetDistance(testSegment, startingPoint, undefined)
  testIsEndReached(testSegment, startingPoint, false)
})

test('Test workoutSegment initialisation behaviour without setting an interval, after 2050 meters', () => {
  const startingPoint = {
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0,
    cyclePower: 0,
    cycleLinearVelocity: 0,
    cycleStrokeRate: 0,
    cycleDistance: 0,
    totalCaloriesPerHour: 0,
    dragFactor: 0,
    metricsContext: {}
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 490 * 1000),
    totalMovingTime: 490,
    totalLinearDistance: 2050,
    cyclePower: 200,
    cycleLinearVelocity: 4.16666,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const testSegment = createWorkoutSegment(basicConfig)
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, undefined)
  testTimeToEnd(testSegment, startingPoint, undefined)
  testTargetTime(testSegment, startingPoint, undefined)
  testTargetDistance(testSegment, startingPoint, undefined)
  testIsEndReached(testSegment, startingPoint, false)
  testDistanceFromStart(testSegment, endPoint, 2050)
  testTimeSinceStart(testSegment, endPoint, 490)
  testdistanceToEnd(testSegment, endPoint, undefined)
  testTimeToEnd(testSegment, endPoint, undefined)
  testIsEndReached(testSegment, endPoint, false)
  testSegment.push(endPoint)
  testAverageLinearVelocity (testSegment, endPoint, 4.183673469387755)
  testMaximumLinearVelocity (testSegment, endPoint, 4.16666)
  testMinimumLinearVelocity (testSegment, endPoint, 4.16666)
  testAveragePace (testSegment, endPoint, 119.51219512195122)
  testMaximumPace (testSegment, endPoint, 120.0001920003072)
  testMinimumPace (testSegment, endPoint, 120.0001920003072)
  testAveragePower (testSegment, endPoint, 200)
  testMaximumPower (testSegment, endPoint, 200)
  testMinimumPower (testSegment, endPoint, 200)
})

test('Test workoutSegment behaviour with setting a distance interval', () => {
  const distanceInterval = {
    type: 'distance',
    targetDistance: 2025,
    targetTime: 0,
    split: {
      type: 'distance',
      targetDistance: 500,
      targetTime: 0
    }
  }

  const startingPoint = {
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0,
    cyclePower: 0,
    cycleLinearVelocity: 0,
    cycleStrokeRate: 0,
    cycleDistance: 0,
    totalCaloriesPerHour: 0,
    dragFactor: 100,
    metricsContext: {}
  }

  const middlePoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 480 * 1000),
    totalMovingTime: 480,
    totalLinearDistance: 2000,
    cyclePower: 200,
    cycleLinearVelocity: 4.16666,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 490 * 1000),
    totalMovingTime: 490,
    totalLinearDistance: 2050,
    cyclePower: 200,
    cycleLinearVelocity: 4.16666,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const testSegment = createWorkoutSegment(basicConfig)
  testSegment.setStart(startingPoint)
  testSegment.setEnd(distanceInterval)
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, 2025)
  testTimeToEnd(testSegment, startingPoint, undefined)
  testIsEndReached(testSegment, startingPoint, false)
  testDistanceFromStart(testSegment, middlePoint, 2000)
  testTimeSinceStart(testSegment, middlePoint, 480)
  testdistanceToEnd(testSegment, middlePoint, 25)
  testTimeToEnd(testSegment, middlePoint, undefined)
  testIsEndReached(testSegment, middlePoint, false)
  testDistanceFromStart(testSegment, endPoint, 2050)
  testTimeSinceStart(testSegment, endPoint, 490)
  testdistanceToEnd(testSegment, endPoint, -25)
  testTimeToEnd(testSegment, endPoint, undefined)
  testIsEndReached(testSegment, endPoint, true)
  testInterpolation(testSegment, middlePoint, endPoint, 485, 2025)
  testSegment.push(middlePoint)
  testSegment.push(endPoint)
  testAverageLinearVelocity (testSegment, endPoint, 4.183673469387755)
  testMaximumLinearVelocity (testSegment, endPoint, 4.16666)
  testMinimumLinearVelocity (testSegment, endPoint, 4.16666)
  testAveragePace (testSegment, endPoint, 119.51219512195122)
  testMaximumPace (testSegment, endPoint, 120.0001920003072)
  testMinimumPace (testSegment, endPoint, 120.0001920003072)
  testAveragePower (testSegment, endPoint, 200)
  testMaximumPower (testSegment, endPoint, 200)
  testMinimumPower (testSegment, endPoint, 200)
})

test('Test workoutSegment behaviour with setting a time interval', () => {
  const distanceInterval = {
    type: 'time',
    targetDistance: 0,
    targetTime: 485,
    split: {
      type: 'time',
      targetDistance: 0,
      targetTime: 60
    }
  }

  const startingPoint = {
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0,
    metricsContext: {}
  }

  const middlePoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 480 * 1000),
    totalMovingTime: 480,
    totalLinearDistance: 2000,
    cyclePower: 200,
    cycleLinearVelocity: 4.16666,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 490 * 1000),
    totalMovingTime: 490,
    totalLinearDistance: 2050,
    cyclePower: 200,
    cycleLinearVelocity: 4.16666,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const testSegment = createWorkoutSegment(basicConfig)
  testSegment.setStart(startingPoint)
  testSegment.setEnd(distanceInterval)
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, undefined)
  testTimeToEnd(testSegment, startingPoint, 485)
  testIsEndReached(testSegment, startingPoint, false)
  testDistanceFromStart(testSegment, middlePoint, 2000)
  testTimeSinceStart(testSegment, middlePoint, 480)
  testdistanceToEnd(testSegment, middlePoint, undefined)
  testTimeToEnd(testSegment, middlePoint, 5)
  testIsEndReached(testSegment, middlePoint, false)
  testDistanceFromStart(testSegment, endPoint, 2050)
  testTimeSinceStart(testSegment, endPoint, 490)
  testdistanceToEnd(testSegment, endPoint, undefined)
  testTimeToEnd(testSegment, endPoint, -5)
  testIsEndReached(testSegment, endPoint, true)
  testInterpolation(testSegment, middlePoint, endPoint, 485, 2025)
  testSegment.push(middlePoint)
  testSegment.push(endPoint)
  testAverageLinearVelocity (testSegment, middlePoint, 4.166666666666667)
  testMaximumLinearVelocity (testSegment, middlePoint, 4.16666)
  testMinimumLinearVelocity (testSegment, middlePoint, 4.16666)
  testAveragePace (testSegment, middlePoint, 119.99999999999999)
  testMaximumPace (testSegment, middlePoint, 120.0001920003072)
  testMinimumPace (testSegment, middlePoint, 120.0001920003072)
  testAveragePower (testSegment, middlePoint, 200)
  testMaximumPower (testSegment, middlePoint, 200)
  testMinimumPower (testSegment, middlePoint, 200)
})

test('Test split behaviour when setting a distance interval', () => {
  const distanceInterval = {
    type: 'distance',
    targetDistance: 2025,
    targetTime: 0,
    split: {
      type: 'distance',
      targetDistance: 500,
      targetTime: 0
    }
  }

  const startingPoint = {
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0,
    metricsContext: {}
  }

  const middlePoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 118 * 1000),
    totalMovingTime: 118,
    totalLinearDistance: 490,
    cyclePower: 180,
    cycleLinearVelocity: 4.1,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 122 * 1000),
    totalMovingTime: 122,
    totalLinearDistance: 510,
    cyclePower: 220,
    cycleLinearVelocity: 4.3,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const testSegment = createWorkoutSegment(basicConfig)
  const testSplit = createWorkoutSegment(basicConfig)
  testSegment.setStart(startingPoint)
  testSegment.setEnd(distanceInterval)
  testSplit.setStart(startingPoint)
  testSplit.setEnd(testSegment.getSplit())
  testDistanceFromStart(testSplit, startingPoint, 0)
  testTimeSinceStart(testSplit, startingPoint, 0)
  testdistanceToEnd(testSplit, startingPoint, 500)
  testTimeToEnd(testSplit, startingPoint, undefined)
  testIsEndReached(testSplit, startingPoint, false)
  testDistanceFromStart(testSplit, middlePoint, 490)
  testTimeSinceStart(testSplit, middlePoint, 118)
  testdistanceToEnd(testSplit, middlePoint, 10)
  testTimeToEnd(testSplit, middlePoint, undefined)
  testIsEndReached(testSplit, middlePoint, false)
  testDistanceFromStart(testSplit, endPoint, 510)
  testTimeSinceStart(testSplit, endPoint, 122)
  testdistanceToEnd(testSplit, endPoint, -10)
  testTimeToEnd(testSplit, endPoint, undefined)
  testIsEndReached(testSplit, endPoint, true)
  testInterpolation(testSplit, middlePoint, endPoint, 120, 500)
  testSegment.push(middlePoint)
  testSegment.push(endPoint)
  testAverageLinearVelocity (testSegment, middlePoint, 4.1525423728813555)
  testMaximumLinearVelocity (testSegment, middlePoint, 4.3)
  testMinimumLinearVelocity (testSegment, middlePoint, 4.1)
  testAveragePace (testSegment, middlePoint, 120.40816326530613)
  testMaximumPace (testSegment, middlePoint, 116.27906976744187)
  testMinimumPace (testSegment, middlePoint, 121.95121951219514)
  testAveragePower (testSegment, middlePoint, 200)
  testMaximumPower (testSegment, middlePoint, 220)
  testMinimumPower (testSegment, middlePoint, 180)
})

test('Test split behaviour with setting a time interval', () => {
  const distanceInterval = {
    type: 'time',
    targetDistance: 0,
    targetTime: 485,
    split: {
      type: 'time',
      targetDistance: 0,
      targetTime: 120
    }
  }

  const startingPoint = {
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0,
    metricsContext: {}
  }

  const middlePoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 118 * 1000),
    totalMovingTime: 118,
    totalLinearDistance: 490,
    cyclePower: 200,
    cycleLinearVelocity: 4.16666,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 122 * 1000),
    totalMovingTime: 122,
    totalLinearDistance: 510,
    cyclePower: 200,
    cycleLinearVelocity: 4.16666,
    cycleStrokeRate: 20,
    cycleDistance: 10,
    totalCaloriesPerHour: 800,
    dragFactor: 100,
    metricsContext: {}
  }

  const testSegment = createWorkoutSegment(basicConfig)
  const testSplit = createWorkoutSegment(basicConfig)
  testSegment.setStart(startingPoint)
  testSegment.setEnd(distanceInterval)
  testSplit.setStart(startingPoint)
  testSplit.setEnd(testSegment.getSplit())
  testDistanceFromStart(testSplit, startingPoint, 0)
  testTimeSinceStart(testSplit, startingPoint, 0)
  testdistanceToEnd(testSplit, startingPoint, undefined)
  testTimeToEnd(testSplit, startingPoint, 120)
  testIsEndReached(testSplit, startingPoint, false)
  testDistanceFromStart(testSplit, middlePoint, 490)
  testTimeSinceStart(testSplit, middlePoint, 118)
  testdistanceToEnd(testSplit, middlePoint, undefined)
  testTimeToEnd(testSplit, middlePoint, 2)
  testIsEndReached(testSplit, middlePoint, false)
  testDistanceFromStart(testSplit, endPoint, 510)
  testTimeSinceStart(testSplit, endPoint, 122)
  testdistanceToEnd(testSplit, endPoint, undefined)
  testTimeToEnd(testSplit, endPoint, -2)
  testIsEndReached(testSplit, endPoint, true)
  testInterpolation(testSplit, middlePoint, endPoint, 120, 500)
  testSegment.push(middlePoint)
  testSegment.push(endPoint)
  testAverageLinearVelocity (testSegment, middlePoint, 4.1525423728813555)
  testMaximumLinearVelocity (testSegment, middlePoint, 4.16666)
  testMinimumLinearVelocity (testSegment, middlePoint, 4.16666)
  testAveragePace (testSegment, middlePoint, 120.40816326530613)
  testMaximumPace (testSegment, middlePoint, 120.0001920003072)
  testMinimumPace (testSegment, middlePoint, 120.0001920003072)
  testAveragePower (testSegment, middlePoint, 200)
  testMaximumPower (testSegment, middlePoint, 200)
  testMinimumPower (testSegment, middlePoint, 200)
})

// ToDo: Test the project EndTime and project EndDistance functions

function testDistanceFromStart (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).distance.fromStart === expectedValue, `Expected distance from the start should be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).distance.fromStart}`)
}

function testTimeSinceStart (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).movingTime.sinceStart === expectedValue, `Expected time since start should be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).movingTime.sinceStart}`)
}

function testdistanceToEnd (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).distance.toEnd === expectedValue, `Expected distance from the end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).distance.toEnd}`)
}

function testTimeToEnd (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).movingTime.toEnd === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).movingTime.toEnd}`)
}

function testIsEndReached (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.isEndReached(testedDatapoint) === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.isEndReached(testedDatapoint)}`)
}

function testTargetTime (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).movingTime.target === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).movingTime.target}`)
}

function testTargetDistance (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).distance.target === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).distance.target}`)
}

function testInterpolation (testedSegment, dataPointOne, dataPointTwo, ExpectedTime, ExpectedDistance) {
  assert.ok(testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalMovingTime === ExpectedTime, `Expected extrapolated time be ${ExpectedTime}, encountered ${testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalMovingTime}`)
  assert.ok(testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalLinearDistance === ExpectedDistance, `Expected time to end to be ${ExpectedDistance}, encountered ${testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalLinearDistance}`)
}

function testAverageLinearVelocity (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).linearVelocity.average === expectedValue, `Expected average linear velocity to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).linearVelocity.average}`)
}

function testMaximumLinearVelocity (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).linearVelocity.maximum === expectedValue, `Expected maximum linear velocity to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).linearVelocity.maximum}`)
}

function testMinimumLinearVelocity (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).linearVelocity.minimum === expectedValue, `Expected minimum linear velocity to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).linearVelocity.minimum}`)
}

function testAveragePace (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).pace.average === expectedValue, `Expected average pace to end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).pace.average}`)
}

function testMaximumPace (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).pace.maximum === expectedValue, `Expected maximum pace to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).pace.maximum}`)
}

function testMinimumPace (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).pace.minimum === expectedValue, `Expected minimum pace to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).pace.minimum}`)
}

function testAveragePower (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).power.average === expectedValue, `Expected average power to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).power.average}`)
}

function testMaximumPower (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).power.maximum === expectedValue, `Expected maximum power to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).power.maximum}`)
}

function testMinimumPower (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).power.minimum === expectedValue, `Expected minimum power to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).power.minimum}`)
}

test.run()

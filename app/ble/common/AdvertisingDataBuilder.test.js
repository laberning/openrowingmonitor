'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import log from 'loglevel'
import AdvertisingDataBuilder from './AdvertisingDataBuilder.js'
log.setLevel(log.levels.SILENT)

test('empty constructor should create default values', () => {
  // arrange
  const advertisementDataBuilder = new AdvertisingDataBuilder()

  // act

  // assert
  assert.type(advertisementDataBuilder.appearance, 'undefined')
  assert.equal(advertisementDataBuilder.longName, 'OpenRowingMonitor')
  assert.equal(advertisementDataBuilder.shortName, 'ORM', 'if longName is not defined short name should be ORM')
  assert.equal(advertisementDataBuilder.serviceUuids.length, 0)
})

test('should use long name as short name if latter is not set', () => {
  // arrange
  const advertisementDataBuilder = new AdvertisingDataBuilder([], undefined, 'testLongName')

  // act

  // assert
  assert.equal(advertisementDataBuilder.shortName, advertisementDataBuilder.longName)
})

test('should be able to set long name', () => {
  // arrange
  const advertisementDataBuilder = new AdvertisingDataBuilder()
  const name = 'longNameTest'
  // act
  advertisementDataBuilder.setLongName(name)

  // assert
  assert.equal(advertisementDataBuilder.longName, name)
})

test('should be able to set short name', () => {
  // arrange
  const advertisementDataBuilder = new AdvertisingDataBuilder()

  const name = 'shortNameTest'
  // act
  advertisementDataBuilder.setShortName(name)

  // assert
  assert.equal(advertisementDataBuilder.shortName, name)
})

test('should be able to set appearance field', () => {
  // arrange
  const advertisementDataBuilder = new AdvertisingDataBuilder()

  const appearance = 1157
  // act
  advertisementDataBuilder.setAppearance(appearance)

  // assert
  assert.equal(advertisementDataBuilder.appearance, appearance)
})

test('should be able to add service UUID', () => {
  // arrange
  const advertisementDataBuilder = new AdvertisingDataBuilder()

  // act
  advertisementDataBuilder.addServiceUuid('1800')
  advertisementDataBuilder.addServiceUuid('1801')

  // assert
  assert.equal(advertisementDataBuilder.serviceUuids.length, 2)
})

test('should add long name to scan data', () => {
  // arrange
  const name = 'testLongName'
  const advertisementDataBuilder = new AdvertisingDataBuilder(['1800'], undefined, name, 'short')

  // act
  const scanData = advertisementDataBuilder.buildScanData()

  // assert
  assert.equal(scanData.length, name.length + 2)
})

test('should produce correct byte array for advertising data', () => {
  // arrange
  const advertisementDataBuilder = new AdvertisingDataBuilder(['1816'], 1156, 'ORM')

  // act
  const advertisementData = advertisementDataBuilder.buildAppearanceData()
  // assert
  assert.equal([...advertisementData], [2, 1, 6, 3, 25, 132, 4, 4, 8, 79, 82, 77, 3, 3, 22, 24]
  )
})

test('should trim short name if advertising data is longer than 31 byte', () => {
  // arrange
  const advertisementDataBuilder = new AdvertisingDataBuilder(['1816'], 1156, 'OpenRowingMonitor CSC')

  // act
  const advertisementData = advertisementDataBuilder.buildAppearanceData()

  // assert
  assert.equal(advertisementData.length, 31)
  assert.equal([...advertisementData], [2, 1, 6, 3, 25, 132, 4, 19, 8, 79, 112, 101, 110, 82, 111, 119, 105, 110, 103, 77, 111, 110, 105, 116, 111, 114, 32, 3, 3, 22, 24])
  assert.match(advertisementData.toString(), /OpenRowingMonitor/)
})

test.run()

'use strict'

import BufferBuilder from '../BufferBuilder.js'

export const sensorLocations =
{
  other: 0,
  topOfShoe: 1,
  inShoe: 2,
  hip: 3,
  frontWheel: 4,
  leftCrank: 5,
  rightCrank: 6,
  leftPedal: 7,
  rightPedal: 8,
  frontHub: 9,
  rearDropout: 10,
  chainstay: 11,
  rearWheel: 12,
  rearHub: 13,
  chest: 14,
  spider: 15,
  chainRing: 16
}

export const SensorLocationAsBuffer = () => {
  const sensorLocationBuffer = new BufferBuilder()
  sensorLocationBuffer.writeUInt8(sensorLocations.other)
  return sensorLocationBuffer.getBuffer()
}

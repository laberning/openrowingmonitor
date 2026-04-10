/**
 * @typedef {{
 * req?: {
 *   name: Command,
 *   data: unknown
 * }
 * }} ControlPointEvent
 */
/**
 * @typedef {(event: ControlPointEvent) => boolean} ControlPointCallback
 */
/**
 * @typedef {Partial<import('../ble-host.interface.js').GattServerCharacteristic> & {name: string}} GattServerCharacteristicFactory
 */
/**
 * @typedef {Partial<import('../ble-host.interface.js').GattServerService> & { name: string }} GattServerServiceFactory
 */
/**
 * @typedef {{
 * heartrate?: number,
 * rrIntervals: Array<number>,
 * energyExpended?: number,
 * hasContact?: boolean
 * batteryLevel?: number,
 * manufacturerId?: number | string,
 * serialNumber?: number | string
 * }} HeartRateMeasurementEvent
 */

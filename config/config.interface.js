/**
 * @typedef {Object} MQTTConfig
 * @property {string} mqttBroker - The MQTT broker address.
 * @property {string} username - The username for MQTT broker authentication.
 * @property {string} password - The password for MQTT broker authentication.
 * @property {string} machineName - The name of the machine.
 */
/**
 * @typedef {Object} UserSettings
 * @property {number} restingHR - The resting heart rate of the user.
 * @property {number} maxHR - The maximum observed heart rate during the last year.
 * @property {number} minPower - The minimum power a rower can produce.
 * @property {number} maxPower - The maximum power a rower can produce.
 * @property {number} distanceCorrectionFactor - The effect that doubling the distance has on the maximum achievable average pace.
 * @property {number} weight - The weight of the rower in kilograms.
 * @property {string} sex - The sex of the rower ("male" or "female").
 * @property {boolean} highlyTrained - Indicates if the user is highly trained.
 * @property {Object} rowsAndAll - Configuration for the RowsAndAll.com upload.
 * @property {boolean} rowsAndAll.upload - Indicates if the data should be uploaded to RowsAndAll.com.
 * @property {string} rowsAndAll.apiKey - The API key for RowsAndAll.com.
 * @property {Object} intervals - Configuration for the intervals.icu upload.
 * @property {boolean} intervals.upload - Indicates if the data should be uploaded to intervals.icu.
 * @property {string} intervals.athleteId - The athlete ID for intervals.icu.
 * @property {string} intervals.apiKey - The API key for intervals.icu.
 */
/**
 * @typedef {"trace"|"debug"|"info"|"warn"|"error"|"silent"} LogLevels
 * @typedef {'FTMS'|'FTMSBIKE'|'PM5'|'CSC'|'CPS'|'OFF'} BluetoothModes
 * @typedef {'FE'|'OFF'} AntPlusModes
 * @typedef {'ANT'|'BLE'|'OFF'} HeartRateModes
 */
/**
 * @typedef {Object} Config
 * @property {Object} loglevel - The log levels configuration.
 * @property {LogLevels} loglevel.default - The default log level.
 * @property {LogLevels} loglevel.RowingEngine - The log level for the rowing engine.
 * @property {LogLevels} loglevel.Peripherals - The log level for peripherals.
 * @property {number} gpioPin - The GPIO pin used to read sensor data.
 * @property {number} gpioPriority - The system level priority of the thread that measures the rotation speed of the flywheel.
 * @property {number} gpioPollingInterval - The interval at which the GPIO is inspected for state changes.
 * @property {string} gpioTriggeredFlank - The flank to be detected by the GPIO detection.
 * @property {number} gpioMinimumPulseLength - The minimum pulse length in microseconds.
 * @property {number} appPriority - The system level priority of the thread that processes the flywheel and HR data.
 * @property {BluetoothModes} bluetoothMode - The Bluetooth Low Energy Profile that is broadcasted to external peripherals and apps.
 * @property {AntPlusModes} antPlusMode - The ANT+ mode that is broadcasted to external peripherals and apps.
 * @property {HeartRateModes} heartRateMode - The heart rate monitor mode.
 * @property {string} ftmsRowerPeripheralName - The name used to announce the FTMS Rower via Bluetooth Low Energy.
 * @property {string} ftmsBikePeripheralName - The name used to announce the FTMS Bike via Bluetooth Low Energy.
 * @property {number} webUpdateInterval - The interval for updating all web clients in milliseconds.
 * @property {number} ftmsUpdateInterval - The interval between updates of the Bluetooth devices in milliseconds.
 * @property {number} pm5UpdateInterval - The interval between updates of the clients using PM5 Bluetooth profile in milliseconds.
 * @property {MQTTConfig} mqtt - The MQTT peripheral configuration settings.
 * @property {number} numOfPhasesForAveragingScreenData - The number of stroke phases used to smoothen the data displayed on screens.
 * @property {string} dataDirectory - The directory in which to store user-specific content.
 * @property {boolean} createTcxFiles - Indicates if the training sessions should be stored as Garmin TCX files.
 * @property {boolean} createFitFiles - Indicates if the training sessions should be stored as Garmin fit files.
 * @property {boolean} createRowingDataFiles - Indicates if the (in-)stroke data should be stored in OpenRowingData CSV files.
 * @property {boolean} createRawDataFiles - Indicates if the raw sensor data should be stored in CSV files.
 * @property {boolean} gzipTcxFiles - Indicates if gzip compression should be applied to the recorded TCX training sessions file.
 * @property {boolean} gzipFitFiles - Indicates if gzip compression should be applied to the recorded fit training sessions file.
 * @property {boolean} gzipRawDataFiles - Indicates if gzip compression should be applied to the raw sensor data recording files.
 * @property {UserSettings} userSettings - The settings used for the VO2 Max calculation embedded in the TCX file comments.
 * @property {RowerProfile} rowerSettings - The rower specific settings.
 * @property {string} shutdownCommand - The command to shutdown the device via the user interface.
 * @property {string} stravaClientId - The "Client ID" of your Strava API Application.
 * @property {string} stravaClientSecret - The "Client Secret" of your Strava API Application.
 */

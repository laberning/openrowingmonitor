'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This file contains the default configuration of the Open Rowing Monitor.

  !!! Note that changes to this file will be OVERWRITTEN when you update to a new version
  of Open Rowing Monitor. !!!

  To change the settings you should modify the 'config/config.js' file. Simply copy the
  options that you would like to change into that file. If 'config.js' does not exist, you
  can use the example file from the 'install' folder.
*/
import rowerProfiles from './rowerProfiles.js'

export default {
  // Available log levels: trace, debug, info, warn, error, silent
  loglevel: {
    // The default log level
    default: 'info',
    // The log level of of the rowing engine (stroke detection and physics model)
    RowingEngine: 'warn'
  },

  // Defines the GPIO Pin that is used to read the sensor data from the rowing machine
  // see: https://www.raspberrypi.org/documentation/usage/gpio for the pin layout of the device
  // If you want to use the internal pull-up resistor of the Raspberry Pi you should
  // also configure the pin for that in /boot/config.txt, i.e. 'gpio=17=pu,ip'
  // see: https://www.raspberrypi.org/documentation/configuration/config-txt/gpio.md
  gpioPin: 17,

  // Enable this to boost or reduce the system level priority of the thread that measures the rotation
  // speed of the flywheel. This might improve the precision of the measurements (especially
  // on rowers with a fast spinning flywheel).
  // This is the Linux NICE level: minimum setting is +19, theoretical maximum setting is -20
  // Setting this below -1 on a non-PREEMPT kernel might cause the app to crash
  // Going beyond -7 on a PREEMPT kernel seems to kill the timing of the app
  // 0 keeps the systems default value.
  // Also note that you will require root permissions if you set anything other than 0 here
  gpioPriority: 0,

  // GPIO polling interval: this is the interval at which the GPIO is inspected for state
  // changes on the gpioPin, in microseconds (us).
  // Valid values are 1 (i.e. 1,000,000 samples per second), 2 (i.e. 500,000 per second),
  // 4 (i.e. 250,000 per second), 5 (i.e. 200,000 per second) and 10 (i.e. 100,000 per second).
  // A high sample rate will burden your CPU more. Normal value is 5us.
  // A raspberry pi 4 can handle a polling interval of 1 us, which results in a 16% CPU load.
  gpioPollingInterval: 5,

  // Type of flank: what flank should be detected by the GPIO detection?
  // Valid values are 'Up' for the upward flank, 'Down' for the downward flank, 'Both' for both flanks
  // In practice, it shouldn't matter much which flank you detect, although in the presence of debounce,
  // a specific flank might provide better filtering capabilities.
  // Some machines are even capable of using both, but this requires a strong symmetry in the signal.
  gpioTriggeredFlank: 'Up',

  // Minumum pulse length in microseconds. This is the minimum pulse length (i.e. a magnet should be
  // present) before Open Rowing Monitor considers it a signal valid. Increasing this value reduces ghost readings
  // due to bouncing reed switches etc., which typically are detected as very short measurements in the raw logs.
  // Making this too long results in missed impulses. Both can be detected in the raw logs easily.
  // Normal value is 50 us, but for some rowers, values up to 500 us are known to work.
  gpioMinimumPulseLength: 50,

  // Enable this to boost or reduce the system level priority of the thread that processes the flywheel and HR data
  // Although this process is not time critical per se, it could get caught up in Linux housekeeping tasks, preventing
  // it to process data in a timely manner.
  // This is the Linux NICE level: minimum setting is +19, theoretical maximum setting is -20
  // Setting this below -1 on a non-PREEMPT kernel might cause the app to crash
  // Going beyond -5 on a PREEMPT kernel seems to kill the timing of the app
  // 0 keeps the systems default value.
  // Please make sure the app has a less high priority than gpioPriority
  // Also note that you will require root permissions if you set anything other than 0 here
  appPriority: 0,

  // Selects the Bluetooth Low Energy Profile that is broadcasted to external peripherals and apps. Supported modes:
  // - PM5: the Concept2 PM5 emulator (not functionally complete yet)
  // - FTMS: the FTMS profile for rowing machines
  // - FTMSBIKE: The FTMS profile is used by Smart Bike Trainers (please note: the speed and power are still aimed for rowing, NOT for a bike!)
  // - CPS: The BLE Cycling Power Profile simulates a bike for more modern Garmin watches
  // - CSC: The BLE Cycling Speed and Cadence Profile simulates a bike for older Garmin watches
  // - OFF: Turns Bluetooth advertisement off
  bluetoothMode: 'FTMS',

  // Selects the heart rate monitor mode. Supported modes:
  // - BLE: Use Bluetooth Low Energy to connect Heart Rate Monitor (Will currently connect to the first device found)
  // - ANT: Use Ant+ to connect Heart Rate Monitor
  // - OFF: turns of Heart Rate Monitor discovery
  heartRateMode: 'BLE',

  // Defines the name that is used to announce the FTMS Rower via Bluetooth Low Energy (BLE)
  // Some rowing training applications expect that the rowing device is announced with a certain name
  ftmsRowerPeripheralName: 'OpenRowingMonitor',

  // Defines the name that is used to announce the FTMS Bike via Bluetooth Low Energy (BLE)
  // Most bike training applications are fine with any device name
  ftmsBikePeripheralName: 'OpenRowingBike',

  // The interval for updating all web clients (i.e. the monitor) in miliseconds
  // Advised is to update at least once per second (1000 ms), to make sure the timer moves nice and smoothly.
  // Around 100 ms results in a very smooth update experience for distance as well
  // Please note that a smaller value will use more network and cpu ressources
  webUpdateInterval: 200,

  // Interval between updates of the bluetooth devices (miliseconds)
  // Advised is to update at least once per second, as consumers expect this interval
  // Some apps, like EXR like a more frequent interval of 200 ms to better sync the stroke
  peripheralUpdateInterval: 1000,

  // The number of stroke phases (i.e. Drive or Recovery) used to smoothen the data displayed on your
  // screens (i.e. the monitor, but also bluetooth devices, etc.) and recorded data. A nice smooth experience is found at 6
  // phases, a much more volatile (but more accurate and responsive) is found around 3. The minimum is 2,
  // but for recreational rowers that might feel much too restless to be useful
  numOfPhasesForAveragingScreenData: 6,

  // The directory in which to store user specific content
  // currently this directory holds the recorded training sessions
  dataDirectory: 'data',

  // Stores the training sessions as TCX files
  createTcxFiles: true,

  // Stores the (in-)stroke data in OpenRowingData CSV files
  createRowingDataFiles: true,

  // Stores the raw sensor data in CSV files
  createRawDataFiles: false,

  // Apply gzip compression to the recorded tcx training sessions file (tcx.gz)
  // This will drastically reduce the file size of the files (only around 4% of the original file)
  // Some training tools can directly work with gzipped tcx file, however for most training websites
  // you will have to unzip the files before uploading
  gzipTcxFiles: false,

  // Apply gzip compression to the raw sensor data recording files (csv.gz)
  gzipRawDataFiles: true,

  // EXPERIMENTAL: Settings used for the VO2 Max calculation that is embedded in the tcx file comments
  userSettings: {

    // The resting Heartrate of the user, to filter abnomral HR values
    restingHR: 40,

    // The maximum observed heartrate during the last year. If unknown, you can use maxHr = 220 - age
    // This is used for filtering abnormal HR values and to project the maximum power a rower produces
    maxHR: 190,

    // The minimum power a rower can produce, used for filtering abnormal power values
    minPower: 50,

    // The maximum power a rower can produce, used for filtering abnormal power values
    maxPower: 500,

    // The effect that doubling the distance has on the maximum achievable average pace. The proposed 5 is based on Paul's law,
    // which states that doubling the distance leads to a slowdown in pace of 5 seconds. This value can be adapted if you know
    // your PR (this pace) on both a 1000 meters and on 2000 meters, by substracting the pace.
    distanceCorrectionFactor: 5,

    // The weight of the rower in kilograms
    weight: 80,

    // The sex of the rower, as it is needed for Concept 2's calculation
    // This can be "male" or "female"
    sex: 'male',

    // See for this definition: https://www.concept2.com/indoor-rowers/training/calculators/vo2max-calculator
    highlyTrained: false
  },

  // The rower specific settings. Either choose a profile from config/rowerProfiles.js or
  // define the settings individually. If you find good settings for a new rowing device
  // please send them to us (together with a raw recording of 10 strokes) so we can add
  // the device to the profiles.
  // !! Only change this setting in the config/config.js file, and leave this on DEFAULT as that
  // is the fallback for the default profile settings
  rowerSettings: rowerProfiles.DEFAULT,

  // command to shutdown the device via the user interface, leave empty to disable this feature
  shutdownCommand: 'halt',

  // Configures the connection to Strava (to directly upload workouts to Strava)
  // Note that these values are not your Strava credentials
  // Instead you have to create a Strava API Application as described here:
  // https://developers.strava.com/docs/getting-started/#account and use the corresponding values
  // When creating your Strava API application, set the "Authorization Callback Domain" to the IP address
  // of your Raspberry Pi
  // WARNING: if you enabled the network share via the installer script, then this config file will be
  // exposed via network share on your local network. You might consider disabling (or password protect)
  // the Configuration share in smb.conf
  // The "Client ID" of your Strava API Application
  stravaClientId: '',

  // The "Client Secret" of your Strava API Application
  stravaClientSecret: ''
}

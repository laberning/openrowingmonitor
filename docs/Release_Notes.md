# OpenRowingMonitor Release Notes

## From 0.8.4 to 0.9.0 (January 2024)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris) and [Abasz](https://github.com/Abasz)

### New functionality in 0.9.0

- Added support for ANT+ rowing metrics broadcast
- Allow the user to change the GUI layout and metrics, including displaying the force curve
- Allow user to turn on or off ANT+ and BLE functionality and dynamically switch between ANT+ and BLE HR monitors from the GUI
- Added the option for more complex workouts, as a hook for the PM5 and webinterface (these are a ToDo where the PM5 workout interface is still in development)
- Added reporting of PM5 Interval-types to the PM5

### Bugfixes and robustness improvements in 0.9.0

- Added a configuration sanity check which logs obvious errors and (if possible) repairs settings, after several users messed up their config and got completely stuck.
- The configuration sanity check also provides an automated upgrade path for 0.8.2 (old config) users to 0.9.0 (new config), as all the newly added configuration items between these two versions are automatically detected, logged and repaired.
- Added restart limits to prevent infinite boot loops of the app crashing and rebooting when there is a config error
- Fixed the GPIO tick rollover, which led to a minor hickup in data in rows over 30 minutes
- Made Flywheel.js more robust against faulty GPIO data
- Fixed an application crash in the RowingData generation when the target directory doesn't exist yet
- Improved the structure of the peripherals to allow a more robust BLE and ANT use
- Improved the accuracy, responsiveness and efficiency of both the Linear and Quadratic the Theil-Sen algorithms. For larger 'flankLength' machines, this will result in 50% reduction in CPU use, while increasing the responsiveness and accuracy of the forcecurve and powercurve.
- Drag calculation and recovery slope calculation are now down with Linear Theil-Sen algorithm, making this calculation more robust against outliers
- Validation of the engine against a PM5 for over 3000KM, where the deviation is a maximum of 0.03%

## From 0.8.2 to 0.8.4 (January 2023)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris) and [Abasz](https://github.com/Abasz)

### New Functionality in 0.8.4

- New Metrics: Force curve, Peak force, average force, power curve, handle speed curve, VO2Max (early beta), Heart Rate Recovery. All have over 1000 kilometers of testing under their belt, and have sown to work reliably;
- Improved metrics through BLE: Based on the new engine, many metrics are added to both FTMS Rower and PM5, making it as complete as it can be. Most metrics also have over a 1000 km of testing with EXR, and both types of interface have been used with EXR intensly.
- New export format: There is a RowingData export, which can export all metrics in .csv, which is accepted by both RowingData and RowsAndAll. It is also useable for users to read their data into Excel. This export brings the force curve to users, although it will require a small subscription to see it;
- Simpler set-up: a better out-of-the-box experience for new users. We trimmed the number of required settings, and for many cases we’ve succeeded: several settings are brought down to their key elements (like a minimal handle force, which can be set more easily fror all rowers) or can be told by looking at the logs (like the recovery slope). For several other settings, their need to set them perfectly has been reduced, requiring less tweaking before Open Rowing Monitor starts producing good data. To support this, there also is a new setup document, to help users set up their own rower;
- Switch to 64Bit: ORM supports the 64 Bit core, which has a PREEEMPT-kernel. The setup-script accepts this as well, as this should be the preferred kernel to use. The PREEMPT-kernel is optimized for low latency measurements, like IoT applications. As PREEMPT kernels can handle a lot higher priority for the GPIO-thread, this setting has been switched from a binary setting to a priority setting.
- An initial stub for session mangement: As a first step towards sessions and splits, a session object in Server.js is added as a placeholder for session targets. If unfilled, the code will act as in version 0.8.2: you can row without any limitations. If a target is set, it will termintate the session at the exact right time. As is with the PM5, ORM counts down if a target is set. The current stub isn't ideal yet, as we want the user to be able to set these targets through the webGUI or through BLE. However, it is a first step towards functional completeness as it lays a preliminary foundation for such functionality.

### Bugfixes and robustness improvements in 0.8.4

- Totally renewed rowing engine: Linear and Quadratic Regression models are now the core of the rowing engine. This model is much more robust against noise, and thus removing the need for any noise filtering from OpenRowingMonitor for any of the known rowers. In the over 1000 kilometers of testing, it has proven to work extremely reliable and robust;
- Improved logging: the logging has been more focussed on helping the user fix a bad setting. I removed several metrics, but added several others as they tell much more about the underlying state of the engine and its settings (for example the drive time and drive length). Goal is to have users be able to tune their engine based on the log.
- Finite State Machine based state management: OpenRowingEngine will now maintain an explicit state for the rower, and RowingStatistics will maintain an explicit state for the session. Aside reducing the code complexity significantly, it greatly impoved robustness.
- Added a new GPIO-library, making measurement of the flywheel data much more accurate and allowing to "debounce" the measurements, as many sensors have this issue

## From 0.8.1 to 0.8.2 (Febuary 2022)

Main contributor: [Lars Berning](https://github.com/laberning)

### New Functionality in 0.8.2

- Added Strava support

## From 0.8.0 to 0.8.1 (September 2021)

Main contributor: [Jaap van Ekris](https://github.com/JaapvanEkris)

### Bugfixes and robustness improvements in 0.8.1

- Refactoring of the Rowing Engine, as [Dave Vernooy's engine (ErgWare)](https://dvernooy.github.io/projects/ergware/) is good, but its variable naming leaves a bit to be desired.

## 0.7.0 (March 2021)

Initial release, Main contributor: [Lars Berning](https://github.com/laberning), based on [Dave Vernooy's physics engine (ErgWare)](https://dvernooy.github.io/projects/ergware/)

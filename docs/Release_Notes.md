# OpenRowingMonitor Release Notes

## Version 0.9.7 (April 2026)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris), [Abasz](https://github.com/Abasz), [DXCanas](https://github.com/DXCanas), [NickOldfield](https://github.com/NickOldfield), [cwklurks](https://github.com/cwklurks) and [klamp169](https://github.com/klamp169)

### New functionality in 0.9.7

- **Addition of the 'Calories' workout type**. You can now program Intervals and splits based on calories to be burned
- **GUI Improvements**:
  - The GUI now has dark (OLED) mode,
  - The layout is more efficient and it has new tiles for Peak Force and Ratio
  - You can now set single distance/time/calories workouts directly from the GUI by tapping on the relevant tile
- **Fit-file improvements**:
  - We added a lot of metrics to the FIT-file, bringing it up to par to the RowingData file, in anticipation of intervals.icu improvements
  - The fit-file now also has splits, which makes the fit-file closer to a native Garmin recording of the same session

### Newly supported rowers in 0.9.7

- Added full support for the Merarch R50 (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/140))
- Added full support for the Oartec Slider (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/218))
- Added full support for the Schwinn Windrigger (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/159))
- Added full support for the Topiom V2 (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/144))

For an overview of all supported machines and their support status, please look at the [supported rower list](https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Supported_Rowers.md)

### Bugfixes and robustness improvements in 0.9.7

- **Introduction of the flywheel systematic error filter**, this filter can handle systematic errors of magnet positioning on the flywheel. This is more effective at reducing structural measurement noise than the previously used smoothing filter and allows a reduction of the code complexity in `Flyhweel.js` as all dependent algorithms can use the same datastream. It reduces noise on the reference system from 1.5% (version 0.9.6) to 0.3% (version 0.9.7) (see [this explanation](https://github.com/JaapvanEkris/openrowingmonitor/discussions/151))
- **Improvement of the Moving Least Squares regressor**:
  - Code refactoring to isolate this function from `Flywheel.js`, allowing a more thorough testing of this function's behaviour
  - Introduced the 'Local Goodness of Fit' function to improve the robustness against noise. This reduces the effect of outliers on stroke detection, the Force curve, Power curve and Handle speed curve
  - Introduction of a 'Gaussian Weight' filter to reduce the effects of flanks on the regression in a specific datapoint
  - Added documentation about the mathematical foundations of the algorithms used
- **Fix of the Garmin bluetooth issues** which affected the 'Cycling Power' and 'Cycling Speed and Cadence' Bluetooth profiles (see [issue 125](https://github.com/JaapvanEkris/openrowingmonitor/issues/125), [issue 169](https://github.com/JaapvanEkris/openrowingmonitor/issues/169) and the [known issues in 0.9.6](#known-issues-in-096)).
- **Brought the Bluetooth FTMS interface further into specification**: several bugfixes in the communication to prevent miscommunication between OpenRowingMonitor and the client
- **Fixed issue where Apple HR apps would crash ORM**: Fixed an issue where apple HR data would crash OpenRowingMonitor, (see [issue 221](https://github.com/JaapvanEkris/openrowingmonitor/issues/221)).
- **Fixed a bug in the initialisation of the `Flywheel.js`**
- **Improved logging in the Strava uploader** for better troubleshooting (see [issue 145](https://github.com/JaapvanEkris/openrowingmonitor/issues/145))
- **Fixed a bug where VO2Max calculation missed heartrate data** (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/156))
- **Improved the memory usage of the webkiosk**: We replaced Firefox with a heavily tuned Chrome install, reducing memory usage and surpressed memory warnings regardless (see [issue 130](https://github.com/JaapvanEkris/openrowingmonitor/issues/130))
- **Fixed a bug in the install script**:
  - as an adaptation to newer versions of Raspberry OS, we now depend less on the user 'pi' being present (see [issue 135](https://github.com/JaapvanEkris/openrowingmonitor/issues/135) and [issue 155](https://github.com/JaapvanEkris/openrowingmonitor/issues/155))
  - some package now disables Bluetooth by default. Our installation procedure automatically enables it again (see [issue 206](https://github.com/JaapvanEkris/openrowingmonitor/issues/206))
- **Increased the test coverage of key algorithms**
- As usual, all **packages are updated to the newest versions**

### Known issues in 0.9.7

- **ErgData will not work well with our PM5 emulation** (see [issue 117](https://github.com/JaapvanEkris/openrowingmonitor/issues/117)).

## Version 0.9.6 (June 2025)

Main contributors: [Abasz](https://github.com/Abasz) and [Jaap van Ekris](https://github.com/JaapvanEkris)

Beta testers: [fkh-bims](https://github.com/fkh-bims), [jryd2000](https://github.com/jryd2000) and [carlito1979](https://github.com/carlito1979)

### New functionality in 0.9.6

- **Major upgrade of our PM5 interface**, bringing it much closer to the official PM5 interface specification: apps like [ErgZone](https://Erg.Zone), [EXR](https://exrgame.com) and many others now work in PM5 mode in most scenarios (there are [some known limitations](#known-issues-in-096)). This allows you to set up a workout in the session manager with ease, have force curves presented and record the data (adresses [this request](https://github.com/JaapvanEkris/openrowingmonitor/discussions/78)).
- **Added [RowsAndAll.com](https://rowsandall.com) and [intervals.icu](https://intervals.icu) integration** for workout reporting (i.e. automatic uploading of a result).
- **Added a MQTT peripheral**. This reports metrics live to MQTT brokers and control home automation, etc. (see [this discussion](https://github.com/laberning/openrowingmonitor/discussions/43), [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/80) and [this request](https://github.com/JaapvanEkris/openrowingmonitor/discussions/98)). The MQTT listener you to push workout plans to OpenRowingMonitor from home automation systems (see [the integrations page](Integrations.md) for more information).

### Bugfixes and robustness improvements in 0.9.6

- **Simplified Strava integration**, which now is in line with the rest of the integrations (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/64)) and greatly simplifying the backend-architecture
- **Rewrite of the entire bluetooth stack**, greatly improving stability and removing limitations. This also fixes the issue that heartrate device can't be switched dynamically (adresses [the known limitation of version 0.9.5](#known-issues-in-095), reported in [this bug](https://github.com/JaapvanEkris/openrowingmonitor/issues/69), [this feature request](https://github.com/JaapvanEkris/openrowingmonitor/discussions/93) and [this bug report](https://github.com/JaapvanEkris/openrowingmonitor/issues/94).
- **Fixed a bug in pause behaviour** for magnetic rowers causing them to sttop permanently (fixes [this bug](https://github.com/JaapvanEkris/openrowingmonitor/discussions/96)).
- **Fixed a bug in the metrics presentation**, which caused some metrics presented/recorded to be averaged too much.
- **Fixed a bug in restart behaviour** that made the recorders crash (fixes [this bug](https://github.com/JaapvanEkris/openrowingmonitor/discussions/100)).
- **Upgraded ESLint and its configuration**, our code is inspected beyond the use of spaces.
- **Introducing JSDoc** in our code, to make our code easier to understand ([see also](https://github.com/JaapvanEkris/openrowingmonitor/issues/90)).
- **Upgrade npm packages and node.js**: we cleaned house by removing a lot of unneeded npm packages, upgraded npm packages where we could and upgraded to Node.js v22 (current) to increase support. This makes our stack current and fixes some security vulnerabilities.
- We **moved from Chromium to Firefox** for the webkiosk service as it greatly reduces the CPU load, practically freeing up a complete CPU core.

### Known issues in 0.9.6

- Our PM5 interface still has some minor limitations:
  - ErgZone and similar apps also can set a **'Calories' based workout. This interval type is still on [our backlog](./backlog.md#soon)**, so it currently isn't supported yet. The PM5 interface will fail silently and will **not** send an error message on this.
  - **ErgData will not work well with our PM5 interface**: sometimes it can program OpenRowingMonitor, but you will **not** be able to save your workout, as we can't create the cryptographic hash to upload the workout results. This also causes a deadlock that hangs communication at both ends (kill the ErgData app to resolve this). As ErgData is propriatary to Concept2, we have decided to **not** put in any effort to resolve this (see [issue 117](https://github.com/JaapvanEkris/openrowingmonitor/issues/117)).
- **Some Garmin watches have issues with our 'Cycling Power' and 'Cycling Speed and Cadence' Bluetooth profiles** as a result of a change on their side in handling unencrypted Bluetooth commmunication. This affects all current and past versions of OpenRowingMonitor, and might be caused by Garmin (see [issue 125](https://github.com/JaapvanEkris/openrowingmonitor/issues/125)).

## Version 0.9.5 (February 2025)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris) and [Abasz](https://github.com/Abasz)

### New functionality in 0.9.5

- Added **FIT-File support**: you can now automatically generate a FIT-file after a rowing session, which allows for a more detailed reporting than the tcx-format, and is commonly accepted by most platforms (see [issue 59](https://github.com/JaapvanEkris/openrowingmonitor/issues/59)).
- **Introduction of the session manager**, which provides support for intervals, splits, rest intervals and spontaneous pauses in the session and also adds these to the FIT, tcx and RowingData recordings. Please note, setting predetermined intervals and splits in a user friendly way (via PM5 emulator and webinterface) is still on [our backlog](./backlog.md#soon).
- **Improvement of Magnetic rower support**: the new session manager makes sure that the session is nicely stopped, even when the flywheel has stopped quite abruptly before pause timeouts have time to kick in. This is the case on some magnetic rowers which have an extreme high drag, resulting in very short spin down times of their flywheel.

### Newly supported rowers in 0.9.5

- Added support for the KayakFirst kayak/canoe erg

### Bugfixes and robustness improvements in 0.9.5

- **Improvement of the architecture**: we cleaned up the old architecture and moved to a more message bus structure where clients are responsible for listening to the data transmissions they are interested in. See [the architecture description](Architecture.md) for a deep-dive of the implementation. Key benefit is that this is more maintainable as it allows serving data more easily to totally different clients (webGUI, recorders and BLE/ANT+) with totally different needs, making future enhancements easier.
- **Improvement of Bluetooth stability**: as a temporary fix we moved from abandonware's NoBle/BleNo Bluetooth implementation to stoprocent's implementation, as that package is better maintained and works better with newer installs of BlueZ. This should fix some issues on Raspberry Pi Bookworm. Unfortunately, none of the NoBle/BleNo descendants are immune to some specific BlueZ issues (see [known issues](#known-issues-in-095)).
- **Performance improvement of the TS estimator**, further reducing CPU load, which significantly improves accuracy of the measurements and metrics as the Linux kernel has an easier job keeping the time accurate.
- **Removed a lot of memory leaks**, although only being problematic in large simulations (i.e. over 3000K), we want to keep our code to behave nice
- **Improved robustness of the stroke detection algorithm**

### Known issues in 0.9.5

- **Bluetooth Heartrate can't be switched dynamically**: due to some underlying OS changes, BLE heartrate monitors can't be activated through the GUI without crashing the BLE metrics broadcast (see [the description of issue 69](https://github.com/JaapvanEkris/openrowingmonitor/issues/69)). As this is an issue in the OS, all current and previous versions of OpenRowingMonitor are also affected by this issue. Version 0.9.5 has a workaround implemented: configuring the use of a BLE heartrate monitor in the config file should work. However, dynamic switching via the GUI will crash the BLE connections. This issue has been resolved in version 0.9.6.

## Version 0.9.0 (January 2024)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris), [Abasz](https://github.com/Abasz) and [carlito1979](https://github.com/carlito1979)

### New functionality in 0.9.0

- **Added support for ANT+ rowing metrics broadcast**, allowing the use of smartwatches for recording and analysing workouts.
- **Allow the user to change the GUI layout and metrics**, including displaying the force curve and support for larger screens
- **Allow user to turn on or off ANT+ and BLE functionality** and dynamically switch between ANT+ and BLE HR monitors from the GUI
- **Added the option for more complex workouts**, as an initial hook for the PM5 and webinterface (these are on [our backlog](./backlog.md#soon))

### Newly supported rowers in 0.9.0

- Added full support for the Concept2 Model B and C (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/49))
- Added full support for the Concept2 Model D and RowErg (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/84))
- Added support for the Force USA R3

### Bugfixes and robustness improvements in 0.9.0

- **Added support for the newest version of Raspberry Pi OS (Bookworm)**, moved from Node.js v16 (EOL) to Node.js v20 (current) and upgraded packages where possible.
- **Improved the accuracy, responsiveness and efficiency** of both the Linear and Quadratic Theil-Sen algorithms. For larger 'flankLength' machines, this results in 50% reduction in CPU use, while increasing the responsiveness and accuracy of the resulting forcecurve and powercurve.
- **Drag calculation and recovery slope calculation are more robust against outliers and stroke detection errors** by also moving them to the Linear Theil-Sen algorithm.
- **Added a configuration sanity check** which logs obvious errors and (if possible) repairs settings, after several users messed up their config and got completely stuck. This configuration sanity check also provides an automated upgrade path for 0.8.2 (old config) users to 0.9.0 (new config), as all the newly added configuration items between these two versions are automatically detected, logged and repaired.
- **Added restart limits** to prevent infinite boot loops of the app crashing and rebooting when there is a config error
- **Fixed the GPIO tick rollover**, which led to a minor hickup in data in rows over 30 minutes
- **Made `Flywheel.js` more robust** against faulty GPIO data
- **Fixed a lot of small memory leaks** which were to untidy closure of dynamic data structures. Although this wasn't encountered in regular training sessions, it did show in long simulations (over 10.000K);
- **Fixed an application crash** in the RowingData generation when the target directory doesn't exist yet;
- **Improved the structure of the peripherals** to allow a more robust BLE and ANT use
- **Validation of the engine against a PM5 for over 3000KM**, where the deviation is a maximum of 0.1%

### Removed support in 0.9.0

- **Support has been dropped for the Raspberry Pi Zero W**, as WebAssembly will not work on Node.js V16 on ArmV6, and other core packages require at least Node V18 to function on newer versions of the Raspberry Pi OS (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/33))

## Version 0.8.4 (January 2023)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris) and [Abasz](https://github.com/Abasz)

### New Functionality in 0.8.4

- **New Metrics**: With the new rowing engine, new metrics are introduced, including Force curve, Peak force, average force, power curve, handle speed curve, VO2Max (early beta), Heart Rate Recovery. All have over 1000 kilometers of testing under their belt, and have shown to work reliably;
- **Added Cycling Power Profile and Cycling Speed/Cadence bluetooth profiles** for compatibility with more smartwatches
- **Improved metrics through BLE FTMS and BLE C2-PM5**: Based on the new engine, many metrics are added to both FTMS Rower and PM5, making them as complete as they can be. Most metrics also have over a 1000 km of testing with EXR, and both types of interface have been used with EXR intensly.
- **New export format**: There is a RowingData export, which can export all metrics in .csv, which is accepted by both RowingData and RowsAndAll. It is also useable for users to read their data into Excel. This export brings the force curve to users, although it will require a small subscription to see it in RowsAndAll;
- **Simpler set-up**: a better out-of-the-box experience for new users. We trimmed the number of required settings, and for many cases we’ve succeeded: several settings are brought down to their key elements (like a minimal handle force, which can be set more easily for all rowers) or can be told by looking at the logs (like the recovery slope). For several other settings, their need to set them perfectly has been reduced, requiring less tweaking before OpenRowingMonitor starts producing good data. To support this, there also is a new setup document, to help users set up their own rower;
- **An initial stub for session management**: As a first step towards sessions and splits, a session object in `Server.js` is added as a placeholder for session targets. If a target is set, it will termintate the session at the exact right time. As is with the PM5, ORM counts down if a target is set. You can't set these targets through the webGUI or through BLE yet. However, it is a first step towards functional completeness as it lays a preliminary foundation for such functionality.

### Bugfixes and robustness improvements in 0.8.4

- **Totally redesigned rowing engine**: Linear and Quadratic Regression models are now the core of the rowing engine, leaving the classical numerical approximation model. The new model is much more robust against noise, and completely removes the need for noise filtering from OpenRowingMonitor.
- **Switch to 64Bit**: OpenRowingMonitor supports the 64 Bit Lite core, which has a PREEEMPT-kernel. The setup-script accepts this as well, as this should be the preferred kernel to use. The PREEMPT-kernel is optimized for low latency measurements, like IoT applications. As PREEMPT kernels can handle a lot higher priority for the GPIO-thread, this setting has been switched from a binary setting to a priority setting.
- **Improved logging**: the logging has been more focussed on helping the user fix a bad setting, focussing on the underlying state of the engine and its settings (for example the drive time and drive length). Goal is to have users be able to tune their engine based on the log.
- **Finite State Machine based state management**: `RowingEngine.js` will now maintain an explicit state for the rower, and `RowingStatistics.js` will maintain an explicit state for the session. Aside reducing the code complexity significantly, it greatly impoves robustness.
- **Added a new GPIO-library**, making measurement of the flywheel data much more accurate and allowing to "debounce" the measurements, as many sensors have this issue (see [issue 85](https://github.com/laberning/openrowingmonitor/issues/85))

## Version 0.8.2 (Febuary 2022)

Main contributor: [Lars Berning](https://github.com/laberning)

### New Functionality in 0.8.2

- Added Strava support

## Version 0.8.1 (September 2021)

Main contributor: [Jaap van Ekris](https://github.com/JaapvanEkris)

### Newly supported rowers in 0.8.1

- Added support for the NordicTrack RX800

### Bugfixes and robustness improvements in 0.8.1

- **Refactoring of the Rowing Engine**, as [Dave Vernooy's engine (ErgWare)](https://dvernooy.github.io/projects/ergware/) is good, but its variable naming left a bit to be desired. The underlying physics has been described in [the physics of OpenRowingMonitor](physics_openrowingmonitor.md), and is largely based on the work of [Dave Vernooy](https://dvernooy.github.io/projects/ergware/) and [Anu Dudhia](http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html).

## Version 0.7.0 (March 2021)

Initial release, Main contributor: [Lars Berning](https://github.com/laberning), porting of [Dave Vernooy's ErgWare](https://dvernooy.github.io/projects/ergware/) to JavaScript and addition of Bluetooth. Known to work on the Sportstech WRX700 water-rower

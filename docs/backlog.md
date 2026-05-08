# Development Roadmap for Open Rowing Monitor

This is currently is a very minimalistic Backlog for further development of this project.

If you would like to contribute to this project, you are more than welcome, but please read the [Contributing Guidelines](CONTRIBUTING.md) first to get the most out of your valuable time.

## Planned for 0.9.8 (next anticipated release)

* Migrate RowsAndAll functionality to Intervals.icu (as RowsAndAll has declared EOL)
* Add weight correction factor to calories calculation (see [C2 formula](https://www.concept2.com/training/calorie-calculator))
* Improve the development environment to make developpers happier
  * Allow testing to be done on non-RPi devices
  * Improve package structure when needed
  * Add new test framework
* Move to the Wayland window manager, to keep in step with Raspberry Pi OS
* Introduce training plans (i.e. a distance/time to row):
  * Integrate with intervals.icu to retrieve training planning
  * add user friendly possibility for user to define training interval timers in the web frontend
* Introduce workout plans (i.e. intervals with **goals** like a target HR or pace):
  * Update `server.js`, `SessionManager.js` and the recorders to handle a minimum or maximum pace/HR per interval
  * Integrate with intervals.icu to retrieve training targets
  * add user friendly possibility for user to define workouts with targets via the GUI
  * add user friendly possibility for user to define workouts with targets via the PM5 emulator
  * add user friendly possibility for user to see targets are met in the GUI
  * Change the FIT-recorder
    * to register HR/Power zones in the fit-file when needed
    * to register training targets when possible
    * to have a central `event` log, allowing recording of exceeding targets

## Soon

* Look at an alternative for pigpio library as it doesn't work on a Raspberry Pi 5 (see [issue 52](https://github.com/JaapvanEkris/openrowingmonitor/issues/52))

## Later

* validate FTMS with more training applications and harden implementation (i.e. Holofit and Coxswain)
* Introduce multiple users with their own parameters (like linked rowsandall.com and intervals.icu accounts, etc.)

## Ideas

* Add GUI indicators for training zones

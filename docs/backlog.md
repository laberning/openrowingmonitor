# Development Roadmap for Open Rowing Monitor

This is currently is a very minimalistic Backlog for further development of this project.

If you would like to contribute to this project, please read the [Contributing Guidelines](CONTRIBUTING.md) first.

## Soon

* validate FTMS with more training applications and harden implementation (i.e. Holofit and Coxswain)
* add an option to select the damper setting in the Web UI
* add some more test cases to the rowing engine

## Later

* figure out where to set the Service Advertising Data (FTMS.pdf p 15)
* add some attributes to BLE DeviceInformationService
* record the workout and show a visual graph of metrics
* show a splash screen while booting the device

## Ideas

* add video playback to the Web UI
* implement or integrate some rowing games (i.e. a little 2D or 3D, game implemented as Web Component)
* add possibility for user to define training timers (Server.js can already handle this)
* add possibility for user to define workouts (i.e. training intervals with goals)

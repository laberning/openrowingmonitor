# Development Roadmap for Open Rowing Monitor

This is the very minimalistic Backlog for further development of this project.

## Soon

* validate FTMS with more training applications and harden implementation (i.e. Holofit and Coxswain)
* record a longer rowing session and analyze two encountered problems: 1) rarely the stroke rate doubles for a short duration (might be a problem with stroke detection when measurements are imprecise), 2) in one occasion the measured power jumped to a very high value after a break (40000 watts)
* add an option to select the damper setting in the Web UI
* add an option to only consider every nth impulse (combine them)

## Later

* automatically upload recorded rowing sessions to training platforms (i.e. Strava)
* figure out where to set the Service Advertising Data (FTMS.pdf p 15)
* add some attributes to BLE DeviceInformationService
* improve the physics model for water rowers
* make Web UI a proper Web Application (tooling and SPA framework)
* record the workout and show a visual graph of metrics
* show a splash screen while booting the device

## Ideas

* add video playback in background of Web UI
* implement or integrate some rowing games
* add possibility to define workouts (i.e. training intervals with goals)

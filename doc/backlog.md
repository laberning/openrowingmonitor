# Development Roadmap for Open Rowing Monitor

This is the very minimalistic Backlog for further development of this project.

## Soon

* investigate: occasionally stroke rate is too high - seems to happen after rowing pause
* figure out where to set the Service Advertising Data (FTMS.pdf p 15)
* set up a Raspberry Pi with the installation instructions to see if they are correct
* record a longer rowing session and analyze two encountered problems: 1) rarely the stroke rate doubles for a short duration (might be a problem with stroke detection when measurements are imprecise), 2) in one occasion the measured power jumped to a very high value after a break (40000 watts)

## Later

* add some attributes to BLE DeviceInformationService
* presets for rowing machine specific config parameters
* improve the physics model for waterrowers
* validate FTMS with more training applications and harden implementation
* make Web UI a proper Web Application (tooling and SPA framework)
* record the workout and show a visual graph of metrics
* export the workout

## Ideas

* add support for BLE Heart Rate Sensor and show pulse
* add video playback in background of Web UI
* implement or integrate some rowing games
* add possibility to define workouts (i.e. training intervals with goals)
* directly attach a touchscreen to the Raspberry Pi and automatically show WebUI on this in kiosk mode

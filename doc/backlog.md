# Development Roadmap for Open Rowing Monitor

This is the very minimalistic Backlog for further development of this project.

## Soon

* check todo markers in code and add them to this backlog
* cleanup of the server.js start file
* figure out where to set the Service Advertising Data (FTMS.pdf p 15)
* Web UI: replace fullscreen button with exit Button when started from homescreen
* investigate bug: crash, when one unsubscribe to BLE "Generic Attribute", probably a bleno bug "handleAttribute.emit is not a function"
* set up a raspi with the installation instructions to see if they are correct

## Later

* add a config file
* presets for rowing machine specific config parameters
* validate FTMS with more training applications and harden implementation
* make Web UI a proper Web Application (tooling and SPA framework)
* record the workout and show a visual graph of metrics
* export the workout

## Ideas

* add support for BLE Heart Rate Sensor and show pulse
* add video playback in background of Web UI
* implement or integrate some rowing games
* add possibility to define workouts (i.e. training intervals with goals)

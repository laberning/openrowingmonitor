# Development Roadmap for Open Rowing Monitor

This is the very minimalistic Backlog for further development of this project.

## Soon

* robust handling of websockets (reconnect, multiple connections)
* handle training interruptions (set stroke specific metrics to "0" if no impulse detected for x seconds)
* check todo markers in code and add them to this backlog
* cleanup of the server.js start file
* add a logging framework
* figure out where to set the Service Advertising Data (FTMS.pdf p 15)
* Web UI: Replace Fullscreen Button with Exit Button when started from Homescreen
* set up a raspi with the installation instructions to see if they are correct

## Later

* add a config file
* presets for rowing machine specific config parameters
* set a more appropriate ble Appearance (currently 0x2A01 Generic Computer)
* validate FTMS with more Training Applications and harden implementation
* make Web UI a proper Web Application (tooling and SPA framework)
* record the workout and show a visual graph of metrics
* export the workout

## Ideas

* add Video playback in Background of Web UI
* add possibility to define Workouts (i.e. training intervals with goals)

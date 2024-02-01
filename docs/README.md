# Open Rowing Monitor

[![Node.js CI](https://github.com/JaapvanEkris/openrowingmonitor/actions/workflows/node.js.yml/badge.svg)](https://github.com/JaapvanEkris/openrowingmonitor/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/JaapvanEkris/openrowingmonitor/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/JaapvanEkris/openrowingmonitor/actions/workflows/codeql-analysis.yml)

<!-- markdownlint-disable-next-line no-inline-html -->
<img width="200" height="200" align="left" src="img/openrowingmonitor_icon.png" alt="Open Rowing Monitor logo" class="dropcap">

Open Rowing Monitor is a free and open source performance monitor for rowing machines. It upgrades almost any rowing machine into a smart trainer that can be used with training applications and games.

It is a Node.js application that runs on a Raspberry Pi and measures the rotation of the rower's flywheel (or similar) to calculate rowing specific metrics, such as power, split time, speed, stroke rate, distance and calories. It can share these metrics for controling games and record these metrics for further analysis.

Open Rowing Monitor should run fine with any rowing machine that uses some kind of damping mechanism, as long as you can add something to measure the speed of the flywheel. It has shown to work well with DIY rowing machines like the [Openergo](https://openergo.webs.com), providing the construction is decent. [You can find a full list of known and supported rowers here](Supported_Rowers.md). If your machine isn't listed, don't worry, it just means that you need to adjust the software settings following the [settings adjustment guide](rower_settings.md) yourself. And there is no reason to be anxious, in the [GitHub Discussions](https://github.com/laberning/openrowingmonitor/discussions) there always are friendly people to help you set up your machine and the settings.

## Features

Open Rowing Monitor aims to provide you with metrics directly, connect to watches, apps and games via bluetooth or ANT+ and allow you to export your data to the analysis tool of your choice. These features have been tested intensily, where most features have survived flawlessly over 3 million meters of rowing with different types of rowing machines.

<!-- markdownlint-disable-next-line no-inline-html -->
<img src="img/openrowingmonitor_frontend.png" alt="Image showing the main Open Rowing Monitor screen" title="The main screen" width="700"><br clear="left">

The following items describe most of the current features in more detail.

### Rowing Metrics

Open Rowing Monitor implements a physics model to simulate the typical metrics of a rowing boat based on the pull on the handle. The physics model can be tuned to the specifics of a rower by changing some model parameters in the configuration file, where we also provide these [settings for machines known to us](Supported_Rowers.md). The underlying V1 physics engine has been validated against a Concept2 PM5 in over 300 sessions (totalling 2.5 million meters), and results deviate less than 0.05% for every individual rowing session.

Open Rowing Monitor can display the following key metrics on the user interface:

* Distance rowed (meters)
* Training Duration
* Power (watts)
* Pace (/500m)
* Strokes per Minute (SPM)
* Calories used (kcal)
* Total number of strokes
* Heart Rate (supports BLE and ANT+ heart rate monitors, ANT+ requires an ANT+ USB stick)
* Drag factor
* Drive duration (seconds)
* Drive length (meters)
* Recovery duration (seconds)
* Distance per stroke (meters)
* Force curve with Peak power (Newtons)

It calculates and can export many other key rowing metrics, including Recovery Heart Rate, Average handle force (Newton), Peak handle force (Newton) and the associated handle force curve, handle velocity curve and handle power curve.

### Web Interface

The web interface visualizes the basic rowing metrics on any device that can run a web browser (i.e. a smartphone that you attach to your rowing machine while training). It shows the rowing statistics in realtime. You can set up the user interface as you like, with the metrics you find important:

<!-- markdownlint-disable-next-line no-inline-html -->
<img src="img/Metrics_Selection.png" title="The metrics selection screen" alt="Image showing the metrics selection screen" width="700"><br clear="left">

Via the Action tile, it can also be used to reset the training metrics and to select the type of bluetooth and ANT+ connection.

If you connect a physical screen directly to the Raspberry Pi, then this interface can also be directly shown on the device. The installation script can set up a web browser in kiosk mode that runs on the Raspberry Pi.

### Bluetooth Low Energy (BLE)

Open Rowing Monitor can recieve recieve heartrate data via BLE. Asides this functionality, Open Rowing Monitor also implements different Bluetooth Low Energy (BLE) protocols so you can use your rowing machine to share rowing metrics with different fitness applications. Some apps use the Fitness Machine Service (FTMS), which is a standardized GATT protocol for different types of fitness machines. Other apps prefer to see a Concept 2 PM5. To help you connect to your app and game of choice, Open Rowing Monitor currently supports the following Bluetooth protocols:

* **Concept2 PM**: Open Rowing Monitor implements part of the Concept2 PM Bluetooth Smart Communication Interface Definition. This is still work in progress and only implements the most common parts of the spec, so it is not guaranteed to work with all applications that support C2 rowing machines. Our interface currently can only report metrics, but can't recieve commands and session parameters from the app yet. It is known to work with [EXR](https://www.exrgame.com) and all the samples from [The Erg Arcade](https://ergarcade.com), for example you can [row in the clouds](https://ergarcade.github.io/mrdoob-clouds/).

* **FTMS Rower**: This is the FTMS profile for rowing machines and supports all rowing specific metrics (such as stroke rate). So far not many training applications for this profile exist, but the market is evolving. We've successfully tested it with [EXR](https://www.exrgame.com) (preferred method), [MyHomeFit](https://myhomefit.de) and [Kinomap](https://www.kinomap.com).

* **FTMS Indoor Bike**: This FTMS profile is used by Smart Bike Trainers and widely adopted by training applications for bike training. It does not support rowing specific metrics. But it can present metrics such as power and distance to the biking application and use cadence for stroke rate. So why not use your virtual rowing bike to row up a mountain in [Zwift](https://www.zwift.com), [Bkool](https://www.bkool.com), [The Sufferfest](https://thesufferfest.com) or similar :-)

* **BLE Cycling Power Profile**: This Bluetooth simulates a bike, which allows you to connect the rower to a bike activity on your (mostly Garmin) sportwatch. It will translate the rowing metrics to the appropriate fields. This profile is only supported by specific watches, so it might provide a solution.

* **BLE Cycling Speed and Cadence Profile**: used for older Garmin Forerunner and Garmin Venu watches and similar types, again simulating a bike activity. Please note to set the wheel circumference to 10mm to make this work well.

### ANT+

You can add a ANT+ USB-stick to your Raspberry Pi, which allows to to recieve data from your ANT+ heartrate monitor. On top of recieving the heartrate data, Open Rowing Monitor can also broadcast rowing metrics via ANT+, which can be recieved by the more expensive series of Garmin smartwatches, which then can calculate metrics like training load etc..

### Export of Training Sessions

Open Rowing Monitor is based on the idea that metrics should be easily accessible for further analysis. Therefore, Open Rowing Monitor can create the following files:

* **Training Center XML files (TCX)**: These are XML-files that contain the most essential metrics of a rowing session. Most training analysis tools will accept a tcx-file. You can upload these files to training platforms like [Strava](https://www.strava.com), [Garmin Connect](https://connect.garmin.com), [Intervals.icu](https://intervals.icu/), [RowsAndAll](https://rowsandall.com/) or [Trainingpeaks](https://trainingpeaks.com) to track your training sessions;

* **RowingData** files, which are comma-seperated files with all metrics Open Rowing Monitor can produce. These can be used with [RowingData](https://pypi.org/project/rowingdata/) to display your results locally, or uploaded to [RowsAndAll](https://rowsandall.com/) for a webbased analysis (including dynamic in-stroke metrics). The csv-files can also be processed manually in Excel, allowing your own custom analysis. Please note that for visualising in-stroke metrics in [RowsAndAll](https://rowsandall.com/) (i.e. force, power and handle speed curves), you need their yearly subscription;

* **Raw flywheel measurements of the flywheel**, also in CSV files. These files are great to start to learn about the specifics of your rowing machine (some Excel visualistion can help with this).

Uploading your sessions to Strava is an integrated feature, for all other platforms this is currently a manual step. Uploading to [RowsAndAll](https://rowsandall.com/) can be automated through their e-mail interface, see [this description](https://rowsandall.com/rowers/developers/). The Open rowing Monito installer can also set up a network share that contains all training data so it is easy to grab the files from there and manually upload them to the training platform of your choice.

## Installation

You will need a Raspberry Pi Zero W, Raspberry Pi Zero 2 W, Raspberry Pi 3 or a Raspberry Pi 4 with a fresh installation of Raspberry Pi OS Lite for this (the 64Bit kernel is preferred). Connect to the device with SSH have a look at the [Detailed Installation Instructions](installation.md) for more information on the software installation and for instructions on how to connect the rowing machine. Don't have a Raspberry Pi, but do have an ESP32 lying about? No problem, our sister project ported [Open Rowing Monitor for the ESP32](https://github.com/Abasz/ESPRowingMonitor), which works well (although uses a bit less accurate math due to platform limitations).

## How it all started

[Lars Berning](https://github.com/laberning) originally started this project, because his rowing machine (Sportstech WRX700) had a very simple monitor and he wanted to build something with a clean interface that calculates more realistic metrics. Also, this was a good reason to learn a bit more about Bluetooth and all its specifics.

The original proof of concept version started as a sketch on an Arduino, but the web frontend and BLE needed the much more powerful Raspberry Pi. Maybe using a Raspberry Pi for this small IoT-project was a bit of an overkill, but it has the capacity for more complex math and features such as syncing training data. There is a much appreciated sister project that ported [Open Rowing Monitor for the ESP32](https://github.com/Abasz/ESPRowingMonitor).

## Further information

This project is already in a very stable stage, as it is used daily by many rowers. You can see its development [here in the Release notes](Release_Notes.md). However, being open source, it might contain some things that are still a bit rough on the edges. More functionality will be added in the future, so check the [Development Roadmap](backlog.md) if you are curious. Contributions are welcome, please read the [Contributing Guidelines](CONTRIBUTING.md) first.

Feel free to leave a message in the [GitHub Discussions](https://github.com/JaapvanEkris/openrowingmonitor/discussions) if you have any questions or ideas related to this project.

Check the advanced information on the [Physics behind Open Rowing Monitor](physics_openrowingmonitor.md).

This project uses some great work by others, see the [Attribution here](attribution.md).

# Guide for rower specific settings

<!-- markdownlint-disable no-inline-html -->
This guide helps you to adjust the rowing monitor specifically for a new type of rower or even for your specific use, when the default rowers don't suffice.

## Why we need rower specific settings

No rowing machine is the same, and some physical construction parameters are important for the Rowing Monitor to be known to be able to understand your rowing stroke. By far, the easiest way to configure your rower is to select your rower profile from `config/rowerProfiles.js` and put its name in `config/config.js` (i.e. `rowerSettings: rowerProfiles.Concept2_RowErg`). The rowers mentioned there are maintained by us for OpenRowingMonitor and we also structurally test OpenRowingMonitor with samples of these machines and updates setings when needed. For you as a user, this has the benefit that updates in our software are automatically implemented, including updating the settings. So if you make a rower profile for your machine, please send the profile and some raw data (explained below) to us as well so we can maintain it for you.

If you want something special, or if your rower isn't in there, this guide will help you set it up. Please note that determining these settings is quite labor-intensive, and typically some hard rowing is involved. If you find suitable settings for a new type of rower, please send in the data and settings, so we can add it to OpenRowingMonitor and make other users happy as well.

## Settings you must change for a new rower

The key feature for Open Rowing Monitor is to reliably produce metrics you see on the monitor, share via Bluetooth with games and share with Strava and the like. Typically, these metrics are reported on a per-stroke basis. So, to be able to use these metrics for these goals, you need two key parts of the settings right:

* Stroke detection

* Physical metrics (like distance, power and speed)

We identified several steps to get things working:

* Check that the Open Rowing Monitor software works

* Making sure the hardware works as intended

* Setting the right stroke noise filtering settings

* Getting detailed logging

* Getting stroke detection right by:
  * Setting the right number of magnets
  * Setting the right sprocket size
  * Setting the minimal slope, stroke quality, flank length and number of errors

* Getting the metrics right by:
  * Setting the dragfactor

### Check that Open Rowing Monitor works

First check you need to do is to check the status of the Open Rowing Monitor service, which you can do with the command:

  ```zsh
  sudo systemctl status openrowingmonitor
  ```

Which typically results in the following response (with some additional logging):

  ```zsh
  ● openrowingmonitor.service - Open Rowing Monitor
       Loaded: loaded (/lib/systemd/system/openrowingmonitor.service; enabled; vendor preset: enabled)
       Active: active (running) since Sun 2022-09-04 10:27:31 CEST; 12h ago
     Main PID: 755 (npm start)
        Tasks: 48 (limit: 8986)
          CPU: 6min 48.869s
       CGroup: /system.slice/openrowingmonitor.service
               ├─755 npm start
               ├─808 sh /tmp/start-6f31a085.sh
               ├─809 node app/server.js
               ├─866 /usr/bin/node ./app/gpio/GpioTimerService.js
               └─872 /usr/bin/node ./app/ble/CentralService.js
  ```

Please note that the process identification numbers will differ.

### Making sure the hardware works as intended

Before you physically connect anything to anything else, **check the electric properties of the rower** you are connecting to. Skipping this might destroy your Raspberry Pi as some rowers are known to exceed the Raspberry Pi electrical properties. For example, a Concept 2 RowErg provides 15V signals to the monitor, which will destroy the GPIO-ports. Other rowers provide signals aren't directly detectable by the raspberry Pi. For example, the Concept 2 Model C provides 0.2V pulses, thus staying below the detectable 1.8V treshold that the Raspberry Pi uses. Using a scope or a voltmeter is highly recommended. Please observe that the maximum input a Raspberry Pi GPIO pin can handle is 3.3V and 0.5A, and it will switch at 1.8V (see [this overview of the Raspberry Pi electrical properties](https://raspberrypi.stackexchange.com/questions/3209/what-are-the-min-max-voltage-current-values-the-gpio-pins-can-handle)). In our [GitHub Discussions](https://github.com/laberning/openrowingmonitor/discussions) there are some people who are brilliant with electrical connections, so don't be affraid to ask for help there. When you have a working solution, please report it so that we can include it in the documentation, allowing us to help others.

Next, when the electric connection has been made, we need to look if the data is recieved well and has sufficient quality to be used. You can change `config/config.js` by

  ```zsh
  sudo nano /opt/openrowingmonitor/config/config.js
  ```

Here, you can change the setting for **createRawDataFiles** by setting:

 ```js
 createRawDataFiles: true,
 ```

You can use the following commands on the command line to restart after a config change (to activate new settings):

  ```zsh
  sudo systemctl restart openrowingmonitor
  ```

After rowing a bit, there should be a csv file created with raw data. Please read this data in Excel (it is in US format, so you might need to adapt it to your local settings), to check if it is sufficiently clean. After loading it into Excel, you can visualise it, and probably see something similar to the following:

<img src="img/CurrentDt_curve.jpg" width="700">

When the line goes up, the time between impulses from the flywheel goes up, and thus the flywheel is decellerating. When the line goes down, the time between impulses decreases, and thus the flywheel is accelerating. In the first decellerating flank, we see some noise, which Open Rowing Monitor an deal with perfectly. However, looking at the bottom of the first acceleration flank, we see a series of heavy downward spikes. This could be start-up noise, but it also could be systematic across the rowing session. This is problematic as it throws off both stroke detection and many metrics. Typically, it signals an issue in the mechenical construction of the sensor: the fram and sensor vibrate at high speeds, resulting in much noise. Please fix this before proceeding.

### Getting an insight into the inner workings of Open Rowing Monitor

When installed, OpenRowingMonitor will not flood the log with messages. However, when testing it is great to see what OpenRowingMonitor is doing. So first thing to do is to set the following in the settings:

 ```js
 // Available log levels: trace, debug, info, warn, error, silent
 loglevel: {
     // The default log level
     default: 'info',
     // The log level of of the rowing engine (stroke detection and physics model)
     RowingEngine: 'debug'
   },
 ```

You can look at the the log output of the OpenRowingMonitor-service by putting the following in the command-line:

  ```zsh
  sudo journalctl -u openrowingmonitor
  ```

This allows you to see the current state of the rower. Typically this will show:

  ```zsh
  Sep 12 20:37:45 roeimachine systemd[1]: Started Open Rowing Monitor.
  Sep 12 20:38:03 roeimachine npm[751]: > openrowingmonitor@0.8.2 start
  Sep 12 20:38:03 roeimachine npm[751]: > node app/server.js
  Sep 12 20:38:06 roeimachine npm[802]: ==== Open Rowing Monitor 0.8.2 ====
  Sep 12 20:38:06 roeimachine npm[802]: Setting priority for the main server thread to -5
  Sep 12 20:38:06 roeimachine npm[802]: Session settings: distance limit none meters, time limit none seconds
  Sep 12 20:38:06 roeimachine npm[802]: bluetooth profile: Concept2 PM5
  Sep 12 20:38:06 roeimachine npm[802]: webserver running on port 80
  Sep 12 20:38:06 roeimachine npm[862]: Setting priority for the Gpio-service to -7
  Sep 12 20:38:09 roeimachine npm[802]: websocket client connected
  ```

This shows that Open Rowing Monitor is running, and that bluetooth and the webserver are alive, and that the webclient has connected.

### Setting critical parameters for stroke detection

There are several critical parameters that are required for Open Rowing Monitor to work. In this section, we help you set the most critical ones.

#### numOfImpulsesPerRevolution

**numOfImpulsesPerRevolution** tells Open Rowing Monitor how many impulses per rotation of the flywheel to expect. An inspection of the flywheel could reveal how many magnets it uses (typically a rower has 2 to 4 magnets). Although sometimes it is well-hidden, you can sometimes find it in the manual under the parts-list of your rower.

#### sprocketRadius

**sprocketRadius** tells Open Rowing Monitor how big the sprocket is that attaches your belt/chain to your flywheel. This setting is used in several calculations and is involved in calculating the handle force for stroke detection. Its accuracy isn't super-critical, you can change it afterwards to something more accurate, but remember that when the sprocket radius doubles, so should the *minumumForceBeforeStroke*.The default value will work OK for most rowers, but sometimes it needs to be changed for a specific rower. In the later section, we will describe how to optimally tune it.

### minumumForceBeforeStroke
**minumumForceBeforeStroke*** relates to the force on the handle 

    // NOISE FILTER SETTINGS
    // Filter Settings to reduce noise in the measured data
    // Minimum and maximum duration between impulses in seconds during active rowing. Measurements above the maximum are filtered, so setting these liberaly
    // might help here
    minimumTimeBetweenImpulses: 0.014,
    maximumTimeBetweenImpulses: 0.5,

    // Smoothing determines the length of the running average for filtering the currentDt, 1 effectively turns it off
    smoothing: 1,

  ```zsh
  Sep 12 20:45:36 roeimachine npm[802]: stroke: 0, dist: 0.0m, speed: 0.00m/s, pace: Infinity/500m, power: 0W, drive length: 1.10 m, SPM: 0.0, drive dur: NaNs, rec. dur: NaNs
  Sep 12 20:45:38 roeimachine npm[802]: *** RECOVERY phase started at time: 1.5644 sec
  Sep 12 20:45:40 roeimachine npm[802]: *** DRIVE phase started at time: 3.6013 sec
  Sep 12 20:45:40 roeimachine npm[802]: *** Calculated drag factor: 105.6459, no. samples: 143, Goodness of Fit: 0.9435
  Sep 12 20:45:40 roeimachine npm[802]: *** Calculated recovery slope: 0.001089, Goodness of Fit: 0.9435
  Sep 12 20:45:40 roeimachine npm[802]: stroke: 1, dist: 7.5m, speed: 1.80m/s, pace: 4:38/500m, power: 17W, drive length: 1.09 m, SPM: 23.2, drive dur: 1.56s, rec. dur: 2.04s
  Sep 12 20:45:41 roeimachine npm[802]: *** RECOVERY phase started at time: 4.5018 sec
  Sep 12 20:45:43 roeimachine npm[802]: *** DRIVE phase started at time: 6.5907 sec
  Sep 12 20:45:43 roeimachine npm[802]: *** Calculated drag factor: 104.1759, no. samples: 196, Goodness of Fit: 0.9675
  Sep 12 20:45:43 roeimachine npm[802]: *** Calculated recovery slope: 0.001074, Goodness of Fit: 0.9675
  Sep 12 20:45:43 roeimachine npm[802]: stroke: 2, dist: 17.1m, speed: 2.93m/s, pace: 2:51/500m, power: 73W, drive length: 1.18 m, SPM: 20.2, drive dur: 1.23s, rec. dur: 2.06s
  Sep 12 20:45:44 roeimachine npm[802]: *** RECOVERY phase started at time: 7.3455 sec
  Sep 12 20:45:46 roeimachine npm[802]: *** DRIVE phase started at time: 9.5219 sec
  Sep 12 20:45:46 roeimachine npm[802]: *** Calculated drag factor: 103.9705, no. samples: 214, Goodness of Fit: 0.9731
  Sep 12 20:45:46 roeimachine npm[802]: *** Calculated recovery slope: 0.001072, Goodness of Fit: 0.9731
  Sep 12 20:45:46 roeimachine npm[802]: stroke: 3, dist: 27.2m, speed: 3.39m/s, pace: 2:28/500m, power: 109W, drive length: 1.23 m, SPM: 20.8, drive dur: 0.83s, rec. dur: 2.13s
  Sep 12 20:45:46 roeimachine npm[802]: *** RECOVERY phase started at time: 10.2020 sec
  Sep 12 20:45:49 roeimachine npm[802]: *** DRIVE phase started at time: 12.4851 sec
  Sep 12 20:45:49 roeimachine npm[802]: *** Calculated drag factor: 103.7254, no. samples: 232, Goodness of Fit: 0.9770
  Sep 12 20:45:49 roeimachine npm[802]: *** Calculated recovery slope: 0.001069, Goodness of Fit: 0.9770
  Sep 12 20:45:49 roeimachine npm[802]: stroke: 4, dist: 37.7m, speed: 3.51m/s, pace: 2:23/500m, power: 121W, drive length: 1.16 m, SPM: 20.6, drive dur: 0.72s, rec. dur: 2.23s
  Sep 12 20:45:49 roeimachine npm[802]: *** RECOVERY phase started at time: 13.1464 sec
  Sep 12 20:45:52 roeimachine npm[802]: *** DRIVE phase started at time: 15.3739 sec
  Sep 12 20:45:52 roeimachine npm[802]: *** Calculated drag factor: 103.9593, no. samples: 226, Goodness of Fit: 0.9775
  Sep 12 20:45:52 roeimachine npm[802]: *** Calculated recovery slope: 0.001072, Goodness of Fit: 0.9775
  Sep 12 20:45:52 roeimachine npm[802]: stroke: 5, dist: 48.0m, speed: 3.56m/s, pace: 2:21/500m, power: 126W, drive length: 1.11 m, SPM: 20.6, drive dur: 0.67s, rec. dur: 2.26s
  Sep 12 20:45:52 roeimachine npm[802]: *** RECOVERY phase started at time: 16.1629 sec
  Sep 12 20:45:55 roeimachine npm[802]: *** DRIVE phase started at time: 18.3141 sec
  Sep 12 20:45:55 roeimachine npm[802]: *** Calculated drag factor: 103.3899, no. samples: 216, Goodness of Fit: 0.9764
  Sep 12 20:45:55 roeimachine npm[802]: *** Calculated recovery slope: 0.001066, Goodness of Fit: 0.9764
  Sep 12 20:45:55 roeimachine npm[802]: stroke: 6, dist: 58.4m, speed: 3.55m/s, pace: 2:21/500m, power: 126W, drive length: 1.22 m, SPM: 20.1, drive dur: 0.73s, rec. dur: 2.19s
  Sep 12 20:45:55 roeimachine npm[802]: *** RECOVERY phase started at time: 19.0078 sec
  Sep 12 20:45:58 roeimachine npm[802]: *** DRIVE phase started at time: 21.3977 sec
  Sep 12 20:45:58 roeimachine npm[802]: *** Calculated drag factor: 102.3463, no. samples: 236, Goodness of Fit: 0.9348
  Sep 12 20:45:58 roeimachine npm[802]: *** Calculated recovery slope: 0.001055, Goodness of Fit: 0.9348
  Sep 12 20:45:58 roeimachine npm[802]: stroke: 7, dist: 69.1m, speed: 3.49m/s, pace: 2:23/500m, power: 119W, drive length: 1.23 m, SPM: 20.2, drive dur: 0.74s, rec. dur: 2.27s
  Sep 12 20:45:58 roeimachine npm[802]: *** RECOVERY phase started at time: 21.9592 sec
  Sep 12 20:46:00 roeimachine npm[802]: *** DRIVE phase started at time: 24.1939 sec
  Sep 12 20:46:00 roeimachine npm[802]: *** Calculated drag factor: 103.4389, no. samples: 225, Goodness of Fit: 0.9705
  Sep 12 20:46:00 roeimachine npm[802]: *** Calculated recovery slope: 0.001066, Goodness of Fit: 0.9705
  Sep 12 20:46:00 roeimachine npm[802]: stroke: 8, dist: 78.9m, speed: 3.50m/s, pace: 2:23/500m, power: 120W, drive length: 1.04 m, SPM: 20.9, drive dur: 0.63s, rec. dur: 2.31s
  Sep 12 20:46:01 roeimachine npm[802]: *** RECOVERY phase started at time: 24.8737 sec
  Sep 12 20:46:03 roeimachine npm[802]: *** DRIVE phase started at time: 27.1559 sec
  Sep 12 20:46:03 roeimachine npm[802]: *** Calculated drag factor: 103.4498, no. samples: 228, Goodness of Fit: 0.9070
  Sep 12 20:46:03 roeimachine npm[802]: *** Calculated recovery slope: 0.001066, Goodness of Fit: 0.9070
  ```

@@@@@@@@@@@@@

### Getting stroke detection right

A key element in getting rowing data right is getting the stroke detection right, as we report many metrics on a per-stroke basis. The **Impulse Noise reduction settings** reduce the level of noise on the level of individual impulses. You should change these settings if you experience issues with stroke detection or the stability of the drag factor calculation. The stroke detection consists out of three types of filters:

* A smoothing filter, using a running average. The **smoothing** setting determines the length of the running average for the impulses, which removes the height of the peaks, removes noise to a certain level but keeps the stroke detection responsive. Smoothing typically varies between 1 to 4, where 1 effectively turns it off.
* A high-pass/low-pass filter, based on **minimumTimeBetweenImpulses** (the shortest allowable time between impulses) and **maximumTimeBetweenImpulses** (the longest allowed time between impulses). Combined, they remove any obvious errors in the duration between impulses (in seconds) during *active* rowing. Measurements outside of this range are filtered out to prevent the stroke detection algorithm to get distracted. This setting is highly dependent on the physical construction of your rower, so you have to determine it yourself without any hints. The easiest way to determine this is by visualizing your raw recordings in Excel.

By changing the noise reduction settings, you can remove any obvious errors. You don't need to filter everything: it is just to remove obvious errors that might frustrate the stroke detection, but in the end you can't prevent every piece of noise out there. OpenRowingMonitor can handle some noise, so it is just to prevent extreme outliers. Begin with the noise filtering, when you are satisfied, you can adjust the rest of the stroke detection settings.

Another set of settings are the **flankLength** and **numberOfErrorsAllowed** setting, which determine the condition when the stroke detection is sufficiently confident that the stroke has started/ended. In essence, the stroke detection looks for a consecutive increasing/decreasing impulse lengths, and the **flankLength** determines how many consecutive flanks have to be seen before the stroke detection considers a stroke to begin or end. Please note that making the flank longer does *not* change your measurement in any way: the algorithms always rely on the beginning of the flank, not at the current end. Generally, a **flankLength** of 3 to 4 typically works. Sometimes, a measurement is too noisy, which requires some errors in the flanks to be ignored, which can be done through the **numberOfErrorsAllowed** setting. For example, the NordicTrack RX-800 successfully uses a **flankLength** of 9 and a **numberOfErrorsAllowed** of 2, which allows quite some noise but forces quite a long flank. This setting requires a lot of tweaking and rowing.

At the level of the stroke detection, there is some additional noise filtering, preventing noise to start a drive- or recovery-phase too early. The settings **minimumDriveTime** and **minimumRecoveryTime** determine the minimum times (in seconds) for the drive and recovery phases. Generally, the drive phase lasts at least 0.500 second, and the recovery phase 0.900 second for recreational rowers.

When OpenRowingMonitor records a log (set setting createRawDataFiles to `true`), you can paste the values in the first column of the "Raw Data" tab (please observe that the Raspberry uses a point as separator, and your version of Excel might expect a comma). From there, the Excel file simulates the calculations the OpenRowingMonitor makes, allowing you to play with these settings.

Please note that changing the noise filtering and stroke detection settings will affect your calculated dragFactor. So it is best to start with rowing a few strokes to determine settings for noise filtering and stroke detection, and then move on to the other settings.

### Getting the metrics right

There are some parameters you must change to get Open Rowing Monitor to calculate the real physics with a rower. These are:

* **dragFactor**: tells Open Rowing Monitor how much damping and thus resistance your flywheel is offering. This is typically also dependent on your damper-setting (if present). Regardless if you use a static or dynamically calculated drag factor, this setting is needed as the first stroke also needs it to calculate distance, speed and power. Just as a frame of reference: the Concept2 can display this factor from the menu. Please note that the drag factor is much dependent on the physical construction of the flywheel and mechanical properties of the transmission of power to the flywheel. For a new Concept2, the Drag Factor ranges between 80 (Damper setting 1) and 220 (Damper setting 10). The NordicTrack RX-800 ranges from 150 to 450, where the 150 feels much lighter than a 150 on the Concept2.

Here, some rowing and some knowledge about your rowing gets involved. Setting your damping factor is done by rowing a certain number of strokes and then seeing how much you have rowed and at what pace. If you know these metrics by hart, it just requires some rowing and adjusting to get them right. If you aren't that familiar with rowing, a good starting point is that a typical distance covered by a single stroke at 20 strokes per minute (SPM) is around 10 meters. So when you row a minute, you will have 20 strokes recorded and around 200 meters rowed. When possible, we use the [Concept Model D (or RowerErg)](https://www.concept2.com/indoor-rowers/concept2-rowerg) as a "Golden standard": when you know your pace on that machine, you can try to mimic that pace on your machine. Most gym's have one, so trying one can help you a lot in finding the right settings for your machine.

## Settings you COULD change for a new rower

In the previous section, we've guided you to set up a real robust working rower, but it will result in more crude data. To improve the accuracy of many measurements, you could switch to a more accurate and dynamic rower. This does require a more sophisticated rower: you need quite a few data points per stroke, with much accuracy, to get this working reliably. And a lot of rowing to get these settings right is involved.

### More accurate stroke detection

The **naturalDeceleration** setting determines the natural deceleration. This setting is used to distinguish between a powered and unpowered flywheel. This must be a negative number and indicates the level of deceleration required to interpret it as a free spinning flywheel. The best way to find the correct value for your rowing machine is a try and error approach. You can also set this to zero (or positive), to use the more robust, but not so precise acceleration-based stroke detection algorithm. Setting it to -0.1 enables the alternative less robust algorithm. By seeing how your stroke detection behaves during a row, you can slowly lower this number until you start missing strokes.

Please note that changing this stroke detection will affect your calculated dragFactor.

### Dynamically adapting the drag factor

In reality, the drag factor of a rowing machine isn't static: it depends on air temperature, moisture, dust, (air)obstructions of the flywheel cage and sometimes even speed of the flywheel. So using a static drag factor is reliable, it isn't accurate. Open Rowing Monitor can automatically calculate the drag factor on-the-fly based on the recovery phase (see [this description of the underlying physics](physics_openrowingmonitor.md)). To do this, you need to set the following settings:

* **autoAdjustDragFactor**: the Drag Factor can be calculated automatically. Setting it to true, will allow Open Rowing Monitor to automatically calculate the drag factor based on the **flywheelInertia** and the on the measured values in the stroke recovery phase.
* **flywheelInertia**: The moment of inertia of the flywheel (in kg\*m^2), which in practice influences your power values and distance. A formal way to measure it is outlined in [Flywheel moment of inertia](https://dvernooy.github.io/projects/ergware/). However, the most practical way to set it is by rowing and see what kind of power is displayed on the monitor. Typical ranges are weight dependent (see [this explanation](https://www.rowingmachine-guide.com/tabata-rowing-workouts.html)), and it helps if you know your times on a reliable machine like the Concept2.

Please note that you don't need to use the dynamic drag factor to test your settings. To see the calculated drag factor for your rowing machine, please ensure that the logging level of the RowingEngine is set to 'info' or higher. Then do some strokes on the rower and observe the calculated drag factor in the logging.

It must be noted that you have to make sure that your machine's measurements are sufficiently free of noise: noise in the drag calculation can have a strong influence on your speed and distance calculations and thus your results. If your rower produces stable damping values, then this could be a good option to dynamically adjust your measurements to the damper setting of your rower as it takes in account environmental conditions. When your machine's power and speed readings are too volatile it is wise to turn it off

## Settings you can tweak

#### sprocketRadius (revisited)

**sprocketRadius** tells Open Rowing Monitor how big the sprocket is that attaches your belt/chain to your flywheel. This setting is used in several calculations and is involved in calculating the handle force for stroke detection. Its accuracy isn't super-critical, you can change it afterwards to something more accurate, but remember that when the sprocket radius doubles, so should the *minumumForceBeforeStroke*.The default value will work OK for most rowers, but sometimes it needs to be changed for a specific rower. In the later section, we will describe how to optimally tune it.

Some people want it all, and we're happy to give to you when your rower and your Raspberry Pi can handle the pain. Some interesting settings:

* **maximumImpulseTimeBeforePause** determines the maximum time between impulses before the rowing engine considers it a pause.
* **magicConstant** is a constant that is commonly used to convert flywheel revolutions to a rowed distance and speed (see [the physics of ergometers](http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html#section9)). Concept2 seems to use 2.8, which they admit is an arbitrary number which came close to their expectations of a competetion boat. As this setting only affects speed/distance, this setting typically is used to change the power needed to row a certain distance or reach a certain speed. So changing this can make your rower's metrics act as sluggish as an oil tanker (much power needed for little speed), or more like a smooth eight (less power needed for more speed). So for your rower, you could set your own plausible distance for the effort you put in. Please note that the rowed distance also depends on **flywheelInertia**, so please calibrate that before changing this constant. Another note: increasing this number decreases your rowed meters, but not in a linear fashion.
* **webUpdateInterval**: normally set at 1000 milliseconds, but for a more smoother experience on your monitor you can go as low as 100 ms. This makes the transition of the distance and time quite smooth, but at the price of some more network and CPU-load.
* **numOfPhasesForAveragingScreenData**: we average the data from several stroke phases to prevent the monitor and Bluetooth devices to become fidgety. Typically, we set this value to 6, which means 3 strokes (there are two phases in each stroke). However, some Bluetooth devices do their own calculations. And sometimes you really want the feedback on your individual strokes without any punches hold back. Setting this to 1 will result in a very volatile, but direct feedback mechanism on your stroke.
* **dampingConstantSmoothing** determines the smoothing of the dragfactor across strokes (if autoAdjustDragFactor is set to true). Normally set at 5 strokes, which prevents wild values to throw off all your measurements. If you have rower that produces very little noise in the data, then it could be an option to reduce. If your machine produces noisy data, this is the one to increase before anything else.
* **dampingConstantMaxChange** determines the maximum change between a currently determined dragfactor and the current average of the previous dampingConstantSmoothing strokes (if autoAdjustDragFactor is set to true). This filter reduces spikes in the calculation and thus makes the dragfactor less responsive to changes. The default value of 0.10 implies that the maximum upward/downward change is an increase of the drag with 10%. Please note that this filter still allows changes, it just limits their impact to this percentage. Most rower's dragfactor is relatively constant, however certain hyrid rower's dragfactor changes when the speed changes. To allow for bigger changes within a stroke, increase this setting. When the expected changes are small, set this setting small. When your rower is a hybrid or when you have one configuration for all your damper settings, this should be a bit wider.
* **createRawDataFiles**: This is as raw as it gets, as setting this to `true` makes Open Rowing Monitor dump the raw impulse-lengths to a file (see [how we interpret this data](physics_openrowingmonitor.md)).

## Sending in a rower profile to us

Sending in a rower profile helps other users, but also helps yourself as we structurally test and update the knowwn configurations. We need the following things from you to maintain a rower profile:

* The **profile** itself: these are the settings you used to get the machine working.
* A **raw datafile** (described above) of a session, preferably with your distance and time. This allows us to test if newer versions of OpenRowingMonitor will deliver similar results to you.

# Set Up of the Open Rowing Monitor settings for a specific rower

This guide helps you to adjust the rowing monitor specifically for your rower or even for you

## Why have setings
No rowingmachine is the same, and their physical construction is important for the Rowing Monitor to understand to be able to understand your rowing. Easiest way is to select your rower from owerProfiles.js and put its name in default.config.js instead of "rowerProfiles.DEFAULT".

If your rower isn't there, this guide will help you set it up (please send in the data and settings, so we can add it to the OpenRowingMonitor).

Settings important for Open Rowing Monitor:
* numOfImpulsesPerRevolution: tells Open Rowing Monitor how many impulses per rotation of the flywheel to expect. Although sometimes not easy to detect, you can sometimes find it in the manual under the parts-list
* liquidFlywheel: tells OpenRowingMonitor if you are using a waterrower (true) or a solid flywheel with magnetic or air-resistance (false)
* omegaDotDivOmegaSquare: tells OpenRowingMonitor how much damping and thus resistance your flywheel is offering. This is typically also dependent on your damper-setting (if present). To measure it for your rowing machine, comment in the logging at the end of "startDrivePhase" function. Then do some strokes on the rower and estimate a value based on the logging.
* jMoment: The inertia of the flywheel, which in practice influences your power values and distance. This typically 
* Noise reduction settings. You should only change these settings if you experience issues.
  * minimumTimeBetweenImpulses
  * maximumTimeBetweenImpulses
  * maximumDownwardChange
  * maximumUpwardChange
* Stroke detection settings.
  * minimumDriveTime
  * minimumRecoveryTime
For the noise reduction settings and stroke detection settings, you can use the Excel tool. When OpenRowingMonitor records a log (comment out the line in server.js), you can paste the values in the first column of the "Raw Data" tab (please observe that the Raspberry uses a point as seperator, and your version of Excel might expect a comma).

By changing the noise reduction settings, you can remove any obvious errors. You don't need to filter everything: it is just to remove obvious errors that might frustrate the stroke detection, but in the end you can't prevent every piece of noise out there. Begin with the noise filtering, when you are satisfied, you can adjust the stroke detection.

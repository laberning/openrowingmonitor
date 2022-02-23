# Open Rowing Monitor architecture

In this document, we describe the architectual construction of Open Rowing Monitor. For the reasons behind the physics, please look at [the Physics behind Open Rowing Monitor](Physics_Of_OpenRowingMonitor.md) and [its practical validation](Engine_Validation.md). In this document we describe the main functional blocks in Open Rowing Monitor, and the major design decissions.

## Main functional components

### Server.js

Server.js orchestrates all information flows and starts/stops processes when needed. It will orchestrate:

* GPIO timing signals to the RowingEngine.js
* RowingEngine.js messages to the RowingStatistics.js
* Handle the signals from RowingStatistics.js (like the signals that the session has ended)
* Handle use input and instruct RowingEngine.js and RowingStatistics.js accordingly

### RowingStatistics.js

RowingStatistics.js takes RowingEngine.js's status reports and translates them into meaningful information for the consumers of data. RowingEngine.js reports limited updates of absolute metrics for the entire session (updates to absolute times, distances and instant velocities, etc., but only when they can be updated). RowingStatistics.js will consume this data, combines it with other datasources like the heartrate and transform it into a consistent set of more stable metrics useable for presentation.

In a nutshell:

* RowingStatistics.js applies a moving average filter to make metrics less volatile,
* RowingStatistics.js calculates derived metrics (like Calories instead of Joules)
* RowingStatistics.js gaurds interval and session boundaries, and will chop up the metrics-stream accordingly

In total, this takes full control of the displayed metrics in a specific interval.

### RowingEngine.js

RowingEngine.js interprets the flywheel behaviour and translates it into the rower's state (i.e. waiting, drive, recovery, stopped) in a finite state machine and calculates the updated associated metrics (i.e. linear velocity, linear distance, power, etc.) for that specific phase transition. Aside temporal metrics (Linear Velocity, Power, etc.) it also maintains several absolute metrics (like total total linear distance travelled). It only updates metrics that can be updated meaningful, and it will not resend (potentially stale) data that isn't updated.

### Flywheel.js

A model of the key parameters of the Flywheel, to provide the rest of ORM with essential physical metrics and state regarding the flywheel. Aside temporal metrics (i.e. Angular Velocity, Angular Acceleration, Torque, etc.) it also maintains several absolute metrics (like total elapsed time and total angular distance traveled). It also maintains physical properties of the flywheel, like the flywheel drag and flywheel inertia.

## Major design decissions

### Staying close to currentDt

currentDt is the time between impulses, which is the core measurement of any rowing machine. These values tend to range between 0.050 and 0.005 seconds, and are subject to small measurement errors due to vibrations in the rower but also scheduling issues in the Raspberry Pi OS.

Working with small numbers, and using the impulse time to calculate the angular velocity (i.e. dividing the angular distance travelled through currentDt), or even calculating angular acceleration (i.e. dividing angular velocity through currentDt) tends to enlarge these measurement errors. Therefore, whenever possible, calculations are based on the raw currentDt, rather than these dericed metrics, to prevent chaotic behaviour of Open Rowing Monitor.

### Absolute approach in RowingEngine.js

RowingEngine.js could report distance incrementally to RowingStatistics.js. However, we chose to report in absolute times and distances, making RowingEngine.js in full control of these essential metrics. This way, RowingEngine.js can report absolute times and distances, taking full control of the metrics regarding linear movement. Any derived metrics for specific clients, and smoothing/buffering, is done by RowingStatistics.

Adittionally benefit of this approach is that it makes transitions in intervals more smooth: RowingStatistics.js can intersect stroke without causing any pause in metrics (as RowingEngine.js keeps reporting absolutes, intervals and laps become a view on the same data).

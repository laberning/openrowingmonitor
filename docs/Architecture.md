# Open Rowing Monitor architecture

In this document, we describe the architectual construction of Open Rowing Monitor. For the reasons behind the physics, please look at [the Physics behind Open Rowing Monitor](Physics_Of_OpenRowingMonitor.md) and [its practical validation](Engine_Validation.md). In this document we describe the main functional blocks in Open Rowing Monitor, and the major design decissions.

## Platform choice

The choice has been made to use Raspian as OS, as it is easily installed by the user.

## Choice for JavaScript

The choice has been made to use JavaScript to build te application, as many components were readily available.

## Main functional components

```mermaid
sequenceDiagram
  participant clients
  participant gpio.js
  participant server.js
  participant RowingStatistics.js
  participant Rower.js
  participant Flywheel.js
  gpio.js-)server.js: currentDt (interrupt based)
  server.js-)RowingStatistics.js: currentDt (interrupt based)
  RowingStatistics.js->>Rower.js: currentDt (interrupt based)
  Rower.js->>Flywheel.js: currentDt (interrupt based)
  Flywheel.js-->>Rower.js: Angular metrics, Flywheel state (interrupt based)
  Rower.js-->>RowingStatistics.js: Strokes, Linear metrics (interrupt based)
  RowingStatistics.js-)server.js: Updates (State/Time based)
  server.js-)clients: Updates (State/Time based)
```

### Server.js

Server.js orchestrates all information flows and starts/stops processes when needed. It will orchestrate:

* GPIO timing signals to the RowingStatistics.js
* Handle the signals from RowingStatistics.js (like the updates on metrics and the signals that the interval has ended)
* Broadcast metics-updates to webclients and blutooth periphials
* Handle use input and instruct RowingStatistics.js accordingly

### RowingStatistics.js

`RowingStatistics.js` inspects `engine/Rower.js` each impuls for state and metrics, and translates that into meaningful information for the consumers of data. `Rower.js` reports limited absolute metrics for the entire session (updates to absolute times, distances and instant velocities, etc., but only when they can be updated). RowingStatistics.js will consume this data, combines it with other datasources like the heartrate and transform it into a consistent set of more stable set of metrics useable for presentation. Typically, smoothing out eratic behaviour of metrics is stopped here as well.

In a nutshell:

* RowingStatistics.js applies a moving median filter to make metrics less volatile and thus better suited for presentation,
* RowingStatistics.js calculates derived metrics (like Calories),
* RowingStatistics.js gaurds interval and session boundaries, and will chop up the metrics-stream accordingly, where Rower.js will just move on without looking at these artifical boundaries.

In total, this takes full control of the displayed metrics in a specific interval.

### Rower.js

`Rower.js` inspects the flywheel behaviour on each impuls and translates it into the rower's state (i.e. waiting, drive, recovery, stopped) through a finite state machine and calculates the updated associated metrics (i.e. linear velocity, linear distance, power, etc.) for that specific phase transition. Aside temporal metrics (Linear Velocity, Power, etc.) it also maintains several absolute metrics (like total total linear distance travelled). It only updates metrics that can be updated meaningful, and it will not resend (potentially stale) data that isn't updated.

### Flywheel.js

`Flywheel.js` provides a model of the key parameters of the Flywheel, to provide the rest of ORM with essential physical metrics and state regarding the flywheel, without the need for considering all kinds of paramterisation. It provides the following types of information:

* temporal metrics (i.e. Angular Velocity, Angular Acceleration, Torque, etc.)
* several absolute metrics (i.e. total elapsed time and total angular distance traveled)
* the state of the flywheel (i.e. is the flywheel powered, unpowered or even in the process of stopping)
* physical properties of the flywheel, (i.e. the flywheel drag and flywheel inertia)

## Major design decissions

### Staying close to currentDt

currentDt is the time between impulses, which is the core measurement of any rowing machine. These values tend to range between 0.050 and 0.005 seconds, and are subject to small measurement errors due to vibrations in the rower but also scheduling issues in the Raspberry Pi OS.

Working with small numbers, and using the impulse time to calculate the angular velocity (i.e. dividing the angular distance travelled through currentDt), or even calculating angular acceleration (i.e. dividing angular velocity through currentDt) tends to enlarge these measurement errors. Therefore, whenever possible, calculations are based on the raw currentDt, rather than these dericed metrics, to prevent chaotic behaviour of Open Rowing Monitor.

### Absolute approach in RowingEngine.js

RowingEngine.js could report distance incrementally to RowingStatistics.js. However, we chose to report in absolute times and distances, making RowingEngine.js in full control of these essential metrics. This way, RowingEngine.js can report absolute times and distances, taking full control of the metrics regarding linear movement. Any derived metrics for specific clients, and smoothing/buffering, is done by RowingStatistics.

Adittionally benefit of this approach is that it makes transitions in intervals more smooth: RowingStatistics.js can intersect stroke without causing any pause in metrics (as RowingEngine.js keeps reporting absolutes, intervals and laps become a view on the same data).

## Open issues, Known problems and Regrettable design decissions

### Use of Raspbian

A default Raspian install does quite a decent job in extracting metrics, but the standard 32-bit kernel isn't optimised for IoT applications with low-latency requirements, like a rowing machine. The low latency (or more precise, less fluctuating latency) is essential to measure the time between impulses, as small measurement errors in these intervals will throw off force-curve calculations by presenting themselves as peaks.

Currently, the algorithms can handle a significant level of noise at the cost of the precission of the peaks, but the data might become more reliable and accurate when the noise is removed from the source.

An alternative is Ubuntu Core, which has a leaner 64-bit kernel, and where a low-latency kernel can be added later on quite easily. The IoT approach of Ubuntu, which heavily depends on Snap as main application deployment vehicle, is a change from the current architecture as it would require a containered application. From an install perspective, it would make much more sense to depend on a backend (i.e the hardware measurement and webserver) to be in one Snap, and the Frontend to be in another Snap (as Ubuntu-Frame provides this front-end functionality out of the box, and thus only needs to be configured). There especially are issues with storing settings, which need to be retained even when the Snap gets updated. Therefore, this is a far from trivial approach.

### Use of Node.js

The choice for a runtime interpreted language is at odds with the low latency requirements that is close to actual hardware. In theory, the performance of the app would heavily depend on the performance of NPM, which isn't optimized for low-latency and high frequency environments. In practice, we haven't run into any situations where CPU-load has proven to be too much, even when using experimental full quadratic Theil-Senn estimations. However, migrating the interrupt handler to C++ might reduce latency variations and thus improve results.

Switching from JavaScript/NPM to a precompiled C++ app completely would be doable, as the codebase is quite compact, but it would add a lot of complexity in deploying Open Rowing Monitor as the C++ code needs to be compiled for the target platform by the end user. In combination with the above, where Snap would do a lot of the heavy lifting to mitigate both platform dependence and application deployment, it might be an interesting approach to investigate.

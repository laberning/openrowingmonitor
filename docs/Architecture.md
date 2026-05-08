# OpenRowingMonitor architecture

<!-- markdownlint-disable no-inline-html -->
In this document, we describe the architectual construction of OpenRowingMonitor. For the reasons behind the physics, please look at [the Physics behind OpenRowingMonitor](Physics_Of_OpenRowingMonitor.md). In this document we describe the main functional blocks in OpenRowingMonitor, and the major design decissions.

## Platform choice

We have chosen for Raspberry Pi, instead of Arduino, due to the CPU requirements needed for some machines. The Raspberry Pi can easily be bought by regular users and installation of the OS and applications is pretty straightforward. It also allows for easy connection of hardware through the GPIO interface.

We have chosen to use Raspian as OS, as it is easily installed by the user, it provides a well maintained platform with many extensions, and it maintains a 64Bit PREEMPT kernel by default. [Ubuntu Core](https://ubuntu.com/core) provides a a leaner 64-bit low-latency kernel and their Snap-based IoT platform is beautiful, but it also requires a much more complex development and deployment toolchain, which would distract from the core application at the moment.

## Choice for Node.js and JavaScript

The choice has been made to use JavaScript to build te application, as many of the needed components (like GPIO and Bluetooth Low Energy) components are readily available. The choice for a runtime interpreted language is traditionally at odds with the low latency requirements that is close to physical hardware. The performance of the app depends heavily on the performance of node.js, which itself isn't optimized for low-latency and high frequency environments. However, in practice, we haven't run into any situations where CPU-load has proven to be too much or processing has been frustrated by latency, even when using full Theil-Senn quadratic regression models on larger flanks (which is O(n<sup>2</sup>)).

## Main functional components and flow between them

OpenRowingMonitor consists out of several isolated functional blocks, some even being their own thread, all communicating through `server.js`. Each functional block has its own manager, maging the entire functional block. In describing OpenRowingMonitor's main architecture, we distinguish between the dataflow and the controleflow. The latter typically is handled by the manager of the section.

We first describe the main data flows. Next, relation between these main functional components by describing the flow of the key pieces of information in more detail: the flywheel and heartrate measurements, as well as the command structure.

### Introduction: main data flow

At the highest level, we recognise the following functional components, with their primary dataflows:

```mermaid
flowchart LR
A(GpioTimerService.js) -->|currentDt| B(server.js)
B(server.js) -->|currentDt| D(SessionManager.js)
subgraph RowingEngine
  D(SessionManager.js) -->|currentDt| N(RowingStatistics.js)
  N(RowingStatistics.js) -->|currentDt| O(Rower.js)
  O(Rower.js) -->|currentDt| P(Flywheel.js)
  P(Flywheel.js) -->|Flywheel metrics| O(Rower.js)
  O(Rower.js) -->|Rowing metrics| N(RowingStatistics.js)
  N(RowingStatistics.js) -->|Rowing metrics| D(SessionManager.js)
end
D(SessionManager.js) -->|Rowing metrics| B(server.js)
B(server.js) -->|Rowing metrics| E(PeripheralManager.js)
C(PeripheralManager.js) -->|Workout plan| B(server.js)
B(server.js) -->|Workout plan| D(SessionManager.js)
C(PeripheralManager.js) -->|Heart rate data| B(server.js)
E(PeripheralManager.js) -->|Heart rate data| E(PeripheralManager.js)
subgraph peripherals
  E(PeripheralManager.js) -->|Rowing metrics + HR Data| F(ANT+ clients)
  E(PeripheralManager.js) -->|Rowing metrics + HR Data| G(BLE clients)
  E(PeripheralManager.js) -->|Rowing metrics + HR Data| Q(MQTT clients)
end
B(server.js) -->|currentDt| H(RecordingManager.js)
B(server.js) -->|Rowing metrics| H(RecordingManager.js)
B(server.js) -->|Heart rate data| H(RecordingManager.js)
subgraph Recorders
  H(RecordingManager.js) -->|currentDt| I(raw recorder)
  H(RecordingManager.js) -->|Rowing metrics| J(tcx-recorder)
  H(RecordingManager.js) -->|Heart rate data| J(tcx-recorder)
  H(RecordingManager.js) -->|Rowing metrics| K(FIT-recorder)
  H(RecordingManager.js) -->|Heart rate data| K(FIT-recorder)
  H(RecordingManager.js) -->|Rowing metrics| L(RowingData recorder)
  H(RecordingManager.js) -->|Heart rate data| L(RowingData recorder)
end
B(server.js) -->|Rowing metrics| M(WebServer.js)
B(server.js) -->|Heart rate data| M(WebServer.js)
subgraph clients
  M(WebServer.js) -->|Rowing metrics + HR Data| R(Client.js)
end
```

Here, *currentDt* stands for the time between the impulses of the sensor, as measured by the pigpio in 'ticks' (i.e. microseconds sinds OS start). The `GpioTimerService.js` is a small functional block that feeds the rest of the application.

Key element is that consuming functional blocks (clients) always will filter for themselves: the RowingEngine essentially transforms *currentDt*'s into useable rowing metrics, and attach flags onto them in the `metricsContext` object contained in the metrics. This context allows clients to act upon states that are specifically relevant to them (like the start of the drive, the start of a session, etc.), while ignoring updates that are irrelevant for them.

### Timing behaviour

Accurate time keeping and on-time data processing are crucial for OpenRowingMonitor to function well. To realize this, there are several blocks recognized:

* The **extreme low latency measurement process**: in essence, this is the `GpioTimerService.js` which measures with nanoseconds accuracy, requiring an extremely low latency. Frustrating this process will lead to measurement noise, requiring this process to run on quite an agressive NICE-level. This part of the application is kept deliberatly small to reduce overhead. On data intensive machines, this can produce a (*currentDt*) measurement every 2 miliseconds.
* The **high frequency metrics calculation**: in essence, this is `server.js` and the `RowingEngine`. Although processing isn't too time-critical per se, not having processed a *currentDt* before the next measurement arrives can frustrate the `GpioTimerService.js`. Setting the NICE-level too agressive will frustrate `GpioTimerService.js` as it easily consumes a lot of CPU cycles from it. Therefore, this part still is considered time critical but it can (and should) run on a more relaxed NICE-level compared to the `GpioTimerService.js`, but more agressive than regular processes. Please realise that the use of Theil-Sen estimators causes a significant CPU-load, making this the most CPU-intensive part of OpenRowingMonitor. As the `RowingEngine` will produce a set of metrics as a response to each *currentDt*, it will produce metrics every 2 milliseconds.
* The **non-time critical parts** of OpenRowingMonitor. Specificallythese are the recorders and the peripherals. Missing data for a couple of milliseconds will not be problematic here. To reduce CPU-load, in-session these will only filter the data and do heavy processing only when really needed, preferably after the session. These blocks recieve a message every 4 milliseconds, but peripherals typicall broadcast around 500 milliseconds, and recorders will typically record around every 2500 milliseconds.

Heartrate data is typically reported every 1000 milliseconds.

To put it more visually:

```mermaid
flowchart LR
A(GpioTimerService.js) -->|currentDt, every 2 ms| B(server.js)
B(server.js) -->|currentDt, every 2 ms| D(RowingEngine)
D(RowingEngine) -->|Rowing metrics, every 2ms| B(server.js)
B(server.js) -->|Rowing metrics, every 2ms| E(PeripheralManager.js)
B(server.js) -->|Rowing metrics, every 2ms| H(RecordingManager.js)
B(server.js) -->|Rowing metrics, every 2ms| M(WebServer.js)
```

> [!NOTE]
> An avenue for further improvement is to isolate the `GpioTimerService.js` process on a dedicated CPU, to prevent other processes from interfering with its timing.
<!-- MD028/no-blanks-blockquote -->
> [!NOTE]
> To further reduce CPU load, an option would be to move the non-time critical parts (i.e. the GUI, recorders and peripherals) into seperate processes, with their own (more relaxed) NICE-level.

### Command flow

All functional blocks have a 'manager', which expose a `handleCommand()` function, which respond to a defined set of commands. The function call parameters and the commands that can be recieved are identical to all managers, and they are expected to handle/ignore all commands.

These commands are explicitly restricted to external user actions (i.e. inputs via the web-interface or a peripheral). In essence, this is a user of external session control (via direct input, Bluetooth, ANT+ or MQTT) dictating behaviour of OpenRowingMonitor as an external trigger. Effects of metrics upon a session-state (i.e. session start or end based on a predefined session end) should be handled via the metrics updates. Adittionally, effects upon a session state as a result of a command (i.e. session ends because of a command) should also be handled via the metrics updates whenever possible. These manual commands are connected as follows:

```mermaid
sequenceDiagram
  participant webServer.js
  participant PeripheralManager.js
  participant server.js
  participant SessionManager.js
  participant RecordingManager.js
  PeripheralManager.js-)server.js: command<br>(interrupt based)
  webServer.js-)server.js: command<br>(interrupt based)
  server.js-)RecordingManager.js: command<br>(interrupt based)
  server.js-)PeripheralManager.js: command<br>(interrupt based)
  server.js-)webServer.js: command<br>(interrupt based)
  server.js-)SessionManager.js: command<br>(interrupt based)
  SessionManager.js-)server.js: Metrics Update<br>(interrupt based)
  server.js-)RecordingManager.js: Metrics Update<br>(interrupt based)
  server.js-)PeripheralManager.js: Metrics Update<br>(interrupt based)
  server.js-)webServer.js: Metrics Update<br>(interrupt based)
```

Both the `webServer.js` and `PeripheralManager.js` can trigger a command. Server.js will communicate this command to all managers, where they will handle this as they see fit. The following commands are defined:

| command | description | Relvant manager behaviour |
| --- | --- | --- |
| updateIntervalSettings | An update in the interval settings has to be processed. Here the `data` parameter has to be filled with a valid workout object in JSON format | The `SessionManager` will ingest it and use it to structure the workout (see its description). The `fitRecorder` will inject it in the recording |
| start | start of a session initiated by the user. As the true start of a session is actually triggered by the flywheel, which will always be communicated via the metrics, its only purpose is to make sure that the flywheel is allowed to move. This command is routinely sent at the start of a ANT+ FE-C communication. | The `SessionManager` will activate a stopped workout. All other managers will ignore the command, but will obey the `SessionManager`'s response. |
| startOrResume | User forced (re)start of a session. As the true start of a session is actually triggered by the flywheel, its only purpose is to clear the flywheel for further movement. This is not used in normal operation, but can functionally change a 'stopped' session into a 'paused' one. Intended use is to allow a user to continue beyond pre-programmed interval parameters as reaching them results in a session being 'stopped'. | The `SessionManager` will reactivate a stopped workout. All other managers will ignore the command, but will obey the `SessionManager`'s resonse. |
| pause | User/device forced pause of a session (pause of a session triggered from the flywheel will always be triggered via the metrics) | The `SessionManager` will pause an an active workout. All other managers will ignore the command, but will obey the `SessionManager`'s response. |
| stop | User/device forced stop of a session (stop of a session triggered from the flywheel will always be triggered via the metrics) | The `SessionManager` will stop the active workout. All other managers will ignore the command, but will obey the `SessionManager`'s response. |
| reset | User/device has reset the session | All managers will respond by closing the session decently and subsequently resetting their state to the initial state |
| switchBlePeripheralMode | User has selected another BLE device from the GUI | The `peripheralManager` will effectuate this, the rest of the managers will ignore this |
| switchAntPeripheralMode | User has selected another ANT+ device from the GUI | The `peripheralManager` will effectuate this, the rest of the managers will ignore this |
| switchHrmMode | User has selected another heartrate device | The `peripheralManager` will effectuate this, the rest of the managers will ignore this |
| refreshPeripheralConfig | A change in heartrate, BLE or ANT+ device has been performed by the `peripheralManager` | The WebServer/GUI will refresh the current config from the settings manager, the rest of the managers will ignore this |
| upload | A request from the GUI is made to upload the recordings that are set to upload manually | `recordingManager` will handle this request. |
| shutdown | A shutdown is requested, also used when a part of the application crashes or the application recieves a 'SIGINT' | All managers will respond by closing the session decently and closing hardware connections |

> [!NOTE]
> To guarantee a decent closure of data, a 'stop' command from the user will be ignored by `RecordingManager.js` and `PeripheralManager.js`. The `SessionManager.js` will respond with a new set of metrics, with the 'isSessionStop' flag embedded. On a 'shutdown' command, `RecordingManager.js` and `PeripheralManager.js` do respond by closing their datastreams as if a session-stop was given, to ensure a decent closure.

### Rowing metrics flow

We first follow the flow of the flywheel data, which is provided by the interrupt driven `GpioTimerService.js`. The only information retrieved by OpenRowingMonitor is *CurrentDt*: the time between impulses. This data element is transformed in meaningful metrics in the following manner:

```mermaid
sequenceDiagram
  participant clients
  participant pigpio
  participant GpioTimerService.js
  participant server.js
  participant SessionManager.js
  participant RowingStatistics.js
  participant Rower.js
  participant Flywheel.js
  pigpio -)GpioTimerService.js: tick<br>(interrupt based)
  GpioTimerService.js-)server.js: currentDt<br>(interrupt based)
  server.js-)SessionManager.js: currentDt<br>(interrupt based)
  SessionManager.js-)RowingStatistics.js: currentDt<br>(interrupt based)
  RowingStatistics.js->>Rower.js: currentDt<br>(interrupt based)
  Rower.js->>Flywheel.js: currentDt<br>(interrupt based)
  Flywheel.js-->>Rower.js: Angular metrics, Flywheel state<br>(interrupt based)
  Rower.js-->>RowingStatistics.js: Strokes, Linear metrics<br>(interrupt based)
  RowingStatistics.js-->>SessionManager.js: Metrics Updates<br>(interrupt based)
  SessionManager.js-)server.js: Metrics Updates<br>(interrupt based/Time based)
  server.js-)clients: Metrics Updates<br>(State/Time based)
```

The clients (both the webserver and periphals) are updated based on the updates of metrics. OpenRowingMonitor therefore consists out of two subsystems: an solely interruptdriven part that processes flywheel and heartrate interrupts, and the time/state based needs of the clients. It is the responsibility of `SessionManager.js` to provide a steady stream of updated metrics as it monitors the timers, session state and guarantees that it can present the clients with the freshest data available. It is the responsibility of the clients themselves to act based on the metric updates, and guard against their internal timers. If a broadcast has to be made periodically, say ANT+ updates every 400ms, the ANT+-peripheral should buffer metrics and determine when the broadcast is due. This is needed as more complex broadcast patterns, like the PM5 which mixes time and event based updates, are too complex to manage from a single point.

A key thing to realize is that `SessionManager.js` will process *currentDt* values and it will transform them into one or more *metricsUpdate* messages. Especially at the end of a lap or split, a single *currentDt* value can result in multiple *metricsUpdate* messages as the `SessionManager.js` will interpolate between distances/times to exactly hit the lap/split end, generating an extra message. Also, when the pause timer is running, a message will be broadcast every second to signal this. When the `SessionManager.js`'s watchdog acts upon an unexpected stop of the *currentDt* flow, spontanuous messages will appear to signal this as well. To enable this behaviour, the message based structure used by `SessionManager.js` is needed.

Part of the metrics is the metricsContext object, which provides an insight in the state of both stroke (determined in `RowingStatistics.js`) and session (determined in `SessionManager.js`), allowing the clients to trigger on these flags. The following flags are recognised:

| Flag | Meaning |
| --- | --- |
| isMoving | Rower is moving |
| isDriveStart | Current metrics are related to the start of a drive |
| isRecoveryStart | Current metrics are related to the start of a recovery |
| isSessionStart | Current metrics are related to the start of a session |
| isIntervalEnd | Current metrics are related to the end of an session interval. An interval implies that there will be no stop of the rowing session between the current and next interval unless there is an intended (temporary) rest period in the session after the interval. If a rest is specified (the flywheel is intended to stop), a "isPauseStart" is indicated as well. |
| isSplitEnd | Current metrics are related to the end of a session split. |
| isPauseStart | Current metrics are related to the start of a session pause. This implies that the flywheel is intended to stop after this message (interval with a forced rest period), or actually has stopped (spontanuous pause). |
| isUnplannedPause | Indication by the sessionManager that the metrics are inside a spontanuous pause if set to 'true'. Used to distinguish between a planned and unplanned pause by the PM5 emulator. |
| isPauseEnd | Current metrics are related to the end of a session pause, implying that the flywheel has started to move again. This is **NOT** sent upon completion of a planned rest period, as the pause is only eneded after the flywheel to reaches its minimum speed again. To identify if the SessionManager is still blocking metrics due to the pause still being active, check if the `pauseCountdownTime` is equal to 0. |
| isSessionStop | Current metrics are related to the stop of a session (i.e. this will be the last meaningful metrics update). |

State driven clients, like the PM5 interface and the file recorders, will react to these flags by recording or broadcasting when these flags are seen. Please note that several flags can be raised at the same time (for example isDriveStart, isSessionStart and isIntervalStart, but also isIntervalStart and isDriveStart), requiring the consumers to handle these overlapping situations.

### Heartrate data flow

Secondly, the heartrate data follows the same path, but requires significantly less processing:

```mermaid
sequenceDiagram
  participant heartrateMonitor
  participant PeripheralManager.js
  participant server.js
  participant webServer.js
  participant RecordingManager.js
  heartrateMonitor-)PeripheralManager.js: heartrate data<br>(interrupt based)
  PeripheralManager.js-)PeripheralManager.js: heartrate data<br>(interrupt based)
  PeripheralManager.js-)server.js: heartrate data<br>(interrupt based)
  server.js-)webServer.js: heartrate data<br>(interrupt based)
  server.js-)RecordingManager.js: heartrate data<br>(interrupt based)
```

> [!NOTE]
> The `PeripheralManager.js` will internally also distribute heartrate updats to data consuming ANT+ and BLE peripherals.

### Key components in data generation

#### pigpio

`pigpio` is a wrapper around the [pigpio C library](https://github.com/joan2937/pigpio), which is an extreme high frequency monitor of the pigpio port. As the pigpio npm is just a wrapper around the C library, all time measurement is done by the high cyclic C library, making it extremely accurate. It can be configured to ignore too short pulses (thus providing a basis for debounce) and it reports the `tick` (i.e. the number of microseconds since OS bootup) when it concludes the signal is valid. It reporting is detached from its measurement, and we deliberatly use the *Alert* instead of the *Interrupt* as their documentation indicates that both types of messaging provide an identical accuracy of the `tick`, but *Alerts* do provide the functionality of a debounce filter. As the C-implementation of `pigpio` determines the accuracy of the `tick`, this is the only true time critical element of OpenRowingMonitor. Latency in this process will present itself as noise in the measurements of *CurrentDt*.

#### GpioTimerService.js

`GpioTimerService.js` is a small independent worker thread, acting as a data handler to the signals from `pigpio`. It translates the *Alerts* with their `tick` into a stream of times between these *Alerts* (which we call *CurrentDt*). The interrupthandler is still triggered to run with extreme low latency as the called `gpio` process will inherit its nice-level, which is extremely time critical. To OpenRowingMonitor it provides a stream of measurements that needed to be handled.

#### Server.js

`Server.js` orchestrates all information flows and starts/stops processes when needed. It will:

* Recieve (interrupt based) GPIO timing signals from `GpioTimerService.js` and send them to the `SessionManager.js`;
* Recieve (interrupt based) Heartrate measurements and sent them to the all interested clients;
* Recieve the metrics update messages from [`SessionManager.js`](../app/engine/SessionManager.js)` (time-based and state-based updates of metrics) and distribut them to the webclients and periphials;
* Handle user input (through webinterface and periphials) and instruct all managers to act accordingly;

#### SessionManager.js

[`SessionManager.js`](../app/engine/SessionManager.js) recieves *currentDt* updates, forwards them to `RowingStatistics.js` and subsequently recieves the resulting metrics. Based on state presented, it updates the finite state machine of the sessionstate and the associated metrics. In a nutshell:

* [`SessionManager.js`](../app/engine/SessionManager.js) maintains the session state, thus determines whether the rowing machine is 'Rowing', or 'WaitingForDrive', etc.,
* [`SessionManager.js`](../app/engine/SessionManager.js) maintains the workout intervals, guards interval and split boundaries, and will chop up the metrics-stream accordingly, where [`SessionManager.js`](../app/engine/SessionManager.js) will just move on without looking at these artifical boundaries.
* [`SessionManager.js`](../app/engine/SessionManager.js) maintains the summary metrics for the entire workout, the current interval, and the current split.

In total, this takes full control of the displayed metrics in a specific workout, interval and split (i.e. distance or time to set workout segment target, etc.).

##### session, interval and split boundaries in SessionManager.js

The `handleRotationImpulse` function of the [`SessionManager.js`](../app/engine/SessionManager.js) implements guarding the boundaries of the workoutplan. The session manager maintains three levels in a workoutplan:

* The overall session: which is derived by summarising the intervals, and provides a general context for all overall statistics
* The planned interval(s), which can be programmed via the PM5 and MQTT interface, this defaults to 'jutrow' when no data is provided
* Underlying splits, dividing up a planned interval. Splits default to the entire interval when not provided.

> [!NOTE]
> Unplanned rests are adminstered as rest splits, allowing them to be easily isolated from active parts of the training. The tcx and fit recorder explicitly distinguish between active and rest laps.

This setup is needed to maintain compatibility with the several outputs, where the PM5 emulation and FIT-data recording are the most dominant. The PM5 can be programmed to have a workout with intervals of a different length/type, but also have a single distance with underlying splits. In practice, using the default behaviour of splits 'inheriting' parameters from the interval, this all translates to being able to always report on the level of splits toi the PM5 interface. The fit-recorder divides a session into laps, where each lap (i.e. split) can be associated with a workoutstep (i.e. interval), again making the split the key element being reported.

Schematically, a session is constructed as follows:

<table><thead>
  <tr>
    <th colspan="8">Session</th>
  </tr></thead>
<tbody>
  <tr>
    <td colspan="2">Interval 1</td>
    <td colspan="3">Interval 2</td>
    <td colspan="3">Interval 3</td>
  </tr>
  <tr>
    <td>Split 1</td>
    <td>Split 2</td>
    <td>Split 3</td>
    <td>Split 4</td>
    <td>Split 5</td>
    <td>Split 6</td>
    <td>Rest</td>
    <td>Split 7</td>
  </tr>
</tbody>
</table>

OpenRowingMonitor will always report the ending of a split, interval and session, and the last message in the split/interval/session will be flagged with a isSplitEnd/isIntervalEnd/isSessionStop flag. Ending an interval will also end the split, raising both flags. Please note that the [PM5 peripheral](./PM5_Interface.md) has a different approach and that difference is handled by the PM5 peripheral itself.

> [!NOTE]
> The state transitions for the end of an interval and the end of a session (i.e. no next interval) are flagged individually as the resulting metrics updates differ slightly, and the expected behaviour of all other managers is different (especially as recorders and peripherals will stop the workout).

##### sessionStates in SessionManager.js

The `handleRotationImpulse` function of the [`SessionManager.js`](../app/engine/SessionManager.js) also implements all the state transitions regarding the sessionstates:

```mermaid
stateDiagram-v2
    [*] --> WaitingForStart
    WaitingForStart --> Rowing: strokeState<br>is 'Drive'
    state Rowing {
        strokeState=Drive --> strokeState=Recovery
        strokeState=Drive --> strokeState=Drive
        strokeState=Recovery --> strokeState=Drive
        strokeState=Recovery --> strokeState=Recovery
    }
    Rowing --> Paused: strokeState is 'WaitingForDrive'<br>OR<br>Next interval is of 'rest' type
    Paused --> Rowing: strokeState<br>is 'Drive'
    Rowing --> Stopped: Last interval completed
    Stopped --> [*]
```

> [!NOTE]
> The [`SessionManager`](../app/engine/SessionManager.js) contains a watchdog which will timeout on recieving new *currentDt* values, which forces the state machine into 'Paused' when triggered. This watchdog is needed for specific high drag magnetic rowers that completely stop their flywheel within seconds.
<!-- MD028/no-blanks-blockquote -->
> [!NOTE]
> A session being 'stopped' can technically be turned into a 'Paused' by sending the 'startOrResume' command to the `handleCommand` function of [`SessionManager.js`](../app/engine/SessionManager.js). Some peripherals send this command routinely.

#### RowingStatistics.js

[`RowingStatistics.js`](../app/engine/RowingStatistics.js)  recieves *currentDt* updates, forwards them to [`Rower.js`](../app/engine/Rower.js) and subsequently inspects [`Rower.js`](../app/engine/Rower.js) for the resulting strokestate and associated metrics. Based on this inspection, it updates the associated metrics (i.e. linear velocity, linear distance, power, etc.). The goal is to translate the linear state-dependent rowing metrics from [`Rower.js`](../app/engine/Rower.js) into meaningful stream of information for the consumers of data. As [`Rower.js`](../app/engine/Rower.js) can only provide a limited set of absolute metrics at a specific time (as most are stroke state dependent) and is unaware of previous strokes, [`RowingStatistics.js`](../app/engine/RowingStatistics.js) will consume this data and transform it into a consistent and more stable set of metrics useable for presentation. [`RowingStatistics.js`](../app/engine/RowingStatistics.js) also buffers data as well, providing a complete set of metrics regardless of stroke state. Adittionally, [`RowingStatistics.js`](../app/engine/RowingStatistics.js) also smoothens data across strokes to remove eratic behaviour of metrics due to small measurement errors.

In a nutshell:

* [`RowingStatistics.js`](../app/engine/RowingStatistics.js) persists metrics to guarantee that they will always reflect the last known valid state to data consumers, removing the need for consumers to understand the effect of stroke state upon metrics validity,
* [`RowingStatistics.js`](../app/engine/RowingStatistics.js) applies a moving median filter across strokes to make metrics less volatile and thus better suited for presentation,
* [`RowingStatistics.js`](../app/engine/RowingStatistics.js) calculates derived metrics (like Calories) and trends (like Calories per hour),

In total, this takes full control of buffering and stabilising the displayed metrics in a specific stroke.

#### Rower.js

[`Rower.js`](../app/engine/Rower.js) recieves *currentDt* updates, forwards them to [`Flywheel.js`](../app/engine/Flywheel.js) and subsequently inspects [`Flywheel.js`](../app/engine/Flywheel.js) for the resulting state and angular metrics, transforming it to a strokestate and linear metrics.

##### strokeStates in Rower.js

[`Rower.js`](../app/engine/Rower.js) can have the following strokeStates:

```mermaid
stateDiagram-v2
  [*] --> WaitingForDrive
  WaitingForDrive --> Drive: Flywheel<br>is powered
  Drive --> Recovery: Flywheel<br>is unpowered
  Drive --> Drive: Flywheel<br>is powered
  Recovery --> Drive: Flywheel<br>is powered
  Recovery --> Recovery: Flywheel<br>is unpowered
  Recovery --> WaitingForDrive: Last drive too<br>long ago
  Drive --> Stopped
  Recovery --> Stopped
  Stopped --> [*]
```

> [!NOTE]
> The `Stopped` state is only used for external events (i.e. [`RowingStatistics.js`](../app/engine/RowingStatistics.js) calling the stopMoving() command), which will stop [`Rower.js`](../app/engine/Rower.js) from processing data. This is a different state than `WaitingForDrive`, which can automatically move into `Drive` by accelerating the flywheel. This is typically used for a forced exact stop of a rowing session (i.e. reaching the end of an interval).

##### Linear metrics in Rower.js

[`Rower.js`](../app/engine/Rower.js) inspects the flywheel behaviour on each impuls and translates the flywheel state into the strokestate (i.e. 'WaitingForDrive', 'Drive', 'Recovery', 'Stopped') through a finite state machine. Based on the angular metrics (i.e.e drag, angular velocity, angular acceleration) it also calculates the updated associated linear metrics (i.e. linear velocity, linear distance, power, etc.). As most metrics can only be calculated at (specific) phase ends, it will only report the metrics it can claculate. Aside temporal metrics (Linear Velocity, Power, etc.) it also maintains several absolute metrics (like total moving time and total linear distance travelled). It only updates metrics that can be updated meaningful, and it will not resend (potentially stale) data that isn't updated.

#### Flywheel.js

[`Flywheel.js`](../app/engine/Flywheel.js) recieves *currentDt* updates and translates that into a state of the flywheel and associated angular metrics. It provides a model of the key parameters of the Flywheel, to provide the rest of OpenRowingMonitor with essential physical metrics and state regarding the flywheel, without the need for considering all kinds of parameterisation. Therefore, [`Flywheel.js`](../app/engine/Flywheel.js) will provide all metrics in regular physical quantities, abstracting away from the measurement system and the associated parameters, allowing the rest of OpenRowingMonitor to focus on processing that data.

It provides the following types of information:

* the state of the flywheel (i.e. is the flywheel powered, unpowered or even Dwelling)
* temporal metrics (i.e. Angular Velocity, Angular Acceleration, Torque, etc.)
* several absolute metrics (i.e. total elapsed time and total angular distance traveled)
* physical properties of the flywheel, (i.e. the flywheel drag and flywheel inertia)

A key task also filtering noise from the measurements, providing stable and consistent measurements to the rest of the application. Internally, several different filters are employed:

```mermaid
---
config:
  layout: elk
---
flowchart LR
    A@{ shape: text, label: "currentDt"} --> B[Cyclic Error Filter<br>cyclicErrorFilter] --> C@{ shape: text, label: "cleaned currentDt"} --> F@{ shape: text, label: "Base Metrics:<br>* Angular distance<br>* totalTimeSpinning" }
    C@{ shape: text, label: "cleaned currentDt"} --> D[Moving Regressor<br>_angularDistance] --> E@{ shape: text, label: "Advanced Metrics:<br>* Angular velocity<br>* angular Acceleration<br>* Torque<br>* Total work"}
    C@{ shape: text, label: "cleaned currentDt"} --> G[Linear Regression<br>recoveryDeltaTime] --> H@{ shape: text, label: "Dragfactor" }
    G[Linear Regression<br>recoveryDeltaTime] -->|Regression line|B[Cyclic Error Filter<br>cyclicErrorFilter]
```

For a further description of the filters, see the [mathematical foundations of OpenRowingMonitor](./Mathematical_Foundations.md).

### Key components in data dissamination

#### PeripheralManager

The Peripheralmanager manages all BLE, ANT+ and MQTT perpherals. It is the source for heartrate data and can also send user commands based on ANT+, BLE or MQTT input.

#### RecordingManager

RecordingManager is the base for all recording, recording uploading as well as all normal logging. It acts as a multiplexer over the various recorders, letting the datarecorders decide for themselves how to react to specific metrics and a limited set of relevant commands. The recorders record data according their own rules (fitting with the content they need to generate) and will create a valid file content with accompanying meta-data.

The RecordingManager also directly manages the uploaders and the filewriter: they take thefile content and its meta-data from a recorder and upload it to a webservice or write it to disk.

## Major design decissions

### Staying close to *currentDt*

*currentDt* is defined as the time between impulses, which is the core measurement of any rowing machine. These values tend to range between 0.050 and 0.005 seconds, and are subject to small measurement errors due to vibrations in the rower but also scheduling issues in the Raspberry Pi OS.

Working with small numbers, and using the impulse time to calculate the angular velocity (i.e. dividing the angular distance travelled through currentDt), or even calculating angular acceleration (i.e. dividing angular velocity through currentDt) tends to enlarge these measurement errors. Therefore, whenever possible, calculations are based on the raw currentDt or Robust Regression methods, rather than numerical derived metrics, to prevent chaotic behaviour of OpenRowingMonitor.

### Absolute approach in Rower.js

`Rower.js` could report distance incrementally to `RowingStatistics.js`. However, we chose to report in absolute times and distances, making `Rower.js` in full control of these essential metrics. This way, `Rower.js` can report absolute times and distances, taking full control of the metrics regarding linear movement. This way, these metrics can be calculated temporarily for frequent updates, but calculated definitively when the phase completes. Any derived metrics for specific clients, and smoothing/buffering, is done by `RowingStatistics.js`.

Adittional benefit of this approach is that it makes transitions in intervals more smooth: `SessionManager.js` can intersect stroke without causing any pause in metrics (as `Rower.js` and `RowingStatistics.js` keep reporting absolutes, intervals and laps become a view on the same data).

## Open issues, Known problems and Regrettable design decissions

### Limits to CPU use

OpenRowingMonitor allows setting the NICE-level of both the `GpioTimerService.js` worker thread and the main application. We have seen that setting the NICE-level too agressive on a Raspberry Pi 4B (i.e. -7 for `GpioTimerService.js`, and -5 for the main application) results in very decent results (for example, an average GoodnessOfFit of 0.9837 for the recovery slope on a Concept2 RowErg) without any reported issues anywhere and enough CPU cycles to handle the load.

HOWEVER, when compared to an oracle system (the Concept2 PM5), we see quite a variation in deviation with that result.

| Distance | Minimal deviation | Average deviation | Maximal deviation | Deviation Spread |
| --- | --- | --- | --- | --- |
| 5000 meters | 0.70 sec | 1.08 sec | 1.40 sec | 0.70 sec |
| 10000 meters | 0.70 sec | 1.05 sec | 1.40 sec | 0.80 sec |
| 21097 meters | 0.70 sec | 1.08 sec | 1.30 sec | 0.60 sec |

The deviation spread over 0.8 seconds suggests that measurement is unstable. Reducing the NICE-level too a little less agressive on a Raspberry Pi 4B (i.e. -6 for `GpioTimerService.js`, and -3 for the main application) seems to yield better results.

### Lack of support for the Raspberry Pi 5

Along with the introduction of Raspberry Pi 5, a new GPIO hardware architecture has been introduced, breaking compatibility with `pigpio` (see [issue 52](https://github.com/JaapvanEkris/openrowingmonitor/issues/52)). As discussed there, `pigpio` has strong benefits over competing libraries, specifically

* the provision of a high resolution measurement
* the possibility to measure on the upward or downward moving flank, or both
* the provision of a built-in debounce filter

An alternative is the `onoff` library, which was used in OpenRowingMonitor up to version 0.8.2. This does work with the new RPi5 architecture. Although the latter benefit could be moved to `GpioTimerService.js`, the two former benefits can't. Based on test runs with historic data, we see a significant drop in dataquality. For example, we see a significant drop in the average Goodness of Fit for drag detection from 0.97-0.99 to 0.80-0.85. We also see a very significant increase in cyclic error correction error messages, forced cyclic error filter resets and stroke detection errors, where in the `pigpio` setup these are very rare. Therefore, we decided to wait with moving to onoff until a decent alternative for `pigpio` emerges.

### Race conditions between commands and metrics

In specific situations (especially the 'reset' command), the command triggers an update of the metrics by the `SessionManager.js` to close the current sesssion, as well trigger a new metrics update for the new session. As all other managers get the same command around the same time, this is a root cause for race conditions where the 'reset' causes a recorder to complete a session and write the file, and the metrics update will modify it.

### Structural issues with the PM5 interface and the interal OpenRowingMonitor workout structure

OpenRowingMonitor's workout structure is similar to Garmin's and many output formats (like the tcx, fit and RowingData formats). However, this approach is different from the PM5 workout structure, leading to a complex interface which statefully has to manage the discrepencies. Key issue is that the concepts of Interval and Split are badly defined in the PM5, and rest periods are not considered independent entities. A key issue is handling unscheduled breaks in a split/interval: the PM5 seems to expect that an interval with a pause still behaves as a single interval. See also the [description of the PM5 interface](./PM5_Interface.md) for more information.

### Intertwined relation `Flywheel.js` and `Rower.js` regarding stroke state

`Rower.js` and `Flywheel.js` have an odd intertwined relation: `Flywheel.js` determines the dragfactor, but in order to do that, it needs to know whether it is in a recovery phase, which is determined by `Rower.js`. This technically breaks the dataflow, as processing of the data in `Flywheel.js` becomes dependent on the stroke state determined in `Rower.js` as a resonse to the flywheel state determined in `Flywheel.js`. At its core, dragfactor is a flywheel property, and thus concepually should be positioned in `Flywheel.js`. But from a physics perspective, one can only determine the dragfactor when the stroke state is in recovery. The case can be made that it should be positioned in `Rower.js`, making `Flywheel.js` a conduit only providing angular velocity and angular acceleration. As a side-effect, many calculations that depend on dragfactor (i.e. flywheel torque, etc.) and decissions based upon that (i.e. `isPowered()` and `isUnpowered()`) are also moved to `Rower.js`. This would make `Rower.js` an even stronger concentration of decission logic, without the aid of the current abstractions of `Flywheel.js` to keep the code readable. therefore, it was agreed against it.

### Use of classes for fundamental datatypes

OpenRowingMonitor depends a lot on special datatypes, like the `FullTSLinearSeries.js` and `FullTSQuadraticSeries.js` that are the fundamental basis for the physics engine. Unlike some other parts, these have not been converted to a ES6's class-like structure, although their fundamental naure would suggest they should. There are three main reasons for this:

* In JavaScript, a class-like structure is a syntactic modification that does not provide any additional technical benefits, making a change to a class-like structure a pure esthetic excercise.
* The resulting code did not become easier to read. As it would be a purely esthetic excercise, the main argument for implementation would be that the resulting code is easier to understand. Our experience it actually degrades as it results in adding a lot of `this.` to internal variables and making variable scoping more confusing.
* Testing has shown that a side-effect of moving to this new structure is a decrease in performance. As these fundamental datatypes are instantiated and destroyed quite often, having some overhead on this might cause this. But the effect was substatial enough to be measureable, and as it is in a time-critical portion of the application, making this unacceptable.

Although deciding against a class-based notation based on this experiment, we did change the exposure of internal variables (for example, making `fullTSSeries.minimumY()` into `fullTSSeries.Y.minimum()`) and explicitly exported the constructor function, preparing for a final move towards such a setup might the above issues be resolved and improving code readability.

### Issues in the physics model

Please see [Physics behind OpenRowingMonitor](physics_openrowingmonitor.md) for some issues in the physics model

# Description of the PM5 interface

This document describes the design choices underpinning our PM5 interface. If you are not redesigning or modifying this implementation, this document probably isn't for you.

The design goal is to emulate PM5 communication sufficiently for users to connect easily to apps. We aim to have maximum compatibility with all these apps, making these apps to intuitively to use with OpenRowingMonitor. However, it explicitly is **NOT** our goal to completely emulate a full-blown PM5 with racing features and logbook verification. Also features that might lead to cheating or uploading results to the Concept2 logbook are explicitly excluded. Some testing is one on ErgData, as we consider it the definitive source how Concept2's data is to be interpreted, thus excluding interpretation errors by independent software developers based on less than optimal specifications.

This interface emulation is partially based on the description in Concept 2's API documentation ([[1]](#1) and [[2]](#2)). As this documentation is inconclusive about the timing/triggers for messages, as well as the exact definition of the values used, a large part is also based on analysis of the communication via recorded bluetooth traces with current PM5's.

## Design target for interoperability

We aim to be interoperable with the following apps:

<!-- markdownlint-disable no-inline-html -->
| App | Required&nbsp;characteristics&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Remarks |
| --- | --------- | ------ |
| [ErgArcade cloud simulation](https://ergarcade.github.io/mrdoob-clouds/) | <ul><li>[0x0031 "General Status"](#0x0031-general-status)</li><li>[0x0032 "Additional Status"](#0x0032-additional-status)</li></ul> | |
| [ErgArcade fluid simulation](https://ergarcade.github.io/WebGL-Fluid-Simulation/) | <ul><li>[0x0031 "General Status"](#0x0031-general-status)</li></ul> | Actually only uses `STROKESTATE_DRIVING` |
| Ergometer space | Does not subscribe to anything, seems to respond to [0x0031 "General Status"](#0x0031-general-status)</li> | Sends a lot of outdated CSAFE commands which will be ignored by OpenRowingMonitor |
| [EXR](https://exrgame.com/) | <ul><li>[CSAFE Commands](#csafe-commands)</li><li>[0x0031 "General Status"](#0x0031-general-status)</li><li>[0x0032 "Additional Status"](#0x0032-additional-status)</li><li>[0x0033 "Additional Status 2"](#0x0033--additional-status-2)</li><li>[0x0035 "Stroke Data"](#0x0035-stroke-data)</li><li>[0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data)</li><li>[0x003d "Force Curve data"](#0x003d-force-curve-data)</li></ul> | EXR will only create `WORKOUTTYPE_FIXEDDIST_NOSPLITS` and `WORKOUTTYPE_FIXEDTIME_NOSPLITS` workouts via 'verified C2 workouts' |
| [ErgZone](https://erg.zone/) | <ul><li>[CSAFE Commands](#csafe-commands)</li><li>[0x0031 "General Status"](#0x0031-general-status)</li><li>[0x0032 "Additional Status"](#0x0032-additional-status)</li><li>[0x0033 "Additional Status 2"](#0x0033--additional-status-2)</li><li>[0x003e "Additional Status 3"](#0x003e-additional-status-3)</li><li>[0x0035 "Stroke Data"](#0x0035-stroke-data)</li><li>[0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data)</li><li>[0x003d "Force Curve data"](#0x003d-force-curve-data)</li><li>[0x0037 Split Data](#0x0037-split-data)</li><li>[0x0038 Additional Split Data](#0x0038-additional-split-data)</li><li>[0x0039 "Workout Summery"](#0x0039-workout-summery)</li><li>[0x003a "Additional Workout Summary"](#0x003a-additional-workout-summary)</li><li>[0x003f "Logged Workout"](#0x003f-logged-workout)</li></ul> | |
| [KinoMap](https://www.kinomap.com) | <ul><li>[0x0031 "General Status"](#0x0031-general-status)</li><li>[0x0032 "Additional Status"](#0x0032-additional-status)</li><li>[0x0033 "Additional Status 2"](#0x0033--additional-status-2)</li><li>[0x003e "Additional Status 3"](#0x003e-additional-status-3)</li><li>[0x0035 "Stroke Data"](#0x0035-stroke-data)</li><li>[0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data)</li><li>[0x003d "Force Curve data"](#0x003d-force-curve-data)</li><li>[0x0037 Split Data](#0x0037-split-data)</li><li>[0x0038 Additional Split Data](#0x0038-additional-split-data)</li><li>[0x0039 "Workout Summery"](#0x0039-workout-summery)</li><li>[0x003a "Additional Workout Summary"](#0x003a-additional-workout-summary)</li></ul> | |
| [Regatta](https://teamregatta.com/) | <ul><li>[0x0031 "General Status"](#0x0031-general-status)</li><li>[0x0032 "Additional Status"](#0x0032-additional-status)</li><li>[0x0033 "Additional Status 2"](#0x0033--additional-status-2)</li></ul> | |
<!-- markdownlint-enable no-inline-html -->

Some apps, like Aviron, Ergatta, Hydrow, iFIT and Peleton claim compatibility with a PM5, and theoretically should work. As we could not test them ourselves due to regional/device limitations, we do not consider them a design target.

## Structural differences between OpenRowingMonitor and a PM5

As OpenRowingMonitor and PM5 have been independently developed, the design choices that have been made are not consistent by default. Here we adress these differences, as they are quite essential in the further implementation.

### Workout Hierarchy

OpenRowingMonitor recognizes three levels in a workout: the Session, the underlying Intervals and the Splits in these Intervals (see [the architecture document](./Architecture.md#session-interval-and-split-boundaries-in-sessionmanagerjs) for a more detailed description). A PM5 recognizes either a workout with one or more Intervals of varying length, or a single workout with several underlying splits with identical length. Some apps (ErgZone) even optimize workouts with multiple identical intervals to a workout with splits. This might lead to confusing situations where GUI behaviour changes radically due to trivial changes (like shortening a last interval by 1 second), but we consider that beyind our control to adresss.

The [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) therefore will map:

* a fixed time/distance PM5 workout to a single OpenRowingMonitor Interval, and add the specified splits as OpenRowingMonitor splits if specified.
* A PM5 workout with multiple intervals to multiple OpenRowingMonitor Intervals, without any splits specified (as they can't be specified by the PM5).

This makes scoping of many summarisimg variables challenging as it is unclear whether a variable is intended to capture a split or the interval. Concept2's ambiguous description of most variables in [[1]](#1) and [[2]](#2) does not provide any clarification here.

Our approach here is to make [workoutSegment.js](../app/engine/utils/workoutSegment.js)'s default behaviour with missing split parameters to help overcome these structural issues. When split parameters are mising, it will always 'inherit' the parameters of the above interval (in essence making the split boundaries identical to the interval). This makes the splits always contain the most granular division of the workout regardless of how the PM5 has communicated the workout. In reporting back to the app, the splits are thus the most likely basis for reporting in the PM5 emulated reporting. However, some variables seem to be scoped to the interval or workout level explicitly. A key reason for conducting the traces is to understand the scoping of each variable to prevent confusing these apps.

### Positioning split/interval reporting

OpenRowingMonitor will always report on the end-of-split boundary, including a summary of the split it just completed. A PM5 will report this **after** the split has concluded (i.e. in the new split), reporting about the split it has completed.

### Positioning planned rest intervals

OpenRowingMonitor treats planned rest intervals similar to normal time based intervals, with the exception that the rowing engine is forced to stop collecting metrics during that interval. A PM5 considers a rest interval a subordinate attribute of a normal interval, and it isn't an independent entity. In [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) this is managed by adding a rest interval to OpenRowingMonitor's workout schedule.

In reporting, we indeed see the PM5 skipping the split/interval reporting when the pause starts, and including the rest data with the split reporting after the pause has ended. This is consistent with Concept2's approach that a rest interval only is an extension of an active interval. In OpenRowingMonitor this behaviour is replicated by not reporting the start of a pause as new split, and combining the data from the active split and the rest split. Although the underlying datasets are largely disjunct (as rest intervals have little data associated with them), a key issue is the reporting of the IntervalType, WorkoutState and workoutDurationType in [0x0031 General Status](#0x0031-general-status), and the intervalType [0x0037 "Split Data"](#0x0037-split-data).

In starting a pause our traces show that message [0x0031 General Status](#0x0031-general-status)'s 'IntervalType' is set from `IntervalTypes.INTERVALTYPE_DIST` to `IntervalTypes.INTERVALTYPE_REST`. [0x0037 "Split Data"](#0x0037-split-data)'s 'IntervalType' reports an `IntervalTypes.INTERVALTYPE_DIST`. For the GeneralStatus message, the workout target clearly contains an element of OpenRowingMonitor's 'sessionState' object (i.e. verify if the sessionState is paused).

### Positioning unplanned rests

People might deviate from their workout plan and take a break mid-session. In OpenRowingMonitor this is treated as a seperate rest split, clearly separating active and passive metrics. Especially for downstream reporting, like Strava, this simplifies analysis a lot. The PM5 essentially ignores the pause, lets time continue and does not change split/interval upon detection. This is emulated by ignoring the reporting of unplanned pauses to apps. All summarizing metrics will be aggregated accoringly, also including rest time where relevant.

### Different definition of moving time and rest time

There is a subtle, but significant, difference in the definitions used for timekeeping. OpenRowingMonitor registers moving time and rest time as it occurs, registering the time spent moving and the time spent resting. A PM5 registers time as it is **intended** to be spent, so it only registers planned pause intervals as rest time, and it actually considers unplanned rest as moving time. The effect is that, despite OpenRowingMonitor internally reporting time spent in unplanned rest splits as rest time, the PM5 considers it moving time. It is the PM5's interface's responsibility to adapt to this definition.

## CSAFE Commands

Most CSAFE Commands implemented in [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) in conjunction with the [C2toORMMapper.js](../app/peripherals/ble/pm5/utils/C2toORMMapper.js). OpenRowingMonitor essentially only implements the commands it needs to recieve workouts.

### Workout Mapping

Out primary goal for supporting CSAFE commands is recieving workout plans. A workout is typically a combination of one or more strings of commands. Typically it follows the following pattern

```js
CSAFE_PM_SET_WORKOUTINTERVALCOUNT
CSAFE_PM_SET_WORKOUTTYPE
CSAFE_PM_SET_INTERVALTYPE
CSAFE_PM_SET_WORKOUTDURATION
CSAFE_PM_SET_RESTDURATION
CSAFE_PM_CONFIGURE_WORKOUT
```

Each string of commands represents an interval. It is always closed with `CSAFE_PM_SET_SCREENSTATE`, followed by `SCREENVALUEWORKOUT_PREPARETOROWWORKOUT`.

| Concept2 Workout Type | General idea | Interval | Splits |
| --- | --- | --- | --- |
| WORKOUTTYPE_JUSTROW_NOSPLITS | A simple unlimited session | single interval, type = 'justrow' | Undefined[^1] |
| WORKOUTTYPE_JUSTROW_SPLITS | A simple unlimited session with splits | single interval, type = 'justrow' | Fixed 'time' or 'distance' |
| WORKOUTTYPE_FIXEDDIST_NOSPLITS | A simple distance session | single interval, type = 'distance' | Undefined[^1] |
| WORKOUTTYPE_FIXEDDIST_SPLITS | A simple distance session with splits | single interval, type = 'distance' | Fixed 'distance' |
| WORKOUTTYPE_FIXEDDIST_INTERVAL | An unlimited repeating distance based interval | repeating intervals, type = 'distance'[^2] | Undefined[^1] |
| WORKOUTTYPE_FIXEDTIME_NOSPLITS | A simple time limited session | single interval, type = 'time' | Undefined[^1] |
| WORKOUTTYPE_FIXEDTIME_SPLITS | A simple time limited session with splits | single interval, type = 'time' | Fixed 'time' |
| WORKOUTTYPE_FIXEDTIME_INTERVAL | An unlimited repeating time based interval | repeating intervals, type = 'time'[^2] | Undefined[^1] |
| WORKOUTTYPE_FIXEDCALORIE_SPLITS | A simple calories session with splits | single interval, type = 'calories' | Fixed 'calories' |
| WORKOUTTYPE_FIXEDCALS_INTERVAL | An unlimited repeating calories based interval | repeating intervals, type = 'calories'[^2] | Undefined[^1] |
| WORKOUTTYPE_VARIABLE_INTERVAL | A series of different variable intervals | multiple intervals | Fixed 'time' or 'distance' per interval |
| WORKOUTTYPE_VARIABLE_UNDEFINEDREST_INTERVAL | Not implemented | Not implemented | Not implemented |
| WORKOUTTYPE_FIXEDWATTMINUTE_SPLITS | Not implemented | Not implemented | Not implemented |

> [!NOTE]
> Please be aware that apps like ErgData and ErgZone actually do 'optimisations' behind the scene. Three intervals of 8 minutes with 2 minute rests are typically sent as a `WORKOUTTYPE_FIXEDTIME_INTERVAL`, despite this resulting in an endless series. If the planned rests are omited, it will result in a `WORKOUTTYPE_FIXEDTIME_SPLITS` with a single time interval with splits of the length of the intervals. If one would add a single second to any of the individual intervals, it becomes a `WORKOUTTYPE_VARIABLE_INTERVAL`, and all intervals are programmed manually. Obviously, from a user perspective the target displayed in the GUI will vary across these options (see [issue 118](https://github.com/JaapvanEkris/openrowingmonitor/issues/118)).

[^1]: Due to default behaviour of the WorkoutSegments object, the split defaults to the interval type and length by inheriting its parameters
[^2]: Due to the beforementioned structural issues, this can only be imitated. As Concept2's PM5 will only allow 50 splits (see [[2]](#2)), we'd expect receiving apps to maintain the same limit. Based on the presence of rest intervals, this will either be 50 working intervals or 25 working intervals interleaved with 25 rest intervals

## Message grouping and timing

Based on the Bluetooth trace we can group the messages as well as identify their trigger. This grouping is implemented in the [Pm5RowingService.js](../app/peripherals/ble/pm5/rowing-service/Pm5RowingService.js).

### Time driven status updates

On every broadcast interval, the following messages are sent:

* [0x0031 "General Status"](#0x0031-general-status),
* [0x0032 "Additional Status"](#0x0032-additional-status),
* [0x0033 "Additional Status 2"](#0x0033--additional-status-2)
* [0x003e "Additional Status 3"](#0x003e-additional-status-3)

### Event Driven messages

#### End of the drive

* [0x0035 "Stroke Data"](#0x0035-stroke-data)
* [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data)
* [0x003d "Force Curve data"](#0x003d-force-curve-data)

#### End of the recovery

* [0x0035 "Stroke Data"](#0x0035-stroke-data)

#### End of Split

* [0x0037 Split Data](#0x0037-split-data)
* [0x0038 Additional Split Data](#0x0038-additional-split-data)

#### End of Workout

* [0x0039 "Workout Summery"](#0x0039-workout-summery)
* [0x003a "Additional Workout Summary"](#0x003a-additional-workout-summary)
* [0x003f "Logged Workout"](#0x003f-logged-workout)

### Planned pause behaviour

#### Entering a rest interval

When antering a rest interval, no specific messages are sent. However, our trace shows that:

* message [0x0031 General Status](#0x0031-general-status)'s 'IntervalType' is set from `IntervalTypes.INTERVALTYPE_DIST` to `IntervalTypes.INTERVALTYPE_REST`. This element thus should depend on the OpenRowingMonitor's 'sessionState' object.
* message [0x0031 General Status](#0x0031-general-status)'s 'WorkoutState' is set from `WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCE` to `WorkoutState.WORKOUTSTATE_INTERVALREST`.
* message [0x0031 General Status](#0x0031-general-status)'s 'totalWorkDistance' is increased with the total linear distanceof the ative interval. This suggests that the totalWorkDistance is the absolute startpoint that is maintained in the WorkoutSegment.
* message [0x0032 "Additional Status"](#0x0032-additional-status)'s 'Rest Time' will start counting down from its starting point to 0.

#### Metrics behaviour during a rest interval

The "Elapsed Time" is stopped counting.

Despite being entered on apps as an attribute of an interval, the PM5 reports a rest period as an independent interval. As soon as the rest interval starts, the interval number is increased and the previous split time and distance are transferred to their respected fields.

#### Exiting a rest interval

When exiting a rest interval, a lot of messages are sent:

* [0x0035 "Stroke Data"](#0x0035-stroke-data), with essentially all values set to 0
* [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data), with essentially all values set to 0
* [0x0031 "General Status"](#0x0031-general-status)
* [0x0032 "Additional Status"](#0x0032-additional-status)
* [0x0033 "Additional Status 2"](#0x0033--additional-status-2)
* [0x003e "Additional Status 3"](#0x003e-additional-status-3)
* [0x0037 "Split Data"](#0x0037-split-data)
* [0x0038 "Additional Split Data"](#0x0038-additional-split-data)

### Unplanned pause behaviour

An unplanned rest/pause is essentially ignored. Time continues, but almost no specific flags are set.

#### Entering an unplanned rest

#### Metrics behaviour during unplanned pauses

The "Elapsed Time" continues.

The interval number wil **NOT** change during or after the rest period.

During an unplanned pause, instant metrics will remain their last known good value. They will not be zero'd, which is OpenRowingMonitor's default behaviour (and the correct representation of the machine state).

It is observed that upon entering the unplanned pause, the lastSplit data from [0x0038 "Additional Split Data"](#0x0038-additional-split-data) is in fact updated with the last state from the active split.

#### Exiting an unplanned rest

No specific messages are sent, apart from the obvious ['End of the recovery' messages](#end-of-the-recovery). There are no markings of the end of a split. On the subsequent split boundary, the [0x0037 "Split Data"](#0x0037-split-data) message registers the extra time as part of the "Elapsed time", **not** as "Rest time" which is part of the same message (stays 0). In message [0x0038 "Additional Split Data"](#0x0038-additional-split-data), Average split strokerate, Average split power, Average split speed and average split pace also include the rest period.

## Specific field behaviour

### Elapsed time

According to the documentation ([[1]](#1) and [[2]](#2)), messages [0x0031 "General Status"](#0x0031-general-status), [0x0032 "Additional Status"](#0x0032-additional-status), [0x0033  "Additional Status 2"](#0x0033--additional-status-2), [0x0035 "Stroke Data"](#0x0035-stroke-data), [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data), [0x0037 "Split Data"](#0x0037-split-data) and [0x0038 "Additional Split Data"](#0x0038-additional-split-data) all contain the 24 bit element "Elapsed Time", with a 0.01 second precission.

The recorded Bluetooth trace shows that:

* the timer isn't active before any movement has commenced, defaults and starts at 0
* At an interval rollover, this timer is reset to zero,
* At a split rollover, the timer is **NOT** reset but continues.
* The timer is stopped as soon as the session is paused based on a **planned** pause.
* The timer continues on an unplanned pause.

This behaviour seems to vary between the behaviour of variables `metrics.interval.timeSpent.moving` (especially planned pause behaviour) and `metrics.interval.timeSpent.total` (especially unplanned pause behaviour). The easiest mapping is to `metrics.interval.timeSpent.total`, as it naturally continues during pauses and thus doesn't cause a discontinues change in the timer for a normal split rollover. Stopping the `metrics.interval.timeSpent.total` timer during a planned pause can easily be arranged in [ORMtoC2Mapper.js](../app/peripherals/ble/pm5/utils/ORMtoC2Mapper.js)'s `appendPauseIntervalToActiveInterval` function which is used in this scenario. As a planned pause always ends in an interval rollover, the "Elapsed time' timer is always reset and any discontinuous timer issues will not become visible.

### Distance

Similar to Elapsed time, messages [0x0031 "General Status"](#0x0031-general-status), [0x0035 "Stroke Data"](#0x0035-stroke-data) and contain [0x0037 "Split Data"](#0x0037-split-data) the 24 bit element "Distance", with a 0.1 meter precission. We also see

* the distance isn't active before any movement has commenced, defaults and starts at 0
* distance being fixed in a pause
* distance is reset upon crossing the interval boundary
* distance continues when crossing a split boundary

Thus, this is best mapped to `metrics.interval.distance.fromStart`.

### Stroke numbering

The messages [0x0035 "Stroke Data"](#0x0035-stroke-data) and [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data) contain the stroke number, which behaves as follows:

* restarts at the end of an interval
* continues when crossing a split

Thus, this is best mapped to `metrics.interval.numberOfStrokes`.

### Split numbering

This is sementically a challenged parameter. The messages [0x0033 "Additional Status 2"](#0x0033--additional-status-2), [0x0037 "Split Data"](#0x0037-split-data), [0x0038 "Additional Split Data"](#0x0038-additional-split-data) all contain the `interval count`. Its use is far from consistent:

In message [0x0033 "Additional Status 2"](#0x0033--additional-status-2):

* `interval count` initializes it at 0,
* is increased when either the split/interval changes,
* is increased when moving from an active to a rest interval
* It does not **not** change on an unplanned rest interval

However, [0x0037 "Split Data"](#0x0037-split-data), [0x0038 "Additional Split Data"](#0x0038-additional-split-data) are sent **after** the split rollover and report about the metrics of the previous split, but uses the `interval count` of the **current interval** (i.e. it is increased and starts reporting about split 1, skipping split 0 in its reporting structure). To manage this, we introduce the `metrics.split.C2number`, as it can skip the effects of unplanned pauses.

Message [0x003a "Additional Workout Summary"](#0x003a-additional-workout-summary) contains the total number of intervals, which is similar to the number reported in [0x0037 "Split Data"](#0x0037-split-data), [0x0038 "Additional Split Data"](#0x0038-additional-split-data).

## Definition of individual messages

### Time based status messages

Message implementations can be found in the [status-characteristics directory](.../app/peripherals/ble/pm5/rowing-service/status-characteristics).

#### 0x0031 "General Status"

Messsage 0x0031 "General Status" is implemented in [GeneralStatusCharacteristic.js](../app/peripherals/ble/pm5/rowing-service/status-characteristics/GeneralStatusCharacteristic.js), with most flags being set in [ORMtoC2Mapper.js](../app/peripherals/ble/pm5/utils/ORMtoC2Mapper.js). Some notes:

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As described in [distance](#distance)), `distance` will be mapped to `metrics.interval.distance.fromStart`
* The `Workout state`
  * starts at `WorkoutState.WORKOUTSTATE_WAITTOBEGIN`,
  * changes to `WorkoutState.WORKOUTSTATE_WORKOUTROW` for an active fixed time/distance workout with splits,
  * changes to `WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCE` for an active distance based interval that is part of a multi-interval session
  * changes to `WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCETOREST` for marking the transition from an active interval to a planned rest interval
  * changes to `WorkoutState.WORKOUTSTATE_INTERVALREST` for a planned rest interval
  * changes to `WorkoutState.WORKOUTSTATE_WORKOUTEND` for marking the end of the workout
  * does **not** change when entering an unplanned rest split.
* The `Total work distance` is initialized at 0, and only increased at the end of the interval to reflect the total linear distance travelled so far by the previous intervals. This is best represented by `metrics.interval.distance.absoluteStart`
* The `Workout Duration` is set to the intended length of the current interval (thus ignoring previous interval lengths). The `Workout Duration` is linked to other metrics, thus forcing that these fields must have the same frame of reference (i.e. time/distance in interval and interval target):
  * When the `interval type` is 'distance', `Workout Duration` is the length in meters, captured by `metrics.interval.distance.target`. On a 'distance' based interval, the difference between `workout duration` and `distance` is shown on ErgData as a countdown timer.
  * When the `interval type` is 'time', `Workout Duration` is a time in 0.01sec precission, best reflected by `metrics.interval.movingTime.target` On a 'time' based interval, the difference between `workout duration` and `elapsed time` is shown on ErgData as a countdown timer on most screens.
* Dragfactor is reset per interval

#### 0x0032 "Additional Status"

[0x0032 "Additional Status"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/AdditionalStatusCharacteristic.js),

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As the context suggests that the intention is to produce the actual (i.e. not averaged across a split) metrics, we use `metrics.cycleLinearVelocity`, `metrics.cycleStrokeRate`, `metrics.heartrate`, `metics.cyclePace` and `metrics.cyclePower`.
* For the 'average' pace, it is unclear whether this is intended at the split or interval level. We choose to use the `metrics.interval.pace.average` as we suspect it is used to show on ErgData's overview of average pace, which is only reset at the interval boundary, not the split boundary. Our data analysis of the broadcaste data seem to support this.
* The variable 'Rest time' seems to map to `metrics.pauseCountdownTime`, as it seems to be used to display the countdown timer during pauses. Our data analysis of messages supporta that it counts down during a planned pause.

> [!NOTE]
> During unplanned pauses, a PM5 continues to broadcast the last known metrics. As none of the apps (ErgZone, EXR, etc.) act based on these metrics, for example by inserting a pause, we choose to have the metrics reflect the true state of the rowing machine, thus deviating from PM5 behaviour. We do this because it better reflects the state of the rowing machine to consuming apps that might not subscribe to all characteristics (especially towards apps like EXR which use 0x0032 to determine pace and strokerate, and thus where visuals will keep going on), and it makes data mappings less complex.

#### 0x0033  "Additional Status 2"

See the implementation here: [0x0033  "Additional Status 2"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/AdditionalStatus2Characteristic.js),

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As descibed in [Interval count](#split-numbering), the `interval count` will be mapped to `metrics.split.C2number`
* `Split average power` is initialized at 0
* `Total calories` is initialized at 0, and increases across splits, but is reset to 0 at interval rollovers, this suggests it is scoped at the interval.
* The specifications ([[1]](#1) and [[2]](#2)) contain an error. The `Last Split Time` element has an accuracy of 0.01 seconds, similar to the `Elapsed Time` data element, instead of the described 0.1 sec accuracy. `Last Split Time` will be initialised at 0, and after each split transition is updated to contain the final time of the last split for 'distance' based splits.
* The `Last split distance` is initialized at 0, and remains 0 for distance based splits.

#### 0x003e "Additional Status 3"

### Interupt driven stroke state messages

Message implementations can be found in the [other characteristics directory](../app/peripherals/ble/pm5/rowing-service/other-characteristics).

#### 0x0035 "Stroke Data"

[0x0035 "Stroke Data"](../app/peripherals/ble/pm5/rowing-service/other-characteristics/StrokeDataCharacteristic.js) is sent at the end of both the drive and the recovery

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As described in [distance](#distance), `distance` will be mapped to `metrics.interval.distance.fromStart`

#### 0x0036 "Additional Stroke Data"

[0x0036 "Additional Stroke Data"](../app/peripherals/ble/pm5/rowing-service/other-characteristics/AdditionalStrokeDataCharacteristic.js) is only sent at the end of the drive

#### 0x003d "Force Curve data"

The force curve is in pounds (lbs).

### Interupt driven session state messages

Message implementations can be found in the [session status characteristics directory](../app/peripherals/ble/pm5/rowing-service/session-characteristics).

#### 0x0037 "Split Data"

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As described in [distance](#distance), `distance` will be mapped to `metrics.interval.distance.fromStart`
* As descibed in [Interval count](#split-numbering), the `interval count` will be mapped to `metrics.split.C2number`

#### 0x0038 "Additional Split Data"

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As descibed in [Interval count](#split-numbering), the `interval count` will be mapped to `metrics.split.C2number`

#### 0x0039 "Workout Summery"

#### 0x003A "Additional Workout Summary"

* As descibed in [Interval count](#split-numbering), the `total number of intervals` will be mapped to `metrics.split.C2number`

#### 0x003f "Logged Workout"

## Known limitations, open Issues

### Elapsed time indication on apps and OpenRowingMonitor GUI will deviate

Apart from the obvious time delay in data representation, apps (like ErgZone) and OpenRowingMonitor's GUI will not show the same overall time if there is an unplanned pause present. This is because OpenRowingMonitor will always work on `metrics.Interval.timeSpent.moving`, whereas the PM5 will essentially present `metrics.Interval.timeSpent.total`. These two will deviate when an unplanned pause is present, as Concept2's definitions will still consider it part of the moving time and OpenRowingMonitor considers it a pause (as [mentioned earlier](#different-definition-of-moving-time-and-rest-time). Key issue is that we can not make the external apps follow OpenRowingMonitor's approach as that breaks their synchronisation with their workout plan.

Our approach with inserting an additional split has significant benefits in other area's, like keeping the FIT and RowingData recorders implementation clean. It also allows a far better data analysis as rest periods are clearly and consistently marked, regardless whether they were planned or not, allowing them to be filtered or included easily. This allows for a decent performance analysis even when an unplanned pause was needed, as averages aren't muddled by rest periods.

### Unplanned rest periods muddle metrics

In Concept2's logic, metrics are averaged across the split, including unplanned rest periods. Metrics like average pace, average stroke rate, average power, etc. thus get averaged with periods of inactivity. The benefit is that metrics appear consistent: a split with an unplanned pause looks longer, and thus average pace should be lowered to look consistent.

However, this can have weird effects. For example, the average pace (or average stroke rate or power) can go below the observed minimum pace in that split. As this is a flaw in Concept2's logic, and OpenRowingMonitor emulates this behaviour in this interface, we will not resolve this.

As the FIT-recorder independently records its data, and does respect OpenRowingMonitors' approach of explicitly seperating active from passive periods, these metrics will become inconsistent in their reporting. As the FIT-recorder is much closer to OpenRowingMonitor's native implementation, and the seperation is done based on native flags, the FIT-metrics are considered more accurate.

## References
<!-- markdownlint-disable no-inline-html -->
<a id="1">[1]</a> Concept 2 PM5 Bluetooth Smart Interface Specification, Revision 1.30, 3/2/2022 <https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf>

<a id="2">[2]</a> Concept2 PM CSAFE Communication Definition, Revision 0.27, 8/8/2023 <https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf>

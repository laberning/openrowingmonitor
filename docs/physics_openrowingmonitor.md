# The physics behind Open Rowing Monitor

<!-- markdownlint-disable no-inline-html -->
In this document we explain the physics behind the Open Rowing Monitor, to allow for independent review and software maintenance. This work wouldn't have been possible without some solid physics, described by some people with real knowledge of the subject matter. Please note that any errors in our implementation probably is on us, not them. When appropriate, we link to these sources. When possible, we also link to the source code.

## Basic concepts

@@@

Before we analyze the physics of a rowing engine, we first need to define the basic concepts. First we describe the physical systems, then we define the motions in the rowing stroke.

### Physical systems in a rower

A rowing machine effectively has two fundamental movements: a **linear** (the rower moving up and down, or a boat moving forward) and a **rotational** where the energy that the rower inputs in the system is absorbed through a flywheel (either a solid one, or a liquid one).

<img src="img/physics/indoorrower.png" width="700">

<!-- markdownlint-disable-next-line no-emphasis-as-header -->
*A basic view of an indoor rower*

The linear and rotational speeds are related: the stronger/faster you pull in the linear direction, the faster the flywheel will rotate. The rotation of the flywheel simulates the effect of a boat in the water: after the stroke, the boat will continue to glide only be dampened by the drag of the boat, so does the flywheel.

There are several types of rowers:

* **Water resistance**, where rowing harder will increase the resistance

* **Air resistance**: where rowing harder will increase the resistance

* **Magnetic resistance**: where the resistance is constant

There are also hybrid rowers, which combine air resistance and magnetic resistance. The differences in physical behavior can be significant, for example a magnetic rower has a constant resistance while a air/water rower's resistance is dependent on the flywheel's speed. As the key principle is the same for all these rowers (some mass is made to spin and drag brings its speed down), we treat them the same.

Typically, measurements are done in the rotational part of the rower, on the flywheel. There is a reed sensor or optical sensor that will measure time between either magnets or reflective stripes, which gives an **Impulse** each time a magnet or stripe passes. Depending on the **number of impulse providers** (i.e. the number of magnets or stripes), the number of impulses per rotation increases, increasing the resolution of the measurement. By measuring the **time between impulses**, deductions about speed and acceleration of the flywheel can be made, and thus the effort of the rower.

#### Relevant rotational metrics

* The **Angular Position** of the flywheel in Radians: in essence the distance the flywheel has traveled (i.e. the number of Radians the flywheel has rotated) since the start of the session. As the impulse-givers are evenly spread over the flywheel, this can easily be measured by counting the number of impulses, **Number of Impulses** and multiply it with the **angular displacement** between two **impulses** (i.e. 2π/(*number of impulse providers on the flywheel*));

* The **Time since start** of the flywheel in seconds: in essence the time the flywheel has been spinning since the start of the session. This can easily be measured by summarising the **time between an impulse**;

* The **Angular Velocity** of the flywheel in Radians/second: in essence the number of (partial) rotations of the flywheel per second;

* The **Angular Acceleration** of the flywheel (in Radians/second<sup>2</sup>): the acceleration/deceleration of the flywheel;

* the **Torque** of the flywheel

* The *estimated* **drag factor** of the flywheel: the level af (air/water/magnet) resistence encountered by the flywheel, as a result of a damper setting.

#### Relevant linear metrics

* The *estimated* **Linear Distance** of the boat (in Meters): the distance the boat is expected to travel;

* *estimated* **Linear Velocity** of the boat (in Meters/Second): the speed at which the boat is expected to travel.

* *estimated* **power produced** by the rower (in Watts): the power the rower produced during the stroke.

### Terminology used in describing the rowing stroke and its phases

On an indoor rower, the rowing cycle will always start with a stroke, followed by a recovery. We define them as follows:

* The **Drive phase**, where the rower pulls on the handle

* The **Recovery Phase**, where the rower returns to his starting position

Combined, we consider a *Drive* followed by a *Recovery* a **Stroke**. In the calculation of several metrics, the requirement is that it should include *a* *Drive* and *a* *Recovery*, but order isn't a strict requirement for some metrics [[2]](#2). We call such combination of a *Drive* and *Recovery* without perticular order a **Cycle**, which allows us to calculate these metrics twice per *stroke*.

## What a rowing machine actually measures

As mentioned above, most rowers depend on measuring the **time between impulses**, triggered by some impulse giver (magnet or light) on the flywheel. For example, when the flywheel rotates on a NordicTrack RX800, the passing of a magnet on the flywheel triggers a reed-switch, that delivers a pulse to our Raspberry Pi. We measure the time between two subsequent impulses and call this *currentDt*: the time between two impulses. *currentDt* is the basis for all our calculations.

The following picture shows the time between impulses through time:
![Measurements of flywheel](img/physics/flywheelmeasurement.png)
*Measurements of flywheel*

Here, it is clear that the flywheel first accelerates and then decelerates, which is typical for rowing.

Using *currentDt* means we can't measure anything directly aside from *angular displacement*, and that we have to accept some noise in measurements. For example, as we don't measure torque on the flywheel directly, we can't determine where the flywheel exactly accelerates/decelerates, we can only detect a change in the times between impulses. In essence, we only can conclude that an acceleration has taken place somewhere near a specific impulse, but we can't be certain about where the acceleration exactly has taken place and we can only estimate how big the force must have been. Additionally, small vibrations in the chassis due to tiny unbalance in the flywheel can lead to small deviations in measurements. This kind of noise in our measurement can make many subsequent derived calculation on this measurement too volatile, This is why we explicitly distinguish between *measurements* and *estimates* based on these measurements, to clearly indicate their potential volatility.

Dealing with noise is an dominant issue, especially because we have to deal with many types of machines. Aside from implementing a lot of noise reduction, we also focus on using robust calculations: calculations that don't deliver radically different results when a small measurement error is introduced in the measurement of *currentDt*. We typically avoid things like derived functions when possible, as deriving over small values of *currentDt* typically produce huge deviations in the resulting estimate. We sometimes even do this at the cost of inaccuracy with respect to the perfect theoretical model, as long as the deviation is systematic in one direction, to prevent estimates to become too unstable for practical use.

## Leading design principles of the rowing engine

The physics engine is the core of Open Rowing Monitor. It measures rorational metrics and determines linear metrics based on that. Although the physics is well-understood and even well-described publicly (see [[1]](#1),[[2]](#2),[[3]](#3) and [[4]](#4)), applying these formulae in a practical solution for multiple rowers delivering reliable results is quite challenging. Especially small errors, noise, tends to produce visible effects on the recorded metrics. Therefore, in our design of the physics engine, we try to:

* stay as close to the original data as possible (thus depend on direct measurements as much as possible) instead of heavily depend on derived data. This means that there are two absolute values we try to stay close to as much as possible: the **time between an impulse** and the **Number of Impulses**, where we consider **Number of Impulses** most reliable, and **time between an impulse** reliable but containing noise (the origin and meaning of these metrics, as well the effects of this approach are explained later);

* use robust calculations wherever possible (i.e. not depend on a single measurements, extrapolations or derivative functions, etc.) to reduce effects of measurement errors. When we do need to calculate a derived function, we choose to use a robust linear regression method to reduce the impact of noise;

* Be as close to the results of the Concept2 when possible and realistic, as they are considered the golden standard in indoor rowing metrics.

## Determining the rotational metrics

These metrics are typically determined in the `pushValue` function of `engine/Flywheel.js`

### Determining the "Angular Position" of the flywheel

Missed impulses is an issue

### Determining the "Time since start" of the flywheel

### Determining the "Angular Velocity" of the flywheel

> &omega; = &Delta;&theta; / &Delta;t

### Determining the "Angular Acceleration" of the flywheel

> &alpha; = &Delta;&omega; / &Delta;t

However, this formula is dependent on *currentDt*, which is suspect to noise, which would be reintroduced through this parameter. Following [[8]](#8), there is an alternative approach to Angular Acceleration:

> 2&alpha; = &Delta;(&omega;<sup>2</sup>) / &Delta;&theta;

This makes &alpha; dependent on &omega;, which was determined in a robust manner, and &theta; where deviations are discrete and thus easier to detect. Thus we determine &alpha; in a robust manner by Linear Regression by determining the slope of the line where &theta; on the x-axis and &omega;<sup>2</sup> is the y-axis.

### Determining the "Torque" of the flywheel

### Determining the "drag factor" of the flywheel

From theory, the dragfactor can be calculated through formula 7.2 [[1]](#1):

> k = -I \* &Delta;(1/&omega;) / &Delta;t

Such a more fundamental approach is found in the method used by [[7]](#7), where the dragfactor is determined through the slope of the relation between inverse of the angular velocity and time. This depends on a different perspective on formula 7.2 [[1]](#1), which states:

> k = I \* &Delta;(1/&omega;) / &Delta;t

This can be transformed as the definition of the slope of a line, by reformulating it as:

> k / I = &Delta;(1/&omega;) / &Delta;t

Thus k/I represents the slope of the graph depicted by time from the start of the recovery phase on the x-axis and 1/&omega; on the y axis. This formula can be simplified further as the angular velocity &omega; is determined by:

> &omega; = (2&pi; / Number of impulses per revolution) / currentDt

Since we are dividing a constant factor (i.e. 2&pi; / Number of impulses per revolution) through *currentDt* we can further simplify this formula by removing this division and constant outside the slope-calculation. Effectively, this makes the formula:

> (k \* 2&pi;) / (I \* Impulses Per Rotation) = &Delta;currentDt / &Delta;t

As this formula shows, we can determine the drag factor through the slope of the line created by *time since the start of the recovery phase* on the *x*-axis and the corresponding *CurrentDt* on the *y* axis. This slope of the line can be determined in a robust manner through linear regression. This approach also brings this calculation as close as possible to the raw data, and doesn't use individual *currentDt*'s as a divider, which are explicit design goals to reduce data volatility.

As the slope of &Delta;currentDt / &Delta;t is equal to (k \* 2&pi;) / (I \* Impulses Per Rotation), the drag thus can be determined through

> k = slope \* (I \* Impulses Per Rotation) / 2&pi;

## Determining the linear metrics

## Detecting the stroke and recovery phase

On an indoor rower, the rowing cycle will always start with a stroke, followed by a recovery. Looking at a stroke, our monitor gets the following data from its sensor:

![Impulses, impulse lengths and rowing cycle phases](img/physics/rowingcycle.png)
*Impulses, impulse lengths and rowing cycle phases*

Here we plot the *currentDt* (time between impulses) against its sequence number. So, a high *currentDt* means a long time between impulses (so a low *angular velocity*), and a low *currentDt* means that there is a short time between impulses (so a high *angular velocity*). As this figure also shows, we split the rowing cycle in two distinct phases:

* The **Drive phase**, where the rower pulls on the handle, some force on the flywheel is excerted and the flywheel is accelerating or at least not decelerating in accordance with the drag;

* The **Recovery Phase**, where the rower returns to his starting position and the flywheel decelerates as the drag on the flywheel is slowing it down;

As the rowing cycle always follows this fixed schema, Open Rowing Monitor models it as a finite state machine (implemented in `handleRotationImpulse` in `engine/RowingEngine.js`).

![Finite state machine of rowing cycle](img/physics/finitestatemachine.png)
*Finite state machine of rowing cycle*

### Basic stroke detection

Given that the *Angular Displacement* between impulses is fixed, we can deduct some things simply from looking at the subsequent *time between impulses*, *currentDt*. When the *currentDt* shortens, *Angular Velocity* is increasing, and thus the flywheel is accelerating (i.e. we are in the drive phase of the rowing cycle). When times between subsequent impulses become longer, the *Angular Velocity* is decreasing and thus the flywheel is decelerating (i.e. we are the recovery phase of the rowing cycle). This is the robust implementation of a stroke (implemented in MovingFlankDetector's implementation of isFlywheelPowered and isFlywheelUnpowered for naturalDeceleration = 0 in `engine/MovingFlankDetector.js`), which is similar to the implementation used by industry leaders like Concept2. Concept2 are generally considered the golden standard when it comes to metrics, and they state (see [this Concept2 FAQ](https://www.concept2.com/service/software/ergdata/faqs): 'Drive time is measured by the amount of time the flywheel is accelerating. Note: It is possible that the athlete may pull on the handle and not accelerate the flywheel due to no energy being put into it and therefore no effective effort. This portion of the handle pull is not measured.')

### Advanced stroke detection

Looking at the average curve of an actual rowing machine (this example is based on averaging 300 strokes), we see the following:

![Average curves of a rowing machine](img/physics/currentdtandacceleration.png)
*Average currentDt (red) and Acceleration (blue) of a single stroke on a rowing machine*

In this graph, we plot *currentDt* against the time in the stroke, averaged over 300 strokes. As *currentDt* is (reversely) related to angular velocity, we can calculate the angular acceleration/deceleration. In essence, as soon as the acceleration becomes below the 0, the currentDt begins to lengthen again (i.e. the flywheel is decelerating). As indicated earlier, this is the trigger for the robust stroke detection algorithm (i.e. the one used when naturalDeceleration is set to 0): when the *currentDt* starts to lengthen, the drive-phase is considered complete.

However, from the acceleration/deceleration curve it is also clear that despite the deceleration, there is still a force present: the deceleration-curve hasn't reached its stable minimum despite crossing 0. This is due to the pull still continuing through the arms: the net force is negative due to a part drive-phase (the arm-movement) delivering weaker forces than the drag-forces of the flywheel. Despite being weaker than the other forces on the flywheel, the rower is still working. In this specific example, at around 0.52 sec the rower's force was weaker than all drag-forces combined. However, only at 0,67 seconds (thus approx. 150 ms later) the net force reaches its stable bottom: the only force present is the drag from the flywheel. Getting closer to this moment is a goal.

By specifying the expected natural deceleration of the flywheel (naturalDeceleration, which in this case is around 8 Rad/s<sup>2</sup>) in the configuration of the rower, the stroke starts earlier and ends later (implemented in MovingFlankDetector's implementation of isFlywheelPowered and isFlywheelUnpowered for naturalDeceleration < 0 in `engine/MovingFlankDetector.js`). Please note: as several derived metrics depend on the length of the drive phase or the exact timing of that moment (like the drag factor when calculated dynamically), these are likely to change when this setting is changed. For a more in-depth explanation, see [here for more details](physics_openrowingmonitor.md#a-closer-look-at-the-effects-of-the-various-drive-and-recovery-phase-detection).

Testing shows that setting a value close to the natural deceleration provides more accurate results very reliably. However, some rowers might contain a lot of noise in their data, making this approach infeasible (hence the fallback option of naturalDeceleration = 0)

This approach is a better approximation than the acceleration/deceleration approach, but still is not perfect. For example, drag-force of the the rower presented in the above graph slowly reduces. This is expected, as the drag-force is speed dependent. For a pure air-rower, the best theoretical approach would be to see if the drag-force is the only force present by calculating the expected drag-force using the current speed and the drag factor (making the stroke detection completely independent on speed). Testing has shown that this approach is too prone to errors, as it requires another derivation with respect to *currentDt*, making it too volatile. Above this, hybrid rower behave differently as well: dependent on the speed, the balance shifts between the speed-dependent air-resistance drag-force and the speed-independent magnetic resistance force. To make the solution robust and broadly applicable, this approach has been abandoned.

## Key physical metrics during the rowing cycle

In the following sections we describe the physics used to come to the estimated metrics.

### Drag factor

In the recovery phase, the only force exerted on the flywheel is the (air/water/magnetic)resistance. Thus we can calculate the Drag factor of the Flywheel based on the entire recovery phase.

As [[1]](#1) describes in formula 7.2:

> k = I \* &delta;(1/&omega;) / &delta;t

However, our testing has shown this approach is too volatile to be useful (see [these test results](https://github.com/JaapvanEkris/openrowingmonitor/blob/docs/Engine_Validation.md#validation-of-the-drag-factor-calculation)). However, this formula can be transformed into (see [this derivation](https://github.com/JaapvanEkris/openrowingmonitor/blob/docs/Engine_Validation.md#improvements-based-on-the-first-side-by-side-dragfactor-test)).

> (k \* 2&pi;)/(I \* Impulses Per Rotation) = &delta;currentDt / &delta;t

As the left-hand of the equation only contains constants and the dragfactor, this means that the dragfactor can be determined through linear regression (see [[5]](#5) and [[6]](#6)) for the collection of datapoints where x is the time since the start of the recovery phase and y is the currentDt. The dragfactor then can be determined through the slope of the resulting function. As linear regression algorithm, OLS was chosen as it delivered decent results in the tests, it has a O(1) complexity and can be easily implemented to work on continous datastreams (see [these considerations](https://github.com/JaapvanEkris/openrowingmonitor/blob/docs/Engine_Validation.md#improvements-based-on-the-first-side-by-side-dragfactor-test)).

### Linear distance

### Linear Velocity

### Power produced

@@@@

## Measurements during the recovery phase

Although not the first phase in a cycle, it is an important phase as it deducts specific information about the flywheel properties [[1]](#1). During the recovery-phase, we can *measure* the number of impulses and the length of each impulse. Some things we can easily *estimate* with a decent accuracy based on the data at the end of the recovery phase:

* The length of time between the start and end of the recovery phase

* The angular displacement between the start and end of the recovery phase

* The angular velocity at the beginning and end of the recovery phase

In [[1]](#1) and [[2]](#2), it is described that power on a Concept 2 is determined through (formula 9.4):

> P= 4.31 \* u<sup>2.75</sup>

By applying [[1]](#1) formula 9.4 to calculate the linear speed, we obtain the following formula, replacing [[1]](#1)'s formula 9.2:

> u=((k \* &omega;<sup>0.25</sup>) / 4.31)<sup>1/2.75</sup> &omega;

By applying [[1]](#1) formula 9.4 to calculate the linear speed, we obtain the following formula, replacing [[1]](#1)'s formula 9.3:

> s=((k \* &omega;<sup>0.25</sup>) / 4.31)<sup>1/2.75</sup> &theta;

## Measurements during the drive phase

During the drive-phase, we again can *measure* the number of impulses and the length of each impulse. Some things we can easily *estimate* with a decent accuracy based on the data at the end of the drive phase:

* The length of time between the start and end of the drive phase

* The angular displacement between the start and end of the drive phase

* The angular velocity at the beginning and end of the drive phase

As above, we use the following fomula for determining the linear speed:

> u=((k \* &omega;<sup>0.25</sup>) / 4.31)<sup>1/2.75</sup> &omega;

As above, we use the following fomula for determining the linear distance:

> s=((k \* &omega;<sup>0.25</sup>) / 4.31)<sup>1/2.75</sup> &theta;

## Power calculation

In the drive phase, the rower also puts a force on the flywheel, making it accelerate.

We can calculate the energy added to the flywheel through [[1]](#1), formula 8.2:

> &delta;E = I \* (&delta;&omega; / &delta;t)&delta;&theta; + k &omega;<sup>2</sup> &delta;&theta;

Or in more readable form for each measured displacement:

> Energy = FlywheelInertia \* ((AngularVelocity<sub>start</sub> - AngularVelocity<sub>end</sub>) / DriveLength) \* AngularDisplacement&nbsp; + DragFactor \* InstantaneousAngularVelocity<sup>2</sup> \* AngularDisplacement

Where

> InstantaneousAngularVelocity = AngularDisplacement / TimeBetweenImpulses

The power then becomes

> P = E / TotalCycleTime

Although this is an easy implementable algorithm by calculating a running sum of this function (see [[3]](#3), and more specifically [[4]](#4)). However, the presence of the many Angular Velocities makes the outcome of this calculation quite volatile. The angular velocity is measured through the formula:

> AngularVelocity = 2&pi; / (NumberOfImpulsegivers \* TimeBetweenImpulses)

As *currentDt* tends to be small (typically much smaller than 1, typically between 0,1 and 0,0015 seconds), small errors tend to increase the Angular Velocity significantly, enlarging the effect of an error and potentially causing this volatility. An approach is to use a running average on the presentation layer (in `RowingStatistics.js`). However, when this is bypassed, data shows significant spikes of 20Watts in quite stable cycles due to small changes in the data.

An alternative approach is given by [[3]](#3), which proposes

> P= k \* &omega;<sup>3</sup>

Where P is the average power and &omega; is the average speed during the stroke. Here, the average speed can be determined in a robust manner (i.e. Angular Displacement of the Drive Phase / DriveLength).

As Dave Venrooy indicates this is accurate with a 5% margin. Testing this on live data confirms this behavior (tested with a *autoAdjustDragFactor* = true, to maximize noise-effects), with three added observations:

* The robust algorithm is structurally below the more precise measurement when it comes to total power produced in a 30 minutes or 15 minutes row on a RX800 with any damper setting;

* The robust algorithm is indeed much less volatile: the spikes found in the more precise algorithm are much bigger than the ones found in the robust algorithm

* A test with *numOfPhasesForAveragingScreenData* = 1 (practically bypassing the running average in the presentation layer) combined with the robust algorithm shows that the monitor is a bit more responsive but doesn't fluctuate unexpectedly.

As the *flywheelinertia* is mostly guessed based on its effects on the Power outcome anyway (as nobody is willing to take his rower apart for this), the 5% error wouldn't matter much anyway: the *flywheelinertia* will simply become 5% more to get to the same power in the display. Therefore, we choose to use the simpler more robust algorithm, as it has some advantages:

* In essence the instantaneous angular velocities at the flanks are removed from the power measurement, making it more robust against "unexpected" behavior of the rowers (like the cavitation-like effects found in LiquidFlywheel Rowers). Regardless of settings, only instantaneous angular velocities that affect displayed data are the start and begin of each phase;

* Setting *autoAdjustDragFactor* to "false" effectively removes/disables all calculations with instantaneous angular velocities (only average velocity is calculated over the entire phase, which typically is not on a single measurement), making Open Rowing Monitor an option for rowers with noisy data or otherwise unstable/unreliable measurements;

* Given the stability of the measurements, it might be a realistic option for users to remove the filter in the presentation layer completely by setting *numOfPhasesForAveragingScreenData* to 1, making the monitor much more responsive to user actions.

Given these advantages and that in practice it won't have a practical implications for users, we have chosen to use the robust implementation.

## Additional considerations for the frequency of the metrics calculations

@@ ToDo: Weghalen en verwerken in de rest van het stuk!!!

There are some additional options for the frequency of metric calculations:

* An option would be to update the metrics only updated at the end of stroke, which is once every 2 to 3 seconds. This is undesirable as a typical stroke takes around 2.5 seconds to complete and covers around 10 meters. It is very desirable to update typical end-criteria for trainings that change quite quickly (i.e. absolute distance, elapsed time) more frequently than that;

* We additionally update the metrics (when dependent on the stroke dependent parameters, like stroke length) both at the end of the Drive and Recovery Phases, as Marinus van Holst [[2]](#2) suggests that both are valid perspectives on the stroke. This allows for a recalculation of these metrics twice per stroke;

* To allow for a very frequent update of the monitor, and allow for testing for typical end-criteria for trainings that change quite quickly (i.e. absolute distance, elapsed time), we calculate these for each new *currentDt*;

* As we can only calculate the drag factor at the end of the recovery phase, we can only (retrospectively) apply it to the realized linear distance of that same recovery phase. Therefore, we we need to report absolute time and distance from the `RowingEngine` in `engine/RowingEngine.js`);

## A closer look at the effects of the various Drive and Recovery phase detection

In this section, we will answer the question whether Concept2 made a big error in their stroke detection, and thus that using *naturalDeceleration* is set to 0 is inferior to actually setting it to a different value. The short answer is that Concept2 has made a perfectly acceptable tradeoff between reliability of the stroke detection and precision of some metrics.

Effectively, Open Rowing Monitor can use two different methods of stroke detection. When *naturalDeceleration* is set to 0, it will detect an acceleration/deceleration directly based on *currentDt*, similar to Concept2. When *naturalDeceleration* is set to a negative number, it will consider that number as the minimum level of deceleration (in Rad/s<sup>2</sup>). The later is more volatile, as described above, but some consider this desirable when possible.

Our practical experiments show that assuming the recovery-phase started too early doesn't affect measurements per se. In theory, the calculation of speed and power do not depend directly on phase detection, they do depend on the total number of impulses and the drag factor. It is in fact the automatic update of the drag factor that is dependent on the correct detection of the stroke. The drag factor can be pinned down if needed by setting *autoAdjustDragFactor* to "false". If set to true, it might affect measurements of both distance and power, where we will discuss the knock-on effects.

### Effects on the automatically calculated drag factor

The most important measurement that is affected by stroke detection errors is the calculation of the drag factor.

Our robust implementation of the drag factor is:

> DragFactor = FlywheelInertia \* ( 1 / AngularVelocity<sub>start</sub> - 1 / AngularVelocity<sub>end</sub>) \* RecoveryLength

Looking at the effect of erroneously starting the recovery early and ending it late, it affects two variables:

* Recovery length will *systematically* become too long (approx. 200 ms from our experiments)

* The Angular Velocity will *systematically* become too high as the flywheel already starts to decelerate at the end of the drive phase, which we mistakenly consider the start of the recovery (in our tests this was approx. 83,2 Rad/sec instead of 82,7 Rad/sec). A similar thing can happen at the begin of the recovery phase when the rower doesn't have an explosive Drive.

Example calculations based on several tests show that this results in a systematically too high estimate of the drag factor. As these errors are systematic, it is safe to assume these will be fixed by the calibration of the power and distance corrections (i.e. the estimate of the *FlywheelInertia* and the *MagicConstant*). Thus, as long as the user calibrates the rower to provide credible data for his setting of *naturalDeceleration*, there will be no issues.

Please note that this does imply that changing the *naturalDeceleration* when the *autoAdjustDragFactor* is set to true (thus drag is automatically calculated) will require a recalibration of the power and distance measurements.

### Knock-on Effects on the Power calculation

Question is what the effect of this deviation of the drag factor is on the power calculation. The power is calculated as follows:

> P= k \* &omega;<sup>3</sup>

Here, the drag factor is affected upwards. Here the average speed is determined by measuring the angular displacement and divided by the time, being affected in the following manner:

* Time spend in the Drive phase is *systematically* too short

* Angular displacement in the Drive phase will *systematically* be too short

These effects do not cancel out: in essence the flywheel decelerates at the end of the drive phase, which we mistakenly include in the recovery phase. This means that on average, the average speed is systematically too high: it misses some slower speed at the end of the drive. As all factors of the power calculation are systematically overestimating, the result will be a systematic overestimation.

Again, this is a systematic (overestimation) of the power, which will be systematically corrected by the Inertia setting.

## A mathematical perspective on key metrics

### Determination of slopes

In theory

### Models used for Linear regression

## References

<a id="1">[1]</a> Anu Dudhia, "The Physics of ErgoMeters" <http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html>

<a id="2">[2]</a> Marinus van Holst, "Behind the Ergometer Display"

<a id="3">[3]</a> Dave Vernooy, "Open Source Ergometer ErgWare" <https://dvernooy.github.io/projects/ergware/>

<a id="4">[4]</a> Dave Vernooy, ErgWare source code <https://github.com/dvernooy/ErgWare/blob/master/v0.5/main/main.ino>

<a id="5">[5]</a> Wikipedia, Simple Linear Regression <https://en.wikipedia.org/wiki/Simple_linear_regression>

<a id="6">[6]</a> University of Colorado, Simple Linear Regression <https://www.colorado.edu/amath/sites/default/files/attached-files/ch12_0.pdf>

<a id="7">[7]</a> Nomath, "Fan blade Physics and a Peek inside C2's Black Box" <https://www.c2forum.com/viewtopic.php?f=7&t=194719>

<a id="8">[8]</a> Nomath, "Rotational Kinematics" <https://physics.info/rotational-kinematics/>

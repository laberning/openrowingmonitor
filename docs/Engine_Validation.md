# A validation and improvement of the Open Rowing Monitor physics engine

<!-- markdownlint-disable no-inline-html -->
Our primary goal is to validate the physics engine of Open Rowing Monitor: are the results produced by Open Rowing Monitor reliable and accurate? Although OpenRowingMonitor is built upon a tested theoretical model [[1]](#1),[[2]](#2),[[3]](#3),[[4]](#4), some open questions remain. For example, the formula used for power calculations [[1]](#1),[[2]](#2). In this article, we compare OpenRowingMonitor against the golden standard in indoor Rowing: the Concept2 RowErg's PM5. We consider the physics model of OpenRowingMonitor valid when it produces results very similar to the Concept2 PM5.

Please note that we don't strive to reverse engineer the inner workings of the PM5. We do want Open Rowing Monitor to be as reliable and deliver similar results as the golden standard in the indoor rowing community, the PM5. Although the physics behind rowing monitors are well-known and even well-described [[1]](#1),[[2]](#2), what distinguishes one monitor from another is how well and robust they are implemented. Our experience in implementing Open Rowing Monitor is that calculating metrics involves a lot of trade-offs between robustness of the metrics (preventing small measurement errors to disrupt all metrics) and accuracy/reactiveness of these same metrics. Where we do not aim to reconstruct the internal workings Concept2 implemented to get to their acceptable trade-off, we do aim for the same accuracy and robustness of results. What we do in this validation, is to detect and explain why metrics are deviating between Open Rowing Monitor and the PM5, as these deviations might indicate an issue in Open Rowing Monitor's physics engine.

## Set-up of test environment

Our main approach is a series of side-by-side tests: comparing the results on both monitors for the same row. To realistically compare the two monitors, without introducing any measurement errors, we split the signal from the Concept2 RowErg's internal sensor and feed it to the two monitors simultanously. This approach will exclude any measurement errors by misaligned sensors, etc..

### Concept2's signal

The Concept2 produces a 15V signal [[6]](#6), which alternates between 0V and 15V [[7]](#7). This signal is produced by a 12-pole magnet [[8]](#8) which are attached to the flywheel, also doubling as a generator for the PM5. Although [[7]](#7) suggests a sinoid signal, another interpretation is that this a full-wave recified signal [[9]](#9). This later makes more sense given the lack of reversal of the polarity, which would be expected given the construction of the magnets and generator. To evade any dependencies on this assumption, we explicitly choose to measure on the upper part of the signal, removing any dependency on the behaviour on the lower part of the signal.

The shortest impulses measured on a scope are 15-16 pulses per 100 msec, when the rower rows 1:13/500m [[10]](#10), which implies an average time between impulses of 6.25ms, or a frequency 160Hz.

### Processing the data for the Raspberry Pi

To process the 15V signal for the 3.3V Raspberry Pi, a 24V to 3.3V DST-1R4P-P optocoupler/isolation board is used [[11]](#11), which switches at 12V [[12]](#12). Where the DST-1R4P-N can handle 20KHz, we chose to use a DST-1R4P-P which is rated for 80KHz, far exceeding the 160Hz produced by the RowErg. The signal from the RowErg is a (non)sinusoidal wave, where the DST-1R4P-P expects a block-wave. As the EL817C936 optocoupler used on this board will trigger on a treshold value, we estimate this doesn't affect accuracy. Due to a lack of equipment, we were not able to verify this assumption.

### Settings used

Open Rowing Monitor has been configured following the normal [engine configuration procedure](rower_settings.md), also partially based on known settings from literature. In config.js we set the following parameters:

* Based on [[13]](#13), we conclude that Concept2 defines the drive-phase as an accelerating flywheel, which would be simulated in Open Rowing Monitor by setting *minumumRecoverySlope* to 0. However, the configuration procedure results in a *minumumRecoverySlope* of 0.00070, a *minimumStrokeQuality* of 0.32 a *flanklength* of 11 and a *NumberofErrorsAllowed* of 2, which produces a solid stroke detection. As the configuration procedure's results are more robustly defined than a (potentially forgotten) statement in a FAQ, we depend on the configuration procedure.
* A *flywheel inertia* of 0.1001 kg/m<sup>2</sup>, is indicated by [[2]](#2) and [[7]](#7), where [[7]](#7) also emperically verifies these results for a Concept 2 Model D based on single revolutions. However, on a Concept2 RowErg, magnets have been added, and electric power is generated to power the PM5. Based on our own callibration, the flywheel Inertia seems to be 0.1016. As this approaches the results of a Concept 2 RowErg best, we consider the last value valid.
* *numOfPhasesForAveragingScreenData* is set to 2, to make the data as volatile as possible.
* Concept2 seems to have used a drag factor smoothing of around 15 strokes in the PM2 in the past, and later moved to not use any smoothing at all (as suggested by [[19]](#19)). Based on practical experiments, we choose a *dragFactorSmoothing* of 3, as it best fits our algorithm to exclude any outliers and the approach to cheating (as described by [[19]](#19)) is excluded from our test-setup.

### Rowing style

As [[16]](#16) indicated, there is a need for a steady state rowing style, as unstable rowing tends to throw off the PM5's metrics.

### Testing the signals

Looking at these signals from the Concept2, they look normal: a slowly decelerating flywheel (downward slope) followed by a fast accelerating flywheel. This familiar saw-tooth pattern suggests that the data are sufficiently well-recieved, and that there are no obvious errors in the electronics of the DST-1R4P-P board.

With the right settings in config.js, the stroke detection seems to be in sync between the two monitors. This suggests that the timing of flanks is sufficiently similar to be able to compare the data. For a single stroke, approximatly 300 impulses are recieved, which is much more granular than any machine encountered before.

## Validations

We describe the resulting physics model used by OpenRowingMonitor in [[5]](#5). To validate the physics engine of OpenRowingMonitor, we need to validate the folling calculations:

* The dynamic calculation of the dragfactor
* The calculation of the linear distance, based on a dynamically determined drag factor
* The calculation of linear speed
* Calculation of the displayed power

First, we verify the calculation the dragfactor. Next, we apply this dragfactor without any dependence on other parts of the algorithms like stroke detection in a distance calculation. In OpenRowingMonitor, total time is defined as the sum of all impulse lengths (i.e. the sum of all *CurrentDt*'s), which therefore is also tested alongside distance. Here, we use the distance as the key indicator for the verification of the dynamic calculation of the dragfactor and impuls detection. In subsequent tests, we use these metrics as the basis to verify all other dependent metrics.

### Validation of the drag factor calculation

Based on this, we conclude that the ORM2f algorithm combined with the requirement that r<sup>2</sup> needs to be above 0.84, with a running average of 6 strokes would produce the best results. Increasing the running average further might further improve the stability of the dragfactor, but this hasn't been applied in this test due to practical limitations.  We maintain the running average of 6 as we fear instability in readings might hurt further analysis. At a later stage, we can validate the effects of setting DragfactorSmoothing to 1 on the real-life results.

Applying these settings to the sessions, leads to the following (simulated) results:

| Test | Strokes | PM5 Min Drag | PM5 Modus Drag | PM5 Max Drag | ORM2f Min Drag | ORM2f Avg. Drag | ORM2f Max Drag | ORM2f Drag SD | Stroke with first valid Dragfactor | Percentage strokes with valid dragfactors |
| :-: | --: | --: |--: | --: | --: | --: | --: | --: | --: | --: |
| 7 | 385 | 70 | 70 | 71 | 69 | 70 | 72 | 0.3 | 3 | 75% |
| 8 | 370 | 79 | 79 | 80 | 79 | 79 | 83 | 0.6 | 2 | 80% |
| 9 | 357 | 91 | 92 | 93 | 91 | 92 | 92 | 0.1 | 2 | 82% |
| 10 | 366 | 101 | 102 | 102 | 101 | 101 | 103 | 0.3 | 1 | 88% |
| 11 | 375 | 112 | 112 | 113 | 111 | 112 | 113 | 0.3 | 1 | 88% |
| 12 | 367 | 121 | 121 | 122 | 121 | 121 | 124 | 0.3 | 1 | 92% |
| 13 | 333 | 101 | 101 | 101 | 96 | 101 | 102 | 0.3 | 1 | 93% |
| 14 | 329 | 100 | 101 | 101 | 100 | 100 | 102 | 0.2 | 2 | 90% |
| 15 | 353 | 133 | 133 | 133 | 132 | 133 | 134 | 0.2 | 1 | 91% |
| 16 | 358 | 145 | 145 | 145 | 144 | 145 | 146 | 0.3 | 1 | 94% |
| 17 | 355 | 155 | 156 | 157 | 155 | 155 | 158 | 0.3 | 1 | 93% |
| 18 | 371 | 115 | 115 | 116 | 113 | 113 | 117 | 0.4 | 1 | 90% |
| 19 | 711 | 105 | 105 | 105 | 104 | 105 | 107 | 0.2 | 1 | 92% |
| 20 | 366 | 107 | 107 | 108 | 107 | 107 | 110 | 0.3 | 1 | 86% |
| 21 | 351 | 165 | 166 | 168 | 165 | 166 | 169 | 0.4 | 1 | 94% |
| 22 | 353 | 176 | 177 | 178 | 176 | 177 | 178 | 0.4 | 2 | 95% |
| 23 | 348 | 189 | 191 | 193 | 189 | 190 | 193 | 0.5 | 1 | 97% |
| 24 | 355 | 201 | 203 | 206 | 201 | 203 | 206 | 0.6 | 1 | 98% |
| 25 | 1051 | 105 | 105 | 105 | 104 | 105 | 106 | 0.2 | 1 | 90% |
| 26 | 340 | 211 | 213 | 216 | 211 | 214 | 219 | 0.5 | 1 | 97% |
| 27 | 348 | 220 | 223 | 226 | 219 | 221 | 227 | 0.8 | 1 | 97% |

Looking at the ORM2f algorithm with these settings, it is quite close to the intended target of the Concept2 dragfactor. Also the standard deviation is sufficiently small with the ORM2f algorithm, and the standard deviation is at least 3 and sometimes 10 times smaller than the original implementation, supporting its use.

We observe that the percentage valid dragfactors seems to be correlated with the dragfactor. On explanation is that this might be due to the stronger acceleration/decelleration of the flywheel speed during the phases when rowing at higher drag factors, which additionally has the benefit of making stroke detection much more robust, jointly resulting in less outliers. Another hypohtesis is that this might be due to (a lack of decent) rowingstyle, which at lower dragfactors is more dominant than at higher dragfactors as there was a very strong focus on rowing technique and the resulting PM5's powercurve to prevent injury from the forces associated.

### Validation of the linear distance calculation

The distance calculation is solely dependent on the drag factor (a known factor that already is validated and that can be checked afterwards) and the duplicated impulses. Thus, as the impulses are duplicated across the monitors, the resulting distance calculation is a good indicator for the quality of this calculation, as it depends on the number of impulses encountered, irrelevant of their timing (as would be the case with the speed).

#### Theoretical basis of the linear distance calculation

From theory [[1]](#1) and [[2]](#2) the initial calculation was based on formula 9.1 described in [[1]](#1):

> P = 2.8 \* u<sup>3</sup>

The calculation of linear speed is based on this, resulting in the following formula [[1]](#1), formula 9.2:

> u = (k/2.8)<sup>1/3</sup> &omega;

As s = u \* t, the calculation of linear distance accordingly becomes [[1]](#1), formula 9.3:

> s = (k/2.8)<sup>1/3</sup> &theta;

In RowingEngine 2.0 (in RowingEngine.js, OpenRowingMonitor version 0.8.2) we implemented formula 9.3 as follows:

```javascript
LinearDistance = Math.pow((dragFactor / rowerSettings.magicConstant), 1.0 / 3.0) * AngularDisplacement
```

Although OpenRowingMonitor temporarily calculates a completed distance per recorded impulse for display purposses, the definite value of the completed distance is calculated per phase as the dragfactor then can be applied retrospectively onto the Recovery phase.

#### Results and interpretation of a first side-by-side linear distance test

The first series side-by-side test are fixed distance or fixed time tests (taking at least 15 minutes), where both monitors are fed the same stream of impulses (as described above). We vary in length fortests to investigate whether the deviations change (potentially signalling temporary deviations like start-up noise) and whether the deviations remain stable across tests. This test stops when both monitors have reached 4000 meters, where OpenRowingMonitor uses its traditional algorithm to calculate this criterion.

This leads to the following results when repeating the datastreams through OpenRowingMonitor:
| Test | Drag factor | Target distance | #strokes on PM5| Result on PM5 | Modified Base algorithm result | Modified Base algorithm Deviation |
| :-: | --: | --: | --: | --: | --: | --: |
| 32 | 70 | 4,000 m | 441 | 17:31.3 | :. | -0.% |
| 33 | 122 | 6,000 m | 606 | 25:44.8 | :. | -0.% |
| 34 | 112 | 10,000 m | 1051 | 43:08.2 | :. | -0.% |
| 35 | 80 | 4,000 m | 438 | 17:26.0 | :. | -0.%|
| 36 | 226 | 4,000 m | 403 | 17:08.8 | :. | -0.% |
| 38 | 212 | 4,000 m | 400 | 17:01.8 | :. | -0.% |
| 39 | 101 | 6,000 m | 633 | 26:10.2 | :. | -0.%|
| 40 | 101 | 10,000 m | 1065 | 43:02.7 | :. | -0.% |
| 41 | 200 | 4,000 m | 405 | 16:54.5 | :. | -0.% |
| 42 | 103 | 5,000 m | 522 | 21:40.3 | :. | -0.% |
| 43 | 192 | 4,000 m | 410 | 17:11.1 | :. | -0.% |
| 44 | 90 | 4,000 m | 427 | 17:10.2 | :. | -0.% |
| 45 | 118 | 6,000 m | 624 | 26:02.9 | :. | -0.% |
| 46 | 102 | 10,000 m | 994 | 44:39.5 | :. | -0.% |
| 47 | 133 | 4,000 m | 415 | 17:11.9 | :. | -0.% |
| 48 | 183 | 4,000 m | 410 | 17:27.7 | :. | -0.% |
| 50 | 110 | 6,000 m | 630 | 25:43.5 | :. | -0.% |
| 51 | 108 | 10,000 m | 983 | 44:20.9 | :. | -0.% |
| 52 | 159 | 4,000 m | 423 | 17:18.3 | :. | -0.% |
| 53 | 150 | 4,000 m | 413 | 16:55.0 | :. | -0.% |
| 54 | 140 | 4,000 m | 413 | 17:39.3 | :. | -0.% |
| 55 | 130 | 2,000 m | 219 | 9:01.0 | :. | -0.% |
| 56 | 150 | 4,000 m | 399 | 18:13.5 | :. | -0.%|

Here, a negative deviation indicates that the algorithm was too slow when compared to the PM5 data, a positive deviation indicates that the algorithm was too fast when compared to the PM5 data. The strokerate was nearly identical along the row, and only varied slightly between 23 and 24 SPM). The total number of strokes across the monitors was sufficiently similar at similar times.

### Validation of the linear speed caclulation

@@

#### Theoretical basis of the linear speed calculations

From theory [[1]](#1) and [[2]](#2) the initial calculation was based on formula 9.1 described in [[1]](#1):

> P=2.8 \* u<sup>3</sup>

The calculation of linear speed is based on this, resulting in the following formula [[1]](#1), formula 9.2:

> u=(k/2.8)<sup>1/3</sup> &omega;

In RowingEngine 2.0 (in RowingEngine.js, OpenRowingMonitor version 0.8.2) we implemented formula 9.2 as follows:

```javascript
LinearVelocity = Math.pow((dragFactor / rowerSettings.magicConstant), 1.0 / 3.0) * ((cycleAngularDisplacement) / cycleLength)
```

Based on the first test, we recognised that Concept2 seems to use a different formula for its calculations, which is described in formula 9.4 [[1]](#1):

> P=4.31 \* u<sup>2.75</sup>

By applying formula 9.4 to calculate the linear speed, we obtain the following formula, replacing formula 9.2 [[1]](#1):

> u=((k \* &omega;<sup>0.25</sup>) / 4.31)<sup>1/2.75</sup> &omega;

### Validation of the displayed power calculation

@@

## Conclusions

## Known limitations of the validation

Due to a lack of equipment we couldn't verify the timely switching behaviour of the 24V to 3.3V DST-1R4P-P optocoupler/isolation board when confronted with a 15V (non)sinusoidal wave.

We were only capable of testing the measurements with a singular recreational rower, not with larger groups or high performance athletes. Therefore, there isn't much variation across produced power beyond 200 Watts, which might influence reliability for other levels of intensity.

## References

<a id="1">[1]</a> Anu Dudhia, "The Physics of ErgoMeters" <http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html>

<a id="2">[2]</a> Marinus van Holst, "Behind the Ergometer Display"

<a id="3">[3]</a> Dave Vernooy, "Open Source Ergometer ErgWare" <https://dvernooy.github.io/projects/ergware/>

<a id="4">[4]</a> Dave Vernooy, ErgWare source code <https://github.com/dvernooy/ErgWare/blob/master/v0.5/main/main.ino>

<a id="5">[5]</a> Jaap van Ekris, "The physics behind Open Rowing Monitor" <https://github.com/laberning/openrowingmonitor/blob/main/docs/physics_openrowingmonitor.md>

<a id="6">[6]</a> Nomath, "Need advice on Concept2 PM4 PCB" <https://www.c2forum.com/viewtopic.php?f=10&t=199082&p=532456#p532482>

<a id="7">[7]</a> Nomath, "Fan blade Physics and a Peek inside C2's Black Box" <https://www.c2forum.com/viewtopic.php?f=7&t=194719>

<a id="8">[8]</a> Carl Watts, "RE: Fan blade Physics and a Peek inside C2's Black Box" <https://www.c2forum.com/viewtopic.php?f=7&t=194719#p521624>

<a id="9">[9]</a> Wikipedia, Signal rectifier <https://en.wikipedia.org/wiki/Rectifier#Full-wave_rectification>

<a id="10">[10]</a> Nomath, "Model c - hall effect?" <https://www.c2forum.com/viewtopic.php?f=10&t=202673#p543437>

<a id="11">[11]</a> Optocoupler Isolation Board DST-1R4P-N <https://mschoeffler.com/2021/05/13/optocoupler-isolation-board-dst-1r4pn/>

<a id="12">[12]</a> 4 channel level shifter/optocoupler <https://www.youtube.com/watch?v=JvtKvXNsGQ0>

<a id="13">[13]</a> Concept2, "What is Drive Length?" <https://www.concept2.com/service/software/ergdata/faqs>

<a id="14">[14]</a> Wikipedia, Simple Linear Regression <https://en.wikipedia.org/wiki/Simple_linear_regression>

<a id="15">[15]</a> University of Colorado, Simple Linear Regression <https://www.colorado.edu/amath/sites/default/files/attached-files/ch12_0.pdf>

<a id="16">[16]</a> Gunnar Treff et al, "Initial Evaluation of the Concept-2 Rowing Ergometer's Accuracy Using a Motorized Test Rig" <http://dx.doi.org/10.3389/fspor.2021.801617>

<a id="17">[17]</a> Wikipedia, Linear regression <https://en.wikipedia.org/wiki/Linear_regression>

<a id="18">[18]</a> Wikipedia, Robust regression <https://en.wikipedia.org/wiki/Robust_regression>

<a id="19">[19]</a> Erg Tricks and Hammers <https://books.google.pl/books?id=ZEcEAAAAMBAJ&lpg=PT6&ots=Cbv-iPB3N2&pg=PT6&redir_esc=y#v=onepage&q&f=false>

## Notes

The numbering is based on a series of rowing sessions. Due to a bug discovered in the RowingEngine of OpenRowingMonitor 0.8.2, several test-results were invalidated and thus removed from these overviews. To retain traceability, but keep results readable, these tests have not been excluded but the valid tests not renumbered.

With **Drag poisoning** we mean that by including a noisy *currentDt* reading in the drag calculation, it spikes to unrealistic values, throwing off the speed, power and other metric estimation for several strokes.

# A validation and improvement of the OpenRowingMonitor physics engine

<!-- markdownlint-disable no-inline-html -->
The primary goal of this validation is to validate the physics engine of OpenRowingMonitor: are the results produced by OpenRowingMonitor reliable? Although OpenRowingMonitor is built upon a tested theoretical model [[1]](#1),[[2]](#2),[[3]](#3),[[4]](#4), some open questions remain. For example, the formula used for power calculations [[1]](#1),[[2]](#2). In this article, we compare OpenRowingMonitor against the golden standard in indoor Rowing: the Concept2 RowErg's PM5. We consider the physics model of OpenRowingMonitor valid when it produces results very similar to the Concept2 PM5.

Please note that we don't strive to reverse engineer the PM5, we want OpenRowingMonitor to be as reliable and deliver similar results as the PM5. Although the physics behind rowing monitors are well-known and even well-described [[1]](#1),[[2]](#2), what distinguishes one monitor from another is how well and robust they are implemented. Our experience in implementing OpenRowingMonitor is that this involves a lot of trade-offs between robustness of the metrics (preventing unexpected changes due to measurement errors) and accuracy/reactiveness of these same metrics. We are not aiming to reconstruct the internal mechanisms Concept2 implemented to get to an acceptable trade-off, but do want the same robustness of results. What we do in this validation, is to detect and explain why metrics are deviating between OpenRowingMonitor and the PM5, as these deviations might indicate an issue in OpenRowingMonitor's physics engine.

## Set-up of test environment

We aim for a side-by-side test: comparing the results on both monitors for the same row. To realistically compare the two monitors, without introducing any measurement errors, we split the signal from the Concept2 RowErg's internal sensor and feed it to the two monitors simultanously. This approach will exclude any measurement errors by misaligned sensors, etc..

### Concept2's signal

The Concept2 produces a 15V signal [[6]](#6), which alternates between 0V and 15V [[7]](#7). This signal is produced by a 12-pole magnet [[8]](#8) which rotates with the flywheel, also doubling as a generator for the PM5. Although [[7]](#7) suggests a sinoid signal, another interpretation is that this a full-wave recified signal [[9]](#9). This later makes more sense given the polarity which doesn't reverse, which would be expected given the construction of the magnets and generator. To evade any dependencies on this assumption, we explicitly choose to measure on the upper part of the signal, removing any dependency on the behaviour on the lower part of the signal.

The shortest impulses measured on a scope are 15-16 pulses per 100 msec, when the rower rows 1:13/500m [[10]](#10), which implies an average time between impulses of 6.25ms, or a frequency 160Hz.

### Processing the data for the Raspberry Pi

To process the 15V signal for the 3.3V Raspberry Pi, a 24V to 3.3V DST-1R4P-P optocoupler/isolation board is used [[11]](#11), which switches at 12V [[12]](#12). Where the DST-1R4P-N can handle 20KHz, we chose to use a DST-1R4P-P which is rated for 80KHz, far exceeding the 160Hz produced by the RowErg. The signal from the RowErg is a (non)sinusoidal wave, where the DST-1R4P-P expects a block-wave. As the EL817C936 optocoupler used on this board will trigger on a treshold value, we estimate this doesn't affect accuracy. Due to a lack of equipment, we were not able to verify this assumption.

### Settings used

In config.js the following settings were used:

* Based on [[13]](#13), we conclude that Concept2 defines the drive-phase as an accelerating flywheel, which is simulated in OpenRowingMonitor by setting naturalDeceleration to 0, which triggers an identical algorithm for stroke detection. It is noted that the number of consecutive impulses that indicate acceleration isn't mentioned or known.
* A flywheel inertia of 0.1001 kg/m2, as indicated by [[2]](#2) and [[7]](#7), where [[7]](#7) also emperically verifies these results.
* *numOfPhasesForAveragingScreenData* is set to 3, to make the data as volatile as possible.

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

First, we verify the calculation the dragfactor, without any dependence on other parts of the algorithms like stroke detection, as this is the basis of any following calculation. In OpenRowingMonitor, total time is defined as the sum of all impulse lengths (i.e. the sum of all *CurrentDt*'s), which therefore is also tested alongside distance. Subsequently, after we used the distance as the key indicator for the verification of the dynamic calculation of the dragfactor and impuls detection, we use them as a basis to verify all other dependent metrics.

### Validation of the drag factor calculation

#### Theoretical basis of the drag factor calculation

From theory [[1]](#1) (described in [[5]](#5)), the dragfactor can be calculated through formula 7.2 [[1]](#1):

> k = -I \* &delta;(1/&omega;) / &delta;t

In RowingEngine 2.0 (i.e. RowingEngine.js, OpenRowingMonitor version 0.8.2), this is implemented by:

```javascript
currentDragFactor = -1 * rowerSettings.flywheelInertia * ((1 / recoveryStartAngularVelocity) - (1 / recoveryEndAngularVelocity)) / recoveryPhaseLength
```

We call this the ORM0 dragfactor algorithm.

#### Results and interpretation a first side-by-side dragfactor test

We measure the dragfactor through the logged calculated dragfactor, which is the dragfactor from the last recovery, without any filtering or smoothing. Although ErgData displays the drag factor, it isn't recorded in any way. Concept2 does also not explain how the dragfactor is obtained, nor it is known wether it is filtered or averaged in some way. Therefore, we can only observe the (variations in the) rounded value as displayed by ErgData, but can't record it and thus can't determine any standard deviation.

Running these tests results in the following:

| Test | Strokes | PM5 Min Drag | PM5 Modus Drag | PM5 Max Drag | ORM0 Min Drag | ORM0 Avg. Drag | ORM0 Max Drag | ORM0 Drag SD |
| :-: | --: | --: |--: | --: | --: | --: | --: | --: |
| 5 | 25 | 132 | 134 | 136 | 128 | 132 | 143 | 6.4 |
| 6 | 660 | 101 | 102 | 103 | 87 | 101 | 114 | 1.9 |
| 7 | 385 | 70 | 70 | 71 | 4 | 70 | 94 | 4.1 |
| 8 | 370 | 79 | 79 | 80 | 72 | 79 | 90 | 1.9 |
| 9 | 357 | 91 | 92 | 93 | 82 | 91 | 106 | 1.9 |
| 10 | 366 | 101 | 102 | 102 | 93 | 101 | 116 | 2.0 |
| 11 | 375 | 112 | 112 | 113 | 101 | 110 | 122 | 2.1 |
| 12 | 367 | 121 | 121 | 122 | 111 | 119 | 129 | 1.9 |
| 13 | 333 | 101 | 101 | 101 | 95 | 100 | 109 | 1.4 |
| 14 | 329 | 100 | 101 | 101 | 96 | 100 | 108 | 1.3 |
| 15 | 353 | 133 | 133 | 133 | 122 | 131 | 144 | 2.1 |
| 16 | 358 | 145 | 145 | 145 | 136| 142 | 158 | 2.2 |
| 17 | 355 | 155 | 156 | 157 | 146 | 153 | 166 | 2.2 |
| 18 | 371 | 115 | 115 | 116 | 102 | 112 | 128 | 2.1 |
| 19 | 711 | 105 | 105 | 105 | 99 | 104 | 119 | 1.8 |
| 20 | 366 | 107 | 107 | 108 | 100 | 106 | 111 | 1.7 |
| 21 | 351 | 165 | 166 | 168 | 157 | 163 | 171 | 2.2 |
| 22 | 353 | 176 | 177 | 178 | 165 | 173 | 186 | 2.5 |
| 23 | 348 | 189 | 191 | 193 | 177 | 188 | 196 | 2.6 |
| 24 | 355 | 201 | 203 | 206 | 188 | 198 | 220 | 3.0 |
| 25 | 1051 | 105 | 105 | 105 | 98 | 104 | 113 | 1.6 |
| 26 | 340 | 211 | 213 | 216 | 202 | 208 | 217 | 2.4 |
| 27 | 348 | 220 | 223 | 226 | 181 | 215 | 223 | 3.4 |

OpenRowingMonitor produces roughly similar results as Concept2's PM5 displayed on ErgData. On average, these dragfactors match. However, looking more closely at the data, we also observe that OpenRowingMonitor's dragfactor is typically much more volatile than PM5's reported dragfactor. In tests with a dragfactor above 175, we observe that the dragfactor on the PM5 fluctuated significantly, quite often alternating between the extreme values noted. This could indicate a lack of steady rowing at this drag factor interfering with the calculation/stroke detection, but it could also signal issues at the algorithmic level becoming more visible as the numbers become bigger.

As [[1]](#1) describes, one wouldn't expect much change to the dragfactor once the rower is in a fixed position and has its damper setting set. Therefore, we consider this higher volatility of the dragfactor a bad property of OpenRowingMonitor, and Concept2 shows that it clearly is possible to achieve better results. As the dragfactor influences the speed and distance calculations significantly, there is a strong need to improve this.

#### Improvements based on the first side-by-side dragfactor test

The key source of the observed volatility is found in the source code of RowingEngine 2.0 (in RowingEngine.js, OpenRowingMonitor version 0.8.2):

```javascript
currentDragFactor = -1 * rowerSettings.flywheelInertia * ((1 / recoveryStartAngularVelocity) - (1 / recoveryEndAngularVelocity)) / recoveryPhaseLength
```

As the variation of the recoveryPhaseLength reported in the log is around 5%, it doesn't account for the variations encountered. A more likely explanation is the reliance on two measurements that tend to be volatile: recoveryStartAngularVelocity and recoveryEndAngularVelocity. Although these derived values of *currentDt* are filtered and averaged, *CurrentDt* (which typically is in the millisecond-range) is used as a divider to obtain the angular velocity, where small variations tend to be enlarged. This is why this calculation explicitly depends on the filtered values of *currentDt*, and not the raw ones, to dampen this volatility. Although this behaviour could be surpressed by more noise filtering and smoothing, we think a more fundamental approach would yield better results.

Such a more fundamental approach is found in the method used by [[7]](#7), where the dragfactor is determined through the slope of the relation between inverse of the angular velocity and time. This depends on a different perspective on formula 7.2 [[1]](#1), which states:

> k = I \* &delta;(1/&omega;) / &delta;t

This can be percieved as the definition of the slope of a line, by reformulating it as:

> k / I = &delta;(1/&omega;) / &delta;t

Thus k/I represents the slope of the graph depicted by time from the start of the recovery phase on the x-axis and 1/AngularVelocity on the y axis. This formula can be simplified further as the angular velocity is determined by:

> &omega; = (2&pi; / Number of impulses per revolution) / currentDt

Since we are dividing a constant factor (i.e. 2&pi; / Number of impulses per revolution) through *currentDt* we can further simplify this formula by removing this division and constant outside the slope-calculation. Effectively, this makes the formula:

> (k \* 2&pi;) / (I \* Impulses Per Rotation) = &delta;currentDt / &delta;t

As this formula shows, the definition of the slope of the line created by *time since the start of the recovery phase* on the *x*-axis and the corresponding *CurrentDt* on the *y* axis is equal to (k \* 2&pi;) / (I \* Impulses Per Rotation). This brings this calculation as close as possible to the raw data, and doesn't use *currentDt* as a divider, which are explicit design goals to reduce data volatility.

There are several ways to determine this slope. In essence, our initial approach was to determine this slope over the whole recovery phase by determening a delta over the begin and end *currentDt*'s. Another approach is to determine the slope with respect to its previous *currentDt*, and average that slope across all measurements, which is the essence of the first suggestion regarding formula 7.2 [[1]](#1). Initial experiments showed that both approaches are vulnerable to noise in that calculation and thus are not robust, resulting in **drag poisoning**. Therefore, we take an alternative approach which in our opinion fits the nature of the data more. We choose to calculate the slope by performing linear regression, with these values for *x* and *y*. As linear regression is typically applied to determine the optimal line through noisy datapoints orginating form experimental measurements [[17]](#17), we expect that this produces more stable results that are less vulnerable for outliers than using averages across strokes.

There are several different linear regression methods [[17]](#17). There are several requirements on the algorithm: it has to be robust to outliers [[18]](#18) and it has to delviver results in near-real-time scenarios. From a robustness perspective, most promissing methods are [least absolute deviations](https://en.wikipedia.org/wiki/Least_absolute_deviations), the [Theil–Sen estimator](https://en.wikipedia.org/wiki/Theil%E2%80%93Sen_estimator) and the [LASSO technique](https://en.wikipedia.org/wiki/Lasso_(statistics)). Most of these methods, except the Theil–Sen estimator, do not have a near-real-time solution. Although the Theil–Sen estimator has a O(N log(N)) solution available, no practical implementations have been found, making such an approach practically unfeasible. Therefore, we choose to calculate the slope by performing simple linear regression (see [[14]](#14) and [[15]](#15)) as the results are generally acceptable and the O(1) performance is well-suited for near-real-time calculations on a time series, with using a high-pass filter on the r<sup>2</sup> to disregard any unreliably approximated dragfactors.

A fundamental choice is the choice wether to use filtered or unfiltered data as input for the linear regression algorithm. To decide this, we run the algorithms side-by-side and compare the results. ORM1 uses filtered *currentDt* for the linear regression, ORM2 uses raw *currentDt* for linear regression. Here, we record the dragfactor for each recovery phase, without addition of any additional filtering or smoothing of the calculated drag factors.

| Test | Strokes | Pm5 Drag | ORM1 Min Drag | ORM1 Avg. Drag | ORM Max Drag | ORM1 Drag SD | ORM2 Min Drag | ORM2 Avg. Drag | ORM2 Max Drag | ORM2 Drag SD |
| :-: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| 6 | 660 | 102 | 75 | 102 | 104 | 2.6 | 91 | 102 | 117 | 1.3 |
| 7 | 385 | 70 | 27 | 70 | 72 | 2.2 | 30 | 70 | 80 | 2.5 |
| 8 | 370 | 79 | 77 | 79 | 84 | 0.7 | 71 | 79 | 96 | 1.6 |
| 9 | 357 | 92 | 90 | 92 | 94 | 0.5 | 81 | 92 | 102 | 1.3 |
| 10 | 366 | 102 | 98 | 101 | 104 | 0.5 | 91 | 101 | 106 | 1.0 |
| 11 | 375 | 112 | 109 | 112 | 115 | 0.5 | 95 | 112 | 130 | 2.3 |
| 12 | 367 | 121 | 118 | 121 | 124 | 0.6 | 105 | 121 | 136 | 1.9 |
| 13 | 333 | 101 | 100 | 101 | 103 | 0.3 | 88 | 101 | 113 | 1.4 |
| 14 | 329 | 101 | 99 | 100 | 102 | 0.3 | 91 | 100 | 112 | 1.0 |
| 15 | 353 | 133 | 131 | 133 | 136 | 0.5 | 120 | 133 | 149 | 1.6 |
| 16 | 358 | 145 | 143 | 145 | 148 | 0.5 | 130 | 145 | 155 | 1.6 |
| 17 | 355 | 156 | 151 | 155 | 159 | 0.7 | 141 | 155 | 167 | 1.5 |
| 18 | 371 | 115 | 111 | 113 | 116 | 0.4 | 100 | 113 | 125 | 1.3 |
| 19 | 711 | 105 | 103 | 105 | 107 | 0.4 | 91 | 105 | 118 | 1.3 |
| 20 | 366 | 107 | 105 | 108 | 109 | 0.4 | 81 | 107 | 135 | 2.5 |
| 21 | 351 | 166 | 163 | 166 | 169 | 0.7 | 153 | 166 | 186 | 1.5 |
| 22 | 353 | 177 | 175 | 177 | 180 | 0.8 | 162 | 177 | 191 | 1.5 |
| 23 | 348 | 191 | 187 | 190 | 193 | 0.9 | 174 | 190 | 213 | 2.5 |
| 24 | 355 | 203 | 198 | 203 | 207 | 1.3 | 182 | 203 | 210 | 1.9 |
| 25 | 1051 | 105 | 103 | 105 | 106 | 0.3 | 94 | 105 | 129 | 1.4 |
| 26 | 340 | 213 | 211 | 214 | 219 | 1.0 | 198 | 214 | 240 | 2.2 |
| 27 | 348 | 221 | 216 | 221 | 226 | 1.3 | 192 | 221 | 227 | 2.5 |

Here we see that the use of ORM1's filtering data sometimes causes larger deviations in the linear regression algorithm and thus drag factor when compared to ORM2f, and sometimes produces better results. However, when we analyse the r<sup>2</sup> per stroke, we see that ORM1 consistently scores over 99%, where ORM2's r<sup>2</sup> has significant more variation. Looking at the relation between outliers with respect to the average drag factor and r<sup>2</sup>, we see that ORM1 this relation seems absent, where there seems to be a relation for ORM2.

When the r<sup>2</sup> is used as a filter by requiring a 0.93 goodness of fit for both ORM1 and ORM2 before accepting a newly calculated drag factor (resulting in ORM1f and ORM2f), we get the following results:

| Test | Strokes | Pm5 Drag | ORM1f Min Drag | ORM1f Avg. Drag | ORM1f Max Drag | ORM1f Drag SD | ORM2f Min Drag | ORM2f Avg. Drag | ORM2f Max Drag | ORM2f Drag SD|
| :-: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| 7 | 385 | 70 | 67 | 70 | 72 | 0.5 | 69 | 70 | 71 | 0.2 |
| 8 | 370 | 79 | 77 | 79 | 84 | 0.6 | 78 | 79 | 83 | 0.6 |
| 9 | 357 | 92 | 90 | 92 | 94 | 0.5 | 90 | 92 | 93 | 0.3 |
| 10 | 366 | 102 | 98 | 101 | 104 | 0.5 | 100 | 101 | 103 | 0.3 |
| 11 | 375 | 112 | 109 | 112 | 115 | 0.5 | 110 | 112 | 113 | 0.4 |
| 12 | 367 | 121 | 118 | 121 | 124 | 0.6 | 120 | 121 | 123 | 0.5 |
| 13 | 333 | 101 | 100 | 101 | 103 | 0.3 | 100 | 101 | 102 | 0.3 |
| 14 | 329 | 101 | 99 | 100 | 102 | 0.3 | 99 | 100 | 101 | 0.3 |
| 15 | 353 | 133 | 131 | 133 | 136 | 0.5 | 131 | 133 | 134 | 0.4 |
| 16 | 358 | 145 | 143 | 145 | 148 | 0.5 | 142 | 145 | 146 | 0.5 |
| 17 | 355 | 156 | 151 | 155 | 159 | 0.7 | 154 | 155 | 157 | 0.6 |
| 18 | 371 | 115 | 111 | 113 | 116 | 0.4 | 112 | 113 | 115 | 0.4 |
| 19 | 711 | 105 | 103 | 105 | 107 | 0.4 | 103 | 105 | 106 | 0.3 |
| 20 | 366 | 107 | 105 | 108 | 109 | 0.4 | 106 | 107 | 108 | 0.3 |
| 21 | 351 | 166 | 163 | 166 | 169 | 0.7 | 164 | 166 | 169 | 0.7 |
| 22 | 353 | 177 | 176 | 177 | 180 | 0.8 | 175 | 177 | 181 | 0.8 |
| 23 | 348 | 191 | 187 | 190 | 193 | 0.9 | 188 | 190 | 192 | 0.8 |
| 24 | 355 | 203 | 198 | 203 | 207 | 1.3 | 200 | 203 | 208 | 1.3 |
| 25 | 1051 | 105 | 103 | 105 | 106 | 0.3 | 103 | 105 | 106 | 0.3 |
| 26 | 340 | 213 | 211 | 214 | 219 | 1.0 | 211 | 214 | 216 | 0.9 |
| 27 | 348 | 221 | 216 | 221 | 226 | 1.3 | 218 | 221 | 227 | 1.2 |

As this table shows, for ORM2f the outliers in the drag calculation effectively are removed. A plausible explanation, supported by visual inspection of the curves, is that the noise filter applied in ORM1 effectively removes outliers in the raw data during the recovery phase through the noise filter, thus resulting in very high fits to begin with.

#### Results and interpretation of the second series of side-by-side dragfactor tests

ORM2f frequently outperforms ORM1f, especially when it comes to spread and outliers. Above this, the approach of using r<sup>2</sup> has the benefit of completely relying on metrics contained in the algorithm itself: the algorithm itself signals a bad fit. ORM1f's approach of noise filtering completely relies on decent noise filtering without any indication how bad the remaining noise is. As ORM1f's approach requires a well-tuned noise filter, a requirement not guaranteed on other rowing machines where Open Rowing Monitor would be applied, we consider this approach less desireable than ORM2f's. As ORM1f's behaviour is much less effective against detecting noise, we choose to use the ORM2f algorithm.

Having chosen ORM2f as our base algorithm, our next step is a further optimisation of these settings. Our initial experiments were based on a r<sup>2</sup> needs to be above 0.93 before a dragfactor was accepted. Having collected the underlying data of rowing sessions 7 to 27, and having selected an algorithm, we now can further optimise the settings. Here we try to optimise the settings, with the explicit goal to reduce the overall standard deviation and accuracy of the prediction, while trying to avoid a specific caveat. The caveat would be to set the r<sup>2</sup> very high, resulting in a static dragfactor as all calculated factors would be rejected. Therefore we explicitly explore the lower values of r<sup>2</sup>, to see if those values also produce robust and reliable results.

To assess the useability, we simulate the effects of the 21 rowing sessions with the different settings of r<sup>2</sup> in Excel, based on the raw data collected during these rowing sessions. This allows us to assess the relative negative deviation, the average and relative positive deviation, the standard deviation, the first stroke where a valid value is used, the percentage of valid dragfactors and the number of rowing sessions where at least 75% of the strokes is valid. This leads to the following results:
| Minimal r<sup>2</sup> | Min | Avg | Max | SD | Average first valid stroke | Valid drag calculations | Number of rowing sessions with over 75% validity |
| :-- | --: | --: | --: | --: | --: | --: | --: |
| 0.95 | -1.39% | -0.26% | 1.25% | 0.5481 | 15 | 70.25% | 11 |
| 0.945 | -1.46% | -0.25% | 1.29% | 0.5572 | 7 | 73.07% | 12 |
| 0.94 | -1.50% | -0.26% | 1.37% | 0.5597 | 3 | 75.64% | 14 |
| 0.935 | -1.54% | -0.26% | 1.39% | 0.5616 | 3 | 77.39% | 15 |
| 0.93 | -1.54% | -0.26% | 1.41% | 0.5611 | 3 | 79.32% | 16 |
| 0.925 | -1.54% | -0.26% | 1.62% | 0.5700 | 2 | 80.53% | 18 |
| 0.92 | -1.58% | -0.26% | 1.62% | 0.5708 | 2 | 81.75% | 18 |
| 0.915 | -1.58% | -0.26% | 1.66% | 0.5732 | 2 | 82.91% | 18 |
| 0.91 | -1.58% | -0.26% | 1.73% | 0.5763 | 2 | 83.76% | 18 |
| 0.905 | -1.58% | -0.26% | 1.84% | 0.5778 | 2 | 84.61% | 19 |
| 0.9 | -1.59% | -0.26% | 1.97% | 0.5788 | 2 | 85.20% | 19 |
| 0.895 | -1.59% | -0.26% | 1.97% | 0.5775 | 2 | 85.80% | 19 |
| 0.89 | -1.59% | -0.26% | 2.00% | 0.5785 | 2 | 86.35% | 19 |
| 0.885 | -1.59% | -0.26% | 2.07% | 0.5826 | 2 | 86.82% | 19 |
| 0.88 | -1.63% | -0.26% | 2.07% | 0.5825 | 2 | 87.32% | 19 |
| 0.875 | -1.63% | -0.26% | 2.34% | 0.5910 | 2 | 87.78% | 20 |
| 0.87 | -1.63% | -0.26% | 2.35% | 0.5913 | 2 | 88.23% | 20 |
| 0.865 | -1.63% | -0.26% | 2.35% | 0.5889 | 2 | 88.62% | 20 |
| 0.86 | -1.63% | -0.26% | 2.51% | 0.5934 | 1 | 88.99% | 20 |
| 0.855 | -1.63% | -0.26% | 2.51% | 0.5928 | 1 | 89.38% | 20 |
| 0.85 | -1.63% | -0.26% | 2.51% | 0.5926 | 1 | 89.71% | 20 |
| 0.845 | -1.63% | -0.26% | 2.57% | 0.5934 | 1 | 90.02% | 20 |
| 0.84 | -1.78% | -0.26% | 2.64% | 0.6033 | 1 | 90.49% | 21 |
| 0.835 | -1.78% | -0.26% | 2.64% | 0.6030 | 1 | 90.71% | 21 |
| 0.83 | -1.92% | -0.26% | 2.69% | 0.6096 | 1 | 91.00% | 21 |
| 0.825 | -1.95% | -0.26% | 2.69% | 0.6108 | 1 | 91.21% | 21 |
| 0.82 | -1.95% | -0.26% | 2.69% | 0.6108 | 1 | 91.53% | 21 |
| 0.815 | -1.95% | -0.26% | 2.69% | 0.6105 | 1 | 91.79% | 21 |
| 0.81 | -1.95% | -0.26% | 2.69% | 0.6112 | 1 | 92.06% | 21 |
| 0.805 | -1.95% | -0.26% | 2.69% | 0.6112 | 1 | 92.25% | 21 |
| 0.8 | -1.95% | -0.26% | 2.69% | 0.6113 | 1 | 92.43% | 21 |
| 0.795 | -1.95% | -0.26% | 2.69% | 0.6113 | 1 | 92.63% | 21 |
| 0.79 | -1.95% | -0.26% | 2.69% | 0.6114 | 1 | 92.75% | 21 |
| 0.785 | -1.95% | -0.26% | 2.69% | 0.6114 | 1 | 92.93% | 21 |
| 0.78 | -1.95% | -0.26% | 2.76% | 0.6126 | 1 | 93.21% | 21 |
| 0.775 | -1.95% | -0.26% | 2.76% | 0.6126 | 1 | 93.41% | 21 |
| 0.77 | -1.95% | -0.26% | 2.76% | 0.6126 | 1 | 93.54% | 21 |
| 0.765 | -1.95% | -0.26% | 2.76% | 0.6126 | 1 | 93.63% | 21 |
| 0.76 | -1.95% | -0.26% | 2.76% | 0.6107 | 1 | 93.76% | 21 |
| 0.755 | -1.95% | -0.26% | 2.76% | 0.6109 | 1 | 93.95% | 21 |
| 0.75 | -1.95% | -0.26% | 2.76% | 0.6104 | 1 | 94.14% | 21 |

Based on this we conclude that the ORM2f algorithm combined with the requirement that r<sup>2</sup> needs to be above 0.84 is the most optimal solution: it filters enough noise to surpress outliers but the remaining valid dragfactors are frequent enough to allow a good pickup early in the rowing session.

| Minimal r<sup>2</sup> | Drag smoothing | Min | Avg | Max | SD | Average first valid stroke | Valid drag calculations | Number of rowing sessions with over 75% validity |
| :-- | --: | --: | --: | --: | --: | --: | --: | --: |
| 0.84 | 1 | -1.78% | -0.26% | 2.64% | 0.6033 | 1 | 90.49% | 21 |
| 0.84 | 2 | -1.46% | -0.26% | 1.91% | 0.4826 | 1 | 90.49% | 21 |
| 0.84 | 3 | -1.28% | -0.26% | 1.70% | 0.4270 | 1 | 90.49% | 21 |
| 0.84 | 4 | -1.15% | -0.25% | 1.66% | 0.3928 | 1 | 90.49% | 21 |
| 0.84 | 5 | -1.09% | -0.25% | 1.70% | 0.3745 | 1 | 90.49% | 21 |
| 0.84 | 6 | -1.05% | -0.25% | 1.70% | 0.3603 | 1 | 90.49% | 21 |

Based on this, we come to the following results based on the ORM2f algorithm combined with the requirement that r<sup>2</sup> needs to be above 0.84, with a running average of 6 strokes. Increasing the running average further might further improve the stability of the dragfactor, but this hasn't been applied in this test due to practical limitations. Applying these settings to the sessions, leads to the following (simulated) results:

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

Looking at the ORM2f algorithm with these settings, it is quite close to the intended target of the Concept2 dragfactor. Also the standard deviation is sufficiently small with the ORM2f algorithm, and the standard deviation is at least 3 and sometimes 10 times smaller than the original implementation, supporting its use. We observe that the percentage valid dragfactors seems to be correlated with the dragfactor. Our hypohtesis is that this might be due to (a lack of decent) rowingstyle, which at lower dragfactors is more dominant than at higher dragfactors as there was a clear focus on the PM5's powercurve to prevent injury.

### Validation of the linear distance calculation

The distance calculation is solely dependent on the drag factor (a known factor that already is validated and that can be checked afterwards) and the duplicated impulses. Thus, as the impulses are duplicated across the monitors, the resulting distance calculation is a good indicator for the quality of this calculation, as it depends on the number of impulses encountered, irrelevant of their timing (as would be the case with the speed).

#### Theoretical basis of the linear distance calculation

From theory [[1]](#1) and [[2]](#2) the initial calculation was based on formula 9.1 described in [[1]](#1):

> P=2.8 \* u<sup>3</sup>

The calculation of linear speed is based on this, resulting in the following formula [[1]](#1), formula 9.2:

> u=(k/2.8)<sup>1/3</sup> &omega;

As s = u \* t, the calculation of linear distance accordingly becomes [[1]](#1), formula 9.3:

> s=(k/2.8)<sup>1/3</sup> &theta;

In RowingEngine 2.0 (in RowingEngine.js, OpenRowingMonitor version 0.8.2) we implemented formula 9.3 as follows:

```javascript
LinearDistance = Math.pow((dragFactor / rowerSettings.magicConstant), 1.0 / 3.0) * AngularDisplacement
```

Although OpenRowingMonitor temporarily calculates a completed distance per recorded impulse for display purposses, the completed distance is definite value is calculated per phase as the dragfactor then can be applied retrospectively onto the Recovery phase.

According to [[1]](#1) and [[2]](#2), Marinus van Holst observed that C2 seems to use a different formula for its calculations, which is described in formula 9.4 [[1]](#1):

> P=4.31 \* u<sup>2.75</sup>

By applying formula 9.4 to calculate the linear speed, we obtain the following formula, replacing beforementioned formula 9.2:

> u=((k \* &omega;<sup>0.25</sup>) / 4.31)<sup>1/2.75</sup> &omega;

As s = u \* t, we can also use this formula 9.4 to calculate the linear distance. By doing so we obtain the following formula, replacing beforementiond formula 9.3:

> s=((k \* &omega; <sup>0.25</sup>) / 4.31)<sup>1/2.75</sup> &theta;

The introduction of &omega; into the distance calculation adds some complexity and introduces a specific dependency that requires a concious design decission. The dependency on &omega; in the van Holst algorithm requires a decission on the is the granularity of &omega; determination used: the finegrainedness of applying the algorithm to calculate the distance (i.e. an average over a completed stroke, a completed phase, a comnpleted flywheel rotation or for each recorded impulse) influences both the &omega; used and its robustness. From small experiments, we must conclude that changing the granularity has a measurable effect on the recorded distance. The current implementation calculates the completed distance definitively per completed phase. At this stage we keep the granularity as it was implemented originally, per phase, but we will conduct an sensitivity analysis with respect to the granularity used when the van Holst approach delivers feasible results.

#### Results and interpretation of a first side-by-side linear distance test

The first series side-by-side test are fixed distance or fixed time tests (taking at least 15 minutes), where both monitors are fed the same stream of impulses (as described above). This test stops when both monitors have reached 4000 meters, where OpenRowingMonitor uses its traditional algorithm to calculate this criterion. If the van Holst algorithm hasn't reached the target distance, the relative slowness will be calculated on the completed distances compared with the projected distance of the PM5, instead of the reached time.

The focus in this test is on a steady-state rowing. We consider the distance sufficiently long to be able to abstract away from any differences in start-up behaviour of the two monitors. We obtained the following times:

| Test | Drag factor | Target distance | #strokes on PM5| Result on PM5 | #strokes on ORM | Base algorithm result | Base algorithm Deviation | Result van Holst | van Holst Deviation |
| :-: | --: | --: | --: | --: |--: | --: | --: | --: | --: |
| 32 | 70 | 4,000 m | 441 | 17:31.3 | 444 | 17:36.5 | -0,49% | 3,857.0 m | -3,98% |
| 33 | 122 | 6,000 m | 606 | 25:44.8 | 609 | 25:52.2 | -0,48% | 5,794.5 m | -3,79% |
| 34 | 112 | 10,000 m | 1051 | 43:08.2 | 1056 | 43:20.3 | -0,47% | 9,659.2 m | -3,82% |
| 35 | 80 | 4,000 m | 438 | 17:26.0 | 440 | 17:30.9 | -0,47% | 3,856.3m | -3,96% |
| 36 | 220 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 37 | 90 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 38 | 210 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 39 | 120 | 6,000 m | | :. |  | :. | -,% | m | -,% |
| 40 | 110 | 10,000 m | | :. |  | :. | -,% | m | -,% |
| 41 | 100 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 42 | 200 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 43 | 130 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 44 | 190 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 45 | 120 | 6,000 m | | :. |  | :. | -,% | m | -,% |
| 46 | 110 | 10,000 m | | :. |  | :. | -,% | m | -,% |
| 47 | 140 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 48 | 180 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 49 | 150 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 50 | 170 | 4,000 m | | :. |  | :. | -,% | m | -,% |
| 51 | 110 | 6,000 m | | :. |  | :. | -,% | m | -,% |
| 52 | 100 | 10,000 m | | :. |  | :. | -,% | m | -,% |
| 53 | 160 | 4,000 m | | :. |  | :. | -,% | m | -,% |

Here, a negative deviation indicates that the algorithm was too slow when compared to the PM5 data, a positive deviation indicates that the algorithm was too fast when compared to the PM5 data. The strokerate was nearly identical along the row, and only varied slightly between 23 and 24 SPM). The total number of strokes across the monitors was sufficiently similar at similar times. We observer that the PM5 contains several badly detected strokes: typically the retrieved data contained subsequent strokes where the stroke duration was between 0.5 and 1.5 seconds, suggesting that the stroke was split in two. OpenRowingMonitor, with a very conservative stroke detection flank of 10, did not have this problem. This error might be introduced through bad technique, as a badly timed bad transition from the back to the arms might cause this.

#### Results and interpretation of the first series of side-by-side linear distance tests

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

## Notes

The numbering is based on a series of rowing sessions. Due to a bug discovered in the RowingEngine of OpenRowingMonitor 0.8.2, several test-results were invalidated and thus removed from these overviews. To retain traceability, tests have not been renumbered.

With **Drag poisoning** we mean that by including a noisy *currentDt* reading in the drag calculation, it spikes to unrealistic values, throwing off the speed, power and other metric estimation for several strokes.

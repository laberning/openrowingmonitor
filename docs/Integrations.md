# Integrations with other services

<!-- markdownlint-disable no-inline-html -->
For services we distinguish between two types of functionality:

* **Download workout**: here OpenRowingMonitor will fetch the planned workout parameters (target distance, intervals, etc.) from the service before the session and will program the monitor accordingly

* **Upload results**: here OpenRowingMonitor uploads the result of your rowing session (i.e. total time rowed, pace, stroke rate, etc.) to the service after your session has completed

Looking at the individual services, we see the following:

| Service | Download workout plan | Upload results | Remarks |
| --- | --- | --- | --- |
| File system | No | Yes | Integrated service |
| Strava | No | Yes | Integrated service |
| RowsAndAll.com | No | Yes | Integrated service |
| Rowingdata | No | Yes | Upoad only, currently requires batch script to import RowingData file |
| Intervals.icu | No | Yes | Integrated service |
| Garmin Connect | No | No | Upoad only, currently requires batch script to upload fit file |
| MQTT | Yes | Yes | Integrated service |

In the following sections we describe their pro's and con's, as well as their current limitations with OpenRowingMonitor, and how to set it up.

## File system

OpenRowingMonitor supports the following exports, which can be obtained via the network share:

* **Garmin FIT files**: These are binairy files that contain the most interesting metrics of a rowing session. Most modern training analysis tools will accept a FIT-file. You can manually upload these files to training platforms like [Strava](https://www.strava.com), [Garmin Connect](https://connect.garmin.com), [Intervals.icu](https://intervals.icu/), [RowsAndAll](https://rowsandall.com/) or [Trainingpeaks](https://trainingpeaks.com) to track your training sessions;

* **Training Center XML files (TCX)**: These are XML-files that contain the most essential metrics of a rowing session. Most training analysis tools will accept a tcx-file. You can upload these files to training platforms like [Strava](https://www.strava.com), [Garmin Connect](https://connect.garmin.com), [Intervals.icu](https://intervals.icu/), [RowsAndAll](https://rowsandall.com/) or [Trainingpeaks](https://trainingpeaks.com) to track your training sessions;

* **RowingData** files, which are comma-seperated files with all metrics Open Rowing Monitor can produce. These can be  uploaded to [RowsAndAll](https://rowsandall.com/) for a webbased analysis (including dynamic in-stroke metrics). The csv-files can also be processed manually in Excel, allowing your own custom analysis. Please note that for visualising in-stroke metrics in [RowsAndAll](https://rowsandall.com/) (i.e. force, power and handle speed curves), you need their yearly subscription.

* **Raw** flywheel measurements of the flywheel, also in CSV files. These files are great to analyse and replay the specifics of your rowing machine (some Excel visualistion can help with this).

The creation of each of these files is independently controlled via their own parameters in the `config.js`. You can turn on each filetype independently without issue, as OpenRowingMonitor will make sure the names will not be identical, even when the file extension is the same. OpenRowingMonitor can create regular files and gzipped files (which are accepted by several websites) and will write them in the directory specified in the `dataDirectory` parameter of `config.js`. In `config.js`, you can set a parameter to create a file and another parameter to gzip it. The following parameters are available:

| File type | parameter to create file | parameter to zip file |
| --- | --- | --- |
| Garmin FIT files | createFitFiles | gzipFitFiles |
| Garmin TCX files | createTcxFiles | gzipTcxFiles |
| Rowingdata csv | createRowingDataFiles | - |
| Raw flywheel data | createRawDataFiles | gzipRawDataFiles |

> [!NOTE]
> To create a gzipped file, you both need to set the both parameters to true. So to create gzipped FIT-files, both the `createFitFiles` and `gzipFitFiles` parameters must be set to true.

The OpenRowingMonitor installer can set up a network share that contains all training data so it is easy to grab the files from there and manually upload them to the training platform of your choice.

## Strava

Uploading your sessions to [Strava](https://www.strava.com) is an integrated feature. The Strava uploader will create and upload the fit-files automatically, and does not require setting the `createFitFiles` parameter.

This manual is a modified version of [this manual](https://gist.github.com/michaellihs/bb262e2c6ee93093485361de282c242d) and [this manual](https://developers.strava.com/docs/getting-started/#account).

### Step 1: Create a Strava API

To use the Starva integration, we first have to create a Strava API Application in Strava. So, first step is to open [https://www.strava.com/settings/api](https://www.strava.com/settings/api) and fill in the following fields as follows:

* `Application Name` chose whatever name you like, for example 'OpenRowingMonitor'
* `Website` chose whatever website you want to use (needs to be a valid url, e.g. [http://google.com]
* `Callback Domain` any domain name that should be used as a callback, can be 127.0.0.1

After you saved your API, you need to upload a image for it.

Open the [https://strava.github.io/api/v3/oauth/](https://strava.github.io/api/v3/oauth/) page again and copy the following values to a text editor

* `Client ID` - an ID for your application, used later on to identify your App
* `Secret` - a secret token generated for you (not your OAuth Token!)

### Step 2: Generate a refresh token

Open the following URL (replace `CLIENT_ID` with the Client ID you wrote down earlier):

```HTML
https://www.strava.com/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2Flocalhost&scope=activity:write&state=mystate&approval_prompt=force
```

Make sure to check the option to upload workouts in the screen popping up before you hit the 'authorize' button.

Your browser will redirect, but will fail as the URL is local. However, in the URL that was called, there is an element that says 'code=xxxxxx'. Write down that code.

On your Raspberry Pi, open the shell, and put in the following command (here you need to replace `CLIENT_ID`, `CLIENT_SECRET` and `CODE` with the values you wrote down in the previous steps):

```shell
curl -X POST https://www.strava.com/oauth/token -F client_id=CLIENT_ID -F client_secret=CLIENT_SECRET -F code=CODE
```

curl will respond with a JSON-object. In that JSON-object, you'll find the `refresh_token`. Write that down, as we need it for the settings.

### Step 3: Setting up Strava in OpenRowingMonitor

Part of the user specific parameters in `config/config.js` are the Strava settings. So in the user settings, you need to add the following (here you need to replace `CLIENT_ID`, `CLIENT_SECRET` and `refresh_token` with the values you have written down in the previous steps:

```js
    // Configuration for the Strava uploader
    strava: {
      allowUpload: true,
      autoUpload: false,
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET',
      refreshToken: 'refresh_token'
    },
```

The parameter 'allowUpload' allows uploads in general (so disabling it will block all forms of uploading). The parameter 'autoUpload" determines if your workout is uploaded at the end of the session. If you set 'autoUpload' to false, but 'allowUpload' to true, you need to push the upload button on the screen to trigger the upload (making uploading a manual step).

## RowsAndAll.com

[RowsAndAll](https://rowsandall.com/) provides the most extensive on-line data analysis environment for rowing. Our RowingData export is made in collaboration with them, and provides the most extensve dataset OpenRowingMonitor can provide.

The RowsAndAll.com uploader will create and upload the RowingData-files automatically, and does not require setting the `createRowingDataFiles` parameter. Uploading is activated by adding the API-key (which can be found in your [import settings of you user profile](https://rowsandall.com/rowers/me/exportsettings/)) and setting `AllowUpload` to true in the user profile of `config.js`:

```js
    // Configuration for the RowsAndAll.com upload
    rowsAndAll: {
      allowUpload: true,
      autoUpload: false,
      apiKey: ''
    },
```

The parameter `allowUpload` allows uploads in general (so disabling it will block all forms of uploading). The parameter `autoUpload` determines if your workout is uploaded at the end of the session. If you set `autoUpload` to false, but `allowUpload` to true, you need to push the upload button on the screen to trigger the upload (making uploading a manual step).

> [!NOTE]
> Please note that for visualising in-stroke metrics in [RowsAndAll](https://rowsandall.com/) (i.e. force, power and handle speed curves), you need their yearly subscription

## Rowingdata

[RowingData](https://pypi.org/project/rowingdata/) is an app that can be installed on your Raspberry Pi, allowing you to automatically have an analysis platform as well.

## Intervals.icu

Uploading of fit-files to [Intervals.icu](https://intervals.icu/) is an integrated service. The Intervals.icu uploader will create and upload the FIT-files automatically, and does not require setting the `createFitFiles` parameter.

The Intervals.icu uploader is activated by adding the athlete-Id and API-key (which can be found in your [settings of you user profile](https://intervals.icu/settings)) and setting `allowUpload` to true in the user profile of `config.js`:

```js
    // Configuration for the intervals.icu upload
    intervals: {
      allowUpload: true,
      autoUpload: false,
      athleteId: '',
      apiKey: ''
    }
```

The parameter `allowUpload` allows uploads in general (so disabling it will block all forms of uploading). The parameter `autoUpload` determines if your workout is uploaded at the end of the session. If you set `autoUpload` to false, but `allowUpload` to true, you need to push the upload button on the screen to trigger the upload (making uploading a manual step).

## Garmin Connect

Uploading to [Garmin Connect](https://connect.garmin.com) can be done by uploading the fit-file via [python-garminconnect](https://github.com/cyberjunky/python-garminconnect/tree/master) and a batch script.

## MQTT

To publish real-time metrics to a MQTT broker, like a home automation system, you need to add the following to your config.js:

```js
  mqtt: {
    mqttBroker: '',
    username: '',
    password: '',
    machineName: ''
  },
```

Here, the `mqttBroker` is the ip/internet adress of the broker (without the protocol descriptor, so for example `broker.emqx.io`), and the `username` and `password` are the ones you use to log in on that broker.

The `machineName` is an element that is used to identify your monitor uniquely in your MQTT environment.

### Recieving metrics

The topic 'OpenRowingMonitor/`machineName`/metrics' will contain your metrics. Each completed stroke results in one message, initiated at the beginning of the drive. At the begin/end of splits, intervals and sessions an additional message will be sent. Flags indicate the rowing machine state and all associated metrics.

| Field | Meaning | Unit |
| --- | --- | --- |
| timestamp | The timestamp of the creation of the metrics | JSON timestamp |
| intervaltype | The type of the current interval | `justrow`, `distance`, `time` or `rest` |
| sessionStatus | | |
| strokeState | | |
| isMoving | Flag indicating the rowing machine is moving | Boolean |
| isDriveStart | Flag indicating the message is sent at the beginning of the drive. As the MQTT typically sends this message at the start of the drive, expect this to be true 99% of the time | Boolean |
| isRecoveryStart | Flag indicating the message is sent at the beginning of the recovery. This should be extremely rare. | Boolean |
| isSessionStart | Flag indicating the message is sent at the beginning of a rowing session. | Boolean |
| isPauseStart | Flag indicating the message is sent at the beginning of a pause. | Boolean |
| isPauseEnd | Flag indicating the message is sent at the end of a pause. | Boolean |
| isSessionStop | Flag indicating the message is sent at the end of a session | Boolean |
| totalNumberOfStrokes | | Counter |
| totalMovingTime | | Seconds |
| totalDistance | | Meters |
| totalCalories | | kCal |
| splitNumber | | Counter |
| heartrate | | Beats per minute |
| velocity | | m/s |
| pace | | sec/500m |
| power | | Watts |
| driveDuration | | milliseconds |
| driveLength | | Meters |
| recoveryDuration | | milliseconds |
| strokeDuration | | milliseconds |
| strokeRate | | strokes per minute |
| distancePerStroke | | Meters |
| peakHandleForce | Maximum encountered force during the drive | Newtons |
| averageHandleForce | Average handle force during the drive | Newtons |
| forceCurve | Handle force during the drive | Newtons over drive length |
| velocityCurve | Velocity of the handle during the drive | m/s over drive length |
| powerCurve | Velocity of the handle during the drive | Watts over drive length |
| dragFactor | | 10<sup>-6</sup> N\*m\*s<sup>2</sup> |

### Pushing workouts

In the topic 'OpenRowingMonitor/`machineName`/workoutplans' you can push your workoutplan in stringified JSON format.

> [!NOTE]
> Workoutplans are only accepted before a session, not during one.

For example:

```js
[
  {
    "type": "distance",
    "targetDistance": "5000",
    "targetTime": "0",
    "split": {
      "type": "distance",
      "targetDistance": "500",
      "targetTime": "0"
    }
  }
]
```

Will create a session that will stop at exactly 5000 meters, and will create a split every 500 meters.

> [!NOTE]
> Please observe that a workoutplan will always have to be an array (square brackets). This allows the use of multiple sequential intervals. After completing the last interval, the session will be stopped.

Valid values for type are:

* `justrow`: an endless session that will not stop unless you stop rowing. If you like an undetermined cooldown after a session, this is recomended as last interval.
* `distance`: creates an interval that will end at a specified distance. This requires the `targetDistance` to be greater than 0 meters.
* `time`: creates an interval that will end at a specified time. This requires the `targetTime` to be greater than 0 seconds.
* `calories`: creates an interval that will end at a specified calorie count. This requires the `targetCalories` to be greater than 0 calories.
* `rest`: creates an rest interval with a minumum duration of `targetTime` seconds. PLease note, duing a rest interval, no metrics will be recorded.

Splits are optional elements. It will allow a session to be split up into smaller pieces for analysis purposes. In OpenRowingMonitor, intervals and splits do not have to be of the same type. So one can have time based splits in a distance based interval. Please observe that in the transition from one interval to the next, splits are reset.

So an alternative session is the following:

```js
[
  {
    "type": "time",
    "targetTime": "120"
  },
  {
    "type": "rest",
    "targetTime": "60"
  },
  {
    "type": "distance",
    "targetDistance": "2000",
    "split": {
      "type": "distance",
      "targetDistance": "500"
    }
  },
  {
    "type": "justrow"
  }
]
```

This will create a session that starts with a 120 seconds warmup interval, followed by at least 60 seconds rest, then a 2K, followed by an indefinite cooldown.

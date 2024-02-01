# Known rowers and their support status

Open Rowing Monitor works with a very wide range of rowing machines. It is currently developed and tested with a Sportstech WRX700 water-rower and a Concept2 air-rower. In the past, it was also tested extensively on a NordicTrack RX-800 hybrid air/magnetic rower. But it should run fine with any rowing machine that uses some kind of damping mechanism, as long as you can add something to measure the speed of the flywheel. It has shown to work well with DIY rowing machines like the [Openergo](https://openergo.webs.com/), providing the construction is decent.

The following rowers are known to work, or are even actively supported:

| Brand | Type | Rower type | Measurement type | HW Modification needed | Support status | Rower profile | Basic Metrics | Advanced Metrics | Limitations | Remarks |
| ----- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---------------- |
| Abilica | Winrower 2.0 | Air rower | Handle drive wheel | No | Known to work | - | Yes | No | Static distance | see [this discussion](https://github.com/laberning/openrowingmonitor/discussions/48) |
| Concept 2 | Model B, C | Air rower | Flywheel | Modification to electrical signal | In development | - | - | - | - | See [this](https://github.com/laberning/openrowingmonitor/issues/77), [this](https://github.com/laberning/openrowingmonitor/discussions/38) and [this](https://github.com/laberning/openrowingmonitor/discussions/151) discussion|
| | Model D, E | Air rower | Flywheel | Modification to electrical signal | Active support | Concept2_RowErg | Yes | Yes | None | [Concept 2 Model D, Model E and RowErg setup](hardware_setup_Concept2_RowErg.md) |
| | RowErg | Air rower | Flywheel | Modification to electrical signal | Active support | Concept2_RowErg | Yes | Yes | None | [Concept 2 Model D, Model E and RowErg setup](hardware_setup_Concept2_RowErg.md) |
| Decathlon | Rower 120 | Physical friction | Flywheel | Adding sensor and adding magnets to the flywheel | In development | - | - | - | - | see [this discussion](https://github.com/laberning/openrowingmonitor/issues/110) |
| DKN | R-320 | Air Rower | Flywheel | No | Full support | DKN_R320 | Yes | No | Static drag | - |
| FDF | Neon Pro V | Air rower | Flywheel | Sensor replacement | Known to work | - | Yes | - | - | see [this](https://github.com/laberning/openrowingmonitor/discussions/87) and [this](https://github.com/JaapvanEkris/openrowingmonitor/discussions/11) discussion|
| ForceUSA | R3 | Air Rower | Flywheel | No | Supported | ForceUSA_R3 | Yes | Yes | None | - |
| Johnson | JAR5100 | Air Rower | Flywheel | Yes, add magnets and sensor | Configuration known | - | Yes | Yes | None | [this discussion](https://github.com/laberning/openrowingmonitor/discussions/139) |
| NordicTrack | RX800 | Hybrid Magnetic and Air rower | Flywheel | None | Full support | NordicTrack_RX800 | Yes | Yes | None | Also known under ProForm brand |
| Sportstech | WRX700 | Water rower | Impellor | Add one magnet | Active support | Sportstech_WRX700 | Yes | Yes | Static drag | see [Sportstech WRX700 setup](hardware_setup_WRX700.md) |
| White label | Air Rower | Air rower | Fywheel | None | Supported | Generic_Air_Rower | Yes | Yes | None | Sold under different brand names |
| Open ergo | - | Air rower | Flywheel | Addition of magnets en sensor | Known to work | - | Yes | Yes | None | Machine specific profile is needed, but is done before, see [example 1](https://github.com/laberning/openrowingmonitor/discussions/80), [example 2](https://github.com/laberning/openrowingmonitor/discussions/105) and [example 3](https://github.com/laberning/openrowingmonitor/discussions/115) |

If your machine isn't listed, it just means that you need to [adjust the software settings following the settings adjustment guide](rower_settings.md) yourself. But don't worry, in the [GitHub Discussions](https://github.com/laberning/openrowingmonitor/discussions) there always are friendly people to help you set up your machine and the settings.

## Support status

In the table, the support status means the following:

* **Active support**: These are the testmachines of the developers, these are tested almost on a daily basis. These settings are automatically modified to facilitate updates of the rowing engine;
* **Full support**: We actively maintain a the configuration, including automatically updating these settings to facilitate chages of the rowing engine, and are part of the automated regression test set. So as a user, you can be assured this setting will keep working;
* **Supported**: Users have reported a working configuration, and this configuration is part of `rowerProfiles.js`, but we lack the raw data samples to maintain the rower for future updates. This means that future support isn't guaranteed;
* **Configuration known**: Users have reported a working configuration, but it isn't actively supported by these users and it isn't on our rader to maintain. You need to add the configuration to your `config.js` manually and maintain it yourself when there are updates to the engine;
* **Known to work**: Users have reported that the rower is known to work, but the configuration is not known by us;
* **In development**: Users are known to be working to get the rower connected, but the configuration is not yet known by us.

Please note: the support status largely depends on the willingness of users to report their settings and provide decent samples of their data. So when you have a machine, please provide this information.

## Basic Metrics

With basic metrics we mean:

* Distance rowed,
* Training Duration,
* Power,
* Pace,
* Strokes per Minute,
* Drive time,
* Recovery Time,
* Calories used,
* Total number of strokes,
* Heart Rate

## Extended Metrics

With extended metrics, we mean:

* Drag factor,
* Drive length,
* Average handle force,
* Peak handle force,
* Handle force curve,
* Handle velocity curve,
* Handle power curve.

## Limitations

With the limitation, we mean:

* **None**: No limitations, drag calculation and distance per stroke are dynamic based on flywheel behaviour and automatically adapt to environmental conditions;
* **Static drag**: the drag calculation is fixed, so changes in air/water properties due to temperature or settings are not automatically adjusted;
* **Static distance**: the distance per impulse is fixed, thus making the measurement of a more forceful stroke impossible. This typically happens when the handle movement is measured, but not its effect on the flywheel.

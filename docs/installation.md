# Set up of Open Rowing Monitor

This guide roughly explains how to set up the rowing software and hardware.

## Requirements

* A Raspberry Pi that supports Bluetooth Low Energy (Pi 3 or Pi 4). Probably this also runs on other devices.
* An SD Card, any size above 4GB should be fine
* A rowing machine (obviously) with some way to measure the rotation of the flywheel
  * the WRX700 has a build in reed sensor that I can directly connect to the GPIO pins of the Raspberry Pi
  * if your machine doesn't have a sensor, it should be easy to build something similar (magnetically or optical)
* Some Dupont cables to connect the GPIO pins to the sensor

## Software Installation

### Initialization of the Raspberry Pi

* Install **Raspberry Pi OS Lite** on the SD Card i.e. with the [Raspberry Pi Imager](https://www.raspberrypi.org/software)
* Connect the device to your network ([headless](https://www.raspberrypi.org/documentation/configuration/wireless/headless.md) or via [command line](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md))
* Enable [SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md)

### Installation of the Open Rowing Monitor

Connect to the device with SSH and initiate the following command to set up all required dependencies and to install Open Rowing Monitor as an automatically starting system service:

```zsh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/laberning/openrowingmonitor/HEAD/install/install.sh)"
```

### Updating to a new version

Open Rowing Monitor does not provide proper releases (yet), but you can update to the latest development version with this command:

```zsh
sudo /opt/openrowingmonitor/install/update.sh
```

### Running Open Rowing Monitor without root permissions

The default installation will run Open Rowing Monitor with root permissions. If you want you can also run it as user by modifying the following system services:

#### To use BLE and open the Web-Server on port 80

Issue the following command:

```zsh
sudo setcap cap_net_bind_service,cap_net_raw=+eip $(eval readlink -f `which node`)
```

#### To access ANT+ USB sticks

Create a file `/etc/udev/rules.d/51-garmin-usb.rules` with the following content:

```zsh
ATTRS{idVendor}=="0fcf", ATTRS{idProduct}=="1008", MODE="0666"
ATTRS{idVendor}=="0fcf", ATTRS{idProduct}=="1009", MODE="0666"
```

## Hardware Installation

Basically all that's left to do is hook up your sensor to the GPIO pins of the Raspberry Pi and configure the rowing machine specific parameters of the software.

Open Rowing Monitor reads the sensor signal from GPIO port 17 and expects it to pull on GND if the sensor is closed. To get a stable reading you should add a pull-up resistor to that pin. I prefer to use the internal resistor of the Raspberry Pi to keep the wiring simple but of course you can also go with an external circuit.

![Internal wiring of Raspberry Pi](img/raspberrypi_internal_wiring.jpg)
*Internal wiring of Raspberry Pi*

The internal pull-up can be enabled as described [here](https://www.raspberrypi.org/documentation/configuration/config-txt/gpio.md). So its as simple as adding the following to `/boot/config.txt` and then rebooting the device.

``` Properties
# configure GPIO 17 as input and enable the pull-up resistor
gpio=17=pu,ip
```

How to connect this to your rowing machine is specific to your device. You need some kind of mechanism to convert the rotation of the flywheel into impulses. The WRX700 has a reed sensor for this built-in so hooking it up is as simple as connecting the cables. This sensor had one magnet on the wheel, which gives one impulse per rotation. I simply plugged a second magnet to the opposite side of the wheel to double the resolution for more precision.

![Connecting the reed sensor](img/raspberrypi_reedsensor_wiring.jpg)
*Connecting the reed sensor*

If your machine does not have something like this or if the sensor is not accessible, you can still build something similar quite easily. Some ideas on what to use:

* Reed sensor (i.e. of an old bike tachometer)
* PAS sensor (i.e. from an E-bike)
* Optical chopper wheel

You should now adjust the rower specific parameters in `config/config.js` to suit your rowing machine. Have a look at [config/default.config.js](../config/default.config.js) to see what config parameters are available.

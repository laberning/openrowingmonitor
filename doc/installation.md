# Set up of Open Rowing Monitor

This guide roughly explains how to set up your device. I will probably build an automated installation script from this later.

## Requirements

* A Raspberry Pi that supports Bluetooth Low Energy (Pi 3 or Pi 4). Probably this also runs on other devices.
* An SD Card, any size above 4GB should be fine
* A rowing machine (obviously) with some way to measure the rotation of the flywheel
  * the WRX700 has a build in reed sensor that I can directly connect to the GPIO pins of the raspi
  * if your machine doesn't have a sensor, it should be easy to build something similar (magnetically or optical)
* Some dupont wires to connect the GPIO pins to the sensor

## Software Installation

### Set up the Raspberry Pi

* Install **Raspberry Pi OS Lite** on the SD Card i.e. with the [Raspberry Pi Imager](https://www.raspberrypi.org/software)
* Connect the device to your network ([headless](https://www.raspberrypi.org/documentation/configuration/wireless/headless.md) or via [command line](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md))
* Enable [SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md)

### Open a SSH-Connection and set up the dependencies

```zsh
sudo apt-get update
sudo apt-get dist-upgrade
sudo systemctl disable bluetooth
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
```

### Install Node.js

```zsh
curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
apt-get install -y nodejs
```

### If you want to run Bluetooth Low Energy and the webserver on port 80 without root

```zsh
sudo setcap cap_net_bind_service,cap_net_raw=+eip $(eval readlink -f `which node`)
```

### Download Open Rowing Monitor and install dependencies

```zsh
curl -LJO https://github.com/laberning/openrowingmonitor/archive/main.zip
unzip main.zip -d ~/openrowingmonitor
rm main.zip
cd ~/openrowingmonitor
npm install
```

### Configuration and Startup

You should now be able to start the Rowing Monitor: `npm start`

You should now adjust the rower specific parameters in `app/engine/RowingEngine.js` to suit your rowing machine.

### Automatically start Open Rowing Monitor while booting

Create file `/lib/systemd/system/openrowingmonitor.service` with the following content:

```Properties
[Unit]
Description=Open Rowing Monitor
After=multi-user.target

[Service]
Type=simple
User=pi
# Restart=on-failure
WorkingDirectory=/home/pi/openrowingmonitor
ExecStart=/bin/bash -c 'PATH=/home/pi/.nvm/versions/node/v14.15.5/bin:$PATH exec npm start'

[Install]
WantedBy=multi-user.target
```

## Hardware Installation

Basically all thats left to do is hook up your reed sensor to the GPIO pins of the Raspberry Pi.

todo: add a photo of the wired device

Open Rowing Monitor reads the sensor signal from GPIO port 17 and expects it to pull on GND if the sensor is closed. To get a stable reading you should add a pull-up resistor to that pin. I prefer to use the internal resitor of the raspi to keep the wiring simple but of course you can also go with an external circuit.

The internal pull-up can be enabled as described [here](https://www.raspberrypi.org/documentation/configuration/config-txt/gpio.md). So its as simple as adding the following to `/boot/config.txt` and then rebooting the device.

``` Properties
# configure GPIO 17 as input and enable the pull-up resistor
gpio=17=pu,ip
```

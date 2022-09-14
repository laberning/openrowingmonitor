# Hardware set up of Open Rowing Monitor on a Concept 2 RowErg

This guide roughly explains how to set up the hardware.

After the software installation, basically all that's left to do is hook up your sensor to the GPIO pins of the Raspberry Pi and configure the rowing machine specific parameters of the software.

Open Rowing Monitor reads the sensor signal from GPIO port 17 and expects it to pull on GND if the sensor is closed. To get a stable reading you should add a pull-up resistor to that pin. I prefer to use the internal resistor of the Raspberry Pi to keep the wiring simple but of course you can also go with an external circuit.

The internal pull-up can be enabled as described [here](https://www.raspberrypi.org/documentation/configuration/config-txt/gpio.md). So its as simple as adding the following to `/boot/config.txt` and then rebooting the device.

``` Properties
# configure GPIO 17 as input and enable the pull-up resistor
gpio=17=pu,ip
```

How to connect this to your rowing machine is specific to your device. You need some kind of mechanism to convert the rotation of the flywheel into impulses. The WRX700 has a reed sensor for this built-in so hooking it up is as simple as connecting the cables. This sensor had one magnet on the wheel, which gives one impulse per rotation. I simply plugged a second magnet to the opposite side of the wheel to double the resolution for more precision.

## Rower Settings

You should now adjust the rower specific parameters in `config/config.js` to suit your rowing machine. For the Concept 2 RowErg, there is a set of predefined parameters ready to use. So it suffices to add 

```js
rowerSettings: Concept2_RowErg
```
 to your `config.js` file. You can also look at `config/default.config.js` to see what other configuration parameters are available.

# Improving the performance of the Raspberry Pi

## Signs your performance is insufficient

## Things you can do at the OS

### Selecting the right kernel

Use a low latency or real time kernel. Currently, the Raspbian 64Bit kernel is a Preempt kernel, which aims at low latency.

Alternative is Ubuntu Core, which also provides a 64 bit kernel out of the box.

### CPU Scaling

Typically, Raspbian is configured to reduce energy consumption. Thus it uses the *ondemend* CPU governor. To get the most out of the CPU, we need to use the *performance* governor.

First, Raspbian will interfere with settings, so we need to kill that functionality:

> `systemctl disable raspi-config`

Install cpufrequtils:

> `sudo apt-get install cpufrequtils`

Now, you can set the default governor by editing `/etc/default/cpufrequtils` so that it reads:

> `GOVERNOR="performance"`

### Services you can disable safely

## Things you can do in OpenRowingMonitor

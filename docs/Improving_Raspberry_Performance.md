# Improving the performance of the Raspberry Pi

Out of the box, Raspbian is configured to provide a decent experience while conserving energy. However, responding instantly to incoming measurements tends to be so deviating, that we need to do some extra work to get a system working well.

## Signs your performance is insufficient

Much noise in the readings, as typiclly the signals are handled too late.

## Things you can do at the OS

### Selecting the right kernel

Normally, a Linux kernel is configured to do non-real-time work, and focusses on doing one task well for a prolonged period of time, reducing overhead. This is great for normal applications that process a lot of data. However, Open Rowing Monitor does not process much data, but does has to respond quickly to incoming signals (especially the impulses from the flywheel). The time it takes to respond to an incoming interrupt is called **latency**. For reducing noise in the readings, it is important that the latency does not vary too much.

Use a low latency or real time kernel. Currently, the Raspbian 64Bit Lite kernel is a Preempt kernel, which aims at low latency. So selectng this is a great choice.

Alternative is Ubuntu Core, which also provides a 64 bit kernel out of the box.

### Kernel settings

Add to `/boot/cmdline.txt` the following option, if you consider it responsible in your situation (this introduces a security risk):

```zsh
mitigations=off
```

still to look at this text: <https://forums.raspberrypi.com/viewtopic.php?t=228727>

### CPU Scaling

Typically, Raspbian is configured to reduce energy consumption. Thus it uses the *ondemend* CPU governor. To get the most out of the CPU, we need to use the *performance* governor.

First, Raspbian will interfere with settings, so we need to kill that functionality:

```zsh
sudo systemctl disable raspi-config
```

Install cpufrequtils:

```zsh
sudo apt-get install cpufrequtils
```

Now, you can set the default governor by editing `/etc/default/cpufrequtils` so that it reads:

```zsh
GOVERNOR="performance"
```

After a reboot, you can check the governor by executing:

```zsh
sudo cpufreq-info
```

### Services you can disable safely

triggerhappy

```zsh
sudo systemctl disable triggerhappy.service
```

Still have to look at this text: <https://wiki.linuxaudio.org/wiki/raspberrypi>

## Things you can do in OpenRowingMonitor

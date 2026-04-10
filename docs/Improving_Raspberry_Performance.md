# Improving the performance of the Raspberry Pi

Out of the box, Raspbian is configured to provide a decent experience while conserving energy. However, responding instantly to incoming measurements tends to be so deviating, that we need to do some extra work to get a system working well.

## Signs your performance is insufficient

A typical sign is that there is much noise in the data readings from the flywheel, lots of small deviations. This is typically the case when the signals are handled too late.

## Things you can do at the OS

Open Rowing Monitor does not exist in isolation, so the first step is to make sure the Operating System (OS) is cut out for the job.

### Selecting the right kernel

Normally, a Linux kernel is configured to do non-real-time work, and focusses on doing one task well for a prolonged period of time, reducing overhead. This is great for normal applications that process a lot of data. However, Open Rowing Monitor does not process much data, but does has to respond quickly to incoming signals (especially the impulses from the flywheel). The time it takes to respond to an incoming interrupt is called **latency**. For reducing noise in the readings, it is important that the latency does not vary too much.

When installing Open Rowing Monitor, please use a low latency or real time kernel. Currently, the Raspbian 64Bit Lite kernel is a Preempt kernel, which aims at low latency. So using this is a great choice for the Operating System.

### Kernel settings

Aside from selecting the right OS and kernel, there are some settings that can be set at startup that reduce the latency of the kernel.

One of these options is to turn off CPU exploit protection. This is a huge security risk as it removes security mitigations in the kernel, but it reduces latency. Given your specific network layout, this could be worth the effort. Add the following option to `/boot/cmdline.txt` (Buster or Bullseye) or `/boot/firmware/cmdline.txt` (Bookworm), if you consider it responsible in your situation (this introduces a security risk):

```zsh
mitigations=off
```

Another option is to dedicate a CPU to Open Rowing Monitor and run the CPU's in isolation. This avenue isn't explored fully, and the effects on Open Rowing Monitor are unknown, but [this text explains how it should work](https://forums.raspberrypi.com/viewtopic.php?t=228727), [this text](https://forums.raspberrypi.com/viewtopic.php?t=325091), [this text](https://superuser.com/questions/1082194/assign-an-individual-core-to-a-process), [this text](https://raspberrypi.stackexchange.com/questions/61956/can-i-have-1-processor-core-just-for-my-program) and [this text](https://www.cyberciti.biz/tips/setting-processor-affinity-certain-task-or-process.html).

### CPU Scaling

Typically, Raspbian is configured to reduce energy consumption, using the *ondemand* CPU governor. For low latency applications, this isn't sufficient. To get the most out of the CPU, we need to use the *performance* governor.

Next, we need to istall cpufrequtils to allow control over the CPU governor:

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

If all went well, your CPU is now in "Performance" mode. Please note that a Raspberry Pi will run hot and consume a lot more energy.

### Services you can disable safely

There are some services running that can be disabled safely.

#### triggerhappy

To disable triggerhappy, do the following:

```zsh
sudo systemctl disable triggerhappy.service
```

#### Avahi

To disable Avahi deamon, do the following:

```zsh
sudo systemctl disable avahi-daemon.service
```

#### nfs-client

To disable the nfs-client, do the following:

```zsh
sudo systemctl disable nfs-client.target
```

#### others

There are some other services that can be stopped, but where the effects on Open Rowing Monitor are untested, [which can be found here](https://wiki.linuxaudio.org/wiki/raspberrypi).

## Things you can do in OpenRowingMonitor

Setting AppPrio and gpioPrio.

One thing you can do to improve CPU performance is to reduce *flanklength*, which will reduce CPU-load. So running with unneccessary long *flanklength* isn't advised.

## 介绍

买了个高通处理器的4g无线网卡。学习下移植内容。这里参考的 CSDN 上的作者 HandsomeHacker 做一个反编译设备树的内容。发现作者还有小米平板4移植的内容。有机会看看。

## 导出 emmc 数据

主线内核的设备树最好的参照还是原厂的固件里的 boot.img 提供的设备树。为了方便分析整个系统的和整成砖之后救砖，需要把emmc里的各个分区的数据都备份出来，最直观的方法是使用安卓的shell，把emmc的分区一个个dd成镜像。

python3 实现的高通edl模式编程器，只要能够进到edl模式，就可以用这个工具来实现分区擦除、烧写、导出等操作。

```bash
# 这里用 ubuntu22 进行安装，借助 distrobox
sudo apt install adb fastboot python3-dev python3-pip python3-venv liblzma-dev git udev

git clone --depth=1 https://github.com/bkerler/edl.git
cd edl
git submodule update --init --recursive
pip3 install -r requirements.txt

chmod +x ./install-linux-edl-drivers.sh
bash ./install-linux-edl-drivers.sh
sudo python3 setup.py build
sudo pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
sudo python3 setup.py install
```

安装完成后，执行以命令，有提示 adb reboot edl，切换另一个终端执行。导出的文件在 dumps 目录下。

```bash
╰─❯ edl rl dumps --skip=userdata --genxml
Qualcomm Sahara / Firehose Client V3.62 (c) B.Kerler 2018-2024.
main - Trying with no loader given ...
main - Waiting for the device
......
main - Hint:   Press and hold vol up+dwn, connect usb. For some, only use vol up.
main - Xiaomi: Press and hold vol dwn + pwr, in fastboot mode connect usb.
        Run "./fastpwn oem edl".
main - Other:  Run "adb reboot edl".
```

作为能彻底实现开源的前提就是这个设备的secure boot开了没。如果没有开启，就意味着引导程序、gpu、wifi等固件只需要用高通提供的测试密匙签名一遍就可以直接在设备上跑起来。如果开启了secure boot，那必须要厂商的密匙签名cpu才能启动我们自己的引导程序、设备固件。

万能的edl为我们提供了一个功能，在edl模式下直接就能看到secure boot是否开启。

```bash
╰─❯ edl secureboot                                    ─╯
Qualcomm Sahara / Firehose Client V3.62 (c) B.Kerler 2018-2024.
main - Trying with no loader given ...
main - Waiting for the device
main - Device detected :)
main - Mode detected: firehose
Sec_Boot0 PKHash-Index:0 OEM_PKHash: False Auth_Enabled: FalseUse_Serial: False
Sec_Boot1 PKHash-Index:0 OEM_PKHash: False Auth_Enabled: FalseUse_Serial: False
Sec_Boot2 PKHash-Index:0 OEM_PKHash: False Auth_Enabled: FalseUse_Serial: False
Sec_Boot3 PKHash-Index:0 OEM_PKHash: False Auth_Enabled: FalseUse_Serial: False
Secure boot disabled.
```

直接显示**Secure boot disabled.** ，secure boot没有开启，可以把原厂除了wifi和modem校准数据之外所有分区的内容都换掉。

## 反编译设备树

安卓的boot.img 包含了内核、设备树、ramdisk、内核参数等linux内核起来必须要的**组件**。要重头实现一个主线内核的设备树，最好的参照还是安卓提供的设备树。

解包boot.img，使用 unpackbootimg

### 编译映像工具

```bash
git clone https://github.com/anestisb/android-unpackbootimg.git
make
sudo cp ./mkbootimg /usr/bin/mkbootimg
sudo cp ./unpackbootimg /usr/bin/unpackbootimg
```

```bash
cd dumps
unpackbootimg -i boot.bin -o ./
```

```bash
╰─❯ unpackbootimg -i boot.bin -o ./                                                                                 ─╯
BOARD_KERNEL_CMDLINE console=ttyHSL0,115200,n8 androidboot.console=ttyHSL0 androidboot.hardware=qcom user_debug=31 msm_rtb.filter=0x237 ehci-hcd.park=3 androidboot.bootdevice=7824900.sdhci earlyprintk
BOARD_KERNEL_BASE 80000000
BOARD_NAME 
BOARD_PAGE_SIZE 2048
BOARD_HASH_TYPE sha1
BOARD_KERNEL_OFFSET 00008000
BOARD_RAMDISK_OFFSET 01000000
BOARD_SECOND_OFFSET 00f00000
BOARD_TAGS_OFFSET 00000100
BOARD_DT_SIZE 5240832
```

接着使用dtc反编译设备树，但是报了个文件头的错误。

```bash
sudo apt install device-tree-compiler

# boot.bin-dtb 表示输入的设备树，boot.bin-dts 表示输出的 dts 文件
╰─❯ dtc -I dtb -O dts boot.bin-dtb -o boot.bin-dts                                                                  ─╯
FATAL ERROR: Blob has incorrect magic number

# 这里报错，通过 hexdump 查看文件头
╰─❯ hexdump -C boot.bin-dtb | head -n 3                                                                             ─╯
00000000  51 43 44 54 03 00 00 00  cc 00 00 00 ce 00 00 00  |QCDT............|
00000010  01 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000020  00 00 00 00 00 00 00 00  00 00 00 00 00 20 00 00  |............. ..|

如果开头包含 QCDT（高通设备树）或 DTBO（Android 动态分区设备树覆盖表），则确认是 dt.img。这意味着里面有多个设备树。
```

**拆分 `dt.img` 中的多个 `.dtb`**

```bash
pip3 install extract-dtb

extract-dtb boot.bin-dtb -o output_dtb

```

写个脚本一个个反编译后自己找了。批量反编译设备树的脚本如下。反编译的产物会放在output下。

```bash
#!/bin/bash

mkdir -p output
for i in $(ls *.dtb); do
    echo decompile $i
    dtc -I dtb -O dts $i -o output/$i.dts
done
```

光靠一个个看是看不出什么的，这些设备树都挺相似的，而且名字也不能提供什么有用的信息。所以得去安卓的shell里得到关于当前设备树里更有用的信息

高通的设备树里比较特别的属性是qcom,board-id和qcom,msm-id，这两个属性是bootloader用来决定使用什么设备树的关键条件，应该每一个设备树之间的id都是不一样的。通过adb pull下来，用16进制查看器分析一波。

```bash
╰─❯ adb pull /proc/device-tree/qcom,board-id
/proc/device-tree/qcom,board-id: 1 file pulled. 0.0 MB/s (8 bytes in 0.042s)

╭─ ~/build/dumps                                            
╰─❯ adb pull /proc/device-tree/qcom,msm-id
/proc/device-tree/qcom,msm-id: 1 file pulled. 0.0 MB/s (32 bytes in 0.041s)

```

使用 hexdump 命令查看

```bash
╰─❯ hexdump -C qcom,board-id                                                                                        ─╯
00000000  00 00 00 08 00 00 01 00                           |........|
00000008

╰─❯ hexdump -C qcom,msm-id                                                                                          ─╯
00000000  00 00 00 ce 00 00 00 00  00 00 00 f8 00 00 00 00  |................|
00000010  00 00 00 f9 00 00 00 00  00 00 00 fa 00 00 00 00  |................|
00000020
```

model属性也是不同设备树之间相互区别的属性之一，这个属性是字符串直接能cat出来。

```bash
shell@msm8916_32_512:/ $ cat /proc/device-tree/model   
Qualcomm Technologies, Inc. MSM 8916 512MB MTP
```

在设备树文件中找到

我这里从vscode打开反编译后的dts，搜索上面的 `Qualcomm Technologies, Inc. MSM 8916 512MB MTP 直接定位到`

**`05_dtbdump_Qualcomm_Technologies,_Inc._MSM_8916_512MB_MTP.dtb.dts`**

对比 board-id，msm-id 也是匹配的。

```bashj
/dts-v1/;

/ {
	#address-cells = <0x02>;
	#size-cells = <0x02>;
	model = "Qualcomm Technologies, Inc. MSM 8916 512MB MTP";
	compatible = "qcom,msm8916-mtp\0qcom,msm8916\0qcom,mtp";
	qcom,msm-id = <0xce 0x00 0xf8 0x00 0xf9 0x00 0xfa 0x00>;
	interrupt-parent = <0x01>;
	qcom,board-id = <0x08 0x100>;
........
```

看到led的定义，更加确定bootloader载入的就是这个设备树。led的命名大概也能猜出来功能。10进制的数据编译后都变成了16进制的，转换一下就能得到正确的gpio号了。

```bash
		gpio-leds {
			compatible = "gpio-leds";
			pinctrl-names = "default";
			pinctrl-0 = <0xec>;

			WIFI_S {
				gpios = <0x4f 0x14 0x00>;
				label = "WIFI_S";
				linux,default-trigger = "none";
				default-state = "off";
				retain-state-suspended;
			};

			4G_L2 {
				gpios = <0x4f 0x15 0x00>;
				label = "4G_L2";
				linux,default-trigger = "none";
				default-state = "off";
				retain-state-suspended;
			};

			4G_L3 {
				gpios = <0x4f 0x44 0x00>;
				label = "4G_L3";
				linux,default-trigger = "none";
				default-state = "off";
				retain-state-suspended;
			};

			4G_S {
				gpios = <0x4f 0x16 0x00>;
				label = "4G_S";
				linux,default-trigger = "none";
				default-state = "off";
				retain-state-suspended;
			};

			SIM_SEL {
				gpios = <0x4f 0x02 0x00>;
				label = "SIM_SEL";
				linux,default-trigger = "none";
				default-state = "on";
				retain-state-suspended;
			};

			sim_en {
				gpios = <0x4f 0x01 0x00>;
				label = "SIM_EN";
				linux,default-trigger = "none";
				default-state = "off";
				retain-state-suspended;
			};

			FTM_ST {
				gpios = <0x4f 0x24 0x00>;
				label = "FTM_ST";
				linux,default-trigger = "none";
				default-state = "keep";
				retain-state-suspended;
			};
		};
	};

```

原作者查看红米2的维修电路图，发现gpio37是进edl模式的引脚，一旦接地就会进入edl模式。与这个网卡上的唯一的按钮行为是一致的，通过按钮的定义基本上能够确定就是它了。

```bash
		gpio_keys {
			compatible = "gpio-keys";
			input-name = "gpio-keys";
			pinctrl-names = "tlmm_gpio_key_active\0tlmm_gpio_key_suspend";
			pinctrl-0 = <0xe9>;
			pinctrl-1 = <0xea>;
			vio-supply = <0x4a>;

			key_freset {
				label = "key_freset";
				gpios = <0x4f 0x25 0x00>;
				linux,input-type = <0x01>;
				linux,code = <0xd8>;
				debounce-interval = <0x3c>;
			};
		};

```

0x25 的十进制正是37
得到了设备树，基本上就是稳了，还需要一个好用的bootloader，可玩性就可以再上一个台阶。

## 移植lk2nd

为了能够启动主线内核，首先需要lk2nd能够跑起来，lk2nd是msm8916-mainline项目对于littlekernel的一个fork，将lk作为以boot.img的形式作为原来的bootloader的第二层引导。

一套代码上的两个不同target，先把lk2nd跑起来好了，毕竟是2nd，原厂的bootloader把很多初始化的工作都做好了，移植其实简单的很，只需要一个假的设备树，让第一层bootloader认为这个boot.img是兼容这个设备的就行，根据前面逆向出的qcom,board-id和qcom,msm-id，lk2nd设备树如下所示，放在dts/msm8916目录下，修改下rules.mk就基本上能编译出镜像了。

https://github.com/OpenStick/lk2nd/blob/master/dts/msm8916/msm8916-4g-wifi.dts，这里项目已经添加上了设备树。

```bash
// SPDX-License-Identifier: GPL-2.0-only
// Copy

/dts-v1/;

#include <skeleton.dtsi>
#include <lk2nd.h>

/ {
	model = "Handsome Stick";
	compatible = "handsome,stick", "qcom,msm8916", "lk2nd,device";
	qcom,msm-id = <0xce 0x00 0xf8 0x00 0xf9 0x00 0xfa 0x00>;
	qcom,board-id = <0x08 0x100>;
	lk2nd,keys = <KEY_HOME 37 (GPIO_PULL_DOWN | GPIO_ACTIVE_HIGH)>;
};
```

```bash
git clone https://github.com/OpenStick/lk2nd.git

# 这里的arm的交叉编译器用ubuntu22里的版本，使用 distrobox 创建容器
sudo apt install distrobox
distrobox create -i ubuntu:22.04 -n ubuntu22
distrobox enter ubuntu22

sudo apt update && sudo apt install make git cpp device-tree-compiler libfdt-dev gcc-arm-none-eabi

cd lk2nd
make TOOLCHAIN_PREFIX=arm-none-eabi- lk2nd-msm8916 -j8
```

编译工程后产物 **`build-lk2nd-msm8916/lk2nd.img`**

进到 fastboot 模式将img文件直接fastboot boot。

```bash
adb reboot bootloader

# 先通过 boot 进入 bootloader
cd build-lk2nd-msm8916
fastboot boot ./lk2nd.img
```

```bash
╰─❯ fastboot oem lk_log  
OKAY [  0.002s]
Finished. Total time: 0.002s
╰─❯ fastboot get_staged /dev/stdout
Uploading '/dev/stdout'                            [0] smem ram ptable found: ver: 1 len: 4
[0] Minor socinfo format detected: 0.8
[0] smem ram ptable found: ver: 1 len: 4
[0] SCM call: 0x2000601 failed with :fffffffc
[0] Failed to initialize SCM
[0] welcome to lk

[0] calling constructors
[0] initializing heap
.....

```

这里启动成功刷入

```bash
fastboot flash boot ./lk2nd.img
```

## 修改lk2nd

观察lk2nd现有的设备树，和一部分实现，发现lk2nd的设备树其实也并不是只用于原装bootloader识别，大佬们也实现了设备树中的按键定义在系统中的注册。
查看littlekernel中进入fastboot的逻辑，不难发现除了音量下键可以作为进入fastboot的事件，home和返回键也可以作为进入fastboot的条件之一。

在app/aboot/aboot.c中

```bash
	if (!boot_into_fastboot)
 {
 	if (keys_get_state(KEY_VOLUMEUP))
 		boot_into_recovery = 1;
 	if (!boot_into_recovery &&
 		(keys_get_state(KEY_HOME) || keys_get_state(KEY_BACK) || keys_get_state(KEY_VOLUMEDOWN)))
 		boot_into_fastboot = true;
 }

```

整个按键的初始化在lk2nd中加入了通过设备树初始化的部分，通过读取lk2nd,keys属性来完成。
 在lk2nd/lk2nd-device.c中

```bash
static struct lk2nd_keymap* lk2nd_parse_keys(const void *fdt, int offset)
{
	int len;
	const uint32_t *val;
	struct lk2nd_keymap *map = NULL;

#define KEY_SIZE (3 * sizeof(uint32_t))
	int i = 0;
	val = fdt_getprop(fdt, offset, "lk2nd,keys", &len);
	if (len > 0 && len % KEY_SIZE == 0) {
		len /= KEY_SIZE;
		/* last element indicates end of the array with key=0 */
		map = calloc(len + 1, sizeof(struct lk2nd_keymap));
		for (int i = 0; i < len; i++) {
			map[i].key    = fdt32_to_cpu(val[i*3]);
			map[i].gpio   = fdt32_to_cpu(val[i*3 + 1]) & 0xFFFF;
			map[i].type   = fdt32_to_cpu(val[i*3 + 1]) >> 16;
			map[i].pull   = fdt32_to_cpu(val[i*3 + 2]) & 0xFF;
			map[i].active = fdt32_to_cpu(val[i*3 + 2]) >> 8;
		}
	}

	dprintf(INFO, "Device keymap:\n");
	while (map && map[i].key) {
		dprintf(INFO, "key=0x%X, gpio=%x, type=%d, pull=%d, active=%d\n",
			map[i].key, map[i].gpio, map[i].type, map[i].pull, map[i].active);
		i++;
	}

	return map;
}

```

其实实现edl按键进入fastboot的思路就已经很清晰了，就是在设备树中加一条定义就行,把gpio37注册成为home按键。
最终的设备树代码如下所示

```
// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2021 HandsomeYingyan <handsomeyingyan@gmail.com>

/dts-v1/;

#include <skeleton.dtsi>
#include <lk2nd.h>

/ {
	model = "Handsome Stick";
	compatible = "handsome,stick", "qcom,msm8916", "lk2nd,device";
	qcom,msm-id = <0xce 0x00 0xf8 0x00 0xf9 0x00 0xfa 0x00>;
	qcom,board-id = <0x08 0x100>;
	lk2nd,keys = <KEY_HOME 37 (GPIO_PULL_DOWN | GPIO_ACTIVE_HIGH)>;
};

```

刷入boot分区测试，完美触发！在测试的时候发现fastboot烧写boot.img采用的不是先擦除再烧写，而是覆盖的方式。如果lk2nd有问题，安卓内核就会一直重启，进不到原来的bootloader的fastboot模式。
解决的方法也很简单，使用edl工具在edl模式下擦除boot分区就行。

```bash
adb reboot edl
edl e boot
```

第一次执行可能会卡住，直接中断马上再执行相同指令，就完成了boot分区的擦除。
但是，一个好用的bootloader还需要能够知道设备的启动状态，由于安卓的默认灯也是红色。定义bootloader一开始亮起的灯为蓝灯，最终对代码的修改如下。
加入对wifi三个led灯和edl按键 gpio号的宏定义
target/msm8916/init.c

```
#define TLMM_EDL_BTN_GPIO    37
#define TLMM_USR_BLUE_LED_GPIO  20
#define TLMM_USR_GREEN_LED_GPIO  21
#define TLMM_USR_RED_LED_GPIO  22 /* UNUSED */
```

在target_init()中加入gpio初始化语句

```bash
gpio_tlmm_config(TLMM_USR_BLUE_LED_GPIO, 0, 
GPIO_OUTPUT,GPIO_PULL_UP, GPIO_2MA, GPIO_ENABLE);
```

这样lk2nd基本上就起来了，能够启动原来的安卓内核和按edl按键进入fastboot模式，让免拆刷机成为可能，唯一不好的地方就是按edl键的时间必须要准，太早就直接进edl模式了，太慢就直接进内核了。

## lk1st yes!

lk2nd 的存在使得在整个引导过程中多了一层来传递主线内核需要的参数，拖慢了启动的速度。所以在最终的版本中lk2nd只用于提取原来的modem和wifi的校准数据，而设备引导由这套代码生成的lk1st完成。
lk作为aboot，许多设备树相关的东西就用不了了。也就是说前面那个设备树定义的按键在lk1st下是没有用的，必须通过自己注册按键的方式来实现。
由于这个板子上是有fb（fastboot）触点的，不想破坏原来的fastboot键功能，这里仍然将按键注册为home键。添加了一个行为，进入fastboot后绿灯亮起。

target/msm8916/init.c

```
/* HACK : treat edl btn as home btn */
int target_home()
{
        static uint8_t first_time = 0;
	    uint8_t status = 0;
        if (!first_time) {
            	    gpio_tlmm_config(TLMM_EDL_BTN_GPIO, 0, GPIO_INPUT, GPIO_PULL_DOWN, GPIO_2MA, GPIO_ENABLE);
	    /* Wait for the gpio config to take effect - debounce time */
	    udelay(10000);
            first_time = 1;
        }
	/* Get status of GPIO */
	status = gpio_status(TLMM_VOL_UP_BTN_GPIO);
	/* light up green led when edl btn is pressed*/
	if(status == 1) {
	   gpio_tlmm_config(TLMM_USR_GREEN_LED_GPIO, 0, GPIO_OUTPUT,GPIO_PULL_UP, GPIO_2MA, GPIO_ENABLE);
	}
	/* Active high signal. */
	return status;
}

```

向系统注册按键

```
 #if WITH_LK2ND
 uint32_t target_volume_down_old()
 #else
@@ -217,6 +255,10 @@ static void target_keystatus()
 
 	if(target_volume_up())
 		keys_post_event(KEY_VOLUMEUP, 1);
+
+	if(target_home())
+		keys_post_event(KEY_HOME, 1);
+
 }
 #endif

```

代码就修改完成了，接下来就是编译之后烧写到设备里，但是不能直接将产物进行烧写，[qtestsign](https://github.com/msm8916-mainline/qtestsign)工具对其进行签名。

前面编译的lk2nd已经是修改后的代码了，这里不需要修改。

最后刷入 https://www.123pan.com/s/XwVDVv-WICn3 提供了 debian 包，另外的在win下移除原本识别的安卓驱动，重新安装usb的驱动

参考 https://blog.csdn.net/hmc_123/article/details/126752673?spm=1001.2014.3001.5506 这部分内容进行操作。

## 镜像制作

### 根文件系统制作

```bash
mkdir -p rootfs
sudo mmdebstrap \
    --hook-dir=/usr/share/mmdebstrap/hooks/merged-usr \
    --include="ca-certificates,locales,sudo,apt,adduser,polkitd,systemd,network-manager,dbus-daemon,apt-utils,bash-completion,curl,vim,bash,deepin-keyring,init,ssh,net-tools,iputils-ping,lshw,iproute2,iptables,procps,wpasupplicant,dmidecode,ntpsec-ntpdate,linux-firmware" \
    --architectures=arm64 \
    beige \
    rootfs \
    "deb https://community-packages.deepin.com/beige/ beige main commercial community" \
    "deb https://proposed-packages.deepin.com/beige-testing/ unstable/25 main commercial community"
```

### 镜像制作

这里不重新构建内核，先用 openstick 提供的内核和boot.img，启动的磁盘已经写死到 boot.img 这里创建一个磁盘并设置原本的 UUID，

```bash
# 这里把 openstick 提供的 rootfs.img 转化为 root.img
sudo apt install android-sdk-libsparse-utils
simg2img rootfs.img root.img

LOOP=$(sudo loestup -Pf --show root.img)
mkdir tmp
sudo mount $LOOP tmp

# 拷贝内核和内核模块
sudo cp -a tmp/boot/* rootfs/boot
sudo mkdir rootfs/modules
sudo cp -a tmp/modules/5.15.0-handsomekernel+ rootfs/modules
```

创建一个新磁盘

```bash
dd if=/dev/zero of=root.img bs=1M count=1200
mkfs.ext4 -L rootfs -b 4096 root.img

# 这里不替换原本的boot.img 这里把新的磁盘镜像设置与原本的rootfs.img一样的UUID
tune2fs -U e92c62a7-390f-4edc-b36f-b71f931c5a21 root.img

LOOP=$(sudo losetup -Pf --show root.img)
mkdir root
sudo mount $LOOP root

# 拷贝前面创建的根文件系统
sudo cp -a rootfs/* root
sudo umount root
sudo losetup -d $LOOP

# 将 root.img 转换 rootfs.img
img2simg root.img rootfs.img
```

这里WIFI网卡进入 fastboot 模式，把 rootfs 重新刷入。

```bash
fastboot -S 200m flash rootfs rootfs.img
```

如果刷写错误可以按住 WIFI 网卡上的按键进入 edl 模式。使用前面的 edl 工具。刷 rootfs 分区。

```bash
edl w rootfs rootfs.img
```

## 参考

[高通410 随身WIFI刷入Debian系统(玩法合集)](https://sswifi.net/tutorial/2-410-wifidebian.html)

[我的4g网卡运行着GNU/Linux -- 某4g无线网卡的逆向工程与主线Linux移植 (一)](https://blog.csdn.net/github_38345754/article/details/121462292)

[我的4g网卡运行着GNU/Linux -- 某4g无线网卡的逆向工程与主线Linux移植 (二)](https://blog.csdn.net/github_38345754/article/details/121481021)

[lk2nd](https://github.com/OpenStick/lk2nd)

[OpenStick-WIKI](https://www.kancloud.cn/handsomehacker/openstick/2636505)

[Project-DragonPi](https://github.com/Project-DragonPi)

[折腾随身WiFi过程中的亿点点小记（上）：备份刷机](https://www.wlplove.com/archives/92/#menu_index_13)

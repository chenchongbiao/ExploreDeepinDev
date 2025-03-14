## 介绍

树莓派官网 https://www.raspberrypi.com/

*树莓派*是为学习计算机编程教育而设计，只有信用卡大小的微型电脑。

这里以 deepin 作为例子，讲解树莓派镜像的制作，到烧录镜像，运行系统。

---

## **技术扫盲**

### **Linux系统是什么？**

[深入理解 Linux 系统的核心](../linux)

[Linux 系统与发行版的关系——从安卓到 deepin 的多样性](../linux-distro)

### **引导流程**

[U-Boot与GRUB引导机制对比](../uboot-grub.md)

### **树莓派与Linux的关系**

- **硬件适配**：树莓派是基于ARM架构的单板计算机，其专属Linux发行版（如Raspberry Pi OS）针对低功耗和微型设备优化，默认集成GPIO控制工具。
- **引导流程差异**：

  | **设备类型** | **引导程序** | **核心特点**                     |
  | ------------------ | ------------------ | -------------------------------------- |
  | 普通电脑           | GRUB               | 支持多系统引导、图形化配置界面         |
  | 树莓派             | U-Boot             | 轻量化、可定制启动脚本、适配嵌入式设备 |


  > *注：树莓派默认使用**GPU固件+配置文件**（如 `config.txt`）引导，U-Boot常用于深度定制场景。
  >

### **系统镜像类型：ISO vs IMG**

[ISO与IMG镜像的全面对比](../iso-img.md)

## **安装基础工具链**

```bash
sudo apt update -y
sudo apt-get install -y qemu-user-static binfmt-support mmdebstrap arch-test usrmerge usr-is-merged fdisk dosfstools
sudo systemctl restart systemd-binfmt  # 重启 binfmt 服务加载ARM支持
```

::: details 点击查看解析
**异架构模拟 (`qemu-user-static` + `binfmt-support`)**

- **核心原理**：
  - `qemu-user-static` 提供静态编译的跨架构模拟器（如 `qemu-aarch64-static`），允许在x86主机直接执行ARM程序。
  - `binfmt-support` 向内核注册二进制格式解释器，自动触发QEMU对ARM程序转译（无需手动指定）。
- **验证方法**：
  ```bash
  # 查看已注册的架构支持
  ls /proc/sys/fs/binfmt_misc/

  # 测试ARM程序执行
  qemu-aarch64-static /path/to/arm64-binary
  ```

:::

## **根文件系统构建**

### **使用 mmdebstrap 创建基础系统**

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

::: details 点击查看解析

[深入理解 Linux 系统的核心](../linux)

### **基本命令与权限**

```bash
sudo mmdebstrap
```

- **`sudo`**: 以管理员权限运行，因为创建根文件系统需要操作底层文件。
- **`mmdebstrap`**: 一个高效的 Debian/Ubuntu 根文件系统构建工具，支持多架构和自定义配置。

---

### **钩子目录（合并 `/usr` 结构）**

```bash
--hook-dir=/usr/share/mmdebstrap/hooks/merged-usr
```

- **`--hook-dir`**: 指定一个钩子脚本目录，用于在构建过程中执行自定义操作。
- **`merged-usr`**: 钩子脚本确保文件系统采用 `/usr` 合并结构（即 `/bin`、`/sbin`、`/lib` 等目录符号链接到 `/usr` 下的对应目录），这是现代 Linux 系统的常见实践。

---

### 3. **包含的软件包**

```bash
--include="ca-certificates,locales,sudo,apt,...,dmidecode,ntpsec-ntpdate,linux-firmware"
```

- **`--include`**: 指定要安装的基础软件包列表，例如：
  - **系统工具**: `systemd`（初始化系统）、`polkitd`（权限管理）、`apt`（包管理工具）。
  - **网络工具**: `network-manager`（网络管理）、`ssh`（远程登录）、`net-tools`、`iproute2`、`wpasupplicant`（无线网络）。
  - **调试工具**: `vim`（文本编辑）、`curl`（网络请求）、`iputils-ping`（网络测试）、`dmidecode`（硬件信息）。
  - **驱动与固件**: `linux-firmware`（硬件驱动固件）。
  - **本地化与安全**: `locales`（语言支持）、`ca-certificates`（HTTPS 证书）。

---

### **目标架构**

```bash
--architectures=arm64
```

- **`--architectures=arm64`**: 指定生成的根文件系统为 ARM64 架构（适用于树莓派、嵌入式设备等）。

---

### **发行版与输出目录**

```bash
beige
rootfs
```

- **`beige`**: deepin 的版本代号。
- **`rootfs`**: 生成的根文件系统将保存在当前目录的 `rootfs` 文件夹中。

---

### **软件源配置**

```bash
"deb https://community-packages.deepin.com/beige/ beige main commercial community"
"deb https://proposed-packages.deepin.com/beige-testing/ unstable/25 main commercial community"
```

:::

## **磁盘镜像制作**

### **创建空白镜像并分区**

```bash
dd if=/dev/zero of=deepin-raspberrypi.img bs=1M count=4096
sudo fdisk deepin-raspberrypi.img << EOF
n
p
1

+300M
t
c
n
p
2


w
EOF
```

::: details 点击查看解析

#### **创建空白镜像文件**

```bash
dd if=/dev/zero of=deepin-raspberrypi.img bs=1M count=4096
```

- **`dd`**：底层数据复制工具
- **`if=/dev/zero`**：输入源为虚拟设备zero（提供无限空字符）
- **`of=deepin-raspberrypi.img`**：输出目标为指定镜像文件
- **`bs=1M`**：定义每个数据块大小为1MiB（二进制单位，1MiB=1048576字节）
- **`count=4096`**：复制4096个数据块 → 总大小 1M×4096=4GiB

> 💡 为何用4096而不是4000？
> 因存储设备使用二进制单位：1GiB=1024MiB。若用 `count=4000`只能得到约3.9GiB，而4096可精确获得4GiB空间。

---

#### **磁盘分区操作**

```bash
sudo fdisk deepin-raspberrypi.img << EOF
...
EOF
```

- **`fdisk`**：经典磁盘分区工具，支持MBR分区表
- **`<< EOF`**：Here Document语法，将后续内容作为标准输入传递给命令

---

#### **自动化分区流程**

```text
n       # 新建分区
p       # 创建主分区
1       # 分区编号1
        # 起始扇区默认（直接回车）
+300M   # 分配300MiB空间
t       # 更改分区类型
c       # 设置为W95 FAT32 (LBA) 类型（适合启动分区）
n       # 新建第二个分区
p       # 主分区
2       # 分区编号2
        # 起始扇区默认
        # 结束扇区默认（使用全部剩余空间）
w       # 写入分区表并退出
```

- **分区1**：300MiB FAT32格式（通常用于/boot启动分区）
- **分区2**：剩余空间（约1.7GiB）用于根文件系统

---

#### **关键概念说明**

**🔹 fdisk的作用**
磁盘分区编辑器，可创建/删除分区、修改分区类型。此处操作对象是镜像文件而非物理磁盘。

**🔹 Here Document技巧**
`<< EOF`到 `EOF`之间的内容会作为标准输入传递给前序命令，实现自动化交互操作，避免手动输入。

**🔹 分区类型选择**
`c`类型对应FAT32，这是树莓派启动分区的标准要求。第二个分区通常使用Linux原生类型（默认83），但此处未显式设置。

---

#### **最终成果**

生成包含两个分区的镜像文件：

```
deepin-raspberrypi.img
├─p1 : 300MiB FAT32 (启动分区)
└─p2 : 1.7GiB Linux分区
```

后续可通过 `losetup` 挂载镜像，进行文件系统格式化和系统文件写入。

:::

#### **格式化与挂载分区**

```bash
# 绑定到回环设备
LOOP=$(sudo losetup -Pf --show deepin-raspberrypi.img)
# 格式化引导分区
sudo mkfs.fat -F32 "${LOOP}p1"
# 修改 FAT 文件系统卷标为 bootfs
sudo dosfslabel "${LOOP}p1" bootfs
# 格式化根分区
sudo mkfs.ext4 "${LOOP}p2"
# 将 ext4 分区的卷标（Label）设置为 rootfs
sudo e2label "${LOOP}p2" rootfs

mkdir tmp
# 挂载根分区
sudo mount "${LOOP}p2" tmp
# 复制根文件系统
sudo cp -a rootfs/* tmp
# 创建固件目录
sudo mkdir tmp/boot/firmware
# 挂载引导分区
sudo mount "${LOOP}p1" tmp/boot/firmware

# 挂载 /dev 目录，允许在 chroot 环境中访问设备文件
sudo mount --bind /dev tmp/dev

# 挂载 proc 文件系统提供了一个接口来访问内核状态信息，如进程列表等
sudo mount -t proc chproc tmp/proc

# 挂载 sysfs 提供了访问内核模块、硬件设备和其他系统级别的信息
sudo mount -t sysfs chsys tmp/sys

# 挂载临时文件系统
sudo mount -t tmpfs -o "size=99%" tmpfs tmp/tmp
sudo mount -t tmpfs -o "size=99%" tmpfs tmp/var/tmp

# 挂载宿主机的 DNS 配置
sudo mount --bind /etc/resolv.conf tmp/etc/resolv.conf

# 挂载 devpts 文件系统负责为伪终端提供设备节点，支持文本用户界面和shell会话
sudo mount -t devpts devpts tmp/dev/pts
```

::: tip
[深入解析 chroot：从原理到实践](../../code-spectrum/chroot)
:::

---

## **树莓派硬件适配**

### **安装固件与内核**

1. **下载树莓派预编译好的固件**
   拷贝引导加载程序GPU 固件等, 从 https://github.com/raspberrypi/firmware/tree/master/boot 官方仓库中拷贝，另外放入了 cmdline.txt 和 config.txt 配置

```bash
git clone --depth=1 https://github.com/raspberrypi/firmware.git
sudo cp -r firmware/boot/* tmp/boot/firmware
```

2. **配置 config.txt**

  配置信息可以查看 https://www.raspberrypi.com/documentation/computers/config_txt.html

```bash
  sudo tee tmp/boot/firmware/config.txt <<EOF
  # For more options and information see
  # http://rptl.io/configtxt
  # Some settings may impact device functionality. See link above for details

  # Uncomment some or all of these to enable the optional hardware interfaces
  #dtparam=i2c_arm=on
  #dtparam=i2s=on
  #dtparam=spi=on

  # Enable audio (loads snd_bcm2835)
  dtparam=audio=on

  # Additional overlays and parameters are documented
  # /boot/firmware/overlays/README

  # Automatically load overlays for detected cameras
  camera_auto_detect=1

  # Automatically load overlays for detected DSI displays
  display_auto_detect=1

  # Automatically load initramfs files, if found
  auto_initramfs=1

  # Enable DRM VC4 V3D driver
  dtoverlay=vc4-kms-v3d
  max_framebuffers=2

  # Don't have the firmware create an initial video= setting in cmdline.txt.
  # Use the kernel's default instead.
  disable_fw_kms_setup=1

  # Run in 64-bit mode
  arm_64bit=1

  # Disable compensation for displays with overscan
  disable_overscan=1

  # Run as fast as firmware / board allows
  arm_boost=1

  [cm4]
  # Enable host mode on the 2711 built-in XHCI USB controller.
  # This line should be removed if the legacy DWC2 controller is required
  # (e.g. for USB device mode) or if USB support is not required.
  otg_mode=1

  [cm5]
  dtoverlay=dwc2,dr_mode=host

  [all]
  EOF
```

3. **添加树莓派的官方源**

```bash
mkdir -p tmp/etc/apt/sources.list.d
# 添加树莓派的源，一些树莓派提供的工具，需要从这个软件源下载
echo "deb [trusted=yes] http://archive.raspberrypi.org/debian/ bookworm main" | sudo tee tmp/etc/apt/sources.list.d/raspberrypi.list
```

4. **安装额外的软件包、内核**

```bash
# raspi-config 会依赖到 libfmt9，deepin 源里没 已经升级到 libfmt10，从 Debian 下载 deb 包
curl -L http://ftp.cn.debian.org/debian/pool/main/f/fmtlib/libfmt9_9.1.0+ds1-2_arm64.deb -o tmp/tmp/libfmt9.deb
curl -L http://ftp.cn.debian.org/debian/pool/main/d/device-tree-compiler/libfdt1_1.6.1-4+b1_arm64.deb -o tmp/tmp/libfdt1.deb
```

5. **进入 `chroot`**

```bash
sudo chroot tmp bash
```

6. **安装配置工具及内核**

```bash
(chroot) apt update -y && apt install -y /tmp/libfmt9.deb /tmp/libfdt1.deb
```

```bash
(chroot) apt install -y raspi-config raspberrypi-sys-mods firmware-brcm80211 raspi-firmware bluez-firmware
```

::: details 点击查看解析

- **`raspi-config`**

  - **作用**：树莓派官方的命令行配置工具。
  - **功能**：扩展文件系统、设置时区、启用摄像头/SSH/VNC、超频等。
  - **必要性**：在树莓派系统中，用于快速配置硬件和系统参数。
- **`raspberrypi-sys-mods`**

  - **作用**：树莓派系统级配置的补充工具。
  - **功能**：包含自动挂载 `/boot`、配置用户权限、更新 `cmdline.txt`（内核启动参数）等脚本。
  - **必要性**：确保系统启动时自动加载树莓派专用配置。
- **`firmware-brcm80211`**

  - **作用**：博通（Broadcom）无线网卡驱动固件。
  - **功能**：支持树莓派内置的 Wi-Fi 模块（如树莓派 3B+/4B/5 的无线网络）。
  - **必要性**：无此固件，Wi-Fi 将无法正常工作。
- **`raspi-firmware`**

  - **作用**：树莓派启动固件（Bootloader 和 GPU 固件）。
  - **功能**：包含 `start.elf`（GPU 固件）、`fixup.dat`（内存分配文件）等，用于初始化硬件。
  - **必要性**：无此包，树莓派无法正常启动。
- **`bluez-firmware`**

  - **作用**：蓝牙协议栈的固件支持。
  - **功能**：启用树莓派内置蓝牙功能（如连接蓝牙耳机、键盘）。
  - **必要性**：无此固件，蓝牙设备无法被识别。

:::

```bash
(chroot) apt install -y \
    linux-image-rpi-v8 \
    linux-image-rpi-2712 \
    linux-headers-rpi-v8 \
    linux-headers-rpi-2712
```

::: details 点击查看解析

- **内核包说明**：
  - **`linux-image-rpi-v8`**

    - **适用设备**：ARMv8 架构的树莓派（如树莓派 3B+、4B）。
    - **内核特性**：64 位支持，针对 Cortex-A72（树莓派 4B）优化。
  - **`linux-image-rpi-2712`**

    - **适用设备**：树莓派 5（搭载 BCM2712 芯片）。
    - **内核特性**：支持 PCIe 总线、新型 GPIO 控制器等树莓派 5 专属硬件。
  - **`linux-headers-*`**

    - **作用**：内核头文件，用于编译外部内核模块（如某些第三方驱动程序）。
    - **必要性**：如果需要在树莓派上编译内核模块（如某些 USB 设备驱动），必须安装。
  - **为什么需要安装多个内核？**

    - **兼容性**：如果目标系统需支持多种树莓派型号（如同时支持树莓派 4B 和 5），需安装对应的内核。
    - **启动选择**：树莓派会根据设备型号自动加载匹配的内核，不会冲突。

:::

## **配置启动参数**

```bash
# 配置 cmdline.txt 内核参数
(chroot) echo "console=serial0,115200 console=tty1 root=LABEL=rootfs rootfstype=ext4 fsck.repair=yes rootwait quiet init=/usr/lib/raspberrypi-sys-mods/firstboot splash plymouth.ignore-serial-consoles" | tee /boot/firmware/cmdline.txt
```

## **编辑分区表**

```bash
(chroot) tee /etc/fstab << EOF
proc          /proc           proc    defaults          0       0
LABEL=bootfs  /boot/firmware  vfat    defaults          0       2
LABEL=rootfs  /               ext4    defaults,rw,errors=remount-ro,x-systemd.growfs  0       1
EOF
```

## **系统个性化配置**

### **用户与本地化**

```bash
# 创建用户并设置密码
(chroot) useradd -m deepin && usermod -aG sudo deepin
(chroot) echo 'deepin:deepin' | chpasswd
(chroot) chsh -s /bin/bash deepin
```

```bash
# 取消注释
(chroot) sed -i -E 's/#[[:space:]]*(en_US.UTF-8[[:space:]]+UTF-8)/\1/g' /etc/locale.gen
(chroot) sed -i -E 's/#[[:space:]]*(zh_CN.UTF-8[[:space:]]+UTF-8)/\1/g' /etc/locale.gen
# 生成语言设置
(chroot) locale-gen
```

```bash
# 设置中文
(chroot) tee /etc/locale.conf << EOF
LANG=zh_CN.UTF-8
LANGUAGE=zh_CN
EOF
```

```bash
# 设置本地上海时区
(chroot) ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

## **清理与压缩**

**清理软件包缓存**

```bash
(chroot) apt clean && rm -rf /var/cache/apt/archives/*
(chroot) exit
```

**卸载挂载点**

```bash
sudo umount -l tmp
```

**强制文件系统检查**

```bash
sudo e2fsck -f "${LOOP}p2"
```

**解除回环设备**

```bash
# 解除回环设备
sudo losetup -D $LOOP
```

## 烧录镜像

[官方烧录工具](https://www.raspberrypi.com/software/)

根据系统选择对应版本，通过烧录工具配置信息。

## 安装桌面环境

当前镜像未集成桌面环境（安装需内核头文件及DKMS编译），建议系统启动后通过APT安装，或在树莓派设备上直接构建含桌面的完整镜像。

```bash
export DEBIAN_FRONTEND=noninteractive
sudo apt update
# DDE 桌面环境相关的包
sudo apt install deepin-desktop-environment-{base,cli,core,extras}
# 这里安装完系统lightdm是被禁用自启动，允许自启动重启
sudo systemctl enable lightdm
# 玲珑环境
sudo apt install deepin-desktop-environment-ll
# UOS AI 、火狐浏览器
sudo apt install uos-ai firefox

# 如果需要使用 treeland 窗管
sudo apt install treeland ddm
# 禁用 lightdm 自启动，允许 ddm 自启动
sudo systemctl disable lightdm && sudo systemctl enable ddm
# 停止 lightdm，启动 ddm
sudo systemctl stop lightdm && sudo systemctl enable ddm
```

## 制作镜像脚本

```bash
git clone --depth=1 https://github.com/deepin-community/deepin-raspberrypi.git
```

构建不包含桌面环境的镜像

```bash
cd deepin-raspberrypi
./build.sh
```

构建包含桌面环境的镜像，需要在树莓派上构建

```bash
cd deepin-raspberrypi
./build.sh desktop
```

经过前面的讲解，这里大家应该能明白一个系统的磁盘镜像是如果制作的。这里是以 deepin 和树莓派做一个举例，其他的开发板，x86_64、loongarch64、riscv64 等架构的系统是可以遵循这个思路的。后续会分享相关的其他例子给大家。

## 视频

[定制你的树莓派镜像——deepin](https://www.bilibili.com/video/BV15AQTY1Eeg/)

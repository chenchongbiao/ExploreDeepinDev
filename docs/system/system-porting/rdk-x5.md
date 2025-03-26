## 介绍

深圳地瓜机器人有限公司官网：[https://developer.d-robotics.cc](https://developer.d-robotics.cc/)

**RDK X5** 是一款全功能开发板，具有 10Tops 端侧推理算力与 8 核 ARM A55 处理能力，支持 2 路 MIPI Camera 接入，4 路 USB3.0 接口。通过搭配丰富的传感器和扩展组件，为开发者提供了灵活的硬件扩展和连接选项。

这里以 deepin 作为例子，讲解镜像的制作，到烧录镜像，运行系统。

<!--@include: ./include/Technical-literacy.md-->

<!--@include: ./include/install-base-tools.md-->

<!--@include: ./include/mmdebstrap.md-->

## **磁盘镜像制作**

### **创建空白镜像并分区**

```bash
dd if=/dev/zero of=deepin-rdk-x5.img bs=1M count=4096
sudo fdisk deepin-rdk-x5.img << EOF
n
p
1

+256M
t
c
n
p
2


w
EOF
```

::: details 点击查看解析

```bash
sudo fdisk deepin-rdk-x5.img << EOF
n       # 新建分区
p       # 主分区
1       # 分区号1
        # 起始扇区默认（由 fdisk 自动选择，通常为 2048 或 8192，保证对齐）
+256M   # 大小256MB
t       # 更改分区类型
c       # 类型设为 FAT32 (LBA)（类型代码 `0c` 的简写）
n       # 新建第二个分区
p       # 主分区
2       # 分区号2
        # 起始扇区默认（自动紧接第一个分区结束位置）
        # 结束扇区默认（占用剩余空间）
w       # 写入分区表并退出
EOF
```

- **`fdisk`**：经典磁盘分区工具，支持MBR分区表
- **`<< EOF`**：Here Document语法，将后续内容作为标准输入传递给命令

---

#### **关键概念说明**

**🔹 fdisk的作用**
磁盘分区编辑器，可创建/删除分区、修改分区类型。此处操作对象是镜像文件而非物理磁盘。

**🔹 Here Document技巧**
`<< EOF`到 `EOF`之间的内容会作为标准输入传递给前序命令，实现自动化交互操作，避免手动输入。

**🔹 分区类型选择**
`c`类型对应FAT32，这是启动分区的标准要求。第二个分区通常使用Linux原生类型（默认83），但此处未显式设置。

---

#### **最终成果**

生成包含两个分区的镜像文件：

```
deepin-rdk-x5.img
├─p1 : 300MiB FAT32 (启动分区)
└─p2 : 3.7GiB Linux分区
```

后续可通过 `losetup` 挂载镜像，进行文件系统格式化和系统文件写入。

:::

#### **格式化与挂载分区**

```bash
# 绑定到回环设备
LOOP=$(sudo losetup -Pf --show deepin-rdk-x5.img)
# 格式化引导分区
sudo mkfs.fat -F32 "${LOOP}p1"
# 修改 FAT 文件系统卷标为 CONFIG
sudo fatlabel "${LOOP}p1" CONFIG
# 格式化根分区
sudo mkfs.ext4 "${LOOP}p2"
# 将 ext4 分区的卷标（Label）设置为 root
sudo e2label "${LOOP}p2" root

mkdir tmp
# 挂载根分区
sudo mount "${LOOP}p2" tmp
# 复制根文件系统
sudo cp -a rootfs/* tmp
# 创建 config 目录
sudo mkdir tmp/boot/config

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

## **安装 RDK X5 官方提供的软件包**

```bash
sudo chroot tmp bash

(chroot) echo "deb [trusted=yes] http://archive.d-robotics.cc/ubuntu-rdk-x5 jammy main" | tee /etc/apt/sources.list.d/rdk-x5.list
(chroot) apt update
(chroot) apt install -y hobot-boot linux-base
# 这一段 linux-base 里面包含了 perf 命令，hobot-utils也包含了 perf 命令，这里使用 hobot-utils 提供的，下载 deb 用 dpkg 强制覆盖来安装。
(chroot) apt download --allow-unauthenticated hobot-utils && dpkg -i --force-overwrite ./*.deb && rm ./*.deb
# 内核、设备树、引导、驱动等额外软件包
(chroot) apt install -y \
            hobot-audio-config hobot-camera hobot-configs \
            hobot-display hobot-dnn hobot-dtb hobot-io hobot-io-samples \
            hobot-kernel-headers hobot-miniboot hobot-models-basic hobot-multimedia \
            hobot-multimedia-dev hobot-multimedia-samples hobot-sp-samples \
            hobot-spdev hobot-wifi
(chroot) rm /etc/apt/sources.list.d/rdk-x5.list
(chroot) exit
```

## **编辑分区表**

```bash
(chroot) tee /etc/fstab << EOF
LABEL=CONFIG  /boot/config  vfat    defaults,,x-systemd.automount          0       2
LABEL=root  /               ext4    defaults,rw,errors=remount-ro,x-systemd.growfs  0       1
EOF
```

## 设置启动分区

`boot` 标志是合法的，表示将该分区设为“活动分区”（用于 Legacy BIOS 引导）。

```bash
sudo parted deepin-rdk-x5.img set 2 boot on
```

<!--@include: ./include/personalization.md-->

<!--@include: ./include/clean.md-->

## 烧录镜像

### 下载烧录工具

#### Windows

官网 https://etcher.download/download-etcher/ 下载 [https://github.com/balena-io/etcher/releases/download/v1.18.11/balenaEtcher-Setup-1.18.11.exe](https://github.com/balena-io/etcher/releases/download/v1.18.11/balenaEtcher-Setup-1.18.11.exe)

#### deepin

- 方法一：通过应用商店搜索 Etcher 刻录工具
- 方法二：命令行安装 **`sudo apt install com.github.balena-etcher`**
- 方法三：官网下载 https://etcher.download/download-etcher/，[Appimage 版本](https://github.com/balena-io/etcher/releases/download/v1.18.11/balenaEtcher-1.18.11-x64.AppImage) 下载完点击运行。

## 运行系统

将 TF 卡插入读卡器中。选择前面制作好的，deepin-rdk-x5.img 镜像，选择读卡器，点击烧录。

等待烧录成功。

这里如果没有安装图形界面，HDMI 连接屏幕也无法调试。需要用串调试

参考：[https://developer.d-robotics.cc/rdk_doc/Quick_start/remote_login](https://developer.d-robotics.cc/rdk_doc/Quick_start/remote_login)

### 远程工具

#### Windows

MobaXterm 工具

当串口USB转接板首次插入电脑时，需要安装串口驱动。驱动程序可从资源中心的[工具子栏目](https://developer.d-robotics.cc/resource)获取。驱动安装完成后，设备管理器可正常识别串口板端口，如下图：

#### deepin

从应用商店搜索 WindTerm 或者命令行安装。或者 cutecom、putty 也可以。

```bash
sudo apt install io.github.kingtoolbox
```

串口通信这里在 deepin 上需要内核模块支持。

开发板串口线跟电脑正确连接。deepin 上需要加载内核模块 ch341，这里通过命令行查看，出现以下信息说明加载成功。

```bash
╰─❯ lsmod | grep ch341                                                                                    ─╯
ch341                  24576  1

```

如果没有用命令行加载

```bash
sudo modprobe ch341
```

通过串口连接工具上选择串口，ttyUSB0，根据实际的选择。

设置串口配置参数，如下：

| 配置项               | 参数值                               |
| -------------------- | ------------------------------------ |
| 波特率（Baud rate）  | RDK X3 （921600），RDK X5 （115200） |
| 数据位（Data bits）  | 8                                    |
| 奇偶校验（Parity）   | None                                 |
| 停止位（Stop bits）  | 1                                    |
| 流控（Flow Control） |                                      |

上电，串口工具能看到输出，等待加载。

看到login信息可以进行登录，成功进入系统了。

```bash
bluesky-PC login: deepin
密码： 
Linux bluesky-PC 6.1.83 #1 SMP PREEMPT Tue Feb 11 00:25:16 CST 2025 aarch64
Welcome to deepin 25 GNU/Linux

    * Homepage: https://www.deepin.org/

    * Bugreport: https://bbs.deepin.org/


deepin@bluesky-PC:~$ 
```

## 安装桌面环境

命令行界面配置网络，连接WIFI，如果通过网线连接可以忽略。

```bash
export TERM=linux
sudo nmtui
```

选择启用连接，选择需要连接的 WIFI 输入密码，Esc 键退出。

```bash
# 联网成功后同步下时间服务器
sudo ntpdate pool.ntp.org
```

安装桌面环境相关的包，以下安装的软件包也可以在制作根文件系统阶段安装。另外 img 镜像需要设置更大的空间。

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
tee build.sh <<EOF
#!/bin/bash

set -xe

DISKIMG="deepin-rdk-x5.img"
BUILD_TYPE="$1"
ROOTFS="rootfs"
IMAGE_SIZE=$( [ "$BUILD_TYPE" == "desktop" ] && echo 12288 || echo 4096 )

function run_command_in_chroot()
{
    rootfs="$1"
    command="$2"
    sudo chroot "$rootfs" /usr/bin/env bash -e -o pipefail -c "export DEBIAN_FRONTEND=noninteractive && $command"
}

function setup_chroot_environment() {
    local TMP="$1"
    sudo mount --bind /dev "$TMP/dev"
    sudo mount -t proc chproc "$TMP/proc"
    sudo mount -t sysfs chsys "$TMP/sys"
    sudo mount -t tmpfs -o "size=99%" tmpfs "$TMP/tmp"
    sudo mount -t tmpfs -o "size=99%" tmpfs "$TMP/var/tmp"
    sudo mount --bind /etc/resolv.conf "$TMP/etc/resolv.conf"
    sudo mount -t devpts devpts "$TMP/dev/pts"
}

sudo apt update -y
sudo apt-get install -y qemu-user-static binfmt-support mmdebstrap arch-test usrmerge usr-is-merged fdisk dosfstools
sudo systemctl restart systemd-binfmt

if [ ! -d "$ROOTFS" ]; then
    mkdir -p $ROOTFS
    sudo mmdebstrap \
        --hook-dir=/usr/share/mmdebstrap/hooks/merged-usr \
        --skip=check/empty \
        --include="ca-certificates,locales,sudo,apt,adduser,polkitd,systemd,network-manager,dbus-daemon,apt-utils,bash-completion,curl,vim,bash,deepin-keyring,init,ssh,net-tools,iputils-ping,lshw,iproute2,iptables,procps,wpasupplicant,dmidecode,ntpsec-ntpdate,linux-firmware" \
        --components="main,commercial,community" \
        --architectures=arm64 \
        beige \
        $ROOTFS \
	"deb https://community-packages.deepin.com/beige/ beige main commercial community" \
        "deb https://proposed-packages.deepin.com/beige-testing/ unstable/25 main commercial community"

    if [[ "$BUILD_TYPE" == "desktop" ]];
    then
        setup_chroot_environment $ROOTFS
        run_command_in_chroot $ROOTFS "apt update -y && apt install -y \
            deepin-desktop-environment-core \
            deepin-desktop-environment-base \
            deepin-desktop-environment-cli \
            deepin-desktop-environment-extras \
            firefox \
            ddm \
            treeland"
        run_command_in_chroot $ROOTFS "
        systemctl disable lightdm
        systemctl enable ddm"
        umount -l $ROOTFS
    fi
fi

dd if=/dev/zero of=$DISKIMG bs=1M count=$IMAGE_SIZE
sudo fdisk $DISKIMG << EOF
n
p
1

+256M
t
c
n
p
2


w
EOF

LOOP=$(sudo losetup -Pf --show $DISKIMG)
sudo mkfs.fat -F32 "${LOOP}p1"
sudo fatlabel "${LOOP}p1" CONFIG
sudo mkfs.ext4 "${LOOP}p2"
sudo e2label "${LOOP}p2" root

TMP=tmp
mkdir -p $TMP
sudo mount "${LOOP}p2" $TMP
sudo cp -a $ROOTFS/* $TMP

setup_chroot_environment $TMP

run_command_in_chroot $TMP "echo \"deb [trusted=yes] http://archive.d-robotics.cc/ubuntu-rdk-x5 jammy main\" | tee /etc/apt/sources.list.d/rdk-x5.list"
run_command_in_chroot $TMP "apt update"
run_command_in_chroot $TMP "apt install -y hobot-boot linux-base"
run_command_in_chroot $TMP "apt download --allow-unauthenticated hobot-utils && dpkg -i --force-overwrite ./*.deb && rm ./*.deb"
run_command_in_chroot $TMP " apt install -y \
            hobot-audio-config hobot-camera hobot-configs \
            hobot-display hobot-dnn hobot-dtb hobot-io hobot-io-samples \
            hobot-kernel-headers hobot-miniboot hobot-models-basic hobot-multimedia \
            hobot-multimedia-dev hobot-multimedia-samples hobot-sp-samples \
            hobot-spdev hobot-wifi"
run_command_in_chroot $TMP "rm /etc/apt/sources.list.d/rdk-x5.list"

sudo tee $TMP/etc/fstab << EOF
LABEL=CONFIG  /boot/config  vfat    defaults,,x-systemd.automount          0       2
LABEL=root  /               ext4    defaults,rw,errors=remount-ro,x-systemd.growfs  0       1
EOF

sudo parted $DISKIMG set 2 boot on

run_command_in_chroot $TMP "useradd -m deepin && usermod -aG sudo deepin"
run_command_in_chroot $TMP "echo 'deepin:deepin' | chpasswd"
run_command_in_chroot $TMP "chsh -s /bin/bash deepin"

run_command_in_chroot $TMP "sed -i -E 's/#[[:space:]]*(zh_CN.UTF-8[[:space:]]+UTF-8)/\1/g' /etc/locale.gen"
run_command_in_chroot $TMP "sed -i -E 's/#[[:space:]]*(en_US.UTF-8[[:space:]]+UTF-8)/\1/g' /etc/locale.gen"
run_command_in_chroot $TMP "locale-gen"

sudo tee $TMP/etc/locale.conf << EOF
LANG=zh_CN.UTF-8
LANGUAGE=zh_CN
EOF

run_command_in_chroot $TMP "ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime"
echo "deepin-arm64" | sudo tee $TMP/etc/hostname

run_command_in_chroot $TMP "apt clean && rm -rf /var/cache/apt/archives/*"
sudo umount -l $TMP
sudo e2fsck -f "${LOOP}p2"
sudo losetup -D $LOOP
EOF
```

```bash
chmod +x build.sh
```

构建不包含桌面环境的镜像

```bash
./build.sh
```

```bash
./build.sh desktop
```

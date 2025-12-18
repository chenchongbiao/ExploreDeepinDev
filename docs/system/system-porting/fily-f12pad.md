## 介绍

官网：https://www.created.com.cn

创想电子科技公司旗下的品牌翡丽F12 高性能rk3588s的平板，市面上少有的对用户售卖的可刷Linux系统的平板。手机品牌出品的平板需要解锁，后续厂家做了限制后也不一定能解锁和刷机。

## 工具下载

### upgrade_tool

deepin 上可以使用 upgrade_tool 工具进行烧录，不过该工具源码不开放，可以自己下载二进制。https://github.com/vicharak-in/Linux_Upgrade_Tool。

Windows 上可以使用微星微开发工具进行烧录。

## 编译镜像

### 获取 SDK

这里用瑞莎提供的：https://pan.baidu.com/s/1bm4IXy7tJ-sBDVdMxehRAQ?pwd=1pty

### 解压 SDK

```bash
mkdir rk3588_linux6.1_sdk
tar xvf rk3588_linux6.1_rkr4_sdk.repo.tar -C rk3588_linux6.1_sdk
cd rk3588_linux6.1_sdk
.repo/repo/repo sync -l
```

### 创建 ubuntu22 容器

这里编译 SDK 会依赖到，Python2，deepin 也不维护 Python2，这里借助 Distrobox 创建，ubuntu22 的容器，或者也可以使用 ubuntu22 的虚拟机。

```bash
distrobox create -i ubuntu:22.04 -n ubuntu22
```

```bash
distrobox enter ubuntu22
```

### 安装编译依赖

```bash
sudo apt update
sudo apt install python2 git rsync gcc g++ make device-tree-compiler bc flex bison lz4 libssl-dev libgmp-dev libmpc-dev expect expect-dev file unzip bzip2 fakeroot bsdmainutils libncurses-dev cpio
sudo ln -s /bin/python2 /bin/python
```

### 添加 fily f12 支持

新增 fily f12 的deconfig，添加了 device/rockchip/.chips/rk3588/rockchip_rk3588s_fily_f12_defconfig

```bash
cd device/rockchip
git remote add fily git@github.com:chenchongbiao/fily-device-rockchip.git
git pull fily rk3588-linux-6.1
```

这里在 kernel/arch/arm64/boot/dts/rockchip 添加了 fily 的设备树

```bash
cd kernel
git remote add fily git@github.com:chenchongbiao/fily-kernel.git
git checkout -b linux-6.1-stan-rkr4.1-deepin
git pull fily linux-6.1-stan-rkr4.1-deepin
```

### 构建 SDK

```
./build.sh
```

输入 rockchip_rk3588s_fily_f12_defconfig 项前对应的数字，或者

```bash
./build.sh rockchip_rk3588s_fily_f12_defconfig
./build.sh
```

### 只构建 boot 镜像（kernel）

```bash
./build.sh kernel
```

## 进入烧录模式

方法：保证机器电量充足 -> 将机器关机状态 -> 按住音量加键不松手->插入usb即可“发现一个 LOADER 设备”说明进行烧录模式。

列出连接的设备

### 烧录单个固件

```bash
╰─❯ upgrade_tool ld                                                                                                   ─╯
DevNo=1 Vid=0x2207,Pid=0x350b,LocationID=102    Maskrom
```

看到连接设备说明进入烧录模式。

```bash
upgrade_tool uf update.img
```

### 烧录单个分区

 sdk 编译完之后可以在 output/firmware 看到各个分区的镜像文件。

内核部分可以只烧录  boot 分区

```bash
upgrade_tool di -boot ./boot.img
```

根文件系统部分可以只烧录  rootfs 分区

```bash
upgrade_tool di -rootfs ./rootfs.img
```

## 参考

[radxa 5c buildroot](https://docs.radxa.com/rock5/rock5c/other-os/buildroot)

## 特别感谢

烟花易冷、

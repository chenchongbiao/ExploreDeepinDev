# 介绍

树莓派官网 https://www.raspberrypi.com/

*树莓派*是为学习计算机编程教育而设计，只有信用卡大小的微型电脑。

这里以 deepin 作为例子，讲解树莓派镜像的制作，到烧录镜像，运行系统。

---

# **技术扫盲**

## **Linux系统是什么？**

[深入理解 Linux 系统的核心](../linux)

[Linux 系统与发行版的关系——从安卓到 deepin 的多样性](../linux-distro)

## 引导流程

[U-Boot与GRUB引导机制对比](../uboot-grub.md)

## **树莓派与Linux的关系**

- **硬件适配**：树莓派是基于ARM架构的单板计算机，其专属Linux发行版（如Raspberry Pi OS）针对低功耗和微型设备优化，默认集成GPIO控制工具。
- **引导流程差异**：

  | **设备类型** | **引导程序** | **核心特点**                     |
  | ------------------ | ------------------ | -------------------------------------- |
  | 普通电脑           | GRUB               | 支持多系统引导、图形化配置界面         |
  | 树莓派             | U-Boot             | 轻量化、可定制启动脚本、适配嵌入式设备 |


  > *注：树莓派默认使用**GPU固件+配置文件**（如 `config.txt`）引导，U-Boot常用于深度定制场景。
  >

## **系统镜像类型：ISO vs IMG**

[ISO与IMG镜像的全面对比](../iso-img.md)

---

# 镜像制作

## **安装基础工具链**

```bash
sudo apt update -y
sudo apt-get install -y qemu-user-static binfmt-support mmdebstrap arch-test usrmerge usr-is-merged qemu-system-misc fdisk dosfstools
sudo systemctl restart systemd-binfmt  # 重启 binfmt 服务加载ARM支持
```

::: details
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

::: details

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
dd if=/dev/zero of=deepin-raspberrypi.img bs=1M count=2048
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

::: details

### 创建树莓派镜像的技术步骤解析

#### **创建空白镜像文件**
```bash
dd if=/dev/zero of=deepin-raspberrypi.img bs=1M count=2048
```

- **`dd`**：底层数据复制工具
- **`if=/dev/zero`**：输入源为虚拟设备zero（提供无限空字符）
- **`of=deepin-raspberrypi.img`**：输出目标为指定镜像文件
- **`bs=1M`**：定义每个数据块大小为1MiB（二进制单位，1MiB=1048576字节）
- **`count=2048`**：复制2048个数据块 → 总大小 1M×2048=2GiB

> 💡 为何用2048而不是2000？
> 因存储设备使用二进制单位：1GiB=1024MiB。若用`count=2000`只能得到约1.95GiB，而2048可精确获得2GiB空间。

---

#### **2. 磁盘分区操作**
```bash
sudo fdisk deepin-raspberrypi.img << EOF
...
EOF
```

- **`fdisk`**：经典磁盘分区工具，支持MBR分区表
- **`<< EOF`**：Here Document语法，将后续内容作为标准输入传递给命令

---

#### **3. 自动化分区流程**
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
`<< EOF`到`EOF`之间的内容会作为标准输入传递给前序命令，实现自动化交互操作，避免手动输入。

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

后续可通过`losetup`挂载镜像，进行文件系统格式化和系统文件写入。

:::

#### **格式化与挂载分区**

```bash
sudo losetup -Pf --show $DISKIMG  # 绑定到回环设备
sudo mkfs.fat -F32 "${LOOP}p1"           # 格式化引导分区
sudo mkfs.ext4 "${LOOP}p2"               # 格式化根分区

TMP=`mktemp -d`
sudo mount "/dev/loop0p2" $TMP              # 挂载根分区
sudo cp -a $ROOTFS/* $TMP                # 复制根文件系统
sudo mkdir $TMP/boot/firmware            # 创建固件目录
sudo mount "${LOOP}p1" $TMP/boot/firmware # 挂载引导分区

# 挂载 /dev 目录，允许在 chroot 环境中访问设备文件
sudo mount --bind /dev "$TMP/dev"

# 挂载 proc 文件系统提供了一个接口来访问内核状态信息，如进程列表等
sudo mount -t proc chproc "$TMP/proc"

# 挂载 sysfs 提供了访问内核模块、硬件设备和其他系统级别的信息
sudo mount -t sysfs chsys "$TMP/sys"

# 挂载临时文件系统
sudo mount -t tmpfs -o "size=99%" tmpfs "$TMP/tmp"
sudo mount -t tmpfs -o "size=99%" tmpfs "$TMP/var/tmp"

# 挂载 devpts 文件系统负责为伪终端提供设备节点，支持文本用户界面和shell会话
sudo mount -t devpts devpts "$TMP/dev/pts"
```

---

### **树莓派硬件适配**

#### **安装固件与内核**

```bash
# 从官方仓库克隆固件（需提前下载）
sudo cp -r firmware/* $TMP/boot/firmware

# 安装树莓派专用软件包
run_command_in_chroot $TMP "apt install -y \
    raspi-config raspberrypi-sys-mods firmware-brcm80211"

# 安装ARM64内核
run_command_in_chroot $TMP "apt install -y \
    linux-image-rpi-v8 linux-headers-rpi-v8"
```

#### **配置启动参数**

```bash
# 配置cmdline.txt内核参数
echo "console=serial0,115200 root=LABEL=rootfs ..." | sudo tee $TMP/boot/firmware/cmdline.txt

# 配置fstab自动挂载
sudo tee $TMP/etc/fstab << EOF
LABEL=bootfs  /boot/firmware  vfat    defaults  0 2
LABEL=rootfs  /               ext4    defaults  0 1
EOF
```

---

### **系统个性化配置**

#### **用户与本地化**

```bash
# 创建用户并设置密码
useradd -m deepin && echo 'deepin:deepin' | chpasswd

# 生成多语言环境
sed -i -E 's/#[[:space:]]?(en_US.UTF-8[[:space:]]+UTF-8)/\1/g' /etc/locale.gen
sed -i -E 's/#[[:space:]]?(zh_CN.UTF-8[[:space:]]+UTF-8)/\1/g' /etc/locale.gen
locale-gen
```

#### **步骤5.2 清理与压缩**

```bash
# 清理软件包缓存
apt clean && rm -rf /var/cache/apt/archives/*

# 收缩文件系统以减小镜像体积
sudo e2fsck -f /dev/loop0p2      # 强制文件系统检查
sudo resize2fs -M /dev/loop0p2   # 缩放到最小尺寸
```

---

### **模块六：收尾工作**

```bash
# 卸载所有挂载点
sudo umount -l $TMP
sudo losetup -D $LOOP  # 解除回环设备
sudo rm -rf $TMP       # 删除临时目录
```

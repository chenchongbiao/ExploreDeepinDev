z## 介绍

Termux 是一个强大的 Android 终端模拟器和 Linux 环境应用，无需 root 权限即可运行。它为移动设备带来了完整的 Linux 体验，支持丰富的命令行工具和开发环境，非常适合开发者、极客或学习者在移动端操作。

---

## **Termux 核心特点**

1. **无需 Root 权限**
   通过模拟用户空间运行完整的 Linux 环境，依赖 `proot` 或 `chroot` 实现文件系统隔离。
2. **包管理工具**
   使用 `pkg`/`apt` 管理软件包，支持从 [Termux 官方仓库](https://termux.com/packages.html) 安装 2000+ 工具（如 `vim`、`git`、`python`、`ffmpeg`）。
3. **可扩展性**

   - 兼容部分 ARM、x86 设备，支持编译安装其他工具（如 `gcc`、`clang`）。
   - 可运行轻量级 Linux 发行版（如 Alpine、Ubuntu）通过 `proot-distro`。
4. **开发友好**
   支持常见编程语言（Python/Node.js/Ruby/Go 等）、SSH 服务、Web 服务器（Nginx/Apache），甚至运行数据库（MySQL/PostgreSQL）。

---

## **Termux 典型用途**

- **移动开发**：编写/调试代码，搭配 `code-server` 实现 VS Code 远程开发。
- **网络工具**：使用 `nmap`、`tcpdump`、`curl` 进行网络测试。
- **教育学习**：练习 Linux 命令、脚本编写（Bash/Python）。
- **隐私工具**：配合 `tor`、`metasploit`（需手动安装）进行安全研究。

---

## 安装应用

### Termux

[下载链接](https://github.com/termux/termux-app/releases)

发布的 v0.119.0-beta.2 版本中提供了Android 5、6、7 也可以使用的版本，有旧手机的也可以使用。

### ZeroTermux

[下载链接](https://github.com/hanxinhao000/ZeroTermux/releases)

ZeroTermux 是根据 Termux 二次开发，提供了一些便利的功能，不过没有提供，Android5、6、7 可以使用的版本。

### termux-x11

[下载链接](https://github.com/termux/termux-x11/releases)

Termux X11服务器附加应用程序。

### Termux:Boot

该插件将在设备启动后立即运行脚本。安装 ZeroTermux 不需要安装这个。

---

## 基础操作

### 命令

Termux 除了支持 `apt` 命令外，还在此基础上封装了 `pkg` 命令，`pkg` 命令向下兼容 `apt` 命令。`apt` 命令大家应该都比较熟悉了，这里直接简单的介绍下 `pkg` 命令:

```bash
pkg search <query>              # 搜索包
pkg install <package>           # 安装包
pkg uninstall <package>         # 卸载包
pkg reinstall <package>         # 重新安装包
pkg update                      # 更新源
pkg upgrade                     # 升级软件包
pkg list-all                    # 列出可供安装的所有包
pkg list-installed              # 列出已经安装的包
pkg show <package>              # 显示某个包的详细信息
pkg files <package>             # 显示某个包的相关文件夹路径
```

除了通过上述的 `pkg` 命令安装软件以外，如果我们有 `.deb` 软件包文件，也可以使用 `dpkg` 进行安装。deb 需要修改 $PREFIX 来重新压包。

不过 Termux 上 一些环境变量做了修改，需要修改软件包的 $PREFIX

```bash
echo $HOME
/data/data/com.termux/files/home

echo $PREFIX
/data/data/com.termux/files/usr

echo $TMPPREFIX
/data/data/com.termux/files/usr/tmp/zsh
```

## 修改软件源

使用 `pkg update` 更新一下的时候发现默认的官方源网速有点慢，更换成国内的 `Termux` 清华大学源了，加快软件包下载速度。

ps: 如果手机是备用机不方便用微信等工具拷贝的，可以先用 ssh 连接别的机器或者被连接上拷贝命令，如果使用 ZeroTermux，屏幕从左向右滑动，有换源功能。

```bash
sed -i 's@packages-cf.termux.org@mirrors.aliyun.com/termux@' $PREFIX/etc/apt/sources.list

pkg update
```

::: tips

如果使用的 Android 5，6，7可能可能使用的是 termux-main-21，

高版本的使用 termux-main，根据实际情况修改镜像源

:::

## 安装 openssh

OpenSSH 是 SSH （Secure SHell） 协议的免费开源实现。SSH 协议族可以用来进行远程控制， 或在计算机之间传送文件。Termux 官方已经封装好了。

```bash
pkg install openssh
```

### 远程连接电脑

ssh 连接你的服务器，和 ssh 命令一致。

```bash
ssh user@ip
```

### 被远程机器连接

启动 ssh 服务

安装完成后，`sshd` 服务默认没有启动，所以得手动启动下：

Termux 上执行

```bash
sshd
```

`ifconfig` 查看 ip

`whoami` 查看当前用户名

`passwd` 设置用户密码

其他设备上执行

```bash
ssh user@ip -p 8022
```

user 和 ip 根据实际填写，另外 Termux 上 sshd 服务运行在 8022 端口。

## 默认启动

在进入 Termux 后，我们希望有些程序默认执行。创建 ~/.termux/boot/ 目录：将要执行的脚本放入 ~/.termux/boot/ 目录中。如果有多个文件，则它们将按排序顺序执行。，比如我们希望前面的 sshd 能默认启动。需要配合 Termux:boot 使用，可以选择先启动应用 Termux:boot 再启动 Termux。在 Android 设置里关闭两个应用的电池优化，防止程序后台杀掉。

termux-wake-lock 防止设备进入睡眠状态。

```bash
mkdir -p ~/.termux/boot/

tee ~/.termux/boot/start <<EOF
#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
sshd
EOF
```

如果想在 Termux-services 在启动时启动服务，可以使用：

[https://wiki.termux.com/wiki/Termux-services](https://wiki.termux.com/wiki/Termux-services)

```bash
#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
. $PREFIX/etc/profile
```

如果使用的是 ZeroTermux 可以使用

```bash
tee /data/data/com.termux/files/usr/etc/termux-login.sh <<EOF
termux-wake-lock
sshd
EOF
```

## 创建目录软连接

通过以下命令，Termux 可以获取手机的访问权限。

```
termux-setup-storage
```

手机上会弹出权限申请，选择接受。home 目录会生成 storage 文件夹。

通过 ls 命令可以看到是把手机上一些资源目录软链接到 storage 目录下。

```bash
$ ls -l storage
total 0
lrwxrwxrwx 1 u0_a109 u0_a109 24 May  8 00:14 dcim -> /storage/emulated/0/DCIM
lrwxrwxrwx 1 u0_a109 u0_a109 29 May  8 00:14 documents -> /storage/emulated/0/Documents
lrwxrwxrwx 1 u0_a109 u0_a109 28 May  8 00:14 downloads -> /storage/emulated/0/Download
lrwxrwxrwx 1 u0_a109 u0_a109 49 May  8 00:14 external-0 -> /storage/emulated/0/Android/data/com.termux/files
lrwxrwxrwx 1 u0_a109 u0_a109 44 May  8 00:14 media-0 -> /storage/emulated/0/Android/media/com.termux
lrwxrwxrwx 1 u0_a109 u0_a109 26 May  8 00:14 movies -> /storage/emulated/0/Movies
lrwxrwxrwx 1 u0_a109 u0_a109 25 May  8 00:14 music -> /storage/emulated/0/Music
lrwxrwxrwx 1 u0_a109 u0_a109 28 May  8 00:14 pictures -> /storage/emulated/0/Pictures
lrwxrwxrwx 1 u0_a109 u0_a109 28 May  8 00:14 podcasts -> /storage/emulated/0/Podcasts
lrwxrwxrwx 1 u0_a109 u0_a109 19 May  8 00:14 shared -> /storage/emulated/0
```

如果在  ZeroTermux 上操作，请注意删除容器时，如果给容器分配了访问权限。请记得先删除 storage 目录下的软链接，否则删除容器时 rm -r 递归删除会把手机上的资源一起删除的。

```bash
rm $HOME/storage/*
```

请注意不需要 -r 参数。

## zsh

`zsh` 来替代 `bash` 作为默认 shell

```bash
pkg install zsh
chsh -s zsh
```

这里  zsh 的主题配置，和 Linux 上操作一样。

## 安装桌面

Termux官方项目 [https://github.com/LinuxDroidMaster/Termux-Desktops](https://github.com/LinuxDroidMaster/Termux-Desktops)

### 安装 proot-distro

```bash
pkg install proot-distro
```

### 安装 GXDE

GXDE 桌面环境源自 deepin 15 时代的重生

```bash
proot-distro install debian
```

这里 proot-distro 是从 Github 上 https://github.com/termux/proot-distro/releases 获取下载的发行版根文件系统。

通过手机代理商的流量可以正常安装上，如果有道理服务可以手动设置代理。

```bash
export https_proxy=http://ip:7890
proot-distro install debian
```

也可以手动下载与设备相同架构的发行版根文件系统。手动解压到以下路径

/data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs

将根文件系统重命名成对应发行版的文件夹。这里安装 debian 后可以看到，debian 目录。

进入 Debian

```bash
proot-distro login debian
```

替换国内源

```bash
sed -i 's/deb.debian.org/mirrors.aliyun.com/' /etc/apt/sources.list
sed -i 's/security.debian.org/mirrors.aliyun.com/' /etc/apt/sources.list
```

安装 curl

```bash
apt update
apt install curl
```

从该地址下载deb包

https://mirrors.sdu.edu.cn/GXDE/gxde-os/bixie/g/gxde-source/

```bash
curl https://mirrors.sdu.edu.cn/GXDE/gxde-os/bixie/g/gxde-source/gxde-source_1.1.8_all.deb -o gxde-source.deb
apt install ./gxde-source.deb
```

安装 gxde 桌面

```bash
apt update
apt install gxde-testing-source aptss -y
apt install gxde-desktop-android -y
```

添加一个新用户，并加入 sudo 用户组。

```bash
useradd -m -s /bin/bash 用户名
passwd 用户名
```

```bash
chmod +w /etc/sudoers
nano /etc/sudoers

# Add the following line to the file
用户名 ALL=(ALL:ALL) ALL
```

exit 退出

proot Android 12及以上用户在使用Termux时，有时会显示 `[Process completed (signal 9) - press Enter]`，这是因为Android 12的PhantomProcesskiller限制了应用的子进程，最大允许应用有32个子进程。

参考： [解决安卓12限制32个线程](https://blog.csdn.net/a18845594188/article/details/131296936)

进入设备的设置找到版本号点击来开启开发者选项。

安装Android Tools

```bash
pkg install android-tools
```

利用Android 12的功能，使Termux处于浮窗状态。

配置无线调试

系统设置 --> 开发者设置

勾选无线调试，点击使用配对码配对设备。

记下IP地址和端口，根据实际修改命令

```sh
adb pair ip:port
```

输入配对码回车即可。

弹窗退出，能看到无线调试页面显示的 IP 地址和端口号。

输入命令连接，根据实际修改

```bash
adb connect ip:port
```

连接成功后，执行以下命令。

```bash
adb shell device_config set_sync_disabled_for_tests persistent 
adb shell device_config put activity_manager max_phantom_processes 65536
```

没有报错说明正确解除限制。

安装下 x11 桌面环境可以使用的软件包，还有音频服务。

```bash
pkg update
pkg install x11-repo
pkg install termux-x11-nightly
pkg install pulseaudio
```

新建脚本，下面的用户名请修改成实际使用的，完整拷贝到终端回车。

```bash
tee debiandde.sh <<EOF
#!/data/data/com.termux/files/usr/bin/bash

# Kill open X11 processes
kill -9 $(pgrep -f "termux.x11") 2>/dev/null

# Enable PulseAudio over Network
pulseaudio --start --load="module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1" --exit-idle-time=-1

# Prepare termux-x11 session
export XDG_RUNTIME_DIR=${TMPDIR}
termux-x11 :0 >/dev/null &

# Wait a bit until termux-x11 gets started.
sleep 3

# Launch Termux X11 main activity
am start --user 0 -n com.termux.x11/com.termux.x11.MainActivity > /dev/null 2>&1
sleep 1

# Login in PRoot Environment. Do some initialization for PulseAudio, /tmp directory
# and run XFCE4 as user droidmaster.
# See also: https://github.com/termux/proot-distro
# Argument -- acts as terminator of proot-distro login options processing.
# All arguments behind it would not be treated as options of PRoot Distro.
proot-distro login debian --shared-tmp -- /bin/bash -c  'rm /run/dbus/pid | export PULSE_SERVER=127.0.0.1 && export XDG_RUNTIME_DIR=${TMPDIR} && dbus-daemon --system && su - 用户名 -c "export DISPLAY=:0 && startdde"'

exit 0
EOF
```

添加执行权限

```bash
chmod +x debiandde.sh
```

```bash
./debiandde.sh
```

执行脚本后会弹出 Termux-X11 显示界面。

Termux:X11 中展示的键盘会挡住桌面的 dock 栏。可以在长安Termux:X11 中进行键盘偏好设置，关闭 `Show additional keyboard` 选项。

其他选项根据需要进行设置。

## chroot

* 设备获得 root 权限。
* 需要在 Termux 中安装以下软件包：

```bash
pkg update
pkg install x11-repo
pkg install root-repo
pkg install termux-x11-nightly
pkg install busybox
pkg update
pkg install tsu
pkg install pulseaudio
```

下载 Debian chroot

```bash
wget https://github.com/LinuxDroidMaster/Termux-Desktops/releases/download/Debian/debian12-arm64.tar.gz
```

以 root 权限进入 Android shell：

```bash
su
export PATH=$PATH:/data/data/com.termux/files/usr/bin
```

```bash
mkdir /data/local/tmp/chrootDebian
cd /data/local/tmp/chrootDebian
```

下载 Debian chroot

```bash
wget https://github.com/LinuxDroidMaster/Termux-Desktops/releases/download/Debian/debian12-arm64.tar.gz
```

```bash
tar xpvf debian12-arm64.tar.gz --numeric-owner
```

创建启动脚本

```bash
cd ../
vi start_debian.sh
```

```bash
#!/bin/sh

#Path of DEBIAN rootfs
DEBIANPATH="/data/local/tmp/chrootDebian"

# Fix setuid issue
busybox mount -o remount,dev,suid /data

busybox mount --bind /dev $DEBIANPATH/dev
busybox mount --bind /sys $DEBIANPATH/sys
busybox mount --bind /proc $DEBIANPATH/proc
busybox mount -t devpts devpts $DEBIANPATH/dev/pts

# /dev/shm for Electron apps
mkdir -p $DEBIANPATH/dev/shm
busybox mount -t tmpfs -o size=256M tmpfs $DEBIANPATH/dev/shm

# Mount sdcard
mkdir -p $DEBIANPATH/sdcard
busybox mount --bind /sdcard $DEBIANPATH/sdcard

# chroot into DEBIAN
busybox chroot $DEBIANPATH /bin/su - root
```

添加执行权限执行

```bash
chmod +x start_debian.sh
sh start_debian.sh
```

进入到 Debian 的 rootfs 中，执行下面的修复。

```bash
echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "127.0.0.1 localhost" > /etc/hosts

groupadd -g 3003 aid_inet
groupadd -g 3004 aid_net_raw
groupadd -g 1003 aid_graphics
usermod -g 3003 -G 3003,3004 -a _apt
usermod -G 3003 -a root

sed -i 's/deb.debian.org/mirrors.aliyun.com/' /etc/apt/sources.list
sed -i 's/security.debian.org/mirrors.aliyun.com/' /etc/apt/sources.list

apt update
apt upgrade

apt install nano vim net-tools sudo git
```

创建用户

```bash
groupadd storage
groupadd wheel
useradd -m -g users -G wheel,audio,video,storage,aid_inet -s /bin/bash 用户名
passwd 用户名
```

将创建的用户添加到 sudoers 文件以具有超级用户权限：

```bash
nano /etc/sudoers
```

添加内容

```bash
用户名 ALL=(ALL:ALL) ALL
```

安装桌面环境

gnome

```bash
sudo apt install dbus-x11 nano gnome gnome-shell gnome-terminal gnome-tweaks gnome-software nautilus gnome-shell-extension-manager gedit tigervnc-tools gnupg2 -y
```

退出 chroot 并修改 start_debian.sh 脚本：

```bash
vim /data/local/tmp/start_debian.sh
```

替换最后一行

注意修改用户名

```bash
busybox chroot $DEBIANPATH /bin/su - 用户名 -c 'export DISPLAY=:0 && export PULSE_SERVER=127.0.0.1 && dbus-launch --exit-with-session startxfce4'
```

新增脚本

```
wget https://raw.githubusercontent.com/LinuxDroidMaster/Termux-Desktops/main/scripts/chroot/debian/startxfce4_chrootDebian.sh

chmod +x startxfce4_chrootDebian.sh
./startxfce4_chrootDebian.sh
```

## 安装 code-server

https://github.com/coder/code-server

进入 proot 中使用

```bash
proot-distro login debian
```

```bash
curl -fsSL https://code-server.dev/install.sh | sh
```

运行服务

```bash
code-server
```

修改配置

```bash
vim $HOME/.config/code-server/config.yaml
```

password 字段修改称自己的密码

退出 code-server 服务，重启。

## 参考

[Termux 高级终端安装使用配置教程](https://www.sqlsec.com/2018/05/termux.html)

[官方英文 WiKi 文档](https://wiki.termux.com/wiki/Main_Page)

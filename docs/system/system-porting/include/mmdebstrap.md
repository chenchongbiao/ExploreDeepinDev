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
## 面向大学生的虚拟机软件指南：快速搭建编程环境

### 一、为什么需要虚拟机？

- 安全隔离的实验环境，避免破坏主机系统
- 体验不同操作系统（如Linux开发环境）
- 快速恢复系统（适合调试危险操作）

### 二、主流虚拟机软件对比

| 软件名称           | 优势                                    | 劣势                     | 适用场景                  | 授权类型 |
| ------------------ | --------------------------------------- | ------------------------ | ------------------------- | -------- |
| VMware Workstation | 性能优异，企业级功能（快照链、GPU直通） | 商业收费                 | 专业开发、企业环境        | 商业软件 |
| VirtualBox         | 完全免费，跨平台支持好，免安装版便携    | 3D加速较弱，USB3需扩展包 | 学习/个人开发，轻量级使用 | 开源免费 |
| QEMU               | 硬件模拟灵活，支持多种架构              | 配置复杂，需命令行操作   | 内核开发、嵌入式系统研究  | 开源免费 |

### 三、重点功能解析

1. **VMware的付费优势（2024年5月已宣布对个人用户免费 [VMware Workstation Pro 免费版下载及安装指南](https://www.sysgeek.cn/install-vmware-workstation-pro/)）**

- 无缝模式：直接在主机桌面运行Linux应用
- 高级网络模拟：构建复杂网络拓扑
- 专业技术支持（适合计算机专业学生）

2. **QEMU的使用门槛**

- 需配合virt-manager等前端工具
- 典型用法：`qemu-system-x86_64 -m 4G -hda disk.img`
- 建议先掌握Linux基础命令再尝试

### 四、快速搭建方案（推荐）

**1：获取VirtualBox安装包**
Winwows版本下载：[VirtualBox Portable](https://download.virtualbox.org/virtualbox/7.1.6/VirtualBox-7.1.6-167084-Win.exe)
官方链接：https://www.virtualbox.org/wiki/Downloads

**2：安装VirtualBox系统**

运行安装程序根据提示选择即可，可选择安装路径。

**3：导入预配置系统**

提供的deepin系统的ova文件：

**下载链接**

百度网盘：https://pan.baidu.com/s/1iErHMYrfxcreWZEMRYZKcA?pwd=c5wr

:::details 系统环境说明
通过 ISO 安装虚拟机，做一个配置删除一些软件。作为快速获得一个可学习编程的环境。

```bash
sudo apt update && sudo apt dist-upgrade
# 卸载玲珑应用
sudo ll-cli uninstall org.deepin.browser
ps -aux | grep org.dde.calendar
sudo kill -9 pid
sudo ll-cli uninstall org.dde.calendar
sudo ll-cli uninstall org.deepin.mail
sudo apt purge linglong-builder linglong-box linglong-bin
sudo rm -rf /var/lib/linglong
# 卸载 五子棋、相册、深度之家、连连看、深度音乐、语音记事本、打印管理器、设备管理器、文件扫描、libreoffice、删除旧内核
sudo apt purge com.deepin.gomoku deepin-album deepin-home com.deepin.lianliankan deepin-music deepin-voice-note dde-printer deepin-devicemanager simple-scan libreoffice* linux-{headers,image}-6.6.40-amd64-desktop-hwe

# 控制中心
# ssh 的服务端、安装 deepin-ide
sudo apt install openssh-server deepin-unioncode

# 设置浅色主题
# 关闭特效
dbus-send --session --type=method_call --dest=com.deepin.wm /com/deepin/wm org.freedesktop.DBus.Properties.Set string:'com.deepin.wm' string:'compositingEnabled' variant:boolean:false
# 设置虚拟机不要休眠功能
dbus-send --session --type=method_call --dest=org.deepin.dde.Power1 /org/deepin/dde/Power1 org.freedesktop.DBus.Properties.Set string:'org.deepin.dde.Power1' string:'LinePowerSleepDelay' variant:int32:0

# 清理 apt 缓存
sudo apt clean

sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
```

:::

导入步骤：

1. 启动VirtualBox → 管理 → 导入虚拟电脑
2. 选择下载的 `.ova`文件。
3. 保持默认设置，完成导入

**4：启动系统**

- 账户：deepin
- 密码： deepin
- 设置了 ssh 服务，添加了端口转发 宿主机 8022 -> 虚拟机 22，**(host) ssh localhost -p 8022**

从宿主机远程连接

```bash
ssh deepin@localhost -p 8022
```

这里宿主机的 8022  端口转发给虚拟机的 22 端口。

### 五、学习资源推荐

1. [VirtualBox官方文档：英文原版](https://www.virtualbox.org/wiki/Documentation)
2. [VMware Workstation Pro 免费版下载及安装指南](https://www.sysgeek.cn/install-vmware-workstation-pro/)

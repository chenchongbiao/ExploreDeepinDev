## 编译内核

从 deepin 社区仓库获取内核源码。

```bash
git clone --depth=1 https://github.com/deepin-community/kernel.git -b 6.6.y
```

## 安装依赖工具

```bash
sudo apt install gcc make libncurses5-dev openssl libssl-dev build-essential pkg-config libc6-dev bison flex libelf-dev dwarves debhelper kmod cpio libssl-dev -y
```

## Config 以及编译

```bash
# 根据需要修改
make menuconfig
```

```bash
# 编译
make -j $(nproc)
# 安装kernel modules
sudo make modules_install -j $(nproc)
# 安装 kernel boot.img
sudo make install
```

### 编译出 deb 包

arm64

```bash
make deepin_arm64_desktop_defconfig &&  make bindeb-pkg -j$(nproc)
```

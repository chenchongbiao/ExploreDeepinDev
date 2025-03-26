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
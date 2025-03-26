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

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

```bash
# 设置主机名
(chroot) echo "deepin-arm64" | tee /etc/hostname
```

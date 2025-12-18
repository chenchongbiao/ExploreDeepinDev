## 介绍

ROCK 5B/5B+ 是一款基于 RK3588 芯片组的优雅单板计算机 (SBC)。其 100 x 75 mm 的紧凑尺寸几乎涵盖了
RK3588 的所有功能，提供卓越的灵活性和可扩展性。ROCK
5B/5B+为极客、单板机爱好者、物联网爱好者和高校师生等用户提供了将想法变为现实的坚实基础。它在边缘计算、人工智能、云计算、智能监控和其他领域有着广泛的应用。

记录  sdk 6.1 移植

## 创建 ubuntu22 容器

这里编译 SDK 会依赖到，Python2，deepin 也不维护 Python2，这里借助 Distrobox 创建，ubuntu22 的容器，或者也可以使用 ubuntu22 的虚拟机。

```bash
sudo apt install docker.io distrobox
sudo usermod -aG docker $USER
newgrp docker
```

```bash
distrobox create -i ubuntu:22.04 -n ubuntu22
```

```bash
distrobox enter ubuntu22
```

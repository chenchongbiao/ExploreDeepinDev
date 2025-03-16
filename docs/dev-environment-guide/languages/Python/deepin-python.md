## 一、deepin系统Python开发环境现状

1. 预装优势：deepin 23及更新版本已预装Python 3.12环境，终端输入python3可直接进入交互模式
2. 版本验证：运行 `python3 --version` 可查看具体预装版本
3. 包管理优势：通过 `sudo apt install python3-pip` 可快速安装pip包管理器

## 二、Anaconda使用现状分析（2024年）

1. 空间问题：完整安装约占用3GB空间，包含大量科学计算库
2. 适用场景：仅建议机器学习/数据分析方向学生使用
3. 替代方案：常规开发推荐使用系统原生Python + venv方案

## 三、三步搭建虚拟环境（命令行方案）

1. 安装虚拟环境模块：

```bash
sudo apt update && sudo apt install python3-venv python3-pip -y
# 换阿里源，提供库安装速度
pip3 config set global.index-url https://mirrors.aliyun.com/pypi/simple/
```

2. 创建项目隔离环境：

```bash
mkdir myproject && cd myproject
python3 -m venv venv
```

3. 环境激活与使用：

```bash
source venv/bin/activate  # 激活后提示符显示环境名
pip install pandas numpy  # 安装的包仅限当前环境
```

## 四、新旧方案对比表

| 特性             | Anaconda     | Python venv  |
| ---------------- | ------------ | ------------ |
| 安装体积         | ~3GB         | ~20MB        |
| 启动速度         | 较慢         | 即时         |
| 预装科学库       | 完整         | 需手动安装   |
| 多版本Python支持 | 支持         | 需系统安装   |
| 适合人群         | 数据科学方向 | 全栈/Web开发 |

建议：普通Python学习者优先使用系统原生环境，通过 `python3 -m pip install numpy` 按需安装必要库。当需要处理多个项目的依赖冲突时，使用venv创建独立环境即可，无需安装Anaconda。deepin的文件管理器可直接右键打开终端，配合VSCode等编辑器可快速搭建开发环境。

## 五、开发工具选择与配置指南（续）

### 1. VSCode 轻量级开发方案

```bash
# 一键安装命令（deepin商店或命令行）
sudo apt install com.visualstudio.code
```

**配置技巧**：

- 安装官方 Python 扩展包（Ctrl+Shift+X 搜索安装）
- 虚拟环境绑定：Ctrl+Shift+P → "Python: Select Interpreter" → 选择 `venv/bin/python`
- 右上角点击运行

### 2. Jupyter Notebook 快速部署

```bash
# 在虚拟环境中安装启动
source venv/bin/activate
pip3 install jupyter
jupyter notebook
```

**访问方式**：

- 终端运行后浏览器会自动打开网站
- 终端中会弹出地址，拷贝到浏览器中打开
- 退出时双击 Ctrl+C 关闭服务

### 3. deepin-IDE 原生开发工具

```bash
sudo apt install deepin-unioncode
```

**特色功能**：

- 智能代码补全（Python 3.12 语法支持）
- 内置 Git 图形化操作界面
- 一键切换 Python 虚拟环境（右下角状态栏选择）

### 4. PyCharm 替代方案

```bash
# 社区版安装（免费使用），或者从官方下载安装
sudo apt install com.jetbrains.pycharmcommunity
```

**优化配置**：

- 减少内存占用：Help → Edit Custom VM Options 添加 `-Xms512m`
- 关联虚拟环境：File → Settings → Project → Python Interpreter → 添加现有环境

---

## 六、常见问题解决方案

#### ▶ Jupyter 无法启动

```bash
# 修复内核冲突
pip install --upgrade ipykernel
python -m ipykernel install --user --name=venv
```

#### ▶ 终端环境切换异常

```bash
# 强制重置环境变量
deactivate 2>/dev/null  # 确保退出旧环境
source venv/bin/activate
```

通过上述方案，deepin 系统可快速搭建从基础学习到项目开发的完整 Python 环境，无需依赖 Anaconda 等重型工具。建议学生群体优先使用系统预装环境+VSCode组合，兼顾效率与资源占用。

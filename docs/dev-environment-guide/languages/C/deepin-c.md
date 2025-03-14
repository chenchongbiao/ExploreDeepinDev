## deepin C语言开发环境配置指南（极简技术向）

### 一、GCC环境速配

```bash
# 安装开发工具链（含gcc/make等）
sudo apt update && sudo apt install build-essential

# 验证编译器血统
gcc -v
```

### 二、编译器本质解析

**代码转化三明治制造机**：

```
  人类代码(.c) → [GCC编译器] → 机器代码(.out)
         ↓           ↓           ↓
     菜谱文档    三明治制造机    即食三明治
```

**编译型语言核心优势**：

- 预处理（展开头文件）→ 编译（生成汇编）→ 汇编（生成机器码）→ 链接（拼装成品）
- 可通过 `gcc -save-temps hello.c`查看中间文件（.i/.s/.o）

### 三、开发工具矩阵

| 工具类型             | 推荐方案                                | 特点速评                         |
| -------------------- | --------------------------------------- | -------------------------------- |
| **重型IDE**    | CLion (需JetBrains账号激活)             | 智能重构/内存检测，适合大型工程  |
| **轻量编辑器** | VSCode (需装C/C++扩展包)                | 终端集成+Git可视化，插件党的胜利 |
| **跨平台框架** | Qt Creator (sudo apt install qtcreator) | 自带UI设计器，课程设计神器       |
| **本土化方案** | Deepin IDE                              | 中文友好，自带代码模板           |

### 四、环境配置实战

1. **开发配置**：

```bash
sudo apt update
# 应用商店的 vscode
sudo apt install -y com.visualstudio.code
# 系统源带的 Qt create
sudo apt install -y qtcreator
# 应用商店的 Clion
sudo apt install -y com.jetbrains.clion
# deepin 自研 IDE
sudo apt install -y deepin-unioncode
```
### 五、工具链冷知识

- **GCC版本玄学**：可通过 `sudo update-alternatives --config gcc`切换多版本
- **VSCode调试秘籍**：安装 `gdb`后按F5自动生成launch.json
- **Deepin-IDE隐藏技能**：Ctrl+鼠标悬停查看标准库源码（如stdio.h实现细节）

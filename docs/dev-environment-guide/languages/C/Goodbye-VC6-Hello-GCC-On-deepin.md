## 还在用VC6写C语言吗？

"同学，今天我们来学习如何在VC6.0中新建一个C语言工程..."讲台上教授话音未落，我的笔记本已经弹出了deepin应用商店——这年头还在用1998年的开发工具教编程，就像拿着竹简教人发微博。

### 一、Windows开发者的"世纪难题"

1. **考古级IDE受害者**：Dev-C++的调试功能比我的校园网还卡，VC6.0甚至不认识C99标准
2. **宇宙最强IDE的暴击**：想写个Hello World却被Visual Studio塞了20G的C++/C#/F#全家桶
3. **配置地狱**：PATH环境变量？编译工具链？这些不该是新手村该有的Boss

### 二、deepin的降维打击

在deepin深度终端输入这串神秘代码：

```bash
sudo apt install build-essential # 包含gcc/g++/make等全套装备
```

三行命令解锁开发者形态：

```bash
deepin-editor hello.c  # 用你喜欢的任何编辑器
```

```bash
#include <stdio.h>

int main()
{
   printf("%s", "hello world!");
   return 0;
}
```

```bash
gcc hello.c -o rainbow  # 给你的程序起个中二的名字
./rainbow    # 见证奇迹的时刻
```

### 三、IDE文艺复兴

1. **VSCode极简主义**：

   - 应用商店一键安装
   - C/C++插件市场下载量最高的那个
   - Ctrl+` 召唤终端，写代码就像聊微信
2. **CLion的魔法时刻**：

   - 直接从仓库安装JetBrains全家桶
   - 智能补全能猜出你暗恋对象的名字（误）
   - CMakeLists.txt自动生成，拒绝配置焦虑
3. **Qt Creator的隐藏玩法**：

   - 不写GUI也能当普通IDE用
   - 内存泄露检测比宿管阿姨查房还严格
   - 自带Git图形化，版本控制不再手忙脚乱

（附）deepin C语言速通秘籍：

```bash
# 开发全家桶一键部署，这里是从 deepin 应用商店上下载安装的，你也可以从官网中下载版本。
sudo apt update && sudo apt install -y build-essential com.visualstudio.code qtcreator com.jetbrains.clion
# 写完代码后的标准姿势
gcc -Wall -Wextra -std=c11 your_code.c -o output && ./output
```

当你的同学们还在为"LNK1207错误"抓狂时，你已经用deepin刷完了LeetCode周赛。所以问题来了：究竟是Windows需要你，还是你需要Windows？

### 四、视频

[还在用VC6?收手吧阿祖！| 外面全是GCC编译器](https://www.bilibili.com/video/BV1X1QzYKEDg)

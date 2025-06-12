## **一、 Node.js 简介**

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，用于构建高效的后端服务和工具链。

---

**特点**：

- 非阻塞 I/O，适合高并发场景（如 API、实时应用）。
- 丰富的 npm 生态（超过 100 万开源包）。
- 跨平台支持（Linux/macOS/Windows）。

## **二、 在 deepin 上安装 Node.js**

### **方法 1：通过官方仓库安装**

```bash
sudo apt update
sudo apt install nodejs npm
```

验证安装：

```bash
node -v
npm -v
```

显示版本说明安装成功。

---

### **方法 2：通过官网下载**

https://nodejs.org/en

上到官方网站，点击 Download Node.js (LTS) 下载长期支持的版本。

中文网 https://nodejs.cn
选择需要的版本。

下载压缩包 node-v22.16.0-linux-arm64.tar.xz，这是 ARM64 版本，根据实际架构选择。

```bash
sudo tar -xvf node-v22.16.0-linux-arm64.tar.xz -C /usr/local/
sudo mv /usr/local/node-v22.16.0-linux-arm64 /usr/local/node
```

解压缩到 /usr/local 目录。
在 ~/.bashrc 中配置环境变量

```bash
export NODE_HOME=/usr/local/node
export PATH="$PATH:$NODE_HOME/bin"
```

让配置文件生效

```bash
source ~/.bashrc
```

```bash
node -v
npm -v
```

显示版本说明正确

---

### **方法 3：使用 nvm（推荐开发使用）**

nvm 可管理多个 Node.js 版本，适合需要切换版本的场景。

#### **安装步骤：**

1. 下载并安装 nvm：

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   ```
2. 加载 nvm 到当前终端：

   ```bash
   . "$HOME/.nvm/nvm.sh"
   ```

   如果想默认终端执行可以在 .bashrc 中加入环境变量。
3. 安装指定版本 Node.js：

   ```bash
   nvm install 22
   ```
4. 验证：

   ```bash
   node -v
   nvm current
   ```
5. 运行指定版本

   ```bash
   nvm use 22
   ```

---

## **3. 配置 npm 环境**

### **3.1 切换国内镜像源**

解决 npm 安装慢的问题（使用淘宝源）：

```bash
npm config set registry https://registry.npmmirror.com
```

检查配置：

```bash
npm config get registry
```

### **3.2 全局工具安装**


常用工具（如 yarn、pnpm）：
默认会安装到 /usr/local/lib/node_modules
可以修改下权限
```bash
sudo chown $USER:$USER /usr/local/lib/node_modules
```
```bash
npm install -g yarn pnpm
```

---

## **4. 创建第一个 Node.js 项目**

### **示例 1：HTTP 服务器**

1. 新建文件 `server.js`：
   ```javascript
   const http = require('http');
   const server = http.createServer((req, res) => {
     res.end('Hello, deepin!');
   });
   server.listen(3000, () => console.log('Server running on port 3000'));
   ```
2. 运行：
   ```bash
   node server.js
   ```
3. 浏览器访问 `http://localhost:3000`，看到 `Hello, deepin!`。

---

## **5. 调试与项目管理**

### **5.1 VS Code 调试**

1. 安装 VS Code：
   ```bash
   sudo apt install code
   ```
2. 打开项目文件夹，配置调试（`.vscode/launch.json`）：
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Node",
         "program": "${workspaceFolder}/app.js"
       }
     ]
   }
   ```

### **5.2 常用 npm 命令**

```bash
npm init -y          # 初始化项目
npm install lodash   # 安装依赖
npm run <script>     # 运行自定义脚本（需在 package.json 中定义）
npm update           # 更新依赖
```

---


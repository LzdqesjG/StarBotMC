<!-- https://github.com/LzdqesjG/StarBotMC -->

<div align="center">
  <!-- <img style="width: 128px; height: 128px;" src="" alt="logo" /> -->

  <p><em>StarBotMC 是一个功能强大的的 Minecraft AI 机器人，支持多账户管理、自动登录、玩家追踪、Web 控制面板和 AI 聊天功能。</em></p>

  <!-- <img src="https://goreportcard.com/badge/github.com/LzdqesjG/StarBotMC" alt="latest version" /> -->
  <a href="https://github.com/LzdqesjG/StarBotMC/blob/main/LICENSE"><img src="https://img.shields.io/github/license/LzdqesjG/StarBotMC" alt="License" /></a>
  <!-- <a href="https://github.com/LzdqesjG/StarBotMC/actions?query=workflow%3ABuild"><img src="https://img.shields.io/github/actions/workflow/status/LzdqesjG/StarBotMC/build.yml?branch=main" alt="Build status" /></a> -->
  <a href="https://github.com/LzdqesjG/StarBotMC/releases"><img src="https://img.shields.io/github/release/LzdqesjG/StarBotMC" alt="latest version" /></a>

  <a href="https://github.com/LzdqesjG/StarBotMC/discussions"><img src="https://img.shields.io/github/discussions/LzdqesjG/StarBotMC?color=%23ED8936" alt="discussions" /></a>
  <!-- <a href="https://github.com/LzdqesjG/StarBotMC/releases"><img src="https://img.shields.io/github/downloads/LzdqesjG__':
/total?color=%239F7AEA&logo=github" alt="Downloads" /></a> -->
</div>



# StarBotMC - Minecraft AI 机器人

一个功能强大的基于 Node.js 和 mineflayer 的 Minecraft AI 机器人，支持多账户管理、自动登录、玩家追踪、Web 控制面板和 AI 聊天功能。

## 功能特性

- 多账户管理 - 支持管理多个机器人账户，可随时切换
- 自动登录/注册 - 自动检测并执行服务器登录/注册命令
- 玩家追踪 - 实时追踪在线玩家，支持上线/下线提醒
- 自动重连 - 连接断开时自动重连，可配置重试次数和延迟
- Web 控制面板 - 实时查看聊天、玩家列表、背包信息，支持远程控制
- AI 聊天 - 集成 OpenAI API，实现智能对话
- 物品管理 - 支持丢弃物品、查看背包等操作
- 命令系统 - 支持多种游戏内命令和 Web 命令

## 系统要求

- Node.js 16.0 或更高版本
- npm 或 yarn
- Minecraft 服务器（支持 1.18.2 - 1.21.1 等多个版本）

## 安装步骤

### 1. 克隆或下载项目

```bash
git clone https://github.com/LzdqesjG/StarBotMC.git
cd StarBotMC
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置机器人

复制配置模板：

```bash
copy config_template.json config.json
```

编辑 `config.json` 文件，填入你的配置信息。

请一定要更改配置文件，否则无法使用

### 4. 启动机器人

Windows:
```bash
npm start
```

或使用启动脚本：
```bash
start.bat
```

Linux/Mac:
```bash
npm start
```

或使用启动脚本：
```bash
bash start.sh
```

## 配置说明

### 基本配置

```json
{
  "server": {
    "version": "1.21.1",
    "host": "example.com",
    "port": 25565
  },
  "player": {
    "username": "YourBotName",
    "owner": "YourUsername"
  }
}
```

- `server.version` - Minecraft 服务器版本
- `server.host` - 服务器 IP 地址或域名
- `server.port` - 服务器端口（默认 25565）
- `player.username` - 机器人用户名
- `player.owner` - 所有者用户名（用于权限验证）

### 多账户配置

```json
{
  "accounts": [
    {
      "username": "Bot1",
      "owner": "YourUsername"
    },
    {
      "username": "Bot2",
      "owner": "YourUsername"
    }
  ],
  "currentAccountIndex": 0
}
```

- `accounts` - 账户列表
- `currentAccountIndex` - 当前使用的账户索引（从 0 开始）

### 自动登录配置

```json
{
  "auth": {
    "autoLogin": true,
    "autoRegister": true,
    "password": "your_password_here",
    "loginCommand": "/login",
    "registerCommand": "/register"
  }
}
```

- `autoLogin` - 是否自动登录
- `autoRegister` - 是否自动注册
- `password` - 登录/注册密码
- `loginCommand` - 登录命令（默认 /login）
- `registerCommand` - 注册命令（默认 /register）

### 自动重连配置

```json
{
  "reconnect": {
    "enabled": true,
    "maxReconnectAttempts": 10,
    "reconnectDelay": 5000
  }
}
```

- `enabled` - 是否启用自动重连
- `maxReconnectAttempts` - 最大重连尝试次数
- `reconnectDelay` - 重连延迟（毫秒）

### 玩家提醒配置

```json
{
  "playerCheckInterval": 10000,
  "playerAlerts": {
    "YourUsername": {
      "message": "欢迎主人上线！",
      "leaveMessage": "再见！",
      "command": "/tell YourUsername 我在线了！",
      "delay": 2000
    }
  }
}
```

- `playerCheckInterval` - 玩家检查间隔（毫秒）
- `playerAlerts` - 特定玩家的提醒配置
  - `message` - 上线消息
  - `leaveMessage` - 下线消息
  - `command` - 执行的命令
  - `delay` - 延迟执行时间（毫秒）

### OpenAI 配置

```json
{
  "openai": {
    "apiUrl": "https://api.openai.com/v1/chat/completions",
    "model": "gpt-3.5-turbo",
    "apiKey": "your_api_key_here"
  }
}
```

- `apiUrl` - OpenAI API 地址
- `model` - 使用的模型（如 gpt-3.5-turbo、gpt-4）
- `apiKey` - OpenAI API 密钥

获取 API 密钥：
1. 访问 [OpenAI 官网](https://platform.openai.com/)
2. 注册账号并登录
3. 在 API Keys 页面创建新的 API 密钥
4. 将密钥填入配置文件

### Web 控制面板配置

```json
{
  "web": {
    "password": "your_web_password_here"
  }
}
```

- `password` - Web 控制面板登录密码

### 启动命令配置

```json
{
  "startupCommands": [
    "/login your_password_here",
    "/signin"
  ],
  "signin": {
    "enabled": true,
    "command": "/signin"
  }
}
```

- `startupCommands` - 启动后自动执行的命令列表
- `signin` - 自动签到配置

## 使用方法

### 游戏内命令

只有所有者（配置文件中的 `owner`）可以执行以下命令：

- `!follow` - 开始跟随说话的玩家
- `!stop` - 停止跟随
- `!ai` - 启用 AI 功能
- `!switch` - 切换到下一个账户
- `!accounts` - 列出所有账户

### Web 控制面板

启动机器人后，在浏览器中访问：

```
http://localhost:3000
```

输入配置文件中设置的 Web 密码即可登录。

#### Web 控制面板功能

- 实时聊天 - 查看游戏内聊天消息，支持发送消息
- 玩家列表 - 查看在线玩家及其距离
- 背包管理 - 查看机器人背包中的物品
- 命令执行 - 支持执行游戏内命令

#### Web 命令

- `.help` - 显示帮助信息
- `.dc` - 断开机器人连接
- `.drop` - 丢弃所有物品
- `.drop <栏位>` - 丢弃指定栏位的物品
- `.drop <栏位> <数量>` - 丢弃指定栏位的指定数量物品

## 项目结构

```
StarBotMC/
├── public/                  # Web 静态文件
│   ├── dashboard.html      # 控制面板页面
│   └── index.html          # 登录页面
├── accounts.js             # 多账户管理模块
├── auth.js                 # 自动登录/注册模块
├── config.json             # 配置文件（需自行创建）
├── config_template.json    # 配置模板
├── index.js                # 主程序入口
├── package.json            # 项目依赖配置
├── playerTracker.js        # 玩家追踪模块
└── reconnect.js            # 自动重连模块
```

## 故障排除

### 机器人无法连接到服务器

1. 检查服务器地址和端口是否正确
2. 确认服务器版本与配置文件中的版本匹配
3. 检查网络连接
4. 确认服务器是否在线
5. 检查机器人是否被服务器封禁

### 自动登录失败

1. 检查密码是否正确
2. 确认登录命令格式（部分服务器使用 `/login <password>`，部分使用 `/login <password> <password>`）
3. 查看控制台日志了解具体错误

### Web 控制面板无法访问

1. 确认机器人已启动
2. 检查端口 3000 是否被占用
3. 确认防火墙设置
4. 尝试使用 `http://localhost:3000` 访问

### AI 聊天无响应

1. 检查 OpenAI API 密钥是否正确
2. 确认 API 密钥有足够的额度
3. 检查网络连接是否正常
4. 查看控制台日志了解具体错误

## 依赖库

- [mineflayer](https://github.com/PrismarineJS/mineflayer) - 核心 Minecraft 机器人库
- [mineflayer-pathfinder](https://github.com/PrismarineJS/mineflayer-pathfinder) - 路径查找和移动系统
- [express](https://expressjs.com/) - Web 服务器框架
- [socket.io](https://socket.io/) - 实时通信库
- [axios](https://axios-http.com/) - HTTP 请求库

## 开发和贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

ISC

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件


## 注意事项

1. 请妥善保管配置文件中的密码和 API 密钥
2. 不要将 `config.json` 提交到版本控制系统
3. 使用机器人时请遵守服务器规则
4. AI 功能需要消耗 OpenAI API 额度
5. 建议在测试服务器上先测试各项功能

## 常见问题

**Q: 如何添加更多账户？**

A: 在 `config.json` 的 `accounts` 数组中添加新的账户对象即可。

**Q: 如何修改机器人跟随的目标？**

A: 在游戏中对机器人说 `!follow` 即可开始跟随你。

**Q: Web 控制面板的密码忘记了怎么办？**

A: 编辑 `config.json` 文件，修改 `web.password` 字段为新密码。默认密码为your_web_password_here

**Q: 机器人会自动执行哪些操作？**

A: 机器人会自动执行以下操作：
- 连接服务器
- 自动登录/注册
- 执行启动命令
- 检测玩家上线/下线
- 自动重连（如果启用）

**Q: 如何禁用某个功能？**

A: 在 `config.json` 中将对应功能的 `enabled` 字段设置为 `false`。

---

享受使用 StarBotMC！如有任何问题，请随时联系。

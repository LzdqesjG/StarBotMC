c:\Users\Administrator\Documents\GitHub\StarBotMC\README.md
<!-- https://github.com/LzdqesjG/StarBotMC -->
<div align="center">
  <!-- <img style="width: 128px; height: 128px;" src="" alt="logo" /> -->
  <p><em>StarBotMC 是一个功能强大的的 Minecraft AI 机器人，支持多账户管理、自动登录、玩家追踪、Web 控制面板和 AI 聊天功能。</em></p>
  <!-- <img src="https://goreportcard.com/badge/github.com/LzdqesjG/StarBotMC" alt="latest version" /> -->
  <a href="https://github.com/LzdqesjG/StarBotMC/blob/main/LICENSE"><img src="https://img.shields.io/github/license/LzdqesjG/StarBotMC" alt="License" /></a>  <a href="https://github.com/LzdqesjG/StarBotMC/releases"><img src="https://img.shields.io/github/release/LzdqesjG/StarBotMC" alt="latest version" /></a>   <a href="https://github.com/LzdqesjG/StarBotMC/discussions"><img src="https://img.shields.io/github/discussions/LzdqesjG/StarBotMC?color=%23ED8936" alt="discussions" /></a>
  <!-- <a href="https://github.com/LzdqesjG/StarBotMC/releases"><img src="https://img.shields.io/github/downloads/LzdqesjG/StarBotMC/total?color=%239F7AEA&logo=github" alt="Downloads" /></a> -->
</div>
  <!-- <a href="https://github.com/LzdqesjG/StarBotMC/actions?query=workflow%3ABuild"><img src="https://img.shields.io/github/actions/workflow/status/LzdqesjG/StarBotMC/build.yml?branch=main" alt="Build status" /></a> -->

# StarBotMC - Minecraft AI 机器人

一个功能强大的基于 Node.js 和 mineflayer 的 Minecraft AI 机器人，支持多账户管理、自动登录、玩家追踪、Web 控制面板和 AI 聊天功能。

## 功能特性

- 多账户管理 - 支持管理多个机器人账户，可随时切换
- 自动登录/注册 - 自动检测并执行服务器登录/注册命令
- 玩家追踪 - 实时追踪在线玩家，支持上线/下线提醒
- 自动重连 - 连接断开时自动重连，可配置重试次数和延迟
- Web 控制面板 - 实时查看聊天、玩家列表、背包信息，支持远程控制
- AI 聊天 - 集成多种AI平台（OpenAI、Claude、Gemini、Ollama等），实现智能对话
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
    "version": "1.21.11",
    "host": "jackal.wormwake.com",
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

### AI 配置

```json
{
  "ai": {
    "defaultPlatform": "openai",
    "openai": {
      "apiUrl": "https://api.openai.com/v1/chat/completions",
      "model": "gpt-3.5-turbo",
      "apiKey": "your_openai_api_key_here"
    },
    "claude": {
      "apiUrl": "https://api.anthropic.com/v1/messages",
      "model": "claude-3-sonnet-20240229",
      "apiKey": "your_claude_api_key_here"
    },
    "gemini": {
      "apiUrl": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      "model": "gemini-pro",
      "apiKey": "your_gemini_api_key_here"
    },
    "ollama": {
      "apiUrl": "http://localhost:11434/api/chat",
      "model": "llama2",
      "apiKey": "ollama" 
    },
    "qwen": {
      "apiUrl": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      "model": "qwen-max",
      "apiKey": "your_qwen_api_key_here"
    },
    "moonshot": {
      "apiUrl": "https://api.moonshot.cn/v1/chat/completions",
      "model": "moonshot-v1-8k",
      "apiKey": "your_moonshot_api_key_here"
    },
    "zhipu": {
      "apiUrl": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      "model": "glm-4",
      "apiKey": "your_zhipu_api_key_here"
    },
    "baichuan": {
      "apiUrl": "https://api.baichuan-ai.com/v1/chat/completions",
      "model": "Baichuan2-Turbo",
      "apiKey": "your_baichuan_api_key_here"
    },
    "minimax": {
      "apiUrl": "https://api.minimaxi.chat/v1/text/chatcompletion_pro",
      "model": "abab5.5-chat",
      "apiKey": "your_minimax_api_key_here"
    }
  }
}
```

- `defaultPlatform` - 默认AI平台（可选：openai, claude, gemini, ollama, qwen, moonshot, zhipu, baichuan, minimax）
- 各平台配置：
  - `apiUrl` - API 地址
  - `model` - 使用的模型
  - `apiKey` - API 密钥

获取 API 密钥：
1. OpenAI: 访问 [OpenAI 官网](https://platform.openai.com/)
2. Claude: 访问 [Anthropic 官网](https://www.anthropic.com/)
3. Gemini: 访问 [Google AI Studio](https://aistudio.google.com/)
4. Ollama: 本地运行 Ollama 服务
5. 通义千问: 访问 [阿里云](https://www.aliyun.com/)
6. 月之暗面: 访问 [Moonshot AI](https://www.moonshot.cn/)
7. 智谱AI: 访问 [Zhipu AI](https://www.zhipu.ai/)
8. 百川AI: 访问 [Baichuan AI](https://www.baichuan-ai.com/)
9. MiniMax: 访问 [MiniMax](https://www.minimaxi.com/)

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

<<<<<<< HEAD
启动机器人后，在浏览器中访问：
=======
启动机器人后，在浏览器中访问：
>>>>>>> 6e690dcdb3523996d6daaa5e84000bca634102c3

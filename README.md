# Minecraft AI 机器人

基于Node.js和mine-flayer库的Minecraft AI机器人项目。

## 功能特性

- 自动连接到Minecraft服务器
- 随机移动行为
- 简单的聊天响应
- 错误处理和死亡事件处理

## 安装依赖

```bash
npm install
```

## 配置

项目使用 `config.json` 文件进行配置，包含以下内容：

```json
{
  "server": {
    "version": "1.18.2",
    "host": "localhost",
    "port": 25565
  },
  "player": {
    "username": "Lzdqesj_BOT"
  },
  "openai": {
    "apiUrl": "https://api.openai.com/v1/chat/completions",
    "model": "gpt-3.5-turbo",
    "apiKey": "your-api-key-here"
  }
}
```

### 配置说明：
- `server.version` - Minecraft服务器版本
- `server.host` - Minecraft服务器IP地址
- `server.port` - Minecraft服务器端口
- `player.username` - 机器人在游戏中的用户名
- `openai.apiUrl` - OpenAI API地址
- `openai.model` - 使用的AI模型
- `openai.apiKey` - OpenAI API密钥（需要替换为真实密钥）

### OpenAI API配置

要使用AI聊天功能，你需要：
1. 在 [OpenAI官网](https://platform.openai.com/) 注册账号
2. 获取API密钥
3. 将API密钥填入 `config.json` 文件中的 `openai.apiKey` 字段

## 运行

```bash
node index.js
```

## 如何使用

1. 启动Minecraft服务器
2. 运行机器人脚本
3. 在游戏中，你可以看到机器人自动移动
4. 你可以在聊天中输入"你好"或"hello"，机器人会回复

## 扩展功能

你可以根据需要扩展以下功能：

- 挖矿行为
- 建造结构
- 战斗系统
- 物品收集
- 更复杂的AI决策

## 依赖库

- [mineflayer](https://github.com/PrismarineJS/mineflayer) - 核心Minecraft机器人库
- [mineflayer-pathfinder](https://github.com/PrismarineJS/mineflayer-pathfinder) - 路径查找和移动系统

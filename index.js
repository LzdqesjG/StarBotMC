const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const fs = require('fs');
const axios = require('axios');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const testmode = process.argv.includes('--test');

// 导入自定义模块
const AccountManager = require('./accounts');
const AuthManager = require('./auth');
const PlayerTracker = require('./playerTracker');
const ReconnectManager = require('./reconnect');
const AIManager = require('./aiManager');

// 读取配置文件 若包含 --test 参数则使用测试配置
const configFile = testmode ? '.test.config.json' : 'config.json';
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静态文件服务
app.use(express.static('public'));

// 密码验证
const authenticatedSockets = new Set();

// 日志记录到文件
const now = new Date();
const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

// 确保logs目录存在
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 获取今日启动次序
const logFiles = fs.readdirSync(logsDir).filter(f => f.startsWith(dateStr));
const sequenceNumber = logFiles.length + 1;

const logFileName = `${logsDir}/${dateStr}_${sequenceNumber}.log`;
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });

// 重定向console.log到文件和控制台
const originalLog = console.log;
console.log = function(...args) {
  originalLog.apply(console, args);
  const logMessage = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ') + '\n';
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(2, '0');
  logStream.write(`[${hours}:${minutes}:${seconds}.${milliseconds}] ${logMessage}`);
};

starbotmc_version = '1.0.0000';
starcore_version = '1.0.0000';
starbot_version = '4.35.0';

console.log(`[StarBotMC] 当前版本: ${starbotmc_version}`)
console.log(`[StarCore]  当前版本: ${starcore_version}`)
console.log(`[StarBot]   当前版本: ${starbot_version}`)

console.log('日志系统已加载完毕。')
console.log(`本次运行日志文件: ${logFileName}`);

console.log('[StarBotMC] 正在执行 StarCore 初始化 ...');
const asciiArt = `
 /==========================================================================================\\
|      ███████╗████████╗ █████╗ ██████╗ ██████╗  ██████╗ ████████╗    ███╗   ███╗ ██████╗    |
|      ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝    ████╗ ████║██╔════╝    |
|      ███████╗   ██║   ███████║██████╔╝██████╔╝██║   ██║   ██║       ██╔████╔██║██║         |
|      ╚════██║   ██║   ██╔══██║██╔══██╗██╔══██╗██║   ██║   ██║       ██║╚██╔╝██║██║         |
|      ███████║   ██║   ██║  ██║██║  ██║██████╔╝╚██████╔╝   ██║       ██║ ╚═╝ ██║╚██████╗    |
|      ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝    ╚═╝       ╚═╝     ╚═╝ ╚═════╝    |
 \\==========================================================================================/
`;
console.log(asciiArt);

if (testmode) {
  console.log('[StarBotMC] *测试模式, 使用 test.config.json 作为配置文件');
} else {
  console.log('[StarBotMC] *使用 config.json 作为配置文件');
}

console.log('[StarBotMC] StarCore 初始化完成。即将初始化 StarBot ...');

io.on('connection', (socket) => {
  console.log('[WebUI] 网页客户端已连接');
  socket.emit("verify_init",(config.captha.enabled) ? config.captha.sitekey : "no open");
  
  // 处理登录请求
  socket.on('login', (password,token) => {
    if (password === config.web.password) {
      if (config.captha.enabled){
        let res = axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify",{"secret":config.captha.secret,"response":token},{"headers":{"Content-Type":"application/json"}});//这是个异步api，我假装它是同步的
        if (!res.success){
        socket.emit('login_result', { success: false, message: '验证码错误' });
      console.log('[WebUI] 用户登录失败：验证码错误');
          return;
        }
      }
      authenticatedSockets.add(socket.id);
      socket.emit('login_result', { success: true });
      console.log('[WebUI] 用户登录成功');
    } else {
      socket.emit('login_result', { success: false, message: '密码错误' });
      console.log('[WebUI] 用户登录失败：密码错误');
    }
  });
  
  // 处理断开连接
  socket.on('disconnect', () => {
    authenticatedSockets.delete(socket.id);
    console.log('[WebUI] 网页客户端已断开连接');
  });
  
  // 检查是否已认证
  function isAuthenticated() {
    return authenticatedSockets.has(socket.id);
  }
  
  // 发送消息
  socket.on('send_message', (message) => {
    if (!isAuthenticated() && !testmode) {
      socket.emit('error', '请先登录');
      return;
    };
    message=String(message);
    console.log(`[WebUI] 网页发送消息: ${message}`);
    if (bot) {
      // 检查是否是命令
      if (message.startsWith('.')) {
        webCmd(message);
      } else {
        bot.chat(message);
      }
    }
  });

  // 容器点击事件
  socket.on('container_click', (data) => {
    if (!isAuthenticated() && !testmode) {
      socket.emit('error', '请先登录');
      return;
    }
    
    if (!bot) {
      socket.emit('error', 'Bot未连接');
      return;
    }
    
    try {
      const { slot, mouseButton } = data;
      console.log(`[WebUI] 容器点击: 槽位=${slot}, 按钮=${mouseButton === 0 ? '左键' : '右键'}`);
      
      if (bot.currentWindow) {
        bot.simpleClick.leftMouse(slot);
      } else {
        console.log('[WebUI] 没有打开的容器');
        socket.emit('error', '没有打开的容器');
      }
    } catch (err) {
      console.error('[WebUI] 容器点击失败:', err);
      socket.emit('error', `容器点击失败: ${err.message}`);
    }
  });

  // 容器右键点击事件
  socket.on('container_right_click', (data) => {
    if (!isAuthenticated() && !testmode) {
      socket.emit('error', '请先登录');
      return;
    }
    
    if (!bot) {
      socket.emit('error', 'Bot未连接');
      return;
    }
    
    try {
      const { slot } = data;
      console.log(`[WebUI] 容器右键点击: 槽位=${slot}`);
      
      if (bot.currentWindow) {
        bot.simpleClick.rightMouse(slot);
      } else {
        console.log('[WebUI] 没有打开的容器');
        socket.emit('error', '没有打开的容器');
      }
    } catch (err) {
      console.error('[WebUI] 容器右键点击失败:', err);
      socket.emit('error', `容器右键点击失败: ${err.message}`);
    }
  });

  // 关闭容器事件
  socket.on('container_close_request', () => {
    if (!isAuthenticated() && !testmode) {
      socket.emit('error', '请先登录');
      return;
    }
    
    if (!bot) {
      socket.emit('error', 'Bot未连接');
      return;
    }
    
    try {
      if (bot.currentWindow) {
        bot.closeWindow(bot.currentWindow);
        console.log('[WebUI] 已关闭容器');
      }
    } catch (err) {
      console.error('[WebUI] 关闭容器失败:', err);
      socket.emit('error', `关闭容器失败: ${err.message}`);
    }
  });
});

// Socket.io事件处理

if (!config.web) {
  config.web = {};
}

if (config.web.port ? config.web.port : -1 === -1) {
  console.log('[StarBotMC] Web服务器端口未配置 (web.port), 已设置为 25560');
  config.web.port = 25560;
}
if (config.web.host ? config.web.host : -1 === -1) {
  console.log('[StarBotMC] Web服务器主机未配置 (web.host), 已设置为 0.0.0.0');
  config.web.host = '0.0.0.0';
}

// 启动Web服务器，带错误处理
const DEFAULT_PORT = 3081;
const PORT = (config.web && config.web.port) ? config.web.port : DEFAULT_PORT;
const HOST = (config.web && config.web.host) ? config.web.host : '0.0.0.0';

// 首先添加错误监听器
server.on('error', (err) => {
  if (err.code === 'EACCES') {
    console.log(`[WebUI] 端口 ${PORT} 访问被拒绝，尝试使用备用端口...`);
    // 尝试使用备用端口
    let attemptPort = 3082;
    server.listen(attemptPort, HOST);
  } else if (err.code === 'EADDRINUSE') {
    console.log(`[WebUI] 端口 ${PORT} 已被占用，尝试使用备用端口...`);
    // 循环尝试多个备用端口
    let attemptPort = PORT + 1;
    const maxAttempts = 10;
    let attempts = 0;

    const tryNextPort = () => {
      if (attempts >= maxAttempts) {
        console.error(`[WebUI] 无法绑定到任何端口，已达最大尝试次数`);
        return;
      }

      console.log(`[WebUI] 尝试端口 ${attemptPort}...`);
      server.listen(attemptPort, HOST);
    };

    server.once('listening', () => {
      console.log(`[WebUI] Web服务器已启动，访问地址: http://127.0.0.1:${server.address().port}`);
      // 更新配置中的端口值
      if (!config.web) config.web = {};
      config.web.port = server.address().port;
    });

    server.once('error', (retryErr) => {
      if (retryErr.code === 'EADDRINUSE' || retryErr.code === 'EACCES') {
        console.log(`[WebUI] 端口 ${attemptPort} 不可用，尝试下一个端口...`);
        attempts++;
        attemptPort++;
        if (attempts < maxAttempts) {
          tryNextPort();
        } else {
          console.error(`[WebUI] 无法找到可用端口，已达最大尝试次数`);
        }
      } else {
        console.error(`[WebUI] 启动Web服务器时发生错误:`, retryErr);
      }
    });

    tryNextPort();
  } else {
    console.error(`[WebUI] 启动Web服务器时发生错误:`, err);
  }
});

server.once('listening', () => {
  console.log(`[WebUI] Web服务器已启动，访问地址: http://127.0.0.1:${server.address().port}`);
  // 更新配置中的端口值
  if (!config.web) config.web = {};
  config.web.port = server.address().port;
});

// 开始尝试监听
server.listen(PORT, HOST);

// OpenAI API调用函数
async function getAIResponse(message, options = {}) {
  if (!aiManager) {
    return 'AI管理器未初始化，请检查配置。';
  }
  return await aiManager.getAIResponse(message, options);
  try {
    // 检查API密钥是否配置
    if (!config.openai.apiKey || config.openai.apiKey === 'your-api-key-here') {
      return 'API密钥未配置，请在config.json中设置OpenAI API密钥。';
    }
    
    const response = await axios.post(config.openai.apiUrl, {
      model: config.openai.model,
      messages: [
        { role: 'system', content: '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。' },
        { role: 'user', content: message }
      ],
      max_tokens: 150
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openai.apiKey}`
      }
    });
    
    // 检查响应结构
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      console.error('OpenAI API响应结构错误:', response.data);
      return '抱歉，我暂时无法回答你的问题。';
    }
  } catch (error) {
    console.error('OpenAI API调用失败:', error.message);
    if (error.response) {
      console.error('API响应错误:', error.response.status, error.response.data);
    }
    return '抱歉，我暂时无法回答你的问题。';
  }
}

// 全局变量
let bot = null;
let accountManager = null;
let authManager = null;
let playerTracker = null;
let reconnectManager = null;
let aiManager = null; // AI管理器
let isConnected = false; // 跟踪bot连接状态
let lastPlayerCount = 0; // 上次玩家数量
let emptyPlayerListCount = 0; // 玩家列表为空的次数

// 丢弃所有物品的函数
function dropAllItems() {
  if (!bot || !bot.inventory) {
    console.log('Bot未连接或背包不可用');
    return;
  }
  
  const inventory = bot.inventory;
  const items = inventory.items();
  
  if (items.length === 0) {
    console.log('背包中没有物品');
    bot.chat('背包中没有物品');
    return;
  }
  
  console.log(`开始丢弃 ${items.length} 个物品...`);
  bot.chat(`[StarBotMC] 开始丢弃 ${items.length} 个物品...`);
  
  let dropCount = 0;
  let index = 0;
  
  // 逐个丢弃物品
  function dropNextItem() {
    if (index >= items.length) {
      console.log(`已丢弃所有物品，共 ${dropCount} 个`);
      bot.chat(`[StarBotMC] 已丢弃所有物品，共 ${dropCount} 个`);
      return;
    }
    
    const item = items[index];
    if (item) {
      bot.tossStack(item).then(() => {
        dropCount++;
        console.log(`丢弃: ${item.name} x${item.count}`);
        index++;
        // 延迟一下再丢下一个，避免服务器限流
        setTimeout(dropNextItem, 100);
      }).catch((err) => {
        console.error(`丢弃 ${item.name} 失败:`, err.message);
        index++;
        setTimeout(dropNextItem, 100);
      });
    } else {
      index++;
      setTimeout(dropNextItem, 100);
    }
  }
  
  dropNextItem();
}

// 显示帮助信息
function showHelp(whisper) {
  const helpMessage = `
可用命令:
.help - 显示此帮助信息
.dc - 断开机器人连接
.drop - 丢弃所有物品
.drop <栏位> - 丢弃指定栏位的物品
.drop <栏位> <数量> - 丢弃指定栏位的指定数量物品
`;
  console.log(helpMessage);
  // if (bot) {
  //   bot.chat('帮助信息已显示在控制台');
  // }
  // 发送帮助信息到网页
  io.emit('chat_message', {
    username: 'StarBotMC',
    message: helpMessage
  });
  if (whisper) {
    bot.chat(`/minecraft:tell {config.player.owner} 正在准备发送帮助消息, 一秒一条`);
    let lines = helpMessage.split('\n');
    lines.forEach((line, index) => {
      setTimeout(() => {
        bot.chat(`/minecraft:tell ${config.player.owner} ${line}`);
      }, 1000 * index);
    });
  }
}

// 断开机器人连接
function disconnectBot() {
  console.log('断开机器人连接...');
  if (bot) {
    bot.end('手动断开连接');
  }
}

// 丢弃指定栏位的物品
function dropItem(slot, count) {
  if (!bot || !bot.inventory) {
    console.log('Bot未连接或背包不可用');
    return;
  }
  
  const inventory = bot.inventory;
  const item = inventory.slots[slot];
  
  if (!item) {
    console.log(`栏位 ${slot} 中没有物品`);
    bot.chat(`[StarBotMC] 栏位 ${slot} 中没有物品`);
    return;
  }
  
  if (count === undefined || count >= item.count) {
    // 丢弃整个物品堆
    bot.tossStack(item).then(() => {
      console.log(`已丢弃栏位 ${slot} 的 ${item.name} x${item.count}`);
      bot.chat(`[StarBotMC] 已丢弃栏位 ${slot} 的 ${item.name} x${item.count}`);
    }).catch((err) => {
      console.error(`丢弃物品失败:`, err.message);
      bot.chat(`[StarBotMC] 丢弃物品失败: ${err.message}`);
    });
  } else {
    // 丢弃指定数量
    bot.toss(item.type, null, count).then(() => {
      console.log(`已丢弃栏位 ${slot} 的 ${item.name} x${count}`);
      bot.chat(`[StarBotMC] 已丢弃栏位 ${slot} 的 ${item.name} x${count}`);
    }).catch((err) => {
      console.error(`丢弃物品失败:`, err.message);
      bot.chat(`[StarBotMC] 丢弃物品失败: ${err.message}`);
    });
  }
}

// 创建bot实例
function createBot() {
  // 如果已有bot，先结束
  if (bot) {
    bot.end();
  }

  // 确保配置存在
  if (!config.server) {
    console.error('[ERROR] 服务器配置缺失，请检查config.json文件');
    return;
  }

  // 获取当前账户
  const currentAccount = accountManager ? accountManager.getCurrentAccount() : config.player;

  bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: currentAccount.username,
    version: config.server.version,
    hideErrors: false,
    skipValidation: true
  });

  // 加载pathfinder插件
  bot.loadPlugin(pathfinder);

  // 初始化模块
  authManager = new AuthManager(bot, config);
  playerTracker = new PlayerTracker(bot, { ...config, io });

  // 设置事件监听
  setupBotEvents();

  return bot;
}

function webCmd(message, whisper=false, sender='') {
  // if (whisper !== true) {
  //   whisper = false;
  // }

  const isOwner = sender === config.player.owner;

  const command = message.split(' ')[0].toLowerCase();
  
  switch (command) {
    case '.help':
      if (isOwner && whisper) {
        showHelp(whisper);
        return 1;
      } else {bot.chat(`/minecraft:tell ${sender} 你没有权限！`);}
    case '.dc':
      if (isOwner && whisper) {
        bot.chat('[StarBotMC] 主人手动操作机器人断开连接。');
        disconnectBot();
        return 1;
      } else {bot.chat(`/minecraft:tell ${sender} 你没有权限！`);}
    case '.rc':
      if (isOwner && whisper) {
        bot.chat('[StarBotMC] 主人手动操作机器人重新连接。');
        reconnectManager.reconnectNow();
        return 1;
      } else {bot.chat(`/minecraft:tell ${sender} 你没有权限！`);}
    case '.stop':
      if (isOwner && whisper) {
        bot.chat('[StarBotMC] 主人手动关闭机器人，再见！');
        setTimeout(() => {
          reconnectManager.disableReconnect();
          disconnectBot();
          console.log('[StarBotMC] *用户手动关闭机器人')
          exit(0);
        }, 1000);
        return 1;
      } else {bot.chat(`/minecraft:tell ${sender} 你没有权限！`);}
    case '.drop':
      if (isOwner && whisper) {
        const argsdrop = message.split(' ').slice(1);
        if (argsdrop.length > 0) {
          const slot = parseInt(argsdrop[0]);
          const count = argsdrop.length > 1 ? parseInt(argsdrop[1]) : undefined;
          dropItem(slot, count);
        } else {
          dropAllItems();
        }
        return 1;
      } else {bot.chat(`/minecraft:tell ${sender} 你没有权限！`);}
    case '.say':
      if (isOwner && whisper) {
        const argssay = message.split(' ').slice(1);
        if (argssay.length > 0) {
          bot.chat(argssay.join(' '));
        }
        return 1;
      } else {bot.chat(`/minecraft:tell ${sender} 你没有权限！`);}
    default:
      if (isOwner && whisper) {
        io.emit('chat_message', {
          username: `StarBotMC -> ${sender}`,
          message: `未知命令: ${message}`
        });
        io.emit('chat_message', {
          username: `StarBotMC -> ${sender}`,
          message: `发送"."开头的消息请使用".say <消息>"命令。`
        });
        if (command.startsWith('.')) {
            bot.chat(`/minecraft:tell ${config.player.owner} 未知命令: ${message}`);
          setTimeout(() => {
            bot.chat(`/minecraft:tell ${config.player.owner} 发送"."开头的消息请使用".say <消息>"命令。`);
          }, 1000);
        };
        return false;
      } else {console.log(`[私信] ${sender} >>> ${message}`);return false;}
  }
}

function whisperCmd(message, sender='') {
  if (bot) {
    if (!webCmd(message, true, sender)) {
      bot.chat(`[StarBotMC] 收到 ${sender} 私信 >>> ${message}`);
    }
  }
}

// 设置bot事件
function setupBotEvents() {
  // 连接事件
  bot.on('login', () => {
    console.log('Bot已登录到服务器');
    isConnected = true; // 设置连接状态为true
    emptyPlayerListCount = 0; // 重置空列表计数器
    if (reconnectManager) {
      reconnectManager.onReconnectSuccess();
    }
  });

  // 错误事件
  bot.on('error', (err) => {
    const errorMsg = err.message || err.toString();
    
    if (errorMsg.includes('array size is abnormally large') || 
        errorMsg.includes('ERR_OUT_OF_RANGE') ||
        errorMsg.includes('offset') && errorMsg.includes('out of range')) {
      console.error('容器数据解析错误 (服务器自定义容器格式):', errorMsg);
      io.emit('chat_message', {
        username: 'StarBotMC',
        message: '§c检测到服务器自定义容器数据，连接可能不稳定'
      });
      return;
    }
    
    if (errorMsg.includes('Parse error')) {
      console.error('数据包解析错误:', errorMsg);
      return;
    }
    
    console.error('错误:', err);
    if (reconnectManager) {
      reconnectManager.handleError(err);
    }
  });

  // 断开连接事件
  bot.on('end', (reason) => {
    console.log(`连接结束: ${reason}`);
    isConnected = false; // 设置连接状态为false
    emptyPlayerListCount = 0; // 重置空列表计数器
    if (playerTracker) {
      playerTracker.stopTracking();
    }
    if (reconnectManager) {
      reconnectManager.handleDisconnect(reason);
    }
  });

  // 执行启动命令序列
  function executeStartupCommands() {
    if (config.startupCommands && config.startupCommands.length > 0) {
      console.log('开始执行启动命令序列...');
      
      let index = 0;
      function executeNextCommand() {
        if (index < config.startupCommands.length) {
          const command = config.startupCommands[index];
          console.log(`执行命令: ${command}`);
          bot.chat(command);
          index++;
          // 延迟1秒执行下一个命令，避免触发服务器防刷屏机制
          setTimeout(executeNextCommand, 1500);
        } else {
          console.log('启动命令序列执行完成');
        }
      }
      
      executeNextCommand();
    }
  }

  // 执行自动签到
  function executeSignin() {
    if (config.signin && config.signin.enabled && config.signin.command) {
      console.log(`执行自动签到: ${config.signin.command}`);
      bot.chat(config.signin.command);
    }
  }

  // 生成事件（当bot进入游戏世界时）
  bot.on('spawn', () => {
    console.log('Bot已在游戏世界中生成');
    console.log('已禁用随机走动功能');
    
    // 启动在线人员检测
    if (playerTracker) {
      playerTracker.startTracking();
    }
    
    // 强制更新玩家列表，确保数据完整
    forceUpdatePlayerList();
    
    // 更新背包数据
    updateInventory();
    
    // 执行启动命令序列（包含签到命令）
    executeStartupCommands();
  });

  // 跟随状态
  let isFollowing = false;
  let followTarget = null;

  // 聊天事件
  bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    
    console.log(`${username}: ${message}`);
    
    // 发送消息到网页界面
    io.emit('chat_message', { username, message });
    
    // 检查是否是所有者
    const isOwner = username === config.player.owner;
    
    // 处理命令
    if (message.startsWith('!')) {
      const command = message.substring(1).split(' ')[0].toLowerCase();
      
      if (isOwner) {
        switch (command) {
          case 'follow':
            isFollowing = true;
            followTarget = username;
            bot.chat(`[StarBotMC] 开始跟随 ${username}`);
            io.emit('chat_message', { username: bot.username, message: `开始跟随 ${username}` });
            startFollowing();
            break;
          case 'stop':
            isFollowing = false;
            followTarget = null;
            bot.chat('[StarBotMC] 已停止跟随');
            io.emit('chat_message', { username: bot.username, message: '已停止跟随' });
            break;
          case 'ai':
            bot.chat('[StarBotMC] AI功能已启用');
            io.emit('chat_message', { username: bot.username, message: 'AI功能已启用' });
            break;
          case 'switch':
            // 切换账户
            const nextAccount = accountManager.switchToNextAccount();
            if (nextAccount) {
              bot.chat(`[StarBotMC] 正在切换到账户: ${nextAccount.username}`);
              setTimeout(() => {
                createBot();
              }, 2000);
            }
            break;
          case 'accounts':
            // 列出所有账户
            const accounts = accountManager.listAccounts();
            bot.chat(`[StarBotMC] 共有 ${accounts.length} 个账户`);
            break;
          default:
            bot.chat(`[StarBotMC] 未知命令: !${command}`);
            io.emit('chat_message', { username: bot.username, message: `未知命令: !${command}` });
        }
      } else {
        bot.chat('[StarBotMC] 只有所有者可以执行命令');
        io.emit('chat_message', { username: bot.username, message: '只有所有者可以执行命令' });
      }
    }
  });

  // 开始跟随功能
  function startFollowing() {
    if (!isFollowing || !followTarget) return;
    
    const followInterval = setInterval(() => {
      if (!isFollowing || !followTarget) {
        clearInterval(followInterval);
        return;
      }
      
      const target = bot.players[followTarget];
      if (target && target.entity) {
        const targetPos = target.entity.position;
        const distance = bot.entity.position.distanceTo(targetPos);
        
        if (distance > 3) {
          try {
            if (bot.pathfinder && bot.pathfinder.goto) {
              bot.pathfinder.goto(new goals.GoalXZ(targetPos.x, targetPos.z)).catch((error) => {
                if (error.message !== 'The goal was changed before it could be completed!') {
                  console.error('跟随移动失败:', error.message);
                }
              });
            }
          } catch (error) {
            console.error('跟随失败:', error.message);
          }
        }
      }
    }, 1000);
  }

  // 死亡事件
  bot.on('death', () => {
    console.log('Bot死亡了，正在重生...');
    bot.chat("/home")
  });

  // 服务器消息事件（捕捉所有服务器发送的消息）
  bot.on('serverMessage', (message, position, sender) => {
    // 尝试获取发送者信息
    let senderInfo = '服务器';
    let senderDetails = null;
    
    if (sender) {
      if (sender.type === 'player') {
        senderInfo = sender.name || sender.username || sender.displayName || '玩家';
        senderDetails = {
          type: 'player',
          name: sender.name || sender.username || sender.displayName,
          uuid: sender.uuid,
          displayName: sender.displayName
        };
      } else if (sender.type === 'entity') {
        senderInfo = sender.name || sender.displayName || '实体';
        senderDetails = {
          type: 'entity',
          name: sender.name || sender.displayName
        };
      } else if (sender.type === 'system') {
        // 检测私聊消息格式: "xxx whisper to you: 消息"
        const whisperMatch = messageStr.match(/^(.*?) whispers to you: (.*)$/i);
        if (whisperMatch) {
          senderInfo = whisperMatch[1];
          senderDetails = {
            type: 'whisper',
            name: whisperMatch[1],
            message: whisperMatch[2]
          };
        } else if (messageStr.includes('whisper to')) {
          // 其他形式的私聊消息
          const whisperMatch2 = messageStr.match(/You whispers to (.*?): (.*)/i);
          if (whisperMatch2) {
            senderInfo = `我 -> ${whisperMatch2[1]}`;
            senderDetails = {
              type: 'whisper_sent (发送私信)',
              recipient: whisperMatch2[1],
              message: whisperMatch2[2]
            };
          }
        }
        // senderInfo = '系统';
        // senderDetails = {
        //   type: 'system'
        // };
      } else if (sender.username) {
        senderInfo = sender.username;
        senderDetails = {
          type: sender.type || '用户',
          username: sender.username
        };
      } else if (sender.name) {
        senderInfo = sender.name;
        senderDetails = {
          type: sender.type || '未知',
          name: sender.name
        };
      } else {
        // 尝试从消息内容中提取发送者
        const messageStr = message.toString();
        const senderMatch = messageStr.match(/\[(.*?)\]/);
        if (senderMatch) {
          senderInfo = senderMatch[1];
          senderDetails = {
            type: 'extracted',
            name: senderMatch[1]
          };
        } else {
          senderInfo = sender.type || '未知';
          senderDetails = {
            type: sender.type
          };
        }
      }
    } else {
      // 没有发送者信息时，尝试从消息内容中提取
      const messageStr = message.toString();
      
      // 检测私聊消息格式: "xxx whisper to you: 消息"
      const whisperMatch = messageStr.match(/^(.*?) whispers to you: (.*)$/i);
      if (whisperMatch) {
        senderInfo = whisperMatch[1];
        senderDetails = {
          type: 'whisper',
          name: whisperMatch[1],
          message: whisperMatch[2]
        };
      } else if (messageStr.includes('whisper to')) {
        // 其他形式的私聊消息
        const whisperMatch2 = messageStr.match(/You whispers to (.*?): (.*)/i);
        if (whisperMatch2) {
          senderInfo = `我 -> ${whisperMatch2[1]}`;
          senderDetails = {
            type: 'whisper_sent (发送私信)',
            recipient: whisperMatch2[1],
            message: whisperMatch2[2]
          };
        }
      } else {
        // 尝试从方括号中提取发送者
        const senderMatch = messageStr.match(/\[(.*?)\]/);
        if (senderMatch) {
          senderInfo = senderMatch[1];
          senderDetails = {
            type: 'extracted',
            name: senderMatch[1]
          };
        }
      }
    }
    
    console.log(`服务器消息 [${senderInfo}]: ${message}`);
    
    // 发送到网页界面，包含发送者信息
    io.emit('chat_message', { 
      username: senderInfo, 
      message: message.toString(),
      senderDetails: senderDetails
    });
    
    // 传递给认证管理器处理
    if (authManager) {
      authManager.handleMessage(message);
    }
  });

  // 聊天事件（确保所有聊天消息都输出到控制台）
  bot.on('message', (message, position, sender) => {
    // 尝试获取发送者信息
    let senderInfo = '系统';
    let senderDetails = null;
    
    messageStr = message.toString();

    // 检测私聊消息格式: "xxx whisper to you: 消息"
    const whisperMatch = messageStr.match(/^(.*?) whispers to you: (.*)$/i);
    if (whisperMatch) {
      senderInfo = whisperMatch[1];
      senderDetails = {
        type: 'whisper',
        name: whisperMatch[1],
        message: whisperMatch[2]
      };
    } else if (messageStr.includes('whisper to')) {
      // 其他形式的私聊消息
      const whisperMatch2 = messageStr.match(/You whispers to (.*?): (.*)/i);
      if (whisperMatch2) {
        senderInfo = `我 -> ${whisperMatch2[1]}`;
        senderDetails = {
          type: 'whisper_sent (发送私信)',
          recipient: whisperMatch2[1],
          message: whisperMatch2[2]
        };
      }
    }

    if (sender) {
      // 如果有发送者信息
      if (sender.type === 'player') {
        senderInfo = sender.name || sender.username || sender.displayName || '玩家';
        senderDetails = {
          type: 'player',
          name: sender.name || sender.username || sender.displayName,
          uuid: sender.uuid,
          displayName: sender.displayName
        };
      } else if (sender.type === 'entity') {
        senderInfo = sender.name || sender.displayName || '实体';
        senderDetails = {
          type: 'entity',
          name: sender.name || sender.displayName
        };
      } else if (sender.type === 'system') {
        senderInfo = '系统';
        senderDetails = {
          type: 'system'
        };
      } else if (sender.username) {
        // 处理其他有用户名的发送者
        senderInfo = sender.username;
        senderDetails = {
          type: sender.type || '用户',
          username: sender.username
        };
      } else if (sender.name) {
        // 处理有名称的发送者
        let senderName = sender.name;
        
        // 检查是否是UUID格式
        if (senderName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          // 尝试从bot.players中查找对应的用户名
          let foundUsername = null;
          for (const username in bot.players) {
            const player = bot.players[username];
            if (player && player.uuid === senderName) {
              foundUsername = username;
              break;
            }
          }
          
          // 如果找到了用户名，使用用户名；否则，尝试从消息内容中提取
          if (foundUsername) {
            senderName = foundUsername;
          } else {
            // 尝试从消息内容中提取发送者
            const messageStr = message.toString();
            const whisperMatch = messageStr.match(/^(.*?) whisper(s)? to you: (.*)$/i);
            if (whisperMatch) {
              senderName = whisperMatch[1];
            }
          }
        }
        
        senderInfo = senderName;
        senderDetails = {
          type: sender.type || '未知',
          name: senderName
        };
      } else {
        // 尝试从消息内容中提取发送者
        const messageStr = message.toString();
        const senderMatch = messageStr.match(/\[(.*?)\]/);
        if (senderMatch) {
          senderInfo = senderMatch[1];
          senderDetails = {
            type: 'extracted',
            name: senderMatch[1]
          };
        } else {
          senderInfo = sender.type || sender;
          senderDetails = {
            type: sender.type
          };
        }
      }
    } else {
      // 没有发送者信息时，尝试从消息内容中提取
      const messageStr = message.toString();
      
      // 检测私聊消息格式: "xxx whisper to you: 消息" 或 "xxx whispers to you: 消息"
      const whisperMatch = messageStr.match(/^(.*?) whisper(s)? to you: (.*)$/i);
      if (whisperMatch) {
        senderInfo = whisperMatch[1];
        senderDetails = {
          type: 'whisper',
          name: whisperMatch[1],
          message: whisperMatch[3]
        };
      } else if (messageStr.includes('whisper to')) {
        // 其他形式的私聊消息
        const whisperMatch2 = messageStr.match(/You whisper(s)? to (.*?): (.*)/i);
        if (whisperMatch2) {
          senderInfo = `我 -> ${whisperMatch2[1]}`;
          senderDetails = {
            type: 'whisper_sent (发送私信)',
            recipient: whisperMatch2[1],
            message: whisperMatch2[3]
          };
        }
      } else {
        // 尝试从方括号中提取发送者
        const senderMatch = messageStr.match(/\[(.*?)\]/);
        if (senderMatch) {
          senderInfo = senderMatch[1];
          senderDetails = {
            type: 'extracted',
            name: senderMatch[1]
          };
        }
      }
    }
    
    console.log(`消息 [${senderInfo}]: ${message}`);
    
    // 发送到网页界面，包含发送者信息
    io.emit('chat_message', { 
      username: senderInfo, 
      message: message.toString(),
      senderDetails: senderDetails
    });
    
    // 传递给认证管理器处理
    if (authManager) {
      authManager.handleMessage(message);
    }
  });

  // 玩家加入事件
  bot.on('playerJoined', (player) => {
    const message = `${player.username} 加入了游戏`;
    console.log(message);
    io.emit('chat_message', { username: '系统', message: message });
    
    // 发送玩家上线事件到网页
    io.emit('player_joined', {
      username: player.username,
      type: 'player'
    });
    
    // 更新玩家列表
    updatePlayerList();
  });

  // 玩家离开事件
  bot.on('playerLeft', (player) => {
    const message = `${player.username} 离开了游戏`;
    console.log(message);
    io.emit('chat_message', { username: '系统', message: message });
    
    // 发送玩家离开事件到网页
    io.emit('player_left', {
      username: player.username
    });
    
    // 更新玩家列表
    updatePlayerList();
  });

  // 聊天消息事件（更详细的聊天消息）
  bot.on('chat:message', (message) => {
    console.log(`聊天消息: ${message.text} (发送者: ${message.username || '未知'})`);
    
    // 发送到网页界面
    io.emit('chat_message', {
      username: message.username || '未知',
      message: message.text,
      senderDetails: {
        type: 'chat',
        username: message.username,
        messageType: message.type
      }
    });
  });

  // 消息字符串事件
  bot.on('messagestr', (message) => {
    if (message === '.github') {
      bot.chat('https://github.com/LzdqesjG/StarBotMC/');
      setTimeout(() =>{
        bot.chat('记得点个 Star ~');
      }, 1000)
    }

    //检测私聊消息格式: "xxx whisper to you: 消息"
    const whisperMatch = message.match(/^(.*?) whispers to you: (.*)$/i);
    if (whisperMatch) {
      // 发送到网页界面
      io.emit('chat_message', {
        username: `${whisperMatch[1]} to 我`,
        message: whisperMatch[2],
        senderDetails: {
          type: 'whisper (收到私信)'
        }
      });
      whisperCmd(whisperMatch[2], whisperMatch[1])
      return;
    } else if (message.includes('whisper to')) {
      // 其他形式的私聊消息
      const whisperMatch2 = message.match(/You whispers to (.*?): (.*)/i);
      if (whisperMatch2) {
        // 发送到网页界面
        io.emit('chat_message', {
          username: `我 -> ${whisperMatch2[1]}`,
          message: whisperMatch2[2],
          senderDetails: {
            type: 'whisper_sent (发送私信)'
          }
        });return;
      }
    }

    console.log(`消息字符串: ${message}`);
    
    // 发送到网页界面
    io.emit('chat_message', {
      username: '系统',
      message: message,
      senderDetails: {
        type: 'string (消息字符串)'
      }
    });
  });

  // 聊天事件（另一种格式）
  bot.on('chat', (username, message, messageType, rawMessage, messageObject) => {
    console.log(`聊天 [${username}]: ${message} (类型: ${messageType})`);
    
    // // 检测是否是其他玩家发送的 ".github" 消息
    // if (message === '.github' && username !== bot.username) {
    //   console.log(`检测到玩家 ${username} 请求 GitHub 链接`);
    //   setTimeout(() => {
    //     bot.chat('https://github.com/LzdqesjG/StarBotMC/');
    //     console.log('已发送 GitHub 链接');
    //   }, 500);
    // }
    
    // 发送到网页界面
    io.emit('chat_message', {
      username: username,
      message: message,
      senderDetails: {
        type: 'chat_event',
        messageType: messageType,
        rawMessage: rawMessage
      }
    });
  });

  // 原始消息事件
  bot.on('raw', (packet) => {
    if (packet && packet.data && packet.data.message) {
      console.log(`原始消息: ${packet.data.message}`);
      
      // 发送到网页界面
      io.emit('chat_message', {
        username: '原始',
        message: packet.data.message,
        senderDetails: {
          type: 'raw',
          packetType: packet.type
        }
      });
    }
  });

  // 容器打开事件
  bot.on('windowOpen', (window) => {
    console.log(`容器已打开: ${window.title} (类型: ${window.type}, 槽位数: ${window.slots.length})`);
    
    try {
      const containerData = {
        id: window.id,
        title: window.title,
        type: window.type,
        slots: window.slots.map((item, index) => {
          if (item) {
            return {
              slot: index,
              name: item.name,
              displayName: item.displayName,
              count: item.count,
              id: item.id,
              nbt: item.nbt
            };
          }
          return null;
        }).filter(item => item !== null)
      };
      
      io.emit('container_open', containerData);
    } catch (err) {
      console.error('处理容器数据时出错:', err);
    }
  });

  // 容器关闭事件
  bot.on('windowClose', () => {
    console.log('容器已关闭');
    io.emit('container_close');
  });

  // 容器更新事件
  bot.on('windowUpdate', (slot, oldItem, newItem) => {
    try {
      const updateData = {
        slot: slot,
        oldItem: oldItem ? {
          name: oldItem.name,
          displayName: oldItem.displayName,
          count: oldItem.count,
          id: oldItem.id
        } : null,
        newItem: newItem ? {
          name: newItem.name,
          displayName: newItem.displayName,
          count: newItem.count,
          id: newItem.id
        } : null
      };
      
      io.emit('container_update', updateData);
    } catch (err) {
      console.error('处理容器更新时出错:', err);
    }
  });
}

// 更新玩家列表并发送到网页
function updatePlayerList() {
  if (!bot) {
    console.log('Bot未初始化，无法更新玩家列表');
    return;
  }
  
  // 检查连接状态
  if (!isConnected) {
    console.log('Bot已断开连接，跳过玩家列表更新');
    reconnectManager.reconnectNow();
    return;
  }
  
  if (!bot.players) {
    console.log('玩家列表不可用，尝试重新获取...');
    emptyPlayerListCount++;
    
    // 如果连续多次玩家列表不可用，可能已断开连接
    if (emptyPlayerListCount >= 3) {
      console.log('连续多次无法获取玩家列表，可能已断开连接');
      isConnected = false;
      if (reconnectManager && config.reconnect && config.reconnect.enabled) {
        console.log('触发自动重连...');
        reconnectManager.reconnectNow();
      }
      return;
    }
    
    // 强制刷新玩家列表
    if (bot.connection) {
      bot.connection.write('players', {});
    }
    return;
  }
  
  const players = {};
  const playerNames = Object.keys(bot.players);
  
  if (playerNames.length === 0) {
    emptyPlayerListCount++;
    console.log(`玩家列表为空 (第${emptyPlayerListCount}次)，尝试重新获取...`);
    
    // 如果之前有玩家，现在突然为空，可能已断开连接
    if (lastPlayerCount > 0 && emptyPlayerListCount >= 2) {
      console.log('玩家数量突然变为0，可能已断开连接');
      isConnected = false;
      if (reconnectManager && config.reconnect && config.reconnect.enabled) {
        console.log('触发自动重连...');
        reconnectManager.reconnectNow();
      }
      return;
    }
    
    // 强制刷新玩家列表
    if (bot.connection) {
      bot.connection.write('players', {});
    }
  } else {
    // 玩家列表正常，重置计数器
    emptyPlayerListCount = 0;
    lastPlayerCount = playerNames.length;
  }
  
  playerNames.forEach(username => {
    const player = bot.players[username];
    if (player) {
      let distance = null;
      
      // 计算与机器人的距离
      if (player.entity && bot.entity) {
        const botPos = bot.entity.position;
        const playerPos = player.entity.position;
        distance = Math.sqrt(
          Math.pow(botPos.x - playerPos.x, 2) +
          Math.pow(botPos.y - playerPos.y, 2) +
          Math.pow(botPos.z - playerPos.z, 2)
        );
      }
      
      players[username] = {
        username: username,
        type: 'player',
        entity: player.entity ? '在线' : '离线',
        distance: distance,
        position: player.entity ? {
          x: player.entity.position.x,
          y: player.entity.position.y,
          z: player.entity.position.z
        } : null
      };
    }
  });
  
//   console.log(`更新玩家列表: ${Object.keys(players).length} 名玩家`);
  
  // 发送玩家列表到网页
  io.emit('player_list_update', { 
    players: players,
    timestamp: Date.now(),
    count: Object.keys(players).length
  });
}

// 立即更新玩家列表的函数
function forceUpdatePlayerList() {
  console.log('强制更新玩家列表...');
  updatePlayerList();
  
  // 3秒后再次更新，确保数据完整
  setTimeout(() => {
    updatePlayerList();
  }, 3000);
  
  // 5秒后再次更新，确保所有玩家都已加载
  setTimeout(() => {
    updatePlayerList();
  }, 5000);
}

// 初始化账户管理器
accountManager = new AccountManager(config);

// 初始化AI管理器
aiManager = new AIManager(config);
console.log('[AI] AI管理器已初始化，支持平台:', aiManager.getSupportedPlatforms().join(', '));

// 初始化重连管理器
reconnectManager = new ReconnectManager(config, createBot);
if (config.reconnect && config.reconnect.enabled) {
  reconnectManager.enableReconnect();
}
// 初始化重连管理器
reconnectManager = new ReconnectManager(config, createBot);
if (config.reconnect && config.reconnect.enabled) {
  reconnectManager.enableReconnect();
}

// 更新背包数据并发送到网页
function updateInventory() {
  if (!bot || !bot.inventory) {
    return;
  }
  
  const inventory = bot.inventory;
  const items = inventory.items();
  
  const inventoryData = {
    slots: inventory.slots,
    items: items.map(item => ({
      slot: item.slot,
      name: item.name,
      displayName: item.displayName,
      count: item.count,
      id: item.id,
      nbt: item.nbt
    }))
  };
  
  io.emit('inventory_update', inventoryData);
}

// 定期更新玩家列表
setInterval(() => {
  updatePlayerList();
  updateInventory();
}, 10000); // 每10秒更新一次

// 创建初始bot
console.log('Minecraft AI机器人已启动，正在连接到服务器...');
createBot();

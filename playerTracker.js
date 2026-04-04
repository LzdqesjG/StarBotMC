// 在线人员检测和特定人员提醒模块
class PlayerTracker {
  constructor(bot, config) {
    this.bot = bot;
    this.config = config;
    this.playerAlerts = config.playerAlerts || {};
    this.onlinePlayers = new Set();
    this.checkInterval = null;
    this.isChecking = false;
  }

  // 开始检测
  startTracking() {
    if (this.isChecking) return;
    
    this.isChecking = true;
    console.log('开始检测在线人员...');
    
    // 立即检测一次
    this.checkOnlinePlayers();
    
    // 定期检测
    const interval = this.config.playerCheckInterval || 10000; // 默认10秒
    this.checkInterval = setInterval(() => {
      this.checkOnlinePlayers();
    }, interval);
  }

  // 停止检测
  stopTracking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isChecking = false;
    console.log('已停止检测在线人员');
  }

  // 检测在线人员
  checkOnlinePlayers() {
    const currentPlayers = Object.keys(this.bot.players);
    const currentPlayersSet = new Set(currentPlayers);

    // 检测新上线的玩家
    for (const player of currentPlayersSet) {
      if (!this.onlinePlayers.has(player) && player !== this.bot.username) {
        console.log(`玩家上线: ${player}`);
        this.handlePlayerJoin(player);
      }
    }

    // 检测下线的玩家
    for (const player of this.onlinePlayers) {
      if (!currentPlayersSet.has(player)) {
        console.log(`玩家下线: ${player}`);
        this.handlePlayerLeave(player);
      }
    }

    // 更新在线玩家列表
    this.onlinePlayers = currentPlayersSet;
  }

  // 处理玩家上线
  handlePlayerJoin(username) {
    // 检查是否有特定提醒
    if (this.playerAlerts[username]) {
      const alert = this.playerAlerts[username];
      console.log(`检测到特定人员上线: ${username}`);
      
      // 发送提醒消息
      if (alert.message) {
        setTimeout(() => {
          this.bot.chat(alert.message);
          console.log(`发送提醒消息: ${alert.message}`);
        }, alert.delay || 1000);
      }

      // 执行命令
      if (alert.command) {
        setTimeout(() => {
          this.bot.chat(alert.command);
          console.log(`执行命令: ${alert.command}`);
        }, (alert.delay || 1000) + 500);
      }

      // 通知网页界面
      if (this.config.io) {
        this.config.io.emit('player_alert', {
          username: username,
          type: 'join',
          message: alert.message
        });
      }
    }
  }

  // 处理玩家下线
  handlePlayerLeave(username) {
    // 检查是否有特定提醒
    if (this.playerAlerts[username]) {
      const alert = this.playerAlerts[username];
      
      if (alert.leaveMessage) {
        console.log(`检测到特定人员下线: ${username}`);
        setTimeout(() => {
          this.bot.chat(alert.leaveMessage);
          console.log(`发送离线提醒: ${alert.leaveMessage}`);
        }, 1000);
      }
    }
  }

  // 添加特定人员提醒
  addPlayerAlert(username, alertConfig) {
    this.playerAlerts[username] = alertConfig;
    console.log(`已为 ${username} 添加提醒配置`);
  }

  // 移除特定人员提醒
  removePlayerAlert(username) {
    delete this.playerAlerts[username];
    console.log(`已移除 ${username} 的提醒配置`);
  }

  // 列出所有特定人员提醒
  listPlayerAlerts() {
    console.log('特定人员提醒列表:');
    Object.keys(this.playerAlerts).forEach(username => {
      const alert = this.playerAlerts[username];
      console.log(`  ${username}:`);
      console.log(`    上线消息: ${alert.message || '无'}`);
      console.log(`    离线消息: ${alert.leaveMessage || '无'}`);
      console.log(`    命令: ${alert.command || '无'}`);
    });
    return this.playerAlerts;
  }

  // 获取当前在线玩家
  getOnlinePlayers() {
    return Array.from(this.onlinePlayers);
  }

  // 检查特定玩家是否在线
  isPlayerOnline(username) {
    return this.onlinePlayers.has(username);
  }
}

module.exports = PlayerTracker;

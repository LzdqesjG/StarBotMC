// 自动重连模块
const mineflayer = require('mineflayer');

class ReconnectManager {
  constructor(config, createBotCallback) {
    this.config = config;
    this.createBotCallback = createBotCallback;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.reconnect ? config.reconnect.maxReconnectAttempts || 10 : 10;
    this.reconnectDelay = config.reconnect ? config.reconnect.reconnectDelay || 5000 : 5000; // 默认5秒
    this.isReconnecting = false;
    this.shouldReconnect = true;
    this.reconnectTimer = null;
  }

  // 设置重连配置
  setReconnectConfig(config) {
    this.maxReconnectAttempts = config.reconnect ? config.reconnect.maxReconnectAttempts || 10 : 10;
    this.reconnectDelay = config.reconnect ? config.reconnect.reconnectDelay || 5000 : 5000;
  }

  // 启用自动重连
  enableReconnect() {
    this.shouldReconnect = true;
    console.log('自动重连已启用');
  }

  // 禁用自动重连
  disableReconnect() {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    console.log('自动重连已禁用');
  }

  // 处理断开连接
  handleDisconnect(reason) {
    console.log(`连接断开: ${reason}`);
    
    if (this.shouldReconnect && !this.isReconnecting) {
      this.startReconnect();
    }
  }

  // 处理错误
  handleError(error) {
    console.error('连接错误:', error.message);
    
    // 检查是否是连接错误
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('disconnected') ||
        error.message.includes('connection')) {
      
      if (this.shouldReconnect && !this.isReconnecting) {
        this.startReconnect();
      }
    }
  }

  // 开始重连
  startReconnect() {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`已达到最大重连次数 (${this.maxReconnectAttempts})，停止重连`);
      this.isReconnecting = false;
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts; // 递增延迟
    
    console.log(`将在 ${delay/1000} 秒后尝试重连... (尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.performReconnect();
    }, delay);
  }

  // 执行重连
  performReconnect() {
    console.log('正在尝试重新连接...');
    
    try {
      // 调用创建bot的回调函数
      if (this.createBotCallback) {
        this.createBotCallback();
      }
    } catch (error) {
      console.error('重连失败:', error.message);
      this.isReconnecting = false;
      
      // 继续尝试重连
      if (this.shouldReconnect) {
        this.startReconnect();
      }
    }
  }

  // 重连成功
  onReconnectSuccess() {
    console.log('重连成功！');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.clearReconnectTimer();
  }

  // 清除重连定时器
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // 重置重连状态
  reset() {
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.clearReconnectTimer();
  }

  // 获取重连状态
  getStatus() {
    return {
      isReconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      shouldReconnect: this.shouldReconnect
    };
  }

  // 立即重连
  reconnectNow() {
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    this.performReconnect();
  }
}

module.exports = ReconnectManager;

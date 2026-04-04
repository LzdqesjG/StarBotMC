// 自动登录/注册模块
class AuthManager {
  constructor(bot, config) {
    this.bot = bot;
    this.config = config;
    this.auth = config.auth || {};
    this.isLoggedIn = false;
    this.isRegistered = false;
    this.loginAttempts = 0;
    this.maxLoginAttempts = 3;
  }

  // 处理服务器消息，检测登录/注册提示
  handleMessage(message) {
    const msg = message.toString().toLowerCase();
    const currentAccount = this.config.player;
    
    // 检测登录提示
    if (this.auth.autoLogin && this.auth.password) {
      const loginPatterns = [
        /login|登录|登陆/i,
        /please login|请登录/i,
        /authme|authentication/i,
        /password|密码/i
      ];
      
      for (const pattern of loginPatterns) {
        if (pattern.test(msg) && !this.isLoggedIn) {
          console.log('检测到登录提示，自动登录中...');
          this.autoLogin();
          return;
        }
      }
    }

    // 检测注册提示
    if (this.auth.autoRegister && this.auth.password) {
      const registerPatterns = [
        /register|注册/i,
        /please register|请注册/i,
        /create account|创建账户/i,
        /first time|首次/i
      ];
      
      for (const pattern of registerPatterns) {
        if (pattern.test(msg) && !this.isRegistered) {
          console.log('检测到注册提示，自动注册中...');
          this.autoRegister();
          return;
        }
      }
    }

    // 检测登录成功
    if (/login success|登录成功|welcome|欢迎/i.test(msg)) {
      this.isLoggedIn = true;
      this.loginAttempts = 0;
      console.log('登录成功！');
    }

    // 检测注册成功
    if (/register success|注册成功|account created|账户已创建/i.test(msg)) {
      this.isRegistered = true;
      console.log('注册成功！');
    }

    // 检测登录失败
    if (/login fail|登录失败|wrong password|密码错误/i.test(msg)) {
      this.loginAttempts++;
      console.log(`登录失败，尝试次数: ${this.loginAttempts}/${this.maxLoginAttempts}`);
      if (this.loginAttempts < this.maxLoginAttempts) {
        setTimeout(() => this.autoLogin(), 2000);
      }
    }
  }

  // 自动登录
  autoLogin() {
    if (this.auth.password) {
      setTimeout(() => {
        const loginCommand = this.auth.loginCommand || '/login';
        this.bot.chat(`${loginCommand} ${this.auth.password}`);
        console.log(`发送登录命令: ${loginCommand} ***`);
      }, 1000);
    }
  }

  // 自动注册
  autoRegister() {
    if (this.auth.password) {
      setTimeout(() => {
        const registerCommand = this.auth.registerCommand || '/register';
        this.bot.chat(`${registerCommand} ${this.auth.password} ${this.auth.password}`);
        console.log(`发送注册命令: ${registerCommand} *** ***`);
      }, 1000);
    }
  }

  // 手动登录
  manualLogin(password) {
    this.auth.password = password;
    this.autoLogin();
  }

  // 手动注册
  manualRegister(password) {
    this.auth.password = password;
    this.autoRegister();
  }

  // 重置登录状态
  reset() {
    this.isLoggedIn = false;
    this.isRegistered = false;
    this.loginAttempts = 0;
  }

  // 获取登录状态
  getStatus() {
    return {
      isLoggedIn: this.isLoggedIn,
      isRegistered: this.isRegistered,
      loginAttempts: this.loginAttempts
    };
  }
}

module.exports = AuthManager;

// 多账户管理模块
const fs = require('fs');

class AccountManager {
  constructor(config) {
    this.config = config;
    this.accounts = config.accounts || [];
    this.currentAccountIndex = config.currentAccountIndex || 0;
    this.currentAccount = this.accounts[this.currentAccountIndex] || config.player;
  }

  // 获取当前账户
  getCurrentAccount() {
    return this.currentAccount;
  }

  // 切换到指定账户
  switchAccount(index) {
    if (index >= 0 && index < this.accounts.length) {
      this.currentAccountIndex = index;
      this.currentAccount = this.accounts[index];
      console.log(`已切换到账户: ${this.currentAccount.username}`);
      return this.currentAccount;
    } else {
      console.error('账户索引无效');
      return null;
    }
  }

  // 切换到下一个账户
  switchToNextAccount() {
    const nextIndex = (this.currentAccountIndex + 1) % this.accounts.length;
    return this.switchAccount(nextIndex);
  }

  // 添加新账户
  addAccount(account) {
    this.accounts.push(account);
    this.saveAccounts();
    console.log(`已添加账户: ${account.username}`);
  }

  // 删除账户
  removeAccount(index) {
    if (index >= 0 && index < this.accounts.length) {
      const removed = this.accounts.splice(index, 1);
      this.saveAccounts();
      console.log(`已删除账户: ${removed[0].username}`);
      return true;
    }
    return false;
  }

  // 列出所有账户
  listAccounts() {
    console.log('账户列表:');
    this.accounts.forEach((account, index) => {
      const marker = index === this.currentAccountIndex ? ' (当前)' : '';
      console.log(`  ${index}: ${account.username}${marker}`);
    });
    return this.accounts;
  }

  // 保存账户配置
  saveAccounts() {
    this.config.accounts = this.accounts;
    this.config.currentAccountIndex = this.currentAccountIndex;
    fs.writeFileSync('config.json', JSON.stringify(this.config, null, 2));
  }

  // 获取账户数量
  getAccountCount() {
    return this.accounts.length;
  }
}

module.exports = AccountManager;

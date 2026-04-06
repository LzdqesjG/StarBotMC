// public/invhud.js
class InventoryHUD {
    constructor() {
        this.inventoryData = {};
        this.itemIcons = new Map(); // 缓存已加载的图标
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 监听背包数据更新
        window.addEventListener('inventory_update', (event) => {
            this.updateInventory(event.detail);
        });
    }

    /**
     * 更新背包数据
     * @param {Object} data - 背包数据
     */
    updateInventory(data) {
        this.inventoryData = data;
        this.renderInventory();
    }

    /**
     * 渲染背包物品到界面上
     */
    renderInventory() {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;

        inventoryList.innerHTML = '';

        if (!this.inventoryData.items || this.inventoryData.items.length === 0) {
            inventoryList.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">背包为空</div>';
            document.getElementById('inventory-count').textContent = '0/36';
            return;
        }

        // 更新物品计数
        document.getElementById('inventory-count').textContent = `${this.inventoryData.items.length} / 36`;

        // 按槽位排序
        const sortedItems = [...this.inventoryData.items].sort((a, b) => a.slot - b.slot);

        sortedItems.forEach((item, index) => {
            const itemElement = this.createItemElement(item);
            inventoryList.appendChild(itemElement);
        });
    }

    /**
     * 创建单个物品元素
     * @param {Object} item - 物品对象
     * @returns {HTMLElement} - 物品元素
     */
    createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';

        // 获取物品图标
        const iconElement = this.getItemIcon(item.name, item.displayName);
        const itemName = item.displayName || item.name || 'Unknown Item';
        const itemId = item.name || 'unknown';
        const itemCount = item.count || 0;

        itemElement.innerHTML = `
            <div class="inventory-item-header">
                <span class="item-name">${itemName}</span>
                <span class="item-count">${itemCount}</span>
            </div>
            <div class="item-id">${itemId}</div>
            <div class="item-slot">槽位: ${item.slot}</div>
        `;

        // 插入图标到最前面
        const iconWrapper = document.createElement('div');
        iconWrapper.style.display = 'flex';
        iconWrapper.style.alignItems = 'center';
        iconWrapper.style.marginBottom = '5px';
        iconWrapper.appendChild(iconElement.cloneNode(true));
        
        // 重新构建内容
        itemElement.innerHTML = '';
        itemElement.appendChild(iconWrapper);
        itemElement.insertAdjacentHTML('beforeend', `
            <div class="inventory-item-header">
                <span class="item-name">${itemName}</span>
                <span class="item-count">${itemCount}</span>
            </div>
            <div class="item-id">${itemId}</div>
            <div class="item-slot">槽位: ${item.slot}</div>
        `);

        // 添加点击事件
        itemElement.addEventListener('click', () => {
            this.selectItem(item);
        });

        return itemElement;
    }

    /**
     * 获取物品图标
     * @param {string} itemName - 物品名称
     * @param {string} displayName - 显示名称
     * @returns {HTMLImageElement} - 图标元素
     */
    getItemIcon(itemName, displayName) {
        // 检查缓存
        if (this.itemIcons.has(itemName)) {
            return this.itemIcons.get(itemName);
        }

        // 创建图标元素
        const icon = document.createElement('img');
        icon.style.width = '24px';
        icon.style.height = '24px';
        icon.style.marginRight = '8px';
        icon.style.verticalAlign = 'middle';
        icon.alt = itemName || 'Unknown Item';

        // 查找路径优先级: item -> block -> fallback to text
        const itemPath = `/assets/item/${itemName}.png`;
        const blockPath = `/assets/block/${itemName}.png`;
        const displayNameClean = displayName ? this.cleanDisplayName(displayName) : null;
        const displayNamePath = displayNameClean ? `/assets/item/${displayNameClean}.png` : null;
        const displayNameBlockPath = displayNameClean ? `/assets/block/${displayNameClean}.png` : null;

        // 尝试按优先级加载图片
        this.tryLoadImage(icon, [
            itemPath,
            displayNamePath,
            blockPath,
            displayNameBlockPath
        ], itemName, () => {
            // 如果所有图片都加载失败，显示文本替代
            this.setFallbackText(icon, itemName);
        });

        // 缓存图标
        this.itemIcons.set(itemName, icon);

        return icon;
    }

    /**
     * 尝试加载一系列图片
     * @param {HTMLImageElement} imgElement - 图片元素
     * @param {Array<string>} paths - 图片路径数组
     * @param {string} fallbackId - 备用ID
     * @param {Function} onError - 所有图片加载失败时的回调
     */
    tryLoadImage(imgElement, paths, fallbackId, onError) {
        let loaded = false;
        let attempts = 0;

        const loadNext = () => {
            if (loaded || attempts >= paths.length) {
                if (!loaded) {
                    onError();
                }
                return;
            }

            const currentPath = paths[attempts];
            attempts++;

            if (!currentPath) {
                loadNext();
                return;
            }

            // 创建临时图片对象来测试加载
            const testImg = new Image();
            testImg.onload = () => {
                if (!loaded) {
                    loaded = true;
                    imgElement.src = currentPath;
                    imgElement.style.display = 'block';
                }
            };
            testImg.onerror = () => {
                loadNext(); // 尝试下一个路径
            };
            testImg.src = currentPath;
        };

        loadNext();
    }

    /**
     * 设置备用文本显示
     * @param {HTMLImageElement} imgElement - 图片元素
     * @param {string} itemId - 物品ID
     */
    setFallbackText(imgElement, itemId) {
        // 创建一个带有文字的canvas作为备用
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        
        // 绘制背景
        ctx.fillStyle = '#666';
        ctx.fillRect(0, 0, 24, 24);
        
        // 绘制边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 24, 24);
        
        // 绘制文字（截取ID的前几个字符）
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const shortId = itemId.substring(0, 3).toUpperCase();
        ctx.fillText(shortId, 12, 12);
        
        imgElement.src = canvas.toDataURL();
        imgElement.style.display = 'block';
    }

    /**
     * 清理显示名称，移除颜色代码等特殊字符
     * @param {string} displayName - 显示名称
     * @returns {string} - 清理后的名称
     */
    cleanDisplayName(displayName) {
        // 移除Minecraft颜色代码（§x格式）
        let cleaned = displayName.replace(/§./g, '');
        
        // 移除其他特殊字符，只保留字母、数字、下划线和连字符
        cleaned = cleaned.replace(/[^a-zA-Z0-9_\- ]/g, '_');
        
        // 替换空格为下划线
        cleaned = cleaned.replace(/\s+/g, '_');
        
        // 转换为小写（Minecraft资源通常为小写）
        cleaned = cleaned.toLowerCase();
        
        return cleaned;
    }

    /**
     * 选择物品事件
     * @param {Object} item - 选中的物品
     */
    selectItem(item) {
        console.log('选中物品:', item);
        
        // 可以扩展更多交互功能
        // 例如：显示详细信息、操作选项等
        this.showItemDetails(item);
    }

    /**
     * 显示物品详情
     * @param {Object} item - 物品对象
     */
    showItemDetails(item) {
        // 如果有NBT数据，显示更多信息
        if (item.nbt) {
            console.log('物品NBT数据:', item.nbt);
            
            // 在界面上显示NBT数据（如果有的话）
            const nbtContainer = document.querySelector('.nbt-container');
            if (nbtContainer) {
                nbtContainer.textContent = JSON.stringify(item.nbt, null, 2);
            }
        }
    }

    /**
     * 获取物品数量统计
     * @returns {number} - 物品总数
     */
    getTotalItemCount() {
        if (!this.inventoryData.items) return 0;
        return this.inventoryData.items.reduce((total, item) => total + (item.count || 0), 0);
    }

    /**
     * 根据物品名称查找物品
     * @param {string} name - 物品名称
     * @returns {Array} - 匹配的物品数组
     */
    findItemsByName(name) {
        if (!this.inventoryData.items) return [];
        return this.inventoryData.items.filter(item => 
            item.name === name || (item.displayName && item.displayName.toLowerCase().includes(name.toLowerCase()))
        );
    }
}

// 初始化InventoryHUD实例
let inventoryHUD;

// 确保DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    inventoryHUD = new InventoryHUD();
});

// 如果已经存在window对象（浏览器环境），则导出类
if (typeof window !== 'undefined') {
    window.InventoryHUD = InventoryHUD;
    window.inventoryHUD = inventoryHUD;
}

// 如果在Node.js环境中，也提供导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryHUD;
}
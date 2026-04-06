// public/invhud.js
// 背包图标HUD显示模块
class InventoryHUD {
    constructor() {
        this.inventoryData = {};
        this.itemIcons = new Map(); // 缓存已加载的图标
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
        const itemPath = `../assets/item/${itemName}.png`;
        const blockPath = `../assets/block/${itemName}.png`;
        const displayNameClean = displayName ? this.cleanDisplayName(displayName) : null;
        const displayNamePath = displayNameClean ? `../assets/item/${displayNameClean}.png` : null;
        const displayNameBlockPath = displayNameClean ? `../assets/block/${displayNameClean}.png` : null;

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
        
        const shortId = itemId ? itemId.substring(0, 3).toUpperCase() : '?';
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
}

// 初始化InventoryHUD实例
let inventoryHUD;

// 确保DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    inventoryHUD = new InventoryHUD();
});
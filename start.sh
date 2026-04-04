#!/bin/bash

# StarBotMC - Minecraft AI Bot 启动脚本

echo "========================================"
echo "  StarBotMC - Minecraft AI Bot"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js 16.0 或更高版本"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查配置文件是否存在
if [ ! -f "config.json" ]; then
    echo "[警告] 未找到 config.json 配置文件"
    echo ""
    echo "正在从 config_template.json 创建配置文件..."
    cp config_template.json config.json
    echo ""
    echo "[重要] 请编辑 config.json 文件，填入你的配置信息"
    echo "配置完成后，重新运行此脚本"
    echo ""
    exit 1
fi

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "[信息] 未检测到 node_modules，正在安装依赖..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
    echo ""
    echo "[成功] 依赖安装完成"
    echo ""
fi

echo "[信息] 正在启动 StarBotMC..."
echo ""
echo "========================================"
echo "  Web 控制面板地址: http://localhost:3000"
echo "========================================"
echo ""

# 启动机器人
node index.js

# 如果程序异常退出，显示错误信息
if [ $? -ne 0 ]; then
    echo ""
    echo "[错误] 程序异常退出"
fi

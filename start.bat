@echo off
chcp 65001 >nul
title StarBotMC - Minecraft AI Bot

echo ========================================
echo   StarBotMC - Minecraft AI Bot
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 16.0 或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查配置文件是否存在
if not exist "config.json" (
    echo [警告] 未找到 config.json 配置文件
    echo.
    echo 正在从 config_template.json 创建配置文件...
    copy config_template.json config.json >nul
    echo.
    echo [重要] 请编辑 config.json 文件，填入你的配置信息
    echo 配置完成后，重新运行此脚本
    echo.
    pause
    exit /b 1
)

REM 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo [信息] 未检测到 node_modules，正在安装依赖...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo.
    echo [成功] 依赖安装完成
    echo.
)

echo [信息] 正在启动 StarBotMC...
echo.
echo ========================================
echo   Web 控制面板地址: http://localhost:3000
echo ========================================
echo.

REM 启动机器人
node index.js

REM 如果程序异常退出，暂停以查看错误信息
if %errorlevel% neq 0 (
    echo.
    echo [错误] 程序异常退出，错误代码: %errorlevel%
    pause
)

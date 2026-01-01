#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 🛑 OSC Interactive Performance System - Stop All
# ═══════════════════════════════════════════════════════════════════

# 获取脚本所在目录 / Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 读取语言设置 / Read language setting
LANG_FILE="$SCRIPT_DIR/.lang"
if [ -f "$LANG_FILE" ]; then
  LANG_CHOICE=$(cat "$LANG_FILE")
else
  LANG_CHOICE="en"
fi

# i18n text definitions
if [ "$LANG_CHOICE" = "zh" ]; then
  TXT_STOPPING="停止所有 OSC 服务器..."
  TXT_STOP_PERFORMER="停止演员系统"
  TXT_STOP_AUDIENCE="停止观众系统"
  TXT_STOP_TUNNEL="停止 Cloudflare Tunnel"
  TXT_CLEAN_CLOUDFLARED="清理 cloudflared 进程..."
  TXT_CLEAN_CPOLAR="清理 cpolar 进程..."
  TXT_CLEAN_PORTS="清理所有端口占用..."
  TXT_CLEAN_PORT="清理端口"
  TXT_ALL_STOPPED="所有服务器已停止"
else
  TXT_STOPPING="Stopping all OSC servers..."
  TXT_STOP_PERFORMER="Stopping performer system"
  TXT_STOP_AUDIENCE="Stopping audience system"
  TXT_STOP_TUNNEL="Stopping Cloudflare Tunnel"
  TXT_CLEAN_CLOUDFLARED="Cleaning cloudflared processes..."
  TXT_CLEAN_CPOLAR="Cleaning cpolar processes..."
  TXT_CLEAN_PORTS="Cleaning all port occupations..."
  TXT_CLEAN_PORT="Cleaning port"
  TXT_ALL_STOPPED="All servers stopped"
fi

echo "🛑 $TXT_STOPPING"
echo ""

# 从 PID 文件读取并停止 / Stop from PID files
if [ -f .pids/performer1.pid ]; then
  PID1=$(cat .pids/performer1.pid)
  if ps -p $PID1 > /dev/null 2>&1; then
    echo "$TXT_STOP_PERFORMER (PID: $PID1)..."
    kill -9 $PID1 2>/dev/null
  fi
  rm -f .pids/performer1.pid
fi

if [ -f .pids/audience.pid ]; then
  PID2=$(cat .pids/audience.pid)
  if ps -p $PID2 > /dev/null 2>&1; then
    echo "$TXT_STOP_AUDIENCE (PID: $PID2)..."
    kill -9 $PID2 2>/dev/null
  fi
  rm -f .pids/audience.pid
fi

# 停止 Cloudflare Tunnel / Stop Cloudflare Tunnel
if [ -f .pids/tunnel.pid ]; then
  TUNNEL_PID=$(cat .pids/tunnel.pid)
  if ps -p $TUNNEL_PID > /dev/null 2>&1; then
    echo "$TXT_STOP_TUNNEL (PID: $TUNNEL_PID)..."
    kill -9 $TUNNEL_PID 2>/dev/null
  fi
  rm -f .pids/tunnel.pid
fi

# 清理所有 cloudflared 进程 / Clean cloudflared processes
CLOUDFLARED_PIDS=$(pgrep -f "cloudflared tunnel" 2>/dev/null)
if [ ! -z "$CLOUDFLARED_PIDS" ]; then
  echo "$TXT_CLEAN_CLOUDFLARED"
  echo "$CLOUDFLARED_PIDS" | xargs kill -9 2>/dev/null
fi

# 清理所有 cpolar 进程 / Clean cpolar processes
CPOLAR_PIDS=$(pgrep -f "cpolar http" 2>/dev/null)
if [ ! -z "$CPOLAR_PIDS" ]; then
  echo "$TXT_CLEAN_CPOLAR"
  echo "$CPOLAR_PIDS" | xargs kill -9 2>/dev/null
fi

# 强制清理所有可能的端口占用 / Force clean all port occupations
echo ""
echo "🧹 $TXT_CLEAN_PORTS"

# 清理端口 3000 / Clean port 3000
PORT_3000_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_3000_PIDS" ]; then
  echo "$TXT_CLEAN_PORT 3000..."
  echo "$PORT_3000_PIDS" | xargs kill -9 2>/dev/null
fi

# 清理端口 3001 / Clean port 3001
PORT_3001_PIDS=$(lsof -ti:3001 2>/dev/null)
if [ ! -z "$PORT_3001_PIDS" ]; then
  echo "$TXT_CLEAN_PORT 3001..."
  echo "$PORT_3001_PIDS" | xargs kill -9 2>/dev/null
fi

# 清理端口 3002 / Clean port 3002
PORT_3002_PIDS=$(lsof -ti:3002 2>/dev/null)
if [ ! -z "$PORT_3002_PIDS" ]; then
  echo "$TXT_CLEAN_PORT 3002..."
  echo "$PORT_3002_PIDS" | xargs kill -9 2>/dev/null
fi

sleep 1

echo ""
echo "✅ $TXT_ALL_STOPPED"
echo ""

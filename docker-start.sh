#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 🐳 OSC Interactive Performance System - Docker Launcher
# ═══════════════════════════════════════════════════════════════════

# 颜色定义 / Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'

# 获取脚本所在目录 / Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ═══════════════════════════════════════════════════════════════════
# 🌍 Language Selection / 语言选择
# ═══════════════════════════════════════════════════════════════════

# Check saved language preference
LANG_FILE="$SCRIPT_DIR/.lang"
if [ -f "$LANG_FILE" ]; then
  LANG_CHOICE=$(cat "$LANG_FILE")
else
  LANG_CHOICE=""
fi

# Language selection function
select_language() {
  clear
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}                    🌍 Language / 语言                      ${CYAN}║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${CYAN}1)${NC} English (Default)"
  echo -e "  ${CYAN}2)${NC} 中文"
  echo ""
  read -p "  Select / 选择 [1/2]: " lang_input < /dev/tty
  
  case $lang_input in
    2|zh|ZH|中文)
      LANG_CHOICE="zh"
      ;;
    *)
      LANG_CHOICE="en"
      ;;
  esac
  
  # Save language preference
  echo "$LANG_CHOICE" > "$LANG_FILE"
}

# If no language preference, ask user
if [ -z "$LANG_CHOICE" ]; then
  select_language
fi

# ═══════════════════════════════════════════════════════════════════
# 🌍 i18n Text Definitions
# ═══════════════════════════════════════════════════════════════════

if [ "$LANG_CHOICE" = "zh" ]; then
  # Chinese texts
  TXT_TITLE="OSC 交互演出系统 - Docker 部署"
  TXT_SINGLE_MODE="单机模式（需要高性能电脑）"
  TXT_LOCAL_PERF="本地演出模式"
  TXT_LOCAL_DESC="观众需连同一WiFi"
  TXT_PUBLIC_CLOUDFLARE="公网模式"
  TXT_PUBLIC_CPOLAR="公网模式"
  TXT_LATENCY_ABROAD="延迟: 50-150ms(欧洲) / 700ms+(中国)"
  TXT_LATENCY_CHINA="延迟: 50-200ms | 国内访问更快"
  TXT_DUAL_MODE="双机模式（两台电脑，性能要求低）"
  TXT_VISUAL_LOCAL="视觉机 - 本地观众"
  TXT_VISUAL_CLOUDFLARE="视觉机 - 公网观众"
  TXT_VISUAL_CPOLAR="视觉机 - 公网观众"
  TXT_FOR_ABROAD="适合国外演出"
  TXT_FOR_CHINA="适合国内演出"
  TXT_MANAGEMENT="管理"
  TXT_VIEW_STATUS="查看状态"
  TXT_VIEW_LOGS="查看日志"
  TXT_REBUILD="重新构建"
  TXT_CONFIG_CPOLAR="配置 cpolar authtoken"
  TXT_CONFIG_MIRROR="配置镜像加速器"
  TXT_CHINA_USERS="中国用户必看"
  TXT_STOP_ALL="停止所有服务"
  TXT_CHANGE_LANG="切换语言"
  TXT_EXIT="退出"
  TXT_SELECT="请选择"
  TXT_PRESS_ENTER="按回车键返回菜单..."
  TXT_GOODBYE="再见！"
  TXT_INVALID="无效选项"
  TXT_DOCKER_NOT_INSTALLED="Docker 未安装"
  TXT_DOCKER_NOT_RUNNING="Docker 未运行"
  TXT_PLEASE_START_DOCKER="请先启动 Docker Desktop"
  TXT_STARTING="启动中..."
  TXT_STARTED="已启动！"
  TXT_ACCESS_URLS="访问地址"
  TXT_PERFORMER_SYSTEM="演员系统"
  TXT_AUDIENCE_SYSTEM="观众系统"
  TXT_LOCAL_IP="本机 IP"
  TXT_MAXMSP_CONFIG="Max MSP（在本机运行）"
  TXT_START_LOCAL="启动本地演出模式..."
  TXT_LOCAL_STARTED="本地演出模式已启动！"
  TXT_START_PUBLIC="启动公网模式..."
  TXT_PUBLIC_STARTED="公网模式已启动！"
  TXT_START_CPOLAR="启动 cpolar 国内公网模式..."
  TXT_CPOLAR_STARTED="cpolar 国内公网模式已启动！"
  TXT_START_VISUAL="启动视觉机模式..."
  TXT_VISUAL_STARTED="视觉机已启动！"
  TXT_START_VISUAL_CF="启动视觉机模式 + 公网观众 [Cloudflare]..."
  TXT_VISUAL_CF_STARTED="视觉机 + 公网观众已启动！"
  TXT_START_VISUAL_CP="启动视觉机模式 + 公网观众 [cpolar 国内]..."
  TXT_VISUAL_CP_STARTED="视觉机 + cpolar 国内公网已启动！"
  TXT_STOP_SERVICES="停止所有服务..."
  TXT_OPEN_BROWSER="打开分屏浏览器..."
  TXT_OPEN_PAGE="打开页面..."
  TXT_BROWSER_OPENED="已打开浏览器窗口"
  TXT_MONITOR_OPENED="已打开监控面板"
else
  # English texts (default)
  TXT_TITLE="OSC Interactive Performance - Docker Deploy"
  TXT_SINGLE_MODE="Single Machine Mode (High-end PC Required)"
  TXT_LOCAL_PERF="Local Performance Mode"
  TXT_LOCAL_DESC="Audience must join same WiFi"
  TXT_PUBLIC_CLOUDFLARE="Public Mode"
  TXT_PUBLIC_CPOLAR="Public Mode"
  TXT_LATENCY_ABROAD="Latency: 50-150ms(EU) / 700ms+(China)"
  TXT_LATENCY_CHINA="Latency: 50-200ms | Faster in China"
  TXT_DUAL_MODE="Dual Machine Mode (Two PCs, Lower Requirements)"
  TXT_VISUAL_LOCAL="Visual Machine - Local Audience"
  TXT_VISUAL_CLOUDFLARE="Visual Machine - Public Audience"
  TXT_VISUAL_CPOLAR="Visual Machine - Public Audience"
  TXT_FOR_ABROAD="For international venues"
  TXT_FOR_CHINA="For China venues"
  TXT_MANAGEMENT="Management"
  TXT_VIEW_STATUS="View Status"
  TXT_VIEW_LOGS="View Logs"
  TXT_REBUILD="Rebuild"
  TXT_CONFIG_CPOLAR="Configure cpolar authtoken"
  TXT_CONFIG_MIRROR="Configure Mirror Accelerator"
  TXT_CHINA_USERS="Essential for China users"
  TXT_STOP_ALL="Stop All Services"
  TXT_CHANGE_LANG="Change Language"
  TXT_EXIT="Exit"
  TXT_SELECT="Select"
  TXT_PRESS_ENTER="Press Enter to return..."
  TXT_GOODBYE="Goodbye!"
  TXT_INVALID="Invalid option"
  TXT_DOCKER_NOT_INSTALLED="Docker not installed"
  TXT_DOCKER_NOT_RUNNING="Docker not running"
  TXT_PLEASE_START_DOCKER="Please start Docker Desktop first"
  TXT_STARTING="Starting..."
  TXT_STARTED="Started!"
  TXT_ACCESS_URLS="Access URLs"
  TXT_PERFORMER_SYSTEM="Performer System"
  TXT_AUDIENCE_SYSTEM="Audience System"
  TXT_LOCAL_IP="Local IP"
  TXT_MAXMSP_CONFIG="Max MSP (Run on Host)"
  TXT_START_LOCAL="Starting local performance mode..."
  TXT_LOCAL_STARTED="Local performance mode started!"
  TXT_START_PUBLIC="Starting public mode..."
  TXT_PUBLIC_STARTED="Public mode started!"
  TXT_START_CPOLAR="Starting cpolar China public mode..."
  TXT_CPOLAR_STARTED="cpolar China public mode started!"
  TXT_START_VISUAL="Starting visual machine mode..."
  TXT_VISUAL_STARTED="Visual machine started!"
  TXT_START_VISUAL_CF="Starting visual machine + public audience [Cloudflare]..."
  TXT_VISUAL_CF_STARTED="Visual machine + public audience started!"
  TXT_START_VISUAL_CP="Starting visual machine + public audience [cpolar China]..."
  TXT_VISUAL_CP_STARTED="Visual machine + cpolar China public started!"
  TXT_STOP_SERVICES="Stopping all services..."
  TXT_OPEN_BROWSER="Opening split-screen browsers..."
  TXT_OPEN_PAGE="Opening page..."
  TXT_BROWSER_OPENED="Browser windows opened"
  TXT_MONITOR_OPENED="Monitor panel opened"
fi

# 检查 Docker 是否安装 / Check if Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ ${TXT_DOCKER_NOT_INSTALLED}${NC}"
    echo ""
    echo "  macOS: brew install --cask docker"
    echo "  https://www.docker.com/products/docker-desktop"
    exit 1
  fi
  
  if ! docker info &> /dev/null; then
    echo -e "${RED}❌ ${TXT_DOCKER_NOT_RUNNING}${NC}"
    echo ""
    echo "${TXT_PLEASE_START_DOCKER}"
    exit 1
  fi
}

# 智能构建（带错误检测和重试）
smart_build() {
  local compose_files="$1"
  local max_retries=2
  local retry=0
  
  while [ $retry -lt $max_retries ]; do
    echo ""
    if [ $retry -gt 0 ]; then
      echo -e "${YELLOW}🔄 第 $((retry + 1)) 次尝试...${NC}"
    fi
    
    # 执行构建，捕获输出
    BUILD_OUTPUT=$(docker-compose $compose_files up -d --build 2>&1)
    BUILD_EXIT_CODE=$?
    
    echo "$BUILD_OUTPUT"
    
    # 检查是否成功
    if [ $BUILD_EXIT_CODE -eq 0 ]; then
      return 0
    fi
    
    # 检查是否是网络问题（Docker Hub 连接失败）
    if echo "$BUILD_OUTPUT" | grep -qE "(connection reset by peer|timeout|failed to fetch|auth.docker.io|registry-1.docker.io)"; then
      echo ""
      echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${RED}  ❌ Docker Hub 连接失败${NC}"
      echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo ""
      echo -e "${YELLOW}这是因为无法从 Docker Hub 下载基础镜像。${NC}"
      echo -e "${YELLOW}在中国大陆，这种情况很常见。${NC}"
      echo ""
      echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${WHITE}  🚀 解决方案${NC}"
      echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo ""
      echo -e "  ${CYAN}方案 1: 配置镜像加速器（推荐）${NC}"
      echo -e "     运行: ${GREEN}./docker-mirror-setup.sh${NC}"
      echo ""
      echo -e "  ${CYAN}方案 2: 使用 VPN 或科学上网${NC}"
      echo -e "     确保 Docker Desktop 可以访问外网"
      echo ""
      echo -e "  ${CYAN}方案 3: 多次重试${NC}"
      echo -e "     有时网络波动，多试几次可能成功"
      echo ""
      echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo ""
      
      echo -e "${CYAN}现在要做什么？${NC}"
      echo ""
      echo "  1) 🔄 重试构建"
      echo "  2) ⚙️ 运行镜像加速器配置"
      echo "  3) 🚪 返回菜单"
      echo ""
      read -p "选择 [1-3]: " fix_choice < /dev/tty
      
      case $fix_choice in
        1)
          retry=$((retry + 1))
          continue
          ;;
        2)
          ./docker-mirror-setup.sh
          echo ""
          echo -e "${YELLOW}配置完成后，请重启 Docker Desktop，然后重新运行此脚本。${NC}"
          read -p "按回车键返回菜单..." < /dev/tty
          return 1
          ;;
        *)
          return 1
          ;;
      esac
    else
      # 其他错误，直接显示
      echo ""
      echo -e "${RED}❌ 构建失败${NC}"
      read -p "按回车键返回菜单..." < /dev/tty
      return 1
    fi
  done
  
  return 1
}

# 显示 Logo / Show Logo
show_logo() {
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}     🐳 ${WHITE}${TXT_TITLE}${NC}                 ${CYAN}║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# 显示菜单 / Show Menu
show_menu() {
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🚀 ${TXT_SINGLE_MODE}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${CYAN}1)${NC} 🎭 ${TXT_LOCAL_PERF}"
  echo -e "     ${WHITE}${TXT_LOCAL_DESC}${NC}"
  echo ""
  echo -e "  ${CYAN}2)${NC} 🌐 ${TXT_PUBLIC_CLOUDFLARE} ${GREEN}[Cloudflare]${NC}"
  echo -e "     ${WHITE}${TXT_LATENCY_ABROAD}${NC}"
  echo ""
  echo -e "  ${CYAN}3)${NC} 🇨🇳 ${TXT_PUBLIC_CPOLAR} ${YELLOW}[cpolar]${NC}"
  echo -e "     ${WHITE}${TXT_LATENCY_CHINA}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🖥️🖥️ ${TXT_DUAL_MODE}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${CYAN}4)${NC} 👁️ ${TXT_VISUAL_LOCAL}"
  echo -e "     ${WHITE}${TXT_LOCAL_DESC}${NC}"
  echo ""
  echo -e "  ${CYAN}5)${NC} 🌐 ${TXT_VISUAL_CLOUDFLARE} ${GREEN}[Cloudflare]${NC}"
  echo -e "     ${WHITE}${TXT_FOR_ABROAD}${NC}"
  echo ""
  echo -e "  ${CYAN}6)${NC} 🇨🇳 ${TXT_VISUAL_CPOLAR} ${YELLOW}[cpolar]${NC}"
  echo -e "     ${WHITE}${TXT_FOR_CHINA}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  ⚙️  ${TXT_MANAGEMENT}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${CYAN}7)${NC} 📊 ${TXT_VIEW_STATUS}"
  echo -e "  ${CYAN}8)${NC} 📋 ${TXT_VIEW_LOGS}"
  echo -e "  ${CYAN}9)${NC} 🔄 ${TXT_REBUILD}"
  echo -e "  ${CYAN}0)${NC} 🔑 ${TXT_CONFIG_CPOLAR}"
  echo -e "  ${CYAN}m)${NC} 🚀 ${TXT_CONFIG_MIRROR} ${YELLOW}[${TXT_CHINA_USERS}]${NC}"
  echo -e "  ${BLUE}L)${NC} 🌍 ${TXT_CHANGE_LANG}"
  echo -e "  ${RED}s)${NC} 🛑 ${TXT_STOP_ALL}"
  echo ""
  echo -e "  ${YELLOW}q)${NC} ${TXT_EXIT}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 获取本机 IP
get_local_ip() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
  else
    hostname -I | awk '{print $1}'
  fi
}

# 启动本地模式
start_local() {
  echo ""
  echo -e "${CYAN}🎭 ${TXT_START_LOCAL}${NC}"
  
  if ! smart_build ""; then
    return
  fi
  
  sleep 3
  
  LOCAL_IP=$(get_local_ip)
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_LOCAL_STARTED}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  📍 访问地址${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${CYAN}演员系统：${NC}"
  echo -e "    OSC 控制器: http://localhost:3000/?performer=1"
  echo -e "    MediaPipe:  http://localhost:3000/mocap/?performer=1"
  echo ""
  echo -e "  ${CYAN}观众系统：${NC}"
  echo -e "    监控面板:   http://localhost:3002/?performer=audience"
  echo -e "    ${GREEN}观众入口:   http://${LOCAL_IP}:3002/audience-touch/${NC}"
  echo ""
  echo -e "  ${CYAN}Max MSP（在本机运行）：${NC}"
  echo -e "    演员: [udpreceive 7400]"
  echo -e "    观众: [udpreceive 7402]"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # 自动打开浏览器（分屏显示）
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_BROWSER}${NC}"
    sleep 2  # 等待 Docker 容器完全启动
    
    # 左侧：Safari 打开 MediaPipe 动作捕捉
    osascript <<'EOF' 2>/dev/null
tell application "Safari"
    activate
    if (count of windows) = 0 then
        make new document
    end if
    set URL of current tab of front window to "http://localhost:3000/mocap/?performer=1"
    delay 0.5
    set bounds of front window to {0, 23, 960, 900}
end tell
EOF
    echo -e "${GREEN}✓ Safari: MediaPipe 动作捕捉 (左侧)${NC}"
    
    sleep 1
    
    # 右侧：Chrome 打开观众系统监控
    if [ -d "/Applications/Google Chrome.app" ]; then
      osascript <<'EOF' 2>/dev/null
tell application "Google Chrome"
    activate
    if (count of windows) = 0 then
        make new window
    else
        make new window
    end if
    set bounds of front window to {960, 23, 1920, 900}
    set URL of active tab of front window to "http://localhost:3002/?performer=audience"
end tell
EOF
      echo -e "${GREEN}✓ Chrome: 观众系统监控 (右侧)${NC}"
    else
      # 没有 Chrome，用 Safari 打开第二个窗口
      osascript <<'EOF' 2>/dev/null
tell application "Safari"
    make new document
    set URL of current tab of front window to "http://localhost:3002/?performer=audience"
    delay 0.5
    set bounds of front window to {960, 23, 1920, 900}
end tell
EOF
      echo -e "${GREEN}✓ Safari: 观众系统监控 (右侧)${NC}"
    fi
  else
    # Linux
    sleep 2
    xdg-open "http://localhost:3000/mocap/?performer=1" 2>/dev/null &
    sleep 1
    xdg-open "http://localhost:3002/?performer=audience" 2>/dev/null &
    echo -e "${GREEN}✓ ${TXT_BROWSER_OPENED}${NC}"
  fi
  echo ""
  
  read -p "按回车键返回菜单..." < /dev/tty
}

# 启动公网模式 (Cloudflare)
start_tunnel() {
  echo ""
  echo -e "${CYAN}🌐 ${TXT_START_PUBLIC} (Cloudflare)${NC}"
  
  if ! smart_build "-f docker-compose.yml -f docker-compose.tunnel.yml"; then
    return
  fi
  
  echo -e "${YELLOW}等待隧道建立...${NC}"
  sleep 10
  
  # 获取公网 URL
  PUBLIC_URL=$(docker-compose logs tunnel 2>&1 | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)
  
  LOCAL_IP=$(get_local_ip)
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_PUBLIC_STARTED}${NC}"
  echo ""
  
  if [ -n "$PUBLIC_URL" ]; then
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}  🌍 公网访问地址${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${GREEN}观众公网入口: ${PUBLIC_URL}/audience-touch/${NC}"
    echo ""
    echo -e "  ${YELLOW}⚠️ 延迟说明：${NC}"
    echo -e "     欧洲使用: 50-150ms ✓"
    echo -e "     中国使用: 700-1200ms (较慢，建议用 cpolar)"
    echo ""
  else
    echo -e "${YELLOW}⚠️ 无法自动获取公网 URL${NC}"
    echo ""
    echo "请手动查看："
    echo "  docker-compose logs tunnel | grep trycloudflare.com"
  fi
  
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  📍 本地访问地址${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  MediaPipe:  http://localhost:3000/mocap/?performer=1"
  echo -e "  监控面板:   http://localhost:3002/?performer=audience"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # 自动打开浏览器（分屏显示）
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_BROWSER}${NC}"
    sleep 2
    
    osascript <<'EOF' 2>/dev/null
tell application "Safari"
    activate
    if (count of windows) = 0 then
        make new document
    end if
    set URL of current tab of front window to "http://localhost:3000/mocap/?performer=1"
    delay 0.5
    set bounds of front window to {0, 23, 960, 900}
end tell
EOF
    echo -e "${GREEN}✓ Safari: MediaPipe 动作捕捉 (左侧)${NC}"
    
    sleep 1
    
    if [ -d "/Applications/Google Chrome.app" ]; then
      osascript <<'EOF' 2>/dev/null
tell application "Google Chrome"
    activate
    if (count of windows) = 0 then
        make new window
    else
        make new window
    end if
    set bounds of front window to {960, 23, 1920, 900}
    set URL of active tab of front window to "http://localhost:3002/?performer=audience"
end tell
EOF
      echo -e "${GREEN}✓ Chrome: 观众系统监控 (右侧)${NC}"
    else
      osascript <<'EOF' 2>/dev/null
tell application "Safari"
    make new document
    set URL of current tab of front window to "http://localhost:3002/?performer=audience"
    delay 0.5
    set bounds of front window to {960, 23, 1920, 900}
end tell
EOF
      echo -e "${GREEN}✓ Safari: 观众系统监控 (右侧)${NC}"
    fi
  else
    sleep 2
    xdg-open "http://localhost:3000/mocap/?performer=1" 2>/dev/null &
    sleep 1
    xdg-open "http://localhost:3002/?performer=audience" 2>/dev/null &
    echo -e "${GREEN}✓ ${TXT_BROWSER_OPENED}${NC}"
  fi
  echo ""
  
  read -p "按回车键返回菜单..." < /dev/tty
}

# 启动公网模式 (cpolar 国内)
start_cpolar() {
  echo ""
  echo -e "${CYAN}🇨🇳 ${TXT_START_CPOLAR}${NC}"
  echo ""
  
  # 检查 cpolar authtoken 是否已配置
  if ! docker volume ls | grep -q "cpolar-config"; then
    echo -e "${YELLOW}⚠️ 检测到 cpolar 尚未配置 authtoken${NC}"
    echo ""
    echo "请先配置 authtoken："
    echo "  1. 注册 https://www.cpolar.com"
    echo "  2. 在控制台获取 authtoken"
    echo "  3. 选择菜单选项 0 配置 authtoken"
    echo ""
    read -p "按回车键返回菜单..." < /dev/tty
    return
  fi
  
  if ! smart_build "-f docker-compose.yml -f docker-compose.cpolar.yml"; then
    return
  fi
  
  echo -e "${YELLOW}等待隧道建立...${NC}"
  sleep 15
  
  LOCAL_IP=$(get_local_ip)
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_CPOLAR_STARTED}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🇨🇳 获取公网 URL${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  方式 1: 访问 cpolar 管理界面"
  echo -e "          ${CYAN}http://localhost:9200${NC}"
  echo ""
  echo -e "  方式 2: 查看日志"
  echo -e "          docker-compose logs cpolar-tunnel | grep cpolar"
  echo ""
  echo -e "  ${YELLOW}💡 国内延迟: 50-200ms（比 Cloudflare 快很多）${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  📍 本地访问地址${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  MediaPipe:  http://localhost:3000/mocap/?performer=1"
  echo -e "  监控面板:   http://localhost:3002/?performer=audience"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # 自动打开浏览器（分屏显示）
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_BROWSER}${NC}"
    sleep 2
    
    osascript <<'EOF' 2>/dev/null
tell application "Safari"
    activate
    if (count of windows) = 0 then
        make new document
    end if
    set URL of current tab of front window to "http://localhost:3000/mocap/?performer=1"
    delay 0.5
    set bounds of front window to {0, 23, 960, 900}
end tell
EOF
    echo -e "${GREEN}✓ Safari: MediaPipe 动作捕捉 (左侧)${NC}"
    
    sleep 1
    
    if [ -d "/Applications/Google Chrome.app" ]; then
      osascript <<'EOF' 2>/dev/null
tell application "Google Chrome"
    activate
    if (count of windows) = 0 then
        make new window
    else
        make new window
    end if
    set bounds of front window to {960, 23, 1920, 900}
    set URL of active tab of front window to "http://localhost:3002/?performer=audience"
end tell
EOF
      echo -e "${GREEN}✓ Chrome: 观众系统监控 (右侧)${NC}"
    else
      osascript <<'EOF' 2>/dev/null
tell application "Safari"
    make new document
    set URL of current tab of front window to "http://localhost:3002/?performer=audience"
    delay 0.5
    set bounds of front window to {960, 23, 1920, 900}
end tell
EOF
      echo -e "${GREEN}✓ Safari: 观众系统监控 (右侧)${NC}"
    fi
  else
    sleep 2
    xdg-open "http://localhost:3000/mocap/?performer=1" 2>/dev/null &
    sleep 1
    xdg-open "http://localhost:3002/?performer=audience" 2>/dev/null &
    echo -e "${GREEN}✓ ${TXT_BROWSER_OPENED}${NC}"
  fi
  echo ""
  
  read -p "按回车键返回菜单..." < /dev/tty
}

# 启动视觉机 - 本地观众
start_visual_local() {
  echo ""
  echo -e "${CYAN}👁️ ${TXT_START_VISUAL} - ${TXT_VISUAL_LOCAL}${NC}"
  
  if ! smart_build "-f docker-compose.dual-visual.yml"; then
    return
  fi
  
  sleep 3
  
  LOCAL_IP=$(get_local_ip)
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_VISUAL_STARTED}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🖥️🖥️ 双机模式配置${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${PURPLE}📺 投影监控面板${NC}"
  echo -e "     ${CYAN}http://localhost:3002/?performer=audience${NC}"
  echo ""
  echo -e "  ${PURPLE}📱 观众手机入口${NC}"
  echo -e "     ${GREEN}http://${LOCAL_IP}:3002/audience-touch/${NC}"
  echo -e "     ${YELLOW}(观众需连接同一 WiFi)${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🎭 演员机配置（另一台电脑）${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${YELLOW}⚠️ 演员机请使用直接运行版本（支持摄像头）：${NC}"
  echo -e "     cd osc && ./start.sh → 选项 4（演员机）"
  echo ""
  echo -e "  ${PURPLE}🎮 演员机 Max MSP 配置${NC}"
  echo -e "     演员: [udpreceive 7400]"
  echo -e "     观众: [udpreceive 7402] ${GREEN}← 自动接收视觉机广播${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # 自动打开投影监控页面
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_PAGE}${NC}"
    sleep 2
    open "http://localhost:3002/?performer=audience" 2>/dev/null
    echo -e "${GREEN}✓ ${TXT_MONITOR_OPENED}${NC}"
  else
    sleep 2
    xdg-open "http://localhost:3002/?performer=audience" 2>/dev/null &
    echo -e "${GREEN}✓ ${TXT_MONITOR_OPENED}${NC}"
  fi
  echo ""
  
  read -p "按回车键返回菜单..." < /dev/tty
}

# 启动视觉机 - 公网观众 (Cloudflare)
start_visual_cloudflare() {
  echo ""
  echo -e "${CYAN}🌐 ${TXT_START_VISUAL_CF}${NC}"
  
  if ! smart_build "-f docker-compose.dual-visual.yml -f docker-compose.tunnel.yml"; then
    return
  fi
  
  echo -e "${YELLOW}等待隧道建立...${NC}"
  sleep 10
  
  # 获取公网 URL
  PUBLIC_URL=$(docker-compose logs tunnel 2>&1 | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)
  
  LOCAL_IP=$(get_local_ip)
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_VISUAL_CF_STARTED}${NC}"
  echo ""
  
  if [ -n "$PUBLIC_URL" ]; then
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}  🌍 观众公网入口（分享给观众！）${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "     ${GREEN}${PUBLIC_URL}/audience-touch/${NC}"
    echo ""
  else
    echo -e "${YELLOW}⚠️ 无法自动获取公网 URL，请查看：${NC}"
    echo "  docker-compose logs tunnel | grep trycloudflare.com"
  fi
  
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  📺 投影监控面板${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "     ${CYAN}http://localhost:3002/?performer=audience${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🎭 演员机配置（另一台电脑）${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${YELLOW}⚠️ 演员机请使用直接运行版本：${NC}"
  echo -e "     cd osc && ./start.sh → 选项 4（演员机）"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # 自动打开投影监控页面
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_PAGE}${NC}"
    sleep 2
    open "http://localhost:3002/?performer=audience" 2>/dev/null
    echo -e "${GREEN}✓ ${TXT_MONITOR_OPENED}${NC}"
  else
    sleep 2
    xdg-open "http://localhost:3002/?performer=audience" 2>/dev/null &
    echo -e "${GREEN}✓ ${TXT_MONITOR_OPENED}${NC}"
  fi
  echo ""
  
  read -p "按回车键返回菜单..." < /dev/tty
}

# 启动视觉机 - 公网观众 (cpolar)
start_visual_cpolar() {
  echo ""
  echo -e "${CYAN}🇨🇳 ${TXT_START_VISUAL_CP}${NC}"
  echo ""
  
  # 检查 cpolar authtoken 是否已配置
  if ! docker volume ls | grep -q "cpolar-config"; then
    echo -e "${YELLOW}⚠️ 检测到 cpolar 尚未配置 authtoken${NC}"
    echo ""
    echo "请先配置 authtoken："
    echo "  1. 注册 https://www.cpolar.com"
    echo "  2. 在控制台获取 authtoken"
    echo "  3. 选择菜单选项 0 配置 authtoken"
    echo ""
    read -p "按回车键返回菜单..." < /dev/tty
    return
  fi
  
  if ! smart_build "-f docker-compose.dual-visual.yml -f docker-compose.cpolar.yml"; then
    return
  fi
  
  echo -e "${YELLOW}等待隧道建立...${NC}"
  sleep 15
  
  LOCAL_IP=$(get_local_ip)
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_VISUAL_CP_STARTED}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🇨🇳 获取公网 URL（分享给观众！）${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  访问 cpolar 管理界面: ${CYAN}http://localhost:9200${NC}"
  echo -e "  或查看日志: docker-compose logs cpolar-tunnel"
  echo ""
  echo -e "  ${YELLOW}💡 国内延迟: 50-200ms${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  📺 投影监控面板${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "     ${CYAN}http://localhost:3002/?performer=audience${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🎭 演员机配置（另一台电脑）${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${YELLOW}⚠️ 演员机请使用直接运行版本：${NC}"
  echo -e "     cd osc && ./start.sh → 选项 4（演员机）"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # 自动打开投影监控页面
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_PAGE}${NC}"
    sleep 2
    open "http://localhost:3002/?performer=audience" 2>/dev/null
    echo -e "${GREEN}✓ ${TXT_MONITOR_OPENED}${NC}"
  else
    sleep 2
    xdg-open "http://localhost:3002/?performer=audience" 2>/dev/null &
    echo -e "${GREEN}✓ ${TXT_MONITOR_OPENED}${NC}"
  fi
  echo ""
  
  read -p "按回车键返回菜单..." < /dev/tty
}

# 配置 cpolar authtoken
setup_cpolar_token() {
  echo ""
  echo -e "${CYAN}🔑 配置 cpolar authtoken${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "1. 访问 https://www.cpolar.com 注册/登录"
  echo "2. 在控制台「验证」页面复制 authtoken"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  read -p "请输入你的 cpolar authtoken: " CPOLAR_TOKEN < /dev/tty
  
  if [ -n "$CPOLAR_TOKEN" ]; then
    echo ""
    echo -e "${YELLOW}正在配置 authtoken...${NC}"
    docker run --rm -v cpolar-config:/root/.cpolar probezy/cpolar authtoken "$CPOLAR_TOKEN"
    
    if [ $? -eq 0 ]; then
      echo ""
      echo -e "${GREEN}✅ cpolar authtoken 配置成功！${NC}"
      echo ""
      echo "现在可以使用 cpolar 国内公网模式了。"
    else
      echo ""
      echo -e "${RED}❌ 配置失败，请检查 authtoken 是否正确${NC}"
    fi
  else
    echo ""
    echo -e "${YELLOW}已取消配置${NC}"
  fi
  
  echo ""
  read -p "按回车键返回菜单..." < /dev/tty
}

# 查看状态
show_status() {
  echo ""
  echo -e "${CYAN}📊 Docker 容器状态${NC}"
  echo ""
  docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "osc-|NAMES"
  echo ""
  read -p "按回车键返回菜单..." < /dev/tty
}

# 查看日志
show_logs() {
  echo ""
  echo -e "${CYAN}📋 查看日志（按 Ctrl+C 退出）${NC}"
  echo ""
  echo "1) 所有日志"
  echo "2) 演员系统"
  echo "3) 观众系统"
  echo "4) Cloudflare 隧道"
  echo "5) cpolar 隧道"
  echo ""
  read -p "选择: " log_choice < /dev/tty
  
  case $log_choice in
    1) docker-compose logs -f 2>/dev/null || docker logs -f osc-visual-dual 2>/dev/null ;;
    2) docker logs -f osc-performer 2>/dev/null || docker logs -f osc-performer-dual 2>/dev/null ;;
    3) docker logs -f osc-audience 2>/dev/null || docker logs -f osc-visual-dual 2>/dev/null ;;
    4) docker logs -f osc-tunnel 2>/dev/null ;;
    5) docker logs -f osc-cpolar 2>/dev/null ;;
    *) echo "无效选择" ;;
  esac
}

# 重新构建
rebuild() {
  echo ""
  echo -e "${CYAN}🔄 重新构建镜像...${NC}"
  echo ""
  
  # 停止所有相关容器
  docker-compose down 2>/dev/null
  docker-compose -f docker-compose.dual-visual.yml down 2>/dev/null
  
  # 重新构建
  docker-compose build --no-cache
  
  echo ""
  echo -e "${GREEN}✅ 构建完成${NC}"
  read -p "按回车键返回菜单..." < /dev/tty
}

# 停止所有
stop_all() {
  echo ""
  echo -e "${RED}🛑 ${TXT_STOP_SERVICES}${NC}"
  echo ""
  
  # 停止各种配置组合
  docker-compose -f docker-compose.yml -f docker-compose.tunnel.yml down 2>/dev/null
  docker-compose -f docker-compose.yml -f docker-compose.cpolar.yml down 2>/dev/null
  docker-compose -f docker-compose.dual-visual.yml -f docker-compose.tunnel.yml down 2>/dev/null
  docker-compose -f docker-compose.dual-visual.yml -f docker-compose.cpolar.yml down 2>/dev/null
  docker-compose -f docker-compose.dual-visual.yml down 2>/dev/null
  docker-compose -f docker-compose.dual-performer.yml down 2>/dev/null
  docker-compose down 2>/dev/null
  
  echo ""
  echo -e "${GREEN}✅ 所有服务已停止${NC}"
  read -p "按回车键返回菜单..." < /dev/tty
}

# 主循环 / Main Loop
main() {
  check_docker
  
  while true; do
    clear
    show_logo
    show_menu
    
    read -p "${TXT_SELECT} [1-9/0/m/L/s/q]: " choice < /dev/tty
    
    case $choice in
      1) start_local ;;
      2) start_tunnel ;;
      3) start_cpolar ;;
      4) start_visual_local ;;
      5) start_visual_cloudflare ;;
      6) start_visual_cpolar ;;
      7) show_status ;;
      8) show_logs ;;
      9) rebuild ;;
      0) setup_cpolar_token ;;
      m|M) 
        ./docker-mirror-setup.sh
        read -p "${TXT_PRESS_ENTER}" < /dev/tty
        ;;
      l|L)
        rm -f "$LANG_FILE"
        select_language
        # Reload script to apply new language immediately
        exec "$0"
        ;;
      s|S) stop_all ;;
      q|Q)
        echo ""
        echo -e "${CYAN}👋 ${TXT_GOODBYE}${NC}"
        exit 0
        ;;
      *)
        echo -e "${RED}${TXT_INVALID}${NC}"
        sleep 1
        ;;
    esac
  done
}

main

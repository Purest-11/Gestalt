#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 
#   ██████╗ ███████╗███████╗████████╗ █████╗ ██╗  ████████╗
#  ██╔════╝ ██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║  ╚══██╔══╝
#  ██║  ███╗█████╗  ███████╗   ██║   ███████║██║     ██║   
#  ██║   ██║██╔══╝  ╚════██║   ██║   ██╔══██║██║     ██║   
#  ╚██████╔╝███████╗███████║   ██║   ██║  ██║███████╗██║   
#   ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝   
#
#  Real-Time Collaboration between Performers and Mass Audiences
#  表演者与大规模观众的实时协作系统
#
# ═══════════════════════════════════════════════════════════════════

# 颜色定义 / Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

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
  TXT_TITLE="Gestalt"
  TXT_SUBTITLE="表演者与大规模观众的实时协作系统"
  TXT_STATUS="系统状态"
  TXT_PERFORMER_SYSTEM="演员系统"
  TXT_AUDIENCE_SYSTEM="观众系统"
  TXT_TUNNEL="公网隧道"
  TXT_RUNNING="运行中"
  TXT_NOT_RUNNING="未运行"
  TXT_NOT_ENABLED="未启用"
  TXT_LOCAL_IP="本机 IP"
  TXT_SINGLE_MODE="单机模式（需要高性能电脑，自动分屏投放）"
  TXT_LOCAL_PERF="本地演出模式 + 分屏"
  TXT_LOCAL_DESC="观众需连同一WiFi"
  TXT_PUBLIC_ABROAD="公网模式（国外）+ 分屏"
  TXT_PUBLIC_ABROAD_DESC="适合国外演出、ICMC等国际会议"
  TXT_PUBLIC_CHINA="公网模式（国内）+ 分屏"
  TXT_PUBLIC_CHINA_DESC="适合国内演出，延迟更低"
  TXT_DUAL_MODE="双机模式（两台电脑连同一 WiFi）"
  TXT_PERFORMER_MACHINE="演员机"
  TXT_PERFORMER_DESC="运行动作捕捉，OSC 直连本地 Max MSP"
  TXT_VISUAL_MACHINE="视觉机 - 本地观众"
  TXT_VISUAL_DESC="观众需连同一 WiFi"
  TXT_VISUAL_PUBLIC="视觉机 - 公网观众"
  TXT_VISUAL_PUBLIC_DESC_ABROAD="适合国外演出、ICMC 等"
  TXT_VISUAL_PUBLIC_DESC_CHINA="适合国内演出"
  TXT_OTHER_OPTIONS="其他选项"
  TXT_SHOW_URLS="显示访问地址"
  TXT_STOP_ALL="停止所有系统"
  TXT_CHANGE_LANG="切换语言"
  TXT_EXIT="退出"
  TXT_SELECT="请选择"
  TXT_PRESS_ENTER="按回车键返回菜单..."
  TXT_GOODBYE="再见！"
  TXT_INVALID="无效选项，请重新选择"
  TXT_STARTING="启动中..."
  TXT_STARTED="已启动！"
  TXT_STOPPING="停止所有系统..."
  TXT_STOPPED="所有系统已停止"
  TXT_ACCESS_URLS="访问地址"
  TXT_MAXMSP_CONFIG="Max MSP 配置"
  TXT_PERFORMER="演员"
  TXT_AUDIENCE="观众"
  TXT_OSC_CONTROLLER="OSC 控制器"
  TXT_MOTION_CAPTURE="动作捕捉"
  TXT_MONITOR_PANEL="监控面板"
  TXT_LOCAL_ENTRY="本地入口"
  TXT_PUBLIC_ENTRY="公网入口（分享给观众!）"
  TXT_AUDIENCE_WIFI="观众需连接同一WiFi"
  TXT_AUDIENCE_4G="观众可用4G/5G"
  TXT_OPEN_BROWSER="打开分屏浏览器..."
  TXT_OPEN_PAGE="打开页面..."
  TXT_TIP="提示"
  TXT_WAIT_TUNNEL="等待隧道建立..."
  TXT_TUNNEL_SYNCED="公网URL已同步到监控面板"
  TXT_CANNOT_GET_URL="无法自动获取公网URL"
  TXT_OSC_FLOW="OSC 数据流"
  TXT_LOCAL_ZERO_LATENCY="本地零延迟"
  TXT_AUTO_RECEIVE="自动接收"
  TXT_CLOUDFLARE="国外"
  TXT_CPOLAR="国内"
  TXT_MEDIAPIPE="MediaPipe"
  TXT_PROJECTION="投影监控面板"
  TXT_AUDIENCE_PHONE="观众手机入口"
  # Process messages
  TXT_START_LOCAL="启动本地演出模式..."
  TXT_START_PERFORMER="启动演员系统..."
  TXT_START_AUDIENCE="启动观众系统..."
  TXT_LOCAL_STARTED="本地演出模式已启动！"
  TXT_START_TUNNEL="启动公网演出模式..."
  TXT_TUNNEL_STARTED="公网演出模式（国外）已启动！"
  TXT_START_TUNNEL_CHINA="启动公网演出模式（国内）..."
  TXT_TUNNEL_CHINA_STARTED="公网演出模式（国内）已启动！"
  TXT_CREATE_TUNNEL="创建公网隧道..."
  TXT_CREATE_TUNNEL_CHINA="创建国内公网隧道..."
  TXT_SAFARI_MOCAP="Safari: MediaPipe 动作捕捉 (左侧)"
  TXT_CHROME_MONITOR="Chrome: 观众系统监控 (右侧)"
  TXT_BROWSER_OPENED="已打开浏览器窗口"
  TXT_ALL_STOPPED="所有系统已停止"
  TXT_PERFORMER_MACHINE_STARTED="演员机已启动！"
  TXT_VISUAL_MACHINE_STARTED="视觉机已启动！"
  TXT_VISUAL_CLOUDFLARE_STARTED="视觉机 + 公网观众已启动！"
  TXT_PERFORMER_CONFIG="演员机配置"
  TXT_VISUAL_CONFIG="视觉机配置"
  TXT_MAXMSP_PERFORMER_OSC="演员 OSC"
  TXT_MAXMSP_AUDIENCE_OSC="观众 OSC"
  TXT_OSC_RECEIVE_VISUAL="← 接收视觉机广播"
  TXT_USE_LOCAL="使用本地"
  TXT_USE_SYSTEM="使用系统"
  TXT_NOT_FOUND="未找到"
  TXT_WAIT_TUNNEL_SECONDS="等待隧道建立（约10秒）..."
  TXT_CANNOT_GET_PUBLIC_URL="无法自动获取公网URL，请查看日志："
  TXT_START_PERFORMER_MACHINE="启动演员机模式..."
  TXT_START_VISUAL_MACHINE="启动视觉机模式..."
  TXT_START_VISUAL_CLOUDFLARE="启动视觉机模式 + 公网观众 [Cloudflare]..."
  TXT_START_VISUAL_CPOLAR="启动视觉机模式 + 公网观众 [cpolar]..."
  TXT_DUAL_HINT1="请确保 Max MSP 已打开并创建"
  TXT_DUAL_HINT2="在另一台电脑上启动「视觉机模式」"
  TXT_DUAL_HINT3="请确保另一台电脑已启动「演员机模式」"
  TXT_DUAL_HINT4="请确保演员机已启动「演员机模式」"
  TXT_VISUAL_CPOLAR_STARTED="视觉机 + 公网观众已启动！"
else
  # English texts (default)
  TXT_TITLE="Gestalt"
  TXT_SUBTITLE="Real-Time Collaboration between Performers and Mass Audiences"
  TXT_STATUS="System Status"
  TXT_PERFORMER_SYSTEM="Performer System"
  TXT_AUDIENCE_SYSTEM="Audience System"
  TXT_TUNNEL="Public Tunnel"
  TXT_RUNNING="Running"
  TXT_NOT_RUNNING="Not Running"
  TXT_NOT_ENABLED="Not Enabled"
  TXT_LOCAL_IP="Local IP"
  TXT_SINGLE_MODE="Single Machine Mode (High-end PC, Auto Split-Screen)"
  TXT_LOCAL_PERF="Local Performance + Split-Screen"
  TXT_LOCAL_DESC="Audience must join same WiFi"
  TXT_PUBLIC_ABROAD="Public Mode (International) + Split-Screen"
  TXT_PUBLIC_ABROAD_DESC="For international venues, ICMC, etc."
  TXT_PUBLIC_CHINA="Public Mode (China) + Split-Screen"
  TXT_PUBLIC_CHINA_DESC="For China venues, lower latency"
  TXT_DUAL_MODE="Dual Machine Mode (Two PCs on same WiFi)"
  TXT_PERFORMER_MACHINE="Performer Machine"
  TXT_PERFORMER_DESC="Motion capture, OSC direct to local Max MSP"
  TXT_VISUAL_MACHINE="Visual Machine - Local Audience"
  TXT_VISUAL_DESC="Audience must join same WiFi"
  TXT_VISUAL_PUBLIC="Visual Machine - Public Audience"
  TXT_VISUAL_PUBLIC_DESC_ABROAD="For international venues"
  TXT_VISUAL_PUBLIC_DESC_CHINA="For China venues"
  TXT_OTHER_OPTIONS="Other Options"
  TXT_SHOW_URLS="Show Access URLs"
  TXT_STOP_ALL="Stop All Systems"
  TXT_CHANGE_LANG="Change Language"
  TXT_EXIT="Exit"
  TXT_SELECT="Select"
  TXT_PRESS_ENTER="Press Enter to return..."
  TXT_GOODBYE="Goodbye!"
  TXT_INVALID="Invalid option, please try again"
  TXT_STARTING="Starting..."
  TXT_STARTED="Started!"
  TXT_STOPPING="Stopping all systems..."
  TXT_STOPPED="All systems stopped"
  TXT_ACCESS_URLS="Access URLs"
  TXT_MAXMSP_CONFIG="Max MSP Configuration"
  TXT_PERFORMER="Performer"
  TXT_AUDIENCE="Audience"
  TXT_OSC_CONTROLLER="OSC Controller"
  TXT_MOTION_CAPTURE="Motion Capture"
  TXT_MONITOR_PANEL="Monitor Panel"
  TXT_LOCAL_ENTRY="Local Entry"
  TXT_PUBLIC_ENTRY="Public Entry (Share with audience!)"
  TXT_AUDIENCE_WIFI="Audience must join same WiFi"
  TXT_AUDIENCE_4G="Audience can use 4G/5G"
  TXT_OPEN_BROWSER="Opening split-screen browsers..."
  TXT_OPEN_PAGE="Opening page..."
  TXT_TIP="Tip"
  TXT_WAIT_TUNNEL="Waiting for tunnel..."
  TXT_TUNNEL_SYNCED="Public URL synced to monitor panel"
  TXT_CANNOT_GET_URL="Cannot auto-get public URL"
  TXT_OSC_FLOW="OSC Data Flow"
  TXT_LOCAL_ZERO_LATENCY="Local, zero latency"
  TXT_AUTO_RECEIVE="Auto receive"
  TXT_CLOUDFLARE="International"
  TXT_CPOLAR="China"
  TXT_MEDIAPIPE="MediaPipe"
  TXT_PROJECTION="Projection Monitor"
  TXT_AUDIENCE_PHONE="Audience Mobile Entry"
  # Process messages
  TXT_START_LOCAL="Starting local performance mode..."
  TXT_START_PERFORMER="Starting performer system..."
  TXT_START_AUDIENCE="Starting audience system..."
  TXT_LOCAL_STARTED="Local performance mode started!"
  TXT_START_TUNNEL="Starting public mode..."
  TXT_TUNNEL_STARTED="Public mode (International) started!"
  TXT_START_TUNNEL_CHINA="Starting public mode (China)..."
  TXT_TUNNEL_CHINA_STARTED="Public mode (China) started!"
  TXT_CREATE_TUNNEL="Creating public tunnel..."
  TXT_CREATE_TUNNEL_CHINA="Creating China public tunnel..."
  TXT_SAFARI_MOCAP="Safari: MediaPipe Motion Capture (Left)"
  TXT_CHROME_MONITOR="Chrome: Audience Monitor (Right)"
  TXT_BROWSER_OPENED="Browser windows opened"
  TXT_ALL_STOPPED="All systems stopped"
  TXT_PERFORMER_MACHINE_STARTED="Performer machine started!"
  TXT_VISUAL_MACHINE_STARTED="Visual machine started!"
  TXT_VISUAL_CLOUDFLARE_STARTED="Visual machine + public audience started!"
  TXT_PERFORMER_CONFIG="Performer Machine Config"
  TXT_VISUAL_CONFIG="Visual Machine Config"
  TXT_MAXMSP_PERFORMER_OSC="Performer OSC"
  TXT_MAXMSP_AUDIENCE_OSC="Audience OSC"
  TXT_OSC_RECEIVE_VISUAL="← Receive from visual machine"
  TXT_USE_LOCAL="Using local"
  TXT_USE_SYSTEM="Using system"
  TXT_NOT_FOUND="not found"
  TXT_WAIT_TUNNEL_SECONDS="Waiting for tunnel (~10 seconds)..."
  TXT_CANNOT_GET_PUBLIC_URL="Cannot auto-get public URL, check logs:"
  TXT_START_PERFORMER_MACHINE="Starting performer machine mode..."
  TXT_START_VISUAL_MACHINE="Starting visual machine mode..."
  TXT_START_VISUAL_CLOUDFLARE="Starting visual machine + public audience [Cloudflare]..."
  TXT_START_VISUAL_CPOLAR="Starting visual machine + public audience [cpolar]..."
  TXT_DUAL_HINT1="Please ensure Max MSP is open and create"
  TXT_DUAL_HINT2="Start 'Visual Machine Mode' on another computer"
  TXT_DUAL_HINT3="Please ensure 'Performer Machine Mode' is running on another computer"
  TXT_DUAL_HINT4="Please ensure performer machine has started 'Performer Machine Mode'"
  TXT_VISUAL_CPOLAR_STARTED="Visual machine + public audience started!"
fi

# 获取本机 IP
get_local_ip() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1
  else
    hostname -I | awk '{print $1}'
  fi
}

LOCAL_IP=$(get_local_ip)

# 清屏函数
clear_screen() {
  clear
}

# 显示 Logo / Show Logo
show_logo() {
  echo -e "${CYAN}"
  echo "  ╔═══════════════════════════════════════════════════════════╗"
  echo "  ║                                                           ║"
  echo -e "  ║   🎭  ${TXT_TITLE}  🎭              ║"
  echo "  ║                                                           ║"
  echo "  ╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

# 显示状态 / Show Status
show_status() {
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  📊 ${TXT_STATUS}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # 检查演员系统 / Check performer system
  if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  ${GREEN}●${NC} ${TXT_PERFORMER_SYSTEM} (3000)    ${GREEN}${TXT_RUNNING}${NC}"
  else
    echo -e "  ${RED}○${NC} ${TXT_PERFORMER_SYSTEM} (3000)    ${RED}${TXT_NOT_RUNNING}${NC}"
  fi
  
  # 检查观众系统 / Check audience system
  if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  ${GREEN}●${NC} ${TXT_AUDIENCE_SYSTEM} (3002)    ${GREEN}${TXT_RUNNING}${NC}"
  else
    echo -e "  ${RED}○${NC} ${TXT_AUDIENCE_SYSTEM} (3002)    ${RED}${TXT_NOT_RUNNING}${NC}"
  fi
  
  # 检查隧道 / Check tunnel
  if pgrep -f "cloudflared tunnel" >/dev/null 2>&1 || pgrep -f "ngrok http" >/dev/null 2>&1 || pgrep -f "cpolar" >/dev/null 2>&1; then
    echo -e "  ${GREEN}●${NC} ${TXT_TUNNEL}          ${GREEN}${TXT_RUNNING}${NC}"
  else
    echo -e "  ${YELLOW}○${NC} ${TXT_TUNNEL}          ${YELLOW}${TXT_NOT_ENABLED}${NC}"
  fi
  
  echo ""
  echo -e "  ${BLUE}🌐 ${TXT_LOCAL_IP}: ${WHITE}$LOCAL_IP${NC}"
  echo ""
}

# 显示主菜单 / Show Main Menu
show_menu() {
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🚀 ${TXT_SINGLE_MODE}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${CYAN}1)${NC} 🎭 ${TXT_LOCAL_PERF}"
  echo -e "     ${WHITE}${TXT_LOCAL_DESC}${NC}"
  echo ""
  echo -e "  ${CYAN}2)${NC} 🌐 ${TXT_PUBLIC_ABROAD} ${GREEN}[Cloudflare]${NC}"
  echo -e "     ${WHITE}${TXT_PUBLIC_ABROAD_DESC}${NC}"
  echo ""
  echo -e "  ${CYAN}3)${NC} 🇨🇳 ${TXT_PUBLIC_CHINA} ${YELLOW}[cpolar]${NC}"
  echo -e "     ${WHITE}${TXT_PUBLIC_CHINA_DESC}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🖥️🖥️  ${TXT_DUAL_MODE}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${CYAN}4)${NC} 🎭 ${TXT_PERFORMER_MACHINE} ${PURPLE}(${TXT_MEDIAPIPE} + Max MSP)${NC}"
  echo -e "     ${WHITE}${TXT_PERFORMER_DESC}${NC}"
  echo ""
  echo -e "  ${CYAN}5)${NC} 👁️  ${TXT_VISUAL_MACHINE}"
  echo -e "     ${WHITE}${TXT_VISUAL_DESC}${NC}"
  echo ""
  echo -e "  ${CYAN}6)${NC} 🌐 ${TXT_VISUAL_PUBLIC} ${GREEN}[Cloudflare]${NC}"
  echo -e "     ${WHITE}${TXT_VISUAL_PUBLIC_DESC_ABROAD}${NC}"
  echo ""
  echo -e "  ${CYAN}7)${NC} 🇨🇳 ${TXT_VISUAL_PUBLIC} ${YELLOW}[cpolar]${NC}"
  echo -e "     ${WHITE}${TXT_VISUAL_PUBLIC_DESC_CHINA}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  ⚙️  ${TXT_OTHER_OPTIONS}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${CYAN}8)${NC} 🔗 ${TXT_SHOW_URLS}"
  echo -e "  ${RED}9)${NC} 🛑 ${TXT_STOP_ALL}"
  echo -e "  ${BLUE}L)${NC} 🌍 ${TXT_CHANGE_LANG}"
  echo ""
  echo -e "  ${YELLOW}q)${NC} ${TXT_EXIT}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 打开分屏浏览器（投屏用）
# Safari: MediaPipe 动作捕捉（左侧）- 更好的摄像头性能
# Chrome: 观众系统监控（右侧）- 更好的 WebGL 性能
open_split_screen_browsers() {
  echo -e "${YELLOW}🖥️  ${TXT_OPEN_BROWSER}${NC}"
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # 左侧：Safari 打开 MediaPipe 动作捕捉
    osascript <<'EOF'
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
    echo -e "${GREEN}✓ ${TXT_SAFARI_MOCAP}${NC}"
    
    sleep 1
    
    # 右侧：Chrome 打开观众系统监控
    if [ -d "/Applications/Google Chrome.app" ]; then
      osascript <<'EOF'
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
      echo -e "${GREEN}✓ ${TXT_CHROME_MONITOR}${NC}"
    else
      # 没有 Chrome，用 Safari 打开第二个窗口
      osascript <<'EOF'
tell application "Safari"
    make new document
    set URL of current tab of front window to "http://localhost:3002/?performer=audience"
    delay 0.5
    set bounds of front window to {960, 23, 1920, 900}
end tell
EOF
      echo -e "${GREEN}✓ ${TXT_CHROME_MONITOR}${NC}"
    fi
  else
    # Linux
    xdg-open "http://localhost:3000/mocap/?performer=1" 2>/dev/null &
    sleep 1
    xdg-open "http://localhost:3002/?performer=audience" 2>/dev/null &
    echo -e "${GREEN}✓ ${TXT_BROWSER_OPENED}${NC}"
  fi
  echo ""
}

# 启动本地演出模式 / Start local performance mode
start_local_mode() {
  echo ""
  echo -e "${CYAN}🎭 ${TXT_START_LOCAL}${NC}"
  echo ""
  
  # 停止已有进程
  ./stop-all.sh 2>/dev/null
  sleep 1
  
  # 创建目录
  mkdir -p logs .pids
  
  # 启动演员系统 / Start performer system
  echo -e "${YELLOW}${TXT_START_PERFORMER}${NC}"
  export PERFORMER_ID=1
  export OSC_PORT=7400
  export PORT=3000
  export USE_BROADCAST=true
  nohup npm start > logs/performer1.log 2>&1 &
  echo $! > .pids/performer1.pid
  sleep 2
  
  # 启动观众系统 / Start audience system
  echo -e "${YELLOW}${TXT_START_AUDIENCE}${NC}"
  export PERFORMER_ID=audience
  export OSC_PORT=7402
  export PORT=3002
  export USE_BROADCAST=true
  nohup npm start > logs/audience.log 2>&1 &
  echo $! > .pids/audience.pid
  sleep 2
  
  # 清除公网URL，确保使用本地地址
  curl -s -X POST http://localhost:3002/api/clear-tunnel-url > /dev/null 2>&1
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_LOCAL_STARTED}${NC}"
  echo ""
  
  # 自动打开分屏浏览器
  open_split_screen_browsers
  
  show_access_info "local"
  
  echo ""
  read -p "$TXT_PRESS_ENTER" < /dev/tty
}

# 启动公网演出模式 / Start public tunnel mode
start_tunnel_mode() {
  echo ""
  echo -e "${CYAN}🌐 ${TXT_START_TUNNEL}${NC}"
  echo ""
  
  # 检查 cloudflared（优先使用本地目录中的）
  CLOUDFLARED_CMD=""
  if [ -x "$SCRIPT_DIR/cloudflared" ]; then
    CLOUDFLARED_CMD="$SCRIPT_DIR/cloudflared"
    echo -e "${GREEN}✓ ${TXT_USE_LOCAL} cloudflared${NC}"
  elif command -v cloudflared &> /dev/null; then
    CLOUDFLARED_CMD="cloudflared"
    echo -e "${GREEN}✓ ${TXT_USE_SYSTEM} cloudflared${NC}"
  elif command -v ngrok &> /dev/null; then
    USE_NGROK=true
    echo -e "${YELLOW}使用 ngrok 作为替代${NC}"
  else
    echo -e "${RED}❌ cloudflared ${TXT_NOT_FOUND}${NC}"
    echo ""
    echo -e "${YELLOW}请先安装 cloudflared：${NC}"
    echo ""
    echo -e "  ${CYAN}方法 1：Homebrew (推荐)${NC}"
    echo "    brew install cloudflared"
    echo ""
    echo -e "  ${CYAN}方法 2：手动下载${NC}"
    echo "    访问: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    echo "    下载 macOS .pkg 安装包并双击安装"
    echo ""
    read -p "$TXT_PRESS_ENTER" < /dev/tty
    return
  fi
  
  USE_NGROK=${USE_NGROK:-false}
  
  # 停止已有进程
  ./stop-all.sh 2>/dev/null
  sleep 1
  
  # 创建目录
  mkdir -p logs .pids
  
  # 启动演员系统
  echo -e "${YELLOW}${TXT_START_PERFORMER}${NC}"
  export PERFORMER_ID=1
  export OSC_PORT=7400
  export PORT=3000
  export USE_BROADCAST=true
  nohup npm start > logs/performer1.log 2>&1 &
  echo $! > .pids/performer1.pid
  sleep 2
  
  # 启动观众系统
  echo -e "${YELLOW}${TXT_START_AUDIENCE}${NC}"
  export PERFORMER_ID=audience
  export OSC_PORT=7402
  export PORT=3002
  export USE_BROADCAST=true
  nohup npm start > logs/audience.log 2>&1 &
  echo $! > .pids/audience.pid
  sleep 2
  
  # 启动隧道
  echo -e "${YELLOW}${TXT_CREATE_TUNNEL}${NC}"
  if [ "$USE_NGROK" = true ]; then
    nohup ngrok http 3002 --log=stdout > logs/tunnel.log 2>&1 &
  else
    nohup $CLOUDFLARED_CMD tunnel --url http://localhost:3002 > logs/tunnel.log 2>&1 &
  fi
  echo $! > .pids/tunnel.pid
  
  echo -e "${YELLOW}${TXT_WAIT_TUNNEL}${NC}"
  sleep 5
  
  # 获取公网 URL
  PUBLIC_URL=""
  if [ "$USE_NGROK" = true ]; then
    for i in {1..10}; do
      PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
      [ -n "$PUBLIC_URL" ] && break
      sleep 1
    done
  else
    for i in {1..10}; do
      PUBLIC_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' logs/tunnel.log 2>/dev/null | head -1)
      [ -n "$PUBLIC_URL" ] && break
      sleep 1
    done
  fi
  
  # 将公网URL设置到服务器（用于生成正确的二维码）
  if [ -n "$PUBLIC_URL" ]; then
    curl -s -X POST http://localhost:3002/api/set-tunnel-url \
      -H "Content-Type: application/json" \
      -d "{\"url\": \"$PUBLIC_URL\", \"mode\": \"cloudflare\"}" > /dev/null 2>&1
    echo -e "${GREEN}✓ ${TXT_TUNNEL_SYNCED}${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_TUNNEL_STARTED}${NC}"
  echo ""
  
  # 自动打开分屏浏览器
  open_split_screen_browsers
  
  if [ -n "$PUBLIC_URL" ]; then
    show_access_info "tunnel" "$PUBLIC_URL"
  else
    echo -e "${YELLOW}⚠️  ${TXT_CANNOT_GET_PUBLIC_URL}${NC}"
    echo "    tail -f logs/tunnel.log"
    echo ""
    show_access_info "local"
  fi
  
  echo ""
  read -p "$TXT_PRESS_ENTER" < /dev/tty
}

# 启动公网演出模式（国内 - cpolar） / Start China public mode
start_tunnel_china_mode() {
  echo ""
  echo -e "${CYAN}🇨🇳 ${TXT_START_TUNNEL_CHINA}${NC}"
  echo ""
  
  # 检查 cpolar
  CPOLAR_CMD=""
  if [ -x "$SCRIPT_DIR/cpolar" ]; then
    CPOLAR_CMD="$SCRIPT_DIR/cpolar"
    echo -e "${GREEN}✓ ${TXT_USE_LOCAL} cpolar${NC}"
  elif command -v cpolar &> /dev/null; then
    CPOLAR_CMD="cpolar"
    echo -e "${GREEN}✓ ${TXT_USE_SYSTEM} cpolar${NC}"
  else
    echo -e "${RED}❌ cpolar ${TXT_NOT_FOUND}${NC}"
    echo ""
    echo -e "${YELLOW}请先安装 cpolar（国内隧道服务）：${NC}"
    echo ""
    echo "  1. 访问 https://www.cpolar.com 注册账号"
    echo "  2. 下载 cpolar 客户端"
    echo "  3. 运行 cpolar authtoken <您的token>"
    echo ""
    echo "  或使用 Homebrew 安装："
    echo "  brew tap probezy/core && brew install cpolar"
    echo ""
    echo -e "${CYAN}备选方案：使用 natapp${NC}"
    echo "  访问 https://natapp.cn 注册并下载"
    echo ""
    read -p "$TXT_PRESS_ENTER" < /dev/tty
    return
  fi
  
  # 停止已有进程
  ./stop-all.sh 2>/dev/null
  sleep 1
  
  # 创建目录
  mkdir -p logs .pids
  
  # 启动演员系统
  echo -e "${YELLOW}${TXT_START_PERFORMER}${NC}"
  export PERFORMER_ID=1
  export OSC_PORT=7400
  export PORT=3000
  export USE_BROADCAST=true
  nohup npm start > logs/performer1.log 2>&1 &
  echo $! > .pids/performer1.pid
  sleep 2
  
  # 启动观众系统
  echo -e "${YELLOW}${TXT_START_AUDIENCE}${NC}"
  export PERFORMER_ID=audience
  export OSC_PORT=7402
  export PORT=3002
  export USE_BROADCAST=true
  nohup npm start > logs/audience.log 2>&1 &
  echo $! > .pids/audience.pid
  sleep 2
  
  # 先清理已有的 cpolar 进程（避免会话限制问题）
  echo -e "${YELLOW}清理已有 cpolar 进程...${NC}"
  pkill -f cpolar 2>/dev/null
  sleep 2
  
  # 启动 cpolar 隧道
  echo -e "${YELLOW}${TXT_CREATE_TUNNEL_CHINA}${NC}"
  nohup $CPOLAR_CMD http 3002 > logs/tunnel.log 2>&1 &
  echo $! > .pids/tunnel.pid
  
  echo -e "${YELLOW}${TXT_WAIT_TUNNEL_SECONDS}${NC}"
  
  # 获取 cpolar 公网 URL
  PUBLIC_URL=""
  # cpolar 的 URL 格式通常是 https://xxxxxx.cpolar.cn 或 https://xxxxxx.cpolar.top
  for i in {1..20}; do
    sleep 1
    echo -n "."
    
    # 尝试从 cpolar web 页面获取 URL（4040 端口）
    # cpolar URL 格式可能是 xxx.r9.vip.cpolar.cn 或 xxx.cpolar.cn
    PUBLIC_URL=$(curl -s http://127.0.0.1:4040/http/in 2>/dev/null | grep -oE 'https://[a-zA-Z0-9.-]+\.cpolar\.(cn|top|io|cc)' | head -1)
    if [ -n "$PUBLIC_URL" ]; then
      break
    fi
    
    # 也尝试从日志获取
    PUBLIC_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.cpolar\.(cn|top|io|cc)' logs/tunnel.log 2>/dev/null | head -1)
    if [ -n "$PUBLIC_URL" ]; then
      break
    fi
    
    # 检查是否有错误（如会话限制）
    if grep -q "limited to simultaneous" logs/tunnel.log 2>/dev/null; then
      echo ""
      echo -e "${RED}❌ cpolar 会话数量已达上限！${NC}"
      echo ""
      echo -e "${YELLOW}解决方案：${NC}"
      echo "  1. 登录 https://dashboard.cpolar.com 关闭其他隧道"
      echo "  2. 或升级 cpolar 套餐"
      echo "  3. 或等待几分钟后重试"
      echo ""
      # 回退到本地模式
      curl -s -X POST http://localhost:3002/api/clear-tunnel-url > /dev/null 2>&1
      open_split_screen_browsers
      show_access_info "local"
      read -p "$TXT_PRESS_ENTER" < /dev/tty
      return
    fi
  done
  echo ""
  
  # 将公网URL设置到服务器（用于生成正确的二维码）
  if [ -n "$PUBLIC_URL" ]; then
    curl -s -X POST http://localhost:3002/api/set-tunnel-url \
      -H "Content-Type: application/json" \
      -d "{\"url\": \"$PUBLIC_URL\", \"mode\": \"cpolar\"}" > /dev/null 2>&1
    echo -e "${GREEN}✓ ${TXT_TUNNEL_SYNCED}${NC}"
    
    echo ""
    echo -e "${GREEN}✅ ${TXT_TUNNEL_CHINA_STARTED}${NC}"
    echo ""
    
    # 自动打开分屏浏览器
    open_split_screen_browsers
    
    show_access_info "tunnel_china" "$PUBLIC_URL"
  else
    echo -e "${YELLOW}⚠️  ${TXT_CANNOT_GET_URL}${NC}"
    echo ""
    echo "可能的原因："
    echo "  - cpolar 正在连接中，请稍后刷新监控面板"
    echo "  - 网络连接问题"
    echo ""
    echo "请手动查看 cpolar 控制台获取公网地址："
    echo "  1. 打开浏览器访问 ${CYAN}http://127.0.0.1:4040${NC}"
    echo "  2. 或查看日志: tail -f logs/tunnel.log"
    echo ""
    
    # 先打开浏览器，让用户可以手动刷新
    open_split_screen_browsers
    
    show_access_info "local"
    echo ""
    echo -e "${YELLOW}提示：获取到公网URL后，可以手动设置：${NC}"
    echo "  curl -X POST http://localhost:3002/api/set-tunnel-url \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"url\": \"https://您的地址.cpolar.cn\", \"mode\": \"cpolar\"}'"
  fi
  
  echo ""
  read -p "$TXT_PRESS_ENTER" < /dev/tty
}

# ═══════════════════════════════════════════════════════════════════
# 双机模式 - 演员机
# 功能：运行 MediaPipe 动捕 + 本地 Max MSP
# OSC 发送到 127.0.0.1:7400（本地，零延迟）
# ═══════════════════════════════════════════════════════════════════
start_performer_machine() {
  echo ""
  echo -e "${CYAN}🎭 ${TXT_START_PERFORMER_MACHINE}${NC}"
  echo -e "${WHITE}   (MediaPipe + Max MSP)${NC}"
  echo ""
  
  # 停止已有进程
  if [ -f .pids/performer1.pid ]; then
    kill -9 $(cat .pids/performer1.pid) 2>/dev/null
  fi
  kill -9 $(lsof -ti:3000) 2>/dev/null
  sleep 1
  
  mkdir -p logs .pids
  
  # 演员机配置：OSC 发送到本地（不广播）
  export PERFORMER_ID=1
  export OSC_PORT=7400
  export PORT=3000
  export USE_BROADCAST=false  # 本地模式，不广播
  export OSC_HOST=127.0.0.1   # 发送到本地 Max MSP
  
  nohup npm start > logs/performer1.log 2>&1 &
  echo $! > .pids/performer1.pid
  
  sleep 2
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_PERFORMER_MACHINE_STARTED}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🎭 ${TXT_PERFORMER_CONFIG}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${PURPLE}📹 ${TXT_MEDIAPIPE} ${TXT_MOTION_CAPTURE}${NC}"
  echo -e "     ${CYAN}http://localhost:3000/mocap/?performer=1${NC}"
  echo ""
  echo -e "  ${PURPLE}🎮 ${TXT_MAXMSP_CONFIG}${NC}"
  echo -e "     ${TXT_MAXMSP_PERFORMER_OSC}: ${GREEN}[udpreceive 7400]${NC}"
  echo -e "     ${TXT_MAXMSP_AUDIENCE_OSC}: ${GREEN}[udpreceive 7402]${NC} ${YELLOW}${TXT_OSC_RECEIVE_VISUAL}${NC}"
  echo ""
  echo -e "  ${PURPLE}📡 ${TXT_OSC_FLOW}${NC}"
  echo -e "     MediaPipe → 127.0.0.1:7400 → Max MSP ${GREEN}(${TXT_LOCAL_ZERO_LATENCY})${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${YELLOW}💡 ${TXT_TIP}：${NC}"
  echo -e "     1. ${TXT_DUAL_HINT1} [udpreceive 7400] 和 [udpreceive 7402]"
  echo -e "     2. ${TXT_DUAL_HINT2}"
  echo -e "     3. ${TXT_AUDIENCE_WIFI}"
  echo ""
  
  # 打开 MediaPipe 页面
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_PAGE}${NC}"
    open "http://localhost:3000/mocap/?performer=1"
  fi
  
  echo ""
  read -p "$TXT_PRESS_ENTER" < /dev/tty
}

# ═══════════════════════════════════════════════════════════════════
# 双机模式 - 视觉机
# 功能：运行观众触摸系统 + 粒子投影
# OSC 广播到 7402（演员机 Max MSP 自动接收）
# ═══════════════════════════════════════════════════════════════════
start_visual_machine() {
  echo ""
  echo -e "${CYAN}👁️  ${TXT_START_VISUAL_MACHINE}${NC}"
  echo ""
  
  # 停止已有进程
  if [ -f .pids/audience.pid ]; then
    kill -9 $(cat .pids/audience.pid) 2>/dev/null
  fi
  kill -9 $(lsof -ti:3002) 2>/dev/null
  sleep 1
  
  mkdir -p logs .pids
  
  # 视觉机配置：OSC 广播（演员机会自动收到）
  export PERFORMER_ID=audience
  export OSC_PORT=7402
  export PORT=3002
  export USE_BROADCAST=true  # 广播模式，演员机自动收到
  
  nohup npm start > logs/audience.log 2>&1 &
  echo $! > .pids/audience.pid
  
  # 清除公网URL，使用本地二维码
  sleep 2
  curl -s -X POST http://localhost:3002/api/clear-tunnel-url > /dev/null 2>&1
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_VISUAL_MACHINE_STARTED}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  👁️  ${TXT_VISUAL_CONFIG}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${PURPLE}📺 ${TXT_PROJECTION}${NC}"
  echo -e "     ${CYAN}http://localhost:3002/?performer=audience${NC}"
  echo ""
  echo -e "  ${PURPLE}📱 ${TXT_AUDIENCE_PHONE}${NC}"
  echo -e "     ${CYAN}http://${LOCAL_IP}:3002/audience-touch/${NC}"
  echo -e "     ${YELLOW}(${TXT_AUDIENCE_WIFI})${NC}"
  echo ""
  echo -e "  ${PURPLE}📡 ${TXT_OSC_FLOW}${NC}"
  echo -e "     ${TXT_AUDIENCE} → :7402 → ${TXT_PERFORMER_MACHINE} Max MSP ${GREEN}(${TXT_AUTO_RECEIVE})${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${YELLOW}💡 ${TXT_TIP}：${NC}"
  echo -e "     1. ${TXT_DUAL_HINT3}"
  echo -e "     2. ${TXT_PERFORMER_MACHINE} Max MSP [udpreceive 7402] ${TXT_OSC_RECEIVE_VISUAL}"
  echo -e "     3. ${TXT_AUDIENCE_WIFI}"
  echo ""
  
  # 打开投影页面
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_PAGE}${NC}"
    open "http://localhost:3002/?performer=audience"
  fi
  
  echo ""
  read -p "$TXT_PRESS_ENTER" < /dev/tty
}

# ═══════════════════════════════════════════════════════════════════
# 双机模式 - 视觉机 + 公网观众 (Cloudflare)
# ═══════════════════════════════════════════════════════════════════
start_visual_machine_cloudflare() {
  echo ""
  echo -e "${CYAN}🌐 ${TXT_START_VISUAL_CLOUDFLARE}${NC}"
  echo ""
  
  # 检查 cloudflared
  CLOUDFLARED_CMD=""
  if [ -x "$SCRIPT_DIR/cloudflared" ]; then
    CLOUDFLARED_CMD="$SCRIPT_DIR/cloudflared"
    echo -e "${GREEN}✓ ${TXT_USE_LOCAL} cloudflared${NC}"
  elif command -v cloudflared &> /dev/null; then
    CLOUDFLARED_CMD="cloudflared"
    echo -e "${GREEN}✓ ${TXT_USE_SYSTEM} cloudflared${NC}"
  else
    echo -e "${RED}❌ cloudflared ${TXT_NOT_FOUND}${NC}"
    echo ""
    echo -e "${YELLOW}请先安装 cloudflared：${NC}"
    echo ""
    echo -e "  ${CYAN}方法 1：Homebrew (推荐)${NC}"
    echo "    brew install cloudflared"
    echo ""
    echo -e "  ${CYAN}方法 2：手动下载${NC}"
    echo "    访问: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    echo "    下载 macOS .pkg 安装包并双击安装"
    echo ""
    read -p "$TXT_PRESS_ENTER" < /dev/tty
    return
  fi
  
  # 停止已有进程
  if [ -f .pids/audience.pid ]; then
    kill -9 $(cat .pids/audience.pid) 2>/dev/null
  fi
  if [ -f .pids/tunnel.pid ]; then
    kill -9 $(cat .pids/tunnel.pid) 2>/dev/null
  fi
  pkill -f "cloudflared tunnel" 2>/dev/null
  kill -9 $(lsof -ti:3002) 2>/dev/null
  sleep 1
  
  mkdir -p logs .pids
  
  # 启动观众系统（广播 OSC 到演员机）
  echo -e "${YELLOW}${TXT_START_AUDIENCE}${NC}"
  export PERFORMER_ID=audience
  export OSC_PORT=7402
  export PORT=3002
  export USE_BROADCAST=true
  nohup npm start > logs/audience.log 2>&1 &
  echo $! > .pids/audience.pid
  sleep 2
  
  # 启动 Cloudflare 隧道
  echo -e "${YELLOW}${TXT_CREATE_TUNNEL}${NC}"
  nohup $CLOUDFLARED_CMD tunnel --url http://localhost:3002 > logs/tunnel.log 2>&1 &
  echo $! > .pids/tunnel.pid
  
  echo -e "${YELLOW}${TXT_WAIT_TUNNEL}${NC}"
  sleep 5
  
  # 获取公网 URL
  PUBLIC_URL=""
  for i in {1..10}; do
    PUBLIC_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' logs/tunnel.log 2>/dev/null | head -1)
    [ -n "$PUBLIC_URL" ] && break
    sleep 1
  done
  
  # 设置公网 URL
  if [ -n "$PUBLIC_URL" ]; then
    curl -s -X POST http://localhost:3002/api/set-tunnel-url \
      -H "Content-Type: application/json" \
      -d "{\"url\": \"$PUBLIC_URL\", \"mode\": \"cloudflare\"}" > /dev/null 2>&1
  fi
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_VISUAL_CLOUDFLARE_STARTED}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  👁️  ${TXT_VISUAL_CONFIG} (Cloudflare)${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${PURPLE}📺 ${TXT_PROJECTION}${NC}"
  echo -e "     ${CYAN}http://localhost:3002/?performer=audience${NC}"
  echo ""
  if [ -n "$PUBLIC_URL" ]; then
    echo -e "  ${GREEN}🌍 ${TXT_PUBLIC_ENTRY}${NC}"
    echo -e "     ${WHITE}${PUBLIC_URL}/audience-touch/${NC}"
  else
    echo -e "  ${YELLOW}⚠️  ${TXT_CANNOT_GET_URL}${NC}"
  fi
  echo ""
  echo -e "  ${PURPLE}📡 ${TXT_OSC_FLOW}${NC}"
  echo -e "     ${TXT_AUDIENCE} → :7402 → ${TXT_PERFORMER_MACHINE} Max MSP"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${YELLOW}💡 ${TXT_TIP}：${NC}"
  echo -e "     1. ${TXT_DUAL_HINT4}"
  echo -e "     2. ${TXT_AUDIENCE_WIFI}"
  echo -e "     3. ${TXT_AUDIENCE_4G}"
  echo ""
  
  # 打开投影页面
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_PAGE}${NC}"
    open "http://localhost:3002/?performer=audience"
  fi
  
  echo ""
  read -p "$TXT_PRESS_ENTER" < /dev/tty
}

# ═══════════════════════════════════════════════════════════════════
# 双机模式 - 视觉机 + 公网观众 (cpolar)
# ═══════════════════════════════════════════════════════════════════
start_visual_machine_cpolar() {
  echo ""
  echo -e "${CYAN}🇨🇳 ${TXT_START_VISUAL_CPOLAR}${NC}"
  echo ""
  
  # 检查 cpolar
  CPOLAR_CMD=""
  if [ -x "$SCRIPT_DIR/cpolar" ]; then
    CPOLAR_CMD="$SCRIPT_DIR/cpolar"
    echo -e "${GREEN}✓ ${TXT_USE_LOCAL} cpolar${NC}"
  elif command -v cpolar &> /dev/null; then
    CPOLAR_CMD="cpolar"
    echo -e "${GREEN}✓ ${TXT_USE_SYSTEM} cpolar${NC}"
  else
    echo -e "${RED}❌ cpolar ${TXT_NOT_FOUND}${NC}"
    echo ""
    echo -e "${YELLOW}请先安装 cpolar：${NC}"
    echo "  1. 访问 https://www.cpolar.com 注册"
    echo "  2. 下载并安装 cpolar"
    echo "  3. 运行 cpolar authtoken <您的token>"
    echo ""
    read -p "$TXT_PRESS_ENTER" < /dev/tty
    return
  fi
  
  # 停止已有进程
  if [ -f .pids/audience.pid ]; then
    kill -9 $(cat .pids/audience.pid) 2>/dev/null
  fi
  pkill -f cpolar 2>/dev/null
  kill -9 $(lsof -ti:3002) 2>/dev/null
  sleep 2
  
  mkdir -p logs .pids
  
  # 启动观众系统（广播 OSC 到演员机）
  echo -e "${YELLOW}${TXT_START_AUDIENCE}${NC}"
  export PERFORMER_ID=audience
  export OSC_PORT=7402
  export PORT=3002
  export USE_BROADCAST=true
  nohup npm start > logs/audience.log 2>&1 &
  echo $! > .pids/audience.pid
  sleep 2
  
  # 启动 cpolar 隧道
  echo -e "${YELLOW}${TXT_CREATE_TUNNEL_CHINA}${NC}"
  nohup $CPOLAR_CMD http 3002 > logs/tunnel.log 2>&1 &
  echo $! > .pids/tunnel.pid
  
  echo -e "${YELLOW}${TXT_WAIT_TUNNEL_SECONDS}${NC}"
  
  # 获取公网 URL
  PUBLIC_URL=""
  for i in {1..20}; do
    sleep 1
    echo -n "."
    PUBLIC_URL=$(curl -s http://127.0.0.1:4040/http/in 2>/dev/null | grep -oE 'https://[a-zA-Z0-9.-]+\.cpolar\.(cn|top|io|cc)' | head -1)
    if [ -n "$PUBLIC_URL" ]; then
      break
    fi
    PUBLIC_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.cpolar\.(cn|top|io|cc)' logs/tunnel.log 2>/dev/null | head -1)
    if [ -n "$PUBLIC_URL" ]; then
      break
    fi
  done
  echo ""
  
  # 设置公网 URL
  if [ -n "$PUBLIC_URL" ]; then
    curl -s -X POST http://localhost:3002/api/set-tunnel-url \
      -H "Content-Type: application/json" \
      -d "{\"url\": \"$PUBLIC_URL\", \"mode\": \"cpolar\"}" > /dev/null 2>&1
  fi
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_VISUAL_CLOUDFLARE_STARTED}${NC}"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  👁️  ${TXT_VISUAL_CONFIG} (cpolar)${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${PURPLE}📺 ${TXT_PROJECTION}${NC}"
  echo -e "     ${CYAN}http://localhost:3002/?performer=audience${NC}"
  echo ""
  if [ -n "$PUBLIC_URL" ]; then
    echo -e "  ${GREEN}🇨🇳 ${TXT_PUBLIC_ENTRY}${NC}"
    echo -e "     ${WHITE}${PUBLIC_URL}/audience-touch/${NC}"
  else
    echo -e "  ${YELLOW}⚠️  ${TXT_CANNOT_GET_URL}${NC}"
  fi
  echo ""
  echo -e "  ${PURPLE}📡 ${TXT_OSC_FLOW}${NC}"
  echo -e "     ${TXT_AUDIENCE} → :7402 → ${TXT_PERFORMER_MACHINE} Max MSP"
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${YELLOW}💡 ${TXT_TIP}：${NC}"
  echo -e "     1. ${TXT_DUAL_HINT4}"
  echo -e "     2. ${TXT_AUDIENCE_WIFI}"
  echo -e "     3. ${TXT_AUDIENCE_4G}"
  echo ""
  
  # 打开投影页面
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}🖥️  ${TXT_OPEN_PAGE}${NC}"
    open "http://localhost:3002/?performer=audience"
  fi
  
  echo ""
  read -p "$TXT_PRESS_ENTER" < /dev/tty
}

# 显示访问地址 / Show access URLs
show_access_info() {
  local mode=$1
  local public_url=$2
  
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  📍 ${TXT_ACCESS_URLS}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${PURPLE}🎭 ${TXT_PERFORMER_SYSTEM}${NC}"
  echo -e "     ${TXT_OSC_CONTROLLER}: ${CYAN}http://localhost:3000/?performer=1${NC}"
  echo -e "     ${TXT_MEDIAPIPE}:  ${CYAN}http://localhost:3000/mocap/?performer=1${NC}"
  echo ""
  echo -e "  ${PURPLE}👥 ${TXT_AUDIENCE_SYSTEM}${NC}"
  echo -e "     ${TXT_MONITOR_PANEL}:   ${CYAN}http://localhost:3002/?performer=audience${NC}"
  
  if [ "$mode" = "tunnel" ] && [ -n "$public_url" ]; then
    echo ""
    echo -e "  ${GREEN}🌍 ${TXT_PUBLIC_ENTRY} [Cloudflare ${TXT_CLOUDFLARE}]${NC}"
    echo -e "     ${WHITE}${public_url}/audience-touch/${NC}"
    echo ""
    echo -e "     ${YELLOW}📱 ${TXT_AUDIENCE_4G}${NC}"
  elif [ "$mode" = "tunnel_china" ] && [ -n "$public_url" ]; then
    echo ""
    echo -e "  ${GREEN}🇨🇳 ${TXT_PUBLIC_ENTRY} [cpolar ${TXT_CPOLAR}]${NC}"
    echo -e "     ${WHITE}${public_url}/audience-touch/${NC}"
    echo ""
    echo -e "     ${YELLOW}📱 ${TXT_AUDIENCE_4G}${NC}"
  else
    echo -e "     ${TXT_LOCAL_ENTRY}:   ${CYAN}http://${LOCAL_IP}:3002/audience-touch/${NC}"
    echo ""
    echo -e "     ${YELLOW}📱 ${TXT_AUDIENCE_WIFI}${NC}"
  fi
  
  echo ""
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${WHITE}  🎮 ${TXT_MAXMSP_CONFIG}${NC}"
  echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "     ${TXT_PERFORMER}: [udpreceive 7400]"
  echo "     ${TXT_AUDIENCE}: [udpreceive 7402]"
  echo ""
}

# 停止所有系统 / Stop all systems
stop_all() {
  echo ""
  echo -e "${RED}🛑 ${TXT_STOPPING}${NC}"
  echo ""
  
  ./stop-all.sh 2>/dev/null
  
  echo ""
  echo -e "${GREEN}✅ ${TXT_ALL_STOPPED}${NC}"
  echo ""
  
  read -p "$TXT_PRESS_ENTER" < /dev/tty
}

# 主循环 / Main Loop
main() {
  while true; do
    clear_screen
    show_logo
    show_status
    show_menu
    
    echo -n -e "  ${WHITE}${TXT_SELECT} [1-9, L, q]: ${NC}"
    read choice
    
    case $choice in
      1)
        start_local_mode
        ;;
      2)
        start_tunnel_mode
        ;;
      3)
        start_tunnel_china_mode
        ;;
      4)
        start_performer_machine
        ;;
      5)
        start_visual_machine
        ;;
      6)
        start_visual_machine_cloudflare
        ;;
      7)
        start_visual_machine_cpolar
        ;;
      8)
        clear_screen
        show_logo
        show_access_info "local"
        echo ""
        read -p "${TXT_PRESS_ENTER}" < /dev/tty
        ;;
      9)
        stop_all
        ;;
      l|L)
        rm -f "$LANG_FILE"
        select_language
        # Reload script to apply new language immediately
        exec "$0"
        ;;
      q|Q)
        echo ""
        echo -e "${CYAN}👋 ${TXT_GOODBYE}${NC}"
        echo ""
        exit 0
        ;;
      *)
        echo ""
        echo -e "${RED}${TXT_INVALID}${NC}"
        sleep 1
        ;;
    esac
  done
}

# 运行
main


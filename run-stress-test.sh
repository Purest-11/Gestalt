#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════╗
# ║     ◈ Gestalt - Stress Test Launcher                               ║
# ║     支持本地模式和公网模式的一键压力测试                            ║
# ║     One-click stress test for local and public network modes       ║
# ║                                                                    ║
# ║  Usage / 使用方法:                                                 ║
# ║    ./run-stress-test.sh           # Interactive menu / 交互式菜单  ║
# ║    ./run-stress-test.sh local     # Local mode / 本地模式          ║
# ║    ./run-stress-test.sh public    # Public mode / 公网模式         ║
# ╚════════════════════════════════════════════════════════════════════╝

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check for command line argument
CLI_MODE="$1"

# ═══════════════════════════════════════════════════════════════════
# Language Selection
# ═══════════════════════════════════════════════════════════════════

LANG_FILE="$SCRIPT_DIR/.test_lang"
if [ -f "$LANG_FILE" ]; then
    LANG_CHOICE=$(cat "$LANG_FILE")
else
    LANG_CHOICE=""
fi

select_language() {
    clear
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}                    🌍 Language / 语言                      ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} English"
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
    
    echo "$LANG_CHOICE" > "$LANG_FILE"
}

# Handle language selection
if [ -z "$LANG_CHOICE" ]; then
    if [ -n "$CLI_MODE" ]; then
        # Non-interactive mode: default to English
        LANG_CHOICE="en"
    else
        # Interactive mode: ask user
        select_language
    fi
fi

# ═══════════════════════════════════════════════════════════════════
# i18n Text Definitions (as a function for dynamic reload)
# ═══════════════════════════════════════════════════════════════════

load_i18n() {
    if [ "$LANG_CHOICE" = "zh" ]; then
        TXT_TITLE="Gestalt - 压力测试"
        TXT_SUBTITLE="验证系统在不同并发规模下的性能表现"
        TXT_SELECT_MODE="请选择测试模式"
        TXT_LOCAL_MODE="本地模式测试"
        TXT_LOCAL_DESC="测试本地服务器性能，无需网络隧道"
        TXT_PUBLIC_MODE="国际公网模式测试"
        TXT_PUBLIC_DESC="通过 Cloudflare 隧道测试公网延迟"
        TXT_CHANGE_LANG="切换语言"
        TXT_EXIT="退出"
        TXT_SELECT="请选择"
        TXT_STARTING_SERVER="启动服务器..."
        TXT_SERVER_STARTED="服务器已启动"
        TXT_SERVER_FAILED="服务器启动失败"
        TXT_WAITING_SERVER="等待服务器就绪"
        TXT_STARTING_TUNNEL="启动 Cloudflare 隧道..."
        TXT_TUNNEL_STARTED="隧道已建立"
        TXT_TUNNEL_FAILED="隧道建立失败"
        TXT_WAITING_TUNNEL="等待隧道建立（约10秒）..."
        TXT_TUNNEL_URL="公网地址"
        TXT_RUNNING_TEST="运行压力测试..."
        TXT_STOPPING_SERVER="关闭服务器..."
        TXT_STOPPING_TUNNEL="关闭隧道..."
        TXT_SERVER_STOPPED="服务器已关闭"
        TXT_TUNNEL_STOPPED="隧道已关闭"
        TXT_TEST_COMPLETE="压力测试完成！"
        TXT_CLOUDFLARED_NOT_FOUND="未找到 cloudflared"
        TXT_INSTALL_HINT="请先安装 cloudflared："
        TXT_METHOD="方法"
        TXT_HOMEBREW="Homebrew (推荐)"
        TXT_MANUAL="手动下载"
        TXT_VISIT="访问"
        TXT_PRESS_ENTER="按回车键返回..."
        TXT_NODE_NOT_FOUND="未找到 Node.js"
        TXT_INSTALL_NODE="请先安装 Node.js"
        TXT_DEPS_NOT_FOUND="未找到依赖包"
        TXT_RUN_NPM_INSTALL="请先运行: npm install"
        TXT_PORT_IN_USE="端口已被占用"
        TXT_USING_EXISTING="使用现有服务器"
        TXT_LATENCY_LOCAL="本地延迟: <5ms"
        TXT_LATENCY_PUBLIC="公网延迟: 50-200ms"
        TXT_TEST_FAILED="测试失败"
    else
        TXT_TITLE="Gestalt - Stress Test"
        TXT_SUBTITLE="Verify system performance under different concurrency levels"
        TXT_SELECT_MODE="Select Test Mode"
        TXT_LOCAL_MODE="Local Mode Test"
        TXT_LOCAL_DESC="Test local server performance, no tunnel required"
        TXT_PUBLIC_MODE="International Public Mode Test"
        TXT_PUBLIC_DESC="Test public network latency via Cloudflare tunnel"
        TXT_CHANGE_LANG="Change Language"
        TXT_EXIT="Exit"
        TXT_SELECT="Select"
        TXT_STARTING_SERVER="Starting server..."
        TXT_SERVER_STARTED="Server started"
        TXT_SERVER_FAILED="Server failed to start"
        TXT_WAITING_SERVER="Waiting for server to be ready"
        TXT_STARTING_TUNNEL="Starting Cloudflare tunnel..."
        TXT_TUNNEL_STARTED="Tunnel established"
        TXT_TUNNEL_FAILED="Tunnel failed to establish"
        TXT_WAITING_TUNNEL="Waiting for tunnel (about 10s)..."
        TXT_TUNNEL_URL="Public URL"
        TXT_RUNNING_TEST="Running stress test..."
        TXT_STOPPING_SERVER="Stopping server..."
        TXT_STOPPING_TUNNEL="Stopping tunnel..."
        TXT_SERVER_STOPPED="Server stopped"
        TXT_TUNNEL_STOPPED="Tunnel stopped"
        TXT_TEST_COMPLETE="Stress test completed!"
        TXT_CLOUDFLARED_NOT_FOUND="cloudflared not found"
        TXT_INSTALL_HINT="Please install cloudflared first:"
        TXT_METHOD="Method"
        TXT_HOMEBREW="Homebrew (Recommended)"
        TXT_MANUAL="Manual Download"
        TXT_VISIT="Visit"
        TXT_PRESS_ENTER="Press Enter to continue..."
        TXT_NODE_NOT_FOUND="Node.js not found"
        TXT_INSTALL_NODE="Please install Node.js first"
        TXT_DEPS_NOT_FOUND="Dependencies not found"
        TXT_RUN_NPM_INSTALL="Please run: npm install"
        TXT_PORT_IN_USE="Port already in use"
        TXT_USING_EXISTING="Using existing server"
        TXT_LATENCY_LOCAL="Local latency: <5ms"
        TXT_LATENCY_PUBLIC="Public latency: 50-200ms"
        TXT_TEST_FAILED="Test failed"
    fi
}

# Initial load of i18n texts
load_i18n

# ═══════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════

# Safe read that works in both interactive and non-interactive modes
safe_read() {
    if [ -n "$CLI_MODE" ]; then
        # Non-interactive mode, just wait a moment
        sleep 1
    else
        read -p "  ${TXT_PRESS_ENTER}" < /dev/tty 2>/dev/null || true
    fi
}

# ═══════════════════════════════════════════════════════════════════
# Dependency Checks
# ═══════════════════════════════════════════════════════════════════

check_node() {
    if ! command -v node &> /dev/null; then
        echo ""
        echo -e "${RED}❌ ${TXT_NODE_NOT_FOUND}${NC}"
        echo ""
        echo -e "${YELLOW}${TXT_INSTALL_NODE}:${NC}"
        echo ""
        echo -e "  ${CYAN}${TXT_METHOD} 1: ${TXT_HOMEBREW}${NC}"
        echo "    brew install node"
        echo ""
        echo -e "  ${CYAN}${TXT_METHOD} 2: ${TXT_MANUAL}${NC}"
        echo "    ${TXT_VISIT}: https://nodejs.org/"
        echo ""
        safe_read
        return 1
    fi
    return 0
}

check_dependencies() {
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo ""
        echo -e "${RED}❌ ${TXT_DEPS_NOT_FOUND}${NC}"
        echo ""
        echo -e "${YELLOW}${TXT_RUN_NPM_INSTALL}${NC}"
        echo ""
        safe_read
        return 1
    fi
    return 0
}

check_cloudflared() {
    CLOUDFLARED_CMD=""
    
    # Check local directory first
    if [ -x "$SCRIPT_DIR/cloudflared" ]; then
        CLOUDFLARED_CMD="$SCRIPT_DIR/cloudflared"
        return 0
    fi
    
    # Check system path
    if command -v cloudflared &> /dev/null; then
        CLOUDFLARED_CMD="cloudflared"
        return 0
    fi
    
    # Not found
    echo ""
    echo -e "${RED}❌ ${TXT_CLOUDFLARED_NOT_FOUND}${NC}"
    echo ""
    echo -e "${YELLOW}${TXT_INSTALL_HINT}${NC}"
    echo ""
    echo -e "  ${CYAN}${TXT_METHOD} 1: ${TXT_HOMEBREW}${NC}"
    echo "    brew install cloudflared"
    echo ""
    echo -e "  ${CYAN}${TXT_METHOD} 2: ${TXT_MANUAL}${NC}"
    echo "    ${TXT_VISIT}: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    echo ""
    if [ "$LANG_CHOICE" = "zh" ]; then
        echo -e "  ${CYAN}${TXT_METHOD} 3: 直接下载到项目目录${NC}"
        echo "    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz | tar xz"
        echo "    chmod +x cloudflared"
    else
        echo -e "  ${CYAN}${TXT_METHOD} 3: Download to project directory${NC}"
        echo "    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz | tar xz"
        echo "    chmod +x cloudflared"
    fi
    echo ""
    safe_read
    return 1
}

# ═══════════════════════════════════════════════════════════════════
# Test Functions
# ═══════════════════════════════════════════════════════════════════

SERVER_PID=""
TUNNEL_PID=""
SERVER_STARTED_BY_US=false
TUNNEL_STARTED_BY_US=false

cleanup() {
    # Stop server if we started it
    if [ "$SERVER_STARTED_BY_US" = true ] && [ -n "$SERVER_PID" ]; then
        echo -e "${YELLOW}🔌 ${TXT_STOPPING_SERVER}${NC}"
        kill $SERVER_PID 2>/dev/null
        for i in {1..10}; do
            if ! kill -0 $SERVER_PID 2>/dev/null; then
                echo -e "${GREEN}   ✅ ${TXT_SERVER_STOPPED}${NC}"
                break
            fi
            sleep 0.5
        done
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill -9 $SERVER_PID 2>/dev/null
        fi
    fi
    
    # Stop tunnel if we started it
    if [ "$TUNNEL_STARTED_BY_US" = true ] && [ -n "$TUNNEL_PID" ]; then
        echo -e "${YELLOW}🔌 ${TXT_STOPPING_TUNNEL}${NC}"
        kill $TUNNEL_PID 2>/dev/null
        pkill -f "cloudflared tunnel" 2>/dev/null
        echo -e "${GREEN}   ✅ ${TXT_TUNNEL_STOPPED}${NC}"
    fi
    
    # Clean temp files
    rm -f /tmp/osc-server-test.log /tmp/osc-tunnel-test.log
}

trap cleanup EXIT

start_server() {
    local PORT=$1
    
    # Check if server already running
    if lsof -ti :$PORT >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  ${TXT_PORT_IN_USE} ($PORT)${NC}"
        echo -e "${YELLOW}   ${TXT_USING_EXISTING}${NC}"
        SERVER_STARTED_BY_US=false
        return 0
    fi
    
    echo -e "${GREEN}🚀 ${TXT_STARTING_SERVER}${NC}"
    
    # Start server
    node server.js > /tmp/osc-server-test.log 2>&1 &
    SERVER_PID=$!
    SERVER_STARTED_BY_US=true
    
    # Wait for server
    echo -n "   ${TXT_WAITING_SERVER}"
    for i in {1..20}; do
        sleep 0.5
        echo -n "."
        
        if lsof -ti :$PORT >/dev/null 2>&1; then
            echo ""
            echo -e "${GREEN}   ✅ ${TXT_SERVER_STARTED} (PID: $SERVER_PID)${NC}"
            return 0
        fi
        
        if ! kill -0 $SERVER_PID 2>/dev/null; then
            echo ""
            echo -e "${RED}   ❌ ${TXT_SERVER_FAILED}${NC}"
            cat /tmp/osc-server-test.log
            return 1
        fi
    done
    
    echo ""
    echo -e "${RED}   ❌ ${TXT_SERVER_FAILED}${NC}"
    return 1
}

start_tunnel() {
    echo -e "${GREEN}🌐 ${TXT_STARTING_TUNNEL}${NC}"
    
    # Kill any existing tunnel
    pkill -f "cloudflared tunnel" 2>/dev/null
    sleep 2
    
    # Start tunnel
    mkdir -p logs
    $CLOUDFLARED_CMD tunnel --url http://localhost:3000 > /tmp/osc-tunnel-test.log 2>&1 &
    TUNNEL_PID=$!
    TUNNEL_STARTED_BY_US=true
    
    echo -e "${YELLOW}   ${TXT_WAITING_TUNNEL}${NC}"
    
    # Wait for tunnel URL (up to 30 seconds)
    PUBLIC_URL=""
    for i in {1..30}; do
        sleep 1
        PUBLIC_URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' /tmp/osc-tunnel-test.log 2>/dev/null | head -1)
        if [ -n "$PUBLIC_URL" ]; then
            break
        fi
        
        if ! kill -0 $TUNNEL_PID 2>/dev/null; then
            echo -e "${RED}   ❌ ${TXT_TUNNEL_FAILED}${NC}"
            cat /tmp/osc-tunnel-test.log
            return 1
        fi
    done
    
    if [ -z "$PUBLIC_URL" ]; then
        echo -e "${RED}   ❌ ${TXT_TUNNEL_FAILED} - No URL obtained${NC}"
        return 1
    fi
    
    echo -e "${CYAN}   🌍 ${TXT_TUNNEL_URL}: ${PUBLIC_URL}${NC}"
    
    # Verify tunnel is actually accessible (critical step!)
    if [ "$LANG_CHOICE" = "zh" ]; then
        echo -e "${YELLOW}   🔍 验证隧道连通性（最多等待30秒）...${NC}"
    else
        echo -e "${YELLOW}   🔍 Verifying tunnel connectivity (up to 30s)...${NC}"
    fi
    
    TUNNEL_READY=false
    for attempt in {1..15}; do
        # Check if tunnel process is still running
        if ! kill -0 $TUNNEL_PID 2>/dev/null; then
            echo ""
            echo -e "${RED}   ❌ Tunnel process died${NC}"
            cat /tmp/osc-tunnel-test.log 2>/dev/null | tail -10
            return 1
        fi
        
        # Method 1: Check if we can resolve the hostname
        DOMAIN=$(echo "$PUBLIC_URL" | sed 's|https://||' | sed 's|/.*||')
        if host "$DOMAIN" >/dev/null 2>&1 || nslookup "$DOMAIN" >/dev/null 2>&1; then
            # Method 2: Try HTTP request
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 8 --max-time 15 "$PUBLIC_URL" 2>/dev/null || echo "000")
            
            # Any response means the tunnel is working (even 400/500 errors mean we reached the server)
            if [ "$HTTP_CODE" != "000" ]; then
                TUNNEL_READY=true
                break
            fi
        fi
        
        echo -n "."
        sleep 2
    done
    echo ""
    
    if [ "$TUNNEL_READY" = true ]; then
        echo -e "${GREEN}   ✅ ${TXT_TUNNEL_STARTED}${NC}"
        # Give extra time for tunnel to stabilize
        if [ "$LANG_CHOICE" = "zh" ]; then
            echo -e "${YELLOW}   ⏳ 等待隧道稳定（5秒）...${NC}"
        else
            echo -e "${YELLOW}   ⏳ Waiting for tunnel to stabilize (5s)...${NC}"
        fi
        sleep 5
        return 0
    else
        if [ "$LANG_CHOICE" = "zh" ]; then
            echo -e "${RED}   ❌ 隧道无法访问${NC}"
            echo -e "${YELLOW}   💡 可能原因：网络限制、防火墙、或 Cloudflare 服务问题${NC}"
            echo -e "${YELLOW}   💡 请尝试：检查网络连接，或稍后重试${NC}"
        else
            echo -e "${RED}   ❌ Tunnel not accessible${NC}"
            echo -e "${YELLOW}   💡 Possible causes: network restrictions, firewall, or Cloudflare service issues${NC}"
            echo -e "${YELLOW}   💡 Try: check network connection, or retry later${NC}"
        fi
        return 1
    fi
}

run_local_test() {
    clear
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     🎯 ${TXT_LOCAL_MODE}                                    ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${WHITE}   ${TXT_LATENCY_LOCAL}${NC}"
    echo ""
    
    # Start server
    if ! start_server 3000; then
        safe_read
        return
    fi
    
    echo ""
    echo -e "${GREEN}🧪 ${TXT_RUNNING_TEST}${NC}"
    echo ""
    
    # Run test with local URL, pass language setting
    STRESS_TEST_LANG="$LANG_CHOICE" node tests/stress-test.js "ws://localhost:3000"
    TEST_EXIT_CODE=$?
    
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ ${TXT_TEST_COMPLETE}${NC}"
    else
        echo -e "${RED}❌ ${TXT_TEST_FAILED}${NC}"
    fi
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    safe_read
}

run_public_test() {
    clear
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     🌐 ${TXT_PUBLIC_MODE}                       ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${WHITE}   ${TXT_LATENCY_PUBLIC}${NC}"
    echo ""
    
    # Check cloudflared
    if ! check_cloudflared; then
        return
    fi
    
    # Start server
    if ! start_server 3000; then
        safe_read
        return
    fi
    
    echo ""
    
    # Start tunnel
    if ! start_tunnel; then
        safe_read
        return
    fi
    
    echo ""
    echo -e "${GREEN}🧪 ${TXT_RUNNING_TEST}${NC}"
    echo ""
    
    # Verify tunnel URL is valid before proceeding
    if [ -z "$PUBLIC_URL" ]; then
        echo -e "${RED}   ❌ ${TXT_TUNNEL_FAILED} - No URL obtained${NC}"
        safe_read
        return
    fi
    
    # Convert https to wss for WebSocket
    WS_URL=$(echo "$PUBLIC_URL" | sed 's/https:/wss:/')
    
    # Verify the WebSocket URL was converted correctly
    if [ -z "$WS_URL" ] || [ "$WS_URL" = "$PUBLIC_URL" ]; then
        echo -e "${RED}   ❌ Invalid WebSocket URL: $WS_URL${NC}"
        safe_read
        return
    fi
    
    echo -e "${CYAN}   🔗 WebSocket URL: $WS_URL${NC}"
    echo ""
    
    # Run test with public URL, pass language setting
    STRESS_TEST_LANG="$LANG_CHOICE" node tests/stress-test.js "$WS_URL"
    TEST_EXIT_CODE=$?
    
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ ${TXT_TEST_COMPLETE}${NC}"
    else
        echo -e "${RED}❌ ${TXT_TEST_FAILED}${NC}"
    fi
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    safe_read
}

# ═══════════════════════════════════════════════════════════════════
# Main Menu
# ═══════════════════════════════════════════════════════════════════

show_menu() {
    clear
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}     🎯 ${WHITE}${TXT_TITLE}${NC}                           ${CYAN}║${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}     ${TXT_SUBTITLE}          ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${WHITE}${TXT_SELECT_MODE}:${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} 🖥️  ${TXT_LOCAL_MODE}"
    echo -e "      ${WHITE}${TXT_LOCAL_DESC}${NC}"
    echo ""
    echo -e "  ${CYAN}2)${NC} 🌐 ${TXT_PUBLIC_MODE} ${GREEN}[Cloudflare]${NC}"
    echo -e "      ${WHITE}${TXT_PUBLIC_DESC}${NC}"
    echo ""
    echo -e "  ${PURPLE}─────────────────────────────────────────────────────${NC}"
    echo ""
    echo -e "  ${CYAN}L)${NC} 🌍 ${TXT_CHANGE_LANG}"
    echo -e "  ${CYAN}Q)${NC} 🚪 ${TXT_EXIT}"
    echo ""
    echo -n "  ${TXT_SELECT} [1/2/L/Q]: "
}

main() {
    # Check basic dependencies
    if ! check_node; then
        exit 1
    fi
    
    if ! check_dependencies; then
        exit 1
    fi
    
    # Handle command line arguments for non-interactive mode
    if [ -n "$CLI_MODE" ]; then
        case $CLI_MODE in
            local|1)
                run_local_test
                exit 0
                ;;
            public|2|cloudflare)
                run_public_test
                exit 0
                ;;
            *)
                echo "Usage: $0 [local|public]"
                echo "  local  - Run local mode test"
                echo "  public - Run public network test (Cloudflare)"
                exit 1
                ;;
        esac
    fi
    
    # Interactive mode
    while true; do
        show_menu
        read choice < /dev/tty 2>/dev/null || read choice
        
        case $choice in
            1)
                run_local_test
                ;;
            2)
                run_public_test
                ;;
            [Ll])
                rm -f "$LANG_FILE"
                select_language
                load_i18n  # Reload i18n texts immediately
                ;;
            [Qq])
                echo ""
                exit 0
                ;;
            *)
                ;;
        esac
    done
}

# Run main
main

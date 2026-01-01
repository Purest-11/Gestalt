#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 🐳 Docker 镜像加速器配置脚本
# 
# 解决中国大陆 Docker Hub 连接问题
# ═══════════════════════════════════════════════════════════════════

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}     🐳 ${WHITE}Docker 镜像加速器配置${NC}                            ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    DOCKER_CONFIG_DIR="$HOME/.docker"
    DAEMON_JSON="$HOME/.docker/daemon.json"
else
    OS="Linux"
    DOCKER_CONFIG_DIR="/etc/docker"
    DAEMON_JSON="/etc/docker/daemon.json"
fi

echo -e "${WHITE}检测到系统: ${CYAN}$OS${NC}"
echo ""

# 国内镜像源列表
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}  可用的镜像加速器${NC}"
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${CYAN}1)${NC} 阿里云（需登录获取专属地址）"
echo -e "     ${WHITE}https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors${NC}"
echo ""
echo -e "  ${CYAN}2)${NC} 腾讯云"
echo -e "     ${WHITE}https://mirror.ccs.tencentyun.com${NC}"
echo ""
echo -e "  ${CYAN}3)${NC} 网易云"
echo -e "     ${WHITE}https://hub-mirror.c.163.com${NC}"
echo ""
echo -e "  ${CYAN}4)${NC} 中科大"
echo -e "     ${WHITE}https://docker.mirrors.ustc.edu.cn${NC}"
echo ""
echo -e "  ${CYAN}5)${NC} Docker 官方中国镜像（可能不稳定）"
echo -e "     ${WHITE}https://registry.docker-cn.com${NC}"
echo ""
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ "$OS" == "macOS" ]]; then
    echo -e "${YELLOW}📝 macOS 配置方法：${NC}"
    echo ""
    echo "1. 点击菜单栏的 Docker 图标"
    echo "2. 选择 Settings（设置）"
    echo "3. 点击 Docker Engine"
    echo "4. 在 JSON 配置中添加："
    echo ""
    echo -e "${GREEN}{"
    echo '  "registry-mirrors": ['
    echo '    "https://mirror.ccs.tencentyun.com",'
    echo '    "https://hub-mirror.c.163.com",'
    echo '    "https://docker.mirrors.ustc.edu.cn"'
    echo '  ]'
    echo -e "}${NC}"
    echo ""
    echo "5. 点击 Apply & Restart"
    echo ""
    
    # 尝试自动打开 Docker 设置
    echo -e "${CYAN}是否自动打开 Docker Desktop 设置？${NC}"
    read -p "[y/N]: " open_settings < /dev/tty
    
    if [[ "$open_settings" =~ ^[Yy]$ ]]; then
        # 打开 Docker Desktop 并导航到设置
        osascript -e 'tell application "Docker" to activate' 2>/dev/null
        sleep 1
        osascript -e '
        tell application "System Events"
            tell process "Docker Desktop"
                keystroke "," using command down
            end tell
        end tell
        ' 2>/dev/null
        echo ""
        echo -e "${GREEN}✅ 已打开 Docker Desktop，请按照上述步骤配置${NC}"
    fi
    
else
    echo -e "${YELLOW}📝 Linux 配置方法：${NC}"
    echo ""
    echo "执行以下命令（需要 sudo 权限）："
    echo ""
    echo -e "${GREEN}sudo mkdir -p /etc/docker"
    echo 'sudo tee /etc/docker/daemon.json <<EOF'
    echo '{'
    echo '  "registry-mirrors": ['
    echo '    "https://mirror.ccs.tencentyun.com",'
    echo '    "https://hub-mirror.c.163.com",'
    echo '    "https://docker.mirrors.ustc.edu.cn"'
    echo '  ]'
    echo '}'
    echo 'EOF'
    echo -e "sudo systemctl daemon-reload"
    echo -e "sudo systemctl restart docker${NC}"
    echo ""
    
    echo -e "${CYAN}是否自动执行配置？${NC}"
    read -p "[y/N]: " auto_config < /dev/tty
    
    if [[ "$auto_config" =~ ^[Yy]$ ]]; then
        sudo mkdir -p /etc/docker
        sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
EOF
        sudo systemctl daemon-reload
        sudo systemctl restart docker
        echo ""
        echo -e "${GREEN}✅ 镜像加速器配置完成！${NC}"
    fi
fi

echo ""
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}  配置完成后${NC}"
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. 重启 Docker Desktop"
echo "2. 重新运行 ./docker-start.sh"
echo ""
echo -e "${YELLOW}💡 验证配置是否生效：${NC}"
echo "   docker info | grep -A 5 'Registry Mirrors'"
echo ""


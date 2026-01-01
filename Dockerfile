# ═══════════════════════════════════════════════════════════════════
# ◈ Gestalt - Docker Image
# 
# A Symbiotic Framework for Real-Time Collaboration 
# between Performers and Mass Audiences
# ═══════════════════════════════════════════════════════════════════

# 使用 Node.js 18 Alpine 版本（轻量级）
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 设置时区（可选，用于日志时间显示）
ENV TZ=Asia/Shanghai

# 安装必要的系统依赖
RUN apk add --no-cache \
    # 用于网络工具
    curl \
    # 用于健康检查
    wget

# 复制 package 文件
COPY package*.json ./

# 安装依赖（使用 npm ci 确保版本一致性）
RUN npm ci --only=production && \
    # 清理缓存减小镜像体积
    npm cache clean --force

# 复制源代码
COPY . .

# 创建日志目录
RUN mkdir -p logs

# 设置环境变量默认值
ENV NODE_ENV=production
ENV PORT=3000
ENV OSC_PORT=7400
ENV PERFORMER_ID=1
ENV USE_BROADCAST=true

# 暴露端口
# Web 服务端口（默认 3000，可通过 PORT 环境变量覆盖）
EXPOSE 3000 3001 3002
# OSC 端口（UDP）
EXPOSE 7400/udp 7401/udp 7402/udp

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

# 启动命令
CMD ["node", "server.js"]

# ═══════════════════════════════════════════════════════════════════
# Build:
#   docker build -t gestalt .
#
# Run:
#   docker run -p 3000:3000 -p 7400:7400/udp gestalt
#
# Or use docker-compose (recommended):
#   docker-compose up
# ═══════════════════════════════════════════════════════════════════


#!/bin/bash
# AutoDev 系统安装脚本

set -e

echo "🚀 AutoDev 多 Agent 分工全流程开发系统"
echo "======================================="
echo ""

# 1. 检查环境
echo "📋 检查环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：需要 Node.js >= 20.0.0"
    echo "   请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ 错误：需要 Node.js >= 20.0.0 (当前版本：$(node -v))"
    exit 1
fi
echo "   ✅ Node.js: $(node -v)"

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "❌ 错误：需要 Git"
    echo "   请先安装 Git: https://git-scm.com/"
    exit 1
fi
echo "   ✅ Git: $(git --version)"

# 检查 OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo "⚠️  警告：未检测到 OpenClaw 命令"
    echo "   请确保 OpenClaw 已安装并添加到 PATH"
fi
echo "   ✅ OpenClaw: 已检测"

echo ""

# 2. 安装依赖
echo "📦 安装依赖..."
if [ -f "package.json" ]; then
    npm install
    echo "   ✅ 依赖安装完成"
else
    echo "   ⚠️  未找到 package.json，跳过依赖安装"
fi
echo ""

# 3. 创建配置目录
echo "🔧 创建配置..."
mkdir -p config memory

# 创建默认配置
if [ ! -f "config/project.json" ]; then
    cat > config/project.json << 'EOF'
{
  "name": "your-project",
  "github": {
    "repo": "username/repo",
    "branch": "main"
  },
  "vercel": {
    "project": "your-project"
  },
  "constraints": {
    "max_tasks_per_day": 5,
    "require_approval_for": ["api_integration", "breaking_changes"]
  }
}
EOF
    echo "   ✅ 项目配置模板已创建 (config/project.json)"
fi

# 4. 配置密钥
echo ""
echo "🔐 配置密钥..."
echo "   请输入 GitHub Token (留空跳过):"
read -r GITHUB_TOKEN

echo "   请输入 Vercel Token (留空跳过):"
read -r VERCEL_TOKEN

if [ -n "$GITHUB_TOKEN" ] || [ -n "$VERCEL_TOKEN" ]; then
    cat > config/secrets.json << EOF
{
  "github_token": "$GITHUB_TOKEN",
  "vercel_token": "$VERCEL_TOKEN"
}
EOF
    echo "   ✅ 密钥已保存 (config/secrets.json)"
    echo "   ⚠️  注意：请勿将 secrets.json 提交到 Git"
fi

# 5. 添加到.gitignore
if ! grep -q "secrets.json" .gitignore 2>/dev/null; then
    echo "config/secrets.json" >> .gitignore
    echo "memory/*.json" >> .gitignore
    echo "   ✅ .gitignore 已更新"
fi

# 6. 创建初始状态文件
if [ ! -f "memory/state.json" ]; then
    cat > memory/state.json << 'EOF'
{
  "status": "initialized",
  "initializedAt": "$(date -Iseconds)",
  "projects": [],
  "activeAgents": [],
  "currentTask": null
}
EOF
    echo "   ✅ 状态文件已创建"
fi

# 7. 完成
echo ""
echo "======================================="
echo "✅ AutoDev 系统安装完成！"
echo ""
echo "📚 下一步："
echo "   1. 编辑 config/project.json 配置你的项目"
echo "   2. 运行：node scripts/add-project.js your-project"
echo "   3. 启动：node scripts/start.js"
echo ""
echo "📖 查看文档：cat README.md"
echo ""

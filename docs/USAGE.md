# AutoDev 系统使用文档

**版本**: 1.1.0
**更新时间**: 2026-03-25

---

## 🚀 快速开始

### 1. 安装

```bash
git clone https://github.com/nananyunxi/autodev-system.git
cd autodev-system
./install.sh
```

### 2. 配置项目

```bash
# 添加项目
node scripts/add-project.js my-project

# 编辑配置
cat > config/project.json << 'EOF'
{
  "name": "my-project",
  "github": {
    "repo": "username/repo",
    "branch": "main"
  },
  "vercel": {
    "project": "my-project"
  },
  "nicknames": {
    "user": "老大",
    "assistant": "小雅"
  }
}
EOF
```

### 3. 使用

```bash
# 方式 1：命令行
npm run coordinator "给项目加个搜索功能"

# 方式 2：OpenClaw 对话
在 OpenClaw 中对 AI 说："给项目加个搜索功能"
```

---

## 📋 核心功能

### 1. GitHub 集成

#### 检查 GitHub 状态

```bash
npm run github:check
```

**检查内容**:
- ✅ GitHub 登录状态
- ✅ 仓库配置
- ✅ 远程连接
- ✅ 提交历史

#### 提交代码

```bash
node scripts/github-integration.js commit "提交信息"
```

---

### 2. Vercel 集成

#### 检查 Vercel 状态

```bash
npm run vercel:check
```

**检查内容**:
- ✅ Vercel 登录状态
- ✅ 项目绑定
- ✅ 部署状态
- ✅ 访问验证

#### 验证部署

```bash
node scripts/vercel-integration.js verify
```

#### 功能验证

```bash
node scripts/vercel-integration.js feature "搜索功能" "/search"
```

---

### 3. 部署报告

#### 生成完整报告

```bash
npm run report "添加搜索功能"
```

**报告内容**:
- 📊 GitHub 状态
- 🌐 Vercel 部署状态
- ✅ 功能验证结果
- ⚠️ 问题与建议
- 📝 下一步建议

---

## 🎯 完整工作流程

### 场景 1：开发新功能

```bash
# 1. 启动 Coordinator
npm run coordinator "给项目加个搜索功能"

# 2. 系统自动：
#    - 分析需求级别
#    - 创建子 Agent
#    - 执行开发
#    - 提交代码
#    - 触发部署

# 3. 生成报告
npm run report "添加搜索功能"

# 4. 查看报告
cat memory/reports/deployment-report-*.md
```

### 场景 2：检查项目状态

```bash
# 检查 GitHub
npm run github:check

# 检查 Vercel
npm run vercel:check

# 生成状态报告
npm run report "项目状态检查"
```

### 场景 3：验证功能

```bash
# 验证部署
node scripts/vercel-integration.js verify

# 验证具体功能
node scripts/vercel-integration.js feature "搜索功能" "/search"
```

---

## 📊 报告解读

### GitHub 状态

| 状态 | 说明 | 解决方案 |
|------|------|----------|
| ✅ 已登录 | Git 配置正确 | 无需操作 |
| ❌ 未登录 | 未配置 Git 用户 | `git config --global user.name "Your Name"` |
| ✅ 已配置 | 仓库配置正确 | 无需操作 |
| ❌ 未配置 | 未配置仓库 | 编辑 `config/project.json` |

### Vercel 状态

| 状态 | 说明 | 解决方案 |
|------|------|----------|
| ✅ 已登录 | Vercel Token 已配置 | 无需操作 |
| ⚠️  未登录 | 未配置 Token | 设置 `VERCEL_TOKEN` 环境变量 |
| ✅ 可访问 | 部署成功 | 无需操作 |
| ❌ 无法访问 | 部署失败 | 查看 Vercel 控制台日志 |

---

## 🔧 配置说明

### config/project.json

```json
{
  "name": "项目名称",
  "github": {
    "repo": "用户名/仓库名",
    "branch": "分支名 (默认 main)"
  },
  "vercel": {
    "project": "Vercel 项目名"
  },
  "nicknames": {
    "user": "对用户的称呼",
    "assistant": "AI 助手名字"
  },
  "constraints": {
    "max_tasks_per_day": 5,
    "require_approval_for": ["api_integration", "breaking_changes"]
  }
}
```

### 环境变量

```bash
# GitHub Token (可选，用于 API 调用)
export GITHUB_TOKEN="ghp_xxx"

# Vercel Token (可选，用于获取详细部署状态)
export VERCEL_TOKEN="xxx"
```

---

## 📝 常见问题

### Q: GitHub 未登录怎么办？

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Q: Vercel 部署失败怎么办？

1. 检查 Vercel 控制台：https://vercel.com/dashboard
2. 查看部署日志
3. 检查构建错误
4. 修复后重新推送代码

### Q: 如何自定义称呼？

编辑 `config/project.json`:

```json
{
  "nicknames": {
    "user": "老板",
    "assistant": "AI 助手"
  }
}
```

### Q: 如何查看历史报告？

```bash
ls -la memory/reports/
cat memory/reports/deployment-report-*.md
```

---

## 🎯 最佳实践

### 1. 开发前检查

```bash
npm run github:check
npm run vercel:check
```

### 2. 开发后验证

```bash
npm run report "任务描述"
```

### 3. 定期清理

```bash
# 清理完成的 Agent (自动执行)
node scripts/openclaw-integration.js cleanup
```

---

## 📞 获取帮助

```bash
# 查看帮助
node scripts/coordinator.js
node scripts/github-integration.js
node scripts/vercel-integration.js
node scripts/report.js
```

---

## 📚 相关文档

- [README.md](../README.md) - 项目说明
- [IMPLEMENTATION.md](../IMPLEMENTATION.md) - 实现文档
- [PROJECT_BACKUP.md](../PROJECT_BACKUP.md) - 项目备份

---

**维护者**: AutoDev Team
**GitHub**: https://github.com/nananyunxi/autodev-system
**许可证**: MIT

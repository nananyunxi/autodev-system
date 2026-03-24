# AutoDev 全自动使用指南

**版本**: 2.0.0
**更新时间**: 2026-03-25

---

## 🚀 快速开始

### 1. 安装和配置

```bash
# 克隆仓库
git clone https://github.com/nananyunxi/autodev-system.git
cd autodev-system

# 安装
./install.sh

# 配置 Token
export GITHUB_TOKEN="ghp_xxx"
export VERCEL_TOKEN="vcp_xxx"

# 检查配置
npm run setup
```

### 2. 完整自动流程

```bash
# 启动全自动开发
npm run coordinator "给项目加个搜索功能"

# 系统自动:
# 1. 分析需求
# 2. 创建子 Agent
# 3. 执行代码修改
# 4. Git 提交
# 5. Vercel 部署
# 6. 发送报告到飞书
```

---

## 📋 完整工作流程

### 阶段 1：需求接收和分析

```bash
npm run coordinator "任务描述"
```

**系统自动执行**:
1. ✅ 接收用户需求
2. ✅ 分析需求级别（L1/L2/L3）
3. ✅ 创建 Analyzer Agent
4. ✅ 分析需求并输出规格
5. ✅ 发送任务启动通知

### 阶段 2：任务规划

**系统自动执行**:
1. ✅ 创建 Planner Agent
2. ✅ 制定开发计划
3. ✅ 输出任务列表
4. ✅ 发送进度更新

### 阶段 3：代码开发

**系统自动执行**:
1. ✅ 创建 Developer Agent
2. ✅ 定位需要修改的文件
3. ✅ 自动生成代码修改
4. ✅ Git add/commit/push
5. ✅ 发送开发完成通知

### 阶段 4：部署和验证

**系统自动执行**:
1. ✅ 创建 Deployer Agent
2. ✅ Vercel 自动部署
3. ✅ 检查部署状态
4. ✅ 验证功能
5. ✅ 查看部署日志（如有问题）

### 阶段 5：汇报和验收

**系统自动执行**:
1. ✅ 生成部署报告
2. ✅ 发送到飞书/微信/钉钉
3. ✅ 等待用户验收
4. ✅ 处理反馈

---

## 🔧 配置说明

### config/project.json

```json
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
  },
  "messaging": {
    "channel": "feishu",
    "target": "ou_xxx"
  },
  "constraints": {
    "max_tasks_per_day": 5,
    "require_approval_for": ["api_integration", "breaking_changes"]
  }
}
```

### 环境变量

```bash
# GitHub Token（必须）
export GITHUB_TOKEN="ghp_xxx"

# Vercel Token（必须）
export VERCEL_TOKEN="vcp_xxx"

# 可选：配置到 ~/.bashrc 永久生效
echo 'export GITHUB_TOKEN="ghp_xxx"' >> ~/.bashrc
echo 'export VERCEL_TOKEN="vcp_xxx"' >> ~/.bashrc
source ~/.bashrc
```

---

## 📊 消息通知

### 自动发送的消息类型

1. **任务启动通知**
   ```
   【任务启动】给项目加个搜索功能
   📊 任务级别：L1 - 自动执行
   ✅ 已创建 Agent...
   ```

2. **进度更新**
   ```
   【进度更新】给项目加个搜索功能
   📈 当前进度：50%
   ✅ 已完成：需求分析，任务规划
   🔄 进行中：代码开发
   ```

3. **部署报告**
   ```
   【部署完成】username/repo
   ✅ 部署状态:
   - GitHub: ✅ 正常
   - Vercel: ✅ 可访问
   🌐 访问地址：https://xxx.vercel.app
   ```

4. **请求批准（L3 任务）**
   ```
   【请示批准】接入支付 API
   🎯 技术方案：使用 Stripe...
   ⚠️ 需要确认：是否采用此方案？
   💡 回复"批准"开始执行
   ```

---

## 🎯 使用示例

### 示例 1：优化页面样式

```bash
npm run coordinator "优化自我介绍页面导航样式"
```

**自动执行**:
1. 分析需求 → L1 级别
2. 定位文件 → `src/app/skills/self-introduction/page.tsx`
3. 修改代码 → 调整 CSS 类名
4. Git 提交 → "优化页面导航样式"
5. Vercel 部署 → 自动触发
6. 发送报告 → 飞书

### 示例 2：添加新功能

```bash
npm run coordinator "给网站添加搜索功能"
```

**自动执行**:
1. 分析需求 → L3 级别（新功能）
2. 请求批准 → 发送消息给老大
3. 等待批准 → 老大回复"批准"
4. 创建文件 → `src/app/search/page.tsx`
5. 开发功能 → 搜索框、搜索结果
6. Git 提交 → "添加搜索功能"
7. Vercel 部署 → 自动触发
8. 发送报告 → 飞书

### 示例 3：Bug 修复

```bash
npm run coordinator "修复首页加载失败的问题"
```

**自动执行**:
1. 分析需求 → L1 级别（Bug 修复）
2. 定位问题 → 查看错误日志
3. 修复代码 → 修复 bug
4. Git 提交 → "修复首页加载问题"
5. Vercel 部署 → 自动触发
6. 验证修复 → 访问首页
7. 发送报告 → 飞书

---

## 🔍 监控和调试

### 查看状态

```bash
# 查看系统状态
npm run status

# 查看 Agent 状态
npm run agents:report

# 查看 GitHub 状态
npm run github:check

# 查看 Vercel 状态
npm run vercel:check
```

### 查看日志

```bash
# 查看消息记录
ls -la memory/message-records/

# 查看部署报告
ls -la memory/reports/

# 查看 Agent 状态
cat memory/agents-state.json
```

### 错误处理

**如果部署失败**:
```bash
# 1. 查看 Vercel 日志
npm run vercel:check

# 2. 系统自动分析错误
# 3. 自动修复（如可能）
# 4. 重新部署
# 5. 发送错误报告
```

---

## 📝 最佳实践

### 1. 配置检查

开发前运行：
```bash
npm run setup
```

确保：
- ✅ GitHub Token 已配置
- ✅ Vercel Token 已配置
- ✅ 项目配置正确

### 2. 任务描述

**好的描述**:
```
"优化自我介绍页面导航 - 移除顶部大箭头，底部按钮增加间距"
```

**不好的描述**:
```
"优化一下页面"
```

### 3. 监控进度

```bash
# 定期查看状态
npm run status

# 查看消息记录
cat memory/message-records/*.json
```

### 4. 错误恢复

```bash
# 如果任务卡住
# 1. 查看日志
# 2. 手动干预
# 3. 重新运行 coordinator
```

---

## 📚 相关文档

- [README.md](../README.md) - 项目说明
- [USAGE.md](USAGE.md) - 使用指南
- [IMPLEMENTATION.md](../IMPLEMENTATION.md) - 实现文档

---

**维护者**: AutoDev Team
**GitHub**: https://github.com/nananyunxi/autodev-system
**许可证**: MIT

# AutoDev 多 Agent 分工全流程开发系统

> 🤖 基于 OpenClaw 的全自动开发系统，适用于所有 GitHub+Vercel 项目

---

## 🎯 功能特性

- ✅ **多 Agent 分工协作** - 需求分析、任务规划、代码开发、部署监控
- ✅ **主 Agent 协调** - 小雅担任协调者，管理所有子 Agent
- ✅ **智能决策** - 需要确认时自动找老大，确认后传达执行
- ✅ **开箱即用** - 一键安装到其他 OpenClaw 环境
- ✅ **GitHub+Vercel 集成** - 自动提交、自动部署
- ✅ **状态跟踪** - 完整的任务日志和进度汇报

---

## 🚀 快速开始

### 系统要求

- OpenClaw 已安装并运行
- Node.js >= 20.0.0
- Git 已配置
- GitHub 账号
- Vercel 账号

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/nananyunxi/autodev-system.git
cd autodev-system

# 2. 运行安装脚本
./install.sh

# 3. 配置项目
node scripts/add-project.js your-project-name

# 4. 启动系统
node scripts/start.js
```

### 测试验证

用 Java 面试项目测试：

```bash
# 1. 进入 AutoDev 目录
cd autodev-system

# 2. 启动系统
node scripts/start.js

# 3. 在 OpenClaw 中对小雅说
"给 Java 面试网站加个搜索功能"

# 4. 观察执行过程
node scripts/status.js
```

### 配置说明

安装过程中需要配置：
- GitHub Token
- Vercel Token
- 项目仓库地址
- 部署配置

---

## 📋 Agent 分工

| Agent | 职责 | 触发条件 |
|-------|------|----------|
| **Coordinator** (主 Agent) | 协调所有 Agent，与老大沟通 | 持续运行 |
| **Analyzer** | 分析需求，输出规格文档 | 收到新需求 |
| **Planner** | 制定开发计划 | 需求确认后 |
| **Developer** | 编写代码，Git 提交 | 按计划执行 |
| **Deployer** | 监控部署，生成报告 | Git 提交后 |

---

## 💬 使用示例

### 方式 1：直接对话

```
你：小雅，给项目加个搜索功能

AutoDev:
1. 📊 需求分析中...
2. ✅ 需求报告已生成，请确认
3. 📋 任务规划中...
4. 🔨 开发中... (进度 50%)
5. 🚀 部署中...
6. ✅ 完成！访问地址：https://xxx.vercel.app
```

### 方式 2：添加项目任务

```bash
node scripts/add-task.js "添加用户登录功能"
```

---

## 📁 项目结构

```
autodev-system/
├── README.md              # 本文档
├── install.sh             # 安装脚本
├── package.json           # 依赖配置
├── config/
│   ├── project.json       # 项目配置
│   └── constraints.json   # 约束规则
├── agents/
│   ├── coordinator/       # 主 Agent
│   ├── analyzer/          # 需求分析
│   ├── planner/           # 任务规划
│   ├── developer/         # 代码开发
│   └── deployer/          # 部署监控
├── scripts/
│   ├── start.js           # 启动脚本
│   ├── add-project.js     # 添加项目
│   └── add-task.js        # 添加任务
├── templates/             # 模板文件
├── memory/                # 状态跟踪
└── docs/                  # 文档
```

---

## 🔧 配置说明

### 项目配置 (config/project.json)

```json
{
  "name": "项目名称",
  "github": {
    "repo": "用户名/仓库名",
    "branch": "main"
  },
  "vercel": {
    "project": "项目名"
  },
  "constraints": {
    "max_tasks_per_day": 5,
    "require_approval_for": ["api_integration", "breaking_changes"]
  }
}
```

### 约束规则 (config/constraints.json)

```json
{
  "L1_auto": ["文档更新", "小优化", "Bug 修复"],
  "L2_report": ["内容更新", "依赖升级"],
  "L3_ask": ["新功能", "架构变更", "API 接入"]
}
```

---

## 📊 状态跟踪

系统会实时跟踪状态到 `memory/` 目录：

- `state.json` - 当前系统状态
- `tasks.md` - 任务日志
- `reports/` - 日报/周报

---

## 🆘 故障排查

### 常见问题

**Q: 子 Agent 创建失败**
```bash
# 检查 OpenClaw 是否运行
openclaw status

# 重启 OpenClaw
openclaw gateway restart
```

**Q: GitHub 提交失败**
```bash
# 检查 Token 配置
cat config/secrets.json

# 重新配置
node scripts/configure.js
```

**Q: Vercel 部署失败**
```bash
# 检查项目配置
cat config/project.json

# 查看部署日志
node scripts/check-deploy.js
```

---

## 📝 开发日志

详见 `memory/tasks.md`

---

## 📄 许可证

MIT License

---

## 📝 更新日志

### v1.0.0 (2026-03-25)

- ✅ 初始版本发布
- ✅ 5 个 Agent 提示词模板
- ✅ 核心功能脚本
- ✅ 安装和配置系统
- ✅ 完整文档
- ✅ GitHub 仓库：https://github.com/nananyunxi/autodev-system

---

**版本**: 1.0.0
**创建时间**: 2026-03-25
**更新时间**: 2026-03-25
**维护者**: 小雅 (洛云的 AI 全能助手)
**GitHub**: https://github.com/nananyunxi/autodev-system

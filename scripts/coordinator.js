#!/usr/bin/env node
/**
 * AutoDev Coordinator (主 Agent) - 协调逻辑实现
 * 
 * 功能：
 * 1. 接收用户需求
 * 2. 分析需求级别（L1/L2/L3）
 * 3. 创建子 Agent（Analyzer/Planner/Developer/Deployer）
 * 4. 分配任务并监督执行
 * 5. 向用户汇报进度
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置路径
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const PROJECT_CONFIG = path.join(CONFIG_DIR, 'project.json');
const COORDINATOR_STATE = path.join(MEMORY_DIR, 'coordinator-state.json');

// 加载配置
function loadConfig() {
  if (!fs.existsSync(PROJECT_CONFIG)) {
    return {
      nicknames: {
        user: '用户',
        assistant: '助手'
      }
    };
  }
  return JSON.parse(fs.readFileSync(PROJECT_CONFIG, 'utf-8'));
}

// 初始化 Coordinator 状态
function initializeState() {
  const state = {
    status: 'idle',
    currentTask: null,
    activeAgents: [],
    completedAgents: [],
    pendingApproval: false,
    lastUpdate: new Date().toISOString()
  };
  
  fs.writeFileSync(COORDINATOR_STATE, JSON.stringify(state, null, 2));
  return state;
}

// 加载 Coordinator 状态
function loadState() {
  if (!fs.existsSync(COORDINATOR_STATE)) {
    return initializeState();
  }
  return JSON.parse(fs.readFileSync(COORDINATOR_STATE, 'utf-8'));
}

// 保存 Coordinator 状态
function saveState(state) {
  state.lastUpdate = new Date().toISOString();
  fs.writeFileSync(COORDINATOR_STATE, JSON.stringify(state, null, 2));
}

// 分析需求级别（L1/L2/L3）
function analyzeTaskLevel(taskDescription) {
  const L3_KEYWORDS = [
    '新功能', '架构', 'API', '数据库', 'breaking',
    '费用', '付费', '升级服务'
  ];
  
  const L2_KEYWORDS = [
    '内容更新', '依赖升级', '性能优化', '测试'
  ];
  
  const lowerDesc = taskDescription.toLowerCase();
  
  // 检查 L3
  for (const keyword of L3_KEYWORDS) {
    if (lowerDesc.includes(keyword.toLowerCase())) {
      return 'L3';
    }
  }
  
  // 检查 L2
  for (const keyword of L2_KEYWORDS) {
    if (lowerDesc.includes(keyword.toLowerCase())) {
      return 'L2';
    }
  }
  
  // 默认 L1
  return 'L1';
}

// 创建子 Agent
function createAgent(agentType, taskDescription) {
  console.log(`🤖 创建 ${agentType} Agent...`);
  
  try {
    // 调用 manage-agents.js
    const result = execSync(
      `node ${path.join(__dirname, 'manage-agents.js')} create ${agentType} "${taskDescription}"`,
      { encoding: 'utf-8' }
    );
    console.log(result);
    return true;
  } catch (error) {
    console.error(`❌ 创建 ${agentType} Agent 失败:`, error.message);
    return false;
  }
}

// 向用户汇报
function reportToUser(message, level = 'info') {
  const config = loadConfig();
  const userNickname = config.nicknames?.user || '用户';
  
  const emojis = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    question: '❓'
  };
  
  console.log(`\n${emojis[level] || '📋'} 【汇报】给${userNickname}：`);
  console.log(message);
  console.log('');
  
  // 在实际 OpenClaw 环境中，这里会调用 message 工具发送给用户
  // 当前使用 console.log 模拟
}

// 请求用户批准（L3 任务）
function requestApproval(taskDescription, analysis) {
  const config = loadConfig();
  const userNickname = config.nicknames?.user || '用户';
  
  const message = `
【请示】${taskDescription}

📋 需求分析
${userNickname}原始需求：${taskDescription}

🎯 技术方案
${analysis.technicalPlan || '待制定'}

⚠️ 需要确认
1. 是否采用此方案？
2. 优先级如何？

请${userNickname}批准后执行。
  `.trim();
  
  reportToUser(message, 'question');
  
  // 在实际环境中，这里会等待用户回复
  // 当前返回 false，需要手动确认
  return false;
}

// 主流程：处理用户需求
function handleUserRequest(taskDescription) {
  console.log('🚀 AutoDev Coordinator 启动');
  console.log('================================');
  console.log('');
  
  // 加载状态
  let state = loadState();
  state.status = 'analyzing';
  state.currentTask = taskDescription;
  saveState(state);
  
  // 1. 分析需求级别
  console.log('📊 分析需求级别...');
  const taskLevel = analyzeTaskLevel(taskDescription);
  console.log(`   需求级别：${taskLevel}`);
  console.log('');
  
  // 2. 根据级别处理
  if (taskLevel === 'L3') {
    // L3 任务：需要用户批准
    console.log('⚠️  L3 任务 - 需要用户批准');
    state.pendingApproval = true;
    saveState(state);
    
    const approval = requestApproval(taskDescription, {
      technicalPlan: '待 Analyzer Agent 分析'
    });
    
    if (!approval) {
      console.log('⏳ 等待用户批准...');
      return { status: 'pending_approval' };
    }
  } else if (taskLevel === 'L2') {
    // L2 任务：报备后执行
    console.log('📋 L2 任务 - 报备后执行');
    reportToUser(`【报备】${taskDescription}\n\n10 分钟内无叫停则执行`, 'warning');
  } else {
    // L1 任务：直接执行
    console.log('✅ L1 任务 - 直接执行');
  }
  
  // 3. 创建 Analyzer Agent
  console.log('');
  console.log('🔍 创建 Analyzer Agent...');
  if (!createAgent('analyzer', taskDescription)) {
    state.status = 'failed';
    saveState(state);
    return { status: 'failed', error: '创建 Analyzer Agent 失败' };
  }
  
  // 4. 等待 Analyzer 完成（模拟）
  console.log('⏳ 等待 Analyzer Agent 完成...');
  // 实际环境中这里会监听子 Agent 完成事件
  
  // 5. 创建 Planner Agent
  console.log('');
  console.log('📋 创建 Planner Agent...');
  if (!createAgent('planner', '根据需求分析制定开发计划')) {
    state.status = 'failed';
    saveState(state);
    return { status: 'failed', error: '创建 Planner Agent 失败' };
  }
  
  // 6. 创建 Developer Agent
  console.log('');
  console.log('🔨 创建 Developer Agent...');
  if (!createAgent('developer', '按计划执行开发')) {
    state.status = 'failed';
    saveState(state);
    return { status: 'failed', error: '创建 Developer Agent 失败' };
  }
  
  // 7. 创建 Deployer Agent
  console.log('');
  console.log('🚀 创建 Deployer Agent...');
  if (!createAgent('deployer', '监控部署状态')) {
    state.status = 'failed';
    saveState(state);
    return { status: 'failed', error: '创建 Deployer Agent 失败' };
  }
  
  // 8. 更新状态
  state.status = 'executing';
  state.activeAgents = ['analyzer', 'planner', 'developer', 'deployer'];
  saveState(state);
  
  // 9. 汇报
  reportToUser(`
【任务启动】${taskDescription}

✅ 已创建 Agent:
- Analyzer: 需求分析
- Planner: 任务规划
- Developer: 代码开发
- Deployer: 部署监控

📊 任务级别：${taskLevel}
📈 状态：执行中
  `.trim(), 'success');
  
  return {
    status: 'executing',
    taskLevel,
    agents: state.activeAgents
  };
}

// 导出函数
module.exports = {
  initializeState,
  loadState,
  saveState,
  analyzeTaskLevel,
  createAgent,
  reportToUser,
  requestApproval,
  handleUserRequest
};

// CLI 模式
if (require.main === module) {
  const task = process.argv.slice(2).join(' ');
  
  if (!task) {
    console.log('AutoDev Coordinator - 主 Agent 协调器');
    console.log('');
    console.log('使用方式:');
    console.log('  node scripts/coordinator.js "给项目加个搜索功能"');
    console.log('');
    process.exit(0);
  }
  
  handleUserRequest(task);
}

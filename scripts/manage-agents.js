#!/usr/bin/env node
/**
 * AutoDev 子 Agent 管理脚本
 * 
 * 功能：
 * 1. 创建子 Agent（Analyzer/Planner/Developer/Deployer）
 * 2. 分配任务给子 Agent
 * 3. 监听子 Agent 状态
 * 4. 协调子 Agent 之间的协作
 */

const fs = require('fs');
const path = require('path');

// 配置路径
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const AGENTS_DIR = path.join(__dirname, '..', 'agents');
const AGENTS_STATE_FILE = path.join(MEMORY_DIR, 'agents-state.json');

// Agent 类型
const AGENT_TYPES = ['analyzer', 'planner', 'developer', 'deployer'];

// 初始化 Agent 状态
function initializeAgentsState() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }

  const state = {
    activeAgents: [],
    completedAgents: [],
    failedAgents: [],
    lastUpdate: new Date().toISOString()
  };

  fs.writeFileSync(AGENTS_STATE_FILE, JSON.stringify(state, null, 2));
  console.log('✅ Agent 状态跟踪已初始化');
  return state;
}

// 加载 Agent 状态
function loadAgentsState() {
  if (!fs.existsSync(AGENTS_STATE_FILE)) {
    return initializeAgentsState();
  }
  return JSON.parse(fs.readFileSync(AGENTS_STATE_FILE, 'utf-8'));
}

// 保存 Agent 状态
function saveAgentsState(state) {
  state.lastUpdate = new Date().toISOString();
  fs.writeFileSync(AGENTS_STATE_FILE, JSON.stringify(state, null, 2));
}

// 创建子 Agent
function createAgent(agentType, taskDescription) {
  if (!AGENT_TYPES.includes(agentType)) {
    console.error(`❌ 不支持的 Agent 类型：${agentType}`);
    console.error(`   支持的类型：${AGENT_TYPES.join(', ')}`);
    return null;
  }

  console.log(`🤖 创建 ${agentType} Agent...`);
  
  // 读取 Agent 提示词
  const promptFile = path.join(AGENTS_DIR, agentType, 'prompt.md');
  if (!fs.existsSync(promptFile)) {
    console.error(`❌ 未找到 Agent 提示词：${promptFile}`);
    return null;
  }

  const prompt = fs.readFileSync(promptFile, 'utf-8');
  
  // 创建 Agent 实例（模拟，实际需要调用 sessions_spawn）
  const agent = {
    id: `${agentType}-${Date.now()}`,
    type: agentType,
    task: taskDescription,
    prompt: prompt,
    status: 'created',
    createdAt: new Date().toISOString()
  };

  // 更新状态
  const state = loadAgentsState();
  state.activeAgents.push(agent);
  saveAgentsState(state);

  console.log(`✅ ${agentType} Agent 已创建 (ID: ${agent.id})`);
  return agent;
}

// 分配任务给 Agent
function assignTask(agentId, task) {
  const state = loadAgentsState();
  const agent = state.activeAgents.find(a => a.id === agentId);

  if (!agent) {
    console.error(`❌ 未找到 Agent: ${agentId}`);
    return false;
  }

  agent.task = task;
  agent.status = 'working';
  agent.assignedAt = new Date().toISOString();

  saveAgentsState(state);
  console.log(`✅ 任务已分配给 ${agent.type} Agent`);
  return true;
}

// 更新 Agent 状态
function updateAgentStatus(agentId, status, result = null) {
  const state = loadAgentsState();
  
  // 从 active 移到 completed/failed
  const index = state.activeAgents.findIndex(a => a.id === agentId);
  if (index === -1) {
    console.error(`❌ 未找到 Agent: ${agentId}`);
    return false;
  }

  const agent = state.activeAgents[index];
  agent.status = status;
  agent.completedAt = new Date().toISOString();

  if (result) {
    agent.result = result;
  }

  // 移动列表
  state.activeAgents.splice(index, 1);
  if (status === 'completed') {
    state.completedAgents.push(agent);
  } else {
    state.failedAgents.push(agent);
  }

  saveAgentsState(state);
  console.log(`✅ ${agent.type} Agent 状态已更新为 ${status}`);
  return true;
}

// 获取活跃 Agent 列表
function getActiveAgents() {
  const state = loadAgentsState();
  return state.activeAgents;
}

// 获取 Agent 状态报告
function getAgentsReport() {
  const state = loadAgentsState();
  
  return {
    active: state.activeAgents.length,
    completed: state.completedAgents.length,
    failed: state.failedAgents.length,
    lastUpdate: state.lastUpdate
  };
}

// 导出函数
module.exports = {
  initializeAgentsState,
  loadAgentsState,
  saveAgentsState,
  createAgent,
  assignTask,
  updateAgentStatus,
  getActiveAgents,
  getAgentsReport
};

// CLI 模式
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      initializeAgentsState();
      break;
    
    case 'create':
      const type = process.argv[3];
      const task = process.argv[4];
      createAgent(type, task);
      break;
    
    case 'list':
      const agents = getActiveAgents();
      console.log('\n🤖 活跃 Agent:');
      agents.forEach(a => {
        console.log(`   - ${a.type} (${a.id}): ${a.status}`);
      });
      break;
    
    case 'report':
      const report = getAgentsReport();
      console.log('\n📊 Agent 状态报告:');
      console.log(`   活跃：${report.active}`);
      console.log(`   完成：${report.completed}`);
      console.log(`   失败：${report.failed}`);
      console.log(`   最后更新：${report.lastUpdate}`);
      break;
    
    default:
      console.log('AutoDev Agent 管理工具');
      console.log('');
      console.log('使用方式:');
      console.log('  node scripts/manage-agents.js init     # 初始化');
      console.log('  node scripts/manage-agents.js create <type> <task>  # 创建 Agent');
      console.log('  node scripts/manage-agents.js list     # 列出活跃 Agent');
      console.log('  node scripts/manage-agents.js report   # 状态报告');
      console.log('');
      console.log('Agent 类型:');
      console.log('  analyzer    - 需求分析');
      console.log('  planner     - 任务规划');
      console.log('  developer   - 代码开发');
      console.log('  deployer    - 部署监控');
  }
}

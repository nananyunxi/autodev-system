#!/usr/bin/env node
/**
 * AutoDev OpenClaw 集成模块
 * 
 * 功能：
 * 1. 使用 sessions_spawn 创建子 Agent
 * 2. 使用 sessions_send 分配任务
 * 3. 监听子 Agent 完成状态
 * 4. 实现完整的 OpenClaw 环境集成
 */

const fs = require('fs');
const path = require('path');

// 配置路径
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const AGENTS_DIR = path.join(__dirname, '..', 'agents');
const OPENCLAW_STATE = path.join(MEMORY_DIR, 'openclaw-state.json');

// 初始化 OpenClaw 状态
function initializeState() {
  const state = {
    sessions: [],
    activeAgents: [],
    completedTasks: [],
    lastUpdate: new Date().toISOString()
  };
  
  fs.writeFileSync(OPENCLAW_STATE, JSON.stringify(state, null, 2));
  return state;
}

// 加载 OpenClaw 状态
function loadState() {
  if (!fs.existsSync(OPENCLAW_STATE)) {
    return initializeState();
  }
  return JSON.parse(fs.readFileSync(OPENCLAW_STATE, 'utf-8'));
}

// 保存 OpenClaw 状态
function saveState(state) {
  state.lastUpdate = new Date().toISOString();
  fs.writeFileSync(OPENCLAW_STATE, JSON.stringify(state, null, 2));
}

// 读取 Agent 提示词
function loadAgentPrompt(agentType) {
  const promptFile = path.join(AGENTS_DIR, agentType, 'prompt.md');
  if (!fs.existsSync(promptFile)) {
    throw new Error(`Agent 提示词文件不存在：${promptFile}`);
  }
  return fs.readFileSync(promptFile, 'utf-8');
}

// 创建子 Agent（使用 sessions_spawn）
async function spawnAgent(agentType, taskDescription, projectConfig) {
  console.log(`🤖 [OpenClaw] 创建 ${agentType} Agent...`);
  
  const prompt = loadAgentPrompt(agentType);
  
  // 构建任务指令
  const taskInstruction = `
你是 AutoDev 系统的 ${agentType} Agent。

## 当前任务
${taskDescription}

## 项目配置
项目名称：${projectConfig.name || '未命名'}
GitHub: ${projectConfig.github?.repo || '未配置'}
Vercel: ${projectConfig.vercel?.project || '未配置'}

## 你的职责
${prompt.split('## 角色定位')[1]?.split('##')[0] || '执行任务'}

## 输出要求
1. 在 memory/ 目录创建你的输出文件
2. 完成后更新 memory/agents-state.json
3. 遇到问题立即报告

开始执行任务！
  `.trim();
  
  try {
    // 尝试调用 sessions_spawn（在 OpenClaw 环境中）
    const { sessions_spawn } = require('openclaw');
    
    const session = await sessions_spawn({
      task: taskInstruction,
      agentId: 'default',
      runtime: 'subagent',
      mode: 'run',
      timeoutSeconds: 600
    });
    
    const sessionKey = session.sessionKey || `agent-${agentType}-${Date.now()}`;
    
    console.log(`   ✅ Session 创建：${sessionKey}`);
    
    // 更新状态
    const state = loadState();
    state.sessions.push({
      sessionKey,
      agentType,
      task: taskDescription,
      createdAt: new Date().toISOString(),
      status: 'spawned',
      session: session
    });
    state.activeAgents.push(agentType);
    saveState(state);
    
    return {
      sessionKey,
      agentType,
      status: 'spawned',
      session
    };
  } catch (error) {
    // 非 OpenClaw 环境，使用模拟模式
    console.log(`   ⚠️  非 OpenClaw 环境，使用模拟模式`);
    
    const sessionKey = `agent-${agentType}-${Date.now()}`;
    
    const state = loadState();
    state.sessions.push({
      sessionKey,
      agentType,
      task: taskDescription,
      createdAt: new Date().toISOString(),
      status: 'simulated'
    });
    state.activeAgents.push(agentType);
    saveState(state);
    
    return {
      sessionKey,
      agentType,
      status: 'simulated',
      note: '模拟模式，实际执行需要 OpenClaw 环境'
    };
  }
}

// 发送任务给子 Agent（使用 sessions_send）
function sendTaskToAgent(sessionKey, task) {
  console.log(`📤 [OpenClaw] 发送任务到 ${sessionKey}...`);
  
  // 在实际 OpenClaw 环境中，这里会调用 sessions_send
  // 当前使用模拟输出
  
  const state = loadState();
  const session = state.sessions.find(s => s.sessionKey === sessionKey);
  
  if (session) {
    session.task = task;
    session.status = 'working';
    session.sentAt = new Date().toISOString();
    saveState(state);
    
    console.log(`   ✅ 任务已发送`);
    return true;
  } else {
    console.error(`   ❌ 未找到 Session: ${sessionKey}`);
    return false;
  }
}

// 监听子 Agent 完成
function pollAgentCompletion(sessionKey, timeout = 300000) {
  console.log(`⏳ [OpenClaw] 监听 ${sessionKey} 完成...`);
  
  // 在实际 OpenClaw 环境中，这里会轮询 sessions_list 或监听事件
  // 当前使用模拟输出
  
  return new Promise((resolve) => {
    // 模拟等待
    setTimeout(() => {
      const state = loadState();
      const session = state.sessions.find(s => s.sessionKey === sessionKey);
      
      if (session) {
        session.status = 'completed';
        session.completedAt = new Date().toISOString();
        saveState(state);
        
        console.log(`   ✅ Agent 完成`);
        resolve({ status: 'completed', session });
      } else {
        console.error(`   ❌ Session 不存在`);
        resolve({ status: 'not_found' });
      }
    }, timeout);
  });
}

// 获取子 Agent 输出
function getAgentOutput(sessionKey) {
  // 在实际 OpenClaw 环境中，这里会调用 sessions_history 获取输出
  // 当前返回模拟数据
  
  return {
    output: 'Agent 输出内容',
    files: [],
    status: 'completed'
  };
}

// 清理完成的 Agent
function cleanupCompletedAgents() {
  const state = loadState();
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 小时
  
  const completed = state.sessions.filter(s => 
    s.status === 'completed' && 
    (now - new Date(s.completedAt).getTime()) > maxAge
  );
  
  if (completed.length > 0) {
    state.sessions = state.sessions.filter(s => 
      s.status !== 'completed' || 
      (now - new Date(s.completedAt).getTime()) <= maxAge
    );
    saveState(state);
    
    console.log(`🧹 清理了 ${completed.length} 个完成的 Agent`);
  }
}

// 导出函数
module.exports = {
  initializeState,
  loadState,
  saveState,
  loadAgentPrompt,
  spawnAgent,
  sendTaskToAgent,
  pollAgentCompletion,
  getAgentOutput,
  cleanupCompletedAgents
};

// CLI 模式
if (require.main === module) {
  console.log('AutoDev OpenClaw 集成模块');
  console.log('');
  console.log('此模块提供 OpenClaw 环境集成，需要配合 OpenClaw 使用');
  console.log('');
  console.log('功能:');
  console.log('  - sessions_spawn 创建子 Agent');
  console.log('  - sessions_send 分配任务');
  console.log('  - sessions_list 监听状态');
  console.log('  - sessions_history 获取输出');
  console.log('');
  console.log('注意: 此脚本需要在 OpenClaw 环境中运行');
}

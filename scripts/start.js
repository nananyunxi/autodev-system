#!/usr/bin/env node
/**
 * AutoDev 系统启动脚本
 * 
 * 功能：
 * 1. 加载项目配置
 * 2. 初始化状态跟踪
 * 3. 启动 Coordinator Agent
 * 4. 监听任务
 */

const fs = require('fs');
const path = require('path');

// 配置路径
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const PROJECT_CONFIG = path.join(CONFIG_DIR, 'project.json');
const STATE_FILE = path.join(MEMORY_DIR, 'state.json');

// 初始化状态
function initializeState() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }

  const state = {
    status: 'running',
    startedAt: new Date().toISOString(),
    project: null,
    currentTask: null,
    activeAgents: [],
    completedTasks: [],
    lastUpdate: new Date().toISOString()
  };

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log('✅ 状态跟踪已初始化');
}

// 加载项目配置
function loadProjectConfig() {
  if (!fs.existsSync(PROJECT_CONFIG)) {
    console.error('❌ 未找到项目配置，请先运行：node scripts/add-project.js');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(PROJECT_CONFIG, 'utf-8'));
  console.log(`✅ 已加载项目配置：${config.name}`);
  return config;
}

// 主函数
function main() {
  console.log('🚀 AutoDev 多 Agent 分工全流程开发系统');
  console.log('======================================');
  console.log('');

  // 初始化
  initializeState();
  const config = loadProjectConfig();

  // 更新状态
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  state.project = config.name;
  state.status = 'ready';
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  console.log('');
  console.log('✅ 系统已启动！');
  console.log('');
  console.log('📋 项目信息:');
  console.log(`   名称：${config.name}`);
  console.log(`   GitHub: ${config.github?.repo || '未配置'}`);
  console.log(`   Vercel: ${config.vercel?.project || '未配置'}`);
  console.log('');
  console.log('💬 使用方式:');
  console.log('   在 OpenClaw 中对小雅说：');
  console.log('   "给项目加个搜索功能"');
  console.log('');
  console.log('📊 查看状态：node scripts/status.js');
  console.log('');
}

// 运行
main();

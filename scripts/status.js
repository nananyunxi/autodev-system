#!/usr/bin/env node
/**
 * 查看系统状态脚本
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const STATE_FILE = path.join(MEMORY_DIR, 'state.json');
const TASKS_FILE = path.join(MEMORY_DIR, 'tasks.md');

console.log('📊 AutoDev 系统状态');
console.log('==================');
console.log('');

// 检查状态文件
if (!fs.existsSync(STATE_FILE)) {
  console.log('⚠️  系统未初始化，请先运行：node scripts/start.js');
  process.exit(0);
}

const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));

console.log(`状态：${state.status}`);
console.log(`启动时间：${new Date(state.startedAt).toLocaleString('zh-CN')}`);
console.log(`项目：${state.project || '未配置'}`);
console.log('');

if (state.currentTask) {
  console.log('🔄 当前任务:');
  console.log(`   ${state.currentTask}`);
  console.log('');
}

console.log('🤖 活跃 Agent:');
if (state.activeAgents && state.activeAgents.length > 0) {
  state.activeAgents.forEach(agent => {
    console.log(`   - ${agent}`);
  });
} else {
  console.log('   无');
}
console.log('');

console.log('✅ 已完成任务:');
if (state.completedTasks && state.completedTasks.length > 0) {
  state.completedTasks.forEach(task => {
    console.log(`   - ${task}`);
  });
} else {
  console.log('   无');
}
console.log('');

console.log(`最后更新：${new Date(state.lastUpdate).toLocaleString('zh-CN')}`);
console.log('');

// 检查任务日志
if (fs.existsSync(TASKS_FILE)) {
  console.log('📝 任务日志：memory/tasks.md');
}

console.log('');

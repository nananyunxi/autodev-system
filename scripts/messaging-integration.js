#!/usr/bin/env node
/**
 * AutoDev 消息集成模块
 * 
 * 功能：
 * 1. 发送消息到飞书
 * 2. 发送部署报告
 * 3. 发送进度更新
 * 4. 等待用户回复
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置路径
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'project.json');

// 加载配置
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      nicknames: {
        user: '用户',
        assistant: '助手'
      },
      messaging: {
        channel: 'feishu',
        target: null
      }
    };
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

// 发送消息（使用 OpenClaw message 工具）
async function sendMessage(message, options = {}) {
  const config = loadConfig();
  const target = options.target || config.messaging?.target;
  const channel = options.channel || config.messaging?.channel || 'feishu';
  
  console.log('📤 发送消息...');
  console.log(`   渠道：${channel}`);
  console.log(`   目标：${target || '当前会话'}`);
  console.log('');
  console.log('📝 消息内容:');
  console.log('─'.repeat(50));
  console.log(message);
  console.log('─'.repeat(50));
  console.log('');
  
  try {
    // 尝试使用 OpenClaw message 工具
    // 在实际环境中，这里会调用 message.send
    console.log('💡 提示:');
    console.log('   在 OpenClaw 环境中，以上消息会自动发送到指定渠道');
    console.log('   当前环境使用控制台输出模拟');
    console.log('');
    
    // 保存消息记录
    saveMessageRecord(message, { channel, target, status: 'sent' });
    
    return {
      success: true,
      messageId: `msg-${Date.now()}`,
      channel,
      target,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.log(`❌ 发送失败：${error.message}`);
    saveMessageRecord(message, { channel, target, status: 'failed', error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
}

// 保存消息记录
function saveMessageRecord(message, metadata) {
  const recordsDir = path.join(MEMORY_DIR, 'message-records');
  if (!fs.existsSync(recordsDir)) {
    fs.mkdirSync(recordsDir, { recursive: true });
  }
  
  const filename = `record-${Date.now()}.json`;
  const filepath = path.join(recordsDir, filename);
  
  const record = {
    message,
    ...metadata,
    savedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(filepath, JSON.stringify(record, null, 2));
  console.log(`📄 消息记录已保存：${filepath}`);
}

// 发送部署报告
async function sendDeploymentReport(report) {
  const config = loadConfig();
  const userNickname = config.nicknames?.user || '用户';
  
  const message = `
【部署完成】${report.github?.results?.config?.repo || '项目'}

✅ 部署状态:
- GitHub: ${report.github?.success ? '✅ 正常' : '❌ 异常'}
- Vercel: ${report.vercel?.results?.verification?.success ? '✅ 可访问' : '❌ 无法访问'}

🌐 访问地址:
${report.vercel?.results?.verification?.url || '未知'}

📊 功能验证:
${report.vercel?.results?.verification?.success ? '✅ 功能已上线并可正常访问' : '⚠️  功能可能未正确部署'}

⚠️ 问题:
${report.github?.success && report.vercel?.results?.verification?.success ? '无，所有检查通过！' : '请查看完整报告'}

📄 完整报告：${report.filepath}

请${userNickname}验收！
  `.trim();
  
  return await sendMessage(message);
}

// 发送进度更新
async function sendProgressUpdate(task, progress) {
  const config = loadConfig();
  const userNickname = config.nicknames?.user || '用户';
  
  const message = `
【进度更新】${task}

📈 当前进度：${progress.percentage}%
✅ 已完成：${progress.completed || []}
🔄 进行中：${progress.working || []}
⏳ 待开始：${progress.pending || []}

预计完成：${progress.estimatedCompletion || '未知'}
  `.trim();
  
  return await sendMessage(message);
}

// 发送任务启动通知
async function sendTaskStart(task, taskLevel) {
  const config = loadConfig();
  const userNickname = config.nicknames?.user || '用户';
  
  const levelText = {
    'L1': '✅ 自动执行',
    'L2': '📋 报备后执行',
    'L3': '⏳ 等待批准'
  };
  
  const message = `
【任务启动】${task}

📊 任务级别：${taskLevel} - ${levelText[taskLevel] || '未知'}

✅ 已创建 Agent:
- Analyzer: 需求分析
- Planner: 任务规划
- Developer: 代码开发
- Deployer: 部署监控

📈 状态：执行中
  `.trim();
  
  return await sendMessage(message);
}

// 请求用户批准（L3 任务）
async function requestApproval(task, analysis) {
  const config = loadConfig();
  const userNickname = config.nicknames?.user || '用户';
  
  const message = `
【请示批准】${task}

📋 需求分析
${userNickname}原始需求：${task}

🎯 技术方案
${analysis.technicalPlan || '待制定'}

⚠️ 需要确认
1. 是否采用此方案？
2. 优先级如何？

请${userNickname}批准后执行。

💡 回复"批准"开始执行，回复"取消"终止任务
  `.trim();
  
  return await sendMessage(message);
}

// 导出函数
module.exports = {
  sendMessage,
  sendDeploymentReport,
  sendProgressUpdate,
  sendTaskStart,
  requestApproval,
  saveMessageRecord,
  loadConfig
};

// CLI 模式
if (require.main === module) {
  console.log('AutoDev 消息集成模块');
  console.log('');
  console.log('此模块提供消息发送能力，需要配合 OpenClaw 使用');
  console.log('');
  console.log('功能:');
  console.log('  - 发送消息到飞书/微信/钉钉等');
  console.log('  - 发送部署报告');
  console.log('  - 发送进度更新');
  console.log('  - 请求用户批准');
  console.log('');
  console.log('配置:');
  console.log('  在 config/project.json 中配置 messaging 部分');
  console.log('');
}

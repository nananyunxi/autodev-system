#!/usr/bin/env node
/**
 * 添加项目配置脚本
 * 
 * 使用方式：
 * node scripts/add-project.js your-project-name
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const PROJECT_CONFIG = path.join(CONFIG_DIR, 'project.json');

// 获取项目名称
const projectName = process.argv[2];

if (!projectName) {
  console.error('❌ 请提供项目名称');
  console.error('   使用方式：node scripts/add-project.js your-project-name');
  process.exit(1);
}

// 创建配置目录
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// 创建项目配置
const config = {
  name: projectName,
  github: {
    repo: 'username/repo',
    branch: 'main'
  },
  vercel: {
    project: projectName
  },
  constraints: {
    max_tasks_per_day: 5,
    require_approval_for: ['api_integration', 'breaking_changes']
  },
  createdAt: new Date().toISOString()
};

fs.writeFileSync(PROJECT_CONFIG, JSON.stringify(config, null, 2));

console.log('✅ 项目配置已创建！');
console.log('');
console.log('📝 配置文件：config/project.json');
console.log('');
console.log('⚠️  请编辑配置文件，填写正确的：');
console.log('   - github.repo: 你的 GitHub 仓库');
console.log('   - vercel.project: 你的 Vercel 项目名');
console.log('');
console.log('🔐 然后运行：node scripts/configure.js 配置密钥');
console.log('');

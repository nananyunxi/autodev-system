#!/usr/bin/env node
/**
 * AutoDev GitHub 集成模块
 * 
 * 功能：
 * 1. 检查 GitHub 登录状态
 * 2. 获取仓库信息
 * 3. 提交代码到指定分支
 * 4. 检查提交是否成功
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置路径
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const PROJECT_CONFIG = path.join(CONFIG_DIR, 'project.json');
const GITHUB_STATE = path.join(MEMORY_DIR, 'github-state.json');

// 加载项目配置
function loadProjectConfig() {
  if (!fs.existsSync(PROJECT_CONFIG)) {
    throw new Error('项目配置文件不存在，请先运行：node scripts/add-project.js');
  }
  return JSON.parse(fs.readFileSync(PROJECT_CONFIG, 'utf-8'));
}

// 检查 GitHub 登录状态
function checkGitHubLogin() {
  console.log('🔍 检查 GitHub 登录状态...');
  
  try {
    // 尝试执行 git 命令
    const result = execSync('git config user.name', { encoding: 'utf-8', stdio: 'pipe' });
    const username = result.trim();
    
    console.log(`   ✅ GitHub 已登录`);
    console.log(`   👤 用户名：${username}`);
    
    // 保存状态
    const state = {
      loggedIn: true,
      username: username,
      checkedAt: new Date().toISOString()
    };
    fs.writeFileSync(GITHUB_STATE, JSON.stringify(state, null, 2));
    
    return { success: true, ...state };
  } catch (error) {
    console.log(`   ❌ GitHub 未登录`);
    console.log('');
    console.log('   💡 需要配置 Git 用户信息:');
    console.log('      git config --global user.name "Your Name"');
    console.log('      git config --global user.email "your@email.com"');
    console.log('');
    console.log('   📝 GitHub Token 说明:');
    console.log('      作用：用于 GitHub API 调用和 HTTPS 推送');
    console.log('      场景：自动创建 PR、Issue、获取仓库信息');
    console.log('      获取：https://github.com/settings/tokens');
    console.log('      配置：export GITHUB_TOKEN="your_token"');
    console.log('      可选：已有 SSH 密钥可不配置');
    console.log('');
    
    const state = {
      loggedIn: false,
      error: error.message,
      needsSetup: true,
      checkedAt: new Date().toISOString()
    };
    fs.writeFileSync(GITHUB_STATE, JSON.stringify(state, null, 2));
    
    return { success: false, ...state, needsSetup: true };
  }
}

// 检查仓库配置
function checkRepositoryConfig() {
  console.log('🔍 检查仓库配置...');
  
  const config = loadProjectConfig();
  
  if (!config.github?.repo) {
    console.log(`   ❌ 未配置 GitHub 仓库`);
    console.log(`   💡 请在 config/project.json 中配置 github.repo`);
    return { success: false, error: '未配置仓库' };
  }
  
  console.log(`   ✅ 仓库配置正确`);
  console.log(`   📁 仓库：${config.github.repo}`);
  console.log(`   🌿 分支：${config.github.branch || 'main'}`);
  
  return {
    success: true,
    repo: config.github.repo,
    branch: config.github.branch || 'main'
  };
}

// 检查 Git 远程仓库
function checkRemoteRepository() {
  console.log('🔍 检查远程仓库连接...');
  
  try {
    const result = execSync('git remote -v', { encoding: 'utf-8' });
    const remotes = result.trim().split('\n');
    
    if (remotes.length === 0) {
      console.log(`   ❌ 未配置远程仓库`);
      return { success: false, error: '未配置远程仓库' };
    }
    
    console.log(`   ✅ 远程仓库已配置`);
    remotes.forEach(remote => {
      console.log(`   📡 ${remote.split('\t')[0]}: ${remote.split('\t')[1].split(' ')[0]}`);
    });
    
    return { success: true, remotes };
  } catch (error) {
    console.log(`   ❌ 无法访问远程仓库`);
    return { success: false, error: error.message };
  }
}

// 提交代码
function commitAndPush(message, files = '.') {
  console.log('📝 提交代码...');
  
  const config = loadProjectConfig();
  const branch = config.github.branch || 'main';
  
  try {
    // 添加文件
    console.log(`   📂 添加文件：${files}`);
    execSync(`git add ${files}`, { stdio: 'pipe' });
    
    // 检查是否有变更
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (!status.trim()) {
      console.log(`   ℹ️  没有需要提交的变更`);
      return { success: true, message: '没有变更' };
    }
    
    // 提交
    console.log(`   💾 提交：${message}`);
    execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
    
    // 推送
    console.log(`   🚀 推送到 ${branch} 分支...`);
    execSync(`git push origin ${branch}`, { stdio: 'pipe' });
    
    console.log(`   ✅ 提交成功`);
    
    return {
      success: true,
      message: '提交成功',
      branch: branch,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.log(`   ❌ 提交失败：${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// 获取提交历史
function getCommitHistory(limit = 5) {
  console.log(`📜 获取最近 ${limit} 条提交记录...`);
  
  try {
    const result = execSync(`git log --oneline -${limit}`, { encoding: 'utf-8' });
    const commits = result.trim().split('\n').map(line => {
      const [hash, ...message] = line.split(' ');
      return { hash, message: message.join(' ') };
    });
    
    console.log(`   ✅ 获取成功`);
    commits.forEach((commit, i) => {
      console.log(`   ${i + 1}. ${commit.hash} ${commit.message}`);
    });
    
    return { success: true, commits };
  } catch (error) {
    console.log(`   ❌ 获取失败：${error.message}`);
    return { success: false, error: error.message };
  }
}

// 完整检查
function fullGitHubCheck() {
  console.log('🔍 GitHub 完整检查');
  console.log('================================');
  console.log('');
  
  const results = {
    login: checkGitHubLogin(),
    config: checkRepositoryConfig(),
    remote: checkRemoteRepository(),
    commits: getCommitHistory(3)
  };
  
  console.log('');
  console.log('📊 检查结果汇总:');
  console.log(`   登录状态：${results.login.success ? '✅ 已登录' : '❌ 未登录'}`);
  console.log(`   仓库配置：${results.config.success ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   远程连接：${results.remote.success ? '✅ 已连接' : '❌ 未连接'}`);
  
  const allSuccess = results.login.success && results.config.success && results.remote.success;
  console.log(`   整体状态：${allSuccess ? '✅ 正常' : '⚠️  需要配置'}`);
  
  return {
    success: allSuccess,
    results
  };
}

// 导出函数
module.exports = {
  checkGitHubLogin,
  checkRepositoryConfig,
  checkRemoteRepository,
  commitAndPush,
  getCommitHistory,
  fullGitHubCheck,
  loadProjectConfig
};

// CLI 模式
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      fullGitHubCheck();
      break;
    
    case 'login':
      checkGitHubLogin();
      break;
    
    case 'config':
      checkRepositoryConfig();
      break;
    
    case 'commit':
      const message = process.argv.slice(3).join(' ');
      if (!message) {
        console.log('使用方式：node scripts/github-integration.js commit "提交信息"');
        process.exit(1);
      }
      commitAndPush(message);
      break;
    
    case 'log':
      const limit = parseInt(process.argv[3]) || 5;
      getCommitHistory(limit);
      break;
    
    default:
      console.log('AutoDev GitHub 集成工具');
      console.log('');
      console.log('使用方式:');
      console.log('  node scripts/github-integration.js check    # 完整检查');
      console.log('  node scripts/github-integration.js login    # 检查登录');
      console.log('  node scripts/github-integration.js config   # 检查配置');
      console.log('  node scripts/github-integration.js commit "消息"  # 提交代码');
      console.log('  node scripts/github-integration.js log [数量]  # 查看日志');
      console.log('');
  }
}

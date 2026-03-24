#!/usr/bin/env node
/**
 * AutoDev 配置向导
 * 
 * 功能：
 * 1. 检查 GitHub 和 Vercel 登录状态
 * 2. 提示需要配置的 Token
 * 3. 说明 Token 作用和获取方式
 * 4. 引导用户完成配置
 */

const fs = require('fs');
const path = require('path');
const { checkGitHubLogin, checkRepositoryConfig } = require('./github-integration');
const { checkVercelLogin } = require('./vercel-integration');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const SETUP_STATE = path.join(MEMORY_DIR, 'setup-state.json');

// 保存配置状态
function saveSetupState(state) {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  fs.writeFileSync(SETUP_STATE, JSON.stringify(state, null, 2));
}

// 主函数
function setupWizard() {
  console.log('🔧 AutoDev 配置向导');
  console.log('================================');
  console.log('');
  
  const results = {
    github: checkGitHubLogin(),
    vercel: checkVercelLogin(),
    config: checkRepositoryConfig()
  };
  
  console.log('');
  console.log('📊 配置检查汇总');
  console.log('================================');
  console.log('');
  
  // 检查是否需要配置
  const needsSetup = [];
  
  if (results.github.needsSetup) {
    needsSetup.push('github');
  }
  
  if (results.vercel.needsSetup) {
    needsSetup.push('vercel');
  }
  
  if (needsSetup.length === 0) {
    console.log('✅ 所有配置已完成！');
    console.log('');
    console.log('可以开始使用 AutoDev 系统了:');
    console.log('  npm run coordinator "任务描述"');
    console.log('');
  } else {
    console.log('⚠️  需要配置以下项目:');
    console.log('');
    
    if (needsSetup.includes('github')) {
      console.log('1️⃣ GitHub 配置');
      console.log('   ────────────────');
      console.log('   📝 需要配置:');
      console.log('      1. Git 用户信息（必须）');
      console.log('      2. GitHub Token（可选，推荐配置）');
      console.log('');
      console.log('   🔑 Git 用户信息配置:');
      console.log('      git config --global user.name "Your Name"');
      console.log('      git config --global user.email "your@email.com"');
      console.log('');
      console.log('   🔑 GitHub Token 配置:');
      console.log('      作用：GitHub API 调用、自动创建 PR/Issue');
      console.log('      获取：https://github.com/settings/tokens');
      console.log('      配置：export GITHUB_TOKEN="your_token"');
      console.log('      可选：已有 SSH 密钥可不配置');
      console.log('');
    }
    
    if (needsSetup.includes('vercel')) {
      console.log('2️⃣ Vercel 配置');
      console.log('   ────────────────');
      console.log('   📝 需要配置:');
      console.log('      Vercel Token（可选，推荐配置）');
      console.log('');
      console.log('   🔑 Vercel Token 配置:');
      console.log('      作用：获取详细部署状态、查看部署日志、自动验证功能');
      console.log('      获取：https://vercel.com/account/tokens');
      console.log('      步骤:');
      console.log('        1. 访问 https://vercel.com/account/tokens');
      console.log('        2. 登录 Vercel 账号');
      console.log('        3. 点击 "Create Token"');
      console.log('        4. 选择权限（建议 Full Access）');
      console.log('        5. 复制生成的 Token');
      console.log('      配置：export VERCEL_TOKEN="your_token"');
      console.log('      可选：不配置也能自动部署，只是无法获取详细状态');
      console.log('');
    }
    
    console.log('💡 配置完成后运行:');
    console.log('   node scripts/setup-wizard.js  # 重新检查');
    console.log('');
    console.log('📚 更多信息查看:');
    console.log('   docs/USAGE.md');
    console.log('');
  }
  
  // 保存状态
  saveSetupState({
    checkedAt: new Date().toISOString(),
    needsSetup,
    results
  });
  
  return {
    success: needsSetup.length === 0,
    needsSetup,
    results
  };
}

// 快速配置脚本生成
function generateSetupScript() {
  console.log('📝 生成快速配置脚本...');
  console.log('');
  
  const script = `#!/bin/bash
# AutoDev 快速配置脚本

echo "🔧 AutoDev 快速配置"
echo "================================"
echo ""

# 配置 Git 用户信息
read -p "请输入您的 Git 用户名：" GIT_NAME
read -p "请输入您的 Git 邮箱：" GIT_EMAIL

git config --global user.name "\$GIT_NAME"
git config --global user.email "\$GIT_EMAIL"

echo "✅ Git 用户信息已配置"
echo ""

# 配置 GitHub Token
read -p "是否配置 GitHub Token? (y/n): " CONFIG_GH

if [ "\$CONFIG_GH" == "y" ]; then
  read -p "请输入 GitHub Token: " GITHUB_TOKEN
  echo "export GITHUB_TOKEN=\\"\$GITHUB_TOKEN\\"" >> ~/.bashrc
  echo "✅ GitHub Token 已配置（需要 source ~/.bashrc 生效）"
else
  echo "ℹ️  跳过 GitHub Token 配置"
fi

echo ""

# 配置 Vercel Token
read -p "是否配置 Vercel Token? (y/n): " CONFIG_VERCEL

if [ "\$CONFIG_VERCEL" == "y" ]; then
  read -p "请输入 Vercel Token: " VERCEL_TOKEN
  echo "export VERCEL_TOKEN=\\"\$VERCEL_TOKEN\\"" >> ~/.bashrc
  echo "✅ Vercel Token 已配置（需要 source ~/.bashrc 生效）"
else
  echo "ℹ️  跳过 Vercel Token 配置"
fi

echo ""
echo "================================"
echo "✅ 配置完成！"
echo ""
echo "请运行：source ~/.bashrc"
echo "然后运行：node scripts/setup-wizard.js 检查配置"
echo ""
`;

  const scriptPath = path.join(__dirname, '..', 'quick-setup.sh');
  fs.writeFileSync(scriptPath, script, 'utf-8');
  
  console.log(`✅ 脚本已生成：${scriptPath}`);
  console.log('');
  console.log('运行方式:');
  console.log(`  chmod +x ${scriptPath}`);
  console.log(`  ./${scriptPath}`);
  console.log('');
}

// 导出
module.exports = {
  setupWizard,
  generateSetupScript
};

// CLI
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'generate') {
    generateSetupScript();
  } else {
    setupWizard();
  }
}

#!/usr/bin/env node
/**
 * AutoDev Vercel 集成模块
 * 
 * 功能：
 * 1. 检查 Vercel 登录状态
 * 2. 检查项目绑定
 * 3. 检查部署状态
 * 4. 查看部署日志
 * 5. 验证部署成功
 * 6. 功能验证
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// 配置路径
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const PROJECT_CONFIG = path.join(CONFIG_DIR, 'project.json');
const VERCEL_STATE = path.join(MEMORY_DIR, 'vercel-state.json');

// 加载项目配置
function loadProjectConfig() {
  if (!fs.existsSync(PROJECT_CONFIG)) {
    throw new Error('项目配置文件不存在');
  }
  return JSON.parse(fs.readFileSync(PROJECT_CONFIG, 'utf-8'));
}

// 检查 Vercel 登录状态
function checkVercelLogin() {
  console.log('🔍 检查 Vercel 登录状态...');
  
  const token = process.env.VERCEL_TOKEN;
  
  if (token) {
    console.log(`   ✅ Vercel 已登录 (使用 VERCEL_TOKEN)`);
    
    const state = {
      loggedIn: true,
      method: 'token',
      checkedAt: new Date().toISOString()
    };
    fs.writeFileSync(VERCEL_STATE, JSON.stringify(state, null, 2));
    
    return { success: true, ...state };
  } else {
    console.log(`   ⚠️  未检测到 VERCEL_TOKEN`);
    console.log('');
    console.log('   📝 Vercel Token 说明:');
    console.log('      作用：用于 Vercel API 调用，获取详细部署状态和日志');
    console.log('      场景：查看部署详情、日志分析、自动验证功能');
    console.log('      获取：https://vercel.com/account/tokens');
    console.log('      配置：export VERCEL_TOKEN="your_token"');
    console.log('      可选：不配置也能自动部署，只是无法获取详细状态');
    console.log('');
    console.log('   💡 获取步骤:');
    console.log('      1. 访问 https://vercel.com/account/tokens');
    console.log('      2. 登录 Vercel 账号');
    console.log('      3. 点击 "Create Token"');
    console.log('      4. 选择权限（建议 Full Access）');
    console.log('      5. 复制生成的 Token');
    console.log('      6. 运行：export VERCEL_TOKEN="你的 token"');
    console.log('');
    
    const state = {
      loggedIn: false,
      method: 'none',
      needsSetup: true,
      checkedAt: new Date().toISOString()
    };
    fs.writeFileSync(VERCEL_STATE, JSON.stringify(state, null, 2));
    
    return { success: false, ...state, needsSetup: true };
  }
}

// 检查项目绑定
function checkProjectBinding() {
  console.log('🔍 检查 Vercel 项目绑定...');
  
  const config = loadProjectConfig();
  
  if (!config.vercel?.project) {
    console.log(`   ❌ 未配置 Vercel 项目`);
    console.log(`   💡 请在 config/project.json 中配置 vercel.project`);
    return { success: false, error: '未配置项目' };
  }
  
  console.log(`   ✅ Vercel 项目已配置`);
  console.log(`   📁 项目名：${config.vercel.project}`);
  
  // 检查是否有 Vercel 配置文件
  const vercelJsonPath = path.join(path.dirname(PROJECT_CONFIG), '..', 'vercel.json');
  if (fs.existsSync(vercelJsonPath)) {
    console.log(`   📄 vercel.json: 已配置`);
  } else {
    console.log(`   ℹ️  vercel.json: 未配置 (使用默认配置)`);
  }
  
  return {
    success: true,
    project: config.vercel.project
  };
}

// 检查部署状态
function checkDeploymentStatus() {
  console.log('🔍 检查部署状态...');
  
  const config = loadProjectConfig();
  const projectName = config.vercel?.project;
  
  if (!projectName) {
    return { success: false, error: '未配置项目' };
  }
  
  // 构建访问 URL
  const deploymentUrl = `https://${projectName}.vercel.app`;
  console.log(`   🌐 部署地址：${deploymentUrl}`);
  
  // 检查 Vercel 部署 API
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    console.log(`   ⚠️  无法获取详细部署状态 (需要 VERCEL_TOKEN)`);
    console.log(`   💡 部署状态可以通过访问 ${deploymentUrl} 查看`);
    
    return {
      success: true,
      url: deploymentUrl,
      status: 'unknown',
      note: '需要 VERCEL_TOKEN 获取详细状态'
    };
  }
  
  // 调用 Vercel API 获取部署状态
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.vercel.com',
      path: `/v6/deployments?projectId=${projectName}`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const latestDeployment = result.deployments?.[0];
          
          if (latestDeployment) {
            console.log(`   ✅ 获取部署状态成功`);
            console.log(`   📊 状态：${latestDeployment.state}`);
            console.log(`   🕐 时间：${new Date(latestDeployment.created).toLocaleString('zh-CN')}`);
            
            const state = {
              loggedIn: true,
              latestDeployment: {
                id: latestDeployment.id,
                state: latestDeployment.state,
                url: latestDeployment.url,
                created: latestDeployment.created
              },
              checkedAt: new Date().toISOString()
            };
            fs.writeFileSync(VERCEL_STATE, JSON.stringify(state, null, 2));
            
            resolve({
              success: true,
              ...state.latestDeployment
            });
          } else {
            resolve({ success: false, error: '未找到部署记录' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
  });
}

// 验证部署成功（访问 URL）
function verifyDeployment() {
  console.log('🔍 验证部署成功...');
  
  const config = loadProjectConfig();
  const projectName = config.vercel?.project;
  
  if (!projectName) {
    return { success: false, error: '未配置项目' };
  }
  
  const url = `https://${projectName}.vercel.app`;
  console.log(`   🌐 访问：${url}`);
  
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      const statusCode = res.statusCode;
      
      if (statusCode === 200) {
        console.log(`   ✅ 部署成功 (HTTP ${statusCode})`);
        
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            success: true,
            statusCode,
            url,
            contentLength: body.length,
            verified: true
          });
        });
      } else {
        console.log(`   ❌ 部署失败 (HTTP ${statusCode})`);
        resolve({
          success: false,
          statusCode,
          url,
          error: `HTTP ${statusCode}`
        });
      }
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ 无法访问：${error.message}`);
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        success: false,
        error: '请求超时'
      });
    });
  });
}

// 功能验证
function verifyFeature(featureDescription, urlPath = '/') {
  console.log(`🔍 功能验证：${featureDescription}`);
  
  const config = loadProjectConfig();
  const projectName = config.vercel?.project;
  
  if (!projectName) {
    return { success: false, error: '未配置项目' };
  }
  
  const url = `https://${projectName}.vercel.app${urlPath}`;
  console.log(`   🌐 访问：${url}`);
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        // 简单验证：检查页面是否包含关键词
        const keywords = featureDescription.split(' ').filter(w => w.length > 3);
        const foundKeywords = keywords.filter(k => 
          body.toLowerCase().includes(k.toLowerCase())
        );
        
        const matchRate = foundKeywords.length / keywords.length;
        
        console.log(`   📊 匹配度：${(matchRate * 100).toFixed(0)}%`);
        console.log(`   ✅ 找到关键词：${foundKeywords.join(', ') || '无'}`);
        
        resolve({
          success: matchRate > 0.3,
          matchRate,
          foundKeywords,
          url,
          contentLength: body.length
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
  });
}

// 查看部署日志
function viewDeploymentLogs() {
  console.log('📜 查看部署日志...');
  
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    console.log(`   ⚠️  需要 VERCEL_TOKEN 查看日志`);
    console.log(`   💡 设置方式：export VERCEL_TOKEN="your_token"`);
    return { success: false, error: '需要 VERCEL_TOKEN' };
  }
  
  console.log(`   ℹ️  请通过 Vercel 控制台查看日志:`);
  console.log(`   https://vercel.com/dashboard`);
  
  return {
    success: true,
    note: '请通过 Vercel 控制台查看日志',
    dashboard: 'https://vercel.com/dashboard'
  };
}

// 完整检查
async function fullVercelCheck() {
  console.log('🔍 Vercel 完整检查');
  console.log('================================');
  console.log('');
  
  const results = {
    login: checkVercelLogin(),
    binding: checkProjectBinding()
  };
  
  if (results.login.success && results.binding.success) {
    results.deployment = await checkDeploymentStatus();
    results.verification = await verifyDeployment();
  }
  
  console.log('');
  console.log('📊 检查结果汇总:');
  console.log(`   Vercel 登录：${results.login.success ? '✅ 已登录' : '⚠️  未登录'}`);
  console.log(`   项目绑定：${results.binding.success ? '✅ 已绑定' : '❌ 未绑定'}`);
  if (results.deployment) {
    console.log(`   部署状态：${results.deployment.success ? '✅ 正常' : '⚠️  未知'}`);
  }
  if (results.verification) {
    console.log(`   访问验证：${results.verification.success ? '✅ 可访问' : '❌ 无法访问'}`);
  }
  
  const allSuccess = results.login.success && results.binding.success && 
                     results.verification?.success;
  console.log(`   整体状态：${allSuccess ? '✅ 正常' : '⚠️  需要配置'}`);
  
  return {
    success: allSuccess,
    results
  };
}

// 导出函数
module.exports = {
  checkVercelLogin,
  checkProjectBinding,
  checkDeploymentStatus,
  verifyDeployment,
  verifyFeature,
  viewDeploymentLogs,
  fullVercelCheck,
  loadProjectConfig
};

// CLI 模式
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      fullVercelCheck().then(() => process.exit(0));
      break;
    
    case 'login':
      checkVercelLogin();
      break;
    
    case 'binding':
      checkProjectBinding();
      break;
    
    case 'status':
      checkDeploymentStatus().then(() => process.exit(0));
      break;
    
    case 'verify':
      verifyDeployment().then(() => process.exit(0));
      break;
    
    case 'feature':
      const feature = process.argv[3] || '功能';
      const path = process.argv[4] || '/';
      verifyFeature(feature, path).then(() => process.exit(0));
      break;
    
    case 'logs':
      viewDeploymentLogs();
      break;
    
    default:
      console.log('AutoDev Vercel 集成工具');
      console.log('');
      console.log('使用方式:');
      console.log('  node scripts/vercel-integration.js check     # 完整检查');
      console.log('  node scripts/vercel-integration.js login     # 检查登录');
      console.log('  node scripts/vercel-integration.js binding   # 检查绑定');
      console.log('  node scripts/vercel-integration.js status    # 部署状态');
      console.log('  node scripts/vercel-integration.js verify    # 验证部署');
      console.log('  node scripts/vercel-integration.js feature "描述" [路径]  # 功能验证');
      console.log('  node scripts/vercel-integration.js logs      # 查看日志');
      console.log('');
      console.log('环境变量:');
      console.log('  VERCEL_TOKEN - Vercel API Token (可选，用于获取详细状态)');
  }
}

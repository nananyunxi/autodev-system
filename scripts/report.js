#!/usr/bin/env node
/**
 * AutoDev 完整报告模块
 * 
 * 功能：
 * 1. 汇总 GitHub 和 Vercel 状态
 * 2. 生成部署报告
 * 3. 功能验证报告
 * 4. 向用户汇报
 */

const fs = require('fs');
const path = require('path');
const { loadProjectConfig } = require('./github-integration');
const { fullVercelCheck, verifyFeature } = require('./vercel-integration');
const { fullGitHubCheck } = require('./github-integration');

// 配置路径
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const REPORTS_DIR = path.join(MEMORY_DIR, 'reports');

// 确保报告目录存在
function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

// 生成报告文件名
function generateReportFilename(type = 'deployment') {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                    now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${type}-report-${timestamp}.md`;
}

// 生成部署报告
async function generateDeploymentReport(taskDescription) {
  console.log('📊 生成部署报告...');
  console.log('================================');
  console.log('');
  
  ensureReportsDir();
  
  const config = loadProjectConfig();
  const userNickname = config.nicknames?.user || '用户';
  
  // 检查 GitHub
  console.log('🔍 检查 GitHub...');
  const githubCheck = fullGitHubCheck();
  console.log('');
  
  // 检查 Vercel
  console.log('🔍 检查 Vercel...');
  const vercelCheck = await fullVercelCheck();
  console.log('');
  
  // 生成报告内容
  const report = `
# 部署报告

**任务**: ${taskDescription || '未指定'}
**生成时间**: ${new Date().toLocaleString('zh-CN')}
**项目名称**: ${config.name}

---

## 📊 部署状态

### GitHub

| 项目 | 状态 | 详情 |
|------|------|------|
| 登录状态 | ${githubCheck.results.login.success ? '✅ 已登录' : '❌ 未登录'} | ${githubCheck.results.login.username || '未登录'} |
| 仓库配置 | ${githubCheck.results.config.success ? '✅ 已配置' : '❌ 未配置'} | ${githubCheck.results.config.repo || '未配置'} |
| 远程连接 | ${githubCheck.results.remote.success ? '✅ 已连接' : '❌ 未连接'} | ${githubCheck.results.remote.success ? '正常' : '异常'} |
| 最近提交 | ${githubCheck.results.commits.success ? '✅ 有记录' : '❌ 无记录'} | ${githubCheck.results.commits.commits?.[0]?.message || '无'} |

### Vercel

| 项目 | 状态 | 详情 |
|------|------|------|
| 登录状态 | ${vercelCheck.results.login.success ? '✅ 已登录' : '⚠️  未登录'} | ${vercelCheck.results.login.method || '未知'} |
| 项目绑定 | ${vercelCheck.results.binding.success ? '✅ 已绑定' : '❌ 未绑定'} | ${vercelCheck.results.binding.project || '未绑定'} |
| 部署状态 | ${vercelCheck.results.deployment?.success ? '✅ 正常' : '⚠️  未知'} | ${vercelCheck.results.deployment?.state || '未知'} |
| 访问验证 | ${vercelCheck.results.verification?.success ? '✅ 可访问' : '❌ 无法访问'} | ${vercelCheck.results.verification?.url || '未知'} |

---

## 🌐 访问地址

- **生产环境**: ${vercelCheck.results.verification?.url || '未知'}
- **GitHub 仓库**: https://github.com/${githubCheck.results.config.repo || '未知'}

---

## ✅ 功能验证

${taskDescription ? `**开发功能**: ${taskDescription}

**验证结果**: ${vercelCheck.results.verification?.success ? '✅ 成功' : '❌ 失败'}

${vercelCheck.results.verification?.success ? '功能已上线并可正常访问！' : '功能可能未正确部署，请检查部署日志。'}
` : '功能验证需要指定任务描述'}

---

## ⚠️ 问题与建议

${!githubCheck.results.login.success ? '- ❌ GitHub 未登录，请配置 Git 用户信息' : ''}
${!githubCheck.results.config.success ? '- ❌ 仓库未配置，请在 config/project.json 中配置' : ''}
${!vercelCheck.results.login.success ? '- ⚠️  Vercel 未登录，建议配置 VERCEL_TOKEN 获取详细状态' : ''}
${!vercelCheck.results.verification?.success ? '- ❌ 部署无法访问，请检查 Vercel 部署状态' : ''}
${githubCheck.success && vercelCheck.results.verification?.success ? '- ✅ 所有检查通过，部署成功！' : ''}

---

## 📝 下一步建议

1. ${vercelCheck.results.verification?.success ? '访问生产环境验证功能' : '解决部署问题'}
2. 查看 Vercel 部署日志（如有问题）
3. 向${userNickname}汇报部署结果

---

*此报告由 AutoDev 系统自动生成*
`.trim();

  // 保存报告
  const filename = generateReportFilename();
  const filepath = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(filepath, report, 'utf-8');
  
  console.log(`✅ 报告已保存：${filepath}`);
  console.log('');
  
  // 输出摘要
  console.log('📋 报告摘要:');
  console.log('================================');
  console.log(report);
  console.log('');
  console.log(`📄 完整报告：${filepath}`);
  
  return {
    success: true,
    filepath,
    filename,
    github: githubCheck,
    vercel: vercelCheck
  };
}

// 向用户汇报
function reportToUser(report, config) {
  const userNickname = config.nicknames?.user || '用户';
  
  console.log('');
  console.log('💬 向${userNickname}汇报:');
  console.log('================================');
  console.log('');
  
  const summary = `
【部署完成】${report.github.results.config.repo || '项目'}

✅ 部署状态:
- GitHub: ${report.github.success ? '✅ 正常' : '❌ 异常'}
- Vercel: ${report.vercel.results.verification?.success ? '✅ 可访问' : '❌ 无法访问'}

🌐 访问地址:
${report.vercel.results.verification?.url || '未知'}

📊 功能验证:
${report.vercel.results.verification?.success ? '✅ 功能已上线并可正常访问' : '⚠️  功能可能未正确部署'}

⚠️ 问题:
${report.github.success && report.vercel.results.verification?.success ? '无，所有检查通过！' : '请查看完整报告'}

📄 完整报告：${report.filepath}

请${userNickname}验收！
  `.trim();
  
  console.log(summary);
  
  return summary;
}

// 完整流程
async function fullDeploymentFlow(taskDescription) {
  console.log('🚀 AutoDev 部署报告生成');
  console.log('================================');
  console.log('');
  
  try {
    const config = loadProjectConfig();
    
    // 生成报告
    const report = await generateDeploymentReport(taskDescription);
    
    // 向用户汇报
    const summary = reportToUser(report, config);
    
    return {
      success: true,
      report,
      summary
    };
  } catch (error) {
    console.error('❌ 生成报告失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 导出函数
module.exports = {
  generateDeploymentReport,
  reportToUser,
  fullDeploymentFlow,
  ensureReportsDir
};

// CLI 模式
if (require.main === module) {
  const task = process.argv.slice(2).join(' ');
  
  if (!task) {
    console.log('AutoDev 部署报告工具');
    console.log('');
    console.log('使用方式:');
    console.log('  node scripts/report.js "任务描述"');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/report.js "添加搜索功能"');
    console.log('');
    process.exit(0);
  }
  
  fullDeploymentFlow(task).then(() => process.exit(0));
}

#!/usr/bin/env node
/**
 * AutoDev Developer Agent - 代码开发执行器
 * 
 * 功能：
 * 1. 读取代码文件
 * 2. 分析代码结构
 * 3. 修改代码
 * 4. Git 提交
 * 5. 推送代码
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置路径
const WORKSPACE_DIR = path.join(__dirname, '..', '..', 'projects');
const MEMORY_DIR = path.join(__dirname, '..', 'memory');

// 读取文件
function readFile(filePath) {
  console.log(`📖 读取文件：${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ 文件不存在`);
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`   ✅ 读取成功 (${content.length} 字节)`);
  return content;
}

// 写入文件
function writeFile(filePath, content) {
  console.log(`✍️  写入文件：${filePath}`);
  
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   📁 创建目录：${dir}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`   ✅ 写入成功 (${content.length} 字节)`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ 写入失败：${error.message}`);
    return false;
  }
}

// 修改文件（替换内容）
function modifyFile(filePath, oldText, newText) {
  console.log(`🔧 修改文件：${filePath}`);
  
  const content = readFile(filePath);
  if (!content) {
    return false;
  }
  
  if (!content.includes(oldText)) {
    console.log(`   ❌ 未找到要替换的内容`);
    return false;
  }
  
  const modified = content.replace(oldText, newText);
  
  if (modified === content) {
    console.log(`   ℹ️  内容无变化`);
    return false;
  }
  
  return writeFile(filePath, modified);
}

// Git 操作
function gitAdd(files = '.') {
  console.log(`📂 Git add: ${files}`);
  try {
    execSync(`git add ${files}`, { stdio: 'pipe' });
    console.log(`   ✅ 添加成功`);
    return true;
  } catch (error) {
    console.log(`   ❌ 添加失败：${error.message}`);
    return false;
  }
}

function gitCommit(message) {
  console.log(`💾 Git commit: ${message}`);
  try {
    execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
    console.log(`   ✅ 提交成功`);
    return true;
  } catch (error) {
    console.log(`   ❌ 提交失败：${error.message}`);
    return false;
  }
}

function gitPush(branch = 'main') {
  console.log(`🚀 Git push: ${branch}`);
  try {
    execSync(`git push origin ${branch}`, { stdio: 'pipe' });
    console.log(`   ✅ 推送成功`);
    return true;
  } catch (error) {
    console.log(`   ❌ 推送失败：${error.message}`);
    return false;
  }
}

// 完整开发流程
async function developFeature(taskDescription, projectPath, files) {
  console.log('🔨 Developer Agent 开始工作');
  console.log('================================');
  console.log('');
  console.log(`任务：${taskDescription}`);
  console.log(`项目：${projectPath}`);
  console.log(`文件：${JSON.stringify(files)}`);
  console.log('');
  
  // 切换到项目目录
  process.chdir(projectPath);
  console.log(`📁 工作目录：${process.cwd()}`);
  console.log('');
  
  // 执行开发（这里需要根据具体任务实现）
  // 示例：修改文件
  for (const file of files) {
    const filePath = path.join(projectPath, file.path);
    
    if (file.action === 'modify') {
      modifyFile(filePath, file.oldText, file.newText);
    } else if (file.action === 'create') {
      writeFile(filePath, file.content);
    } else if (file.action === 'delete') {
      fs.unlinkSync(filePath);
      console.log(`🗑️  删除文件：${filePath}`);
    }
  }
  
  // Git 提交
  console.log('');
  console.log('📝 Git 提交...');
  gitAdd('-A');
  gitCommit(taskDescription);
  gitPush();
  
  console.log('');
  console.log('✅ Developer Agent 完成');
  
  return {
    success: true,
    modifiedFiles: files.map(f => f.path),
    commit: taskDescription
  };
}

// 导出函数
module.exports = {
  readFile,
  writeFile,
  modifyFile,
  gitAdd,
  gitCommit,
  gitPush,
  developFeature
};

// CLI 模式
if (require.main === module) {
  console.log('AutoDev Developer Agent - 代码开发执行器');
  console.log('');
  console.log('此模块提供代码开发能力，需要配合 Coordinator 使用');
  console.log('');
  console.log('功能:');
  console.log('  - 读取/写入文件');
  console.log('  - 修改代码');
  console.log('  - Git 提交和推送');
}

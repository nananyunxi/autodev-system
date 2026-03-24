#!/usr/bin/env node
/**
 * AutoDev 自动代码开发器
 * 
 * 功能：
 * 1. 分析需求
 * 2. 定位需要修改的文件
 * 3. 自动生成代码修改
 * 4. Git 提交
 * 5. 推送代码
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadProjectConfig } = require('./github-integration');

// 工作目录
const WORKSPACE_DIR = path.join(__dirname, '..', '..', 'projects');

// 代码修改模式
const MODIFY_PATTERNS = {
  // 替换 CSS 类名
  replaceClassName: (content, oldClass, newClass) => {
    return content.replace(new RegExp(oldClass, 'g'), newClass);
  },
  
  // 替换文本内容
  replaceText: (content, oldText, newText) => {
    return content.replace(oldText, newText);
  },
  
  // 添加导入
  addImport: (content, importStatement) => {
    if (content.includes(importStatement)) {
      return content;
    }
    return importStatement + '\n' + content;
  },
  
  // 删除导入
  removeImport: (content, importStatement) => {
    return content.replace(importStatement + '\n', '');
  },
  
  // 修改组件属性
  modifyComponentProp: (content, componentName, propName, newValue) => {
    const regex = new RegExp(`${componentName}[\\s\\S]*?${propName}=["']([^"']*)["']`);
    return content.replace(regex, (match, p1) => {
      return match.replace(p1, newValue);
    });
  }
};

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

// 执行代码修改
function executeModification(filePath, modifications) {
  console.log(`🔧 执行代码修改：${filePath}`);
  
  let content = readFile(filePath);
  if (!content) {
    return false;
  }
  
  let modified = false;
  
  modifications.forEach(mod => {
    console.log(`   应用修改：${mod.type}`);
    
    switch (mod.type) {
      case 'replaceClassName':
        content = MODIFY_PATTERNS.replaceClassName(content, mod.oldClass, mod.newClass);
        modified = true;
        break;
      
      case 'replaceText':
        content = MODIFY_PATTERNS.replaceText(content, mod.oldText, mod.newText);
        modified = true;
        break;
      
      case 'addImport':
        content = MODIFY_PATTERNS.addImport(content, mod.importStatement);
        modified = true;
        break;
      
      case 'removeImport':
        content = MODIFY_PATTERNS.removeImport(content, mod.importStatement);
        modified = true;
        break;
      
      default:
        console.log(`   ⚠️  未知修改类型：${mod.type}`);
    }
  });
  
  if (modified) {
    return writeFile(filePath, content);
  } else {
    console.log(`   ℹ️  无修改`);
    return false;
  }
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
async function autoDevelop(taskDescription, projectPath, modifications) {
  console.log('🔨 Auto Developer 开始工作');
  console.log('================================');
  console.log('');
  console.log(`任务：${taskDescription}`);
  console.log(`项目：${projectPath}`);
  console.log(`修改数：${modifications.length}`);
  console.log('');
  
  // 切换到项目目录
  const originalDir = process.cwd();
  process.chdir(projectPath);
  console.log(`📁 工作目录：${process.cwd()}`);
  console.log('');
  
  const results = {
    success: true,
    modifiedFiles: [],
    failedFiles: []
  };
  
  // 执行修改
  for (const mod of modifications) {
    const filePath = path.join(projectPath, mod.filePath);
    const success = executeModification(filePath, mod.modifications);
    
    if (success) {
      results.modifiedFiles.push(mod.filePath);
    } else {
      results.failedFiles.push(mod.filePath);
    }
  }
  
  // Git 提交
  console.log('');
  console.log('📝 Git 提交...');
  gitAdd('-A');
  gitCommit(taskDescription);
  gitPush();
  
  // 恢复目录
  process.chdir(originalDir);
  
  console.log('');
  console.log('✅ Auto Developer 完成');
  console.log('');
  console.log('📊 结果:');
  console.log(`   成功：${results.modifiedFiles.length} 个文件`);
  console.log(`   失败：${results.failedFiles.length} 个文件`);
  console.log('');
  
  if (results.modifiedFiles.length > 0) {
    console.log('✅ 修改的文件:');
    results.modifiedFiles.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }
  
  if (results.failedFiles.length > 0) {
    console.log('❌ 失败的文件:');
    results.failedFiles.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }
  
  return results;
}

// 导出函数
module.exports = {
  readFile,
  writeFile,
  executeModification,
  gitAdd,
  gitCommit,
  gitPush,
  autoDevelop,
  MODIFY_PATTERNS
};

// CLI 模式
if (require.main === module) {
  console.log('AutoDev 自动代码开发器');
  console.log('');
  console.log('此模块提供自动代码修改能力');
  console.log('');
  console.log('使用示例:');
  console.log('  const { autoDevelop } = require("./auto-developer");');
  console.log('  ');
  console.log('  await autoDevelop(');
  console.log('    "优化页面样式",');
  console.log('    "/path/to/project",');
  console.log('    [');
  console.log('      {');
  console.log('        filePath: "src/app/page.tsx",');
  console.log('        modifications: [');
  console.log('          { type: "replaceClassName", oldClass: "w-5", newClass: "w-4" }');
  console.log('        ]');
  console.log('      }');
  console.log('    ]');
  console.log('  );');
}

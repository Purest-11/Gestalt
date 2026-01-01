/**
 * 修复后的初始化代码 - 复制到 mocap-simple.js 的末尾
 */

// 完全重写初始化逻辑，确保万无一失
console.log('mocap-simple.js module loaded');

// 等待页面完全加载
window.addEventListener('load', () => {
  console.log('Window load event fired');
  
  // 再延迟一点，确保所有资源都准备好
  setTimeout(() => {
    console.log('Starting SimpleMocapApp initialization...');
    try {
      const app = new SimpleMocapApp();
      console.log('SimpleMocapApp created successfully');
    } catch (error) {
      console.error('FATAL: Failed to create SimpleMocapApp:', error);
      console.error('Error stack:', error.stack);
      alert('初始化失败: ' + error.message + '\n请检查 Console 获取详细信息');
    }
  }, 200);
});


// Minimal Test App
console.log('✅ JavaScript loaded successfully!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM Content Loaded!');
  
  const app = document.getElementById('app');
  if (!app) {
    console.error('❌ No #app element found!');
    return;
  }
  
  app.innerHTML = `
    <div style="text-align: center; padding: 100px; color: white;">
      <h1 style="font-size: 48px; margin-bottom: 20px;">✅ LMS is Working!</h1>
      <p style="font-size: 24px; margin-bottom: 40px;">JavaScript loaded successfully</p>
      <button style="background: #667eea; color: white; padding: 15px 40px; border: none; border-radius: 8px; font-size: 20px; cursor: pointer;" onclick="alert('Button works!')">Test Button</button>
    </div>
  `;
  
  console.log('✅ Page rendered successfully!');
});

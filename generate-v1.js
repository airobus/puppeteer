// generate.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// ===================================================================================
// 函数一：下载所有卡片 (无改动)
// ===================================================================================
async function downloadAllCards(page, originFileName) {
  console.log('🔄 开始批量下载所有卡片...');
  const cards = await page.$$('.card');
  console.log(`🔎 找到了 ${cards.length} 张卡片。`);
  const outputDir = path.join(__dirname, 'output_cards');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  for (const card of cards) {
    const cardIndex = await card.evaluate(el => el.dataset.cardIndex);
    const fileName = `${originFileName}-${cardIndex}.png`;
    const filePath = path.join(outputDir, fileName);
    console.log(`  -> 正在截图卡片 #${fileName}...`);
    // 增加截图的清晰度，并确保截图区域透明背景正确处理
    await card.screenshot({
      path: filePath,
      omitBackground: true, // 如果卡片有圆角，建议开启此项以获得透明背景
    });
  }
  console.log(`✅ 所有卡片已成功下载到 "${outputDir}" 文件夹中！`);
}

// ===================================================================================
// 函数二：仅下载指定的单张卡片 (无改动)
// ===================================================================================
async function downloadSingleCard(page, cardIndex) {
  console.log(`🎯 准备下载指定的卡片 #${cardIndex}...`);
  const selector = `.card[data-card-index="${cardIndex}"]`;
  const card = await page.$(selector);
  if (card) {
    const filePath = path.join(__dirname, `card-${cardIndex}-single.png`);
    console.log(`  -> 正在截图...`);
    await card.screenshot({
      path: filePath,
      omitBackground: true,
    });
    console.log(`✅ 卡片 #${cardIndex} 已成功下载为 "${path.basename(filePath)}"！`);
  } else {
    console.error(`❌ 错误：未能在页面中找到 data-card-index 为 "${cardIndex}" 的卡片。`);
  }
}

// ===================================================================================
// 主执行函数 (增强稳定版)
// ===================================================================================
(async () => {
  let browser = null;
  try {
    console.log('🚀 1. 启动 Puppeteer...');
    browser = await puppeteer.launch({
      // ✨【修复一】: 使用新的、渲染更准确的无头模式
      headless: "new",
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log('✨ 2. 设置高清视口...');
    // 稍微增大视口，给 BENTO 布局更稳定的渲染空间
    await page.setViewport({
      width: 1300, 
      height: 1000,
      deviceScaleFactor: 2,
    });
    
    console.log('📄 3. 加载你的 HTML 模板...');
    const fileName = '123.html'; // 确保你的 HTML 文件叫这个名字
    const filePath = `file://${path.join(__dirname, 'html/' + fileName)}`;
    // 使用 networkidle2 已经足够，因为我们后面会精确等待字体
    await page.goto(filePath, { waitUntil: 'networkidle2' });

    console.log('🔧 4. 注入修复样式，强制禁用动画...');
    // ✨【修复二】: 在截图前，强制禁用所有动画和过渡效果
    await page.addStyleTag({
      content: `
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
          }
          /* 同时隐藏你不需要的下载按钮 */
          .single-download-btn, .download-container { 
            display: none !important; 
          }
        `
    });

    console.log('ண்ட் 5. 等待所有字体加载并渲染完毕...');
    // ✨【修复三】: 这是最关键的一步，确保字体被应用后再截图
    await page.evaluate(() => document.fonts.ready);

    console.log('📸 6. 开始执行截图任务...');
    // --- 在这里选择你要执行的任务 ---
    await downloadAllCards(page, fileName);
    // await downloadSingleCard(page, 1); 

  } catch (error) {
    console.error('❌ 截图过程中发生严重错误:', error);
  } finally {
    if (browser) {
      console.log('👋 7. 关闭浏览器...');
      await browser.close();
    }
  }
})();
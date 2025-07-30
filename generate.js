// generate.js
// import { launch } from 'puppeteer';
// import { join, basename } from 'path';
// import { existsSync, mkdirSync } from 'fs'; // 引入文件系统模块，用于创建文件夹
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs'); // 引入文件系统模块，用于创建文件夹

// ===================================================================================
// 函数一：下载所有卡片
// ===================================================================================
async function downloadAllCards(page, originFileName) {
  console.log('🔄 开始批量下载所有卡片...');

  // 使用 page.$$ 获取页面上所有 class 为 .card 的元素
  const cards = await page.$$('.card');
  console.log(`🔎 找到了 ${cards.length} 张卡片。`);

  // 创建一个文件夹来存放所有图片
  const outputDir = path.join(__dirname, 'output_cards');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // 使用 for...of 循环来逐个处理异步截图任务
  for (const card of cards) {
    // 从卡片元素中提取 data-card-index 属性，用于命名文件
    const cardIndex = await card.evaluate(el => el.dataset.cardIndex);
    const fileName = `${originFileName}-${cardIndex}.png`;
    const filePath = path.join(outputDir, fileName);

    console.log(`  -> 正在截图卡片 #${fileName}...`);
    await card.screenshot({ path: filePath });
  }

  console.log(`✅ 所有卡片已成功下载到 "${outputDir}" 文件夹中！`);
}

// ===================================================================================
// 函数二：仅下载指定的单张卡片
// ===================================================================================
async function downloadSingleCard(page, cardIndex) {
  console.log(`🎯 准备下载指定的卡片 #${cardIndex}...`);

  // 使用更精确的属性选择器来定位唯一的一张卡片
  const selector = `.card[data-card-index="${cardIndex}"]`;
  const card = await page.$(selector);

  if (card) {
    const filePath = path.join(__dirname, `card-${cardIndex}-single.png`);
    console.log(`  -> 正在截图...`);
    await card.screenshot({ path: filePath });
    console.log(`✅ 卡片 #${cardIndex} 已成功下载为 "${path.basename(filePath)}"！`);
  } else {
    console.error(`❌ 错误：未能在页面中找到 data-card-index 为 "${cardIndex}" 的卡片。`);
  }
}

// ===================================================================================
// 主执行函数 (稳定版模板)
// ===================================================================================
(async () => {
  let browser = null;
  try {
    console.log('🚀 1. 启动 Puppeteer...');
    browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log('✨ 2. 设置高清视口...');
    // 注意：这里的视口尺寸可以设置为页面大概的尺寸，不影响单个卡片截图的清晰度
    await page.setViewport({
      width: 540, //宽度: 1080px / 2 = 540px
      height: 960, //高度: 1920px / 2 = 960px
      deviceScaleFactor: 2, // 保持高清截图
    });

    // 在截图前注入 CSS，隐藏所有下载按钮，避免它们出现在图片上
    await page.addStyleTag({
      content: `
          .single-download-btn { display: none !important; }
          .download-container { display: none !important; }
        `
    });

    console.log('📄 3. 加载你的 HTML 模板...');
    const fileName = '123.html';
    const filePath = `file://${path.join(__dirname, 'html/' + fileName)}`;
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    console.log('⏳ 4. 等待动画和字体渲染完成...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // 等待 1 秒

    // --- 在这里选择你要执行的任务 ---
    // 选项 A: 下载所有卡片
    await downloadAllCards(page, fileName);

    // 选项 B: 只下载索引为 2 的卡片
    // await downloadSingleCard(page, 1); 

    // 选项 C: 下载索引为 0 和 5 的卡片
    // await downloadSingleCard(page, 0);
    // await downloadSingleCard(page, 5);

  } catch (error) {
    console.error('❌ 截图过程中发生严重错误:', error);
  } finally {
    if (browser) {
      console.log('👋 6. 关闭浏览器...');
      await browser.close();
    }
  }
})();
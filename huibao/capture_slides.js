const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched.');
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1920, height: 1080 });

    const filePath = path.join(__dirname, 'index_end.html');
    const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
    
    console.log(`Opening ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded.');

    const outputDir = path.join(__dirname, 'slides_jpg');
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }

    const slideCount = await page.$$eval('.slide', slides => slides.length);
    console.log(`Found ${slideCount} slides.`);

    await page.focus('body');

    for (let i = 0; i < slideCount; i++) {
        const fileName = `slide_${String(i + 1).padStart(2, '0')}.jpg`;
        const outputPath = path.join(outputDir, fileName);

        if (fs.existsSync(outputPath)) {
            console.log(`Skipping existing ${fileName}`);
            // Just navigate next
            if (i < slideCount - 1) {
                await page.evaluate(() => {
                    const nextBtn = document.getElementById('next-btn');
                    if (nextBtn) nextBtn.click();
                    else document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
                });
                await new Promise(r => setTimeout(r, 500)); // Short delay for skip
            }
            continue;
        }

        try {
            console.log(`Preparing slide ${i + 1}...`);
            await new Promise(r => setTimeout(r, 2000));

            console.log(`Taking screenshot for slide ${i + 1}...`);
            await page.screenshot({ 
                path: outputPath, 
                type: 'jpeg', 
                quality: 90 
            });
            console.log(`Saved ${fileName}`);

            if (i < slideCount - 1) {
                console.log('Navigating to next slide...');
                await page.evaluate(() => {
                    const nextBtn = document.getElementById('next-btn');
                    if (nextBtn) nextBtn.click();
                    else document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
                });
            }
        } catch (err) {
            console.error(`Error on slide ${i+1}:`, err);
        }
    }

    console.log(`Done. All slides saved to ${outputDir}`);
    await browser.close();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();

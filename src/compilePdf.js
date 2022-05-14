const puppeteer = require('puppeteer');
const { Liquid } = require('liquidjs');

const engine = new Liquid();
let browser;

const compilePdf = (file, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const templateBuffer = Buffer.from(file.buffer);
      const tpl = engine.parse(templateBuffer.toString());
      const htmlContent = await engine.render(tpl, data);

      if (!browser) {
        browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      }

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('print');

      const byteArray = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      const buffer = Buffer.from(byteArray, 'binary');
      page.close();
      resolve(buffer);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = compilePdf;

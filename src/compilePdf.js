const fs = require('fs');
const puppeteer = require('puppeteer');
const { Liquid } = require('liquidjs');
const { PDF_DIR } = require('./constants');

const engine = new Liquid();

const compilePdf = (filenameRaw, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filename = filenameRaw.includes('.liquid')
        ? filenameRaw
        : `${filenameRaw}.liquid`;
      const template = fs.readFileSync(`${PDF_DIR}/${filename}`, 'utf-8');
      if (!template)
        reject({ message: `'${filenameRaw}', template not found` });
      const tpl = engine.parse(template);
      const htmlContent = await engine.render(tpl, data);

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('print');

      const byteArray = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      const buffer = Buffer.from(byteArray, 'binary');
      browser.close();
      resolve(buffer);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = compilePdf;

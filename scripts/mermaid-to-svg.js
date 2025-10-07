const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const input = process.argv[2] || 'docs/documentacao-completa.md';
  const output = process.argv[3] || 'docs/architecture.svg';

  const md = fs.readFileSync(input, 'utf8');
  // extract first ```mermaid block (allow CRLF and flexible whitespace)
  const m = md.match(/```mermaid\s*([\s\S]*?)```/i);
  if (!m) {
    console.error('No mermaid block found in', input);
    process.exit(2);
  }

  const mermaidSrc = m[1];
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>
  <div id="container"></div>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: false });
    (async () => {
      try {
        const src = ${JSON.stringify(mermaidSrc)};
        const { svg } = await mermaid.render('m1', src);
        document.body.innerHTML = svg;
      } catch (e) {
        document.body.innerText = 'Mermaid render error: ' + e.message;
      }
    })();
  </script>
  </body></html>`;

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Wait for rendering
    await page.waitForTimeout(2000);
    // Extract the svg element
    const svg = await page.$eval('body', el => el.innerHTML);
    fs.writeFileSync(output, svg, 'utf8');
    await browser.close();
    console.log('SVG gerado em', output);
  } catch (err) {
    console.error('Erro ao gerar SVG:', err);
    process.exit(1);
  }
})();

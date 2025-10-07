const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

(async () => {
  const input = process.argv[2];
  const output = process.argv[3];

  if (!input || !output) {
    console.error('Usage: node scripts/md-to-pdf.js <input.md> <output.pdf>');
    process.exit(2);
  }

  try {
    const md = fs.readFileSync(input, 'utf8');

    // Build HTML with improved styling and syntax highlighting
    const css = `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
        color: #1f2937; 
        padding: 20px;
        line-height: 1.6;
      }
      .prose { max-width: 900px; margin: 0 auto; }
      .prose h1 { 
        font-size: 32px; 
        margin-top: 24px; 
        margin-bottom: 16px;
        color: #111827;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 8px;
      }
      .prose h2 { 
        font-size: 24px; 
        margin-top: 32px;
        margin-bottom: 12px;
        color: #374151;
      }
      .prose h3 { 
        font-size: 18px; 
        margin-top: 24px;
        margin-bottom: 8px;
        color: #4b5563;
      }
      .prose p { 
        margin-bottom: 12px;
        text-align: justify;
      }
      .prose ul, .prose ol {
        margin-bottom: 12px;
        padding-left: 24px;
      }
      .prose li {
        margin-bottom: 4px;
      }
      pre { 
        background: #1e293b; 
        color: #e2e8f0; 
        padding: 16px; 
        overflow: auto; 
        border-radius: 8px;
        margin: 16px 0;
        font-size: 13px;
      }
      code { 
        background: #f3f4f6; 
        padding: 2px 6px; 
        border-radius: 4px;
        font-size: 14px;
        color: #dc2626;
      }
      pre code {
        background: transparent;
        color: #e2e8f0;
        padding: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 14px;
      }
      th, td {
        border: 1px solid #d1d5db;
        padding: 8px 12px;
        text-align: left;
      }
      th {
        background: #f9fafb;
        font-weight: 600;
      }
      .diagram { 
        text-align: center; 
        margin: 24px 0;
        page-break-inside: avoid;
      }
      .diagram svg {
        max-width: 100%;
        height: auto;
      }
      blockquote {
        border-left: 4px solid #3b82f6;
        padding-left: 16px;
        margin: 16px 0;
        color: #6b7280;
        font-style: italic;
      }
      hr {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 32px 0;
      }
      .metadata { 
        color: #9ca3af; 
        font-size: 12px; 
        margin-bottom: 12px;
        text-align: center;
      }
    `;

    let htmlBody = marked(md);

    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <style>${css}</style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
    </head><body>
    <div class="prose">${htmlBody}</div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
    </body></html>`;

    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Add header/footer templates for page numbers
    await page.pdf({ 
      path: output, 
      format: 'A4', 
      printBackground: true, 
      margin: { 
        top: '25mm', 
        bottom: '25mm', 
        left: '20mm', 
        right: '20mm' 
      }, 
      displayHeaderFooter: true, 
      headerTemplate: '<div style="font-size:10px; width:100%; text-align:center; color:#6b7280; padding-top:10px;">SGR - Sistema de Gestão de Riscos</div>', 
      footerTemplate: '<div style="font-size:10px; width:100%; text-align:center; color:#6b7280; padding-bottom:10px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>' 
    });

    await browser.close();
    console.log('PDF gerado em', output);
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    process.exit(1);
  }
})();

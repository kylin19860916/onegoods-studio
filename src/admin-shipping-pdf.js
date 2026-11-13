import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function downloadShippingPdf(response) {
  const markup = await response.text();
  const page = new DOMParser().parseFromString(markup, 'text/html');
  const labelTables = [...page.querySelectorAll('table[id$="_bigsize_style_table"]')];
  if (!labelTables.length || !page.title.includes('內部測試')) throw new Error('找不到綠界測試面單。');
  const sheet = document.createElement('iframe');
  sheet.setAttribute('sandbox', 'allow-same-origin');
  sheet.setAttribute('aria-hidden', 'true');
  sheet.tabIndex = -1;
  sheet.style.cssText = 'position:fixed;left:-1200px;top:0;width:794px;height:1123px;border:0;pointer-events:none';
  const loaded = new Promise(resolve => sheet.addEventListener('load', resolve, { once: true }));
  sheet.srcdoc = markup;
  document.body.append(sheet);
  try {
    await loaded;
    const doc = sheet.contentDocument;
    const labels = [...doc.querySelectorAll('table[id$="_bigsize_style_table"]')];
    await Promise.all([...doc.images].map(image => image.decode()));
    const rows = [...new Set(labels.map(label => label.closest('.div_frame').closest('td').parentElement))];
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    for (const [index, row] of rows.entries()) {
      if (index % 2 === 0 && index > 0) pdf.addPage();
      const canvas = await html2canvas(row, { scale: 3, backgroundColor: '#ffffff', logging: false, width: Math.ceil(row.getBoundingClientRect().width) });
      const width = canvas.width / 3 * 25.4 / 96;
      const height = canvas.height / 3 * 25.4 / 96;
      pdf.addImage(canvas, 'PNG', 8, 8 + (index % 2) * 140, width, height);
      canvas.width = canvas.height = 0;
    }
    pdf.save('ogs-7eleven-labels-test.pdf');
  } finally {
    sheet.remove();
  }
}

// Using direct file write to overwrite completely rather than patching
import html2canvas from 'html2canvas'; // Kept imports for any lingering types, but unused
import jsPDF from 'jspdf'; // Kept imports for any lingering types, but unused

export interface WeeklyReportPayload {
  id?: string;
  title?: string;
  weekNumber?: number | string;
  submittedAt?: string;
  status?: string;
  intern?: {
    firstName?: string;
    lastName?: string;
  };
  student?: {
    firstName?: string;
    lastName?: string;
  };
}

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-_]/g, '')
    .toLowerCase() || 'report';

// Very small helper to safely encode text into HTML
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Shared print styles used for both print-to-PDF and blob-based previews
const PRINT_STYLES = `
    <style>
      :root { color-scheme: light; }
      
      /* Reset & Base Typography */
      body {
        background-color: white !important;
        color: #0f172a !important; /* slate-900 */
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start; 
        font-family: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.5;
      }
      
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box;
      }

      #print-root {
        width: 100%;
        max-width: 210mm; /* A4 width */
        margin: 0 auto;
        padding: 15mm 20mm; /* Professional margins */
        position: relative;
      }

      /* Typography Scale */
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        margin: 0 0 0.5em 0;
        color: #0f172a;
        line-height: 1.2;
      }
      h1 { font-size: 24pt; letter-spacing: -0.02em; }
      h2 { font-size: 18pt; letter-spacing: -0.01em; }
      h3 { font-size: 14pt; }
      h4 { font-size: 12pt; }
      
      p, li, span, div {
        font-size: 10pt;
        color: #334155; /* slate-700 */
      }
      
      /* Utility classes mapped from Tailwind */
      .text-xs { font-size: 8pt; }
      .text-sm { font-size: 9pt; }
      .text-base { font-size: 10pt; }
      .text-lg { font-size: 12pt; }
      .text-xl { font-size: 14pt; }
      .text-2xl { font-size: 18pt; }
      .text-3xl { font-size: 24pt; }
      
      .font-semibold { font-weight: 600; }
      .uppercase { text-transform: uppercase; }
      .tracking-tight { letter-spacing: -0.02em; }
      .tracking-wide { letter-spacing: 0.025em; }
      
      /* Specific tracking values from the template */
      .tracking-\\[0\\.35em\\] { letter-spacing: 0.35em; }
      .tracking-\\[0\\.4em\\] { letter-spacing: 0.4em; }
      .tracking-\\[0\\.45em\\] { letter-spacing: 0.45em; }
      .tracking-\\[0\\.5em\\] { letter-spacing: 0.5em; }
      .tracking-\\[0\\.6em\\] { letter-spacing: 0.6em; }

      /* Colors mapped from Tailwind (Print Safe) */
      .text-slate-300, .text-slate-400, .text-slate-500 { color: #64748b !important; } /* slate-500 */
      .text-slate-600, .text-slate-700 { color: #334155 !important; } /* slate-700 */
      .text-white, .text-slate-900 { color: #0f172a !important; } /* slate-900 */
      .text-amber-200, .text-amber-700 { color: #b45309 !important; } /* amber-700 */
      .text-emerald-300, .text-emerald-700 { color: #047857 !important; } /* emerald-700 */

      /* Hide interactive elements */
      .print\\:hidden, button {
        display: none !important;
      }

      /* --- Structural Layout --- */
      
      .report-print-root {
        display: flex;
        flex-direction: column;
        gap: 20pt;
      }

      /* Header Section */
      .report-print-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #e2e8f0; /* slate-200 */
        padding-bottom: 15pt;
        margin-bottom: 5pt;
      }
      
      .report-print-header > div:first-child {
        flex: 1;
      }
      
      .report-print-header .flex.items-center.gap-4 {
        display: flex;
        align-items: center;
        gap: 15pt;
        margin-bottom: 10pt;
      }
      
      /* Logo handling */
      .report-print-header img {
        height: 40pt;
        width: auto;
        object-fit: contain;
      }
      
      .report-print-header .max-w-2xl {
        max-width: 80%;
        font-style: italic;
        color: #475569 !important; /* slate-600 */
      }
      
      .report-print-header > div:last-child {
        text-align: right;
        min-width: 120pt;
      }

      /* Summary Card */
      .report-print-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15pt;
        background-color: #f8fafc !important; /* slate-50 */
        border: 1px solid #cbd5e1 !important; /* slate-300 */
        padding: 15pt;
        border-radius: 6pt;
      }
      
      .report-print-summary > div:last-child {
        text-align: right;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        gap: 4pt;
      }

      /* Metrics Row */
      .report-print-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12pt;
        margin-top: 15pt;
      }
      
      .report-print-metrics > div {
        border: 1px solid #cbd5e1 !important;
        border-top: 3px solid #0f172a !important; /* Strong top border for metrics */
        padding: 12pt;
        border-radius: 4pt;
        background-color: white !important;
      }
      
      .report-print-metrics p:nth-child(2) {
        font-size: 24pt;
        font-weight: 700;
        color: #0f172a !important;
        margin: 8pt 0;
      }

      /* Main Content Row */
      .report-print-main-row {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 15pt;
        margin-top: 15pt;
      }
      
      .report-print-main-row > div {
        border: 1px solid #cbd5e1 !important;
        padding: 15pt;
        border-radius: 6pt;
      }
      
      .report-print-main-row .flex.items-center.justify-between {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10pt;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 8pt;
      }
      
      /* Tasks List */
      .report-print-main-row > div:last-child .space-y-3 > div {
        margin-bottom: 10pt;
        padding-bottom: 10pt;
        border-bottom: 1px dashed #e2e8f0;
      }
      .report-print-main-row > div:last-child .space-y-3 > div:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      
      .report-print-main-row .flex.items-center.justify-between.text-sm {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4pt;
        border: none;
        padding: 0;
      }

      /* Two Column Section (Challenges & Goals) */
      .report-print-two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15pt;
        margin-top: 15pt;
        border-top: 2px solid #e2e8f0;
        padding-top: 15pt;
      }
      
      .report-print-two-col > div > div.space-y-3 > div {
        border-left: 3px solid #94a3b8 !important; /* slate-400 */
        padding: 8pt 12pt;
        margin-bottom: 8pt;
        background-color: #f8fafc !important;
      }

      /* Mentor Feedback Section */
      .report-print-root > div > div:last-child {
        margin-top: 20pt;
        border: 1px solid #cbd5e1 !important;
        border-top: 4px solid #334155 !important;
        padding: 15pt;
        border-radius: 6pt;
        background-color: #f8fafc !important;
        min-height: 150pt; /* Leave space for handwritten notes */
      }
      
      .report-print-root > div > div:last-child .flex {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10pt;
      }

      /* Print Media Query Overrides */
      @media print {
        @page { 
          size: A4 portrait; 
          margin: 10mm; 
        }
        
        body { 
          padding: 0; 
          background-color: white !important; 
        }
        
        #print-root { 
          padding: 0; 
          width: 100%; 
          max-width: none;
          margin: 0;
        }
        
        /* Ensure page breaks don't cut elements in half */
        .report-print-metrics,
        .report-print-main-row > div,
        .report-print-two-col > div,
        .report-print-root > div > div:last-child {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Force colors for print */
        * {
           color: #0f172a !important;
           -webkit-text-fill-color: #0f172a !important; 
           text-shadow: none !important;
           box-shadow: none !important;
        }
        
        /* Keep specific colored text in print */
        .text-amber-700 { color: #b45309 !important; -webkit-text-fill-color: #b45309 !important; }
        .text-emerald-700 { color: #047857 !important; -webkit-text-fill-color: #047857 !important; }
        .text-slate-500 { color: #64748b !important; -webkit-text-fill-color: #64748b !important; }
        
        /* Keep borders visible */
        *[class*="border"], .report-print-header, .report-print-summary, .report-print-metrics > div, .report-print-main-row > div, .report-print-root > div > div:last-child {
            border-color: #cbd5e1 !important;
        }
        
        /* Keep specific border colors */
        .report-print-metrics > div { border-top-color: #0f172a !important; }
        .report-print-root > div > div:last-child { border-top-color: #334155 !important; }
        .report-print-two-col > div > div.space-y-3 > div { border-left-color: #94a3b8 !important; }

        /* Keep background colors for cards */
        .report-print-summary, .report-print-two-col > div > div.space-y-3 > div, .report-print-root > div > div:last-child {
          background-color: #f8fafc !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
  `;


export const generatePdfBlob = async (
  element: HTMLElement,
  submission?: WeeklyReportPayload
): Promise<string | null> => {
  if (typeof window === 'undefined' || !element) return null;

  try {
    // Build a standalone HTML document (same layout/styles as print utility)
    // inside an offscreen iframe, then capture it with html2canvas.

    const internName = submission?.intern
      ? `${submission.intern.firstName || 'Intern'} ${
          submission.intern.lastName || ''
        }`
      : submission?.student
      ? `${submission.student.firstName || 'Student'} ${
          submission.student.lastName || ''
        }`
      : 'Report';
    const week = submission?.weekNumber ? `Week ${submission.weekNumber}` : 'Weekly';
    const title = `${internName} - ${week} Brief`;

    const htmlContent = element.innerHTML;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return null;
    }

    const baseTag = `<base href="${window.location.origin}/" />`;
    doc.open();
    doc.write(
      `<!DOCTYPE html><html><head>${baseTag}<title>${escapeHtml(
        title,
      )}</title>${PRINT_STYLES}</head><body><div id="print-root">${htmlContent}</div></body></html>`,
    );
    doc.close();

    // Wait for fonts/styles in the iframe to be ready
    const frameWindow = iframe.contentWindow as any;
    if (frameWindow && frameWindow.document && frameWindow.document.fonts) {
      await frameWindow.document.fonts.ready;
    } else if (document.fonts) {
      await document.fonts.ready;
    }

    const printRoot = doc.getElementById('print-root') as HTMLElement | null;
    if (!printRoot) {
      document.body.removeChild(iframe);
      return null;
    }

    // Use html2canvas to capture the print-styled element
    const canvas = await (html2canvas as any)(printRoot, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794,
      backgroundColor: '#ffffff',
    });

    // Calculate PDF dimensions
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add extra pages if content overflows
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Return blob URL to display in iframe
    const blobUrl = pdf.output('bloburl');

    document.body.removeChild(iframe);
    return blobUrl;
  } catch (error) {
    console.error("PDF Blob generation failed", error);
    return null;
  }
};

export const exportElementToPdf = async (
  element: HTMLElement,
  submission?: WeeklyReportPayload,
) => {
  if (typeof window === 'undefined') return;
  
  // Clean off empty style tags that might have broken rendering
  const cleanup: Array<() => void> = [];

  const internName = submission?.intern
    ? `${submission.intern.firstName || 'Intern'} ${submission.intern.lastName || ''}`
    : submission?.student
    ? `${submission.student.firstName || 'Student'} ${submission.student.lastName || ''}`
    : 'Report';
  const week = submission?.weekNumber ? `Week ${submission.weekNumber}` : 'Weekly';
  const title = `${internName} - ${week} Brief`;

  // Check if we already have a print iframe and remove it
  const existingIframe = document.getElementById('print-iframe');
  if (existingIframe) {
    document.body.removeChild(existingIframe);
  }

  // Create an iframe to print from
  const iframe = document.createElement('iframe');
  iframe.id = 'print-iframe';
  
  // Use off-screen positioning rather than display:none to allow style/font rendering
  // We give it specific dimensions to ensure layout calculation works correctly before print
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '210mm';
  iframe.style.height = '0'; // Height 0 to avoid scrolling the main page, but width is important
  iframe.style.border = '0';
  // visibility hidden is fine for the iframe container itself usually, but let's be safe
  iframe.style.opacity = '0'; 
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-1000';
  
  document.body.appendChild(iframe);
  cleanup.push(() => {
     // Delay removal to allow print dialog interaction
     setTimeout(() => {
       if (document.body.contains(iframe)) {
         document.body.removeChild(iframe);
       }
     }, 1000); // Shorter cleanup, we don't need minute-long
  });

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    cleanup.forEach(fn => fn());
    return;
  }
  
  doc.open();
  // Inherit the dark mode class if present on html tag in main app
  const isDark = document.documentElement.classList.contains('dark');
  // Add base tag to ensure relative assets (fonts, images) load correctly
  const baseTag = `<base href="${window.location.origin}/" />`;
  doc.write(`<!DOCTYPE html><html class="${isDark ? 'dark' : ''}"><head>${baseTag}<title>${title}</title>`);
  doc.write(PRINT_STYLES);
  
  doc.write('</head><body>');

  // SAFE BUT STRUCTURED MODE: minimal HTML export.
  // We keep the element's innerHTML (so headings, spans, etc. are preserved)
  // but rely ONLY on the minimal CSS above (no Tailwind) so print is stable.
  const htmlContent = element.innerHTML;

  doc.write('<div id="print-root">');
  doc.write(htmlContent);
  doc.write('</div>');
  
  // Add script to trigger print when loaded
  doc.write(`
    <script>
      window.onload = function() {
        // Wait for styles/fonts
        document.fonts.ready.then(() => {
           setTimeout(() => {
             // Use the iframe's window print function
             window.focus();
             try {
                window.print();
             } catch (e) {
                console.error("Print failed", e);
             }
             // Notify parent window? Or just let user manage dialog.
           }, 500);
        });
        
        // Ensure cleanup happens after print dialog closes
        window.onafterprint = function() {
           // We can remove the iframe here via parent call if needed, but the parent timeout handles it
        };
      };
    </script>
  `);
  
  doc.write('</body></html>');
  doc.close();

  // Execute cleanup (delayed removal to keep iframe alive during print dialog)
  // 5 minutes should be enough for anyone to choose settings
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 300000); 
};
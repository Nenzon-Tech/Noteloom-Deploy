/**
 * EduSpace Comprehensive Cost Report Document Generator
 * Generates an investor-ready cost breakdown covering APIs, Hosting, Database, Domain, and Emails.
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, Header, Footer, PageNumber, ShadingType
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DOCX_PATH = path.join(OUTPUT_DIR, 'EduSpace_August_Beta_Comprehensive_Cost_Report.docx');

// Styling colors
const BRAND_BLUE = '1E3A5F';
const ACCENT_TEAL = '0D9488';
const LIGHT_GRAY = 'F3F4F6';
const TEXT_DARK = '1F2937';
const TEXT_MUTED = '6B7280';

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 420, after: 180 },
  children: [
    new TextRun({ text, color: BRAND_BLUE, bold: true, size: 28, font: 'Calibri' })
  ]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 140 },
  children: [
    new TextRun({ text, color: ACCENT_TEAL, bold: true, size: 22, font: 'Calibri' })
  ]
});

const body = (text) => new Paragraph({
  spacing: { before: 80, after: 120, line: 300 },
  children: [
    new TextRun({ text, size: 20, font: 'Calibri', color: TEXT_DARK })
  ]
});

const bullet = (text) => new Paragraph({
  bullet: { level: 0 },
  spacing: { before: 60, after: 60, line: 280 },
  children: [
    new TextRun({ text, size: 20, font: 'Calibri', color: TEXT_DARK })
  ]
});

const boldBody = (label, rest) => new Paragraph({
  spacing: { before: 80, after: 120, line: 300 },
  children: [
    new TextRun({ text: label, bold: true, size: 20, font: 'Calibri', color: TEXT_DARK }),
    new TextRun({ text: rest, size: 20, font: 'Calibri', color: TEXT_DARK })
  ]
});

const divider = () => new Paragraph({
  border: { bottom: { color: 'D1D5DB', space: 1, value: BorderStyle.SINGLE, size: 4 } },
  spacing: { before: 160, after: 160 }
});

const cellText = (text, bold = false, size = 18, color = TEXT_DARK) => new Paragraph({
  children: [
    new TextRun({ text, bold, size, font: 'Calibri', color })
  ]
});

const createRow = (cells, isHeader = false, isAlt = false) => {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map(c => new TableCell({
      shading: {
        type: ShadingType.SOLID,
        color: isHeader ? BRAND_BLUE : (isAlt ? LIGHT_GRAY : 'FFFFFF')
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
        left: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
        right: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' }
      },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [cellText(c.text, c.bold || isHeader, c.size || (isHeader ? 19 : 18), isHeader ? 'FFFFFF' : TEXT_DARK)]
    }))
  });
};

const children = [
  // TITLE PAGE
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 800, after: 200 },
    children: [
      new TextRun({ text: 'COMPREHENSIVE BETA TEST COST REPORT', bold: true, size: 44, font: 'Calibri', color: BRAND_BLUE })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    children: [
      new TextRun({ text: 'EduSpace Academic SaaS Platform | August 2026 Trial', size: 24, font: 'Calibri', color: TEXT_MUTED })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 800 },
    children: [
      new TextRun({ text: 'User Profile: 350 Students, 200 Faculty, 10 College Admins, 7 IT Admins (567 Users)', size: 19, font: 'Calibri', color: TEXT_MUTED, italics: true })
    ]
  }),
  divider(),

  // SECTION 1
  h1('1. Overview & Setup Parameters'),
  body('This cost report provides a full production-level financial model for the upcoming August 2026 beta test of the EduSpace platform. Unlike previous API-only projections, this model accounts for all hosting infrastructure, database clustering, domain registration, transaction mailing limits, and CDN storage required to run a real college trial safely under load.'),
  boldBody('Trial Scope: ', '567 registered accounts (350 students, 200 faculty, 10 college admins, 7 system IT admins).'),
  boldBody('Duration: ', '1 Month (August 2026 — 22 active academic days).'),
  boldBody('Goal: ', 'Ensure 100% uptime, zero rate limits during simultaneous peak periods (e.g., daily routine changes and exam form submissions), and secure data logging.'),

  divider(),

  // SECTION 2
  h1('2. Infrastructure & Deployment Cost Breakdown'),
  body('Running a trial with 567 users on free tiers is highly risky due to connection throttling, rate limits, and storage boundaries. Below is the budgeted cost structure for dedicated production-grade infrastructure:'),

  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createRow([{ text: 'Item' }, { text: 'Provider & Plan' }, { text: 'Purpose in EduSpace' }, { text: 'Monthly Cost' }], true),
      createRow([{ text: 'Domain Registration' }, { text: 'Namecheap / Porkbun (.com)' }, { text: 'Custom SSL domain for the platform' }, { text: '$12.00 (Flat)' }], false, false),
      createRow([{ text: 'Frontend & API Hosting' }, { text: 'Vercel Pro (1 Team Seat)' }, { text: 'Deploys Vite SPA and serverless Express routes' }, { text: '$20.00/mo' }], false, true),
      createRow([{ text: 'Production Database' }, { text: 'MongoDB Atlas M10 (Dedicated)' }, { text: 'High concurrent connections (500+) and 10GB storage' }, { text: '$57.00/mo' }], false, false),
      createRow([{ text: 'Asset CDN & Video Storage' }, { text: 'Cloudinary Advanced Plan' }, { text: 'Hosts course videos, PDFs, and OCR visual files' }, { text: '$89.00/mo' }], false, true),
      createRow([{ text: 'Transactional Mail' }, { text: 'SendGrid Essentials (40K)' }, { text: 'Delivers registration OTPs & library alerts safely' }, { text: '$19.95/mo' }], false, false),
      createRow([{ text: 'Backup Compute Host' }, { text: 'Hugging Face Spaces (CPU Basic)' }, { text: 'Alternative backup Docker instance' }, { text: '$0.00 (Free)' }], false, true),
    ]
  }),
  new Paragraph({ spacing: { before: 120 } }),
  boldBody('Total Infrastructure Cost: ', '$197.95 USD (approx. Rs. 16,590 INR)'),

  divider(),

  // SECTION 3
  h1('3. API Usage Cost Breakdown (August 2026)'),
  body('Projections are calculated based on the Expected Adoption Scenario (50% student activity, 40% faculty activity, 50% admin activity daily over 22 active days in August).'),

  h2('3.1 DeepSeek Chat (V3) — Standard Text, Tutor & Mindmaps'),
  bullet('API Unit Rates: $0.14 per 1M Input tokens | $0.28 per 1M Output tokens'),
  bullet('Daily Expected Queries: 1,534 queries/day (students asking socratic questions, generating mindmaps, and summarizing textbooks).'),
  bullet('Assumed Context: 4,500 input tokens (college-level lecture files) | 550 output tokens.'),
  bullet('Total Monthly Cost: $21.26 (Input) + $5.20 (Output) = $26.46 USD (approx. Rs. 2,215 INR).'),

  h2('3.2 Google Gemini 2.5 Flash — Video Understand & Image Vision'),
  bullet('API Unit Rates: $0.075 per 1M Input tokens | $0.30 per 1M Output tokens'),
  bullet('Daily Expected Queries: 262 image queries/day (solving handwritten math) + 32 video summaries/day (15-minute MP4 lecture files).'),
  bullet('Total Monthly Cost: $10.08 (Input) + $1.03 (Output) = $11.11 USD (approx. Rs. 930 INR).'),

  new Paragraph({ spacing: { before: 120 } }),
  boldBody('Total API Usage Cost: ', '$37.57 USD (approx. Rs. 3,145 INR)'),

  divider(),

  // SECTION 4
  h1('4. Consolidated Budget Summary'),
  body('Here is the total budget forecast for the August 2026 beta test:'),

  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createRow([{ text: 'Category' }, { text: 'Expected Adoption Scenario' }, { text: 'Low Adoption Scenario (20%)' }, { text: 'Maximum Load Scenario (80%)' }], true),
      createRow([{ text: 'Infrastructure & Domain' }, { text: '$197.95' }, { text: '$197.95' }, { text: '$197.95' }], false, false),
      createRow([{ text: 'DeepSeek Chat (V3) API' }, { text: '$26.46' }, { text: '$6.03' }, { text: '$53.47' }], false, true),
      createRow([{ text: 'Google Gemini Flash API' }, { text: '$11.11' }, { text: '$1.75' }, { text: '$26.49' }], false, false),
      createRow([{ text: 'Grievance / Admin Overhead' }, { text: '$0.00' }, { text: '$0.00' }, { text: '$0.00' }], false, true),
      createRow([{ text: 'Total Projected Cost (USD)' }, { text: '$235.52' }, { text: '$205.73' }, { text: '$277.91' }], true, false),
      createRow([{ text: 'Total Projected Cost (INR)' }, { text: 'Rs. 19,735' }, { text: 'Rs. 17,240' }, { text: 'Rs. 23,290' }], true, true),
    ]
  }),
  new Paragraph({ spacing: { before: 120 } }),

  divider(),

  // SECTION 5
  h1('5. Essential Recommendations & Hidden Gaps'),
  bullet('Prepaid Balances: Load at least $45.00 across DeepSeek and Google Gemini consoles. Buy the custom domain and subscribe to Vercel Pro and SendGrid Essentials at the end of July.'),
  bullet('Database Throttling Risk: Do not attempt to run this trial on the free MongoDB M0 tier. With 550+ users logging in and marking daily attendance simultaneously, the 100-connection limit will crash the server. The dedicated M10 tier is mandatory for testing.'),
  bullet('Custom Domain Routing: Map the custom domain (e.g., app.eduspace.com) to Vercel. Set the frontend VITE_API_BASE variables to point to the serverless Vercel function routes correctly.'),
  bullet('Rate Limits & Protection: Establish an in-app middleware limit of maximum 20 AI queries per user per day to protect against runaway API consumption.')
];

const doc = new Document({
  creator: 'EduSpace Solutions Architect',
  description: 'EduSpace August Beta Test Full Financial and Infra Model',
  title: 'Comprehensive Cost Report',
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 20, color: TEXT_DARK }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { color: 'D1D5DB', space: 1, value: BorderStyle.SINGLE, size: 4 } },
              spacing: { after: 100 },
              children: [
                new TextRun({ text: 'EduSpace — Comprehensive Cost Report | August 2026', size: 17, font: 'Calibri', color: TEXT_MUTED, italics: true })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { color: 'D1D5DB', space: 1, value: BorderStyle.SINGLE, size: 4 } },
              spacing: { before: 100 },
              children: [
                new TextRun({ text: 'Page ', size: 17, font: 'Calibri', color: TEXT_MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], size: 17, font: 'Calibri', color: TEXT_MUTED }),
                new TextRun({ text: ' of ', size: 17, font: 'Calibri', color: TEXT_MUTED }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, font: 'Calibri', color: TEXT_MUTED }),
                new TextRun({ text: '  |  Confidential  |  College Beta Trial', size: 17, font: 'Calibri', color: TEXT_MUTED })
              ]
            })
          ]
        })
      },
      children
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(DOCX_PATH, buffer);
  console.log(`\n✅ Comprehensive Cost Report DOCX generated:\n    ${DOCX_PATH}\n`);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

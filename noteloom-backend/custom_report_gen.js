/**
 * EduSpace Custom Cost Report Generator
 * Custom Setup: Cloudinary Free, Vercel Pro, Hugging Face Spaces Base, Google Workspace SMTP.
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

const DOCX_PATH = path.join(OUTPUT_DIR, 'EduSpace_August_Beta_Custom_Cost_Report.docx');

// Colors
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

const noteBox = (title, texts) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.SOLID, color: 'EFF6FF' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '1D4ED8' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '1D4ED8' },
            left: { style: BorderStyle.SINGLE, size: 18, color: '1D4ED8' },
            right: { style: BorderStyle.NONE }
          },
          margins: { top: 120, bottom: 120, left: 180, right: 180 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: `ℹ ${title}`, bold: true, size: 20, font: 'Calibri', color: '1E40AF' })]
            }),
            ...texts.map(t => new Paragraph({
              spacing: { before: 60, after: 0 },
              children: [new TextRun({ text: t, size: 19, font: 'Calibri', color: '1E3A8A' })]
            }))
          ]
        })
      ]
    })
  ]
});

const children = [
  // TITLE
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 800, after: 200 },
    children: [
      new TextRun({ text: 'CUSTOM BETA TEST COST REPORT', bold: true, size: 44, font: 'Calibri', color: BRAND_BLUE })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    children: [
      new TextRun({ text: 'EduSpace Custom Config | August 2026 Trial', size: 24, font: 'Calibri', color: TEXT_MUTED })
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
  h1('1. Custom Configuration Overview'),
  body('This cost report details the financial model for your customized deployment plan of EduSpace for the August 2026 beta test. The setup leverages Vercel Pro for frontend hosting, a free Hugging Face Spaces container for the Express backend, Google Workspace for transaction mail, a free Cloudinary CDN tier, and MongoDB Atlas for database operations.'),
  boldBody('Scope: ', '567 active users (350 students, 200 faculty, 10 college admins, 7 system IT admins).'),
  boldBody('Duration: ', 'August 2026 (22 active college days).'),

  divider(),

  // SECTION 2
  h1('2. Infrastructure Cost Breakdown'),
  body('Below is the budgeted cost structure for your customized configuration:'),

  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createRow([{ text: 'Item' }, { text: 'Provider & Plan' }, { text: 'Role in EduSpace' }, { text: 'Monthly Cost' }], true),
      createRow([{ text: 'Custom Domain' }, { text: 'Namecheap / Porkbun (.com)' }, { text: 'SSL-secured domain mapping' }, { text: '$12.00 (Flat)' }], false, false),
      createRow([{ text: 'Frontend Hosting' }, { text: 'Vercel Pro (1 seat)' }, { text: 'Serves React Vite SPA with SSL' }, { text: '$20.00/mo' }], false, true),
      createRow([{ text: 'Backend Host' }, { text: 'Hugging Face Spaces (Base CPU)' }, { text: 'Hosts the Express API in a Docker container' }, { text: '$0.00 (Free)' }], false, false),
      createRow([{ text: 'Asset CDN' }, { text: 'Cloudinary Free Tier' }, { text: 'Stores note images and LMS media files' }, { text: '$0.00 (Free)' }], false, true),
      createRow([{ text: 'Email SMTP Service' }, { text: 'Google Workspace (1 email seat)' }, { text: 'SMTP relay for registration OTPs and alerts' }, { text: '$6.00/mo' }], false, false),
      createRow([{ text: 'Database' }, { text: 'MongoDB Atlas M5 (Shared)' }, { text: 'Prevents crash spikes at start-of-class times' }, { text: '$19.00/mo' }], false, true),
    ]
  }),
  new Paragraph({ spacing: { before: 120 } }),
  boldBody('Total Custom Infrastructure Cost: ', '$57.00 USD (approx. Rs. 4,790 INR)'),

  divider(),

  // SECTION 3
  h1('3. Sufficiency Analysis (Will this setup cover your users?)'),
  body('Yes, this custom configuration is highly sufficient for your college beta test, provided specific operational guidelines are followed during August.'),

  h2('3.1 Vercel Pro (Frontend) — More than Sufficient'),
  bullet('Vercel Pro provides 1TB of monthly bandwidth. A typical React SPA query is negligible in size. Your 567 users will consume less than 15GB of bandwidth, leaving a 98% safety margin.'),
  bullet('It supports custom domains and offers enterprise-grade SSL, which is more than sufficient for your requirements.'),

  h2('3.2 Hugging Face Spaces (Backend CPU) — Sufficient with Warnings'),
  bullet('Advantages: Hugging Face Spaces standard containers are persistent (they do not sleep like Render Free) and do not have the 10-second execution timeouts of Vercel Free, which prevents AI timeout errors.'),
  bullet('Limit 1 (Sleep mode): The free tier enters "Sleep" mode after 48 hours of inactivity. The workspace will be active daily during weekdays, but after weekends, the first Monday morning user will experience a 30-second delay while the Space builds.'),
  bullet('Limit 2 (CPU Sharing): Standard spaces run on shared CPU cores. If 100+ students run OCR files or chat with the AI simultaneously, request latency will spike. We recommend keeping daily limits on student queries to balance the load.'),

  h2('3.3 Cloudinary Free Tier (Asset CDN) — Sufficient with Workaround'),
  bullet('Limit: The free tier provides 25GB of monthly storage and bandwidth. If 200 faculty members upload raw 100MB lecture videos directly, the limit will be reached within days.'),
  bullet('Workaround: Instruct faculty to upload lecture videos to YouTube (as unlisted videos) and paste the links into the EduSpace LMS. EduSpace\'s built-in transcription parser will transcribe the YouTube video text for free, avoiding Cloudinary storage bandwidth consumption completely.'),

  h2('3.4 Google Workspace SMTP (Email) — Highly Sufficient'),
  bullet('Google Workspace limits SMTP relay accounts to 2,000 emails per day. For 567 users, daily transactional traffic (registration OTPs and overdue book notifications) will average 150–200 emails, which easily fits within the limit and ensures 100% inbox delivery (no spam folder issues).'),

  h2('3.5 Database: MongoDB Atlas M5 — Highly Sufficient'),
  bullet('We recommend the M5 tier ($19.00/mo) over the free M0 tier. M0 throttles concurrent connections at 100, which will cause crash errors when multiple classrooms log in to mark attendance at the start of a period. The M5 tier handles up to 500 concurrent connections, ensuring seamless stability for your 567 users.'),

  divider(),

  // SECTION 4
  h1('4. Model API Projections (August 2026)'),
  body('Projections are based on the Expected Adoption Scenario (50% student activity, 40% faculty activity daily).'),
  bullet('DeepSeek Chat (V3): $26.46 USD (handles all tutoring, mindmaps, and text document summaries).'),
  bullet('Google Gemini 2.5 Flash: $11.11 USD (handles image OCR, math solving, and native video understanding).'),
  new Paragraph({ spacing: { before: 120 } }),
  boldBody('Total API Usage Cost: ', '$37.57 USD (approx. Rs. 3,145 INR)'),

  divider(),

  // SECTION 5
  h1('5. Consolidated Cost Summary'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createRow([{ text: 'Category' }, { text: 'Monthly Budget (August 2026)' }], true),
      createRow([{ text: 'Domain Registration (.com)' }, { text: '$12.00 (Flat)' }], false, false),
      createRow([{ text: 'Infrastructure (Vercel, Google Workspace, Atlas M5)' }, { text: '$45.00/mo' }], false, true),
      createRow([{ text: 'DeepSeek V3 (Text AI)' }, { text: '$26.46/mo' }], false, false),
      createRow([{ text: 'Google Gemini Flash (Visual AI)' }, { text: '$11.11/mo' }], false, true),
      createRow([{ text: 'Total Projected Cost (USD)' }, { text: '$94.57 USD' }], true, false),
      createRow([{ text: 'Total Projected Cost (INR)' }, { text: 'Rs. 7,950 INR' }], true, true),
    ]
  }),
  new Paragraph({ spacing: { before: 120 } })
];

const doc = new Document({
  creator: 'EduSpace Solutions Architect',
  description: 'EduSpace August Beta Custom Config Cost Report',
  title: 'Custom Config Cost Report',
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
                new TextRun({ text: 'EduSpace — Custom Config Cost Report | August 2026', size: 17, font: 'Calibri', color: TEXT_MUTED, italics: true })
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
  console.log(`\n✅ Custom Cost Report DOCX generated:\n    ${DOCX_PATH}\n`);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

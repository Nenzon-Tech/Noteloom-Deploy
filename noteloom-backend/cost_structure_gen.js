/**
 * NoteLoom August Beta Cost Structure Document Generator
 * Uses the 'docx' library in noteloom-backend
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, Header, Footer, PageNumber, ShadingType,
  Spacing
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DOCX_PATH = path.join(OUTPUT_DIR, 'NoteLoom_August_Beta_Cost_Structure.docx');

// Colors
const BRAND_BLUE = '1E3A5F';
const ACCENT_TEAL = '0D9488';
const LIGHT_GRAY = 'F3F4F6';
const TEXT_DARK = '1F2937';
const TEXT_MUTED = '6B7280';

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 180 },
  children: [
    new TextRun({ text, color: BRAND_BLUE, bold: true, size: 28, font: 'Calibri' })
  ]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 120 },
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
      new TextRun({ text: 'COLLEGE BETA TEST COST STRUCTURE', bold: true, size: 44, font: 'Calibri', color: BRAND_BLUE })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    children: [
      new TextRun({ text: 'NoteLoom Academic Platform | August 2026', size: 24, font: 'Calibri', color: TEXT_MUTED })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 800 },
    children: [
      new TextRun({ text: 'Prepared for: 350 Students & 200 Faculty members', size: 20, font: 'Calibri', color: TEXT_MUTED, italics: true })
    ]
  }),
  divider(),

  // SECTION 1
  h1('1. Overview & Parameters'),
  body('This document details the feature-by-feature cost structure for the 1-month college beta testing of the NoteLoom platform scheduled for August 2026. The structure has been configured specifically for a college environment, incorporating larger document sizes, coding/math worksheets, and lecture videos.'),
  boldBody('Trial Scope: ', '350 student accounts and 200 faculty accounts across participating college streams (550 users total).'),
  boldBody('Active Period: ', 'August 2026 (22 active academic/instructional days).'),
  boldBody('Hybrid AI Engine Configuration: '),
  bullet('DeepSeek Chat (V3) — Serves as the primary engine for standard text chat, socratic tutoring, Mermaid flowchart mindmaps, and text document parsing (PDF/Word/Excel summaries).'),
  bullet('Google Gemini 2.5 Flash — Serves as the visual/multimodal engine for image OCR (solving written equations, reading diagrams) and native MP4 lecture video summaries.'),

  divider(),

  // SECTION 2
  h1('2. Feature-by-Feature Cost Structure'),
  body('The following tables detail token projections and costs per active day, calculated for the Expected Adoption Scenario (50% student activity, 40% faculty activity daily).'),

  h2('2.1 DeepSeek Chat (V3) Features (Standard Text/LMS)'),
  body('API Unit Rates: $0.14 per 1M Input tokens | $0.28 per 1M Output tokens'),

  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createRow([{ text: 'Feature' }, { text: 'Daily Queries' }, { text: 'Avg. Input' }, { text: 'Avg. Output' }, { text: 'Monthly Cost (22 Days)' }], true),
      createRow([{ text: 'Socratic Tutor Mode' }, { text: '300 queries' }, { text: '1,500 tokens' }, { text: '300 tokens' }, { text: '$1.94' }], false, false),
      createRow([{ text: 'Flowchart Mindmaps' }, { text: '50 queries' }, { text: '1,000 tokens' }, { text: '600 tokens' }, { text: '$0.33' }], false, true),
      createRow([{ text: 'LMS Document Summaries' }, { text: '100 queries' }, { text: '8,000 tokens' }, { text: '500 tokens' }, { text: '$2.77' }], false, false),
      createRow([{ text: 'General Chat & Academic Q&A' }, { text: '425 queries' }, { text: '2,500 tokens' }, { text: '400 tokens' }, { text: '$4.12' }], false, true),
    ]
  }),
  gap = () => new Paragraph({ spacing: { before: 120 } }),
  gap(),

  h2('2.2 Google Gemini 2.5 Flash Features (Multimodal/Vision)'),
  body('API Unit Rates: $0.075 per 1M Input tokens | $0.30 per 1M Output tokens'),

  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createRow([{ text: 'Feature' }, { text: 'Daily Queries' }, { text: 'Avg. Input' }, { text: 'Avg. Output' }, { text: 'Monthly Cost (22 Days)' }], true),
      createRow([{ text: 'Image OCR & Math Solver' }, { text: '80 queries' }, { text: '5,000 tokens' }, { text: '600 tokens' }, { text: '$0.98' }], false, false),
      createRow([{ text: 'Video Lecture Transcription' }, { text: '4 lectures' }, { text: '150,000 tokens' }, { text: '1,000 tokens' }, { text: '$1.02' }], false, true),
    ]
  }),
  gap(),

  divider(),

  // SECTION 3
  h1('3. Combined Monthly Projections (August 2026)'),
  body('Depending on actual college participation rates, we have prepared three projection models to guide budgeting:'),

  h2('3.1 Scenario 1: Low Adoption (20% Daily Active Users)'),
  bullet('Daily Active Users: 70 students, 40 faculty members.'),
  bullet('DeepSeek V3 usage: 350 queries/day. Gemini 2.5 usage: 60 images/day + 4 videos/day.'),
  bullet('Estimated August 2026 Cost: $7.78 USD (approx. Rs. 650 INR).'),

  h2('3.2 Scenario 2: Expected Baseline (50% Student & 40% Faculty Activity)'),
  bullet('Daily Active Users: 175 students, 80 faculty members (255 total).'),
  bullet('DeepSeek V3 usage: 1,515 queries/day. Gemini 2.5 usage: 262 images/day + 32 videos/day.'),
  bullet('Estimated August 2026 Cost: $37.24 USD (approx. Rs. 3,120 INR).'),

  h2('3.3 Scenario 3: Maximum Load (80% Daily Active Users)'),
  bullet('Daily Active Users: 280 students, 160 faculty members (440 total).'),
  bullet('DeepSeek V3 usage: 3,100 queries/day. Gemini 2.5 usage: 520 images/day + 80 videos/day.'),
  bullet('Estimated August 2026 Cost: $79.96 USD (approx. Rs. 6,700 INR).'),

  divider(),

  // SECTION 4
  h1('4. Non-API Infrastructure Costs'),
  bullet('Application Hosting (Vercel Edge & Serverless): $0.00 (Vercel Free/Hobby Tier covers testing workloads).'),
  bullet('Backup Hosting (Hugging Face Spaces): $0.00 (Free Space CPU tier).'),
  bullet('Database Storage (MongoDB Atlas): $0.00 (Atlas Free Tier allows up to 512MB, sufficient for 1 month of text logs).'),
  bullet('Media Delivery (Cloudinary): $0.00 (25 Free Credits, equivalent to 25GB bandwidth/storage — sufficient for video test files).'),
  bullet('Transactional Email (Gmail SMTP / SendGrid): $0.00 (SendGrid free tier allows up to 100 emails/day; Gmail standard account covers OTPs and alerts).'),

  divider(),

  // SECTION 5
  h1('5. Recommendations for August Trial'),
  bullet('Budget Allocation: We recommend allocating a total of $45.00 USD (prepaid) across your DeepSeek and Google Gemini consoles to prevent rate limits or service interruptions.'),
  bullet('In-App Limits: Place a daily query limit per student account (e.g., max 15 DeepSeek tutor chats and 3 image/video uploads per day) inside the frontend to protect against run-away scripts or excessive usage.'),
  bullet('Prompt Caching: Ensure Gemini Prompt Caching is enabled for repeating system instructions to reduce Gemini input costs by up to 50%.')
];

const doc = new Document({
  creator: 'NoteLoom Team',
  description: 'NoteLoom August Beta Test Cost Projections',
  title: 'Cost Projections',
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
                new TextRun({ text: 'NoteLoom — Cost Projections | August 2026 Trial', size: 17, font: 'Calibri', color: TEXT_MUTED, italics: true })
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
  console.log(`\n✅ Cost Structure DOCX generated:\n    ${DOCX_PATH}\n`);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

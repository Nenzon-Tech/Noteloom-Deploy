/**
 * PDF Generator for NoteLoom Privacy Policy
 * Uses jsPDF (installed in noteloom-frontend) + direct content rendering
 * Run from: noteloom-frontend directory
 */

const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

// ─── OUTPUT PATH ───────────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const PDF_PATH = path.join(OUTPUT_DIR, 'Privacy_Policy_NoteLoom.pdf');

// ─── DOCUMENT CONFIG ───────────────────────────────────────────────────────────
const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

const PAGE_W = doc.internal.pageSize.getWidth();   // 595.28
const PAGE_H = doc.internal.pageSize.getHeight();  // 841.89
const MARGIN = 60;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── COLORS ────────────────────────────────────────────────────────────────────
const BRAND_BLUE = [30, 58, 95];
const ACCENT_TEAL = [13, 148, 136];
const TEXT_DARK = [31, 41, 55];
const TEXT_MUTED = [107, 114, 128];
const WARN_BG = [254, 249, 195];
const WARN_BORDER = [217, 119, 6];
const DIVIDER = [209, 213, 219];
const TABLE_HEADER_BG = [30, 58, 95];
const TABLE_ROW_ALT = [249, 250, 251];

// ─── STATE ─────────────────────────────────────────────────────────────────────
let y = MARGIN;
let page = 1;

const addPage = () => {
  doc.addPage();
  y = MARGIN + 20;
  page++;
  // Header line
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 40, PAGE_W - MARGIN, 40);
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('NoteLoom — Privacy Policy | Last Updated: [DATE]', PAGE_W - MARGIN, 35, { align: 'right' });
};

const checkPage = (needed = 20) => {
  if (y + needed > PAGE_H - 60) addPage();
};

const setFont = (style = 'normal', size = 10, color = TEXT_DARK) => {
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
};

const addText = (text, x, size = 10, style = 'normal', color = TEXT_DARK, opts = {}) => {
  setFont(style, size, color);
  const lines = doc.splitTextToSize(text, CONTENT_W - (x - MARGIN));
  checkPage(lines.length * (size * 1.5) + 10);
  doc.text(lines, x, y, opts);
  y += lines.length * (size * 1.5) + 4;
  return lines.length;
};

const h1 = (text) => {
  checkPage(40);
  y += 18;
  setFont('bold', 15, BRAND_BLUE);
  // Underline effect
  const lines = doc.splitTextToSize(text, CONTENT_W);
  doc.text(lines, MARGIN, y);
  y += lines.length * 22 + 4;
  doc.setDrawColor(...ACCENT_TEAL);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, y - 2, MARGIN + 180, y - 2);
  y += 10;
};

const h2 = (text) => {
  checkPage(30);
  y += 12;
  setFont('bold', 12, ACCENT_TEAL);
  const lines = doc.splitTextToSize(text, CONTENT_W);
  doc.text(lines, MARGIN, y);
  y += lines.length * 18 + 6;
};

const body = (text, indent = 0) => {
  checkPage(20);
  setFont('normal', 9.5, TEXT_DARK);
  const lines = doc.splitTextToSize(text, CONTENT_W - indent);
  const lineH = 14;
  lines.forEach(line => {
    checkPage(lineH);
    doc.text(line, MARGIN + indent, y);
    y += lineH;
  });
  y += 4;
};

const bullet = (text, level = 0) => {
  const indent = 16 + level * 12;
  checkPage(20);
  setFont('normal', 9.5, TEXT_DARK);
  doc.text('•', MARGIN + indent - 10, y);
  const lines = doc.splitTextToSize(text, CONTENT_W - indent);
  const lineH = 14;
  lines.forEach((line, i) => {
    checkPage(lineH);
    doc.text(line, MARGIN + indent, y);
    y += lineH;
  });
  y += 2;
};

const boldBodyInline = (label, rest) => {
  checkPage(20);
  const lineH = 14;
  setFont('bold', 9.5, TEXT_DARK);
  const labelW = doc.getTextWidth(label);
  doc.text(label, MARGIN + 8, y);
  setFont('normal', 9.5, TEXT_DARK);
  const restLines = doc.splitTextToSize(rest, CONTENT_W - 8 - labelW);
  doc.text(restLines[0] || '', MARGIN + 8 + labelW, y);
  y += lineH;
  if (restLines.length > 1) {
    restLines.slice(1).forEach(l => {
      checkPage(lineH);
      doc.text(l, MARGIN + 8 + labelW, y);
      y += lineH;
    });
  }
  y += 4;
};

const divider = () => {
  y += 8;
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 12;
};

// ─── HEADER (page 1) ──────────────────────────────────────────────────────────
doc.setFillColor(30, 58, 95);
doc.rect(0, 0, PAGE_W, 5, 'F');
doc.setFillColor(13, 148, 136);
doc.rect(0, 5, PAGE_W, 2, 'F');

// Title
y = 80;
setFont('bold', 26, BRAND_BLUE);
doc.text('PRIVACY POLICY', PAGE_W / 2, y, { align: 'center' });
y += 36;
setFont('normal', 11, TEXT_MUTED);
doc.text('NoteLoom — Multi-Tenant College SaaS Platform', PAGE_W / 2, y, { align: 'center' });
y += 20;
setFont('italic', 9.5, TEXT_MUTED);
doc.text('Last Updated: [DATE]', PAGE_W / 2, y, { align: 'center' });
y += 28;
divider();

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

h1('1. Introduction & Scope');
body('This Privacy Policy ("Policy") describes how [COMPANY LEGAL NAME] ("Company," "we," "our," or "us") collects, uses, stores, and discloses information when you access or use the NoteLoom platform ("Service"), a multi-tenant Software-as-a-Service (SaaS) solution for higher-education institutions.');
body('This Policy applies to all users of the Service, including students, faculty members, college administrators, and IT system administrators who are authorised by a subscribing institution ("Tenant Institution" or "Client"). By accessing or using the Service, you acknowledge that you have read and understood this Policy.');

h1('2. Information We Collect');
h2('2.1 Information You Provide Directly');
body('The following personal data is collected through platform forms and registration flows:');
boldBodyInline('Registration (all roles): ', 'Full name, institutional email address, password (bcrypt-hashed, never stored plaintext), role, and institution college code.');
boldBodyInline('Student Profile: ', 'Phone number, gender, admission year, course, stream, academic year, roll number, current semester.');
boldBodyInline('Faculty Profile: ', 'Department, designation, qualification, years of experience, specialisation, employee ID.');
boldBodyInline('College Admin Profile: ', 'Admin level, responsibilities, employee ID, approval authority, access level.');
boldBodyInline('Leave Applications: ', 'Leave type, start/end dates, reason.');
boldBodyInline('COE / Exam Portal: ', 'Selected subjects, fee payment reference, roll number snapshot.');
boldBodyInline('Library System: ', 'Name, email, and NoteLoom ID for physical book loans; URL, title, and description for digital resource submissions.');
boldBodyInline('AI Study Assistant: ', 'Text messages, academic queries, and files uploaded for processing (PDF, DOCX, XLSX, PPTX, images, audio, video). Files are deleted from temporary storage immediately after processing.');
boldBodyInline('Notice Board: ', 'Text content, file attachments, reactions, and threaded comment text.');

h2('2.2 Information Collected Automatically');
body('The following data is stored in your browser\'s localStorage upon login:');
bullet('sessionToken — JWT authentication token (expires 24h / 12h for IT admins; cleared on logout).');
bullet('selectedCollegeCode — Institution code for login convenience.');
bullet('selectedCollegeLogo — Institution logo URL for branding display.');
bullet('lastActivity — Inactivity detection timestamp.');
bullet('darkMode — UI preference (true/false).');
bullet('itSessionToken / itLoginTime — IT admin session data.');
body('sessionStorage is used for a temporary UID during the registration flow, cleared when the tab is closed.');
body('We do not deploy any analytics trackers, session recording tools, advertising pixels, or third-party behavioural tracking scripts. We do not log raw user IP addresses at the application layer.');

h1('3. How We Use Your Information');
bullet('Service Provision: Account management, authentication, and delivery of all platform features.');
bullet('AI Features: Passing queries and file content to Google Gemini (primary) and Cloudflare Workers AI (fallback) for study assistance. Content is not used to train third-party models in ways that identify you.');
bullet('Communication: OTP delivery for registration and overdue library book alerts via Gmail SMTP and SendGrid.');
bullet('Exam Administration: Eligibility verification, form processing, fee calculation, QR-coded admit card generation.');
bullet('Library Operations: Book loan tracking, overdue fine computation (₹10/day), and automated email alerts.');
bullet('Security: JWT validation, role-based access control, session management, and audit logging.');
bullet('Scheduled Maintenance: Daily Vercel Cron (00:00 UTC) purges expired OTP codes and processes overdue library alerts.');

h1('4. Legal Basis for Processing');
h2('4.1 India — DPDP Act 2023');
body('Processing is based on: (a) Consent provided at registration via OTP verification; and (b) Legitimate uses necessary to perform contractual service obligations. The Tenant Institution acts as Data Fiduciary; the Company acts as Data Processor. A Data Processing Agreement (DPA) should be executed with each Tenant Institution.');
h2('4.2 European Economic Area — GDPR');
body('Where applicable: contract performance (Art. 6(1)(b)) for account and profile data; legitimate interests (Art. 6(1)(f)) for security and session management.');
h2('4.3 United States — CCPA');
body('The Service is primarily designed for institutional B2B use in India. We do not sell personal data. California residents retain applicable CCPA rights.');

h1('5. Third-Party Sharing & Sub-processors');
body('We share data with the following verified sub-processors only. We do not sell personal data.');

// Table
checkPage(160);
y += 8;
const colW = [170, 120, CONTENT_W - 290];
const tblX = [MARGIN, MARGIN + colW[0], MARGIN + colW[0] + colW[1]];
const rowH = 40;

// Header row
doc.setFillColor(...TABLE_HEADER_BG);
doc.rect(MARGIN, y, CONTENT_W, rowH, 'F');
setFont('bold', 8.5, [255, 255, 255]);
doc.text('Sub-processor', tblX[0] + 4, y + 14);
doc.text('Purpose', tblX[1] + 4, y + 14);
doc.text('Data Shared', tblX[2] + 4, y + 14);
y += rowH;

const rows = [
  ['MongoDB Atlas', 'Primary cloud database', 'All user, academic & operational data (tenant-isolated)'],
  ['Cloudinary', 'File storage & CDN', 'Uploaded videos, PDFs, images, and notice attachments'],
  ['Google Gemini', 'AI inference — primary', 'Text prompts, files (auto-deleted by Google in 48h)'],
  ['Cloudflare Workers AI', 'AI inference — fallback', 'Text prompts and image/audio when Gemini unavailable'],
  ['Gmail SMTP / SendGrid', 'Transactional email', 'Email addresses, OTP codes, and overdue notifications'],
  ['Vercel, Inc.', 'App hosting & compute', 'All HTTP traffic; server-level logs including IP addresses'],
  ['Hugging Face', 'Backup Docker hosting', 'Same as Vercel — alternative deployment target'],
];

rows.forEach((row, i) => {
  checkPage(rowH + 10);
  const bg = i % 2 === 0 ? TABLE_ROW_ALT : [255, 255, 255];
  doc.setFillColor(...bg);
  doc.rect(MARGIN, y, CONTENT_W, rowH, 'F');
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, CONTENT_W, rowH, 'S');

  setFont('bold', 8, TEXT_DARK);
  doc.text(doc.splitTextToSize(row[0], colW[0] - 8), tblX[0] + 4, y + 12);
  setFont('normal', 8, TEXT_DARK);
  doc.text(doc.splitTextToSize(row[1], colW[1] - 8), tblX[1] + 4, y + 12);
  doc.text(doc.splitTextToSize(row[2], colW[2] - 8), tblX[2] + 4, y + 12);
  y += rowH;
});
y += 12;

h1('6. Cookies & Tracking Technologies');
h2('6.1 Cookies');
body('The NoteLoom platform does not set any HTTP cookies. No cookie consent banner is required because no cookies are used.');
h2('6.2 localStorage & sessionStorage');
body('See Section 2.2 for the complete list of localStorage items. All items are essential or functional. No tracking or advertising items are stored. All session items are cleared on logout.');
h2('6.3 Third-Party Tracking');
body('No third-party analytics, session recording, advertising, or behavioural profiling tools are used.');

h1('7. Data Retention');
boldBodyInline('OTP Codes: ', 'Auto-expire after 10 minutes via MongoDB TTL index; daily cron also purges residual codes.');
boldBodyInline('Session Tokens: ', 'Expire after 24h (users) or 12h (IT admins) via MongoDB TTL; also invalidated on logout.');
boldBodyInline('User Accounts (Soft Delete): ', 'Membership suspended immediately; account flagged for deletion after 30 days. Hard deletion not yet automated (see Section 14, Gap 1).');
boldBodyInline('Tenant Records: ', 'Suspended and scheduled for deletion 90 days after IT admin deletion request.');
boldBodyInline('AI-Processed Files: ', 'Deleted from server temp storage immediately after processing. Google Gemini Files API retains for up to 48 hours.');
boldBodyInline('Academic Data: ', 'No automated retention schedule currently implemented. Persists until explicitly deleted by an authorised administrator (see Section 14, Gap 3).');

h1('8. Data Security');
bullet('Password Hashing: bcryptjs with cost factor 10; plaintext passwords never stored.');
bullet('JWT Authentication: All protected endpoints require a valid, signed JWT.');
bullet('AES-256-GCM Encryption: Library digital credentials (third-party portal login IDs and passwords) are encrypted at rest using AES-256-GCM via Node.js crypto.');
bullet('HTTPS/TLS: All data in transit is encrypted, enforced by Vercel.');
bullet('Multi-Tenant Isolation: All DB queries include a tenantId filter.');
bullet('CORS Allowlist: Backend restricts origins to known production domains, localhost, and LAN ranges.');
body('No security measure is 100% foolproof. We will notify affected Tenant Institutions of any confirmed breach per applicable law.');

h1('9. User Rights');
boldBodyInline('Access: ', 'Request a copy of your personal data by contacting your college administrator or us.');
boldBodyInline('Correction: ', 'Update profile data in the platform dashboard; ask your administrator for data you cannot edit yourself.');
boldBodyInline('Erasure: ', 'College administrators can initiate account deletion (30-day soft-delete window). Automated hard-deletion pending implementation.');
boldBodyInline('Portability: ', 'No self-service export exists yet. Submit a written request; we will respond within [PLACEHOLDER] days.');
boldBodyInline('Objection / Withdrawal: ', 'Contact us at [EMAIL] to object to processing or withdraw consent.');
body('To exercise rights, contact [EMAIL] or your institution\'s designated administrator.');

h1('10. International Data Transfers');
body('Data is processed on infrastructure operated by Vercel (US-based, global regions), MongoDB Atlas (region variable), Google (Gemini), Cloudflare, Cloudinary, and Twilio/SendGrid. Data may be transferred outside India and the EEA. Transfers rely on sub-processor DPAs and, for EEA users, Standard Contractual Clauses.');

h1('11. Children\'s Privacy');
body('NoteLoom is a B2B SaaS for higher-education institutions serving adult users. We do not knowingly collect data from individuals under 18 outside of an institutional context. Where a Tenant Institution grants access to minors, the institution is responsible for obtaining required parental or guardian consent.');

h1('12. Changes to This Policy');
body('We may update this Policy periodically. Material changes will be communicated via the platform notice board or by email. Continued use after the effective date constitutes acceptance.');

h1('13. Contact Information');
boldBodyInline('Company Legal Name: ', '[COMPANY LEGAL NAME]');
boldBodyInline('Address: ', '[ADDRESS LINE 1], [CITY], [STATE], [PIN CODE], India');
boldBodyInline('Email: ', '[PRIVACY@YOURDOMAIN.COM]');
boldBodyInline('Grievance Officer (DPDP Act): ', '[NAME], [TITLE], [EMAIL]');
body('We will respond to data requests within [PLACEHOLDER] calendar days.');

divider();

// ─── GAP SECTION ──────────────────────────────────────────────────────────────
checkPage(80);
y += 10;
doc.setFillColor(...WARN_BG);
doc.setDrawColor(...WARN_BORDER);
doc.setLineWidth(3);
doc.rect(MARGIN, y, CONTENT_W, 46, 'FD');
doc.setLineWidth(0.5);
setFont('bold', 10, [146, 64, 14]);
doc.text('⚠  Section 14 — Compliance Gaps to Review', MARGIN + 12, y + 16);
setFont('normal', 8.5, [120, 53, 15]);
doc.text('FOR INTERNAL USE ONLY. Remove before publishing publicly.', MARGIN + 12, y + 30);
y += 58;

h1('14. Compliance Gaps to Review');

const gaps = [
  ['GAP 1 — No Automated Hard-Deletion', 'Soft-delete logic exists (30-day window) but no cron or TTL mechanism performs the actual hard-delete of User, StudentProfile, FacultyProfile, or associated records. Action: Implement automated hard-deletion at day 30/90 or document as admin-initiated only.'],
  ['GAP 2 — No Data Processing Agreements (DPAs) with Tenant Institutions', 'Under GDPR Art. 28 and DPDP Act 2023, a written DPA must exist between the Company (Data Processor) and each Tenant Institution (Data Fiduciary). Action: Draft and execute a DPA addendum to each SaaS subscription agreement.'],
  ['GAP 3 — No Retention Schedule for Academic Data', 'Attendance, exam forms, LMS content, notices, leave applications, and library records have no defined retention period or automated deletion. Action: Define formal retention periods per data category (aligned with UGC/regulatory guidelines) and implement automated purging.'],
  ['GAP 4 — No Self-Service Data Export', 'No "Download My Data" feature exists in the UI. Action: Implement a data portability feature or establish a documented manual process with a stated response SLA.'],
  ['GAP 5 — No Documented Sub-processor DPAs', 'DPAs exist with all sub-processors (Vercel, MongoDB, Google, Cloudflare, Cloudinary, Twilio), but formal acceptance/execution and a maintained sub-processor register should be documented. Action: Accept all DPAs and maintain an internal register.'],
  ['GAP 6 — Grievance Officer Not Appointed', 'DPDP Act 2023 requires designation of a Grievance Officer. Action: Appoint a Grievance Officer and publish contact details in this Policy.'],
  ['GAP 7 — No Privacy Notice at Point of Collection', 'Registration forms do not link to this Privacy Policy. Action: Add "By registering, you agree to our [Privacy Policy]" with hyperlink on all registration screens.'],
  ['GAP 8 — Gemini Files API Disclosure', 'Files uploaded to the AI assistant are transiently sent to Google Gemini and auto-deleted after 48 hours. Users are not explicitly informed. Action: Add a disclosure banner in the AI assistant UI.'],
];

gaps.forEach(([title, desc]) => {
  h2(title);
  body(desc);
});

// ─── FOOTER (all pages) ───────────────────────────────────────────────────────
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, PAGE_H - 38, PAGE_W - MARGIN, PAGE_H - 38);
  setFont('normal', 7.5, TEXT_MUTED);
  doc.text(`Page ${i} of ${totalPages}  |  [COMPANY LEGAL NAME]  |  Confidential`, PAGE_W / 2, PAGE_H - 22, { align: 'center' });

  if (i > 1) {
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 40, PAGE_W - MARGIN, 40);
    setFont('italic', 7.5, TEXT_MUTED);
    doc.text('NoteLoom — Privacy Policy | Last Updated: [DATE]', PAGE_W - MARGIN, 35, { align: 'right' });
  }
}

// ─── WRITE FILE ────────────────────────────────────────────────────────────────
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(PDF_PATH, pdfBuffer);
console.log(`\n✅  PDF generated successfully:\n    ${PDF_PATH}\n`);

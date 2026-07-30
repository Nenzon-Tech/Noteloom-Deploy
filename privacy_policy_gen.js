/**
 * NoteLoom Privacy Policy Document Generator
 * Uses the 'docx' library (already a dependency in noteloom-backend)
 * Run from the noteloom-backend directory: node ../privacy_policy_gen.js
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, Header, Footer, PageNumber, ShadingType,
  Spacing, UnderlineType
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── OUTPUT PATH ───────────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DOCX_PATH = path.join(OUTPUT_DIR, 'Privacy_Policy_NoteLoom.docx');

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────────
const BRAND_BLUE = '1E3A5F';
const ACCENT_TEAL = '0D9488';
const LIGHT_GRAY = 'F3F4F6';
const TEXT_DARK = '1F2937';
const TEXT_MUTED = '6B7280';

// ─── HELPERS ───────────────────────────────────────────────────────────────────

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 480, after: 200 },
  children: [
    new TextRun({
      text,
      color: BRAND_BLUE,
      bold: true,
      size: 30,
      font: 'Calibri'
    })
  ]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 320, after: 140 },
  children: [
    new TextRun({
      text,
      color: ACCENT_TEAL,
      bold: true,
      size: 24,
      font: 'Calibri'
    })
  ]
});

const body = (text) => new Paragraph({
  spacing: { before: 100, after: 140, line: 320 },
  children: [
    new TextRun({
      text,
      size: 21,
      font: 'Calibri',
      color: TEXT_DARK
    })
  ]
});

const bullet = (text, level = 0) => new Paragraph({
  bullet: { level },
  spacing: { before: 80, after: 80, line: 300 },
  children: [
    new TextRun({
      text,
      size: 21,
      font: 'Calibri',
      color: TEXT_DARK
    })
  ]
});

const boldBody = (label, rest) => new Paragraph({
  spacing: { before: 100, after: 140, line: 320 },
  children: [
    new TextRun({ text: label, bold: true, size: 21, font: 'Calibri', color: TEXT_DARK }),
    new TextRun({ text: rest, size: 21, font: 'Calibri', color: TEXT_DARK })
  ]
});

const divider = () => new Paragraph({
  border: { bottom: { color: 'D1D5DB', space: 1, value: BorderStyle.SINGLE, size: 6 } },
  spacing: { before: 200, after: 200 }
});

const gap = () => new Paragraph({ spacing: { before: 160, after: 0 } });

// ─── NOTE BOX HELPER ───────────────────────────────────────────────────────────
const noteBox = (title, texts) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.SOLID, color: 'FEF9C3' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: 'D97706' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D97706' },
            left: { style: BorderStyle.SINGLE, size: 18, color: 'D97706' },
            right: { style: BorderStyle.NONE }
          },
          margins: { top: 120, bottom: 120, left: 180, right: 180 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: `⚠ ${title}`, bold: true, size: 20, font: 'Calibri', color: '92400E' })]
            }),
            ...texts.map(t => new Paragraph({
              spacing: { before: 60, after: 0 },
              children: [new TextRun({ text: t, size: 19, font: 'Calibri', color: '78350F' })]
            }))
          ]
        })
      ]
    })
  ]
});

// ─── DOCUMENT SECTIONS ─────────────────────────────────────────────────────────

const children = [

  // ── TITLE PAGE ──────────────────────────────────────────────────────────────
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 960, after: 200 },
    children: [
      new TextRun({
        text: 'PRIVACY POLICY',
        bold: true,
        size: 52,
        font: 'Calibri',
        color: BRAND_BLUE
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text: 'NoteLoom — Multi-Tenant College SaaS Platform', size: 28, font: 'Calibri', color: TEXT_MUTED })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 960 },
    children: [new TextRun({ text: 'Last Updated: [DATE]', size: 22, font: 'Calibri', color: TEXT_MUTED, italics: true })]
  }),
  divider(),

  // ── SECTION 1 ───────────────────────────────────────────────────────────────
  h1('1. Introduction & Scope'),
  body('This Privacy Policy ("Policy") describes how [COMPANY LEGAL NAME] ("Company," "we," "our," or "us") collects, uses, stores, and discloses information when you access or use the NoteLoom platform ("Service"), a multi-tenant Software-as-a-Service (SaaS) solution for higher-education institutions.'),
  body('This Policy applies to all users of the Service, including students, faculty members, college administrators, and IT system administrators who are authorised by a subscribing institution ("Tenant Institution" or "Client"). Individual users of the platform are typically provided access by and under the authority of their institution.'),
  body('By accessing or using the Service, you acknowledge that you have read and understood this Policy. If you are using the Service on behalf of an institution, you represent that the institution has authorised you to accept this Policy on its behalf.'),

  // ── SECTION 2 ───────────────────────────────────────────────────────────────
  h1('2. Information We Collect'),
  h2('2.1 Information You Provide Directly'),

  body('The following data is collected through platform forms and registration flows, based on the authenticated codebase:'),

  boldBody('Registration & Account Creation (all roles): ', 'Full name, institutional email address, password (hashed via bcryptjs, never stored in plain text), role (student / faculty / college admin), and institution college code.'),
  boldBody('Student Profile: ', 'Phone number, gender, admission year, course/programme, stream/specialisation, academic year, roll number, current semester.'),
  boldBody('Faculty Profile: ', 'Department, designation, qualification, years of experience, specialisation, employee ID.'),
  boldBody('College Administrator Profile: ', 'Admin level, responsibilities, employee ID, approval authority, access level.'),
  boldBody('Leave Applications: ', 'Leave type (casual, sick, duty, maternity, paternity, or loss-of-pay), start and end dates, reason for leave.'),
  boldBody('Exam / COE Portal: ', 'Selected examination subjects (regular and backlog), fee payment confirmation reference, roll number snapshot at time of submission.'),
  boldBody('Library System: ', 'Physical book borrowing: name, email, and NoteLoom ID stored against book copies. Digital resource submissions: title, author, URL, department, description.'),
  boldBody('AI Study Assistant: ', 'Text messages, academic queries, and files uploaded for summarisation or problem-solving (PDF, DOCX, XLSX, PPTX, images, audio, and video files). Files are processed transiently and are deleted from temporary server storage immediately after processing; they are not persistently stored by us.'),
  boldBody('Notice Board: ', 'Text content, file attachments (uploaded to Cloudinary), reactions, and threaded comment text when posting or interacting with notices.'),

  gap(),
  h2('2.2 Information Collected Automatically'),

  body('The following data is collected automatically when you interact with the Service:'),
  bullet('Session Token: A JSON Web Token (JWT) generated at login, stored in the browser\'s localStorage and on the server-side Session collection in MongoDB. Tokens expire after 24 hours (standard users) or 12 hours (IT administrators) and are auto-deleted by MongoDB TTL index upon expiry.'),
  bullet('Last Activity Timestamp: A Unix timestamp stored in localStorage (key: "lastActivity") updated on user interaction events (mouse movement, keyboard, scroll, click, touch) to support session timeout detection.'),
  bullet('Selected College Code: The institution college code selected during login, stored in localStorage (key: "selectedCollegeCode") to support returning-user login convenience.'),
  bullet('College Logo URL: Stored in localStorage (key: "selectedCollegeLogo") to display the institution\'s branding on the login page.'),
  bullet('User Interface Preference: A dark mode preference (true/false) stored in localStorage (key: "darkMode").'),
  bullet('Session-Storage UID: During the IT admin registration flow, a temporary UID is stored in sessionStorage (key: "registeredUid") and cleared when the browser tab is closed.'),
  bullet('IT Login Timestamp: For IT administrator sessions, login time is stored in localStorage (key: "itLoginTime").'),
  body('We do not use any third-party analytics trackers, session recording tools, advertising pixels, or behavioural tracking scripts. No Google Analytics, Mixpanel, PostHog, Hotjar, Microsoft Clarity, Intercom, Crisp, or equivalent service has been detected in the codebase.'),
  body('We do not log raw IP addresses of individual users at the application layer. Server-level access logs generated by the hosting provider (Vercel) may record IP addresses as part of standard infrastructure logging; please refer to Vercel\'s Privacy Policy for further details.'),

  // ── SECTION 3 ───────────────────────────────────────────────────────────────
  h1('3. How We Use Your Information'),
  body('We use the information collected for the following purposes:'),
  bullet('Service Provision: To create and manage user accounts, authenticate sessions, display role-appropriate dashboards, and deliver all core platform features (LMS, attendance, COE exam portal, library, notices, leave management).'),
  bullet('AI-Powered Features: To pass text messages, file contents, and academic queries to AI processing APIs (Google Gemini and Cloudflare Workers AI) for the purpose of generating study assistance, mindmap visualisations, file summaries, and video transcriptions. No AI responses or submitted content are used to train third-party models in ways that identify you.'),
  bullet('Communication: To deliver OTP verification codes and overdue library book alert emails to the email addresses registered in your profile, via Gmail SMTP and/or SendGrid.'),
  bullet('Exam Administration: To verify eligibility, record form submissions, compute fee breakdowns, and generate QR-coded PDF admit cards.'),
  bullet('Library Operations: To track physical book loans and returns, compute overdue fines (₹10/day), and dispatch automated overdue alert emails.'),
  bullet('Platform Administration: To allow IT administrators to manage tenant institutions, configure feature flags per role, and manage SaaS-level accounts.'),
  bullet('Security & Session Management: To validate JWT tokens, enforce role-based access control, detect inactive sessions, and invalidate sessions on logout.'),
  bullet('Scheduled Maintenance: A daily Vercel Cron Job (running at 00:00 UTC) purges expired email OTP verification codes and processes overdue library alerts.'),

  // ── SECTION 4 ───────────────────────────────────────────────────────────────
  h1('4. Legal Basis for Processing'),
  body('The legal basis for our processing activities depends on the applicable law and the nature of the processing:'),

  h2('4.1 India — Digital Personal Data Protection Act, 2023 (DPDP Act)'),
  body('For users located in India, we process personal data primarily on the basis of:'),
  bullet('Consent: Provided at the point of account registration, where you voluntarily submit personal data. Consent is documented via the email OTP verification step.'),
  bullet('Legitimate Uses: Processing necessary to perform the contractual service obligations between the Company and the subscribing Tenant Institution, including academic administration, exam management, and library services.'),
  body('The Tenant Institution (e.g., a college) acts as a "Data Fiduciary" in respect of its own users\' data, and the Company acts as a "Data Processor" in respect of that data. A Data Processing Agreement should be in place between the Company and each Tenant Institution. [COMPLIANCE GAP — see Section 14]'),

  h2('4.2 European Economic Area — GDPR'),
  body('If the Service is accessed by individuals in the EEA, we rely on the following legal bases:'),
  bullet('Contract Performance (Article 6(1)(b)): Processing of account and profile data necessary to deliver the contracted SaaS service.'),
  bullet('Legitimate Interests (Article 6(1)(f)): Processing for security, fraud prevention, and session management, where such interests are not overridden by data subject rights.'),
  bullet('Consent (Article 6(1)(a)): For optional communications beyond transactional emails, if and when introduced.'),

  h2('4.3 United States — CCPA'),
  body('The Service is primarily designed for institutional (B2B) use in India. If California residents use the Service, we do not sell or share personal data as defined under the CCPA. California residents retain the right to know, delete, and opt out of the sale of personal information; however, no sale of personal data occurs.'),

  // ── SECTION 5 ───────────────────────────────────────────────────────────────
  h1('5. Third-Party Sharing & Sub-processors'),
  body('We share data with the following third-party service providers (sub-processors), all of which have been verified in the codebase. We do not sell personal data to any third party.'),

  gap(),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({ shading: { type: ShadingType.SOLID, color: '1E3A5F' }, children: [new Paragraph({ children: [new TextRun({ text: 'Sub-processor', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })], margins: { top: 100, bottom: 100, left: 120, right: 60 } }),
          new TableCell({ shading: { type: ShadingType.SOLID, color: '1E3A5F' }, children: [new Paragraph({ children: [new TextRun({ text: 'Purpose', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })], margins: { top: 100, bottom: 100, left: 120, right: 60 } }),
          new TableCell({ shading: { type: ShadingType.SOLID, color: '1E3A5F' }, children: [new Paragraph({ children: [new TextRun({ text: 'Data Shared', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })], margins: { top: 100, bottom: 100, left: 120, right: 60 } }),
        ]
      }),
      ...[
        ['MongoDB Atlas (MongoDB, Inc.)', 'Primary cloud database', 'All user, academic, and operational data (stored with logical tenant isolation via tenantId)'],
        ['Cloudinary', 'Cloud-based file storage and CDN', 'Uploaded course videos, PDFs, document files, notice attachments, and profile images'],
        ['Google Gemini (Google LLC)', 'AI inference — primary model', 'Text prompts, academic queries, and file contents (PDF, images, video) submitted to the AI assistant. Files are deleted from Google\'s Files API automatically after 48 hours.'],
        ['Cloudflare Workers AI (Cloudflare, Inc.)', 'AI inference — fallback model', 'Text prompts and image or audio data when Gemini is unavailable'],
        ['Gmail SMTP / Google Workspace', 'Transactional email delivery', 'Recipient email addresses, OTP codes, and overdue library notification content'],
        ['SendGrid (Twilio Inc.)', 'Transactional email delivery (secondary)', 'Recipient email addresses and email message content'],
        ['Vercel, Inc.', 'Application hosting & serverless compute', 'All HTTP request/response data processed through the platform; server-level access logs including IP addresses'],
        ['Hugging Face (Hugging Face, Inc.)', 'Backup containerised hosting (Docker)', 'Same as Vercel — used as an alternative deployment target'],
      ].map(([name, purpose, data], i) => new TableRow({
        children: [
          new TableCell({ shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? 'F9FAFB' : 'FFFFFF' }, children: [new Paragraph({ children: [new TextRun({ text: name, size: 18, font: 'Calibri', color: TEXT_DARK })] })], margins: { top: 80, bottom: 80, left: 120, right: 60 } }),
          new TableCell({ shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? 'F9FAFB' : 'FFFFFF' }, children: [new Paragraph({ children: [new TextRun({ text: purpose, size: 18, font: 'Calibri', color: TEXT_DARK })] })], margins: { top: 80, bottom: 80, left: 120, right: 60 } }),
          new TableCell({ shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? 'F9FAFB' : 'FFFFFF' }, children: [new Paragraph({ children: [new TextRun({ text: data, size: 18, font: 'Calibri', color: TEXT_DARK })] })], margins: { top: 80, bottom: 80, left: 120, right: 60 } }),
        ]
      }))
    ]
  }),
  gap(),

  body('Each sub-processor is selected based on their data security standards. We recommend that Tenant Institutions review the Data Processing Agreements with each sub-processor listed above and ensure they align with applicable local law.'),

  // ── SECTION 6 ───────────────────────────────────────────────────────────────
  h1('6. Cookies & Tracking Technologies'),
  h2('6.1 Cookies'),
  body('The NoteLoom platform does not set HTTP cookies of any kind — neither session cookies nor persistent cookies. No cookie consent banner is currently implemented because no cookies are used.'),

  h2('6.2 localStorage (Browser Storage)'),
  body('The platform stores the following items in the browser\'s localStorage, which persists across browser sessions until cleared:'),

  bullet('sessionToken — Essential. Your JWT authentication token. Required for all authenticated API calls. Cleared on logout.'),
  bullet('selectedCollegeCode — Functional. Your institution\'s code, used to pre-fill the login form on return visits. Cleared explicitly on logout or can be cleared via browser settings.'),
  bullet('selectedCollegeLogo — Functional. URL of your institution\'s logo, used for branding the login screen.'),
  bullet('lastActivity — Essential/Functional. A timestamp of your last UI interaction, used to detect session inactivity. Cleared on logout.'),
  bullet('itLoginTime — Functional (IT Admin only). Timestamp of IT administrator login session.'),
  bullet('itSessionToken — Essential (IT Admin only). JWT token for the IT administrator portal. Cleared on logout.'),
  bullet('darkMode — Functional. Your dark/light mode UI preference (boolean). Persists independently of login state.'),

  h2('6.3 sessionStorage (Browser Storage)'),
  body('The platform uses sessionStorage for one transient purpose:'),
  bullet('registeredUid — Functional. Temporarily holds the assigned UID during the registration confirmation step. Automatically cleared when the browser tab is closed.'),

  h2('6.4 Third-Party Tracking'),
  body('No third-party tracking pixels, analytics scripts, session recording tools, advertising cookies, or behavioural profiling technologies are deployed on this platform.'),

  // ── SECTION 7 ───────────────────────────────────────────────────────────────
  h1('7. Data Retention'),
  body('The following retention periods are implemented in the codebase:'),

  boldBody('Email OTP Verification Codes: ', 'Automatically expire after 10 minutes via a MongoDB TTL index. A daily Vercel Cron Job also purges any residual expired codes at 00:00 UTC.'),
  boldBody('Session Tokens: ', 'Expire after 24 hours (standard users) or 12 hours (IT administrators) via a MongoDB TTL index. Tokens are also immediately invalidated on logout.'),
  boldBody('User Accounts (Soft Delete): ', 'When a College Administrator marks a user for deletion, their membership is suspended immediately and their account is scheduled for deletion after 30 days (the "deletionScheduledAt" field is set to 30 days from the deletion request). Hard deletion of the User record is not automatically executed after 30 days in the current implementation — this is flagged as a compliance gap (see Section 14).'),
  boldBody('Tenant/Institution Records: ', 'When an IT Administrator deletes a college, the Tenant record is scheduled for deletion 90 days from the request, with status set to "suspended."'),
  boldBody('Physical Library Book Records: ', 'Book records pending deletion carry a "deleteAfter" field; the daily cron job purges records past their scheduled deletion date.'),
  boldBody('AI-Processed Files: ', 'Files uploaded to the AI assistant are stored transiently in the server\'s temporary directory (os.tmpdir()) and are explicitly deleted immediately after processing completes. Files uploaded to Google\'s Gemini Files API are automatically deleted by Google after 48 hours.'),
  boldBody('Academic and LMS Data: ', 'No automated retention schedule has been implemented for attendance records, exam forms, LMS content, notices, or leave applications. These persist until explicitly deleted by an authorised administrator. [COMPLIANCE GAP — see Section 14]'),
  body('We encourage Tenant Institutions to define and communicate their own retention policies to their users and to request data deletion via the mechanisms described in Section 9.'),

  // ── SECTION 8 ───────────────────────────────────────────────────────────────
  h1('8. Data Security'),
  body('We implement the following technical security measures, all verified from the codebase:'),
  bullet('Password Hashing: All passwords are hashed using bcryptjs with a cost factor of 10 before storage. Plain-text passwords are never stored.'),
  bullet('JWT Authentication: All authenticated API endpoints require a valid JSON Web Token. Tokens contain only the minimum necessary claims (user ID, tenant ID, college code, and role).'),
  bullet('Library Credential Encryption: Database credentials stored in the Digital Library module (login IDs and passwords for third-party academic portals) are encrypted at rest using AES-256-GCM symmetric encryption via Node.js\'s built-in crypto module. The encryption key is derived from a dedicated ENCRYPTION_KEY environment variable (or falls back to JWT_SECRET).'),
  bullet('Transport Encryption: All data in transit is encrypted via HTTPS/TLS, enforced by the Vercel hosting platform.'),
  bullet('Multi-Tenant Data Isolation: All MongoDB queries include a tenantId filter, logically isolating each institution\'s data at the query layer.'),
  bullet('Dynamic CORS Policy: The backend enforces a strict dynamic CORS allowlist restricted to known production domains (noteloomtest.vercel.app), localhost, private LAN ranges, and Hugging Face Spaces domains.'),
  bullet('Proxy Token Forwarding: The Vercel frontend proxy forwards authentication tokens via a secure x-user-token header rather than passing tokens in query strings.'),
  bullet('Cron Job Authentication: The daily cron endpoint (/api/cron/cleanup) requires a shared secret (CRON_SECRET) to prevent unauthorised execution.'),
  body('Despite these measures, no method of transmission or storage is completely secure. We cannot guarantee absolute security and disclaim liability for breaches outside our reasonable control. We will notify affected Tenant Institutions of any confirmed data breach affecting their users\' data in accordance with applicable law.'),

  // ── SECTION 9 ───────────────────────────────────────────────────────────────
  h1('9. User Rights'),
  body('Depending on your jurisdiction and applicable law, you may have the following rights regarding your personal data:'),

  boldBody('Right of Access: ', 'You may request a copy of the personal data we hold about you. Contact your institution\'s college administrator or our support team.'),
  boldBody('Right to Correction: ', 'You may update your profile information directly within the platform dashboard. For data you cannot edit yourself, contact your college administrator.'),
  boldBody('Right to Erasure ("Right to be Forgotten"): ', 'You may request deletion of your account. College administrators may initiate a deletion on your behalf (account is suspended immediately and scheduled for deletion in 30 days). Note that automated hard-deletion after 30 days is not currently implemented (see Section 14).'),
  boldBody('Right to Data Portability: ', 'A self-service data export feature is not currently implemented in the platform. You may submit a written request to us, and we will provide your data in a machine-readable format within [PLACEHOLDER — e.g., 30 days].'),
  boldBody('Right to Object: ', 'You may object to processing based on legitimate interests. Contact us using the details in Section 13.'),
  boldBody('Right to Withdraw Consent: ', 'Where processing is based on consent, you may withdraw consent at any time by contacting us. Withdrawal does not affect the lawfulness of processing before withdrawal.'),

  body('To exercise any of the above rights, contact us at [EMAIL] or contact your institution\'s college administrator. We will respond within [PLACEHOLDER] calendar days as required by applicable law.'),
  body('Note: Because NoteLoom is a B2B SaaS product, personal data is provided to us by and on behalf of the Tenant Institution (the college). For certain requests, we will need to co-ordinate with the relevant institution. Individual users are encouraged to raise data requests with their institution\'s designated contact first.'),

  // ── SECTION 10 ──────────────────────────────────────────────────────────────
  h1('10. International Data Transfers'),
  body('The Service is hosted primarily on Vercel\'s infrastructure (with servers across multiple global regions, including the United States) and uses MongoDB Atlas (available in multiple cloud regions; your institution\'s cluster region may vary). Cloudinary stores files on servers in multiple regions. Google Gemini and Cloudflare AI process data on servers located outside India.'),
  body('If you are located in India, data processed by these sub-processors may be transferred to and stored in countries outside India. We rely on the contractual commitments of these sub-processors (as reflected in their respective Data Processing Agreements and standard contractual clauses) to ensure adequate protection of your personal data.'),
  body('If you are located in the EEA, transfers to third countries are made under appropriate safeguards, including Standard Contractual Clauses (SCCs) as approved by the European Commission.'),
  body('For specific information about sub-processor data transfer mechanisms, refer to each sub-processor\'s privacy documentation: Vercel (vercel.com/legal/privacy-policy), MongoDB (mongodb.com/legal/privacy-policy), Google (policies.google.com/privacy), Cloudflare (cloudflare.com/privacypolicy/), Cloudinary (cloudinary.com/privacy), and Twilio/SendGrid (twilio.com/legal/privacy).'),

  // ── SECTION 11 ──────────────────────────────────────────────────────────────
  h1('11. Children\'s Privacy'),
  body('The Service is a Business-to-Business (B2B) SaaS platform designed exclusively for use by higher-education institutions and their adult staff and enrolled students. We do not knowingly collect personal data from individuals under the age of 18 without the involvement of a Tenant Institution acting as the responsible party.'),
  body('If a Tenant Institution provides access to minors as part of their academic operations, the institution assumes responsibility for obtaining any required parental or guardian consent under applicable law.'),
  body('If we become aware that personal data of a child under 18 has been collected without appropriate authorisation, we will take steps to delete such data promptly.'),

  // ── SECTION 12 ──────────────────────────────────────────────────────────────
  h1('12. Changes to This Policy'),
  body('We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will update the "Last Updated" date at the top of this document and notify Tenant Institutions via the platform\'s notice board or by email.'),
  body('We encourage you to review this Policy periodically. Continued use of the Service after the effective date of a revised Policy constitutes your acceptance of the changes.'),

  // ── SECTION 13 ──────────────────────────────────────────────────────────────
  h1('13. Contact Information'),
  body('If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:'),
  gap(),
  boldBody('Company Legal Name: ', '[COMPANY LEGAL NAME]'),
  boldBody('Registered Address: ', '[ADDRESS LINE 1], [ADDRESS LINE 2], [CITY], [STATE], [PIN CODE], India'),
  boldBody('Email: ', '[PRIVACY@YOURDOMAIN.COM]'),
  boldBody('Grievance Officer (India — DPDP Act requirement): ', '[GRIEVANCE OFFICER NAME], [TITLE], [EMAIL]'),
  body('We will respond to data subject requests within [PLACEHOLDER — e.g., 30] calendar days.'),

  divider(),

  // ── SECTION 14 — GAPS ───────────────────────────────────────────────────────
  gap(),
  noteBox('⚠ Section 14 — Compliance Gaps to Review (Not for Public Distribution)', [
    'This section is for internal review. Remove before publishing the Privacy Policy publicly.'
  ]),
  gap(),
  h1('14. Compliance Gaps to Review'),
  body('The following gaps were identified during the codebase audit and must be addressed before this Privacy Policy is finalised and published:'),

  h2('GAP 1 — No Automated Hard-Deletion After 30-Day Window'),
  body('The user deletion logic (collegeAdminRoutes.js) sets a "deletionScheduledAt" field 30 days in the future and suspends membership, but no cron job or trigger exists to actually hard-delete the User record, StudentProfile, FacultyProfile, or associated data when that date arrives. Similarly for Tenant (college) records at 90 days.'),
  bullet('Action Required: Implement a cron job or MongoDB TTL mechanism to permanently delete user records and associated data (Membership, StudentProfile, FacultyProfile, ExamForms, Attendance records, etc.) after the scheduled deletion date. Alternatively, document that deletion is admin-initiated only and state this explicitly in the Policy.'),

  h2('GAP 2 — No Data Processing Agreements (DPAs) with Tenant Institutions'),
  body('The platform is a B2B SaaS where the Company processes personal data on behalf of colleges. Under GDPR (Article 28), DPDP Act 2023, and most modern data protection frameworks, a written Data Processing Agreement must exist between the Company (as Data Processor) and each Tenant Institution (as Data Fiduciary/Controller).'),
  bullet('Action Required: Draft and execute a DPA with each onboarded institution. This can be included as an addendum to the SaaS subscription agreement.'),

  h2('GAP 3 — No Retention Schedule for Academic Data'),
  body('Attendance records, exam forms (StudentExamForm), LMS content, notice board posts, leave applications, and library loan records have no defined retention period or automated deletion. This may conflict with data minimisation principles under GDPR and DPDP Act.'),
  bullet('Action Required: Define a formal data retention policy for each data category (e.g., 7 years for academic records per UGC guidelines, 3 years for leave records, etc.) and implement automated deletion accordingly.'),

  h2('GAP 4 — No Self-Service Data Export'),
  body('Users have no mechanism to request or download a copy of their own data from the platform UI. This is required under the DPDP Act\'s right to information and GDPR\'s right to portability.'),
  bullet('Action Required: Implement a "Download My Data" feature in the user profile dashboard, or establish a documented manual process with a stated response time.'),

  h2('GAP 5 — No Documented DPAs with Sub-processors'),
  body('While all sub-processors (Google Gemini, Cloudflare, Cloudinary, MongoDB, Vercel, SendGrid) offer DPAs, the Company should formally sign or accept these DPAs and maintain records demonstrating compliance.'),
  bullet('Action Required: Accept/sign DPAs with all sub-processors and maintain an internal sub-processor register.'),

  h2('GAP 6 — Grievance Officer Not Appointed'),
  body('India\'s DPDP Act 2023 requires appointment of a Grievance Officer for handling data principal complaints.'),
  bullet('Action Required: Designate a Grievance Officer and publish their contact details in this Policy before going live.'),

  h2('GAP 7 — No Privacy Notice at Point of Data Collection'),
  body('Registration forms do not display a privacy notice or link to this Policy at the point of data collection (e.g., during signup).'),
  bullet('Action Required: Add a "By registering, you agree to our [Privacy Policy]" link on all registration forms.'),

  h2('GAP 8 — Potential Issue with Google Gemini Files API Retention'),
  body('Files uploaded to the Google Gemini Files API are stated by Google to be deleted after 48 hours. However, the platform does not confirm file deletion after processing or store any record of what was submitted. For particularly sensitive academic documents, consider whether users should be informed that their content is transiently sent to Google.'),
  bullet('Action Required: Add a disclosure in the AI assistant UI stating that files are sent to Google Gemini for processing and are automatically deleted within 48 hours.'),
];

// ─── BUILD DOCUMENT ────────────────────────────────────────────────────────────

const doc = new Document({
  creator: 'NoteLoom',
  description: 'Privacy Policy — NoteLoom Multi-Tenant College SaaS',
  title: 'Privacy Policy',
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 21, color: TEXT_DARK }
      }
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        run: { color: BRAND_BLUE, size: 30, bold: true, font: 'Calibri' },
        paragraph: { spacing: { before: 480, after: 200 } }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        run: { color: ACCENT_TEAL, size: 24, bold: true, font: 'Calibri' },
        paragraph: { spacing: { before: 320, after: 140 } }
      }
    ]
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
                new TextRun({ text: 'NoteLoom — Privacy Policy | Last Updated: [DATE]', size: 17, font: 'Calibri', color: TEXT_MUTED, italics: true })
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
                new TextRun({ text: '  |  [COMPANY LEGAL NAME]  |  Confidential', size: 17, font: 'Calibri', color: TEXT_MUTED })
              ]
            })
          ]
        })
      },
      children
    }
  ]
});

// ─── WRITE FILE ────────────────────────────────────────────────────────────────

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(DOCX_PATH, buffer);
  console.log(`\n✅  DOCX generated successfully:\n    ${DOCX_PATH}\n`);
}).catch((err) => {
  console.error('❌ Error generating DOCX:', err);
  process.exit(1);
});

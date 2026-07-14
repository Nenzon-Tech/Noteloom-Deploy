export default async function handler(req, res) {
  const host = req.headers.host || 'noteloom.com';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;
  const urlPath = req.url.split('?')[0];

  // Fetch the static compiled index.html
  let html;
  try {
    const response = await fetch(`${baseUrl}/index.html`);
    if (response.ok) {
      html = await response.text();
    } else {
      throw new Error('Static index.html not found');
    }
  } catch (error) {
    html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Note Loom - Exams Made Simple</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  }

  // Setup default SEO values
  let seo = {
    title: "Note Loom - Exams Made Simple",
    description: "Access college learning materials, dynamic schedules, results, and student services on NoteLoom. Digitizing notes and LMS for colleges.",
    canonical: `${baseUrl}${urlPath}`,
    ogImage: `${baseUrl}/og-default.png`,
    ogType: "website",
    schema: null,
    bodyPreview: ""
  };

  // Determine page type and customize SEO
  const parsedUrl = new URL(req.url, 'http://localhost');
  const instituteSlug = parsedUrl.searchParams.get('instituteSlug');
  const blogSlug = parsedUrl.searchParams.get('blogSlug');
  const isPricing = urlPath.startsWith('/pricing');
  const isComparison = urlPath.startsWith('/comparison');
  const isBlogIndex = urlPath === '/blog';

  if (instituteSlug) {
    // 1. Institute Landing Page SSR
    try {
      const backendUrl = process.env.HF_SPACE_URL || 'https://noteloom-devops-noteloom-backend.hf.space';
      const hfToken = process.env.HF_TOKEN;
      
      const response = await fetch(`${backendUrl}/api/institutes/${instituteSlug}`, {
        headers: hfToken ? { 'authorization': `Bearer ${hfToken}` } : {}
      });

      if (response.ok) {
        const institute = await response.json();
        const instName = institute.name;
        const logo = institute.logoUrl ? `${backendUrl}/${institute.logoUrl}` : `${baseUrl}/og-default.png`;
        const location = institute.location || 'India';
        const category = institute.category || 'College';

        seo.title = `${instName} - NoteLoom Student Portal`;
        seo.description = `Access class modules, timetables, examinations, and digital library for ${instName} (${location}) on NoteLoom.`;
        seo.ogImage = logo;
        
        // Institute educational schema
        seo.schema = {
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": instName,
          "url": `${baseUrl}/institutes/${instituteSlug}`,
          "logo": logo,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": location,
            "addressCountry": "IN"
          },
          "description": seo.description
        };

        seo.bodyPreview = `
          <div class="ssr-preview p-8 text-center" style="font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <img src="${logo}" alt="${instName} Logo" style="max-height: 120px; margin: 0 auto 20px; display: block;" />
            <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px; color: #1e293b;">${instName}</h1>
            <p style="font-size: 1.25rem; color: #64748b; margin-bottom: 20px;">${category} • ${location}</p>
            <p style="max-width: 600px; margin: 0 auto 30px; color: #334155; line-height: 1.6;">Welcome to the official digital portal for ${instName} on NoteLoom. Login to access class modules, view class timetables, check notices, apply for leaves, download admit cards, and review semester results.</p>
            <div style="margin-top: 30px;">
              <a href="/login?code=${institute.collegeCode || ''}" style="background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; transition: background-color 0.2s;">Access Student/Faculty Portal</a>
            </div>
          </div>
        `;
      } else if (response.status === 404) {
        // Return 404 response header correctly for nonexistent/unpublished institutes
        res.status(404);
        seo.title = "Institute Not Found - NoteLoom";
        seo.description = "The requested college portal does not exist or has not been published yet.";
        seo.bodyPreview = `
          <div class="ssr-preview p-8 text-center" style="font-family: sans-serif; max-width: 600px; margin: 100px auto; padding: 40px; border: 1px solid #fecaca; border-radius: 8px; background: #fff5f5;">
            <h1 style="font-size: 2rem; font-weight: bold; color: #dc2626; margin-bottom: 15px;">Portal Not Active</h1>
            <p style="color: #7f1d1d; line-height: 1.6; margin-bottom: 20px;">The portal for "${instituteSlug}" is either nonexistent, inactive, or unpublished.</p>
            <a href="/" style="display: inline-block; color: #2563eb; text-decoration: underline; font-weight: bold;">Return to Homepage</a>
          </div>
        `;
      }
    } catch (err) {
      console.error("Error doing SSR for institute:", err);
    }
  } else if (blogSlug) {
    // 2. Blog Post SSR
    const blogPosts = {
      'campus-saas-adoption': {
        title: 'Adopting SaaS Solutions on Campus: A Guide for College Admins',
        desc: 'Discover best practices, change management tips, and efficiency benefits of deploying custom cloud portals for Indian colleges and universities.',
        author: 'NoteLoom Education Team',
        date: '2026-07-10',
        content: '<p>Modern campuses are rapidly digitizing, moving away from fragmented paper workflows and antiquated legacy software. Transitioning to a unified Software-as-a-Service (SaaS) platform enables college administrators to manage scheduling, attendance, course modules, leaves, and examinations seamlessly. This guide covers how college leaders can smoothly navigate SaaS adoption, align faculty members, and ensure student participation.</p>'
      },
      'digitize-note-sharing-colleges': {
        title: 'How to Digitize Note-Sharing and Study Materials for Colleges',
        desc: 'A step-by-step blueprint for digitizing notes, ensuring copyright compliance, and fostering student collaboration on modern college portals.',
        author: 'LMS Specialist Team',
        date: '2026-07-12',
        content: '<p>Academic success depends heavily on accessibility to high-quality notes and reading material. Traditional photocopying and messaging groups are disorganized and raise copyright risks. A centralized Learning Management System (LMS) with digital library controls streamlines content delivery. Learn how to seed class modules, configure role access permissions, and track content progress.</p>'
      },
      'pilot-institute-case-study': {
        title: 'Case Study: How NoteLoom Digitized IEM Kolkata Campus Operations',
        desc: 'Review the results from our first beta deployment at IEM Kolkata, saving 40+ hours per week of admin effort and improving exam registration speeds.',
        author: 'Operations Team',
        date: '2026-07-14',
        content: '<p>NoteLoom successfully deployed its B2B college portal at the Institute of Engineering Management, Kolkata. The pilot program targeted student-faculty note sharing, examinations, and leave management. The implementation resulted in a 40% reduction in administrative times, near-instant automated generation of admit cards, and 95% active student engagement.</p>'
      }
    };

    const post = blogPosts[blogSlug];
    if (post) {
      seo.title = `${post.title} | NoteLoom Blog`;
      seo.description = post.desc;
      seo.ogType = "article";

      seo.schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.desc,
        "author": {
          "@type": "Organization",
          "name": "NoteLoom"
        },
        "datePublished": post.date,
        "url": `${baseUrl}/blog/${blogSlug}`
      };

      seo.bodyPreview = `
        <article class="ssr-preview p-8 max-w-3xl mx-auto" style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <p style="color: #666; font-size: 0.9rem;">Published on ${post.date} by ${post.author}</p>
          <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 20px; color: #111;">${post.title}</h1>
          <div style="font-size: 1.15rem; line-height: 1.6; color: #333;">${post.content}</div>
        </article>
      `;
    } else {
      res.status(404);
      seo.title = "Post Not Found | NoteLoom Blog";
    }
  } else if (isPricing) {
    seo.title = "Pricing Plans for Colleges and Students | NoteLoom";
    seo.description = "Flexible B2B SaaS pricing packages for entire college campuses, plus tailored plans for individual students seeking AI study helpers.";
    
    seo.bodyPreview = `
      <div class="ssr-preview p-8 text-center" style="font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 15px; color: #1e293b;">NoteLoom Pricing</h1>
        <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 40px;">Choose the plan that fits your campus or study needs</p>
        <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; max-width: 900px; margin: 0 auto;">
          <div style="border: 1px solid #cbd5e1; padding: 30px; border-radius: 8px; width: 300px; background: white; text-align: left; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-top: 0; color: #1e293b;">Individual Student</h3>
            <p style="font-size: 2.5rem; font-weight: bold; margin: 15px 0; color: #2563eb;">₹49 <span style="font-size: 1.1rem; color:#64748b; font-weight: normal;">/ mo</span></p>
            <p style="color: #475569; line-height: 1.5;">AI mind-mapping, tesseract OCR note upload, course trackers, and dynamic exam routines.</p>
          </div>
          <div style="border: 2px solid #2563eb; padding: 30px; border-radius: 8px; width: 300px; background: white; text-align: left; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1); position: relative;">
            <span style="background: #2563eb; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; position: absolute; top:-12px; left:50%; transform: translateX(-50%); text-transform: uppercase; letter-spacing: 0.05em;">Campus-Wide</span>
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-top: 0; color: #1e293b;">Institution B2B SaaS</h3>
            <p style="font-size: 2.2rem; font-weight: bold; margin: 15px 0; color: #1e293b;">Custom Quote</p>
            <p style="color: #475569; line-height: 1.5;">Full deployment: Department management, Faculty LMS, Exams/Marks CoE controller, Leave workflows, and Digital Library modules.</p>
          </div>
        </div>
      </div>
    `;
  } else if (isComparison) {
    seo.title = "NoteLoom vs Google Classroom & Notion for Indian Colleges";
    seo.description = "See why NoteLoom is the superior choice for Indian universities and engineering colleges compared to Google Classroom and generic tools like Notion.";
    
    seo.bodyPreview = `
      <div class="ssr-preview p-8 max-w-4xl mx-auto" style="font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 20px; color: #1e293b;">NoteLoom vs Google Classroom & Notion</h1>
        <p style="font-size: 1.2rem; text-align: center; color: #64748b; margin-bottom: 40px;">A side-by-side comparison for college directors and academic administrators.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 1.1rem; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 16px; text-align: left; color: #1e293b;">Feature</th>
              <th style="padding: 16px; text-align: left; color: #2563eb;">NoteLoom</th>
              <th style="padding: 16px; text-align: left; color: #475569;">Google Classroom</th>
              <th style="padding: 16px; text-align: left; color: #475569;">Notion</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 16px; font-weight: bold; color: #334155;">Indian College Compliance</td>
              <td style="padding: 16px; color: #15803d; font-weight: bold;">Yes (CoE, Marks, Admit Cards)</td>
              <td style="padding: 16px; color: #b91c1c;">No (No exam management)</td>
              <td style="padding: 16px; color: #b91c1c;">No (Generic database only)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
              <td style="padding: 16px; font-weight: bold; color: #334155;">Faculty/Student Leave Workflows</td>
              <td style="padding: 16px; color: #15803d; font-weight: bold;">Yes (Built-in approval)</td>
              <td style="padding: 16px; color: #b91c1c;">No</td>
              <td style="padding: 16px; color: #c2410c;">Partial (requires complex setup)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 16px; font-weight: bold; color: #334155;">Automated Attendance</td>
              <td style="padding: 16px; color: #15803d; font-weight: bold;">Yes</td>
              <td style="padding: 16px; color: #c2410c;">Partial (via extensions)</td>
              <td style="padding: 16px; color: #b91c1c;">No</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
              <td style="padding: 16px; font-weight: bold; color: #334155;">AI Study Helpers & mindmaps</td>
              <td style="padding: 16px; color: #15803d; font-weight: bold;">Yes (Tesseract OCR + Mermaid)</td>
              <td style="padding: 16px; color: #b91c1c;">No</td>
              <td style="padding: 16px; color: #c2410c;">Partial (paid Notion AI add-on)</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (isBlogIndex) {
    seo.title = "Campus SaaS Adoption and Digital Learning Blog | NoteLoom";
    seo.description = "Read our latest articles on digitizing study material, managing campus exams, and adopting SaaS workflows inside college administrations.";
  }

  // Generate SEO tags HTML block
  let seoTags = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}" />
    <link rel="canonical" href="${seo.canonical}" />
    
    <!-- Open Graph -->
    <meta property="og:type" content="${seo.ogType}" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:image" content="${seo.ogImage}" />
    <meta property="og:url" content="${seo.canonical}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${seo.ogImage}" />
  `;

  if (seo.schema) {
    seoTags += `\n    <script type="application/ld+json">${JSON.stringify(seo.schema)}</script>`;
  }

  // Inject SEO tags into index.html
  // Replace <title>...</title> if it exists, otherwise insert in <head>
  const titleRegex = /<title>[^<]*<\/title>/i;
  if (titleRegex.test(html)) {
    html = html.replace(titleRegex, seoTags);
  } else {
    html = html.replace('<head>', `<head>\n${seoTags}`);
  }

  // Inject body preview skeleton inside <div id="root"></div> for SEO crawlers
  if (seo.bodyPreview) {
    html = html.replace('<div id="root"></div>', `<div id="root">${seo.bodyPreview}</div>`);
  }

  // Return the server-rendered page
  res.setHeader('Content-Type', 'text/html');
  res.status(res.statusCode || 200).send(html);
}

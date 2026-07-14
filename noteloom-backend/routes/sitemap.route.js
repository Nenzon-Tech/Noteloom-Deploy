const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');

router.get('/sitemap.xml', async (req, res) => {
  try {
    // Fetch all active, published college tenants
    const institutes = await Tenant.find({
      type: 'college',
      status: 'active',
      isPublished: true
    }).select('slug updatedAt');

    const baseUrl = 'https://noteloom.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/comparison/google-classroom-notion</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    institutes.forEach(inst => {
      if (inst.slug) {
        const lastMod = inst.updatedAt ? inst.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `
  <url>
    <loc>${baseUrl}/institutes/${inst.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;

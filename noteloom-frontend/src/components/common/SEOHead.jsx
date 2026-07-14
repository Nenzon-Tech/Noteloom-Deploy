import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  schemaData
}) => {
  const defaultTitle = 'Note Loom - Exams Made Simple';
  const defaultDesc = 'Access college learning materials, dynamic schedules, results, and student services on NoteLoom. Digitizing notes and LMS for colleges.';
  const defaultOgImage = 'https://noteloom.com/og-default.png'; // Real default Open Graph image

  const metaTitle = title || defaultTitle;
  const metaDesc = description || defaultDesc;
  const image = ogImage || defaultOgImage;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />

      {/* Canonical Link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={image} />

      {/* Schema / JSON-LD */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

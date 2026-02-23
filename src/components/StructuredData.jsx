import React from 'react';

const DEFAULT_SITE_URL = 'https://www.sahanpramuditha.me';

const normalizeSiteUrl = (rawUrl) => {
  if (!rawUrl) return DEFAULT_SITE_URL;
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
};

const StructuredData = () => {
  const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Sahan Pramuditha",
    "jobTitle": "Software Engineer & Creative Developer",
    "url": siteUrl,
    "sameAs": [
      "https://github.com/SahanPramuditha-Dev",
      "https://www.linkedin.com/in/sahan-pramuditha-754761356/",
      "https://twitter.com/sahanpramuditha"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "LK",
      "addressLocality": "Sri Lanka"
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "University of Colombo - Faculty of Technology"
    },
    "knowsAbout": [
      "Software Engineering",
      "Web Development",
      "React",
      "Three.js",
      "Full-Stack Development"
    ]
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sahan Pramuditha Portfolio",
    "url": siteUrl,
    "author": {
      "@type": "Person",
      "name": "Sahan Pramuditha"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
    </>
  );
};

export default StructuredData;

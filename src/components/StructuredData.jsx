import React from 'react';

const DEFAULT_SITE_URL = 'https://sahanpramuditha.com';

const normalizeSiteUrl = (rawUrl) => {
  if (!rawUrl) return DEFAULT_SITE_URL;
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
};

const StructuredData = () => {
  const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL);
  const canonicalUrl = `${siteUrl}/`;
  const personId = `${canonicalUrl}#person`;
  const websiteId = `${canonicalUrl}#website`;
  const profilePageId = `${canonicalUrl}#profile`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: 'Sahan Pramuditha',
        givenName: 'Sahan',
        familyName: 'Pramuditha',
        jobTitle: 'Software Engineer and Creative Developer',
        url: canonicalUrl,
        image: `${canonicalUrl}favicon.svg`,
        description:
          'Sahan Pramuditha is a software engineer and creative developer focused on accessible, high-performance web applications.',
        knowsAbout: [
          'Software Engineering',
          'Web Development',
          'React',
          'Three.js',
          'Performance Optimization',
          'Accessibility'
        ],
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'LK',
          addressLocality: 'Sri Lanka'
        },
        alumniOf: {
          '@type': 'EducationalOrganization',
          name: 'SBIC'
        },
        sameAs: [
          'https://github.com/SahanPramuditha-Dev',
          'https://linkedin.com/in/sahanpramuditha',
          'https://twitter.com/sahanpramuditha'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: canonicalUrl,
        name: 'Sahan Pramuditha',
        publisher: {
          '@id': personId
        },
        inLanguage: 'en-US'
      },
      {
        '@type': 'ProfilePage',
        '@id': profilePageId,
        url: canonicalUrl,
        name: 'Sahan Pramuditha | Software Engineer and Creative Developer',
        isPartOf: {
          '@id': websiteId
        },
        about: {
          '@id': personId
        },
        mainEntity: {
          '@id': personId
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;

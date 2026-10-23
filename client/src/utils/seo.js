/**
 * JSON-LD Schema.org Structured Data Generators
 */

export function personSchema(profile = {}, extra = {}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayushprajapati.dev';
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.displayName || profile.name || 'Ayush Prajapati',
    alternateName: 'Ayush Prajapati',
    jobTitle: 'Full-Stack Developer & Software Engineer',
    description: profile.headline || 'Building resilient full-stack systems and high-performance interfaces.',
    email: profile.email || 'ayushprajapati9669@gmail.com',
    telephone: profile.phone || '+919669802554',
    url: origin,
    image: `${origin}/images/ayush-hero-portrait.jpg`,
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: profile.education?.college || 'SISTec (Sagar Institute of Science and Technology), Bhopal'
    },
    knowsAbout: extra.knowsAbout || [
      'Full-Stack Web Development',
      'MERN Stack',
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'Data Structures and Algorithms',
      'Java',
      'C Programming',
      'Python',
      'REST APIs',
      'Cloud Architecture'
    ],
    sameAs: [
      profile.socialLinks?.github || 'https://github.com/ayushprajapati9669-dev',
      profile.socialLinks?.linkedin || 'https://www.linkedin.com/in/ayush-prajapati-b9042424a/',
      profile.socialLinks?.instagram || 'https://www.instagram.com/ayush7162/'
    ]
  };
}

export function websiteSchema(profile = {}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayushprajapati.dev';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ayush Prajapati | Full-Stack Developer Portfolio',
    url: origin,
    author: {
      '@type': 'Person',
      name: profile.displayName || profile.name || 'Ayush Prajapati'
    }
  };
}

export function projectSchema(project = {}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayushprajapati.dev';
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    headline: project.title,
    description: project.shortDescription || project.description || `${project.title} - Full-Stack project by Ayush Prajapati.`,
    applicationCategory: 'WebApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    url: project.liveDemoUrl || project.githubUrl || `${origin}/projects/${project.slug || project.id}`,
    codeRepository: project.githubUrl,
    screenshot: project.thumbnailUrl ? (project.thumbnailUrl.startsWith('http') ? project.thumbnailUrl : `${origin}${project.thumbnailUrl}`) : undefined
  };
}

export function certificateSchema(cert = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: cert.title,
    credentialCategory: 'Certificate',
    recognizedBy: {
      '@type': 'Organization',
      name: cert.issuer
    },
    validFrom: cert.issueDate || cert.year,
    url: cert.credentialUrl || cert.downloadUrl
  };
}

export function itemListSchema(items = [], type = 'SoftwareApplication') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: type === 'Credential' ? 'Verified Certificates & Credentials' : 'Featured Full-Stack Projects',
    itemListElement: (items || []).map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: type === 'Credential' ? certificateSchema(item) : projectSchema(item)
    }))
  };
}

export function contactPageSchema(profile = {}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayushprajapati.dev';
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact & Hire Ayush Prajapati',
    description: 'Get in touch with Ayush Prajapati for software engineering roles, full-stack internships, or freelance collaboration.',
    url: `${origin}/contact`,
    mainEntity: personSchema(profile)
  };
}

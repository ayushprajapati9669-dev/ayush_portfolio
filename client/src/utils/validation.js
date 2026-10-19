export function isValidUrl(url) {
  if (!url) return false;
  return /^https?:\/\//i.test(String(url).trim());
}

export function validateContactForm({ name, email, subject, message }) {
  const errors = {};
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim();
  const cleanSubject = String(subject || '').trim();
  const cleanMessage = String(message || '').trim();

  if (!cleanName) {
    errors.name = 'Please enter your full name.';
  } else if (cleanName.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!cleanEmail) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
  }

  if (!cleanSubject) {
    errors.subject = 'Please enter a subject.';
  } else if (cleanSubject.length < 3) {
    errors.subject = 'Subject must be at least 3 characters.';
  }

  if (!cleanMessage) {
    errors.message = 'Please enter your message.';
  } else if (cleanMessage.length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData: {
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage
    }
  };
}

export function validateProjectForm({ title, category, shortDescription, technologies, liveDemoUrl, githubUrl, thumbnailUrl }) {
  const errors = {};
  if (!title || String(title).trim().length < 3) {
    errors.title = 'Project title is required (minimum 3 characters).';
  }
  if (!category || !String(category).trim()) {
    errors.category = 'Project category is required.';
  }
  if (!shortDescription || String(shortDescription).trim().length < 10) {
    errors.shortDescription = 'Please provide a clear project description (at least 10 characters).';
  }
  if (!technologies || !String(technologies).trim()) {
    errors.technologies = 'Please specify at least one technology.';
  }
  if (!isValidUrl(liveDemoUrl)) {
    errors.liveDemoUrl = 'Valid Live Demo URL starting with https:// or http:// is required.';
  }
  if (!isValidUrl(githubUrl)) {
    errors.githubUrl = 'Valid GitHub repository URL is required.';
  }
  if (!thumbnailUrl || !String(thumbnailUrl).trim()) {
    errors.thumbnailUrl = 'Please upload a project cover image or enter an image URL.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateCertificateForm({ title, issuer, issueDate, imageUrl }) {
  const errors = {};
  if (!title || String(title).trim().length < 3) {
    errors.title = 'Certificate title is required.';
  }
  if (!issuer || !String(issuer).trim()) {
    errors.issuer = 'Issuing organization is required.';
  }
  if (!issueDate || !String(issueDate).trim()) {
    errors.issueDate = 'Issue year/date is required.';
  }
  if (!imageUrl || !String(imageUrl).trim()) {
    errors.imageUrl = 'Please upload the certificate image file.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validatePasswordStrength(password) {
  const strongRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
  return strongRegex.test(String(password || ''));
}

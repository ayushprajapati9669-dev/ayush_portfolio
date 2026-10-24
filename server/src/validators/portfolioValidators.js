function sanitizeText(val, maxLen = 2000) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, maxLen);
}

function isValidUrlOrEmpty(val) {
  if (!val) return true;
  if (typeof val !== 'string') return false;
  if (val.startsWith('/uploads/') || val.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch (_e) {
    return false;
  }
}

function validateContactInput(body) {
  const errors = [];
  const name = sanitizeText(body?.name, 120);
  const email = sanitizeText(body?.email, 160);
  const subject = sanitizeText(body?.subject, 200);
  const message = sanitizeText(body?.message, 4000);

  if (!name || name.length < 2) errors.push('Name must be at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email address is required.');
  if (!subject || subject.length < 3) errors.push('Subject must be at least 3 characters.');
  if (!message || message.length < 10) errors.push('Message must be at least 10 characters.');

  return {
    valid: errors.length === 0,
    errors,
    data: { name, email, subject, message }
  };
}

function validateProjectInput(body, isPartial = false) {
  const errors = [];
  const data = {};

  if (!isPartial || body.title !== undefined) {
    data.title = sanitizeText(body?.title, 160);
    if (!data.title || data.title.length < 3) errors.push('Project title must be at least 3 characters.');
  }

  if (!isPartial || body.slug !== undefined) {
    const rawSlug = sanitizeText(body?.slug || body?.title || '', 160)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    data.slug = rawSlug;
    if (!data.slug || data.slug.length < 3) errors.push('Project slug must be at least 3 characters (alphanumeric and hyphens).');
  }

  if (!isPartial || body.category !== undefined) {
    data.category = sanitizeText(body?.category || 'Full-Stack Web App', 80);
  }

  if (!isPartial || body.shortDescription !== undefined) {
    data.shortDescription = sanitizeText(body?.shortDescription, 500);
    if (!data.shortDescription || data.shortDescription.length < 10) {
      errors.push('Short description must be at least 10 characters.');
    }
  }

  if (body.problemContext !== undefined) data.problemContext = sanitizeText(body.problemContext, 4000);
  if (body.approachArchitecture !== undefined) data.approachArchitecture = sanitizeText(body.approachArchitecture, 4000);
  if (body.lessonsLearned !== undefined) data.lessonsLearned = sanitizeText(body.lessonsLearned, 4000);
  if (body.disclaimer !== undefined) data.disclaimer = sanitizeText(body.disclaimer, 1000);
  if (body.thumbnailType !== undefined) data.thumbnailType = sanitizeText(body.thumbnailType, 80);
  if (body.thumbnailUrl !== undefined) {
    const url = sanitizeText(body.thumbnailUrl, 500);
    if (!isValidUrlOrEmpty(url)) errors.push('Thumbnail URL must be a valid URL or /uploads/ path.');
    data.thumbnailUrl = url;
  }

  if (body.githubUrl !== undefined) {
    const url = sanitizeText(body.githubUrl, 400);
    if (!isValidUrlOrEmpty(url)) errors.push('GitHub URL must be a valid http(s) URL or empty.');
    data.githubUrl = url;
  }

  if (body.liveDemoUrl !== undefined) {
    const url = sanitizeText(body.liveDemoUrl, 400);
    if (!isValidUrlOrEmpty(url)) errors.push('Live demo URL must be a valid http(s) URL or empty.');
    data.liveDemoUrl = url;
  }

  if (body.implementedFeatures !== undefined) {
    if (Array.isArray(body.implementedFeatures)) {
      data.implementedFeatures = body.implementedFeatures.map(f => sanitizeText(String(f), 300)).filter(Boolean);
    } else if (typeof body.implementedFeatures === 'string') {
      data.implementedFeatures = body.implementedFeatures.split('\n').map(f => sanitizeText(f, 300)).filter(Boolean);
    }
  }

  if (body.technologies !== undefined) {
    if (Array.isArray(body.technologies)) {
      data.technologies = body.technologies.map(t => sanitizeText(String(t), 60)).filter(Boolean);
    } else if (typeof body.technologies === 'string') {
      data.technologies = body.technologies.split(',').map(t => sanitizeText(t, 60)).filter(Boolean);
    }
  }

  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  if (body.status !== undefined) {
    if (!['draft', 'published'].includes(body.status)) {
      errors.push('Project status must be "draft" or "published".');
    } else {
      data.status = body.status;
    }
  }
  if (body.displayOrder !== undefined) {
    const num = Number(body.displayOrder);
    if (!Number.isFinite(num)) errors.push('displayOrder must be a number.');
    else data.displayOrder = num;
  }

  if (body.caseStudy !== undefined) {
    if (!body.caseStudy || typeof body.caseStudy !== 'object') {
      data.caseStudy = null;
    } else {
      const cs = body.caseStudy;
      const caseStudyData = {
        problem: sanitizeText(cs.problem, 5000),
        approach: sanitizeText(cs.approach, 5000),
        techDecisions: sanitizeText(cs.techDecisions, 5000),
        learnings: sanitizeText(cs.learnings, 5000),
        architectureDiagramUrl: sanitizeText(cs.architectureDiagramUrl, 2000000),
        beforeScreenshots: Array.isArray(cs.beforeScreenshots)
          ? cs.beforeScreenshots.slice(0, 5).map(s => sanitizeText(s, 2000000)).filter(Boolean)
          : [],
        afterScreenshots: Array.isArray(cs.afterScreenshots)
          ? cs.afterScreenshots.slice(0, 5).map(s => sanitizeText(s, 2000000)).filter(Boolean)
          : [],
        result: {
          summary: sanitizeText(cs.result?.summary, 5000),
          metrics: Array.isArray(cs.result?.metrics)
            ? cs.result.metrics.slice(0, 10).map(m => ({
                label: sanitizeText(m?.label, 100),
                value: sanitizeText(m?.value, 100)
              })).filter(m => m.label || m.value)
            : []
        }
      };

      // Ensure max 5 screenshots validation
      if (Array.isArray(cs.beforeScreenshots) && cs.beforeScreenshots.length > 5) {
        errors.push('Before screenshots array cannot exceed 5 items.');
      }
      if (Array.isArray(cs.afterScreenshots) && cs.afterScreenshots.length > 5) {
        errors.push('After screenshots array cannot exceed 5 items.');
      }

      data.caseStudy = caseStudyData;
    }
  }

  return { valid: errors.length === 0, errors, data };
}

function validateMediaUpload(payload) {
  const errors = [];
  const allowedMimes = ['image/png', 'image/webp', 'image/jpeg'];
  const filename = String(payload?.filename || '').trim();
  const mimeType = String(payload?.mimeType || '').trim().toLowerCase();
  const base64Data = String(payload?.base64Data || '').trim();

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    errors.push('Invalid or unsafe filename.');
  }
  if (!allowedMimes.includes(mimeType)) {
    errors.push('Unsupported file type. Only PNG, WebP, and JPEG images are allowed.');
  }
  if (!base64Data) {
    errors.push('Image payload is required.');
  } else {
    const rawBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
    const buf = Buffer.from(rawBase64, 'base64');
    if (buf.length > 5 * 1024 * 1024) {
      errors.push('File size exceeds 5MB limit.');
    }
    // Verify magic bytes so client MIME spoofing is rejected
    const isPng = buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    const isJpeg = buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
    const isWebp = buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
    if (!isPng && !isJpeg && !isWebp) {
      errors.push('File binary header does not match a valid PNG, JPEG, or WebP image.');
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  sanitizeText,
  isValidUrlOrEmpty,
  validateContactInput,
  validateProjectInput,
  validateMediaUpload
};

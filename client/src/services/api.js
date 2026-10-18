const API_BASE = import.meta.env.VITE_API_BASE || '';

let csrfTokenMemory = null;

export function setCsrfToken(token) {
  csrfTokenMemory = token;
}

export function getCsrfToken() {
  return csrfTokenMemory;
}

export async function apiRequest(pathname, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (csrfTokenMemory && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
    headers['X-CSRF-Token'] = csrfTokenMemory;
  }
  const response = await fetch(`${API_BASE}${pathname}`, {
    ...options,
    credentials: 'include',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.details = data.details || [];
    throw err;
  }
  return data;
}

export function getActiveSessionToken() {
  if (csrfTokenMemory) return csrfTokenMemory;
  try {
    const raw = sessionStorage.getItem('ayush_modern_portfolio_admin_session_v4');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || parsed.csrfToken || null;
    }
  } catch (_e) {}
  return null;
}

export async function syncStateToMongoBackend(appState, sessionToken) {
  const token = sessionToken || getActiveSessionToken();
  try {
    const res = await fetch(`${API_BASE}/api/portfolio/sync`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRF-Token': token, Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(appState)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn('[Argon Portfolio] Backend sync response:', res.status, data.error);
    } else {
      console.log('[Argon Portfolio] Synchronized to MongoDB Atlas successfully:', data);
    }
    return data;
  } catch (err) {
    console.warn('[Argon Portfolio] Backend sync warning:', err.message);
  }
}

export async function uploadImageViaCloudinary(file, settings = {}) {
  if (!file) return '';
  const cloudName = String(settings.cloudinaryCloudName || '').trim();
  const uploadPreset = String(settings.cloudinaryUploadPreset || '').trim();

  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.secure_url) return data.secure_url;
      }
    } catch (_err) {
      // Fallback to compressed data URI
    }
  }

  return await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = () => resolve(ev.target.result);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadResumeFile(file, settings = {}) {
  if (!file) return null;
  const cloudName = String(settings.cloudinaryCloudName || '').trim();
  const uploadPreset = String(settings.cloudinaryUploadPreset || '').trim();

  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.secure_url) {
          return {
            fileUrl: data.secure_url,
            fileName: file.name,
            fileType: file.type || 'application/pdf',
            sizeBytes: file.size || 0
          };
        }
      }
    } catch (_err) {
      // Fallback to FileReader data URI
    }
  }

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      resolve({
        fileUrl: ev.target.result,
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        sizeBytes: file.size || 0
      });
    };
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}


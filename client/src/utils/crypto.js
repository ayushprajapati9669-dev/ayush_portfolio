export async function computePasswordHash(password) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode('argon-salt-v2:' + password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return 'sha256$' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 2166136261;
  const str = 'argon-salt-v2:' + password;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 'fnv$' + (h >>> 0).toString(16);
}

export async function verifyAdminPassword(inputPassword, adminConfig = {}) {
  const hash = await computePasswordHash(inputPassword);
  if (hash === adminConfig.passwordHash) return true;
  if (adminConfig.passwordFnvFallback && hash === adminConfig.passwordFnvFallback) return true;
  return false;
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SESSION_KEY } from '../../services/defaultPortfolioState';
import { apiRequest, setCsrfToken } from '../../services/api';
import { usePortfolio } from './ThemeProvider';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { appState, updateAppState, showToast } = usePortfolio();

  const [session, setSession] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.exp && Date.now() > parsed.exp) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      if (parsed.csrfToken) setCsrfToken(parsed.csrfToken);
      return parsed;
    } catch (_err) {
      return null;
    }
  });

  const loginAdmin = useCallback(async (usernameInput, passwordInput) => {
    let response;
    try {
      response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { username: usernameInput, password: passwordInput }
      });
    } catch (err) {
      return { ok: false, lockoutError: err.status === 429 ? err.message : '', passError: err.status === 401 ? err.message : '' };
    }
    const csrfToken = response.csrfToken;
    const nextSession = {
      username: response.user?.username || usernameInput,
      role: response.user?.role || 'admin',
      csrfToken,
      exp: Date.now() + 12 * 3600 * 1000
    };
    setCsrfToken(csrfToken);
    setSession(nextSession);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    } catch (_e) {
      // Ignore storage error
    }
    updateAppState((prev) => ({
      ...prev,
      adminConfig: {
        ...prev.adminConfig,
        failedAttempts: 0,
        lockoutUntil: 0
      }
    }), csrfToken);
    showToast('Welcome back, Ayush! Signed in to Admin CMS.');
    return { ok: true };
  }, [showToast]);

  const logoutAdmin = useCallback(async () => {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); } catch (_err) {}
    setSession(null);
    setCsrfToken(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_e) {
      // Ignore storage error
    }
    showToast('Signed out of Admin CMS.');
  }, [showToast]);

  const resetAdminPassword = useCallback(async (newPassword, currentPassword = '') => {
    try {
      await apiRequest('/api/auth/password', { method: 'POST', body: { currentPassword, newPassword } });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const checkCurrentPassword = useCallback(async () => Boolean(session), [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        loginAdmin,
        logoutAdmin,
        resetAdminPassword,
        checkCurrentPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

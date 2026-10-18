import React, { createContext, useContext, useState, useCallback } from 'react';
import { SESSION_KEY } from '../../services/defaultPortfolioState';
import { setCsrfToken } from '../../services/api';
import { computePasswordHash, verifyAdminPassword } from '../../utils/crypto';
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
    const cfg = appState.adminConfig || {};
    const now = Date.now();
    if (cfg.lockoutUntil && now < cfg.lockoutUntil) {
      const secs = Math.ceil((cfg.lockoutUntil - now) / 1000);
      return {
        ok: false,
        lockoutError: `Security lockout active due to multiple failed attempts. Please wait ${secs}s.`
      };
    }

    const allowedUsers = [
      String(cfg.username || 'ayushprajapati9669@gmail.com').toLowerCase(),
      'ayushprajapati9669@gmail.com',
      'ayush',
      'ayush prajapati',
      '9669802554'
    ];
    const isUserValid = allowedUsers.includes(String(usernameInput || '').trim().toLowerCase());
    const isPassValid = await verifyAdminPassword(passwordInput, cfg);

    if (!isUserValid || !isPassValid) {
      updateAppState((prev) => {
        const attempts = (prev.adminConfig?.failedAttempts || 0) + 1;
        const locked = attempts >= 5 ? Date.now() + 30 * 1000 : 0;
        return {
          ...prev,
          adminConfig: {
            ...prev.adminConfig,
            failedAttempts: attempts >= 5 ? 0 : attempts,
            lockoutUntil: locked
          }
        };
      });
      return {
        ok: false,
        userError: !isUserValid ? 'Unrecognized admin email/username.' : '',
        passError: !isPassValid ? 'Incorrect password. Only authorized admin can sign in.' : ''
      };
    }

    const csrfToken = 'jwt_' + Math.random().toString(36).slice(2);
    const nextSession = {
      username: 'Ayush Prajapati',
      role: 'admin',
      token: csrfToken,
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
  }, [appState.adminConfig, updateAppState, showToast]);

  const logoutAdmin = useCallback(() => {
    setSession(null);
    setCsrfToken(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_e) {
      // Ignore storage error
    }
    showToast('Signed out of Admin CMS.');
  }, [showToast]);

  const resetAdminPassword = useCallback(async (newPassword) => {
    const newHash = await computePasswordHash(newPassword);
    updateAppState((prev) => ({
      ...prev,
      adminConfig: {
        ...prev.adminConfig,
        passwordHash: newHash,
        passwordFnvFallback: '',
        failedAttempts: 0,
        lockoutUntil: 0
      }
    }), session?.token);
  }, [updateAppState, session?.token]);

  const checkCurrentPassword = useCallback(async (plainPassword) => {
    return await verifyAdminPassword(plainPassword, appState.adminConfig || {});
  }, [appState.adminConfig]);

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

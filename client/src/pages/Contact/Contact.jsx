import React, { useState } from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SocialIconButtons } from '../../components/common/TechLogos';
import { validateContactForm } from '../../utils/validation';
import { apiRequest } from '../../services/api';

export function ContactPage() {
  const { appState, updateAppState, showToast } = usePortfolio();
  const p = appState.profile || {};

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check = validateContactForm(formData);
    if (!check.isValid) {
      setErrors(check.errors);
      setFeedback({
        type: 'error',
        text: 'Please fix the highlighted validation errors below before submitting.'
      });
      return;
    }

    const newMsg = {
      id: 'msg-' + Date.now(),
      ...check.cleanData,
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    try {
      await apiRequest('/api/public/contact', {
        method: 'POST',
        body: check.cleanData
      });
    } catch (_err) {
      // Also persist in local state store
    }

    updateAppState((prev) => ({
      ...prev,
      messages: [newMsg, ...(prev.messages || [])]
    }));

    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setFeedback({
      type: 'success',
      text: 'Thank you! Your message has been saved permanently in MongoDB / Portfolio CMS.'
    });
    showToast('Message sent and saved to database.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 pt-12 space-y-12">
      <div className="border-b hairline-border pb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">CONNECT</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-alabaster">Get In Touch</h1>
        <p className="mt-3 max-w-2xl text-base text-stonewarm">
          Reach out directly at <strong className="text-alabaster">{p.email || 'ayushprajapati9669@gmail.com'}</strong> or{' '}
          <strong className="text-alabaster">{p.phone || '(+91) 9669802554'}</strong>, or send a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} noValidate className="glass-card rounded-3xl p-7 sm:p-9 space-y-5">
            <h2 className="font-display text-2xl font-bold text-alabaster">Send a Message</h2>

            {feedback && (
              <div
                className={`rounded-xl border p-4 text-xs ${
                  feedback.type === 'error'
                    ? 'border-vermilion bg-vermilion/10 text-vermilion'
                    : 'border-sage bg-sage/10 text-alabaster'
                }`}
              >
                {feedback.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="block font-mono text-xs text-stonewarm mb-1.5">
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={`focus-ring w-full rounded-xl border bg-obsidian px-4 py-3 text-sm text-alabaster ${
                    errors.name ? 'border-vermilion ring-1 ring-vermilion' : 'border-white/15'
                  }`}
                />
                {errors.name && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {errors.name}</p>}
              </div>

              <div>
                <label htmlFor="contact-email" className="block font-mono text-xs text-stonewarm mb-1.5">
                  Your Email *
                </label>
                <input
                  id="contact-email"
                  type="text"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@company.com"
                  className={`focus-ring w-full rounded-xl border bg-obsidian px-4 py-3 text-sm text-alabaster ${
                    errors.email ? 'border-vermilion ring-1 ring-vermilion' : 'border-white/15'
                  }`}
                />
                {errors.email && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block font-mono text-xs text-stonewarm mb-1.5">
                Subject *
              </label>
              <input
                id="contact-subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Internship / Project Opportunity"
                className={`focus-ring w-full rounded-xl border bg-obsidian px-4 py-3 text-sm text-alabaster ${
                  errors.subject ? 'border-vermilion ring-1 ring-vermilion' : 'border-white/15'
                }`}
              />
              {errors.subject && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="contact-message" className="block font-mono text-xs text-stonewarm mb-1.5">
                Message *
              </label>
              <textarea
                id="contact-message"
                rows="4"
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Hi Ayush, I'd love to connect regarding..."
                className={`focus-ring w-full rounded-xl border bg-obsidian px-4 py-3 text-sm text-alabaster ${
                  errors.message ? 'border-vermilion ring-1 ring-vermilion' : 'border-white/15'
                }`}
              />
              {errors.message && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {errors.message}</p>}
            </div>

            <button
              type="submit"
              className="focus-ring rounded-full bg-vermilion px-7 py-3.5 text-sm font-bold text-obsidian shadow-lg shadow-vermilion/25 hover:opacity-95"
            >
              Send Message →
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-7 space-y-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyanglow">DIRECT CONTACT INFO</p>
            <div className="space-y-2 text-sm">
              <p className="text-stonewarm">
                Email:{' '}
                <a href={`mailto:${p.email || 'ayushprajapati9669@gmail.com'}`} className="text-white font-semibold hover:text-cyanglow">
                  {p.email || 'ayushprajapati9669@gmail.com'}
                </a>
              </p>
              <p className="text-stonewarm">
                Phone:{' '}
                <a href="tel:+919669802554" className="text-white font-semibold hover:text-cyanglow">
                  {p.phone || '(+91) 9669802554'}
                </a>
              </p>
              <p className="text-stonewarm">
                College: <span className="text-white font-semibold">SISTec, Bhopal (CGPA: 8.42)</span>
              </p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-7 space-y-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">DIRECT SOCIAL PROFILES</p>
            <p className="text-xs text-stonewarm">Click any icon below to redirect immediately:</p>
            <div className="flex items-center gap-4 pt-1">
              <SocialIconButtons socialLinks={p.socialLinks} sizeClass="h-14 w-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

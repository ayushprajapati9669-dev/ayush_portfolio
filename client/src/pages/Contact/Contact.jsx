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
      text: 'Thank you! Your message has been sent successfully. Ayush will get back to you shortly.'
    });
    setTimeout(() => {
      setFeedback(null);
    }, 3000);
    showToast('Thank you! Your message has been sent.');
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
                className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium backdrop-blur-md transition-all ${
                  feedback.type === 'error'
                    ? 'border-vermilion/40 bg-vermilion/10 text-vermilion shadow-lg shadow-vermilion/5'
                    : 'border-sage/40 bg-sage/10 text-alabaster shadow-lg shadow-sage/5'
                }`}
              >
                {feedback.type === 'error' ? (
                  <svg className="h-5 w-5 shrink-0 text-vermilion" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 shrink-0 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div className="leading-relaxed">{feedback.text}</div>
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
          <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-5 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between border-b hairline-border pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-cyanglow animate-pulse" />
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-cyanglow">
                  Direct Contact & Info
                </p>
              </div>
              <span className="font-mono text-[10px] rounded-full border border-cyanglow/30 bg-cyanglow/10 px-2.5 py-0.5 text-cyanglow font-medium">
                Verified
              </span>
            </div>

            <div className="space-y-3.5 text-sm">
              {/* Email */}
              <a
                href={`mailto:${p.email || 'ayushprajapati9669@gmail.com'}`}
                className="group flex items-start gap-3.5 rounded-2xl border border-white/5 bg-charcoal/60 p-3.5 transition-all hover:border-cyanglow/40 hover:bg-charcoal hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyanglow/10 text-cyanglow border border-cyanglow/20 group-hover:scale-105 transition-transform">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-stonewarm uppercase tracking-wider">Email Address</p>
                  <p className="truncate text-sm font-semibold text-alabaster group-hover:text-cyanglow transition-colors">
                    {p.email || 'ayushprajapati9669@gmail.com'}
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href={`tel:${String(p.phone || '+919669802554').replace(/[^0-9+]/g, '')}`}
                className="group flex items-start gap-3.5 rounded-2xl border border-white/5 bg-charcoal/60 p-3.5 transition-all hover:border-sage/40 hover:bg-charcoal hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-sage border border-sage/20 group-hover:scale-105 transition-transform">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-stonewarm uppercase tracking-wider">Phone Number</p>
                  <p className="truncate text-sm font-semibold text-alabaster group-hover:text-sage transition-colors">
                    {p.phone || '(+91) 9669802554'}
                  </p>
                </div>
              </a>

              {/* College & CGPA (Dynamic from Admin CMS) */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-charcoal/60 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amberwarm/10 text-amberwarm border border-amberwarm/20">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-stonewarm uppercase tracking-wider">College & Academics</p>
                  <p className="text-sm font-semibold text-alabaster">
                    {p.education?.college || 'SISTec, Bhopal'}{' '}
                    <span className="inline-block font-mono text-xs text-sage font-bold bg-sage/10 px-2 py-0.5 rounded-md ml-1 border border-sage/20">
                      {p.education?.cgpa
                        ? p.education.cgpa.includes('CGPA')
                          ? p.education.cgpa
                          : `CGPA: ${p.education.cgpa}`
                        : 'CGPA: 8.42'}
                    </span>
                  </p>
                  {p.education?.degree && (
                    <p className="font-mono text-[11px] text-stonewarm mt-0.5">{p.education.degree}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-charcoal/60 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vermilion/10 text-vermilion border border-vermilion/20">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-stonewarm uppercase tracking-wider">Current Location</p>
                  <p className="text-sm font-semibold text-alabaster">
                    {p.education?.location || 'Bhopal, Madhya Pradesh, India'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-4 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between border-b hairline-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-vermilion" />
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-vermilion">
                  Social & Developer Profiles
                </p>
              </div>
              <span className="font-mono text-[10px] text-stonewarm">Direct Links</span>
            </div>
            <p className="text-xs text-stonewarm leading-relaxed">
              Click any profile icon below to view projects, repositories, or connect professionally:
            </p>
            <div className="flex items-center gap-3.5 pt-1">
              <SocialIconButtons socialLinks={p.socialLinks} sizeClass="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

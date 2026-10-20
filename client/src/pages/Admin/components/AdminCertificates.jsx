import React, { useState } from 'react';
import { uploadImageViaCloudinary } from '../../../services/api';
import { validateCertificateForm } from '../../../utils/validation';
import { playTick } from '../../../utils/audio';

function FormErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-300">
      <svg className="h-3.5 w-3.5 shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export function AdminCertificates({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    issuer: '',
    issueDate: '2025',
    credentialId: '',
    credentialUrl: '',
    skillsCovered: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});

  const certificates = appState.certificates || [];

  const handleEdit = (c) => {
    playTick();
    setEditingId(c.id);
    setForm({
      title: c.title || '',
      issuer: c.issuer || '',
      issueDate: c.issueDate || '2025',
      credentialId: c.credentialId || '',
      credentialUrl: c.credentialUrl || '',
      skillsCovered: c.skillsCovered || '',
      imageUrl: c.imageUrl || ''
    });
    setErrors({});
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    playTick();
    setEditingId(null);
    setForm({
      title: '',
      issuer: '',
      issueDate: '2025',
      credentialId: '',
      credentialUrl: '',
      skillsCovered: '',
      imageUrl: ''
    });
    setErrors({});
  };

  const handleDelete = (cert) => {
    playTick();
    openConfirmModal(
      'Delete Certificate',
      `Are you sure you want to delete "${cert.title}"?`,
      () => {
        updateAppState((prev) => ({
          ...prev,
          certificates: prev.certificates.filter((c) => c.id !== cert.id)
        }), session.token);
        if (editingId === cert.id) {
          handleCancelEdit();
        }
        showToast(`Certificate "${cert.title}" deleted.`);
      }
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    const check = validateCertificateForm(form);
    if (!check.isValid) {
      setErrors(check.errors);
      return;
    }

    updateAppState((prev) => {
      const certs = prev.certificates || [];
      if (editingId) {
        return {
          ...prev,
          certificates: certs.map((c) => (c.id === editingId ? { ...c, ...form } : c))
        };
      }
      return {
        ...prev,
        certificates: [{ id: 'cert-' + Date.now(), ...form }, ...certs]
      };
    }, session.token);

    showToast(editingId ? `Updated certificate "${form.title}".` : `Published certificate "${form.title}".`, 'fa-certificate');
    handleCancelEdit();
  };

  return (
    <div className="space-y-8">
      {/* Live Headings Customizer */}
      <div className="glass-card-admin p-6 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold">
            CERTIFICATES SECTION HEADINGS
          </span>
          <h3 className="text-lg font-bold text-white mt-1">Live Page Titles & Subtitles</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize the heading and eyebrow displayed on the Certificates page dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Eyebrow Tag (e.g. 03 · VERIFIED CREDENTIALS)
            </label>
            <input
              type="text"
              value={appState.uiLabels?.homeCertificatesEyebrow ?? '03 · VERIFIED CREDENTIALS'}
              onChange={(e) =>
                updateAppState((prev) => ({
                  ...prev,
                  uiLabels: { ...prev.uiLabels, homeCertificatesEyebrow: e.target.value }
                }), session.token)
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Main Heading (e.g. Technical Certifications & Honors)
            </label>
            <input
              type="text"
              value={appState.uiLabels?.homeCertificatesHeading ?? 'Technical Certifications & Honors'}
              onChange={(e) =>
                updateAppState((prev) => ({
                  ...prev,
                  uiLabels: { ...prev.uiLabels, homeCertificatesHeading: e.target.value }
                }), session.token)
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Certificate Form */}
      <form onSubmit={handleSave} noValidate className="glass-card-admin p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {editingId ? 'Edit Certificate' : 'Add New Certificate'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="font-mono text-xs text-slate-400 hover:text-white"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Certificate Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. MERN Stack Web Development"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
            />
            <FormErrorMessage message={errors.title} />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Issuer / Organization *</label>
            <input
              type="text"
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              placeholder="e.g. Apna College / AWS / Coursera"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
            />
            <FormErrorMessage message={errors.issuer} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Issue Year / Date *</label>
            <input
              type="text"
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              placeholder="2025"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
            />
            <FormErrorMessage message={errors.issueDate} />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Credential ID</label>
            <input
              type="text"
              value={form.credentialId}
              onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
              placeholder="e.g. CERT-2025-AP01"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Verification URL</label>
            <input
              type="text"
              value={form.credentialUrl}
              onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-slate-400 mb-1">Skills Covered (comma-separated)</label>
          <input
            type="text"
            value={form.skillsCovered}
            onChange={(e) => setForm({ ...form, skillsCovered: e.target.value })}
            placeholder="e.g. React, Node.js, Express, MongoDB, REST APIs"
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
          />
        </div>

        {/* Certificate Image Upload */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="sm:col-span-8 space-y-2">
            <label className="block font-mono text-xs text-purple-400 font-bold">
              Certificate Image / Badge
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                showToast('Uploading certificate image...');
                const url = await uploadImageViaCloudinary(file, appState.settings);
                if (url) {
                  setForm((prev) => ({ ...prev, imageUrl: url }));
                  showToast('Certificate image uploaded!');
                }
              }}
              className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white"
            />
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="Or paste direct certificate image URL (https://...)"
              className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white"
            />
          </div>
          <div className="sm:col-span-4 flex justify-center">
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt="Certificate preview"
                className="h-24 w-full object-cover rounded-xl border border-white/20 shadow-md"
              />
            ) : (
              <div className="h-24 w-full rounded-xl border border-dashed border-white/20 flex items-center justify-center font-mono text-[11px] text-slate-500">
                No preview
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn-save px-6 py-2.5 text-xs font-bold"
        >
          {editingId ? 'Update Certificate' : 'Publish Certificate'}
        </button>
      </form>

      {/* Existing Certificates List */}
      <div className="glass-card-admin p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Existing Certificates ({certificates.length})</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3 flex flex-col justify-between hover:border-white/25 transition-all"
            >
              <div className="space-y-2">
                {cert.imageUrl && (
                  <img
                    src={cert.imageUrl}
                    alt={cert.title}
                    className="h-32 w-full object-cover rounded-xl border border-white/10"
                  />
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase text-purple-400 tracking-wider">
                    {cert.issuer}
                  </span>
                  <span className="badge info text-[9px]">{cert.issueDate}</span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{cert.title}</h4>
                {cert.skillsCovered && (
                  <p className="text-xs text-slate-400 line-clamp-1">Skills: {cert.skillsCovered}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Verify Credential ↗
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(cert)}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cert)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminCertificates;

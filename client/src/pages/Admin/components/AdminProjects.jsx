import React, { useState } from 'react';
import { uploadImageViaCloudinary } from '../../../services/api';
import { validateProjectForm } from '../../../utils/validation';
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

export function AdminProjects({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Full-Stack Web App',
    shortDescription: '',
    technologies: 'React JS, Node.js, Express.js, MongoDB',
    liveDemoUrl: '',
    githubUrl: 'https://github.com/ayushprajapati9669-dev',
    thumbnailUrl: '',
    featured: true
  });
  const [errors, setErrors] = useState({});

  const projects = appState.projects || [];

  const handleEdit = (p) => {
    playTick();
    setEditingId(p.id);
    setForm({
      title: p.title || '',
      category: p.category || 'Full-Stack Web App',
      shortDescription: p.shortDescription || '',
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
      liveDemoUrl: p.liveDemoUrl || '',
      githubUrl: p.githubUrl || '',
      thumbnailUrl: p.thumbnailUrl || '',
      featured: Boolean(p.featured)
    });
    setErrors({});
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    playTick();
    setEditingId(null);
    setForm({
      title: '',
      category: 'Full-Stack Web App',
      shortDescription: '',
      technologies: 'React JS, Node.js, Express.js, MongoDB',
      liveDemoUrl: '',
      githubUrl: 'https://github.com/ayushprajapati9669-dev',
      thumbnailUrl: '',
      featured: true
    });
    setErrors({});
  };

  const handleDelete = (proj) => {
    playTick();
    openConfirmModal(
      'Delete Project',
      `Are you sure you want to delete "${proj.title}"? This cannot be undone.`,
      () => {
        updateAppState((prev) => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== proj.id)
        }), session.token);
        if (editingId === proj.id) {
          handleCancelEdit();
        }
        showToast(`Project "${proj.title}" deleted.`);
      }
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    const check = validateProjectForm(form);
    if (!check.isValid) {
      setErrors(check.errors);
      return;
    }

    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const technologies = form.technologies.split(',').map((s) => s.trim()).filter(Boolean);

    updateAppState((prev) => {
      if (editingId) {
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  title: form.title.trim(),
                  slug,
                  category: form.category.trim(),
                  shortDescription: form.shortDescription.trim(),
                  technologies,
                  thumbnailType: 'image',
                  thumbnailUrl: form.thumbnailUrl.trim(),
                  liveDemoUrl: form.liveDemoUrl.trim(),
                  githubUrl: form.githubUrl.trim(),
                  featured: Boolean(form.featured),
                  status: 'published',
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        };
      }
      return {
        ...prev,
        projects: [
          ...prev.projects,
          {
            id: 'proj-' + Date.now(),
            title: form.title.trim(),
            slug,
            category: form.category.trim(),
            shortDescription: form.shortDescription.trim(),
            technologies,
            thumbnailType: 'image',
            thumbnailUrl: form.thumbnailUrl.trim(),
            githubUrl: form.githubUrl.trim(),
            liveDemoUrl: form.liveDemoUrl.trim(),
            featured: Boolean(form.featured),
            status: 'published',
            displayOrder: prev.projects.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
    }, session.token);

    showToast(editingId ? `Project "${form.title}" updated!` : `Project "${form.title}" published!`, 'fa-rocket');
    handleCancelEdit();
  };

  return (
    <div className="space-y-8">
      {/* Live Headings Customizer */}
      <div className="glass-card-admin p-6 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
            PROJECTS SECTION HEADINGS
          </span>
          <h3 className="text-lg font-bold text-white mt-1">Live Page Titles & Subtitles</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize the heading and eyebrow displayed on the Projects page and Home section dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Eyebrow Tag (e.g. 02 · LIVE DEPLOYED PROJECTS)
            </label>
            <input
              type="text"
              value={appState.uiLabels?.homeProjectsEyebrow ?? '02 · LIVE DEPLOYED PROJECTS'}
              onChange={(e) =>
                updateAppState((prev) => ({
                  ...prev,
                  uiLabels: { ...prev.uiLabels, homeProjectsEyebrow: e.target.value }
                }), session.token)
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Main Heading (e.g. Featured Full-Stack Applications)
            </label>
            <input
              type="text"
              value={appState.uiLabels?.homeProjectsHeading ?? 'Featured Full-Stack Applications'}
              onChange={(e) =>
                updateAppState((prev) => ({
                  ...prev,
                  uiLabels: { ...prev.uiLabels, homeProjectsHeading: e.target.value }
                }), session.token)
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Project Form (Create / Edit) */}
      <form onSubmit={handleSave} noValidate className="glass-card-admin p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {editingId ? 'Edit Project' : 'Create New Live Project'}
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
            <label className="block font-mono text-xs text-slate-400 mb-1">Project Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Airbnb Clone — Vacation Rental Platform"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.title} />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Category *</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.category} />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-slate-400 mb-1">Project Description *</label>
          <textarea
            rows="2"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            placeholder="Describe what this project does and key engineering highlights..."
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          />
          <FormErrorMessage message={errors.shortDescription} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Technologies (comma-separated) *</label>
            <input
              type="text"
              value={form.technologies}
              onChange={(e) => setForm({ ...form, technologies: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.technologies} />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Live Demo URL *</label>
            <input
              type="text"
              value={form.liveDemoUrl}
              onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
              placeholder="https://airbnbclone2-8519.onrender.com"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.liveDemoUrl} />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">GitHub Code URL *</label>
            <input
              type="text"
              value={form.githubUrl}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.githubUrl} />
          </div>
        </div>

        {/* Cover Image Upload / URL */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="sm:col-span-8 space-y-2">
            <label className="block font-mono text-xs text-cyan-400 font-bold">
              Project Cover Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                showToast('Uploading project image...');
                const url = await uploadImageViaCloudinary(file, appState.settings);
                if (url) {
                  setForm((prev) => ({ ...prev, thumbnailUrl: url }));
                  showToast('Project image uploaded and ready!');
                }
              }}
              className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white"
            />
            <input
              type="text"
              value={form.thumbnailUrl}
              onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              placeholder="Or paste direct image URL (https://...)"
              className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white"
            />
            <FormErrorMessage message={errors.thumbnailUrl} />
          </div>
          <div className="sm:col-span-4 flex justify-center">
            {form.thumbnailUrl ? (
              <img
                src={form.thumbnailUrl}
                alt="Thumbnail preview"
                className="h-24 w-full object-cover rounded-xl border border-white/20 shadow-md"
              />
            ) : (
              <div className="h-24 w-full rounded-xl border border-dashed border-white/20 flex items-center justify-center font-mono text-[11px] text-slate-500">
                No preview
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="projFeatured"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="h-4 w-4 rounded accent-cyan-400"
          />
          <label htmlFor="projFeatured" className="text-xs text-slate-300 select-none">
            Featured on Homepage (Highlight in hero & top carousel)
          </label>
        </div>

        <button
          type="submit"
          className="btn-save px-6 py-2.5 text-xs font-bold"
        >
          {editingId ? 'Update Live Project' : 'Publish New Project'}
        </button>
      </form>

      {/* Projects List */}
      <div className="glass-card-admin p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Existing Projects ({projects.length})</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3 flex flex-col justify-between hover:border-white/25 transition-all"
            >
              <div className="space-y-2">
                {proj.thumbnailUrl && (
                  <img
                    src={proj.thumbnailUrl}
                    alt={proj.title}
                    className="h-32 w-full object-cover rounded-xl border border-white/10"
                  />
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase text-cyan-400 tracking-wider">
                    {proj.category}
                  </span>
                  {proj.featured && (
                    <span className="badge success text-[9px]">Featured</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{proj.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{proj.shortDescription}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {proj.liveDemoUrl && (
                    <a
                      href={proj.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Demo ↗
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Code ↗
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(proj)}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(proj)}
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

export default AdminProjects;

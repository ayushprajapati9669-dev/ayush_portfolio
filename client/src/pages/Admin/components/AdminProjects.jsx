import React, { useState, useRef, useEffect, useMemo } from 'react';
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

// Brand icons map for tech stack tags matching reference design
const TECH_ICONS = {
  react: { icon: 'fa-brands fa-react', color: 'text-cyan-400' },
  'react js': { icon: 'fa-brands fa-react', color: 'text-cyan-400' },
  'node.js': { icon: 'fa-brands fa-node-js', color: 'text-emerald-400' },
  node: { icon: 'fa-brands fa-node-js', color: 'text-emerald-400' },
  mongodb: { icon: 'fa-solid fa-leaf', color: 'text-green-500' },
  mongo: { icon: 'fa-solid fa-leaf', color: 'text-green-500' },
  tailwindcss: { icon: 'fa-solid fa-wind', color: 'text-sky-400' },
  tailwind: { icon: 'fa-solid fa-wind', color: 'text-sky-400' },
  express: { icon: 'fa-solid fa-server', color: 'text-amber-400' },
  'express.js': { icon: 'fa-solid fa-server', color: 'text-amber-400' },
  javascript: { icon: 'fa-brands fa-js', color: 'text-yellow-400' },
  js: { icon: 'fa-brands fa-js', color: 'text-yellow-400' },
  typescript: { icon: 'fa-solid fa-code', color: 'text-blue-400' },
  ts: { icon: 'fa-solid fa-code', color: 'text-blue-400' },
  python: { icon: 'fa-brands fa-python', color: 'text-yellow-300' },
  html: { icon: 'fa-brands fa-html5', color: 'text-orange-500' },
  html5: { icon: 'fa-brands fa-html5', color: 'text-orange-500' },
  css: { icon: 'fa-brands fa-css3-alt', color: 'text-blue-500' },
  css3: { icon: 'fa-brands fa-css3-alt', color: 'text-blue-500' },
  nextjs: { icon: 'fa-solid fa-n', color: 'text-white' },
  'next.js': { icon: 'fa-solid fa-n', color: 'text-white' },
  git: { icon: 'fa-brands fa-git-alt', color: 'text-red-500' },
  github: { icon: 'fa-brands fa-github', color: 'text-slate-300' },
  docker: { icon: 'fa-brands fa-docker', color: 'text-blue-400' },
  mysql: { icon: 'fa-solid fa-database', color: 'text-cyan-300' },
  redux: { icon: 'fa-solid fa-atom', color: 'text-purple-400' },
  firebase: { icon: 'fa-solid fa-fire', color: 'text-amber-500' }
};

function getTechBadgeData(rawName) {
  const clean = (rawName || '').trim().toLowerCase();
  if (TECH_ICONS[clean]) {
    return TECH_ICONS[clean];
  }
  return { icon: 'fa-solid fa-cube', color: 'text-cyan-400' };
}

const SORT_OPTIONS = [
  { id: 'manual', label: 'Manual Order', icon: 'fa-solid fa-arrow-down-short-wide' },
  { id: 'newest', label: 'Newest First', icon: 'fa-solid fa-clock-rotate-left' },
  { id: 'oldest', label: 'Oldest First', icon: 'fa-solid fa-calendar' },
  { id: 'az', label: 'Title A-Z', icon: 'fa-solid fa-arrow-down-a-z' },
  { id: 'za', label: 'Title Z-A', icon: 'fa-solid fa-arrow-up-z-a' }
];

export function AdminProjects({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Full-Stack Web App',
    status: 'published',
    shortDescription: '',
    technologies: 'React JS, Node.js, Express.js, MongoDB',
    liveDemoUrl: '',
    githubUrl: 'https://github.com/ayushprajapati9669-dev',
    thumbnailUrl: '',
    featured: true
  });
  const [errors, setErrors] = useState({});
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Search, tabs, sorting, selection
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('manual');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const sortRef = useRef(null);

  const projects = appState.projects || [];

  // Close sort menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute status counts
  const counts = useMemo(() => {
    return {
      all: projects.filter((p) => p.status !== 'trash').length,
      active: projects.filter((p) => p.status === 'published' || p.status === 'active' || !p.status).length,
      draft: projects.filter((p) => p.status === 'draft').length,
      archived: projects.filter((p) => p.status === 'archived').length,
      trash: projects.filter((p) => p.status === 'trash').length
    };
  }, [projects]);

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter by tab
    if (activeTab === 'all') {
      result = result.filter((p) => p.status !== 'trash');
    } else if (activeTab === 'active') {
      result = result.filter((p) => p.status === 'published' || p.status === 'active' || !p.status);
    } else if (activeTab === 'draft') {
      result = result.filter((p) => p.status === 'draft');
    } else if (activeTab === 'archived') {
      result = result.filter((p) => p.status === 'archived');
    } else if (activeTab === 'trash') {
      result = result.filter((p) => p.status === 'trash');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const descMatch = (p.shortDescription || '').toLowerCase().includes(q);
        const techStr = Array.isArray(p.technologies) ? p.technologies.join(' ') : (p.technologies || '');
        const techMatch = techStr.toLowerCase().includes(q);
        return titleMatch || catMatch || descMatch || techMatch;
      });
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'az') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'za') {
      result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else {
      // manual / displayOrder
      result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    return result;
  }, [projects, activeTab, searchQuery, sortBy]);

  // Select all state
  const isAllSelected = useMemo(() => {
    if (filteredProjects.length === 0) return false;
    return filteredProjects.every((p) => selectedIds.includes(p.id));
  }, [filteredProjects, selectedIds]);

  const handleToggleSelectAll = () => {
    playTick();
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id) => {
    playTick();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Image upload handling with instant preview
  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WebP)', 'fa-triangle-exclamation');
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((prev) => ({ ...prev, thumbnailUrl: e.target.result }));
    };
    reader.readAsDataURL(file);

    showToast('Uploading cover image to cloud...');
    const uploadedUrl = await uploadImageViaCloudinary(file, appState.settings);
    if (uploadedUrl) {
      setForm((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
      showToast('Cover image ready!', 'fa-circle-check');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Edit action
  const handleEdit = (p) => {
    playTick();
    setEditingId(p.id);
    setIsFormOpen(true);
    setForm({
      title: p.title || '',
      category: p.category || 'Full-Stack Web App',
      status: p.status || 'published',
      shortDescription: p.shortDescription || '',
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
      liveDemoUrl: p.liveDemoUrl || '',
      githubUrl: p.githubUrl || '',
      thumbnailUrl: p.thumbnailUrl || '',
      featured: Boolean(p.featured)
    });
    setErrors({});

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelEdit = () => {
    playTick();
    setEditingId(null);
    setForm({
      title: '',
      category: 'Full-Stack Web App',
      status: 'published',
      shortDescription: '',
      technologies: 'React JS, Node.js, Express.js, MongoDB',
      liveDemoUrl: '',
      githubUrl: 'https://github.com/ayushprajapati9669-dev',
      thumbnailUrl: '',
      featured: true
    });
    setErrors({});
  };

  // Delete single project (moves to trash or permanent delete if in trash)
  const handleDelete = (proj) => {
    playTick();
    const isTrashTab = activeTab === 'trash' || proj.status === 'trash';

    if (isTrashTab) {
      openConfirmModal(
        'Delete Project Permanently',
        `Are you sure you want to permanently delete "${proj.title}"? This action cannot be undone.`,
        () => {
          updateAppState((prev) => ({
            ...prev,
            projects: prev.projects.filter((p) => p.id !== proj.id)
          }), session.token);
          setSelectedIds((prev) => prev.filter((id) => id !== proj.id));
          if (editingId === proj.id) handleCancelEdit();
          showToast(`Project "${proj.title}" permanently deleted.`);
        }
      );
    } else {
      openConfirmModal(
        'Move to Trash',
        `Are you sure you want to move "${proj.title}" to Trash? You can restore it anytime from the Trash tab.`,
        () => {
          updateAppState((prev) => ({
            ...prev,
            projects: prev.projects.map((p) =>
              p.id === proj.id ? { ...p, status: 'trash', updatedAt: new Date().toISOString() } : p
            )
          }), session.token);
          setSelectedIds((prev) => prev.filter((id) => id !== proj.id));
          if (editingId === proj.id) handleCancelEdit();
          showToast(`Project "${proj.title}" moved to Trash.`);
        }
      );
    }
  };

  // Restore project from trash
  const handleRestore = (proj) => {
    playTick();
    updateAppState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === proj.id ? { ...p, status: 'published', updatedAt: new Date().toISOString() } : p
      )
    }), session.token);
    showToast(`Project "${proj.title}" restored!`, 'fa-rotate-left');
  };

  // Batch delete selected projects
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    playTick();
    const isTrashTab = activeTab === 'trash';

    if (isTrashTab) {
      openConfirmModal(
        'Permanently Delete Selected',
        `Are you sure you want to permanently delete ${selectedIds.length} selected project(s)? This cannot be undone.`,
        () => {
          updateAppState((prev) => ({
            ...prev,
            projects: prev.projects.filter((p) => !selectedIds.includes(p.id))
          }), session.token);
          setSelectedIds([]);
          showToast(`${selectedIds.length} projects permanently deleted.`);
        }
      );
    } else {
      openConfirmModal(
        'Move Selected to Trash',
        `Are you sure you want to move ${selectedIds.length} selected project(s) to Trash?`,
        () => {
          updateAppState((prev) => ({
            ...prev,
            projects: prev.projects.map((p) =>
              selectedIds.includes(p.id) ? { ...p, status: 'trash', updatedAt: new Date().toISOString() } : p
            )
          }), session.token);
          setSelectedIds([]);
          showToast(`${selectedIds.length} projects moved to Trash.`);
        }
      );
    }
  };

  // Save / Update project
  const handleSave = (e) => {
    e.preventDefault();
    playTick();
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
                  status: form.status || 'published',
                  shortDescription: form.shortDescription.trim(),
                  technologies,
                  thumbnailType: 'image',
                  thumbnailUrl: form.thumbnailUrl.trim(),
                  liveDemoUrl: form.liveDemoUrl.trim(),
                  githubUrl: form.githubUrl.trim(),
                  featured: Boolean(form.featured),
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
            status: form.status || 'published',
            shortDescription: form.shortDescription.trim(),
            technologies,
            thumbnailType: 'image',
            thumbnailUrl: form.thumbnailUrl.trim(),
            githubUrl: form.githubUrl.trim(),
            liveDemoUrl: form.liveDemoUrl.trim(),
            featured: Boolean(form.featured),
            displayOrder: prev.projects.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
    }, session.token);

    showToast(editingId ? `Project "${form.title}" updated!` : `Project "${form.title}" published!`, 'fa-rocket');
    handleCancelEdit();
    setIsFormOpen(false);
  };

  const currentSortObj = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="space-y-8">
      {/* Top Banner with Create Project Button */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
            <i className="fa-solid fa-layer-group"></i> PORTFOLIO PROJECTS MANAGER
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Deploy & Showcase Applications</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, edit, organize, filter and maintain live projects showcased across your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playTick();
              if (isFormOpen && editingId) {
                handleCancelEdit();
              } else {
                setIsFormOpen((prev) => !prev);
              }
            }}
            className="btn-create-project"
          >
            <i className={isFormOpen && !editingId ? 'fa-solid fa-minus text-sm' : isFormOpen && editingId ? 'fa-solid fa-xmark text-sm' : 'fa-solid fa-plus text-sm'}></i>
            <span>{isFormOpen ? (editingId ? 'Cancel Edit' : 'Hide Form') : 'Create New Project'}</span>
          </button>
        </div>
      </div>

      {/* Live Headings Customizer */}
      <div className="glass-card-admin p-6 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
            <i className="fa-solid fa-sliders"></i> SECTION HEADINGS CUSTOMIZER
          </span>
          <h3 className="text-lg font-bold text-white mt-1">Live Page Titles & Subtitles</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize the heading and eyebrow displayed on the public Projects page and Homepage section dynamically.
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

      {/* Project Form (Toggled via Create Button / Edit Click) */}
      {isFormOpen && (
        <form
          ref={formRef}
          onSubmit={handleSave}
          noValidate
          className="glass-card-admin p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 border-cyan-500/30"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <i className={editingId ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus'}></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Edit Project' : 'Create New Live Project'}
                </h2>
                <p className="text-xs text-slate-400">
                  {editingId ? 'Modify project details, tech stack, and links.' : 'Fill in the information below to add a new project to your portfolio.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="font-mono text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              <i className="fa-solid fa-xmark"></i>
              <span>{editingId ? 'Cancel Edit' : 'Close Form'}</span>
            </button>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
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
                placeholder="Full-Stack Web App, Frontend, AI/ML..."
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
              <FormErrorMessage message={errors.category} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Project Description *</label>
            <textarea
              rows="3"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              placeholder="Describe what this project does and key engineering highlights..."
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.shortDescription} />
          </div>

          {/* Technologies, URLs, and Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block font-mono text-xs text-slate-400 mb-1">Technologies (comma-separated) *</label>
              <input
                type="text"
                value={form.technologies}
                onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                placeholder="React JS, Node.js, Express.js, MongoDB..."
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
                placeholder="https://github.com/ayushprajapati9669-dev"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
              <FormErrorMessage message={errors.githubUrl} />
            </div>
          </div>

          {/* Status Selection Row */}
          <div className="flex items-center gap-6 p-3 rounded-xl border border-white/10 bg-black/20 flex-wrap">
            <span className="font-mono text-xs text-slate-400 font-semibold">Publish Status:</span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="radio"
                name="projStatus"
                value="published"
                checked={form.status === 'published' || form.status === 'active'}
                onChange={() => setForm({ ...form, status: 'published' })}
                className="accent-cyan-400"
              />
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-emerald-400"></i> Active / Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="radio"
                name="projStatus"
                value="draft"
                checked={form.status === 'draft'}
                onChange={() => setForm({ ...form, status: 'draft' })}
                className="accent-amber-400"
              />
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-file-pen text-amber-400"></i> Draft</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="radio"
                name="projStatus"
                value="archived"
                checked={form.status === 'archived'}
                onChange={() => setForm({ ...form, status: 'archived' })}
                className="accent-indigo-400"
              />
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-box-archive text-indigo-400"></i> Archived</span>
            </label>
          </div>

          {/* Drag & Drop Image Upload Zone */}
          <div className="space-y-2">
            <label className="block font-mono text-xs text-cyan-400 font-bold flex items-center gap-1.5">
              <i className="fa-solid fa-image"></i> Project Cover Image *
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="sm:col-span-8 space-y-3">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`admin-dropzone ${isDraggingFile ? 'dragging' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Drag & Drop project cover image here, or <span className="text-cyan-400 underline cursor-pointer">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      PNG, JPG, WebP or SVG up to 10MB
                    </p>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    placeholder="Or paste direct image URL (https://...)"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  <FormErrorMessage message={errors.thumbnailUrl} />
                </div>
              </div>

              {/* Preview Box */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center">
                {form.thumbnailUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/20 shadow-xl group">
                    <img
                      src={form.thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, thumbnailUrl: '' }))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-red-400 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                      title="Remove image"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center font-mono text-[11px] text-slate-500 gap-1.5 bg-black/30">
                    <i className="fa-regular fa-image text-2xl text-slate-600"></i>
                    <span>No image preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Featured on Homepage */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="projFeatured"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
            />
            <label htmlFor="projFeatured" className="text-xs text-slate-300 select-none cursor-pointer">
              Featured on Homepage (Highlight in hero & top carousel)
            </label>
          </div>

          {/* Form Actions: Submit Button with real icons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-400 hover:text-white font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save flex items-center gap-2 px-6 py-2.5 text-xs font-bold shadow-lg shadow-cyan-500/20"
            >
              <i className={editingId ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus'}></i>
              <span>{editingId ? 'Update Project' : 'Publish New Project'}</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          Existing Projects Section (Matching Reference Images 2 & 3)
          ========================================================================= */}
      <div className="glass-card-admin p-6 sm:p-8 space-y-5">
        {/* Header & Search (Matching Image 2) */}
        <div className="admin-proj-header">
          <div className="admin-proj-title-wrap">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <h3 className="admin-proj-title">
              Existing Projects <span className="admin-proj-count-badge">({projects.length})</span>
            </h3>
          </div>

          {/* Real-time Search Box */}
          <div className="admin-proj-search-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="admin-proj-search-input"
            />
          </div>
        </div>

        {/* Sub-Toolbar: Select All, Filter Tabs, Batch Delete, and Sort Dropdown */}
        <div className="admin-proj-toolbar">
          <div className="admin-proj-toolbar-left">
            {/* Select All */}
            <label className="admin-select-all-wrap">
              <div
                onClick={handleToggleSelectAll}
                className={`admin-proj-checkbox ${isAllSelected ? 'checked' : ''}`}
              >
                {isAllSelected && <i className="fa-solid fa-check"></i>}
              </div>
              <span>Select All</span>
            </label>

            <div className="admin-v-divider"></div>

            {/* Filter Tabs: All, Active, Draft, Archived, Trash with real icons and dynamic counts */}
            <div className="admin-filter-tabs">
              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('all'); }}
                className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-border-all text-[11px]"></i>
                <span>All</span>
                <span className="admin-tab-count">{counts.all}</span>
              </button>

              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('active'); }}
                className={`admin-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-circle-check text-[11px] text-emerald-400"></i>
                <span>Active</span>
                <span className="admin-tab-count">{counts.active}</span>
              </button>

              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('draft'); }}
                className={`admin-tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-file-pen text-[11px] text-amber-400"></i>
                <span>Draft</span>
                <span className="admin-tab-count">{counts.draft}</span>
              </button>

              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('archived'); }}
                className={`admin-tab-btn ${activeTab === 'archived' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-box-archive text-[11px] text-indigo-400"></i>
                <span>Archived</span>
                <span className="admin-tab-count">{counts.archived}</span>
              </button>

              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('trash'); }}
                className={`admin-tab-btn ${activeTab === 'trash' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-trash-can text-[11px] text-rose-400"></i>
                <span>Trash</span>
                <span className="admin-tab-count">{counts.trash}</span>
              </button>
            </div>
          </div>

          <div className="admin-proj-toolbar-right">
            {/* Batch Delete Button (shown when items are selected) */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBatchDelete}
                className="btn-batch-delete"
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>
                  {activeTab === 'trash' ? 'Delete Selected' : 'Trash Selected'} ({selectedIds.length})
                </span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="admin-sort-wrap" ref={sortRef}>
              <button
                type="button"
                onClick={() => { playTick(); setIsSortOpen((prev) => !prev); }}
                className="admin-sort-btn"
              >
                <i className={currentSortObj.icon}></i>
                <span>{currentSortObj.label}</span>
                <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-1"></i>
              </button>

              {isSortOpen && (
                <div className="admin-sort-menu animate-in fade-in zoom-in-95 duration-150">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        playTick();
                        setSortBy(opt.id);
                        setIsSortOpen(false);
                      }}
                      className={`admin-sort-item ${sortBy === opt.id ? 'active' : ''}`}
                    >
                      <i className={`${opt.icon} text-xs w-4`}></i>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Cards Grid (Matching Image 3) */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-black/20 space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-500 text-xl">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <h4 className="text-sm font-bold text-white">No projects found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No projects matching "${searchQuery}". Try a different keyword.`
                : activeTab === 'trash'
                ? 'Trash is empty.'
                : 'No projects in this category. Click "Create New Project" to add one.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredProjects.map((proj, idx) => {
              const isSelected = selectedIds.includes(proj.id);
              const indexStr = String(idx + 1).padStart(2, '0');
              const techList = Array.isArray(proj.technologies)
                ? proj.technologies
                : (proj.technologies || '').split(',').map((s) => s.trim()).filter(Boolean);

              const isLive = proj.status === 'published' || proj.status === 'active' || !proj.status;

              return (
                <div
                  key={proj.id}
                  className={`admin-proj-card ${isSelected ? 'selected' : ''}`}
                >
                  {/* Top Cover Image with Overlays (Matching Image 3) */}
                  <div className="admin-proj-img-wrap">
                    {proj.thumbnailUrl ? (
                      <img
                        src={proj.thumbnailUrl}
                        alt={proj.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center text-slate-600">
                        <i className="fa-solid fa-image text-3xl"></i>
                      </div>
                    )}

                    {/* Top-Left Overlays: Checkbox & Category Badge */}
                    <div className="admin-proj-top-left">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(proj.id);
                        }}
                        className={`admin-proj-checkbox ${isSelected ? 'checked' : ''}`}
                        title={isSelected ? 'Deselect project' : 'Select for deletion'}
                      >
                        {isSelected && <i className="fa-solid fa-check"></i>}
                      </div>

                      <span className="admin-proj-cat-badge">
                        {proj.category || 'Full-Stack'}
                      </span>
                    </div>

                    {/* Top-Right Overlays: Actions (Edit/Delete) & Live Badge */}
                    <div className="admin-proj-top-right">
                      <div className="admin-proj-icon-actions">
                        {proj.status === 'trash' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(proj);
                            }}
                            className="admin-proj-circle-btn"
                            title="Restore Project"
                          >
                            <i className="fa-solid fa-rotate-left"></i>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(proj);
                            }}
                            className="admin-proj-circle-btn"
                            title="Edit Project"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(proj);
                          }}
                          className="admin-proj-circle-btn delete"
                          title={proj.status === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>

                      {/* Status Badge */}
                      <div className="admin-proj-live-badge">
                        <span className={`admin-proj-live-dot ${!isLive ? '!bg-amber-400 !shadow-amber-400' : ''}`}></span>
                        <span>
                          {proj.status === 'draft'
                            ? 'Draft'
                            : proj.status === 'archived'
                            ? 'Archived'
                            : proj.status === 'trash'
                            ? 'In Trash'
                            : 'Live Deployed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="admin-proj-body">
                    {/* Meta Line: PROJECT 01 + Click to Visit */}
                    <div className="admin-proj-meta-line">
                      <span className="admin-proj-num">PROJECT {indexStr}</span>
                      {proj.liveDemoUrl && (
                        <a
                          href={proj.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-proj-visit-hint"
                        >
                          <span>Click to Visit</span>
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                      )}
                    </div>

                    {/* Card Title */}
                    <h4 className="admin-proj-card-title">{proj.title}</h4>

                    {/* Description (2 lines clamp) */}
                    <p className="admin-proj-card-desc">{proj.shortDescription}</p>

                    {/* Tech Stack Row with real icons (Matching Image 3) */}
                    <div className="admin-proj-tech-row">
                      {techList.map((tech, tIdx) => {
                        const badge = getTechBadgeData(tech);
                        return (
                          <span key={tIdx} className="admin-proj-tech-tag">
                            <i className={`${badge.icon} ${badge.color}`}></i>
                            <span>{tech}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Bottom Actions: Live Demo + Code Buttons (Matching Image 3) */}
                  <div className="admin-proj-card-actions">
                    <a
                      href={proj.liveDemoUrl || '#'}
                      target={proj.liveDemoUrl ? '_blank' : '_self'}
                      rel="noreferrer"
                      className="admin-btn-live-demo"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                      <span>Live Demo</span>
                    </a>
                    <a
                      href={proj.githubUrl || 'https://github.com/ayushprajapati9669-dev'}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-code"
                    >
                      <i className="fa-brands fa-github"></i>
                      <span>Code</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProjects;

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

const COMMON_PROJECT_CATEGORIES = [
  'Full-Stack Web App',
  'Frontend Engineering',
  'AI & Machine Learning',
  'Backend & APIs',
  'Mobile Application',
  'Cloud & DevOps'
];

const COMMON_TECH_PRESETS = [
  'React JS',
  'Node.js',
  'Express.js',
  'MongoDB',
  'TypeScript',
  'Next.js',
  'Python',
  'Tailwind CSS',
  'Docker',
  'MySQL',
  'PostgreSQL',
  'Redux',
  'Firebase'
];

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('manual');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isHeadingsOpen, setIsHeadingsOpen] = useState(false);
  const [draggedProjIndex, setDraggedProjIndex] = useState(null);
  const [dragOverProjIndex, setDragOverProjIndex] = useState(null);

  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const sortRef = useRef(null);

  const projects = appState.projects || [];

  // Parse current tech list for easy tag display and toggling
  const currentTechList = useMemo(() => {
    if (!form.technologies) return [];
    return form.technologies.split(',').map((t) => t.trim()).filter(Boolean);
  }, [form.technologies]);

  const handleToggleTechPreset = (tech) => {
    playTick();
    const exists = currentTechList.some((t) => t.toLowerCase() === tech.toLowerCase());
    let nextList;
    if (exists) {
      nextList = currentTechList.filter((t) => t.toLowerCase() !== tech.toLowerCase());
    } else {
      nextList = [...currentTechList, tech];
    }
    setForm((prev) => ({ ...prev, technologies: nextList.join(', ') }));
    if (errors.technologies) {
      setErrors((prev) => ({ ...prev, technologies: '' }));
    }
  };

  // Step-by-step validation helper
  const validateStep = (stepNumber) => {
    const newErrors = {};
    if (stepNumber === 1) {
      if (!form.title || form.title.trim().length < 3) {
        newErrors.title = 'Project title is required (minimum 3 characters).';
      }
      if (!form.category || !form.category.trim()) {
        newErrors.category = 'Project category is required.';
      }
      if (!form.shortDescription || form.shortDescription.trim().length < 10) {
        newErrors.shortDescription = 'Please provide a clear project description (at least 10 characters).';
      }
    } else if (stepNumber === 2) {
      if (!form.technologies || !form.technologies.trim()) {
        newErrors.technologies = 'Please specify at least one technology.';
      }
      if (!form.liveDemoUrl || !/^https?:\/\//i.test(form.liveDemoUrl.trim())) {
        newErrors.liveDemoUrl = 'Valid Live Demo URL starting with https:// or http:// is required.';
      }
      if (!form.githubUrl || !/^https?:\/\//i.test(form.githubUrl.trim())) {
        newErrors.githubUrl = 'Valid GitHub repository URL starting with https:// or http:// is required.';
      }
    } else if (stepNumber === 3) {
      if (!form.thumbnailUrl || !form.thumbnailUrl.trim()) {
        newErrors.thumbnailUrl = 'Please upload a project cover image or paste an image URL.';
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    playTick();
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevStep = () => {
    playTick();
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleJumpToStep = (targetStep) => {
    playTick();
    if (targetStep < currentStep || validateStep(currentStep)) {
      setErrors({});
      setCurrentStep(targetStep);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Available Categories for filtration
  const availableCategories = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    ['Full-Stack Web App', 'AI & Machine Learning', 'Frontend Engineering', 'Backend & APIs'].forEach((c) => set.add(c));
    return ['all', ...Array.from(set)];
  }, [projects]);

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

    // Filter by category
    if (selectedCategory !== 'all') {
      const qCat = selectedCategory.toLowerCase().trim();
      result = result.filter((p) => {
        const pCat = (p.category || '').toLowerCase().trim();
        if (qCat === 'full-stack' || qCat.includes('full-stack')) {
          return pCat.includes('full') || pCat.includes('stack');
        }
        if (qCat === 'ai-ml' || qCat.includes('ai') || qCat.includes('machine')) {
          return pCat.includes('ai') || pCat.includes('ml') || pCat.includes('learning');
        }
        return pCat.includes(qCat) || qCat.includes(pCat);
      });
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
  }, [projects, activeTab, selectedCategory, searchQuery, sortBy]);

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

  // Drag-and-drop Reordering Handlers for Projects
  const handleProjDragStart = (e, index) => {
    setDraggedProjIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleProjDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverProjIndex !== index) {
      setDragOverProjIndex(index);
    }
  };

  const handleProjDragLeave = (index) => {
    if (dragOverProjIndex === index) {
      setDragOverProjIndex(null);
    }
  };

  const handleProjDropReorder = (targetIndex) => {
    if (draggedProjIndex === null || draggedProjIndex === targetIndex) {
      setDraggedProjIndex(null);
      setDragOverProjIndex(null);
      return;
    }
    playTick();

    const sourceProj = filteredProjects[draggedProjIndex];
    const targetProj = filteredProjects[targetIndex];
    if (!sourceProj || !targetProj) {
      setDraggedProjIndex(null);
      setDragOverProjIndex(null);
      return;
    }

    const sourceGlobalIdx = projects.findIndex((p) => p.id === sourceProj.id);
    const targetGlobalIdx = projects.findIndex((p) => p.id === targetProj.id);

    if (sourceGlobalIdx === -1 || targetGlobalIdx === -1) {
      setDraggedProjIndex(null);
      setDragOverProjIndex(null);
      return;
    }

    const updated = [...projects];
    const [moved] = updated.splice(sourceGlobalIdx, 1);
    updated.splice(targetGlobalIdx, 0, moved);

    // Assign displayOrder based on new positions
    const ordered = updated.map((p, i) => ({ ...p, displayOrder: i + 1 }));

    // Auto-set sortBy to manual so the user immediately sees the custom order
    setSortBy('manual');

    updateAppState(
      (prev) => ({
        ...prev,
        projects: ordered
      }),
      session.token
    );

    setDraggedProjIndex(null);
    setDragOverProjIndex(null);
    showToast(`Project "${moved.title || 'Project'}" moved to position #${targetIndex + 1}!`, 'fa-arrows-up-down');
  };

  // 1-Click Move Up / Down
  const handleMoveOrder = (proj, direction) => {
    playTick();
    const currentIdx = filteredProjects.findIndex((p) => p.id === proj.id);
    const targetIdx = currentIdx + direction;
    if (targetIdx < 0 || targetIdx >= filteredProjects.length) return;

    const sourceGlobalIdx = projects.findIndex((p) => p.id === proj.id);
    const targetProj = filteredProjects[targetIdx];
    const targetGlobalIdx = projects.findIndex((p) => p.id === targetProj.id);

    if (sourceGlobalIdx === -1 || targetGlobalIdx === -1) return;

    const updated = [...projects];
    const [moved] = updated.splice(sourceGlobalIdx, 1);
    updated.splice(targetGlobalIdx, 0, moved);

    const ordered = updated.map((p, i) => ({ ...p, displayOrder: i + 1 }));
    setSortBy('manual');

    updateAppState(
      (prev) => ({
        ...prev,
        projects: ordered
      }),
      session.token
    );

    showToast(`Project moved ${direction < 0 ? 'up' : 'down'}!`, 'fa-arrow-up');
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

    try {
      setIsUploading(true);
      showToast('Uploading cover image to cloud...');
      const uploadedUrl = await uploadImageViaCloudinary(file, appState.settings);
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
        setErrors((prev) => ({ ...prev, thumbnailUrl: '' }));
        showToast('Cover image ready!', 'fa-circle-check');
      }
    } catch {
      showToast('Failed to upload image. You can paste a direct URL.', 'fa-circle-exclamation');
    } finally {
      setIsUploading(false);
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
    setCurrentStep(1);
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
    setCurrentStep(1);
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
      if (check.errors.title || check.errors.category || check.errors.shortDescription) {
        setCurrentStep(1);
      } else if (check.errors.technologies || check.errors.liveDemoUrl || check.errors.githubUrl) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
      showToast('Please check the highlighted fields.', 'fa-triangle-exclamation');
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

      {/* ========================================================
          2. LIVE SECTION HEADINGS CUSTOMIZER (COLLAPSIBLE)
         ======================================================== */}
      <div className="glass-card-admin rounded-3xl border border-white/10 p-5 sm:p-6 transition-all hover:border-cyan-500/30">
        <div
          className="flex cursor-pointer items-center justify-between select-none"
          onClick={() => {
            playTick();
            setIsHeadingsOpen(!isHeadingsOpen);
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-500/10">
              <i className="fa-solid fa-heading" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                  SECTION HEADINGS CUSTOMIZER
                </span>
              </div>
              <h3 className="text-sm font-bold text-white sm:text-base">
                Projects Section Headings <span className="text-xs font-normal text-slate-400 hidden sm:inline">(Live Page Titles & Subtitles)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Customize dynamic eyebrow tag and headline displayed on the public Projects page and Homepage section dynamically.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-all"
            aria-label={isHeadingsOpen ? "Collapse headings customizer" : "Expand headings customizer"}
          >
            <i className={`fa-solid fa-chevron-${isHeadingsOpen ? 'up' : 'down'} text-xs`} />
          </button>
        </div>

        {isHeadingsOpen && (
          <div className="mt-5 border-t border-white/10 pt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in duration-200">
            <div>
              <label className="block font-mono text-xs font-semibold text-slate-300 mb-1.5">
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
                className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 font-mono"
                placeholder="02 · LIVE DEPLOYED PROJECTS"
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-semibold text-slate-300 mb-1.5">
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
                className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                placeholder="Featured Full-Stack Applications"
              />
            </div>
          </div>
        )}
      </div>

      {/* Project Form (Toggled via Create Button / Edit Click) */}
      {isFormOpen && (
        <form
          ref={formRef}
          onSubmit={handleSave}
          noValidate
          className="glass-card-admin p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 border-cyan-500/30"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <i className={editingId ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus'}></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {editingId ? 'Edit Project' : 'Create New Live Project'}
                  </h2>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Step {currentStep} of 3
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {editingId ? 'Update project details across 3 organized steps.' : 'Complete the 3 quick steps below to showcase a new live project.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="font-mono text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all hover:bg-white/5"
            >
              <i className="fa-solid fa-xmark"></i>
              <span>{editingId ? 'Cancel Edit' : 'Close Form'}</span>
            </button>
          </div>

          {/* Stepper Progress Bar & Stage Indicator (Matching Certificates Form) */}
          <div className="space-y-3">
            {/* Visual Step Progress Slider */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 transition-all duration-300 ease-out shadow-sm shadow-cyan-400"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Step 1 Pill */}
              <button
                type="button"
                onClick={() => handleJumpToStep(1)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  currentStep === 1
                    ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/15'
                    : currentStep > 1
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-300 hover:border-emerald-500/50'
                    : 'border-white/10 bg-black/40 text-slate-400 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                    currentStep === 1
                      ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                      : currentStep > 1
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {currentStep > 1 ? <i className="fa-solid fa-check text-xs"></i> : '01'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Step 01</span>
                    {currentStep > 1 && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                        <i className="fa-solid fa-circle-check text-[9px]"></i> Done
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-bold truncate ${currentStep === 1 ? 'text-white' : 'text-slate-300'}`}>
                    Core Information
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Title, category & overview</p>
                </div>
              </button>

              {/* Step 2 Pill */}
              <button
                type="button"
                onClick={() => handleJumpToStep(2)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  currentStep === 2
                    ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/15'
                    : currentStep > 2
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-300 hover:border-emerald-500/50'
                    : 'border-white/10 bg-black/40 text-slate-400 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                    currentStep === 2
                      ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                      : currentStep > 2
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {currentStep > 2 ? <i className="fa-solid fa-check text-xs"></i> : '02'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Step 02</span>
                    {currentStep > 2 && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                        <i className="fa-solid fa-circle-check text-[9px]"></i> Done
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-bold truncate ${currentStep === 2 ? 'text-white' : 'text-slate-300'}`}>
                    Tech Stack & Links
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Tech tags, live URL & GitHub</p>
                </div>
              </button>

              {/* Step 3 Pill */}
              <button
                type="button"
                onClick={() => handleJumpToStep(3)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  currentStep === 3
                    ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/15'
                    : 'border-white/10 bg-black/40 text-slate-400 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                    currentStep === 3
                      ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  03
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Step 03</span>
                  </div>
                  <p className={`text-xs font-bold truncate ${currentStep === 3 ? 'text-white' : 'text-slate-300'}`}>
                    Media & Visibility
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Cover image, status & preview</p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 1: Core Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <i className="fa-solid fa-file-lines text-cyan-400"></i>
                  <span>Project Identity & Overview</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Required fields marked with *</span>
              </div>

              {/* Title Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-mono text-xs text-slate-300 font-semibold">
                    Project Title *
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    {form.title.length} characters
                  </span>
                </div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g. Airbnb Clone — Vacation Rental Platform"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 shadow-inner"
                />
                <FormErrorMessage message={errors.title} />
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Slug will be auto-generated: <span className="text-cyan-400">/{form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'project-slug'}</span>
                </p>
              </div>

              {/* Category Input & Quick Presets */}
              <div className="space-y-2">
                <label className="block font-mono text-xs text-slate-300 font-semibold">
                  Category *
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => {
                    setForm({ ...form, category: e.target.value });
                    if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                  }}
                  placeholder="e.g. Full-Stack Web App, AI & Machine Learning, Mobile..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 shadow-inner"
                />
                <FormErrorMessage message={errors.category} />

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="font-mono text-[11px] text-slate-400 block mb-1.5">Quick Category Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_PROJECT_CATEGORIES.map((cat) => {
                      const isSelected = form.category.trim().toLowerCase() === cat.toLowerCase();
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            playTick();
                            setForm({ ...form, category: cat });
                            if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                          }}
                          className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm shadow-cyan-500/20'
                              : 'border-white/10 bg-black/30 text-slate-400 hover:text-white hover:border-white/25'
                          }`}
                        >
                          {isSelected && <i className="fa-solid fa-check text-[10px] mr-1.5 text-cyan-400"></i>}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-mono text-xs text-slate-300 font-semibold">
                    Project Description *
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    {form.shortDescription.length} characters (min 10)
                  </span>
                </div>
                <textarea
                  rows="4"
                  value={form.shortDescription}
                  onChange={(e) => {
                    setForm({ ...form, shortDescription: e.target.value });
                    if (errors.shortDescription) setErrors((prev) => ({ ...prev, shortDescription: '' }));
                  }}
                  placeholder="Describe the problem solved, engineering architecture highlights, features, and user workflow..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 shadow-inner"
                />
                <FormErrorMessage message={errors.shortDescription} />
              </div>
            </div>
          )}

          {/* STEP 2: Technologies & Links */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <i className="fa-solid fa-code text-cyan-400"></i>
                  <span>Tech Stack & Project Links</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Required fields marked with *</span>
              </div>

              {/* Technologies Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs text-slate-300 font-semibold">
                    Technologies Used (comma-separated) *
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    {currentTechList.length} technologies selected
                  </span>
                </div>

                <input
                  type="text"
                  value={form.technologies}
                  onChange={(e) => {
                    setForm({ ...form, technologies: e.target.value });
                    if (errors.technologies) setErrors((prev) => ({ ...prev, technologies: '' }));
                  }}
                  placeholder="React JS, Node.js, Express.js, MongoDB, Tailwind CSS..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 shadow-inner"
                />
                <FormErrorMessage message={errors.technologies} />

                {/* Selected Badges Preview */}
                {currentTechList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/25">
                    <span className="font-mono text-[11px] text-slate-400 mr-1">Active Tags:</span>
                    {currentTechList.map((tech) => {
                      const badge = getTechBadgeData(tech);
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 font-mono group"
                        >
                          <i className={`${badge.icon} ${badge.color}`}></i>
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleTechPreset(tech)}
                            className="text-slate-400 hover:text-red-400 ml-0.5 transition-colors"
                            title={`Remove ${tech}`}
                          >
                            <i className="fa-solid fa-xmark text-[10px]"></i>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Quick Add Tech Chips */}
                <div>
                  <span className="font-mono text-[11px] text-slate-400 block mb-2">
                    Click to add / remove common technologies:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_TECH_PRESETS.map((tech) => {
                      const isSelected = currentTechList.some((t) => t.toLowerCase() === tech.toLowerCase());
                      const badge = getTechBadgeData(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => handleToggleTechPreset(tech)}
                          className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm shadow-cyan-500/20'
                              : 'border-white/10 bg-black/30 text-slate-400 hover:text-white hover:border-white/25'
                          }`}
                        >
                          <i className={`${badge.icon} ${badge.color}`}></i>
                          <span>{tech}</span>
                          {isSelected && <i className="fa-solid fa-check text-[10px] text-cyan-400 ml-0.5"></i>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* URLs: Live Demo & GitHub */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2">
                {/* Live Demo URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <i className="fa-solid fa-arrow-up-right-from-square text-cyan-400"></i>
                      <span>Live Demo URL *</span>
                    </label>
                    {form.liveDemoUrl && /^https?:\/\//i.test(form.liveDemoUrl) && (
                      <a
                        href={form.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Test Link</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={form.liveDemoUrl}
                    onChange={(e) => {
                      setForm({ ...form, liveDemoUrl: e.target.value });
                      if (errors.liveDemoUrl) setErrors((prev) => ({ ...prev, liveDemoUrl: '' }));
                    }}
                    placeholder="https://airbnbclone2-8519.onrender.com"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 shadow-inner"
                  />
                  <FormErrorMessage message={errors.liveDemoUrl} />
                  <p className="text-[11px] text-slate-400 font-mono">
                    Must begin with <span className="text-cyan-400">https://</span> or <span className="text-cyan-400">http://</span>
                  </p>
                </div>

                {/* GitHub Code URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <i className="fa-brands fa-github text-slate-300"></i>
                      <span>GitHub Repository URL *</span>
                    </label>
                    {form.githubUrl && /^https?:\/\//i.test(form.githubUrl) && (
                      <a
                        href={form.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open Repo</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={(e) => {
                      setForm({ ...form, githubUrl: e.target.value });
                      if (errors.githubUrl) setErrors((prev) => ({ ...prev, githubUrl: '' }));
                    }}
                    placeholder="https://github.com/ayushprajapati9669-dev/project-repo"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 shadow-inner"
                  />
                  <FormErrorMessage message={errors.githubUrl} />
                  <p className="text-[11px] text-slate-400 font-mono">
                    Public or open-source GitHub repository URL
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Media, Visibility & Live Preview */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <i className="fa-solid fa-photo-film text-cyan-400"></i>
                  <span>Media Upload, Visibility & Card Preview</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Final Step</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Image Dropzone & Settings */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <label className="block font-mono text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <i className="fa-solid fa-image text-cyan-400"></i>
                      <span>Project Cover Image *</span>
                    </label>

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
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg shadow-inner">
                        {isUploading ? (
                          <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-cloud-arrow-up"></i>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {isUploading ? 'Uploading to cloud...' : 'Drag & Drop cover image here, or '}
                          {!isUploading && <span className="text-cyan-400 underline cursor-pointer">browse</span>}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          PNG, JPG, WebP up to 10MB (Cloudinary automated optimization)
                        </p>
                      </div>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="space-y-1 pt-1">
                      <input
                        type="text"
                        value={form.thumbnailUrl}
                        onChange={(e) => {
                          setForm({ ...form, thumbnailUrl: e.target.value });
                          if (errors.thumbnailUrl) setErrors((prev) => ({ ...prev, thumbnailUrl: '' }));
                        }}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 font-mono"
                      />
                      <FormErrorMessage message={errors.thumbnailUrl} />
                    </div>
                  </div>

                  {/* Publish Status Selection */}
                  <div className="space-y-2">
                    <label className="block font-mono text-xs text-slate-300 font-semibold">
                      Publish Status
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          form.status === 'published' || form.status === 'active'
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                            : 'border-white/10 bg-black/30 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="projStatus"
                          value="published"
                          checked={form.status === 'published' || form.status === 'active'}
                          onChange={() => setForm({ ...form, status: 'published' })}
                          className="accent-emerald-400"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-emerald-400 flex items-center gap-1">
                            <i className="fa-solid fa-circle-check"></i> Published
                          </p>
                          <p className="text-[10px] text-slate-400">Live on public site</p>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          form.status === 'draft'
                            ? 'border-amber-500/50 bg-amber-500/10 text-white'
                            : 'border-white/10 bg-black/30 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="projStatus"
                          value="draft"
                          checked={form.status === 'draft'}
                          onChange={() => setForm({ ...form, status: 'draft' })}
                          className="accent-amber-400"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-amber-400 flex items-center gap-1">
                            <i className="fa-solid fa-file-pen"></i> Draft
                          </p>
                          <p className="text-[10px] text-slate-400">Hidden from visitors</p>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          form.status === 'archived'
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                            : 'border-white/10 bg-black/30 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="projStatus"
                          value="archived"
                          checked={form.status === 'archived'}
                          onChange={() => setForm({ ...form, status: 'archived' })}
                          className="accent-indigo-400"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-indigo-400 flex items-center gap-1">
                            <i className="fa-solid fa-box-archive"></i> Archived
                          </p>
                          <p className="text-[10px] text-slate-400">Stored in archive</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Featured on Homepage */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-black/30">
                    <input
                      type="checkbox"
                      id="projFeatured"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
                    />
                    <label htmlFor="projFeatured" className="text-xs text-slate-200 select-none cursor-pointer flex-1">
                      <span className="font-semibold block text-white flex items-center gap-1.5">
                        <i className="fa-solid fa-star text-amber-400 text-xs"></i>
                        Feature on Homepage & Live Portfolio Hero
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Pins this project with priority badges in top carousels and highlight sections.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Right Column: Real-time Live Project Card Preview */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-cyan-400 font-semibold flex items-center gap-1.5">
                      <i className="fa-solid fa-eye"></i> Live Portfolio Card Preview
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">What visitors will see</span>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/30 bg-black/60 overflow-hidden shadow-2xl backdrop-blur-md">
                    {/* Preview Thumbnail */}
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
                      {form.thumbnailUrl ? (
                        <img
                          src={form.thumbnailUrl}
                          alt={form.title || 'Project Preview'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2 bg-gradient-to-br from-black/80 to-slate-900">
                          <i className="fa-regular fa-image text-3xl"></i>
                          <span className="font-mono text-xs text-slate-400">Upload cover image to preview</span>
                        </div>
                      )}

                      {/* Top badging on card */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-400/30">
                          {form.category || 'Category'}
                        </span>
                        {form.featured && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 backdrop-blur-md">
                            <i className="fa-solid fa-star text-[9px]"></i> Featured
                          </span>
                        )}
                      </div>

                      {/* Remove image button if has thumbnail */}
                      {form.thumbnailUrl && (
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, thumbnailUrl: '' }))}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/80 text-red-400 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all"
                          title="Remove cover image"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>

                    {/* Preview Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {form.title || 'Project Title Preview'}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {form.shortDescription || 'Your short project overview description will appear here on the public website.'}
                        </p>
                      </div>

                      {/* Tech badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {currentTechList.slice(0, 4).map((tech) => {
                          const badge = getTechBadgeData(tech);
                          return (
                            <span
                              key={tech}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1"
                            >
                              <i className={`${badge.icon} ${badge.color}`}></i>
                              <span>{tech}</span>
                            </span>
                          );
                        })}
                        {currentTechList.length > 4 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            +{currentTechList.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Action buttons preview */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <span className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                          <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                          <span>Live Demo</span>
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 border border-white/15 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                          <i className="fa-brands fa-github"></i>
                          <span>GitHub</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              <i className="fa-solid fa-xmark"></i>
              <span>Cancel</span>
            </button>

            <div className="flex items-center gap-2.5">
              {/* Back Button (shown on Steps 2 & 3) */}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="font-mono text-xs px-4 py-2.5 rounded-xl border border-white/15 bg-black/40 text-slate-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Back to Step 0{currentStep - 1}</span>
                </button>
              )}

              {/* Continue / Next Step Button (shown on Steps 1 & 2) */}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-save flex items-center gap-2 px-6 py-2.5 text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue to Step 0{currentStep + 1}</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              ) : (
                /* Final Submit Button (shown on Step 3) */
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-save flex items-center gap-2 px-7 py-2.5 text-xs font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>Uploading Media...</span>
                    </>
                  ) : (
                    <>
                      <i className={editingId ? 'fa-solid fa-check' : 'fa-solid fa-rocket'}></i>
                      <span>{editingId ? 'Update & Save Changes' : 'Publish New Project'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          Existing Projects Section (Matching Reference Images 2 & 3)
          ========================================================================= */}
      {/* =========================================================================
          Existing Projects Section (Clean, Structured, and Admin-Friendly)
          ========================================================================= */}
      <div className="glass-card-admin p-6 sm:p-8 space-y-6">
        {/* Section Header (Matching Image 2) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-400/10">
              <i className="fa-solid fa-layer-group text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Existing Projects
                </h3>
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 px-2.5 py-0.5 rounded-full">
                  {filteredProjects.length} / {projects.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Drag to reorder, multi-select for batch actions, or filter your portfolio.
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
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
                setIsFormOpen(true);
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-4 py-2 font-mono text-xs font-bold text-slate-950 transition-all shadow-md shadow-cyan-400/20 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-xs" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Search, Category & Sort Bar (Matching Image 2 Single Bar) */}
        <div className="flex flex-wrap lg:flex-nowrap items-center rounded-2xl border border-white/10 bg-[#070b12]/60 px-3 py-1.5 w-full gap-2">
          {/* Search Input */}
          <div className="flex-1 min-w-[240px] relative flex items-center">
            <i className="fa-solid fa-magnifying-glass text-xs text-slate-400 pl-1 pr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tech stack, or keywords..."
              className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-slate-500 font-sans py-2"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setSearchQuery('');
                }}
                className="text-xs text-slate-400 hover:text-white pr-2 cursor-pointer"
                title="Clear search"
              >
                ×
              </button>
            ) : (
              <kbd className="border border-white/10 bg-white/5 text-[10px] text-slate-400 px-1.5 py-0.5 rounded font-mono mr-2 hidden sm:inline-block">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-6 w-px bg-white/10" />

          {/* Category Dropdown */}
          <div className="relative min-w-[160px] flex items-center">
            <i className="fa-solid fa-filter text-slate-400 text-xs pl-2 mr-1 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                playTick();
                setSelectedCategory(e.target.value);
              }}
              className="appearance-none w-full bg-transparent border-0 pl-1.5 pr-7 py-2 text-xs font-medium text-slate-200 hover:text-white outline-none cursor-pointer transition-colors"
            >
              <option value="all" className="bg-[#0b101b] text-white">
                All Categories ({projects.length})
              </option>
              {availableCategories
                .filter((c) => c !== 'all')
                .map((cat) => {
                  const count = projects.filter((p) => {
                    const pCat = (p.category || '').toLowerCase();
                    const cLower = cat.toLowerCase();
                    return pCat.includes(cLower) || cLower.includes(pCat);
                  }).length;
                  return (
                    <option key={cat} value={cat} className="bg-[#0b101b] text-white">
                      {cat} ({count})
                    </option>
                  );
                })}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none" />
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-6 w-px bg-white/10" />

          {/* Sort Selector */}
          <div className="relative min-w-[150px] flex items-center">
            <i className="fa-solid fa-arrow-down-short-wide text-slate-400 text-xs pl-2 mr-1 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => {
                playTick();
                setSortBy(e.target.value);
              }}
              className="appearance-none w-full bg-transparent border-0 pl-1.5 pr-7 py-2 text-xs font-medium text-slate-200 hover:text-white outline-none cursor-pointer transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#0b101b] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Action Controls & Status Tabs Row (Matching Image 2) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-4">
            {/* Select All Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer font-sans text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              <div
                onClick={handleToggleSelectAll}
                className={`admin-proj-checkbox ${isAllSelected ? 'checked' : ''}`}
              >
                {isAllSelected && <i className="fa-solid fa-check text-[10px]"></i>}
              </div>
              <span>
                {isAllSelected && filteredProjects.length > 0
                  ? 'Deselect All'
                  : `Select All (${filteredProjects.length})`}
              </span>
            </label>

            {/* Filter Tabs Group matching Image 2 */}
            <div className="flex items-center rounded-xl bg-black/40 border border-white/10 p-1 gap-1">
              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('all'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="fa-solid fa-border-all text-[11px]"></i>
                <span>All</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                  activeTab === 'all' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/10 text-slate-400'
                }`}>
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('active'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Active</span>
                <span className="text-[11px] text-slate-400 ml-0.5">{counts.active}</span>
              </button>

              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('draft'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'draft'
                    ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span>Draft</span>
                <span className="text-[11px] text-slate-400 ml-0.5">{counts.draft}</span>
              </button>

              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('archived'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'archived'
                    ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                <span>Archived</span>
                <span className="text-[11px] text-slate-400 ml-0.5">{counts.archived}</span>
              </button>

              <button
                type="button"
                onClick={() => { playTick(); setActiveTab('trash'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'trash'
                    ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Trash</span>
                <span className="text-[11px] text-slate-400 ml-0.5">{counts.trash}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

            <span className="font-sans text-xs text-slate-400 flex items-center gap-1.5">
              <i className="fa-solid fa-grip-vertical text-slate-500"></i>
              <span>Drag to reorder</span>
            </span>
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
                  onDragOver={(e) => handleProjDragOver(e, idx)}
                  onDragLeave={() => handleProjDragLeave(idx)}
                  onDrop={() => handleProjDropReorder(idx)}
                  className={`admin-proj-card ${isSelected ? 'selected' : ''} ${
                    dragOverProjIndex === idx
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-400/20 scale-[1.01] transition-all'
                      : ''
                  } ${draggedProjIndex === idx ? 'opacity-40 cursor-grabbing' : ''}`}
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

                    {/* Top-Left Overlays: Checkbox, Drag Handle & Category Badge */}
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

                      {/* Drag Handle button */}
                      <div
                        draggable={true}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleProjDragStart(e, idx);
                        }}
                        onDragEnd={() => {
                          setDraggedProjIndex(null);
                          setDragOverProjIndex(null);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 border border-white/20 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 cursor-grab active:cursor-grabbing transition-all select-none"
                        title="Drag handle to reorder project"
                      >
                        <i className="fa-solid fa-grip-vertical text-xs pointer-events-none" />
                      </div>

                      <span className="admin-proj-cat-badge">
                        {proj.category || 'Full-Stack'}
                      </span>
                    </div>

                    {/* Top-Right Overlays: Actions (Edit/Delete) & Live Badge */}
                    <div className="admin-proj-top-right">
                      {/* Position Reorder Chevrons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveOrder(proj, -1);
                          }}
                          disabled={idx === 0}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 border border-white/20 text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                          title="Move Up"
                        >
                          <i className="fa-solid fa-chevron-up text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveOrder(proj, 1);
                          }}
                          disabled={idx === filteredProjects.length - 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 border border-white/20 text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                          title="Move Down"
                        >
                          <i className="fa-solid fa-chevron-down text-[10px]" />
                        </button>
                      </div>

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

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { uploadImageViaCloudinary } from '../../../services/api';
import { validateProjectForm } from '../../../utils/validation';
import { playTick } from '../../../utils/audio';
import { MarkdownView } from '../../../components/common/MarkdownView';

const DEFAULT_CASE_STUDY = {
  problem: '',
  approach: '',
  techDecisions: '',
  result: {
    summary: '',
    metrics: [
      { label: 'API Endpoints', value: '15+' },
      { label: 'Lighthouse', value: '92' }
    ]
  },
  learnings: '',
  architectureDiagramUrl: '',
  beforeScreenshots: [],
  afterScreenshots: []
};

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
    featured: true,
    caseStudy: JSON.parse(JSON.stringify(DEFAULT_CASE_STUDY))
  });
  const [errors, setErrors] = useState({});
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isPreviewCaseStudyModalOpen, setIsPreviewCaseStudyModalOpen] = useState(false);
  const [markdownPreviews, setMarkdownPreviews] = useState({
    problem: false,
    approach: false,
    techDecisions: false,
    learnings: false
  });

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
    } else if (stepNumber === 2) {
      if (!form.shortDescription || form.shortDescription.trim().length < 10) {
        newErrors.shortDescription = 'Please provide a clear project description (at least 10 characters).';
      }
    } else if (stepNumber === 3) {
      if (!form.technologies || !form.technologies.trim()) {
        newErrors.technologies = 'Please specify at least one technology.';
      }
      if (!form.liveDemoUrl || !/^https?:\/\//i.test(form.liveDemoUrl.trim())) {
        newErrors.liveDemoUrl = 'Valid Live Demo URL starting with https:// or http:// is required.';
      }
      if (!form.githubUrl || !/^https?:\/\//i.test(form.githubUrl.trim())) {
        newErrors.githubUrl = 'Valid GitHub repository URL starting with https:// or http:// is required.';
      }
    } else if (stepNumber === 4) {
      if (!form.thumbnailUrl || !form.thumbnailUrl.trim()) {
        newErrors.thumbnailUrl = 'Please upload a project cover image or paste an image URL.';
      }
    } else if (stepNumber === 5) {
      const cs = form.caseStudy || {};
      if (cs.problem && cs.problem.length > 5000) newErrors.csProblem = 'Problem section cannot exceed 5000 characters.';
      if (cs.approach && cs.approach.length > 5000) newErrors.csApproach = 'Approach section cannot exceed 5000 characters.';
      if (cs.techDecisions && cs.techDecisions.length > 5000) newErrors.csTech = 'Tech Decisions section cannot exceed 5000 characters.';
      if (cs.learnings && cs.learnings.length > 5000) newErrors.csLearnings = 'Learnings section cannot exceed 5000 characters.';
      if (cs.result?.summary && cs.result.summary.length > 5000) newErrors.csResult = 'Result summary cannot exceed 5000 characters.';
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    playTick();
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, 5));
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
      featured: Boolean(p.featured),
      caseStudy: p.caseStudy ? JSON.parse(JSON.stringify(p.caseStudy)) : JSON.parse(JSON.stringify(DEFAULT_CASE_STUDY))
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
      featured: true,
      caseStudy: JSON.parse(JSON.stringify(DEFAULT_CASE_STUDY))
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
  const handleSave = (e, overrideCaseStudy = undefined) => {
    if (e && e.preventDefault) e.preventDefault();
    playTick();
    const check = validateProjectForm(form);
    if (!check.isValid) {
      setErrors(check.errors);
      if (check.errors.title || check.errors.category) {
        setCurrentStep(1);
      } else if (check.errors.shortDescription) {
        setCurrentStep(2);
      } else if (check.errors.technologies || check.errors.liveDemoUrl || check.errors.githubUrl) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
      showToast('Please check the highlighted fields.', 'fa-triangle-exclamation');
      return;
    }

    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const technologies = form.technologies.split(',').map((s) => s.trim()).filter(Boolean);

    const targetCaseStudy = overrideCaseStudy !== undefined ? overrideCaseStudy : form.caseStudy;
    const caseStudyData = targetCaseStudy && (
      targetCaseStudy.problem ||
      targetCaseStudy.approach ||
      targetCaseStudy.techDecisions ||
      targetCaseStudy.learnings ||
      targetCaseStudy.result?.summary ||
      targetCaseStudy.architectureDiagramUrl ||
      (Array.isArray(targetCaseStudy.result?.metrics) && targetCaseStudy.result.metrics.length > 0)
    ) ? {
      problem: targetCaseStudy.problem || '',
      approach: targetCaseStudy.approach || '',
      techDecisions: targetCaseStudy.techDecisions || '',
      learnings: targetCaseStudy.learnings || '',
      architectureDiagramUrl: targetCaseStudy.architectureDiagramUrl || '',
      beforeScreenshots: Array.isArray(targetCaseStudy.beforeScreenshots)
        ? targetCaseStudy.beforeScreenshots.filter(Boolean)
        : [],
      afterScreenshots: Array.isArray(targetCaseStudy.afterScreenshots)
        ? targetCaseStudy.afterScreenshots.filter(Boolean)
        : [],
      result: {
        summary: targetCaseStudy.result?.summary || '',
        metrics: Array.isArray(targetCaseStudy.result?.metrics)
          ? targetCaseStudy.result.metrics.filter((m) => m.label?.trim() || m.value?.trim())
          : []
      }
    } : null;

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
                  caseStudy: caseStudyData,
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
            caseStudy: caseStudyData,
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

  const handleCaseStudyChange = (field, val) => {
    setForm((prev) => ({
      ...prev,
      caseStudy: {
        ...(prev.caseStudy || DEFAULT_CASE_STUDY),
        [field]: val
      }
    }));
  };

  const handleMetricChange = (idx, key, val) => {
    setForm((prev) => {
      const metrics = [...(prev.caseStudy?.result?.metrics || [])];
      metrics[idx] = { ...(metrics[idx] || { label: '', value: '' }), [key]: val };
      return {
        ...prev,
        caseStudy: {
          ...(prev.caseStudy || DEFAULT_CASE_STUDY),
          result: {
            ...(prev.caseStudy?.result || {}),
            metrics
          }
        }
      };
    });
  };

  const handleAddMetric = () => {
    playTick();
    setForm((prev) => {
      const metrics = [...(prev.caseStudy?.result?.metrics || [])];
      if (metrics.length >= 10) {
        showToast('Maximum of 10 metrics allowed', 'fa-triangle-exclamation');
        return prev;
      }
      metrics.push({ label: '', value: '' });
      return {
        ...prev,
        caseStudy: {
          ...(prev.caseStudy || DEFAULT_CASE_STUDY),
          result: {
            ...(prev.caseStudy?.result || {}),
            metrics
          }
        }
      };
    });
  };

  const handleRemoveMetric = (idx) => {
    playTick();
    setForm((prev) => {
      const metrics = (prev.caseStudy?.result?.metrics || []).filter((_, i) => i !== idx);
      return {
        ...prev,
        caseStudy: {
          ...(prev.caseStudy || DEFAULT_CASE_STUDY),
          result: {
            ...(prev.caseStudy?.result || {}),
            metrics
          }
        }
      };
    });
  };

  const handleUploadArchDiagram = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleCaseStudyChange('architectureDiagramUrl', e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      showToast('Uploading architecture diagram...');
      const uploadedUrl = await uploadImageViaCloudinary(file, appState.settings);
      if (uploadedUrl) {
        handleCaseStudyChange('architectureDiagramUrl', uploadedUrl);
        showToast('Architecture diagram uploaded successfully!', 'fa-cloud-check');
      }
    } catch {
      showToast('Upload error. Kept local preview.', 'fa-circle-exclamation');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddScreenshot = async (file, type = 'before') => {
    if (!file) return;
    const arrayKey = type === 'before' ? 'beforeScreenshots' : 'afterScreenshots';
    const currentList = form.caseStudy?.[arrayKey] || [];
    if (currentList.length >= 5) {
      showToast(`Maximum of 5 ${type} screenshots allowed.`, 'fa-triangle-exclamation');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((prev) => ({
        ...prev,
        caseStudy: {
          ...(prev.caseStudy || DEFAULT_CASE_STUDY),
          [arrayKey]: [...(prev.caseStudy?.[arrayKey] || []), e.target.result]
        }
      }));
    };
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      const uploadedUrl = await uploadImageViaCloudinary(file, appState.settings);
      if (uploadedUrl) {
        setForm((prev) => {
          const list = (prev.caseStudy?.[arrayKey] || []).filter((u) => !u.startsWith('data:'));
          return {
            ...prev,
            caseStudy: {
              ...(prev.caseStudy || DEFAULT_CASE_STUDY),
              [arrayKey]: [...list, uploadedUrl]
            }
          };
        });
        showToast('Screenshot uploaded!', 'fa-check');
      }
    } catch {
      showToast('Cloud upload fallback to local preview.', 'fa-info');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveScreenshot = (idx, type = 'before') => {
    playTick();
    const arrayKey = type === 'before' ? 'beforeScreenshots' : 'afterScreenshots';
    setForm((prev) => ({
      ...prev,
      caseStudy: {
        ...(prev.caseStudy || DEFAULT_CASE_STUDY),
        [arrayKey]: (prev.caseStudy?.[arrayKey] || []).filter((_, i) => i !== idx)
      }
    }));
  };

  const toggleMarkdownPreview = (field) => {
    playTick();
    setMarkdownPreviews((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSkipCaseStudy = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    playTick();
    handleSave(e, null);
  };

  const currentSortObj = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];

  const activeProjectsCount = projects.filter((p) => p.status === 'published' || p.status === 'active' || !p.status).length;

  return (
    <div className="space-y-6">
      {/* Top Header Matching Photo 2 */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Deploy & Showcase Applications</h1>
          <p className="text-slate-400 text-[13px] mt-1">
            Create, edit, organize, filter and maintain live projects showcased across your portfolio.
          </p>
        </div>

        {/* Pulse Stats Card (Matching Photo 2) */}
        <div className="bg-[#0a111c] border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-6 shadow-premium">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">TOTAL</span>
            <span className="text-xl font-bold text-white">{projects.length}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">ACTIVE</span>
            <span className="text-xl font-bold text-emerald-400">{activeProjectsCount}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">PULSE</span>
            <div className="flex items-center gap-2 mt-1">
              <svg className="w-16 h-5 text-cyan-400" viewBox="0 0 64 20" fill="none">
                <path
                  d="M0 10 L15 10 L22 3 L30 17 L38 7 L45 13 L52 10 L64 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
            </div>
          </div>
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
                    Step {currentStep} of 5
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {editingId
                    ? 'Update project details across 5 organized steps.'
                    : 'Complete the 5 quick steps below to showcase a new live project with an in-depth case study.'}
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

          {/* Stepper Progress Bar & Stage Indicator */}
          <div className="space-y-3">
            {/* Visual Step Progress Slider */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 transition-all duration-300 ease-out shadow-sm shadow-cyan-400"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>

            {/* Stepper Buttons (5 steps) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { num: 1, title: 'Core Info', desc: 'Title & Category' },
                { num: 2, title: 'Description', desc: 'Project Overview' },
                { num: 3, title: 'Tech Stack', desc: 'Tags & Links' },
                { num: 4, title: 'Media', desc: 'Cover & Status' },
                { num: 5, title: 'Case Study', desc: 'Problem & Result' }
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => handleJumpToStep(s.num)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    currentStep === s.num
                      ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/15'
                      : currentStep > s.num
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-300 hover:border-emerald-500/50'
                      : 'border-white/10 bg-black/40 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                      currentStep === s.num
                        ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                        : currentStep > s.num
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {currentStep > s.num ? <i className="fa-solid fa-check text-[10px]"></i> : `0${s.num}`}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${currentStep === s.num ? 'text-white' : 'text-slate-300'}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: Core Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <i className="fa-solid fa-file-lines text-cyan-400"></i>
                  <span>Project Identity & Classification</span>
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
            </div>
          )}

          {/* STEP 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <i className="fa-solid fa-align-left text-cyan-400"></i>
                  <span>Project Overview & Short Description</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Required field marked with *</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-mono text-xs text-slate-300 font-semibold">
                    Project Overview Description *
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    {form.shortDescription.length} characters (min 10)
                  </span>
                </div>
                <textarea
                  rows="6"
                  value={form.shortDescription}
                  onChange={(e) => {
                    setForm({ ...form, shortDescription: e.target.value });
                    if (errors.shortDescription) setErrors((prev) => ({ ...prev, shortDescription: '' }));
                  }}
                  placeholder="Describe the application value proposition, core engineering highlights, and primary user workflow. This is shown on project cards and hero sections..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 shadow-inner"
                />
                <FormErrorMessage message={errors.shortDescription} />
                <p className="text-[11px] text-slate-400 mt-2">
                  This summary appears on the public Projects listing page and home highlights. The deep technical case study is authored in Step 05.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Tech Stack & Links */}
          {currentStep === 3 && (
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

          {/* STEP 4: Media, Visibility & Live Card Preview */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <i className="fa-solid fa-photo-film text-cyan-400"></i>
                  <span>Media Upload, Visibility & Card Preview</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Step 4 of 5</span>
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
                        {(form.caseStudy?.problem || form.caseStudy?.result?.summary) && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 backdrop-blur-md">
                            📖 Case Study
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

          {/* STEP 5: Case Study (Detailed Engineering Breakdown) */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-2 gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <i className="fa-solid fa-book-open text-cyan-400"></i>
                  <span>Engineering Case Study (Problem → Approach → Tech Decisions → Result → Learnings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Optional / Skip Available
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Authoring Sections */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Problem Section */}
                  <div className="space-y-2 p-4 rounded-2xl border border-white/10 bg-black/30">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">1</span>
                        <span>The Problem Statement</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-slate-400">
                          {(form.caseStudy?.problem || '').length}/5000 chars
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMarkdownPreview('problem')}
                          className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {markdownPreviews.problem ? 'Edit Markdown' : 'Preview MD'}
                        </button>
                      </div>
                    </div>
                    {markdownPreviews.problem ? (
                      <div className="markdown-body p-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300 min-h-[100px]">
                        <MarkdownView content={form.caseStudy?.problem || '*No problem statement entered yet.*'} />
                      </div>
                    ) : (
                      <textarea
                        rows="4"
                        value={form.caseStudy?.problem || ''}
                        onChange={(e) => handleCaseStudyChange('problem', e.target.value)}
                        placeholder="Explain the real-world friction, scaling challenge, or user need that required solving (supports Markdown)..."
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 font-mono"
                      />
                    )}
                    <FormErrorMessage message={errors.csProblem} />
                  </div>

                  {/* Approach Section */}
                  <div className="space-y-2 p-4 rounded-2xl border border-white/10 bg-black/30">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">2</span>
                        <span>Engineering Approach</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-slate-400">
                          {(form.caseStudy?.approach || '').length}/5000 chars
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMarkdownPreview('approach')}
                          className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {markdownPreviews.approach ? 'Edit Markdown' : 'Preview MD'}
                        </button>
                      </div>
                    </div>
                    {markdownPreviews.approach ? (
                      <div className="markdown-body p-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300 min-h-[100px]">
                        <MarkdownView content={form.caseStudy?.approach || '*No approach statement entered yet.*'} />
                      </div>
                    ) : (
                      <textarea
                        rows="4"
                        value={form.caseStudy?.approach || ''}
                        onChange={(e) => handleCaseStudyChange('approach', e.target.value)}
                        placeholder="Detail how you partitioned the architecture, phased milestones, and solved challenges (supports Markdown)..."
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 font-mono"
                      />
                    )}
                    <FormErrorMessage message={errors.csApproach} />
                  </div>

                  {/* Tech Decisions Section */}
                  <div className="space-y-2 p-4 rounded-2xl border border-white/10 bg-black/30">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">3</span>
                        <span>Tech Decisions & Architectural Trade-offs</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-slate-400">
                          {(form.caseStudy?.techDecisions || '').length}/5000 chars
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMarkdownPreview('techDecisions')}
                          className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {markdownPreviews.techDecisions ? 'Edit Markdown' : 'Preview MD'}
                        </button>
                      </div>
                    </div>
                    {markdownPreviews.techDecisions ? (
                      <div className="markdown-body p-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300 min-h-[100px]">
                        <MarkdownView content={form.caseStudy?.techDecisions || '*No tech decisions entered yet.*'} />
                      </div>
                    ) : (
                      <textarea
                        rows="4"
                        value={form.caseStudy?.techDecisions || ''}
                        onChange={(e) => handleCaseStudyChange('techDecisions', e.target.value)}
                        placeholder="Explain WHY you chose Node HTTP vs Express, MongoDB vs PostgreSQL, or React vs Next.js — highlight trade-offs..."
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 font-mono"
                      />
                    )}
                    <FormErrorMessage message={errors.csTech} />
                  </div>

                  {/* Result & Metrics Section */}
                  <div className="space-y-4 p-4 rounded-2xl border border-white/10 bg-black/30">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">4</span>
                        <span>Result & Measurable Outcomes</span>
                      </label>
                      <span className="font-mono text-[10px] text-slate-400">
                        {(form.caseStudy?.result?.summary || '').length}/5000 chars
                      </span>
                    </div>

                    <textarea
                      rows="3"
                      value={form.caseStudy?.result?.summary || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          caseStudy: {
                            ...(prev.caseStudy || DEFAULT_CASE_STUDY),
                            result: {
                              ...(prev.caseStudy?.result || {}),
                              summary: val
                            }
                          }
                        }));
                      }}
                      placeholder="High-level business & engineering impact summary..."
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 font-mono"
                    />

                    {/* Dynamic Metrics List */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                          <i className="fa-solid fa-chart-line text-cyan-400"></i>
                          <span>Key Metrics (Max 10)</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleAddMetric}
                          disabled={(form.caseStudy?.result?.metrics || []).length >= 10}
                          className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1 disabled:opacity-40"
                        >
                          <i className="fa-solid fa-plus text-[9px]"></i> Add Metric
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(form.caseStudy?.result?.metrics || []).map((m, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={m.label || ''}
                              onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                              placeholder="Metric label (e.g. API Endpoints)"
                              className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                            />
                            <input
                              type="text"
                              value={m.value || ''}
                              onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                              placeholder="Value (e.g. 15+)"
                              className="w-28 rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-cyan-300 outline-none focus:border-cyan-400 font-mono font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveMetric(idx)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs transition-all shrink-0"
                              title="Remove metric"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        ))}
                        {(!form.caseStudy?.result?.metrics || form.caseStudy.result.metrics.length === 0) && (
                          <p className="text-[11px] text-slate-500 italic font-mono py-1">
                            No metrics added yet. Click &quot;Add Metric&quot; to showcase quantitative accomplishments (e.g. 92 Lighthouse, 200+ Test Cases).
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Architecture Diagram */}
                  <div className="space-y-3 p-4 rounded-2xl border border-white/10 bg-black/30">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">5</span>
                        <span>System Architecture Diagram</span>
                      </label>
                      {form.caseStudy?.architectureDiagramUrl && (
                        <button
                          type="button"
                          onClick={() => handleCaseStudyChange('architectureDiagramUrl', '')}
                          className="font-mono text-[10px] text-red-400 hover:underline"
                        >
                          Clear Diagram
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer font-mono text-xs px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all flex items-center gap-1.5">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upload Diagram</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadArchDiagram(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={form.caseStudy?.architectureDiagramUrl || ''}
                        onChange={(e) => handleCaseStudyChange('architectureDiagramUrl', e.target.value)}
                        placeholder="Or direct diagram image URL (https://...)"
                        className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    {form.caseStudy?.architectureDiagramUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-black/60 aspect-video max-h-48">
                        <img
                          src={form.caseStudy.architectureDiagramUrl}
                          alt="Architecture diagram preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Before & After Screenshots */}
                  <div className="space-y-4 p-4 rounded-2xl border border-white/10 bg-black/30">
                    <label className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">6</span>
                      <span>Before & After Screenshots (Max 5 Each)</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Before Screenshots */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-amber-400 font-semibold">
                            &quot;Before&quot; Screenshots ({form.caseStudy?.beforeScreenshots?.length || 0}/5)
                          </span>
                          <label className="cursor-pointer font-mono text-[10px] px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20">
                            + Add Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleAddScreenshot(e.target.files[0], 'before');
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(form.caseStudy?.beforeScreenshots || []).map((imgUrl, i) => (
                            <div key={i} className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/20 group">
                              <img src={imgUrl} alt={`Before ${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveScreenshot(i, 'before')}
                                className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <i className="fa-solid fa-trash text-xs"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* After Screenshots */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                            &quot;After&quot; Screenshots ({form.caseStudy?.afterScreenshots?.length || 0}/5)
                          </span>
                          <label className="cursor-pointer font-mono text-[10px] px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                            + Add Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleAddScreenshot(e.target.files[0], 'after');
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(form.caseStudy?.afterScreenshots || []).map((imgUrl, i) => (
                            <div key={i} className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/20 group">
                              <img src={imgUrl} alt={`After ${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveScreenshot(i, 'after')}
                                className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <i className="fa-solid fa-trash text-xs"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learnings Section */}
                  <div className="space-y-2 p-4 rounded-2xl border border-white/10 bg-black/30">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">7</span>
                        <span>What I Learned (Engineering Retrospective)</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-slate-400">
                          {(form.caseStudy?.learnings || '').length}/5000 chars
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMarkdownPreview('learnings')}
                          className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {markdownPreviews.learnings ? 'Edit Markdown' : 'Preview MD'}
                        </button>
                      </div>
                    </div>
                    {markdownPreviews.learnings ? (
                      <div className="markdown-body p-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300 min-h-[100px]">
                        <MarkdownView content={form.caseStudy?.learnings || '*No learnings entered yet.*'} />
                      </div>
                    ) : (
                      <textarea
                        rows="4"
                        value={form.caseStudy?.learnings || ''}
                        onChange={(e) => handleCaseStudyChange('learnings', e.target.value)}
                        placeholder="What unexpected edge cases occurred? What would you do differently on Day 1 next time? (supports Markdown)..."
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 font-mono"
                      />
                    )}
                    <FormErrorMessage message={errors.csLearnings} />
                  </div>
                </div>

                {/* Right Column: Case Study Simulated Live Preview */}
                <div className="lg:col-span-5 space-y-4 sticky top-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-cyan-400 font-semibold flex items-center gap-1.5">
                      <i className="fa-solid fa-book-open"></i> Case Study Live Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPreviewCaseStudyModalOpen(true)}
                      className="font-mono text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Full Preview Modal</span>
                      <i className="fa-solid fa-expand text-[9px]"></i>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/30 bg-black/70 p-5 space-y-4 shadow-2xl backdrop-blur-md">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {form.category || 'Category'}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2">
                        {form.title || 'Case Study Project Title'}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {form.shortDescription || 'Short overview description...'}
                      </p>
                    </div>

                    {/* Metrics preview */}
                    {Array.isArray(form.caseStudy?.result?.metrics) && form.caseStudy.result.metrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        {form.caseStudy.result.metrics.slice(0, 4).map((m, i) => (
                          <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-sm font-bold text-cyan-300 block">{m.value || '—'}</span>
                            <span className="text-[10px] text-slate-400 truncate block">{m.label || 'Metric'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Problem excerpt */}
                    {form.caseStudy?.problem && (
                      <div className="pt-2 border-t border-white/10">
                        <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold block mb-1">
                          The Problem
                        </span>
                        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                          {form.caseStudy.problem}
                        </p>
                      </div>
                    )}

                    {/* Architecture badge */}
                    {form.caseStudy?.architectureDiagramUrl && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                          <i className="fa-solid fa-diagram-project text-cyan-400"></i> Architecture Included
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">✓ Uploaded</span>
                      </div>
                    )}

                    {/* Screenshots count */}
                    {((form.caseStudy?.beforeScreenshots?.length || 0) > 0 || (form.caseStudy?.afterScreenshots?.length || 0) > 0) && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                          <i className="fa-solid fa-images text-cyan-400"></i> Screenshots
                        </span>
                        <span className="text-[10px] font-mono text-slate-300">
                          {form.caseStudy?.beforeScreenshots?.length || 0} Before / {form.caseStudy?.afterScreenshots?.length || 0} After
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsPreviewCaseStudyModalOpen(true)}
                      className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-cyan-300 font-mono flex items-center justify-center gap-2 transition-all mt-2"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      <span>Launch Full Public Case Study Simulation</span>
                    </button>
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

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Back Button */}
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

              {/* Continue to Next Step (Steps 1 to 4) */}
              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-save flex items-center gap-2 px-6 py-2.5 text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue to Step 0{currentStep + 1}</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              )}

              {/* Step 5 Special Action Buttons */}
              {currentStep === 5 && (
                <>
                  <button
                    type="button"
                    onClick={handleSkipCaseStudy}
                    className="font-mono text-xs px-4 py-2.5 rounded-xl border border-white/15 bg-black/50 text-slate-300 hover:text-white hover:border-white/30 transition-all"
                    title="Publish or update project without case study content"
                  >
                    Skip Case Study
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreviewCaseStudyModalOpen(true)}
                    className="font-mono text-xs px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-eye"></i>
                    <span>Preview Case Study</span>
                  </button>

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
                </>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Modal: Full Public Case Study Preview Simulation */}
      {isPreviewCaseStudyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card-admin max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-8 rounded-3xl border border-cyan-500/30 custom-scrollbar shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  Public Case Study Preview
                </span>
                <span className="text-xs text-slate-400">
                  Simulating /projects/{form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'slug'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewCaseStudyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Simulated Hero */}
            <div className="space-y-4">
              {form.thumbnailUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10">
                  <img src={form.thumbnailUrl} alt={form.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold">{form.category || 'Category'}</span>
                <h1 className="text-2xl font-bold text-white mt-1">{form.title || 'Project Title'}</h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{form.shortDescription}</p>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {currentTechList.map((tech) => (
                  <span key={tech} className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Simulated Case Study Sections */}
            <div className="space-y-8 border-t border-white/10 pt-6">
              {/* Problem */}
              {form.caseStudy?.problem && (
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">01.</span> The Problem
                  </h2>
                  <div className="markdown-body p-4 rounded-2xl bg-white/5 border border-white/10 text-sm">
                    <MarkdownView content={form.caseStudy.problem} />
                  </div>
                </div>
              )}

              {/* Approach */}
              {form.caseStudy?.approach && (
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">02.</span> My Approach
                  </h2>
                  <div className="markdown-body p-4 rounded-2xl bg-white/5 border border-white/10 text-sm">
                    <MarkdownView content={form.caseStudy.approach} />
                  </div>
                </div>
              )}

              {/* Tech Decisions */}
              {form.caseStudy?.techDecisions && (
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">03.</span> Tech Decisions & Trade-offs
                  </h2>
                  <div className="markdown-body p-4 rounded-2xl bg-white/5 border border-white/10 text-sm">
                    <MarkdownView content={form.caseStudy.techDecisions} />
                  </div>
                </div>
              )}

              {/* Result & Metrics */}
              {(form.caseStudy?.result?.summary || (Array.isArray(form.caseStudy?.result?.metrics) && form.caseStudy.result.metrics.length > 0)) && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">04.</span> Result & Measurable Impact
                  </h2>
                  {form.caseStudy.result?.summary && (
                    <p className="text-sm text-slate-300 leading-relaxed">{form.caseStudy.result.summary}</p>
                  )}
                  {Array.isArray(form.caseStudy.result?.metrics) && form.caseStudy.result.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.caseStudy.result.metrics.map((m, i) => (
                        <div key={i} className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                          <span className="text-2xl font-bold text-cyan-300 block">{m.value}</span>
                          <span className="text-xs text-slate-400 block mt-1">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Before / After screenshots */}
                  {((form.caseStudy?.beforeScreenshots?.length || 0) > 0 || (form.caseStudy?.afterScreenshots?.length || 0) > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <span className="font-mono text-xs font-bold text-amber-400">Before</span>
                        <div className="space-y-2">
                          {(form.caseStudy?.beforeScreenshots || []).map((u, i) => (
                            <img key={i} src={u} alt={`Before ${i}`} className="w-full rounded-xl border border-white/10" />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">After</span>
                        <div className="space-y-2">
                          {(form.caseStudy?.afterScreenshots || []).map((u, i) => (
                            <img key={i} src={u} alt={`After ${i}`} className="w-full rounded-xl border border-white/10" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Architecture Diagram */}
              {form.caseStudy?.architectureDiagramUrl && (
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">05.</span> System Architecture
                  </h2>
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60">
                    <img src={form.caseStudy.architectureDiagramUrl} alt="Architecture" className="w-full object-contain max-h-96" />
                  </div>
                </div>
              )}

              {/* Learnings */}
              {form.caseStudy?.learnings && (
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">06.</span> What I Learned
                  </h2>
                  <div className="markdown-body p-4 rounded-2xl bg-white/5 border border-white/10 text-sm">
                    <MarkdownView content={form.caseStudy.learnings} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsPreviewCaseStudyModalOpen(false)}
                className="font-mono text-xs px-6 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
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

        {/* Search, Category, Sort & Status Tabs Bar (Matching Photo 2) */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between rounded-2xl border border-white/10 bg-[#070b12]/80 px-3.5 py-2 w-full gap-3 shadow-lg shadow-black/20">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px] max-w-sm relative flex items-center">
              <i className="fa-solid fa-magnifying-glass text-xs text-slate-400 pl-1 pr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, tech stack..."
                className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-slate-500 font-sans py-1.5"
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

            {/* Category Dropdown */}
            <div className="relative flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  playTick();
                  setSelectedCategory(e.target.value);
                }}
                className="appearance-none bg-[#050a14] border border-white/10 rounded-xl pl-3 pr-7 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 outline-none cursor-pointer transition-all"
              >
                <option value="all" className="bg-[#0b101b] text-white">
                  All Categories
                </option>
                {availableCategories
                  .filter((c) => c !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0b101b] text-white">
                      {cat}
                    </option>
                  ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => {
                  playTick();
                  setSortBy(e.target.value);
                }}
                className="appearance-none bg-[#050a14] border border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 outline-none cursor-pointer transition-all"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#0b101b] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Filter Tabs (Matching Photo 2 Right Side) */}
          <div className="flex items-center rounded-xl bg-black/40 border border-white/10 p-1 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => { playTick(); setActiveTab('all'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>All</span>
              <span className="text-[11px] font-bold text-slate-300">{counts.all}</span>
            </button>

            <button
              type="button"
              onClick={() => { playTick(); setActiveTab('active'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>Active</span>
              <span className="text-[11px] text-slate-400">{counts.active}</span>
            </button>

            <button
              type="button"
              onClick={() => { playTick(); setActiveTab('draft'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'draft'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span>Draft</span>
              <span className="text-[11px] text-slate-400">{counts.draft}</span>
            </button>

            <button
              type="button"
              onClick={() => { playTick(); setActiveTab('archived'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
              <span>Archived</span>
              <span className="text-[11px] text-slate-400">{counts.archived}</span>
            </button>
          </div>
        </div>

        {/* Action Controls when selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
            <span className="text-xs text-cyan-300 font-semibold flex items-center gap-2">
              <i className="fa-solid fa-check-circle" /> {selectedIds.length} projects selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchDelete}
                className="btn-batch-delete text-xs px-3 py-1.5"
              >
                <i className="fa-solid fa-trash-can" />
                <span>Delete Selected</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className={`group relative flex flex-col rounded-2xl border border-white/5 bg-[#0a111c] hover:border-white/20 transition-all duration-300 overflow-hidden shadow-xl ${
                    isSelected ? 'ring-2 ring-cyan-400' : ''
                  } ${
                    dragOverProjIndex === idx
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-400/20 scale-[1.01]'
                      : ''
                  } ${draggedProjIndex === idx ? 'opacity-40 cursor-grabbing' : ''}`}
                >
                  {/* Top Cover Image (Matching Photos 2 & 3) */}
                  <div className="h-48 w-full relative overflow-hidden bg-black/40">
                    {proj.thumbnailUrl ? (
                      <img
                        src={proj.thumbnailUrl}
                        alt={proj.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center text-slate-600">
                        <i className="fa-solid fa-image text-3xl"></i>
                      </div>
                    )}

                    {/* Top-Left Drag Handle Badge (Matching Photos 2 & 3) */}
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
                      className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#050a14]/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold cursor-grab active:cursor-grabbing hover:border-cyan-400/40 transition-all select-none shadow-sm"
                      title="Drag handle to reorder project"
                    >
                      <i className="fa-solid fa-grip-vertical text-slate-400 text-xs pointer-events-none" />
                      <span className="truncate max-w-[130px] pointer-events-none">{proj.title}</span>
                    </div>

                    {/* Top-Right Actions & Dropdown (Matching Photos 2 & 3) */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(proj);
                          }}
                          className="w-7 h-7 rounded-lg bg-[#050a14]/90 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 flex items-center justify-center text-xs transition-all shadow-sm"
                          title="Edit Project"
                        >
                          <i className="fa-solid fa-pen text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(proj);
                          }}
                          className="w-7 h-7 rounded-lg bg-[#050a14]/90 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 text-slate-300 hover:text-rose-400 flex items-center justify-center text-xs transition-all shadow-sm"
                          title={proj.status === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                        >
                          <i className="fa-solid fa-trash-can text-[10px]" />
                        </button>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-[#050a14]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-chevron-down text-[10px]" />
                      </div>
                    </div>

                    {/* Bottom Status Pill on Image (Matching Photos 2 & 3) */}
                    <div className="absolute right-3 bottom-3 z-10">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE DEPLOYED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          DRAFT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body Details (Matching Photos 2 & 3) */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Meta Line: PROJECT 01 + Click to Visit */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-cyan-400 tracking-wider">
                          PROJECT {indexStr}
                        </span>
                        {proj.liveDemoUrl && (
                          <a
                            href={proj.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <span>Click to Visit</span>
                            <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                          </a>
                        )}
                      </div>

                      {/* Card Title */}
                      <h4 className="text-[16px] font-bold text-white mb-1 hover:text-cyan-300 transition-colors">
                        {proj.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {proj.shortDescription || 'Interactive full-stack web application.'}
                      </p>

                      {/* Tech Stack Pills with Real Brand Icons (Matching Photos 2 & 3) */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {techList.map((tech, tIdx) => {
                          const badge = getTechBadgeData(tech);
                          return (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#050a14] border border-white/5 text-[11px] font-medium text-slate-300 hover:border-white/15 transition-colors"
                            >
                              <i className={`${badge.icon} ${badge.color}`} />
                              <span>{tech}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card Bottom Actions: Live Demo + Code Buttons (Matching Photos 2 & 3) */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <a
                        href={proj.liveDemoUrl || '#'}
                        target={proj.liveDemoUrl ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                        <span>Live Demo</span>
                      </a>
                      <a
                        href={proj.githubUrl || 'https://github.com/ayushprajapati9669-dev'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#050a14] hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all"
                      >
                        <i className="fa-brands fa-github text-xs" />
                        <span>Code</span>
                      </a>
                    </div>
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

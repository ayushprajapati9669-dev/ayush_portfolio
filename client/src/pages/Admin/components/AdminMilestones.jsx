import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { playTick } from '../../../utils/audio';
import {
  RealisticMilestoneFlagIcon,
  RealisticCheckmarkIcon,
  RealisticBullseyeIcon,
  RealisticGraduationCapIcon
} from '../../../components/common/RealisticMilestoneIcons';

// Helper for safe localStorage parsing
function safeParse(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Device info string for activity logs
function getDeviceInfo() {
  const ua = navigator.userAgent;
  const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Browser';
  const os = ua.includes('Win') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : 'OS';
  return `${browser} on ${os}`;
}

// Levenshtein edit distance for duplicate detection
function editDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

// 12 Curated Built-in Templates
const BUILTIN_TEMPLATES = [
  { id: 't1', name: 'Hackathon Win', icon: 'fa-trophy', desc: 'Won a college or national hackathon', title: '🏆 1st Place: [Hackathon Name]', meta: 'Hackathon · Achievement', status: 'completed', year: 'Year 3', tags: ['Hackathon', 'React', 'NodeJS'], progress: 100, content: '<h3>Challenge & Problem</h3><p>Built a scalable real-time solution tackling domain bottlenecks.</p><h3>Architecture</h3><p>Leveraged MERN stack with RESTful design and intuitive UI.</p><h3>Outcome</h3><p>Awarded 1st place among participating teams.</p>' },
  { id: 't2', name: 'Internship Experience', icon: 'fa-briefcase', desc: 'Software engineering internship', title: '💼 Software Engineering Intern at [Company]', meta: 'Internship · Experience', status: 'completed', year: 'Year 3', tags: ['Internship', 'FullStack'], progress: 100, content: '<h3>Role & Responsibilities</h3><p>Delivered production features, code reviews, and API integrations.</p><h3>Key Impact</h3><ul><li>Optimized response times.</li><li>Engineered modular UI components.</li></ul>' },
  { id: 't3', name: 'Open Source Contribution', icon: 'fa-code-branch', desc: 'Contributed to open-source repository', title: '🌍 Open Source: [Project Name]', meta: 'Open Source · Community', status: 'completed', year: 'Year 3', tags: ['OpenSource', 'GitHub', 'JavaScript'], progress: 100, content: '<h3>Project Scope</h3><p>Contributed bug fixes, unit tests, and performance improvements to an active open source library.</p>' },
  { id: 't4', name: 'Research Paper', icon: 'fa-file-alt', desc: 'Academic publication or paper', title: '📄 Research: [Paper Title]', meta: 'Research · Publication', status: 'completed', year: 'Year 4', tags: ['Research', 'AI/ML'], progress: 100, content: '<h3>Abstract</h3><p>Investigation into algorithmic efficiency and practical machine learning applications.</p>' },
  { id: 't5', name: 'Professional Certification', icon: 'fa-certificate', desc: 'Industry or academic cert', title: '📜 [Certification Name]', meta: 'Certification · Credential', status: 'completed', year: 'Year 3', tags: ['Certification', 'WebDev'], progress: 100, content: '<h3>Issuer & Credential</h3><p>Verified comprehensive mastery in full-stack architecture, testing, and cloud deployments.</p>' },
  { id: 't6', name: 'Production Project Launch', icon: 'fa-rocket', desc: 'Shipped a live full-stack system', title: '🚀 Launched: [Project Name]', meta: 'Project · Live Deployment', status: 'focus', year: 'Year 3', tags: ['React', 'NodeJS', 'MongoDB'], progress: 90, content: '<h3>System Overview</h3><p>Production-grade web application featuring authentication, state management, and Cloudinary media pipeline.</p>' },
  { id: 't7', name: 'Competition Honor', icon: 'fa-medal', desc: 'Academic or technical award', title: '🏅 College Website Making Winner', meta: 'Award · Distinction', status: 'completed', year: 'Year 2', tags: ['Competition', 'UI/UX'], progress: 100, content: '<h3>Award Summary</h3><p>Secured 1st place in college-wide website creation competition for exceptional UI design and code quality.</p>' },
  { id: 't8', name: 'Technical Leadership', icon: 'fa-users', desc: 'Club or community lead', title: '👥 Technical Lead at [Club/Org]', meta: 'Leadership · Mentorship', status: 'completed', year: 'Year 2', tags: ['Leadership', 'Mentorship'], progress: 100, content: '<h3>Responsibilities</h3><p>Mentored peers in web fundamentals, coordinated workshops, and conducted coding sessions.</p>' },
  { id: 't9', name: 'Conference / Meetup Talk', icon: 'fa-microphone', desc: 'Speaker or presentation', title: '🎤 Tech Talk: Modern Full-Stack Systems', meta: 'Speaking · Community', status: 'completed', year: 'Year 3', tags: ['Speaking', 'TechTalk'], progress: 100, content: '<h3>Topic</h3><p>Delivered an engaging walkthrough on building responsive MERN architectures with clean separation of concerns.</p>' },
  { id: 't10', name: 'Technical Blog Post', icon: 'fa-pen-fancy', desc: 'Article or architecture deep-dive', title: '✍️ Architecture Deep-Dive: [Title]', meta: 'Writing · Publication', status: 'completed', year: 'Year 3', tags: ['TechnicalWriting', 'Architecture'], progress: 100, content: '<h3>Overview</h3><p>Authored a comprehensive technical guide explaining API architecture and state persistence.</p>' },
  { id: 't11', name: 'Client / Freelance Delivery', icon: 'fa-laptop-code', desc: 'Commercial client project', title: '💼 Client Delivery: [Client Name]', meta: 'Freelance · Client Work', status: 'completed', year: 'Year 4', tags: ['Freelance', 'FullStack'], progress: 100, content: '<h3>Client Objectives</h3><p>Designed and delivered an end-to-end custom web presence meeting tight deadlines and performance metrics.</p>' },
  { id: 't12', name: 'Community Volunteering', icon: 'fa-hands-helping', desc: 'Social or tech volunteering', title: '❤️ Volunteer: [Initiative Name]', meta: 'Volunteering · Social Impact', status: 'completed', year: 'Year 2', tags: ['Volunteer', 'Community'], progress: 100, content: '<h3>Contribution</h3><p>Assisted in conducting digital literacy and basic coding sessions for enthusiastic learners.</p>' }
];

const PRESET_ICONS = [
  'fa-layer-group', 'fa-code', 'fa-graduation-cap', 'fa-rocket',
  'fa-database', 'fa-brain', 'fa-certificate', 'fa-laptop-code',
  'fa-trophy', 'fa-lightbulb', 'fa-award', 'fa-book-open'
];

const PRESET_COLORS = [
  '#ffffff', '#f1f5f9', '#94a3b8', '#64748b', '#0f172a',
  '#f43f5e', '#f97316', '#f59e0b', '#10b981', '#22d3ee',
  '#3b82f6', '#8b5cf6'
];

const MILESTONE_ACHIEVEMENTS = [1, 3, 5, 10, 15, 20, 25, 50, 100];

export function AdminMilestones({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal,
  onSelectTab
}) {
  const profile = appState.profile || {};
  
  // Normalize existing learningJourney items to match CMS v9 schema
  const rawJourney = useMemo(() => {
    const list = profile.learningJourney || [];
    return list.map((item, idx) => ({
      id: item.id || `m-${idx + 1}`,
      title: item.title || 'Untitled Milestone',
      desc: item.desc || item.description || item.detail || '',
      year: item.year || item.yearBadge || (idx === 0 ? 'Year 3' : idx === 1 ? 'Year 1-2' : 'Present'),
      status: item.status || (idx === 0 ? 'focus' : 'completed'),
      metaLabel: item.metaLabel || item.phase || 'Milestone',
      progress: item.progress !== undefined ? Number(item.progress) : (item.status === 'completed' ? 100 : 70),
      rating: item.rating !== undefined ? Number(item.rating) : 4,
      tags: Array.isArray(item.tags)
        ? item.tags
        : Array.isArray(item.skills)
        ? item.skills
        : item.tags
        ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : item.skills
        ? item.skills.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      icon: item.icon || 'fa-layer-group',
      image: item.image || (Array.isArray(item.images) && item.images[0]) || null,
      images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
      hdImages: Array.isArray(item.hdImages) ? item.hdImages : [],
      imageAlt: item.imageAlt || '',
      link: item.link || '',
      published: item.published !== false,
      pinned: !!item.pinned,
      spotlight: item.spotlight !== undefined ? !!item.spotlight : !!item.pinned,
      views: item.views !== undefined ? Number(item.views) : 100 + (idx * 25),
      createdAt: item.createdAt || new Date().toISOString()
    }));
  }, [profile.learningJourney]);

  const [milestones, setMilestones] = useState(rawJourney);

  // Keep local milestones in sync with incoming rawJourney
  useEffect(() => {
    setMilestones(rawJourney);
  }, [rawJourney]);


  // Persistence for trash, logs, templates, settings
  const [trash, setTrash] = useState(() => safeParse('admin_trash_v9', []));
  const [activityLog, setActivityLog] = useState(() => safeParse('admin_logs_v9', []));
  const [customTemplates, setCustomTemplates] = useState(() => safeParse('admin_templates_v9', []));
  const [theme, setTheme] = useState(() => localStorage.getItem('admin_theme_v9') || 'theme-midnight');
  const [accent, setAccent] = useState(() => localStorage.getItem('admin_accent_v9') || 'accent-cyan');
  const [density, setDensity] = useState(() => localStorage.getItem('admin_density_v9') || 'comfortable');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(() => Number(localStorage.getItem('admin_panel_width_v9')) || 360);
  const [isPiP, setIsPiP] = useState(false);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSort, setFilterSort] = useState('manual');
  const [filterTag, setFilterTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(12);

  // Right Panel: Live Portfolio Preview
  const [activeEditorId, setActiveEditorId] = useState(() => rawJourney[0]?.id || null);
  const [newTagInput, setNewTagInput] = useState('');

  // Multi-select & Bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);

  // Context Menu
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetId: null });

  // Modals visibility
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [isLinkedInOpen, setIsLinkedInOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkConfirmText, setBulkConfirmText] = useState('');
  const [isCompareActive, setIsCompareActive] = useState(false);
  const [compareIds, setCompareIds] = useState([]);

  // Voice Command Listener
  const [isVoiceCmdListening, setIsVoiceCmdListening] = useState(false);
  const [voiceCmdText, setVoiceCmdText] = useState('Listening...');
  const voiceRecognitionRef = useRef(null);

  // Wizard state (Step 1-4)
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardEditingId, setWizardEditingId] = useState(null);
  const [wizardTitle, setWizardTitle] = useState('');
  const [wizardMeta, setWizardMeta] = useState('');
  const [wizardYear, setWizardYear] = useState('Year 3');
  const [wizardStatus, setWizardStatus] = useState('focus');
  const [wizardProgress, setWizardProgress] = useState(70);
  const [wizardRating, setWizardRating] = useState(4);
  const [wizardMetric, setWizardMetric] = useState('');
  const [wizardPinned, setWizardPinned] = useState(false);
  const [wizardSpotlight, setWizardSpotlight] = useState(false);
  const [wizardTags, setWizardTags] = useState('');
  const [wizardLink, setWizardLink] = useState('');
  const [wizardIcon, setWizardIcon] = useState('fa-layer-group');
  const [wizardImageData, setWizardImageData] = useState(null);
  const [wizardImageUrl, setWizardImageUrl] = useState('');
  const [wizardImageAlt, setWizardImageAlt] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [duplicateOverride, setDuplicateOverride] = useState(false);
  const [aiCategorySuggestion, setAiCategorySuggestion] = useState(null);
  const [isWizardSaving, setIsWizardSaving] = useState(false);
  const [wizardDesc, setWizardDesc] = useState('');

  // Rich Text Editor ref and stats
  const rteEditorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#22d3ee');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRteVoiceListening, setIsRteVoiceListening] = useState(false);
  const rteRecognitionRef = useRef(null);

  // Sync wizardDesc to rteEditorRef when Step 2 mounts
  useEffect(() => {
    if (wizardStep === 2 && rteEditorRef.current) {
      rteEditorRef.current.innerHTML = wizardDesc || '';
      updateRteStats();
    }
  }, [wizardStep]);

  // Drag and drop state for milestone cards
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Resize handle for Live Preview Right Panel
  const isResizingRef = useRef(false);
  const scrollContainerRef = useRef(null);
  const canvasRef = useRef(null);


  // Save full state to backend and localStorage
  const persistMilestones = useCallback((updatedList, actionName, actionDetails) => {
    setMilestones(updatedList);
    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        learningJourney: updatedList
      }
    }), session?.token);

    if (actionName) {
      const newLog = {
        id: Date.now(),
        action: actionName,
        details: actionDetails,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        device: getDeviceInfo()
      };
      setActivityLog((prev) => {
        const next = [newLog, ...prev].slice(0, 50);
        try { localStorage.setItem('admin_logs_v9', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }

    try {
      localStorage.setItem('admin_milestones_v9', JSON.stringify(updatedList));
    } catch (e) {}
  }, [updateAppState, session]);

  // Ensure activeEditorId points to a valid milestone
  useEffect(() => {
    if ((!activeEditorId || !milestones.some((m) => m.id === activeEditorId)) && milestones.length > 0) {
      setActiveEditorId(milestones[0].id);
    }
  }, [milestones, activeEditorId]);

  const activeEditorMilestone = useMemo(() => {
    if (!activeEditorId) return milestones[0] || null;
    return milestones.find((m) => m.id === activeEditorId) || milestones[0] || null;
  }, [activeEditorId, milestones]);

  // Live Inline field updater for the right panel editor
  const handleUpdateActiveField = useCallback((field, value) => {
    if (!activeEditorId) return;
    const updatedList = milestones.map((m) => {
      if (m.id === activeEditorId) {
        return { ...m, [field]: value };
      }
      return m;
    });
    persistMilestones(updatedList, 'Inline Edit Milestone', `Updated ${field} for milestone ${activeEditorId}`);
  }, [activeEditorId, milestones, persistMilestones]);

  // Add Tag in live editor
  const handleAddActiveTag = useCallback((newTag) => {
    if (!activeEditorId || !newTag.trim()) return;
    const trimmed = newTag.trim();
    const updatedList = milestones.map((m) => {
      if (m.id === activeEditorId) {
        const currentTags = Array.isArray(m.tags) ? m.tags : [];
        if (currentTags.includes(trimmed)) return m;
        return { ...m, tags: [...currentTags, trimmed] };
      }
      return m;
    });
    persistMilestones(updatedList, 'Add Tag', `Added tag "${trimmed}" to milestone ${activeEditorId}`);
  }, [activeEditorId, milestones, persistMilestones]);

  // Remove Tag in live editor
  const handleRemoveActiveTag = useCallback((tagToRemove) => {
    if (!activeEditorId) return;
    const updatedList = milestones.map((m) => {
      if (m.id === activeEditorId) {
        const currentTags = Array.isArray(m.tags) ? m.tags : [];
        return { ...m, tags: currentTags.filter((t) => t !== tagToRemove) };
      }
      return m;
    });
    persistMilestones(updatedList, 'Remove Tag', `Removed tag "${tagToRemove}" from milestone ${activeEditorId}`);
  }, [activeEditorId, milestones, persistMilestones]);

  // Quick Tech Tag filter toggle
  const handleToggleQuickTag = useCallback((tag) => {
    playTick();
    setFilterTag((prev) => (prev.toLowerCase() === tag.toLowerCase() ? '' : tag));
  }, []);

  // Category presentation mapping matching Photos 1-5
  const getCategoryPresentation = useCallback((m) => {
    const meta = (m.metaLabel || '').toLowerCase();
    const title = (m.title || '').toLowerCase();

    if (meta.includes('workshop') || title.includes('workshop') || title.includes('speaker') || title.includes('bootcamp')) {
      return {
        type: 'WORKSHOP',
        bg: 'rgba(244, 63, 94, 0.12)',
        border: 'rgba(244, 63, 94, 0.3)',
        text: '#fb7185',
        icon: 'fa-solid fa-chalkboard-user'
      };
    }
    if (meta.includes('internship') || title.includes('intern') || meta.includes('experience')) {
      return {
        type: 'INTERNSHIP',
        bg: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.3)',
        text: '#60a5fa',
        icon: 'fa-solid fa-briefcase'
      };
    }
    if (meta.includes('award') || meta.includes('achievement') || title.includes('1st place') || title.includes('hackathon') || title.includes('winner')) {
      return {
        type: 'AWARD',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
        text: '#fbbf24',
        icon: 'fa-solid fa-trophy'
      };
    }
    if (meta.includes('project') || title.includes('launched') || title.includes('built')) {
      return {
        type: 'PROJECT',
        bg: 'rgba(34, 211, 238, 0.12)',
        border: 'rgba(34, 211, 238, 0.3)',
        text: '#22d3ee',
        icon: 'fa-solid fa-rocket'
      };
    }
    if (meta.includes('cert') || title.includes('cert')) {
      return {
        type: 'CERTIFICATE',
        bg: 'rgba(168, 85, 247, 0.12)',
        border: 'rgba(168, 85, 247, 0.3)',
        text: '#c084fc',
        icon: 'fa-solid fa-certificate'
      };
    }
    return {
      type: (m.metaLabel || 'MILESTONE').toUpperCase(),
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.3)',
      text: '#38bdf8',
      icon: m.icon?.startsWith('fa-') && !m.icon.includes(' ') ? `fa-solid ${m.icon}` : (m.icon || 'fa-solid fa-layer-group')
    };
  }, []);

  // Log activity helper
  const logActivity = useCallback((action, details) => {
    const newLog = {
      id: Date.now(),
      action,
      details,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      device: getDeviceInfo()
    };
    setActivityLog((prev) => {
      const next = [newLog, ...prev].slice(0, 50);
      try { localStorage.setItem('admin_logs_v9', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  // BroadcastChannel sync across tabs
  useEffect(() => {
    let bc = null;
    try {
      bc = new BroadcastChannel('admin_sync_v9');
      bc.onmessage = (e) => {
        if (e.data?.type === 'sync' && e.data.milestones) {
          setMilestones(e.data.milestones);
          if (e.data.trash) setTrash(e.data.trash);
          if (e.data.logs) setActivityLog(e.data.logs);
        }
      };
    } catch (e) {}
    return () => {
      if (bc) bc.close();
    };
  }, []);

  // Listen for sidebar and header custom events
  useEffect(() => {
    const handleCustomModal = (e) => {
      const modal = e.detail?.modal;
      if (modal === 'recycleBin') setIsRecycleBinOpen(true);
      else if (modal === 'activityLog') setIsActivityOpen(true);
      else if (modal === 'linkedin') setIsLinkedInOpen(true);
      else if (modal === 'github') setIsGitHubOpen(true);
    };

    const handleThemeEvent = (e) => {
      if (e.detail?.theme) setTheme(e.detail.theme);
    };

    const handleAccentEvent = (e) => {
      if (e.detail?.accent) setAccent(e.detail.accent);
    };

    const handleDensityEvent = (e) => {
      if (e.detail?.density) setDensity(e.detail.density);
    };

    const handleVoiceEvent = () => {
      toggleVoiceCommand();
    };

    const handleShortcutsEvent = () => {
      setIsShortcutsOpen(true);
    };

    const handleCmdPaletteEvent = () => {
      setIsCommandPaletteOpen(true);
    };

    window.addEventListener('ams-open-modal', handleCustomModal);
    window.addEventListener('admin-theme-changed', handleThemeEvent);
    window.addEventListener('admin-accent-changed', handleAccentEvent);
    window.addEventListener('admin-density-changed', handleDensityEvent);
    window.addEventListener('ams-toggle-voice', handleVoiceEvent);
    window.addEventListener('ams-open-shortcuts', handleShortcutsEvent);
    window.addEventListener('ams-open-command-palette', handleCmdPaletteEvent);

    return () => {
      window.removeEventListener('ams-open-modal', handleCustomModal);
      window.removeEventListener('admin-theme-changed', handleThemeEvent);
      window.removeEventListener('admin-accent-changed', handleAccentEvent);
      window.removeEventListener('admin-density-changed', handleDensityEvent);
      window.removeEventListener('ams-toggle-voice', handleVoiceEvent);
      window.removeEventListener('ams-open-shortcuts', handleShortcutsEvent);
      window.removeEventListener('ams-open-command-palette', handleCmdPaletteEvent);
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
        setIsCommandPaletteOpen(false);
        setIsShortcutsOpen(false);
        setIsCompareActive(false);
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        e.preventDefault();
        openNewWizard();
      } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme & Accent setters
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.body.classList.remove('theme-midnight', 'theme-light', 'theme-ocean', 'theme-forest', 'theme-sunset');
    document.body.classList.add(newTheme);
    try { localStorage.setItem('admin_theme_v9', newTheme); } catch (e) {}
    window.dispatchEvent(new CustomEvent('admin-theme-changed', { detail: { theme: newTheme } }));
    showToast(`Switched theme to ${newTheme.replace('theme-', '')}`, 'fa-palette');
  };

  const changeAccent = (newAccent) => {
    setAccent(newAccent);
    document.body.classList.remove('accent-cyan', 'accent-violet', 'accent-rose', 'accent-emerald', 'accent-amber', 'accent-pink');
    document.body.classList.add(newAccent);
    try { localStorage.setItem('admin_accent_v9', newAccent); } catch (e) {}
    window.dispatchEvent(new CustomEvent('admin-accent-changed', { detail: { accent: newAccent } }));
    showToast('Updated accent color', 'fa-sparkles');
  };

  const changeDensity = (newDensity) => {
    setDensity(newDensity);
    if (newDensity === 'compact') document.body.classList.add('compact');
    else document.body.classList.remove('compact');
    try { localStorage.setItem('admin_density_v9', newDensity); } catch (e) {}
    window.dispatchEvent(new CustomEvent('admin-density-changed', { detail: { density: newDensity } }));
  };

  // Canvas Confetti Celebration
  const triggerConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.classList.add('active');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#22d3ee', '#3b82f6', '#a78bfa', '#f43f5e', '#f59e0b', '#10b981'];
    const particles = [];
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      frame++;
      if (frame < 180) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
        canvas.classList.remove('active');
      }
    };
    animate();
  }, []);

  // Sync Focus Mode with document.body classList
  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    return () => {
      document.body.classList.remove('focus-mode');
    };
  }, [isFocusMode]);

  const checkAchievement = useCallback((newCount) => {
    if (MILESTONE_ACHIEVEMENTS.includes(newCount)) {
      triggerConfetti();
      showToast(`🎉 Achievement Unlocked: ${newCount} milestones in portfolio!`, 'fa-trophy');
    }
  }, [triggerConfetti, showToast]);

  // Voice Command System
  const toggleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Speech recognition is not supported in this browser.', 'fa-triangle-exclamation');
      return;
    }
    if (isVoiceCmdListening) {
      if (voiceRecognitionRef.current) voiceRecognitionRef.current.stop();
      setIsVoiceCmdListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    voiceRecognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceCmdListening(true);
      setVoiceCmdText('Listening for command...');
      showToast('Voice Command activated: Try "New milestone" or "Search React"', 'fa-microphone');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      setVoiceCmdText(`"${transcript}"`);
      processVoiceCommand(transcript);
    };

    recognition.onerror = () => {
      setIsVoiceCmdListening(false);
    };

    recognition.onend = () => {
      setIsVoiceCmdListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = (cmd) => {
    if (cmd.includes('new milestone') || cmd.includes('create milestone')) {
      openNewWizard();
      if (voiceRecognitionRef.current) voiceRecognitionRef.current.stop();
    } else if (cmd.includes('search')) {
      const term = cmd.replace(/search\s*(for)?/, '').trim();
      setSearchQuery(term);
    } else if (cmd.includes('recycle') || cmd.includes('trash')) {
      setIsRecycleBinOpen(true);
    } else if (cmd.includes('activity')) {
      setIsActivityOpen(true);
    } else if (cmd.includes('templates')) {
      setIsTemplatesOpen(true);
    } else if (cmd.includes('focus')) {
      setIsFocusMode((prev) => !prev);
    } else if (cmd.includes('stop') || cmd.includes('cancel')) {
      if (voiceRecognitionRef.current) voiceRecognitionRef.current.stop();
      setIsVoiceCmdListening(false);
    }
  };

  // Filter and sort milestones
  const filteredMilestones = useMemo(() => {
    let result = milestones.filter((m) => {
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      const matchYear = filterYear === 'all' || m.year === filterYear;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        m.title.toLowerCase().includes(query) ||
        m.desc.toLowerCase().includes(query) ||
        (m.tags && m.tags.some((t) => t.toLowerCase().includes(query))) ||
        (m.metaLabel && m.metaLabel.toLowerCase().includes(query));
      const tagQuery = filterTag.toLowerCase().trim();
      const matchTag = !tagQuery || (m.tags && m.tags.some((t) => t.toLowerCase().includes(tagQuery)));
      return matchStatus && matchYear && matchSearch && matchTag;
    });

    if (filterSort === 'az') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filterSort === 'oldest') {
      result.sort((a, b) => (a.id > b.id ? 1 : -1));
    } else if (filterSort === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (filterSort === 'newest') {
      result.sort((a, b) => (a.id < b.id ? 1 : -1));
    }
    // When filterSort === 'manual', preserve exact natural array order!

    // Always sort pinned to top
    result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return result;
  }, [milestones, filterStatus, filterYear, filterSort, filterTag, searchQuery]);

  // Stats calculation
  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const focusCount = milestones.filter((m) => m.status === 'focus').length;
  const spotlightCount = milestones.filter((m) => m.spotlight || m.pinned).length;

  // Card Multi-select
  const handleToggleSelect = (id, e) => {
    const updated = new Set(selectedIds);
    if (e.shiftKey && lastSelectedId) {
      const lastIdx = milestones.findIndex((m) => m.id === lastSelectedId);
      const curIdx = milestones.findIndex((m) => m.id === id);
      const start = Math.min(lastIdx, curIdx);
      const end = Math.max(lastIdx, curIdx);
      for (let i = start; i <= end; i++) {
        updated.add(milestones[i].id);
      }
    } else {
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
    }
    setLastSelectedId(id);
    setSelectedIds(updated);
  };

  // Drag and Drop reordering by milestone ID
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetId) return;

    const fromIdx = milestones.findIndex((m) => m.id === draggedId);
    const toIdx = milestones.findIndex((m) => m.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const updated = [...milestones];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setFilterSort('manual');
    persistMilestones(updated, 'Reorder', `Reordered "${moved.title}" to position ${toIdx + 1}`);
    showToast(`Reordered "${moved.title}"`, 'fa-arrow-down-up-across-line');
  };

  // Card Actions
  const handleTogglePin = (id) => {
    playTick();
    const updated = milestones.map((m) => {
      if (m.id === id) {
        return { ...m, pinned: !m.pinned };
      }
      return m;
    });
    const target = milestones.find((m) => m.id === id);
    persistMilestones(updated, 'Pin', `${target?.pinned ? 'Unpinned' : 'Pinned'} "${target?.title}"`);
    showToast(`${target?.pinned ? 'Unpinned' : 'Pinned'} milestone to top`, 'fa-thumbtack');
  };

  const handleToggleSpotlight = (id) => {
    playTick();
    const target = milestones.find((m) => m.id === id);
    const newSpotlight = !(target?.spotlight ?? target?.pinned);
    const updated = milestones.map((m) => {
      if (m.id === id) {
        return { ...m, spotlight: newSpotlight, pinned: newSpotlight };
      }
      return m;
    });
    persistMilestones(updated, 'Spotlight Toggle', `${newSpotlight ? 'Featured' : 'Removed from'} Spotlight: "${target?.title}"`);
    showToast(newSpotlight ? 'Featured in Public Spotlight Carousel!' : 'Removed from Spotlight Carousel', 'fa-trophy');
  };

  const handleMoveUp = (id) => {
    playTick();
    const idx = milestones.findIndex((m) => m.id === id);
    if (idx > 0) {
      const updated = [...milestones];
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      setFilterSort('manual');
      persistMilestones(updated, 'Move Up', `Moved "${temp.title}" up`);
      showToast('Moved up', 'fa-arrow-up');
    }
  };

  const handleMoveDown = (id) => {
    playTick();
    const idx = milestones.findIndex((m) => m.id === id);
    if (idx < milestones.length - 1 && idx !== -1) {
      const updated = [...milestones];
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      setFilterSort('manual');
      persistMilestones(updated, 'Move Down', `Moved "${temp.title}" down`);
      showToast('Moved down', 'fa-arrow-down');
    }
  };

  const handleTogglePublish = (id, checked) => {
    playTick();
    const updated = milestones.map((m) => (m.id === id ? { ...m, published: checked } : m));
    const target = milestones.find((m) => m.id === id);
    persistMilestones(updated, 'Publish Toggle', `Set "${target?.title}" to ${checked ? 'Live' : 'Draft'}`);
    showToast(checked ? 'Milestone published live' : 'Milestone converted to draft', checked ? 'fa-check' : 'fa-eye-slash');
  };

  const handleDuplicate = (id) => {
    playTick();
    const target = milestones.find((m) => m.id === id);
    if (!target) return;
    const copy = {
      ...target,
      id: `m-${Date.now()}`,
      title: `${target.title} (Copy)`,
      published: false,
      pinned: false,
      views: 0
    };
    const idx = milestones.findIndex((m) => m.id === id);
    const updated = [...milestones];
    updated.splice(idx + 1, 0, copy);
    persistMilestones(updated, 'Duplicate', `Duplicated "${target.title}"`);
    showToast(`Duplicated "${target.title}"`, 'fa-copy');
  };

  const handlePromptDelete = (id) => {
    playTick();
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    const target = milestones.find((m) => m.id === deleteTargetId);
    if (!target) return;
    const updated = milestones.filter((m) => m.id !== deleteTargetId);
    const trashItem = { ...target, deletedAt: Date.now() };
    const nextTrash = [trashItem, ...trash];
    setTrash(nextTrash);
    try { localStorage.setItem('admin_trash_v9', JSON.stringify(nextTrash)); } catch (e) {}
    persistMilestones(updated, 'Delete', `Moved "${target.title}" to Recycle Bin`);
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
    showToast(`Moved "${target.title}" to Recycle Bin`, 'fa-trash-can');
  };

  const restoreFromTrash = (id) => {
    playTick();
    const item = trash.find((t) => t.id === id);
    if (!item) return;
    const nextTrash = trash.filter((t) => t.id !== id);
    setTrash(nextTrash);
    try { localStorage.setItem('admin_trash_v9', JSON.stringify(nextTrash)); } catch (e) {}
    const cleanItem = { ...item };
    delete cleanItem.deletedAt;
    const updated = [cleanItem, ...milestones];
    persistMilestones(updated, 'Restore', `Restored "${item.title}" from Recycle Bin`);
    showToast(`Restored "${item.title}"!`, 'fa-arrow-rotate-left');
  };

  const permanentlyDeleteFromTrash = (id) => {
    playTick();
    const item = trash.find((t) => t.id === id);
    if (!item) return;
    const nextTrash = trash.filter((t) => t.id !== id);
    setTrash(nextTrash);
    try { localStorage.setItem('admin_trash_v9', JSON.stringify(nextTrash)); } catch (e) {}
    showToast(`Permanently deleted "${item.title}"`, 'fa-trash');
  };

  const emptyTrash = () => {
    if (trash.length === 0) return;
    playTick();
    if (window.confirm(`Permanently delete all ${trash.length} items from the Recycle Bin? This action cannot be undone.`)) {
      setTrash([]);
      try { localStorage.setItem('admin_trash_v9', JSON.stringify([])); } catch (e) {}
      showToast('Recycle Bin emptied', 'fa-trash');
    }
  };

  const restoreAllFromTrash = () => {
    if (trash.length === 0) return;
    playTick();
    const restoredItems = trash.map((t) => {
      const copy = { ...t };
      delete copy.deletedAt;
      return copy;
    });
    const updated = [...restoredItems, ...milestones];
    setTrash([]);
    try { localStorage.setItem('admin_trash_v9', JSON.stringify([])); } catch (e) {}
    persistMilestones(updated, 'Restore All', `Restored ${restoredItems.length} items from Recycle Bin`);
    showToast(`Restored all ${restoredItems.length} items!`, 'fa-arrow-rotate-left');
  };

  // Inline Title Editing on Double Click
  const handleStartInlineEdit = (id, currentTitle) => {
    playTick();
    const newTitle = prompt('Edit milestone title:', currentTitle);
    if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
      const updated = milestones.map((m) => (m.id === id ? { ...m, title: newTitle.trim() } : m));
      persistMilestones(updated, 'Inline Edit', `Renamed milestone to "${newTitle.trim()}"`);
      showToast('Title updated', 'fa-check');
    }
  };

  // Bulk Actions
  const handleBulkComplete = () => {
    if (selectedIds.size === 0) return;
    playTick();
    const updated = milestones.map((m) => (selectedIds.has(m.id) ? { ...m, status: 'completed', progress: 100 } : m));
    persistMilestones(updated, 'Bulk Complete', `Marked ${selectedIds.size} milestones as completed`);
    showToast(`Marked ${selectedIds.size} milestones as Completed`, 'fa-check-double');
    setSelectedIds(new Set());
  };

  const handleBulkDeletePrompt = () => {
    if (selectedIds.size === 0) return;
    playTick();
    setBulkConfirmText('');
    setIsBulkDeleteModalOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    if (bulkConfirmText !== 'DELETE') return;
    playTick();
    const removedItems = milestones.filter((m) => selectedIds.has(m.id)).map((m) => ({ ...m, deletedAt: Date.now() }));
    const updated = milestones.filter((m) => !selectedIds.has(m.id));
    const nextTrash = [...removedItems, ...trash];
    setTrash(nextTrash);
    try { localStorage.setItem('admin_trash_v9', JSON.stringify(nextTrash)); } catch (e) {}
    persistMilestones(updated, 'Bulk Delete', `Deleted ${selectedIds.size} milestones`);
    showToast(`Moved ${selectedIds.size} milestones to Recycle Bin`, 'fa-trash-can');
    setSelectedIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  // Compare Action
  const handleAddToCompare = (id) => {
    playTick();
    let nextCompare = [...compareIds];
    if (nextCompare.includes(id)) {
      nextCompare = nextCompare.filter((item) => item !== id);
    } else {
      if (nextCompare.length >= 2) nextCompare.shift();
      nextCompare.push(id);
    }
    setCompareIds(nextCompare);
    if (nextCompare.length === 2) {
      setIsCompareActive(true);
    } else {
      showToast('1 item selected. Select a second milestone to compare.', 'fa-columns');
    }
  };

  // Right-Click Context Menu
  const handleContextMenu = (e, id) => {
    e.preventDefault();
    playTick();
    const clickX = Math.min(e.clientX, window.innerWidth - 220);
    const clickY = Math.min(e.clientY, window.innerHeight - 380);
    setContextMenu({ visible: true, x: clickX, y: clickY, targetId: id });
  };

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => handleCloseContextMenu();
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [handleCloseContextMenu]);

  // Context Menu Execution
  const executeContextAction = (action) => {
    const id = contextMenu.targetId;
    handleCloseContextMenu();
    if (!id) return;

    if (action === 'edit') {
      openEditWizard(id);
    } else if (action === 'duplicate') {
      handleDuplicate(id);
    } else if (action === 'compare') {
      handleAddToCompare(id);
    } else if (action === 'pin') {
      handleTogglePin(id);
    } else if (action === 'copyLink') {
      const url = `${window.location.origin}/about#milestone-${id}`;
      navigator.clipboard.writeText(url).then(() => showToast('Milestone anchor link copied!', 'fa-link'));
    } else if (action === 'share') {
      const target = milestones.find((m) => m.id === id);
      if (navigator.share && target) {
        navigator.share({ title: target.title, text: target.desc, url: window.location.href });
      } else {
        navigator.clipboard.writeText(`${window.location.origin}/about#milestone-${id}`);
        showToast('Link copied to clipboard', 'fa-share-nodes');
      }
    } else if (action === 'saveTemplate') {
      saveMilestoneAsTemplate(id);
    } else if (action === 'moveUp') {
      handleMoveUp(id);
    } else if (action === 'moveDown') {
      handleMoveDown(id);
    } else if (action === 'delete') {
      handlePromptDelete(id);
    }
  };

  // Save Milestone as Template
  const saveMilestoneAsTemplate = (id) => {
    const m = milestones.find((x) => x.id === id);
    if (!m) return;
    const name = prompt('Enter a template name:', m.title);
    if (!name) return;
    const newTmpl = {
      id: `tmpl-${Date.now()}`,
      isCustom: true,
      name,
      icon: m.icon,
      desc: 'Custom user template',
      title: m.title,
      meta: m.metaLabel,
      status: m.status,
      year: m.year,
      tags: m.tags,
      progress: m.progress,
      content: m.desc
    };
    const nextTemplates = [newTmpl, ...customTemplates];
    setCustomTemplates(nextTemplates);
    try { localStorage.setItem('admin_templates_v9', JSON.stringify(nextTemplates)); } catch (e) {}
    showToast(`Template "${name}" saved to library!`, 'fa-bookmark');
  };

  // Wizard Open & Setup
  const openNewWizard = () => {
    playTick();
    setWizardEditingId(null);
    setWizardStep(1);
    setWizardTitle('');
    setWizardMeta('');
    setWizardYear('Year 3');
    setWizardStatus('focus');
    setWizardProgress(70);
    setWizardRating(4);
    setWizardMetric('');
    setWizardPinned(true);
    setWizardSpotlight(true);
    setWizardTags('');
    setWizardLink('');
    setWizardIcon('fa-layer-group');
    setWizardImageData(null);
    setWizardImageUrl('');
    setWizardImageAlt('');
    setDuplicateWarning(null);
    setDuplicateOverride(false);
    setAiCategorySuggestion(null);
    setWizardDesc('');
    if (rteEditorRef.current) rteEditorRef.current.innerHTML = '';
    setWordCount(0);
    setCharCount(0);
    setIsWizardOpen(true);
  };

  const openEditWizard = (id) => {
    playTick();
    const m = milestones.find((x) => x.id === id);
    if (!m) return;
    setWizardEditingId(id);
    setWizardStep(1);
    setWizardTitle(m.title);
    setWizardMeta(m.metaLabel || '');
    setWizardYear(m.year || 'Year 3');
    setWizardStatus(m.status || 'focus');
    setWizardProgress(m.progress || 0);
    setWizardRating(m.rating || 0);
    setWizardMetric(m.metric || '');
    setWizardPinned(Boolean(m.pinned || m.spotlight));
    setWizardSpotlight(Boolean(m.spotlight ?? m.pinned));
    setWizardTags(m.tags ? m.tags.join(', ') : '');
    setWizardLink(m.link || '');
    setWizardIcon(m.icon || 'fa-layer-group');
    setWizardImageData(m.image || null);
    setWizardImageUrl(typeof m.image === 'string' && (m.image.startsWith('http') || m.image.startsWith('/images/')) ? m.image : '');
    setWizardImageAlt(m.imageAlt || '');
    setDuplicateWarning(null);
    setDuplicateOverride(false);
    setAiCategorySuggestion(null);
    const initialDesc = m.desc || m.description || m.detail || '';
    setWizardDesc(initialDesc);
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
    setWizardEditingId(null);
    setDuplicateWarning(null);
    setDuplicateOverride(false);
    if (rteRecognitionRef.current) {
      rteRecognitionRef.current.stop();
      setIsRteVoiceListening(false);
    }
  };

  // Duplicate Check logic
  const checkDuplicate = (titleInput) => {
    if (duplicateOverride) return false;
    const titleLower = titleInput.toLowerCase().trim();
    if (!titleLower) return false;
    for (const m of milestones) {
      if (wizardEditingId && m.id === wizardEditingId) continue;
      const sim = stringSimilarity(titleLower, m.title.toLowerCase());
      if (sim > 0.65) {
        setDuplicateWarning({
          milestone: m,
          similarity: Math.round(sim * 100)
        });
        return true;
      }
    }
    setDuplicateWarning(null);
    return false;
  };

  // AI Categorization Suggestion
  const handleTitleBlurOrChange = (val) => {
    setWizardTitle(val);
    checkDuplicate(val);

    const text = val.toLowerCase();
    if (!text.trim()) {
      setAiCategorySuggestion(null);
      return;
    }

    let suggestion = null;
    if (text.includes('certif') || text.includes('aws') || text.includes('course')) {
      suggestion = { status: 'completed', icon: 'fa-certificate', meta: 'Certification · Credential', category: 'Certification' };
    } else if (text.includes('hackathon') || text.includes('won') || text.includes('trophy') || text.includes('award') || text.includes('competition')) {
      suggestion = { status: 'completed', icon: 'fa-trophy', meta: 'Hackathon · Achievement', category: 'Achievement' };
    } else if (text.includes('project') || text.includes('built') || text.includes('clone') || text.includes('launch') || text.includes('platform')) {
      suggestion = { status: 'focus', icon: 'fa-code', meta: 'Project · Scalable Architecture', category: 'Full-Stack Project' };
    } else if (text.includes('intern') || text.includes('company') || text.includes('developer at')) {
      suggestion = { status: 'completed', icon: 'fa-laptop-code', meta: 'Internship · Experience', category: 'Work Experience' };
    } else if (text.includes('b.tech') || text.includes('school') || text.includes('cgpa') || text.includes('academic') || text.includes('degree')) {
      suggestion = { status: 'focus', icon: 'fa-graduation-cap', meta: 'Academic · Degree', category: 'Education' };
    }

    setAiCategorySuggestion(suggestion);
  };

  const applyAiSuggestion = () => {
    if (!aiCategorySuggestion) return;
    playTick();
    setWizardStatus(aiCategorySuggestion.status);
    setWizardMeta(aiCategorySuggestion.meta);
    setWizardIcon(aiCategorySuggestion.icon);
    showToast(`Applied ${aiCategorySuggestion.category} AI recommendation!`, 'fa-sparkles');
    setAiCategorySuggestion(null);
  };

  // Wizard Step Navigation
  const handleWizardNext = () => {
    if (wizardStep === 1) {
      if (!wizardTitle.trim()) {
        showToast('Milestone title is required.', 'fa-exclamation');
        return;
      }
      if (duplicateWarning && !duplicateOverride) {
        showToast('Please resolve duplicate warning before proceeding.', 'fa-triangle-exclamation');
        return;
      }
    }
    if (wizardStep < 4) {
      playTick();
      setWizardStep((prev) => prev + 1);
    }
  };

  const handleWizardBack = () => {
    if (wizardStep > 1) {
      playTick();
      setWizardStep((prev) => prev - 1);
    }
  };

  // Rich Text Editor Commands
  const executeRteCmd = (command, value = null) => {
    if (!rteEditorRef.current) return;
    rteEditorRef.current.focus();
    document.execCommand(command, false, value);
    if (rteEditorRef.current) {
      setWizardDesc(rteEditorRef.current.innerHTML);
    }
    updateRteStats();
  };

  const updateRteStats = () => {
    if (!rteEditorRef.current) return;
    const html = rteEditorRef.current.innerHTML || '';
    const text = rteEditorRef.current.innerText || '';
    setWizardDesc(html);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  const insertLinkInRte = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeRteCmd('createLink', url);
    }
  };

  const insertEmojiInRte = (emoji) => {
    if (!rteEditorRef.current) return;
    rteEditorRef.current.focus();
    document.execCommand('insertText', false, emoji);
    setIsEmojiPickerOpen(false);
    updateRteStats();
  };

  const applyRteColor = (color) => {
    executeRteCmd('foreColor', color);
    setCurrentColor(color);
    setIsColorPaletteOpen(false);
  };

  const handleRteVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Speech recognition not supported.', 'fa-triangle-exclamation');
      return;
    }
    if (isRteVoiceListening) {
      if (rteRecognitionRef.current) rteRecognitionRef.current.stop();
      setIsRteVoiceListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    rteRecognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRteVoiceListening(true);
      showToast('Listening... Speak to transcribe', 'fa-microphone');
    };

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      if (rteEditorRef.current) {
        rteEditorRef.current.focus();
        document.execCommand('insertText', false, ` ${text}`);
        updateRteStats();
      }
      showToast('Speech transcribed!', 'fa-check');
    };

    recognition.onerror = () => setIsRteVoiceListening(false);
    recognition.onend = () => setIsRteVoiceListening(false);
    recognition.start();
  };

  // AI Description Generator
  const generateAiDescription = () => {
    playTick();
    const title = wizardTitle || 'Milestone';
    if (!rteEditorRef.current) return;
    rteEditorRef.current.innerHTML = '<p class="text-sky-400"><em><i class="fa-solid fa-spinner fa-spin"></i> Generating structured description with AI...</em></p>';
    setTimeout(() => {
      const generated = `<h3>Overview</h3><p>Successfully completed <b>${title}</b> demonstrating rigorous engineering and methodical execution.</p><h3>Key Highlights</h3><ul><li>Applied algorithmic problem-solving and modern development tools.</li><li>Engineered modular architecture with comprehensive test coverage.</li><li>Ensured intuitive responsive interfaces and optimized execution speed.</li></ul>`;
      if (rteEditorRef.current) {
        rteEditorRef.current.innerHTML = generated;
        updateRteStats();
      }
      showToast('AI Description generated!', 'fa-wand-magic-sparkles');
    }, 1000);
  };

  // Auto Detect Tags from description
  const handleAutoDetectTags = () => {
    const fullText = `${wizardTitle} ${rteEditorRef.current?.innerText || ''}`.toLowerCase();
    const techDictionary = {
      react: 'React',
      node: 'NodeJS',
      express: 'ExpressJS',
      mongodb: 'MongoDB',
      python: 'Python',
      java: 'Java',
      c: 'C',
      mysql: 'MySQL',
      dsa: 'DSA',
      algorithms: 'Algorithms',
      docker: 'Docker',
      aws: 'AWS',
      git: 'Git',
      github: 'GitHub',
      tailwind: 'Tailwind CSS',
      ai: 'AI / ML',
      gemini: 'Gemini API'
    };
    const currentTags = wizardTags.split(',').map((t) => t.trim()).filter(Boolean);
    const discovered = new Set(currentTags);
    Object.entries(techDictionary).forEach(([key, label]) => {
      if (fullText.includes(key)) {
        discovered.add(label);
      }
    });
    setWizardTags(Array.from(discovered).join(', '));
    showToast(`Detected ${discovered.size - currentTags.length} new skill tags!`, 'fa-tags');
  };

  // AI Summary Generator
  const handleGenerateSummary = () => {
    const text = rteEditorRef.current?.innerText || '';
    if (!text.trim()) {
      showToast('Write a description first to generate a summary.', 'fa-info');
      return;
    }
    const words = text.trim().split(/\s+/);
    const summary = words.slice(0, 16).join(' ') + (words.length > 16 ? '...' : '');
    showToast(`AI Summary: ${summary}`, 'fa-sparkles');
  };

  // Check Grammar Simulation
  const handleCheckGrammar = () => {
    showToast('Grammar check complete: No syntax issues found!', 'fa-spell-check');
  };

  // Image Upload Handling
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setWizardImageData(e.target.result);
      if (!wizardImageAlt) {
        setWizardImageAlt(`Illustration for ${wizardTitle || 'milestone'}`);
      }
      showToast('Image uploaded', 'fa-image');
    };
    reader.readAsDataURL(file);
  };

  // AI SVG Image Generator (Realistic, Illustration, Abstract)
  const generateAiSvgImage = (style) => {
    playTick();
    const title = (wizardTitle || 'Milestone').substring(0, 32);
    let svg = '';
    if (style === 'realistic') {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#0369a1"/></linearGradient></defs><rect width="800" height="400" fill="url(#g)"/><circle cx="700" cy="80" r="140" fill="#38bdf8" opacity="0.15"/><circle cx="100" cy="320" r="180" fill="#22d3ee" opacity="0.1"/><text x="48" y="210" font-family="'Space Grotesk', sans-serif" font-size="34" fill="#ffffff" font-weight="700">${title}</text><text x="48" y="250" font-family="'JetBrains Mono', monospace" font-size="16" fill="#38bdf8">Enterprise CMS v9 Architecture</text></svg>`;
    } else if (style === 'illustration') {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><defs><linearGradient id="gi" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#312e81"/></linearGradient></defs><rect width="800" height="400" fill="url(#gi)"/><polygon points="380,80 440,240 320,240" fill="#a855f7" opacity="0.4"/><circle cx="580" cy="180" r="60" fill="#f43f5e" opacity="0.3"/><text x="48" y="210" font-family="'Space Grotesk', sans-serif" font-size="32" fill="#e0e7ff" font-weight="700">${title}</text><text x="48" y="250" font-family="'Inter', sans-serif" font-size="16" fill="#a5b4fc">Vector Milestone Identity</text></svg>`;
    } else {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><defs><radialGradient id="ga"><stop offset="0%" stop-color="#065f46"/><stop offset="100%" stop-color="#022c22"/></radialGradient></defs><rect width="800" height="400" fill="url(#ga)"/><path d="M 0,200 Q 200,80 400,200 T 800,200 L 800,400 L 0,400 Z" fill="#10b981" opacity="0.25"/><text x="48" y="210" font-family="'Space Grotesk', sans-serif" font-size="32" fill="#ecfdf5" font-weight="700">${title}</text><text x="48" y="250" font-family="'JetBrains Mono', monospace" font-size="16" fill="#34d399">Abstract Milestone Visual</text></svg>`;
    }
    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    setWizardImageData(dataUrl);
    setWizardImageAlt(`AI-generated ${style} visual for ${title}`);
    showToast(`Generated ${style} SVG graphic!`, 'fa-palette');
  };

  // Submit Milestone from Wizard (Only permitted on Step 4 Review)
  const handleWizardSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (wizardStep !== 4) return;
    if (isWizardSaving) return;
    if (!wizardTitle.trim()) {
      showToast('Title is required.', 'fa-exclamation');
      return;
    }
    setIsWizardSaving(true);

    const rawDesc = wizardDesc || rteEditorRef.current?.innerHTML || '';
    const sanitizedDesc = DOMPurify.sanitize(rawDesc, {
      ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'pre', 'code', 'blockquote', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class']
    });

    const parsedTags = wizardTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (wizardEditingId) {
        // Update existing
        const updated = milestones.map((m) => {
          if (m.id === wizardEditingId) {
            return {
              ...m,
              title: wizardTitle.trim(),
              metaLabel: wizardMeta.trim() || 'Milestone',
              year: wizardYear,
              status: wizardStatus,
              progress: Number(wizardProgress) || 0,
              rating: Number(wizardRating) || 0,
              metric: wizardMetric.trim(),
              pinned: wizardPinned || wizardSpotlight,
              spotlight: wizardSpotlight,
              desc: sanitizedDesc,
              tags: parsedTags,
              link: wizardLink.trim(),
              icon: wizardIcon,
              image: wizardImageData || wizardImageUrl.trim() || m.image || null,
              images: (wizardImageData || wizardImageUrl.trim()) ? [wizardImageData || wizardImageUrl.trim(), ...(Array.isArray(m.images) ? m.images.slice(1) : [])] : (Array.isArray(m.images) ? m.images : []),
              imageAlt: wizardImageAlt.trim(),
              updatedAt: new Date().toISOString()
            };
          }
          return m;
        });
        persistMilestones(updated, 'Edit Milestone', `Updated "${wizardTitle.trim()}"`);
        showToast(`Milestone "${wizardTitle.trim()}" updated successfully!`, 'fa-check');
      } else {
        // Add new milestone
        const finalImg = wizardImageData || wizardImageUrl.trim() || null;
        const newMilestone = {
          id: `m-${Date.now()}`,
          title: wizardTitle.trim(),
          metaLabel: wizardMeta.trim() || 'Milestone',
          year: wizardYear,
          status: wizardStatus,
          progress: Number(wizardProgress) || 0,
          rating: Number(wizardRating) || 0,
          metric: wizardMetric.trim(),
          desc: sanitizedDesc,
          tags: parsedTags,
          link: wizardLink.trim(),
          icon: wizardIcon,
          image: finalImg,
          images: finalImg ? [finalImg] : [],
          imageAlt: wizardImageAlt.trim(),
          published: true,
          pinned: wizardPinned || wizardSpotlight,
          spotlight: wizardSpotlight,
          views: 0,
          createdAt: new Date().toISOString()
        };
        const updated = [newMilestone, ...milestones];
        persistMilestones(updated, 'Create Milestone', `Added "${wizardTitle.trim()}"`);
        showToast(`Milestone "${wizardTitle.trim()}" added to roadmap!`, 'fa-rocket');
        checkAchievement(updated.length);
      }
      closeWizard();
    } catch (err) {
      console.error('Error saving milestone:', err);
      showToast('Error saving milestone: ' + err.message, 'fa-triangle-exclamation');
    } finally {
      setIsWizardSaving(false);
    }
  };

  // Templates handling
  const applyTemplate = (tmpl) => {
    playTick();
    setWizardEditingId(null);
    setWizardStep(1);
    setWizardTitle(tmpl.title);
    setWizardMeta(tmpl.meta);
    setWizardYear(tmpl.year);
    setWizardStatus(tmpl.status);
    setWizardProgress(tmpl.progress || 100);
    setWizardRating(5);
    setWizardTags(Array.isArray(tmpl.tags) ? tmpl.tags.join(', ') : tmpl.tags || '');
    setWizardIcon(tmpl.icon || 'fa-layer-group');
    setWizardImageData(null);
    setWizardImageAlt('');
    setDuplicateWarning(null);
    setDuplicateOverride(false);
    setWizardDesc(tmpl.content || '');
    setIsTemplatesOpen(false);
    setIsWizardOpen(true);

    setTimeout(() => {
      if (rteEditorRef.current) {
        rteEditorRef.current.innerHTML = tmpl.content || '';
        updateRteStats();
      }
    }, 100);
    showToast(`Template "${tmpl.name}" applied!`, 'fa-bookmark');
  };

  // GitHub Commits Sync
  const [githubUrl, setGithubUrl] = useState('https://github.com/ayushprajapati9669-dev/ayush_portfolio');
  const [githubCommits, setGithubCommits] = useState([]);
  const [isFetchingCommits, setIsFetchingCommits] = useState(false);

  const fetchGithubCommits = () => {
    setIsFetchingCommits(true);
    setTimeout(() => {
      const mockCommits = [
        { hash: 'a4b8c9d', msg: 'feat: Architected Case Study Blueprint viewer with live metrics', date: 'Yesterday' },
        { hash: 'e2f5g1h', msg: 'fix: Enhanced contrast & dynamic lighting across portfolio modals', date: '3 days ago' },
        { hash: 'j7k3m9n', msg: 'feat: Integrated Gemini API with streaming chat completions', date: '5 days ago' },
        { hash: 'p0q4r8s', msg: 'perf: Optimized GSAP bundle and asset preloading pipelines', date: '1 week ago' }
      ];
      setGithubCommits(mockCommits);
      setIsFetchingCommits(false);
      showToast(`Fetched ${mockCommits.length} recent commits from repository`, 'fa-github');
    }, 800);
  };

  const importCommitAsMilestone = (commit) => {
    setWizardEditingId(null);
    setWizardStep(1);
    setWizardTitle(commit.msg.slice(0, 60));
    setWizardMeta('GitHub · Feature Delivery');
    setWizardYear('Year 3');
    setWizardStatus('completed');
    setWizardProgress(100);
    setWizardRating(5);
    setWizardTags('GitHub, Git, FullStack');
    setWizardIcon('fa-code-branch');
    setIsGitHubOpen(false);
    setIsWizardOpen(true);
    setTimeout(() => {
      if (rteEditorRef.current) {
        rteEditorRef.current.innerHTML = `<h3>Commit ${commit.hash}</h3><p>${commit.msg}</p><p>Deployed to production environment.</p>`;
        updateRteStats();
      }
    }, 100);
    showToast(`Commit loaded into Milestone form!`, 'fa-check');
  };

  // LinkedIn Import Simulation
  const [linkedInUrl, setLinkedInUrl] = useState('https://linkedin.com/in/ayush-prajapati-b9042424a/');
  const [isLinkedInImporting, setIsLinkedInImporting] = useState(false);

  const handleLinkedInImport = () => {
    setIsLinkedInImporting(true);
    setTimeout(() => {
      const importedCertificates = [
        {
          id: `li-${Date.now()}-1`,
          title: 'Apna College Delta Full-Stack Web Development',
          metaLabel: 'LinkedIn · Certification',
          year: 'Year 2',
          status: 'completed',
          progress: 100,
          rating: 5,
          desc: '<h3>Certification Verification</h3><p>Successfully completed comprehensive full-stack training covering frontend engineering, Node.js backend systems, relational & NoSQL databases, and cloud deployments.</p>',
          tags: ['MERN', 'React', 'NodeJS', 'MongoDB'],
          icon: 'fa-certificate',
          published: true,
          pinned: false,
          views: 110,
          createdAt: new Date().toISOString()
        },
        {
          id: `li-${Date.now()}-2`,
          title: 'College Website Making Competition (1st Place)',
          metaLabel: 'LinkedIn · Award',
          year: 'Year 2',
          status: 'completed',
          progress: 100,
          rating: 5,
          desc: '<h3>First Place Award</h3><p>Awarded 1st place in college-wide website creation competition recognized on professional LinkedIn profile.</p>',
          tags: ['UI/UX', 'HTML5', 'CSS3', 'JavaScript'],
          icon: 'fa-trophy',
          published: true,
          pinned: false,
          views: 95,
          createdAt: new Date().toISOString()
        }
      ];
      const updated = [...importedCertificates, ...milestones];
      persistMilestones(updated, 'LinkedIn Import', `Imported ${importedCertificates.length} credentials from LinkedIn`);
      setIsLinkedInImporting(false);
      setIsLinkedInOpen(false);
      showToast(`Imported ${importedCertificates.length} credentials from LinkedIn profile!`, 'fa-linkedin');
    }, 1000);
  };

  // Resize Handle Logic for Live Preview Right Panel with Full-Screen Drag Capture
  const handleMouseDownResize = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    // Full-screen capture overlay during drag to prevent event dropping
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;cursor:col-resize;user-select:none;';
    document.body.appendChild(overlay);

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const delta = startX - moveEvent.clientX;
      const newWidth = Math.min(650, Math.max(280, Math.round(startWidth + delta)));
      setRightPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      setRightPanelWidth((curr) => {
        try {
          localStorage.setItem('admin_panel_width_v9', String(curr));
        } catch (err) {}
        return curr;
      });
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Clear Activity Log History
  const clearActivityLog = () => {
    playTick();
    setActivityLog([]);
    try {
      localStorage.setItem('admin_logs_v9', JSON.stringify([]));
    } catch (err) {}
    showToast('Milestone activity log cleared successfully!', 'fa-broom');
  };


  return (
    <div className={`admin-milestones-root ${theme} ${accent} ${density === 'compact' ? 'compact' : ''} ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* Canvas for Confetti */}
      <canvas
        ref={canvasRef}
        id="confettiCanvas"
        className="pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 999999,
          display: 'none'
        }}
      />



      {/* Voice Command Indicator Banner */}
      {isVoiceCmdListening && (
        <div className="voice-command-indicator active mb-4">
          <div className="v-dot" />
          <div>
            <div className="v-text">{voiceCmdText}</div>
            <div className="v-hint">Try saying: "New milestone", "Search React", "Recycle bin", "Focus"</div>
          </div>
          <button
            type="button"
            className="ml-auto text-xs text-rose-400 hover:text-white"
            onClick={toggleVoiceCommand}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* 0. TOP ACTION BANNER — Matching Photo 4 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-rose-500">
              MILESTONES STUDIO
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">
            Milestones &amp; Career Roadmap
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage your chronological roadmap, workshop showcases, hackathons, and flagship spotlights. Drag the ⠿ icon to reorder.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onSelectTab && (
            <button
              type="button"
              onClick={() => { playTick(); onSelectTab('profile'); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#0d1526]/80 hover:bg-[#121c32] hover:border-white/20 text-xs text-slate-300 hover:text-white transition-all font-medium shadow-sm"
              title="Edit Profile, Bio narrative, and college credentials"
            >
              <i className="fa-solid fa-pen text-slate-400 text-xs" />
              <span>Edit Bio</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span>Live in Portfolio</span>
          </div>
          <button
            type="button"
            onClick={openNewWizard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-all active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>New Milestone</span>
          </button>
        </div>
      </div>

      {/* 4 REALISTIC STAT CARDS — Matching Photo 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Milestones */}
        <div className="bg-[#0b1322]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
              TOTAL MILESTONES
            </div>
            <div className="text-3xl font-bold font-display text-white">
              {totalCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <RealisticMilestoneFlagIcon size={34} />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[#0b1322]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
              COMPLETED
            </div>
            <div className="text-3xl font-bold font-display text-emerald-400">
              {completedCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <RealisticCheckmarkIcon size={34} />
          </div>
        </div>

        {/* Active Focus */}
        <div className="bg-[#0b1322]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
              ACTIVE FOCUS
            </div>
            <div className="text-3xl font-bold font-display text-sky-400">
              {focusCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <RealisticBullseyeIcon size={34} />
          </div>
        </div>

        {/* Featured Spotlight */}
        <div className="bg-[#0b1322]/90 border border-white/[0.08] hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm group">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1 group-hover:text-amber-400/80 transition-colors">
              FEATURED SPOTLIGHT
            </div>
            <div className="text-3xl font-bold font-display text-amber-400">
              {spotlightCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-trophy text-2xl text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT — Left: Milestones Management | Right: Editor / Preview / Data */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full relative">
        {/* LEFT COLUMN: Controls, Filters, Search & Milestones List (~60% width) */}
        <div className="w-full lg:w-[60%] flex flex-col gap-4 min-w-0">
          {/* Controls Toolbar Container */}
          <div className="bg-[#080e1b] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            {/* Filter Selects Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <select
                className="bg-[#0c1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60 cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter status"
              >
                <option value="all">Status: All</option>
                <option value="focus">Focus</option>
                <option value="completed">Completed</option>
                <option value="planned">Planned</option>
              </select>

              <select
                className="bg-[#0c1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60 cursor-pointer"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                aria-label="Filter year"
              >
                <option value="all">Year: All</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="2023">Year 2023</option>
                <option value="2024">Year 2024</option>
                <option value="2025">Year 2025</option>
                <option value="Present">Present</option>
              </select>

              <select
                className="bg-[#0c1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60 cursor-pointer"
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                aria-label="Sort milestones"
              >
                <option value="manual">Manual Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Alphabetical A-Z</option>
                <option value="views">Most Viewed</option>
              </select>

              <input
                type="text"
                className="bg-[#0c1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                placeholder="Filter by tag..."
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              />
            </div>

            {/* Toolbar Row 2: Multi-select info & Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.06] flex-wrap">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                {selectedIds.size > 0 ? (
                  <span className="font-semibold text-cyan-400">
                    {selectedIds.size} selected
                  </span>
                ) : (
                  <span>Hold Shift to multi-select</span>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl bg-[#0c1424] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all text-xs"
                  onClick={() => setIsGitHubOpen(true)}
                  title="Sync from GitHub Commits"
                  aria-label="GitHub Sync"
                >
                  <i className="fa-brands fa-github text-sm" />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl bg-[#0c1424] border border-white/10 hover:border-white/20 text-sky-400 hover:text-sky-300 flex items-center justify-center transition-all text-xs"
                  onClick={() => setIsLinkedInOpen(true)}
                  title="Import from LinkedIn"
                  aria-label="LinkedIn Import"
                >
                  <i className="fa-brands fa-linkedin text-sm" />
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-[#0c1424] border border-white/10 hover:border-white/20 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
                  onClick={() => setIsTemplatesOpen(true)}
                  title="Open Milestone Templates Library"
                >
                  <i className="fa-solid fa-layer-group text-cyan-400" />
                  <span>Templates</span>
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all active:scale-95"
                  onClick={openNewWizard}
                >
                  <i className="fa-solid fa-plus text-xs" />
                  <span>New Milestone</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar & Quick Tech Filters */}
          <div className="flex flex-col gap-2">
            <div className="relative w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search milestones across title, description, or technology tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080e1b] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

          </div>

          {/* Milestones Cards List */}
          <div className="flex flex-col gap-3" ref={scrollContainerRef}>
            {filteredMilestones.length === 0 ? (
              <div className="text-center py-16 px-6 bg-[#080e1b] border border-dashed border-white/10 rounded-2xl">
                <i className="fa-solid fa-magnifying-glass text-3xl text-cyan-400/50 mb-3" />
                <h3 className="font-display font-semibold text-base text-white mb-1">No Milestones Found</h3>
                <p className="text-xs text-slate-400 mb-4">No entries match your search criteria or filters.</p>
                <button type="button" className="btn btn-primary text-xs" onClick={openNewWizard}>
                  <i className="fa-solid fa-plus" /> Add First Milestone
                </button>
              </div>
            ) : (
              filteredMilestones.slice(0, displayedCount).map((m) => {
                const isSelected = selectedIds.has(m.id);
                const isCurrentActive = activeEditorId === m.id;
                const catInfo = getCategoryPresentation(m);
                const cardImg = m.image || (Array.isArray(m.images) && m.images[0]) || null;

                return (
                  <article
                    key={m.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, m.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, m.id)}
                    onContextMenu={(e) => handleContextMenu(e, m.id)}
                    onClick={() => {
                      playTick();
                      setActiveEditorId(m.id);
                    }}
                    onDoubleClick={() => openEditWizard(m.id)}
                    className={`group relative flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-10px_rgba(6,182,212,0.22)] ${
                      isCurrentActive
                        ? 'bg-[#0b1424] border-2 border-cyan-500/80 shadow-[0_0_24px_rgba(6,182,212,0.25)]'
                        : isSelected
                        ? 'bg-[#0c1626] border-2 border-purple-500/60'
                        : 'bg-[#080e1b] border border-white/[0.08] hover:border-cyan-500/40 hover:bg-[#0c1524]'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelect(m.id, e.nativeEvent)}
                        className="w-4 h-4 rounded bg-[#070d18] border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
                        aria-label={`Select ${m.title}`}
                      />
                    </div>

                    {/* Drag Grip ⠿ */}
                    <div className="pt-1 text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing text-xs">
                      <i className="fa-solid fa-grip-vertical" title="Drag to reorder" />
                    </div>

                    {/* Thumbnail Image (Hackathons, Internships, etc.) or Category Icon */}
                    {cardImg ? (
                      <div className="relative w-24 sm:w-32 h-20 sm:h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-md group/thumb bg-black/40">
                        <img
                          src={cardImg}
                          alt={m.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div
                          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-md flex items-center justify-center text-[10px] shadow backdrop-blur-md"
                          style={{
                            backgroundColor: catInfo.bg,
                            border: `1px solid ${catInfo.border}`,
                            color: catInfo.text
                          }}
                        >
                          <i className={catInfo.icon} />
                        </div>
                        {(m.spotlight || m.pinned) && (
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/85 border border-amber-500/50 text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1 backdrop-blur-sm shadow">
                            <i className="fa-solid fa-trophy text-[8px] text-amber-400" />
                            <span>Spotlight</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-base shadow-inner"
                        style={{
                          backgroundColor: catInfo.bg,
                          border: `1px solid ${catInfo.border}`,
                          color: catInfo.text
                        }}
                      >
                        <i className={catInfo.icon} />
                      </div>
                    )}

                    {/* Main Card Content */}
                    <div className="flex-1 min-w-0 pr-9">
                      {/* Metadata Header */}
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[11px] font-bold font-mono uppercase tracking-wider"
                            style={{ color: catInfo.text }}
                          >
                            {catInfo.type}
                          </span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-xs font-mono text-slate-400">
                            Year {m.year ? m.year.replace(/year\s*/i, '') : '2023'}
                          </span>
                          {m.status === 'completed' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                              <i className="fa-solid fa-check text-[9px]" /> DONE
                            </span>
                          )}
                          {m.status === 'focus' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950/60 border border-sky-500/40 text-sky-400 flex items-center gap-1">
                              <i className="fa-solid fa-bolt text-[9px]" /> FOCUS
                            </span>
                          )}
                          {(m.spotlight || m.pinned) && !cardImg && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center gap-1">
                              <i className="fa-solid fa-trophy text-[9px]" /> SPOTLIGHT
                            </span>
                          )}
                        </div>

                        {/* 5 Gold Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`fa-solid fa-star ${star <= (m.rating || 5) ? 'text-amber-400' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-1 line-clamp-1"
                        onDoubleClick={() => openEditWizard(m.id)}
                        title="Double click to edit in modal"
                      >
                        {m.title}
                      </h3>

                      {/* Description snippet */}
                      <div
                        className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2"
                        dangerouslySetInnerHTML={{ __html: m.desc }}
                      />

                      {/* Tech Tags */}
                      {Array.isArray(m.tags) && m.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {m.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#070e1b] border border-white/10 text-[10px] font-mono text-cyan-300/90 hover:border-cyan-500/40 transition-colors"
                            >
                              <span className="text-cyan-400 text-[9px] font-bold">&lt;/&gt;</span>
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Vertical Floating Action Strip on Card Hover */}
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center bg-[#070d18]/95 border border-white/15 rounded-xl shadow-2xl py-1 px-0.5 opacity-90 group-hover:opacity-100 transition-all z-10 gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleMoveUp(m.id)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-[11px]"
                        title="Move Up"
                      >
                        <i className="fa-solid fa-arrow-up" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(m.id)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-[11px]"
                        title="Move Down"
                      >
                        <i className="fa-solid fa-arrow-down" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSpotlight(m.id)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors text-[11px] ${
                          m.spotlight || m.pinned
                            ? 'text-amber-400 bg-amber-500/20'
                            : 'text-slate-400 hover:text-amber-400 hover:bg-white/10'
                        }`}
                        title={m.spotlight || m.pinned ? 'Featured in Spotlight (Click to remove)' : 'Add to Spotlight Carousel'}
                      >
                        <i className="fa-solid fa-trophy" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(m.id, !m.published)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors text-[11px] ${
                          m.published
                            ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/10'
                        }`}
                        title={m.published ? 'Live in Portfolio (Click to hide)' : 'Draft (Click to publish)'}
                      >
                        <i className={`fa-solid ${m.published ? 'fa-eye' : 'fa-eye-slash'}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditWizard(m.id)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors text-[11px]"
                        title="Edit Milestone in Modal"
                      >
                        <i className="fa-solid fa-pen-to-square" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePromptDelete(m.id)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors text-[11px]"
                        title="Delete Milestone"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </article>
                );
              })
            )}

            {/* Pagination Controls */}
            {filteredMilestones.length > 12 && (
              <div className="pagination-controls mt-2 flex items-center justify-center gap-2">
                {displayedCount < filteredMilestones.length && (
                  <button
                    type="button"
                    className="btn btn-secondary text-xs"
                    onClick={() => setDisplayedCount((prev) => prev + 6)}
                  >
                    Load More <i className="fa-solid fa-chevron-down" />
                  </button>
                )}
                {displayedCount > 12 && (
                  <button
                    type="button"
                    className="btn btn-secondary text-xs"
                    onClick={() => setDisplayedCount(12)}
                  >
                    Show Less <i className="fa-solid fa-chevron-up" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PORTFOLIO PREVIEW (~40% width) */}
        <div className="w-full lg:w-[40%] bg-[#080e1b] border border-white/[0.08] rounded-2xl p-5 sticky top-24 max-h-[calc(100vh-120px)] flex flex-col overflow-y-auto shadow-sm">
          {/* Live Preview Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs shadow-inner">
                <i className="fa-regular fa-eye" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">LIVE PORTFOLIO PREVIEW</h4>
                <p className="text-[10px] text-slate-400">Visitor Timeline &amp; Spotlight Ecosystem</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Connected</span>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="flex flex-col">
            <div className="text-center mb-6">
              <h3 className="text-base font-bold text-white font-display">Portfolio Timeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">This is how your milestones appear to visitors.</p>
            </div>

            {/* Connected Timeline */}
            <div className="relative border-l-2 border-white/10 ml-4 pl-6 space-y-6">
              {milestones
                .filter((m) => m.published)
                .map((m) => {
                  const catInfo = getCategoryPresentation(m);
                  const isCurrentActive = activeEditorId === m.id;
                  const itemImg = m.image || (Array.isArray(m.images) && m.images[0]) || null;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        playTick();
                        setActiveEditorId(m.id);
                      }}
                      onDoubleClick={() => openEditWizard(m.id)}
                      className={`relative group p-3.5 rounded-xl transition-all cursor-pointer ${
                        isCurrentActive ? 'bg-cyan-500/10 border border-cyan-500/35 shadow-md' : 'hover:bg-white/[0.03]'
                      }`}
                      title="Click to select • Double-click to edit"
                    >
                      {/* Node indicator */}
                      <div
                        className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-[#091120] transition-transform ${
                          m.spotlight || m.pinned
                            ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                            : 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                        } group-hover:scale-125`}
                      />

                      {/* Meta Header */}
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                            {catInfo.type}
                          </span>
                          {(m.spotlight || m.pinned) && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                              <i className="fa-solid fa-trophy text-[8px]" /> SPOTLIGHT
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          Year {m.year ? m.year.replace(/year\s*/i, '') : '2023'}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {m.title}
                      </h4>

                      {/* Description */}
                      <div
                        className="text-xs text-slate-400 leading-relaxed mt-1"
                        dangerouslySetInnerHTML={{ __html: m.desc }}
                      />

                      {/* Tech Tags */}
                      {Array.isArray(m.tags) && m.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {m.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Cover Image */}
                      {itemImg && (
                        <img
                          src={itemImg}
                          alt={m.title}
                          loading="lazy"
                          className="w-full rounded-xl mt-3 border border-white/10 object-cover max-h-48 shadow-lg group-hover:scale-[1.02] transition-transform"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING MULTI-SELECT BOTTOM DOCK — Matching Photo 2 */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#091120]/95 backdrop-blur-xl border border-white/15 shadow-2xl animate-fade-in">
          <span className="text-xs font-bold text-white px-2">
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            onClick={handleBulkComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-xs font-medium text-emerald-400 transition-all"
          >
            <i className="fa-solid fa-check" /> Complete
          </button>
          <button
            type="button"
            onClick={handleBulkDeletePrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-xs font-medium text-rose-400 transition-all"
          >
            <i className="fa-solid fa-trash-can" /> Delete
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedIds.size < 2) {
                showToast('Select at least 2 milestones to compare', 'fa-info');
                return;
              }
              setCompareIds(Array.from(selectedIds).slice(0, 2));
              setIsCompareActive(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-slate-200 transition-all"
          >
            <i className="fa-solid fa-columns" /> Compare
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            title="Clear Selection"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* 4-STEP WIZARD MODAL */}
      {isWizardOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-content">
            {/* Wizard Header */}
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-wand-magic-sparkles text-violet-400" />
                {wizardEditingId ? 'Edit Milestone' : 'Add New Milestone'}
              </h2>
              <button type="button" className="modal-close" onClick={closeWizard} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Wizard Progress Tabs */}
            <div className="wizard-progress">
              <div className={`wizard-step ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
                <div className="wizard-step-circle">1</div>
                <div className="wizard-step-label">Basics</div>
              </div>
              <div className={`wizard-step ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`}>
                <div className="wizard-step-circle">2</div>
                <div className="wizard-step-label">Content & RTE</div>
              </div>
              <div className={`wizard-step ${wizardStep === 3 ? 'active' : wizardStep > 3 ? 'completed' : ''}`}>
                <div className="wizard-step-circle">3</div>
                <div className="wizard-step-label">Media & Tags</div>
              </div>
              <div className={`wizard-step ${wizardStep === 4 ? 'active' : ''}`}>
                <div className="wizard-step-circle">4</div>
                <div className="wizard-step-label">Review</div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (wizardStep !== 4) {
                  handleWizardNext();
                  return;
                }
                handleWizardSubmit(e);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName === 'INPUT' && wizardStep !== 4) {
                  e.preventDefault();
                  handleWizardNext();
                }
              }}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="wizard-body">
                {/* STEP 1: BASICS */}
                {wizardStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <div className="wizard-panel-intro">
                      <strong>Step 1 of 4:</strong> Start with essentials. Provide a clear title, status, and self-evaluation rating.
                    </div>

                    {/* Duplicate Warning Box */}
                    {duplicateWarning && (
                      <div className="duplicate-warning active">
                        <div className="dw-title">
                          <i className="fa-solid fa-triangle-exclamation" /> Duplicate Detected
                        </div>
                        <div className="dw-body">
                          You have a milestone <b>"{duplicateWarning.milestone.title}"</b> ({duplicateWarning.similarity}% similarity).
                        </div>
                        <div className="dw-actions">
                          <button
                            type="button"
                            className="dw-btn merge"
                            onClick={() => {
                              setWizardTitle(duplicateWarning.milestone.title);
                              setWizardMeta(duplicateWarning.milestone.metaLabel || '');
                              setDuplicateWarning(null);
                              showToast('Merged duplicate details', 'fa-compress');
                            }}
                          >
                            <i className="fa-solid fa-compress" /> Merge
                          </button>
                          <button
                            type="button"
                            className="dw-btn"
                            onClick={() => {
                              setDuplicateOverride(true);
                              setDuplicateWarning(null);
                              showToast('Saving as distinct milestone', 'fa-copy');
                            }}
                          >
                            <i className="fa-solid fa-clone" /> Keep Both
                          </button>
                          <button
                            type="button"
                            className="dw-btn"
                            onClick={() => setDuplicateWarning(null)}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Milestone Title */}
                    <div className="form-group">
                      <label>
                        Milestone Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. MERN Stack & Scalable Systems Architecture"
                        value={wizardTitle}
                        onChange={(e) => handleTitleBlurOrChange(e.target.value)}
                        maxLength={120}
                        required
                      />
                    </div>

                    {/* AI Category Suggestion */}
                    {aiCategorySuggestion && (
                      <div className="ai-suggestion-box active">
                        <div className="ai-suggestion-title">
                          <i className="fa-solid fa-robot" /> AI Smart Categorization
                        </div>
                        <div className="text-xs text-slate-300">
                          Detected <b>{aiCategorySuggestion.category}</b>. Suggest status: <b>{aiCategorySuggestion.status}</b>, badge: <b>{aiCategorySuggestion.meta}</b>.
                        </div>
                        <div className="ai-suggestion-actions mt-2">
                          <button
                            type="button"
                            className="btn btn-secondary text-xs py-1 px-2.5"
                            onClick={applyAiSuggestion}
                          >
                            <i className="fa-solid fa-check" /> Apply Suggestion
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label>Meta Label</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Full-Stack Practice · Year 3"
                          value={wizardMeta}
                          onChange={(e) => setWizardMeta(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Year</label>
                        <select
                          className="form-control"
                          value={wizardYear}
                          onChange={(e) => setWizardYear(e.target.value)}
                        >
                          <option value="Year 1">Year 1</option>
                          <option value="Year 2">Year 2</option>
                          <option value="Year 3">Year 3</option>
                          <option value="Year 4">Year 4</option>
                          <option value="Present">Present</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          className="form-control"
                          value={wizardStatus}
                          onChange={(e) => setWizardStatus(e.target.value)}
                        >
                          <option value="focus">Current Focus</option>
                          <option value="completed">Completed</option>
                          <option value="planned">Planned</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Progress (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={wizardProgress}
                          onChange={(e) => setWizardProgress(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Self Rating (0 - 5 Stars)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          value={wizardRating}
                          onChange={(e) => setWizardRating(Number(e.target.value))}
                          className="flex-1 accent-amber-400"
                        />
                        <span className="font-mono text-xs font-bold text-amber-400 min-w-10 text-right">
                          {wizardRating}/5 ★
                        </span>
                      </div>
                    </div>

                    {/* Spotlight Metric Highlight */}
                    <div className="form-group">
                      <label className="flex items-center justify-between">
                        <span>Spotlight Key Metric</span>
                        <span className="text-[11px] text-slate-400">Shown in Flagship Badi Photo Carousel</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 120+ Attendees · Hands-on Coding Lab or 1st Place / 150+ Teams"
                        value={wizardMetric}
                        onChange={(e) => setWizardMetric(e.target.value)}
                      />
                    </div>

                    {/* Feature in Spotlight Toggle */}
                    <div className="form-group">
                      <label className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/15 transition-all">
                        <input
                          type="checkbox"
                          checked={wizardSpotlight}
                          onChange={(e) => {
                            setWizardSpotlight(e.target.checked);
                            setWizardPinned(e.target.checked);
                          }}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <i className="fa-solid fa-trophy text-amber-400" />
                            Feature in Flagship Spotlight Carousel (Public About Page)
                          </div>
                          <div className="text-[11px] text-slate-300">
                            When enabled, displays in the luxury 3D Spotlight Ecosystem with HD gallery &amp; verified proofs. If unchecked, appears in the bottom journey timeline.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 2: CONTENT & RICH TEXT EDITOR */}
                {wizardStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <div className="wizard-panel-intro">
                      <strong>Step 2 of 4:</strong> Write a rich description. Leverage AI tools to draft, check grammar, or extract tags.
                    </div>

                    {/* RTE Container */}
                    <div className="rte-container">
                      <div className="rte-toolbar">
                        <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('undo')} title="Undo">
                          <i className="fa-solid fa-rotate-left" />
                        </button>
                        <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('redo')} title="Redo">
                          <i className="fa-solid fa-rotate-right" />
                        </button>
                        <div className="rte-divider" />
                        <button type="button" className="rte-btn font-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('bold')} title="Bold">
                          <i className="fa-solid fa-bold" />
                        </button>
                        <button type="button" className="rte-btn italic" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('italic')} title="Italic">
                          <i className="fa-solid fa-italic" />
                        </button>
                        <button type="button" className="rte-btn underline" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('underline')} title="Underline">
                          <i className="fa-solid fa-underline" />
                        </button>
                        <button type="button" className="rte-btn line-through" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('strikeThrough')} title="Strikethrough">
                          <i className="fa-solid fa-strikethrough" />
                        </button>
                        <div className="rte-divider" />

                        {/* Color Picker Container */}
                        <div className="color-picker-container relative">
                          <button
                            type="button"
                            className="color-picker-btn"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setIsColorPaletteOpen((prev) => !prev)}
                            title="Text Color"
                          >
                            <div className="color-preview" style={{ background: currentColor }} />
                            <i className="fa-solid fa-caret-down text-[10px]" />
                          </button>
                          {isColorPaletteOpen && (
                            <div className="color-palette active">
                              <div className="text-[10px] text-slate-400 mb-2 font-semibold">Select Text Color</div>
                              <div className="color-grid">
                                {PRESET_COLORS.map((c) => (
                                  <div
                                    key={c}
                                    className="color-swatch"
                                    style={{ background: c }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => applyRteColor(c)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="rte-divider" />
                        <button type="button" className="rte-btn font-bold text-xs" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('formatBlock', '<h2>')} title="Heading 2">
                          H2
                        </button>
                        <button type="button" className="rte-btn font-bold text-xs" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('formatBlock', '<h3>')} title="Heading 3">
                          H3
                        </button>
                        <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('insertUnorderedList')} title="Bullet List">
                          <i className="fa-solid fa-list-ul" />
                        </button>
                        <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('insertOrderedList')} title="Numbered List">
                          <i className="fa-solid fa-list-ol" />
                        </button>
                        <div className="rte-divider" />
                        <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={insertLinkInRte} title="Insert Link">
                          <i className="fa-solid fa-link" />
                        </button>
                        <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => executeRteCmd('formatBlock', '<pre>')} title="Code Block">
                          <i className="fa-solid fa-code" />
                        </button>

                        {/* Emoji Picker */}
                        <div className="relative">
                          <button
                            type="button"
                            className="rte-btn"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                            title="Insert Emoji"
                          >
                            😀
                          </button>
                          {isEmojiPickerOpen && (
                            <div className="emoji-picker active">
                              <div className="emoji-grid">
                                {['😀', '🚀', '🔥', '💡', '🏆', '⭐', '💻', '🎯', '📚', '🎉', '⚡', '🌟'].map((em) => (
                                  <span key={em} className="emoji-item" onMouseDown={(e) => e.preventDefault()} onClick={() => insertEmojiInRte(em)}>
                                    {em}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI & Voice Toolbar Actions */}
                        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            className={`rte-btn ${isRteVoiceListening ? 'text-rose-400 font-bold' : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleRteVoiceToggle}
                            title="Voice Dictation"
                          >
                            <i className="fa-solid fa-microphone" />
                          </button>
                          <button
                            type="button"
                            className="rte-btn text-emerald-400"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleCheckGrammar}
                            title="Check Grammar"
                          >
                            <i className="fa-solid fa-spell-check" />
                          </button>
                          <button
                            type="button"
                            className="rte-btn text-amber-400 font-bold"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={generateAiDescription}
                            title="Generate Description with AI"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles" /> AI
                          </button>
                        </div>
                      </div>

                      {/* Contenteditable Body */}
                      <div
                        ref={rteEditorRef}
                        className="rte-editor"
                        contentEditable
                        onKeyUp={updateRteStats}
                        onInput={updateRteStats}
                        onBlur={updateRteStats}
                        placeholder="Write detailed milestone summary, objectives, architecture decisions, and results..."
                      />

                      {/* RTE Footer Stats */}
                      <div className="rte-footer">
                        <div className="rte-footer-left">
                          <span>
                            <i className="fa-solid fa-font" /> {wordCount} words
                          </span>
                          <span>
                            <i className="fa-solid fa-text-width" /> {charCount} chars
                          </span>
                        </div>
                        <div className="rte-footer-right">
                          <button
                            type="button"
                            className="rte-btn text-xs"
                            onClick={handleGenerateSummary}
                          >
                            <i className="fa-solid fa-file-lines" /> Summary
                          </button>
                          <button
                            type="button"
                            className="rte-btn text-xs text-violet-400"
                            onClick={handleAutoDetectTags}
                          >
                            <i className="fa-solid fa-tags" /> Auto-Tag
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: MEDIA & TAGS */}
                {wizardStep === 3 && (
                  <div className="flex flex-col gap-4">
                    <div className="wizard-panel-intro">
                      <strong>Step 3 of 4:</strong> Select an icon, upload or AI-generate an illustration, and define technology tags.
                    </div>

                    {/* Icon Selection Grid */}
                    <div className="form-group">
                      <label>Icon Badge</label>
                      <div className="icon-grid">
                        {PRESET_ICONS.map((ic) => (
                          <div
                            key={ic}
                            className={`icon-option ${wizardIcon === ic ? 'selected' : ''}`}
                            onClick={() => { playTick(); setWizardIcon(ic); }}
                          >
                            <i className={`fa-solid ${ic}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cover Image Upload / AI Generation */}
                    <div className="form-group">
                      <label>Cover Graphic</label>
                      {!wizardImageData ? (
                        <div
                          className="drop-zone"
                          onClick={() => document.getElementById('wizardFileInput')?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
                          }}
                        >
                          <i className="fa-solid fa-cloud-arrow-up" />
                          <span>
                            Drag & drop or <strong>click to browse image</strong>
                          </span>
                          <input
                            id="wizardFileInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="image-preview-wrapper" style={{ display: 'block' }}>
                          <img src={wizardImageData} alt="Preview" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => setWizardImageData(null)}
                            title="Remove image"
                          >
                            <i className="fa-solid fa-xmark" />
                          </button>
                          <input
                            type="text"
                            className="form-control mt-2 text-xs"
                            placeholder="Image Alt text"
                            value={wizardImageAlt}
                            onChange={(e) => setWizardImageAlt(e.target.value)}
                          />
                        </div>
                      )}

                      {/* AI Graphic Generators */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[11px] text-slate-400 font-semibold">Generate AI Graphic:</span>
                        <button
                          type="button"
                          className="btn btn-secondary text-xs py-1 px-2.5"
                          onClick={() => generateAiSvgImage('realistic')}
                        >
                          <i className="fa-solid fa-camera" /> Realistic
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary text-xs py-1 px-2.5"
                          onClick={() => generateAiSvgImage('illustration')}
                        >
                          <i className="fa-solid fa-palette" /> Illustration
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary text-xs py-1 px-2.5"
                          onClick={() => generateAiSvgImage('abstract')}
                        >
                          <i className="fa-solid fa-shapes" /> Abstract
                        </button>
                      </div>

                      {/* Direct Image URL input */}
                      <div className="mt-3">
                        <label className="text-xs text-slate-300 font-semibold mb-1 block">
                          Or Direct Image URL (High Performance):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="form-control text-xs flex-1"
                            placeholder="https://... or /images/ayush-workshop-lead.jpg"
                            value={wizardImageUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setWizardImageUrl(val);
                              if (val.trim()) setWizardImageData(val.trim());
                            }}
                          />
                          {wizardImageUrl && (
                            <button
                              type="button"
                              className="btn btn-secondary text-xs px-2.5 py-1.5 shrink-0"
                              onClick={() => {
                                setWizardImageData(wizardImageUrl.trim());
                                showToast('Image URL applied', 'fa-check');
                              }}
                            >
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Technology Tags (comma separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. React, Node.js, Express, MongoDB"
                          value={wizardTags}
                          onChange={(e) => setWizardTags(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>External Link / Case Study</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://..."
                          value={wizardLink}
                          onChange={(e) => setWizardLink(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW */}
                {wizardStep === 4 && (
                  <div className="flex flex-col gap-4">
                    <div className="wizard-panel-intro">
                      <strong>Step 4 of 4:</strong> Review all milestone specifications before saving to portfolio.
                    </div>

                    <div className="review-section">
                      <div className="review-section-title">
                        <i className="fa-solid fa-circle-info" /> Basic Parameters
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Title</span>
                        <span className="review-row-value font-bold text-white">{wizardTitle || '—'}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Meta Label</span>
                        <span className="review-row-value">{wizardMeta || '—'}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Academic Year</span>
                        <span className="review-row-value">{wizardYear}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Status</span>
                        <span className="review-row-value uppercase font-bold text-cyan-400">{wizardStatus}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Progress</span>
                        <span className="review-row-value">{wizardProgress}%</span>
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Rating</span>
                        <span className="review-row-value text-amber-400">{wizardRating}/5 ★</span>
                      </div>
                    </div>

                    <div className="review-section">
                      <div className="review-section-title">
                        <i className="fa-solid fa-align-left" /> Description Preview
                      </div>
                      <div
                        className="review-desc-preview"
                        dangerouslySetInnerHTML={{
                          __html: wizardDesc || rteEditorRef.current?.innerHTML || '<em class="text-slate-500">No description provided</em>'
                        }}
                      />
                    </div>

                    <div className="review-section">
                      <div className="review-section-title">
                        <i className="fa-solid fa-tags" /> Tags & Media
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Tags</span>
                        <span className="review-row-value">{wizardTags || '—'}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Link</span>
                        <span className="review-row-value">{wizardLink || '—'}</span>
                      </div>
                      <div className="review-row">
                        <span className="review-row-label">Cover Graphic</span>
                        <span className="review-row-value">{wizardImageData ? '✓ Attached' : 'None'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer Controls */}
              <div className="wizard-footer">
                <div className="wizard-footer-left">
                  <span className="wizard-autosave">
                    <i className="fa-solid fa-circle-check text-emerald-400" /> Autosaved
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary text-xs"
                    onClick={() => {
                      if (!wizardTitle) {
                        showToast('Title is required to save template', 'fa-info');
                        return;
                      }
                      const name = prompt('Template Name:', wizardTitle);
                      if (!name) return;
                      const newTmpl = {
                        id: `tmpl-${Date.now()}`,
                        isCustom: true,
                        name,
                        icon: wizardIcon,
                        desc: 'Custom template saved from wizard',
                        title: wizardTitle,
                        meta: wizardMeta,
                        status: wizardStatus,
                        year: wizardYear,
                        tags: wizardTags.split(',').map((t) => t.trim()).filter(Boolean),
                        progress: wizardProgress,
                        content: rteEditorRef.current?.innerHTML || ''
                      };
                      const nextTemplates = [newTmpl, ...customTemplates];
                      setCustomTemplates(nextTemplates);
                      try { localStorage.setItem('admin_templates_v9', JSON.stringify(nextTemplates)); } catch (e) {}
                      showToast(`Template "${name}" saved!`, 'fa-bookmark');
                    }}
                  >
                    <i className="fa-solid fa-bookmark" /> Save as Template
                  </button>
                </div>

                <div className="wizard-footer-right">
                  {wizardStep > 1 && (
                    <button type="button" className="btn btn-secondary" onClick={handleWizardBack}>
                      <i className="fa-solid fa-chevron-left" /> Back
                    </button>
                  )}
                  {wizardStep < 4 ? (
                    <button type="button" className="btn btn-primary" onClick={handleWizardNext}>
                      Next <i className="fa-solid fa-chevron-right" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleWizardSubmit}
                      disabled={isWizardSaving}
                    >
                      {isWizardSaving ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-floppy-disk" /> Save Milestone
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATES LIBRARY MODAL */}
      {isTemplatesOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-layer-group text-violet-400" /> Milestone Templates Library
              </h2>
              <button type="button" className="modal-close" onClick={() => setIsTemplatesOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-xs text-slate-400 mb-4">
                Click any pre-crafted or custom template to auto-fill the creation wizard.
              </p>
              <div className="templates-grid">
                {[...BUILTIN_TEMPLATES, ...customTemplates].map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="template-card"
                    onClick={() => applyTemplate(tmpl)}
                    tabIndex={0}
                  >
                    <div className="t-icon">
                      <i className={`fa-solid ${tmpl.icon}`} />
                    </div>
                    <div className="t-title">{tmpl.name}</div>
                    <div className="t-desc">{tmpl.desc}</div>
                    {tmpl.isCustom && (
                      <button
                        type="button"
                        className="t-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = customTemplates.filter((x) => x.id !== tmpl.id);
                          setCustomTemplates(updated);
                          try { localStorage.setItem('admin_templates_v9', JSON.stringify(updated)); } catch (err) {}
                          showToast('Template deleted', 'fa-trash');
                        }}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GITHUB SYNC MODAL */}
      {isGitHubOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>
                <i className="fa-brands fa-github" /> GitHub Commits Sync
              </h2>
              <button type="button" className="modal-close" onClick={() => setIsGitHubOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-3">
                <label>Repository URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary w-full justify-center"
                onClick={fetchGithubCommits}
                disabled={isFetchingCommits}
              >
                {isFetchingCommits ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Fetching Commits...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-rotate" /> Fetch Recent Commits
                  </>
                )}
              </button>

              {githubCommits.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {githubCommits.map((c) => (
                    <div
                      key={c.hash}
                      className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg"
                    >
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                        {c.hash}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">{c.msg}</div>
                        <div className="text-[10px] text-slate-500">{c.date}</div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary text-xs py-1 px-2.5 shrink-0"
                        onClick={() => importCommitAsMilestone(c)}
                        title="Import as milestone"
                      >
                        <i className="fa-solid fa-plus" /> Import
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LINKEDIN IMPORT MODAL */}
      {isLinkedInOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2>
                <i className="fa-brands fa-linkedin text-sky-500" /> LinkedIn Import
              </h2>
              <button type="button" className="modal-close" onClick={() => setIsLinkedInOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-xs text-slate-400 mb-3">
                Import verified credentials, honors, and project achievements from your public LinkedIn profile.
              </p>
              <div className="form-group mb-4">
                <label>LinkedIn Profile URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setIsLinkedInOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleLinkedInImport}
                  disabled={isLinkedInImporting}
                >
                  {isLinkedInImporting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-download" /> Import Verified Credentials
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECYCLE BIN MODAL */}
      {isRecycleBinOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-content !max-w-2xl !bg-[#070c16]/95 !border-rose-500/30 !rounded-2xl !p-0 overflow-hidden shadow-2xl backdrop-blur-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a1120]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <i className="fa-solid fa-trash-can text-base" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">Recycle Bin</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {trash.length} {trash.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Recover deleted milestones or permanently purge them from your database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                onClick={() => setIsRecycleBinOpen(false)}
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Information Banner & Bulk Actions */}
            <div className="px-6 py-3 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <i className="fa-solid fa-circle-info text-cyan-400 text-xs" />
                <span>Items are preserved for 30 days before permanent deletion.</span>
              </div>
              {trash.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={restoreAllFromTrash}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-xs font-semibold transition-all"
                  >
                    <i className="fa-solid fa-rotate-left text-[11px]" />
                    <span>Restore All</span>
                  </button>
                  <button
                    type="button"
                    onClick={emptyTrash}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-semibold transition-all"
                  >
                    <i className="fa-solid fa-broom text-[11px]" />
                    <span>Empty Bin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Trash Items List */}
            <div className="p-6 max-h-[420px] overflow-y-auto space-y-3 custom-scrollbar">
              {trash.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl text-slate-600 mb-3 border border-white/5">
                    <i className="fa-regular fa-trash-can" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">Recycle Bin is Empty</h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Deleted milestones will be held here for 30 days for instant recovery.
                  </p>
                </div>
              ) : (
                trash.map((item) => {
                  const daysLeft = 30 - Math.floor((Date.now() - (item.deletedAt || Date.now())) / 86400000);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1120] border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent text-base shrink-0">
                          <i className={item.icon?.startsWith('fa-') && !item.icon.includes(' ') ? `fa-solid ${item.icon}` : item.icon || 'fa-solid fa-layer-group'} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.metaLabel || item.year || 'Milestone'}
                            </span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              <i className="fa-regular fa-clock text-[9px]" />
                              {daysLeft > 0 ? `${daysLeft} days left` : 'Purge due'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm transition-all"
                          onClick={() => restoreFromTrash(item.id)}
                        >
                          <i className="fa-solid fa-rotate-left text-[11px]" />
                          <span>Restore</span>
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xs transition-colors"
                          onClick={() => permanentlyDeleteFromTrash(item.id)}
                          title="Delete Permanently"
                        >
                          <i className="fa-regular fa-trash-can" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#0a1120] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Total Deleted: {trash.length}
              </span>
              <button
                type="button"
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
                onClick={() => setIsRecycleBinOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY LOG MODAL (Redesigned with Premium Glassmorphism) */}
      {isActivityOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-content !max-w-2xl !bg-[#070c16]/95 !border-cyan-500/30 !rounded-2xl !p-0 !overflow-hidden !shadow-2xl backdrop-blur-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-[#0a1120]/80">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-extrabold text-base shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <i className="fa-solid fa-clock-rotate-left" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Milestone Activity Log</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {activityLog.length} events
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time chronological audit trail of all milestone actions and updates.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activityLog.length > 0 && (
                  <button
                    type="button"
                    onClick={clearActivityLog}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-semibold transition-all"
                    title="Clear all activity history"
                  >
                    <i className="fa-solid fa-broom text-[11px]" />
                    <span>Clear History</span>
                  </button>
                )}
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors"
                  onClick={() => setIsActivityOpen(false)}
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>
            </div>

            {/* Modal Body / Timeline */}
            <div className="p-6 max-h-[440px] overflow-y-auto space-y-2.5 custom-scrollbar">
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl text-slate-600 mb-3 border border-white/5">
                    <i className="fa-solid fa-clock-rotate-left" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">No Activity Records Yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Actions such as creating, reordering, updating, and deleting milestones will be automatically recorded here.
                  </p>
                </div>
              ) : (
                activityLog.map((log) => {
                  const act = (log.action || '').toLowerCase();
                  let badgeClass = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
                  let iconClass = 'fa-bolt';

                  if (act.includes('reorder')) {
                    badgeClass = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
                    iconClass = 'fa-arrow-down-up-across-line';
                  } else if (act.includes('create') || act.includes('add')) {
                    badgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                    iconClass = 'fa-plus';
                  } else if (act.includes('delete') || act.includes('trash')) {
                    badgeClass = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
                    iconClass = 'fa-trash-can';
                  } else if (act.includes('move') || act.includes('down') || act.includes('up')) {
                    badgeClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                    iconClass = 'fa-arrows-up-down';
                  } else if (act.includes('restore')) {
                    badgeClass = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
                    iconClass = 'fa-rotate-left';
                  }

                  return (
                    <div
                      key={log.id}
                      className="flex items-start justify-between gap-3.5 p-3.5 rounded-xl bg-[#0a1120] border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 border mt-0.5 ${badgeClass}`}
                        >
                          <i className={`fa-solid ${iconClass}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border font-mono ${badgeClass}`}
                            >
                              {log.action}
                            </span>
                            <span className="text-xs font-semibold text-white">
                              {log.details}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <i className="fa-solid fa-laptop text-[9px]" />
                            <span>{log.device || 'Chrome on Windows'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/5 text-[10px] font-mono text-slate-400">
                        <i className="fa-regular fa-clock text-[9px]" />
                        <span>{log.time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#0a1120] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Audit trail active · Session synchronized
              </span>
              <button
                type="button"
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
                onClick={() => setIsActivityOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARE PANEL */}
      {isCompareActive && (
        <div className="compare-panel active" role="dialog">
          <div className="flex items-center justify-between p-3 border-b border-slate-800">
            <h3 className="font-display text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-columns text-cyan-400" /> Side-by-Side Milestone Comparison
            </h3>
            <button
              type="button"
              className="modal-close"
              onClick={() => {
                setIsCompareActive(false);
                setCompareIds([]);
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          <div className="compare-body">
            {compareIds.map((id, idx) => {
              const target = milestones.find((m) => m.id === id);
              if (!target) return null;
              return (
                <div key={id} className="flex-1 min-w-0 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                    Milestone {idx === 0 ? 'A' : 'B'}
                  </span>
                  <h4 className="font-display font-semibold text-sm text-white mb-1.5">{target.title}</h4>
                  <div className="text-xs text-slate-400 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: target.desc }} />
                  <div className="text-[11px] text-slate-400 flex flex-col gap-1 border-t border-slate-800 pt-2">
                    <div><b>Year:</b> {target.year}</div>
                    <div><b>Status:</b> {target.status}</div>
                    <div><b>Progress:</b> {target.progress}%</div>
                    <div><b>Rating:</b> {target.rating}/5 ★</div>
                    <div><b>Views:</b> {target.views}</div>
                    <div><b>Tags:</b> {target.tags.join(', ') || '—'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS OVERLAY */}
      {isShortcutsOpen && (
        <div className="shortcuts-overlay active" role="dialog" aria-modal="true">
          <div className="shortcuts-box">
            <h2>
              <i className="fa-solid fa-keyboard text-cyan-400" /> Keyboard Shortcuts
            </h2>
            <div className="shortcut-row">
              <span>Command Palette / Quick Navigation</span>
              <kbd>⌘K / Ctrl+K</kbd>
            </div>
            <div className="shortcut-row">
              <span>Create New Milestone</span>
              <kbd>N</kbd>
            </div>
            <div className="shortcut-row">
              <span>Toggle Focus Mode</span>
              <kbd>F</kbd>
            </div>
            <div className="shortcut-row">
              <span>Close Active Modal / Palette</span>
              <kbd>Esc</kbd>
            </div>
            <div className="shortcut-row">
              <span>Show Keyboard Shortcuts</span>
              <kbd>?</kbd>
            </div>
            <div className="shortcut-row">
              <span>Multi-select range</span>
              <kbd>Shift + Click</kbd>
            </div>
            <button
              type="button"
              className="btn btn-primary w-full justify-center mt-4"
              onClick={() => setIsShortcutsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* COMMAND PALETTE */}
      {isCommandPaletteOpen && (
        <div id="commandPalette" className="active" role="dialog" aria-modal="true">
          <div className="cp-box">
            <input
              type="text"
              className="cp-input"
              placeholder="Search actions or milestones..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsCommandPaletteOpen(false);
              }}
            />
            <div className="cp-results">
              <div
                className="cp-item"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  openNewWizard();
                }}
              >
                <i className="fa-solid fa-plus text-cyan-400" /> Add New Milestone
              </div>
              <div
                className="cp-item"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsTemplatesOpen(true);
                }}
              >
                <i className="fa-solid fa-layer-group text-violet-400" /> Open Templates Library
              </div>
              <div
                className="cp-item"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsGitHubOpen(true);
                }}
              >
                <i className="fa-brands fa-github text-slate-300" /> GitHub Commits Sync
              </div>
              <div
                className="cp-item"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsLinkedInOpen(true);
                }}
              >
                <i className="fa-brands fa-linkedin text-sky-500" /> LinkedIn Import
              </div>
              <div
                className="cp-item"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsRecycleBinOpen(true);
                }}
              >
                <i className="fa-solid fa-trash-can text-rose-400" /> Open Recycle Bin
              </div>
              <div
                className="cp-item"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsActivityOpen(true);
                }}
              >
                <i className="fa-solid fa-clock-rotate-left text-emerald-400" /> View Activity Log
              </div>
              <div
                className="cp-item"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsFocusMode((prev) => !prev);
                }}
              >
                <i className="fa-solid fa-expand text-amber-400" /> Toggle Focus Mode
              </div>

              {/* Milestone entries */}
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-2">
                Existing Milestones
              </div>
              {milestones.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="cp-item"
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    openEditWizard(m.id);
                  }}
                >
                  <i className="fa-solid fa-arrow-right text-cyan-400" /> {m.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SINGLE DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header border-b-0 pb-0">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation text-rose-500" /> Move to Recycle Bin?
              </h2>
            </div>
            <div className="modal-body py-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                This milestone will be moved to the Recycle Bin. You can restore it anytime within 30 days.
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 pt-0">
              <button
                type="button"
                className="btn btn-secondary text-xs"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger text-xs"
                onClick={confirmDelete}
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BULK DELETE MODAL (REQUIRES TYPING 'DELETE') */}
      {isBulkDeleteModalOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header border-b-0 pb-0">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-trash-can text-rose-500" /> Delete {selectedIds.size} Items?
              </h2>
            </div>
            <div className="modal-body py-4">
              <p className="text-xs text-slate-300 mb-3">
                To confirm moving <b>{selectedIds.size} items</b> to the Recycle Bin, please type{' '}
                <span className="font-mono text-rose-400 font-bold">DELETE</span> below:
              </p>
              <input
                type="text"
                className="form-control font-mono text-center tracking-widest uppercase"
                placeholder="DELETE"
                value={bulkConfirmText}
                onChange={(e) => setBulkConfirmText(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 p-4 pt-0">
              <button
                type="button"
                className="btn btn-secondary text-xs"
                onClick={() => setIsBulkDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger text-xs"
                disabled={bulkConfirmText !== 'DELETE'}
                onClick={handleConfirmBulkDelete}
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT-CLICK CONTEXT MENU */}
      {contextMenu.visible && (
        <div
          className="context-menu active"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-item" onClick={() => executeContextAction('edit')}>
            <i className="fa-solid fa-pen-to-square text-amber-400" /> Edit Milestone
          </div>
          <div className="context-item" onClick={() => executeContextAction('duplicate')}>
            <i className="fa-solid fa-copy text-sky-400" /> Duplicate
          </div>
          <div className="context-item" onClick={() => executeContextAction('compare')}>
            <i className="fa-solid fa-columns text-violet-400" /> Compare
          </div>
          <div className="context-item" onClick={() => executeContextAction('pin')}>
            <i className="fa-solid fa-thumbtack text-amber-400" /> Pin to Top
          </div>
          <div className="context-item" onClick={() => executeContextAction('copyLink')}>
            <i className="fa-solid fa-link text-emerald-400" /> Copy Link
          </div>
          <div className="context-item" onClick={() => executeContextAction('share')}>
            <i className="fa-solid fa-share-nodes text-cyan-400" /> Share
          </div>
          <div className="context-item" onClick={() => executeContextAction('saveTemplate')}>
            <i className="fa-solid fa-bookmark text-pink-400" /> Save as Template
          </div>
          <div className="context-divider" />
          <div className="context-item" onClick={() => executeContextAction('moveUp')}>
            <i className="fa-solid fa-arrow-up text-slate-300" /> Move Up
          </div>
          <div className="context-item" onClick={() => executeContextAction('moveDown')}>
            <i className="fa-solid fa-arrow-down text-slate-300" /> Move Down
          </div>
          <div className="context-divider" />
          <div className="context-item danger" onClick={() => executeContextAction('delete')}>
            <i className="fa-solid fa-trash-can" /> Delete
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMilestones;

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { playTick } from '../../../utils/audio';

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
  openConfirmModal
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
      image: item.image || null,
      imageAlt: item.imageAlt || '',
      link: item.link || '',
      published: item.published !== false,
      pinned: !!item.pinned,
      views: item.views !== undefined ? Number(item.views) : 100 + (idx * 25),
      createdAt: item.createdAt || new Date().toISOString()
    }));
  }, [profile.learningJourney]);

  const [milestones, setMilestones] = useState(rawJourney);

  // Keep local milestones in sync with incoming rawJourney
  useEffect(() => {
    setMilestones(rawJourney);
  }, [rawJourney]);

  // Sub-tabs: 'journey' | 'academic' | 'bio'
  const [subTab, setSubTab] = useState('journey');

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
  const [displayedCount, setDisplayedCount] = useState(8);

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
  const [wizardTags, setWizardTags] = useState('');
  const [wizardLink, setWizardLink] = useState('');
  const [wizardIcon, setWizardIcon] = useState('fa-layer-group');
  const [wizardImageData, setWizardImageData] = useState(null);
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

  // Academic Qualifications Form State
  const [academicForm, setAcademicForm] = useState({
    degree: profile.education?.degree || 'B.Tech in Computer Science and Engineering (CSE)',
    college: profile.education?.college || 'SISTec (Sagar Institute of Science and Technology), Bhopal',
    cgpa: profile.education?.cgpa || '8.42',
    schoolBoard: profile.education?.schoolBoard || 'MP Board (Class XII)',
    schoolXII: profile.education?.schoolXII || 'Kasturba Vidhya Mandir, Jamani, Madhya Pradesh',
    schoolScore: profile.education?.schoolScore || '83.5%',
    location: profile.education?.location || 'Bhopal, Madhya Pradesh, India',
    stage: profile.education?.stage || 'Batch of 2024–2028 (Currently in 4th Semester)'
  });

  // Bio & Story State
  const [bioParagraphs, setBioParagraphs] = useState(() => {
    if (Array.isArray(profile.aboutBio) && profile.aboutBio.length > 0) {
      return [...profile.aboutBio];
    }
    return [
      'I am Ayush Prajapati, a Computer Science & Engineering (CSE) undergraduate at SISTec, Bhopal maintaining an 8.42 CGPA with strong problem-solving fundamentals in C, Java, JavaScript, and Python.',
      'My technical focus centers on architecting responsive, production-ready web applications using React.js, Node.js, Express.js, MongoDB, and Cloudinary, alongside deploying robust full-stack applications.',
      'I enjoy building ambitious interactive experiences—such as a live Zerodha trading system clone and Gemini AI ChatGPT assistant—and continually pushing code quality, architecture scalability, and user empathy.'
    ];
  });
  const [newBioParagraph, setNewBioParagraph] = useState('');

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
  const cgpaDisplay = academicForm.cgpa.replace(/[^0-9.]/g, '') || '8.42';

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
    setWizardTags('');
    setWizardLink('');
    setWizardIcon('fa-layer-group');
    setWizardImageData(null);
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
    setWizardTags(m.tags ? m.tags.join(', ') : '');
    setWizardLink(m.link || '');
    setWizardIcon(m.icon || 'fa-layer-group');
    setWizardImageData(m.image || null);
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
              desc: sanitizedDesc,
              tags: parsedTags,
              link: wizardLink.trim(),
              icon: wizardIcon,
              image: wizardImageData,
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
        const newMilestone = {
          id: `m-${Date.now()}`,
          title: wizardTitle.trim(),
          metaLabel: wizardMeta.trim() || 'Milestone',
          year: wizardYear,
          status: wizardStatus,
          progress: Number(wizardProgress) || 0,
          rating: Number(wizardRating) || 0,
          desc: sanitizedDesc,
          tags: parsedTags,
          link: wizardLink.trim(),
          icon: wizardIcon,
          image: wizardImageData,
          imageAlt: wizardImageAlt.trim(),
          published: true,
          pinned: false,
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

  // Save Academic Education
  const handleSaveAcademic = (e) => {
    e.preventDefault();
    playTick();
    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        education: {
          ...prev.profile.education,
          ...academicForm
        }
      }
    }), session?.token);
    logActivity('Academic Update', 'Updated education qualifications and CGPA');
    showToast('Academic credentials saved successfully!', 'fa-graduation-cap');
  };

  // Save Bio & Story
  const handleSaveBio = () => {
    playTick();
    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        aboutBio: bioParagraphs
      }
    }), session?.token);
    logActivity('Bio Update', `Updated biography (${bioParagraphs.length} paragraphs)`);
    showToast('Biography saved to public About section!', 'fa-user-check');
  };

  const handleAddBioParagraph = () => {
    if (!newBioParagraph.trim()) return;
    playTick();
    setBioParagraphs([...bioParagraphs, newBioParagraph.trim()]);
    setNewBioParagraph('');
  };

  const handleRemoveBioParagraph = (idx) => {
    playTick();
    setBioParagraphs(bioParagraphs.filter((_, i) => i !== idx));
  };

  const handleMoveBioParagraph = (idx, dir) => {
    playTick();
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= bioParagraphs.length) return;
    const copy = [...bioParagraphs];
    const item = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = item;
    setBioParagraphs(copy);
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

      {/* 0. TOP ACTION BANNER — consistent with all other admin tabs */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--brand-color, #06b6d4)' }}>
            <i className="fa-solid fa-sitemap" /> ABOUT & MILESTONES STUDIO
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Journey & Story</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your academic credentials, chronological milestones roadmap, and live public biography.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
            Live in Portfolio
          </div>
          <button
            type="button"
            onClick={() => { playTick(); setIsWizardOpen(true); setWizardStep(1); }}
            className="btn-create-project"
            style={{ background: 'linear-gradient(135deg, var(--brand-color, #06b6d4), var(--accent-2, #3b82f6))', boxShadow: '0 4px 20px var(--brand-glow, rgba(6,182,212,0.4))' }}
          >
            <i className="fa-solid fa-plus" />
            <span>New Milestone</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Journey | Academic | Bio */}
      <div className="sub-tabs-sticky-header">
        <div className="sub-tabs" role="tablist">
          <button
            type="button"
            className={`sub-tab ${subTab === 'journey' ? 'active' : ''}`}
            onClick={() => { playTick(); setSubTab('journey'); }}
          >
            <i className="fa-solid fa-route" /> Journey Roadmap
          </button>
          <button
            type="button"
            className={`sub-tab ${subTab === 'academic' ? 'active' : ''}`}
            onClick={() => { playTick(); setSubTab('academic'); }}
          >
            <i className="fa-solid fa-graduation-cap" /> Academic Credentials
          </button>
          <button
            type="button"
            className={`sub-tab ${subTab === 'bio' ? 'active' : ''}`}
            onClick={() => { playTick(); setSubTab('bio'); }}
          >
            <i className="fa-solid fa-user-pen" /> Bio & Story
          </button>
        </div>
      </div>

      {/* Stats Cards — use global stat-card classes matching Overview & Certificates */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">Total Milestones</div>
            <div className="stat-icon icon-cyan"><i className="fa-solid fa-flag" /></div>
          </div>
          <div>
            <div className="stat-value cyan">{totalCount}</div>
            <div className="stat-trend"><i className="fa-solid fa-route" style={{ color: 'var(--brand-color, #06b6d4)' }} /><span>Recorded entries</span></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">Completed</div>
            <div className="stat-icon icon-green"><i className="fa-solid fa-circle-check" /></div>
          </div>
          <div>
            <div className="stat-value green">{completedCount}</div>
            <div className="stat-trend"><i className="fa-solid fa-check-double" style={{ color: '#4ade80' }} /><span>Milestones achieved</span></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">Active Focus</div>
            <div className="stat-icon icon-purple"><i className="fa-solid fa-bullseye" /></div>
          </div>
          <div>
            <div className="stat-value purple">{focusCount}</div>
            <div className="stat-trend"><i className="fa-solid fa-fire" style={{ color: '#c084fc' }} /><span>In progress now</span></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">B.Tech CGPA</div>
            <div className="stat-icon icon-orange"><i className="fa-solid fa-graduation-cap" /></div>
          </div>
          <div>
            <div className="stat-value orange">{cgpaDisplay}</div>
            <div className="stat-trend"><i className="fa-solid fa-star" style={{ color: '#fbbf24' }} /><span>Academic record</span></div>
          </div>
        </div>
      </div>

      {/* TAB 1: JOURNEY ROADMAP */}
      {subTab === 'journey' && (
        <div className="flex gap-4 items-start w-full relative">
          {/* Main Left Content */}
          <div className="flex-1 min-w-0">
            {/* Sticky Controls Toolbar */}
            <div className="sticky-toolbar-wrapper">
              <div className="controls-toolbar">
                <div className="toolbar-row">
                  <div className="filters-group">
                    <select
                      className="filter-select"
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
                      className="filter-select"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      aria-label="Filter year"
                    >
                      <option value="all">Year: All</option>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Present">Present</option>
                    </select>

                    <select
                      className="filter-select"
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
                      className="filter-input"
                      placeholder="Filter by tag..."
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                    />
                  </div>
                </div>

                <div className="toolbar-row">
                  {/* Bulk Actions Indicator */}
                  {selectedIds.size > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-300">
                        {selectedIds.size} selected
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary text-xs"
                        onClick={handleBulkComplete}
                      >
                        <i className="fa-solid fa-check" /> Complete
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger text-xs"
                        onClick={handleBulkDeletePrompt}
                      >
                        <i className="fa-solid fa-trash-can" /> Delete
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary text-xs"
                        onClick={() => {
                          if (selectedIds.size < 2) {
                            showToast('Select at least 2 milestones to compare', 'fa-info');
                            return;
                          }
                          setCompareIds(Array.from(selectedIds).slice(0, 2));
                          setIsCompareActive(true);
                        }}
                      >
                        <i className="fa-solid fa-columns" /> Compare
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary text-xs"
                        onClick={() => setSelectedIds(new Set())}
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      Tip: Hold <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Shift</kbd> to multi-select
                    </div>
                  )}

                  {/* Action Buttons Right */}
                  <div className="action-buttons ml-auto flex items-center gap-1.5">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsGitHubOpen(true)}
                      title="Sync from GitHub Commits"
                      aria-label="GitHub Sync"
                    >
                      <i className="fa-brands fa-github" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsLinkedInOpen(true)}
                      title="Import from LinkedIn"
                      aria-label="LinkedIn Import"
                    >
                      <i className="fa-brands fa-linkedin text-sky-500" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsTemplatesOpen(true)}
                      title="Open Milestone Templates Library"
                    >
                      <i className="fa-solid fa-layer-group text-violet-400" /> Templates
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={openNewWizard}
                    >
                      <i className="fa-solid fa-plus" /> New Milestone
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Search Bar */}
            <div className="search-center-wrapper">
              <div className="search-center-inner">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search milestones across title, description, or technology tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            </div>

            {/* Milestones Scroll Container */}
            <div className="milestones-scroll-container" ref={scrollContainerRef}>
              {filteredMilestones.length === 0 ? (
                <div className="text-center py-16 px-6 bg-slate-900/40 border border-dashed border-slate-700/60 rounded-2xl">
                  <i className="fa-solid fa-magnifying-glass text-3xl text-cyan-400/50 mb-3" />
                  <h3 className="font-display font-semibold text-base mb-1">No Milestones Found</h3>
                  <p className="text-sm text-slate-400 mb-4">No entries match your search criteria or filters.</p>
                  <button type="button" className="btn btn-primary" onClick={openNewWizard}>
                    <i className="fa-solid fa-plus" /> Add First Milestone
                  </button>
                </div>
              ) : (
                <div className="milestones-list">
                  {filteredMilestones.slice(0, displayedCount).map((m, index) => {
                    const isSelected = selectedIds.has(m.id);
                    return (
                      <article
                        key={m.id}
                        className={`milestone-card ${m.pinned ? 'pinned' : ''} ${isSelected ? 'selected' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, m.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, m.id)}
                        onContextMenu={(e) => handleContextMenu(e, m.id)}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          className="card-checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(m.id, e.nativeEvent)}
                          aria-label={`Select ${m.title}`}
                        />

                        {/* Milestone Icon */}
                        <div className="card-icon">
                          <i className={m.icon.startsWith('fa-') && !m.icon.includes(' ') ? `fa-solid ${m.icon}` : m.icon} />
                        </div>

                        {/* Card Content */}
                        <div className="card-content">
                          <div className="card-meta">
                            <span className="meta-text">{m.metaLabel || 'Milestone'}</span>
                            <span className="meta-badge">{m.year}</span>
                            {m.status === 'focus' && (
                              <span className="meta-badge badge-focus">
                                <i className="fa-solid fa-bolt" /> FOCUS
                              </span>
                            )}
                            {m.status === 'completed' && (
                              <span className="meta-badge badge-completed">
                                <i className="fa-solid fa-check" /> DONE
                              </span>
                            )}
                            {m.status === 'planned' && (
                              <span className="meta-badge badge-planned">
                                <i className="fa-solid fa-clock" /> PLANNED
                              </span>
                            )}
                            {m.rating > 0 && (
                              <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`fa-solid fa-star ${star <= m.rating ? '' : 'off'}`}
                                  />
                                ))}
                              </div>
                            )}
                            <label className="switch ml-1" title={m.published ? 'Published' : 'Draft'}>
                              <input
                                type="checkbox"
                                checked={m.published}
                                onChange={(e) => handleTogglePublish(m.id, e.target.checked)}
                              />
                              <span className="slider" />
                            </label>
                            <span className="views-badge">
                              <i className="fa-solid fa-eye" /> {m.views || 0}
                            </span>
                          </div>

                          {/* Editable Title */}
                          <h3
                            className="card-title"
                            onDoubleClick={() => handleStartInlineEdit(m.id, m.title)}
                            title="Double-click to quick rename"
                          >
                            {m.title}
                          </h3>

                          {/* Description */}
                          <div
                            className="card-desc"
                            dangerouslySetInnerHTML={{ __html: m.desc }}
                          />

                          {/* Cover Image */}
                          {m.image && (
                            <img
                              src={m.image}
                              alt={m.imageAlt || m.title}
                              loading="lazy"
                              className="max-h-24 rounded-lg mt-2 border border-slate-700/50"
                            />
                          )}

                          {/* Tech Tags */}
                          {m.tags && m.tags.length > 0 && (
                            <div className="card-tags">
                              {m.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="tag-chip">
                                  <i className="fa-solid fa-tag text-[10px]" /> {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Progress Bar */}
                          {m.status === 'focus' && m.progress > 0 && (
                            <div className="mt-2">
                              <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${m.progress}%` }} />
                              </div>
                              <span className="progress-text">{m.progress}% Completed</span>
                            </div>
                          )}

                          {/* External Link */}
                          {m.link && (
                            <a
                              href={m.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 font-semibold inline-flex items-center gap-1 mt-2 hover:underline"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" /> Visit Resource
                            </a>
                          )}
                        </div>

                        {/* Action Buttons Right */}
                        <div className="card-actions">
                          <button
                            type="button"
                            className={`action-btn pin-btn ${m.pinned ? 'active' : ''}`}
                            onClick={() => handleTogglePin(m.id)}
                            title={m.pinned ? 'Unpin' : 'Pin to top'}
                          >
                            <i className="fa-solid fa-thumbtack" />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => handleMoveUp(m.id)}
                            title="Move Up"
                          >
                            <i className="fa-solid fa-arrow-up" />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => handleMoveDown(m.id)}
                            title="Move Down"
                          >
                            <i className="fa-solid fa-arrow-down" />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => handleAddToCompare(m.id)}
                            title="Compare"
                          >
                            <i className="fa-solid fa-columns" />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => handleDuplicate(m.id)}
                            title="Duplicate"
                          >
                            <i className="fa-solid fa-copy" />
                          </button>
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() => openEditWizard(m.id)}
                            title="Edit Milestone"
                          >
                            <i className="fa-solid fa-pen-to-square" />
                          </button>
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => handlePromptDelete(m.id)}
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash-can" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredMilestones.length > 8 && (
                <div className="pagination-controls mt-4 flex items-center justify-center gap-2">
                  {displayedCount < filteredMilestones.length && (
                    <button
                      type="button"
                      className="btn btn-secondary text-xs"
                      onClick={() => setDisplayedCount((prev) => prev + 6)}
                    >
                      Load More <i className="fa-solid fa-chevron-down" />
                    </button>
                  )}
                  {displayedCount > 8 && (
                    <button
                      type="button"
                      className="btn btn-secondary text-xs"
                      onClick={() => setDisplayedCount(8)}
                    >
                      Show Less <i className="fa-solid fa-chevron-up" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Resizer Divider Bar between Main Content and Live Preview */}
          {!isPiP && (
            <div
              className="preview-resizer-bar"
              onMouseDown={handleMouseDownResize}
              role="separator"
              aria-orientation="vertical"
              title="Drag to resize Live Portfolio Preview"
            >
              <div className="resizer-handle-pill" />
            </div>
          )}

          {/* Resizable Live Preview Right Panel */}
          <div
            className={`right-panel ${isPiP ? 'pip-mode' : ''}`}
            style={{
              width: isPiP ? '360px' : `${rightPanelWidth}px`,
              minWidth: isPiP ? '360px' : `${rightPanelWidth}px`,
              maxWidth: isPiP ? '360px' : `${rightPanelWidth}px`,
              flexBasis: isPiP ? '360px' : `${rightPanelWidth}px`,
              '--preview-panel-width': isPiP ? '360px' : `${rightPanelWidth}px`
            }}
          >
            <div className="preview-header">
              <div className="flex items-center gap-2">
                <i className="fa-regular fa-eye text-accent" />
                <h3 className="text-white font-semibold text-[13px] tracking-wide">Live Portfolio Preview</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 ml-1">
                  {milestones.filter((m) => m.published).length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => {
                    playTick();
                    navigator.clipboard.writeText(`${window.location.origin}/about`);
                    showToast('Public portfolio link copied!', 'fa-copy');
                  }}
                  title="Copy Public About Link"
                  style={{ width: '26px', height: '26px' }}
                >
                  <i className="fa-regular fa-copy text-xs" />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setIsPiP((prev) => !prev)}
                  title={isPiP ? 'Dock Preview' : 'Picture-in-Picture Floating Mode'}
                  style={{ width: '26px', height: '26px' }}
                >
                  <i className={`fa-solid ${isPiP ? 'fa-window-restore' : 'fa-clone'}`} />
                </button>
              </div>
            </div>

            <div className="preview-body">
              {milestones.filter((m) => m.published).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <i className="fa-regular fa-folder-open text-2xl mb-2 opacity-50" />
                  <p className="text-xs">No published milestones yet.</p>
                </div>
              ) : (
                <div className="space-y-4 border-l border-white/10 pl-4 ml-2 my-1">
                  {milestones
                    .filter((m) => m.published)
                    .map((m) => (
                      <div
                        key={m.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, m.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, m.id)}
                        className="preview-milestone relative group transition-all duration-200 cursor-grab active:cursor-grabbing p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10"
                      >
                        {/* Timeline Node Dot */}
                        <div className="absolute -left-[23px] top-4 w-2.5 h-2.5 rounded-full bg-accent border-2 border-[#0a111c] group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(255,75,157,0.4)]" />

                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-accent font-semibold text-[13px] leading-snug flex items-center gap-1.5 flex-1">
                            <i className="fa-solid fa-grip-vertical text-slate-500 group-hover:text-accent text-[11px] cursor-grab" title="Drag to reorder" />
                            <i className={m.icon.startsWith('fa-') && !m.icon.includes(' ') ? `fa-solid ${m.icon} text-[11px]` : `${m.icon} text-[11px]`} />
                            <span>{m.title}</span>
                          </h4>

                          {/* Quick Up/Down Buttons on hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveUp(m.id);
                              }}
                              className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-[9px] transition-colors"
                              title="Move Up"
                            >
                              <i className="fa-solid fa-arrow-up" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveDown(m.id);
                              }}
                              className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-[9px] transition-colors"
                              title="Move Down"
                            >
                              <i className="fa-solid fa-arrow-down" />
                            </button>
                          </div>
                        </div>

                        {/* Description snippet */}
                        <div
                          className="text-slate-400 text-[11.5px] leading-relaxed line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: m.desc }}
                        />

                        {/* Skills / Technology Tags */}
                        {Array.isArray(m.tags) && m.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {m.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-slate-300"
                              >
                                <i className="fa-solid fa-code text-[8px] text-cyan-400" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {m.image && (
                          <img
                            src={m.image}
                            alt={m.imageAlt || m.title}
                            className="rounded-lg mt-2 max-h-24 w-full object-cover border border-white/10"
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC CREDENTIALS */}
      {subTab === 'academic' && (
        <div className="max-w-4xl bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div>
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap text-cyan-400" />
                Academic Qualifications
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure your verified academic degree, CGPA, high school marks, and institution details.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveAcademic}
            >
              <i className="fa-solid fa-floppy-disk" /> Save Academic Credentials
            </button>
          </div>

          <form onSubmit={handleSaveAcademic} className="flex flex-col gap-5">
            <div className="form-row">
              <div className="form-group">
                <label>Undergraduate Degree</label>
                <input
                  type="text"
                  className="form-control"
                  value={academicForm.degree}
                  onChange={(e) => setAcademicForm({ ...academicForm, degree: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>College / University</label>
                <input
                  type="text"
                  className="form-control"
                  value={academicForm.college}
                  onChange={(e) => setAcademicForm({ ...academicForm, college: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Undergraduate CGPA</label>
                <input
                  type="text"
                  className="form-control"
                  value={academicForm.cgpa}
                  onChange={(e) => setAcademicForm({ ...academicForm, cgpa: e.target.value })}
                  placeholder="e.g. 8.42"
                />
              </div>
              <div className="form-group">
                <label>Academic Stage / Batch</label>
                <input
                  type="text"
                  className="form-control"
                  value={academicForm.stage}
                  onChange={(e) => setAcademicForm({ ...academicForm, stage: e.target.value })}
                  placeholder="e.g. Batch of 2024–2028"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>High School / Class XII School</label>
                <input
                  type="text"
                  className="form-control"
                  value={academicForm.schoolXII}
                  onChange={(e) => setAcademicForm({ ...academicForm, schoolXII: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Class XII Score & Year</label>
                <input
                  type="text"
                  className="form-control"
                  value={academicForm.schoolScore}
                  onChange={(e) => setAcademicForm({ ...academicForm, schoolScore: e.target.value })}
                  placeholder="e.g. 83.5% | 2022"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>School Board</label>
                <input
                  type="text"
                  className="form-control"
                  value={academicForm.schoolBoard}
                  onChange={(e) => setAcademicForm({ ...academicForm, schoolBoard: e.target.value })}
                  placeholder="e.g. MP Board (Class XII)"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={academicForm.location}
                  onChange={(e) => setAcademicForm({ ...academicForm, location: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn btn-primary">
                <i className="fa-solid fa-floppy-disk" /> Save Academic Credentials
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: BIO & STORY */}
      {subTab === 'bio' && (
        <div className="max-w-4xl bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div>
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <i className="fa-solid fa-user-pen text-violet-400" />
                Live Public Biography & Narrative
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Craft the multi-paragraph personal story shown in the public About page.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveBio}
            >
              <i className="fa-solid fa-floppy-disk" /> Save Public Biography
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {bioParagraphs.map((para, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex gap-3 items-start"
              >
                <div className="flex flex-col gap-1 items-center pt-1 text-slate-500">
                  <span className="text-[10px] font-mono font-bold">#{idx + 1}</span>
                  <button
                    type="button"
                    className="p-1 hover:text-white"
                    onClick={() => handleMoveBioParagraph(idx, -1)}
                    disabled={idx === 0}
                    title="Move paragraph up"
                  >
                    <i className="fa-solid fa-chevron-up text-xs" />
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:text-white"
                    onClick={() => handleMoveBioParagraph(idx, 1)}
                    disabled={idx === bioParagraphs.length - 1}
                    title="Move paragraph down"
                  >
                    <i className="fa-solid fa-chevron-down text-xs" />
                  </button>
                </div>
                <textarea
                  className="form-control flex-1 text-sm leading-relaxed"
                  rows={3}
                  value={para}
                  onChange={(e) => {
                    const copy = [...bioParagraphs];
                    copy[idx] = e.target.value;
                    setBioParagraphs(copy);
                  }}
                />
                <button
                  type="button"
                  className="text-slate-500 hover:text-rose-400 p-2"
                  onClick={() => handleRemoveBioParagraph(idx)}
                  title="Delete paragraph"
                >
                  <i className="fa-solid fa-trash-can text-sm" />
                </button>
              </div>
            ))}

            {/* Add New Paragraph */}
            <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                + Add New Paragraph
              </label>
              <textarea
                className="form-control text-sm"
                rows={3}
                placeholder="Write an additional paragraph for your portfolio story..."
                value={newBioParagraph}
                onChange={(e) => setNewBioParagraph(e.target.value)}
              />
              <div className="flex justify-end mt-2.5">
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={handleAddBioParagraph}
                  disabled={!newBioParagraph.trim()}
                >
                  <i className="fa-solid fa-plus" /> Append Paragraph
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button type="button" className="btn btn-primary" onClick={handleSaveBio}>
                <i className="fa-solid fa-floppy-disk" /> Save Public Biography
              </button>
            </div>
          </div>
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

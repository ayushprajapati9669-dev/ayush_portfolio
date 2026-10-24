import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
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

// Preset Phases with thematic colors
const PHASE_PRESETS = [
  { name: 'Full-Stack Practice', color: '#06b6d4', icon: 'fa-layer-group' },
  { name: 'Academic Degree', color: '#3b82f6', icon: 'fa-graduation-cap' },
  { name: 'Foundation', color: '#10b981', icon: 'fa-code' },
  { name: 'Current Focus', color: '#a855f7', icon: 'fa-brain' },
  { name: 'Emerging Tech & AI', color: '#ec4899', icon: 'fa-robot' },
  { name: 'Hackathon & Honors', color: '#f59e0b', icon: 'fa-trophy' }
];

const YEAR_PRESETS = ['Present', 'Year 3', 'Year 1-2', '2023 - 2027', '2022', 'Semester 4'];

const ICON_OPTIONS = [
  { id: 'fa-graduation-cap', label: 'Academic' },
  { id: 'fa-layer-group', label: 'Full-Stack' },
  { id: 'fa-code', label: 'Code' },
  { id: 'fa-brain', label: 'AI / Logic' },
  { id: 'fa-trophy', label: 'Award' },
  { id: 'fa-rocket', label: 'Launch' },
  { id: 'fa-laptop-code', label: 'Software' },
  { id: 'fa-shield-halved', label: 'Security' },
  { id: 'fa-bolt', label: 'Fast' },
  { id: 'fa-book-open', label: 'Learning' }
];

const RECOMMENDED_SKILLS = [
  'React JS',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Data Structures',
  'Algorithms',
  'C Programming',
  'Java',
  'Python',
  'MySQL',
  'Tailwind CSS',
  'REST APIs',
  'System Design',
  'AI / ML'
];

const CURATED_PRESET_TEMPLATES = [
  {
    phase: 'Academic Degree',
    yearBadge: '2023 - 2027',
    title: 'B.Tech in Computer Science & Engineering (CGPA 8.42)',
    description: 'Pursuing undergraduate degree at SISTec, Bhopal with distinction (8.42 CGPA). Core coursework in Operating Systems, DBMS, Computer Networks, and OOP.',
    status: 'in-progress',
    icon: 'fa-graduation-cap',
    metric: '8.42 CGPA',
    skills: ['Data Structures', 'Algorithms', 'Java', 'C Programming', 'MySQL']
  },
  {
    phase: 'Full-Stack Practice',
    yearBadge: 'Year 3',
    title: 'MERN Stack & Scalable Systems Architecture',
    description: 'Engineering production-style applications including Zerodha trading platform clone and ChatGPT conversational AI assistant with clean REST endpoints.',
    status: 'completed',
    icon: 'fa-layer-group',
    metric: 'Production Grade',
    skills: ['React JS', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS']
  },
  {
    phase: 'Foundation',
    yearBadge: 'Year 1-2',
    title: 'Core Programming, DSA & CS Fundamentals',
    description: 'Established strong computational foundations in procedural and object-oriented programming with rigorous problem-solving in C, Java, and Python.',
    status: 'completed',
    icon: 'fa-code',
    metric: 'Core CS',
    skills: ['C Programming', 'Java', 'Python', 'Algorithms', 'Data Structures']
  },
  {
    phase: 'Current Focus',
    yearBadge: 'Present',
    title: 'Algorithmic Fluency & Applied AI Integration',
    description: 'Deepening algorithmic problem solving and investigating modern conversational workflow integrations into full-stack web applications.',
    status: 'in-progress',
    icon: 'fa-brain',
    metric: 'Active Focus',
    skills: ['Algorithms', 'AI / ML', 'System Design', 'REST APIs']
  },
  {
    phase: 'Foundation',
    yearBadge: '2022',
    title: 'Higher Secondary Certificate (Class XII) · 80% MPBSE',
    description: 'Completed higher secondary education from Kasturba Vidhya Mandir, Jamani under MP Board with strong academic performance.',
    status: 'completed',
    icon: 'fa-book-open',
    metric: '80% Score',
    skills: ['Mathematics', 'Physics', 'Chemistry']
  }
];

export function AdminMilestones({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const p = appState.profile || {};
  const milestones = p.learningJourney || [];

  // Active Sub-Tab: 'timeline' | 'academic' | 'bio' | 'preview'
  const [activeSubTab, setActiveSubTab] = useState('timeline');

  // Form State for Milestone
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [form, setForm] = useState({
    phase: 'Full-Stack Practice',
    yearBadge: 'Year 3',
    title: '',
    description: '',
    status: 'in-progress',
    icon: 'fa-layer-group',
    metric: '',
    skills: 'React JS, Node.js, Express.js, MongoDB',
    link: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [milestoneStep, setMilestoneStep] = useState(1);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Preset templates dropdown
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  // Academic Qualifications Form State
  const [eduForm, setEduForm] = useState({
    degree: p.education?.degree || 'B.Tech in Computer Science and Engineering',
    college: p.education?.college || 'SISTec, Bhopal',
    cgpa: p.education?.cgpa || '8.42',
    stage: p.education?.stage || '2023 – 2027 (Currently in 4th Semester)',
    schoolXII: p.education?.schoolXII || 'Kasturba Vidhya Mandir, Jamani, MP',
    schoolScore: p.education?.schoolScore || '80%',
    schoolBoard: p.education?.schoolBoard || 'MP Board (Class XII)'
  });

  // About Biography Paragraphs Form State
  const [bioList, setBioList] = useState(
    Array.isArray(p.aboutBio) && p.aboutBio.length > 0
      ? p.aboutBio
      : [
          'I am a third-year B.Tech Computer Science and Engineering student at SISTec, Bhopal, focused on building full-stack web applications with the MERN stack and strengthening my core software engineering fundamentals.',
          'Alongside developing full-stack interfaces and REST APIs with React, Node.js, Express, and MongoDB, I actively practice Data Structures and Algorithms in C, Java, and Python to sharpen how I reason about time complexity, state, and system design.',
          'I am also exploring Artificial Intelligence and Machine Learning—specifically how modern conversational workflows and intelligent tooling can be integrated cleanly into practical web software.'
        ]
  );
  const [newBioText, setNewBioText] = useState('');
  const [aboutEyebrow, setAboutEyebrow] = useState(p.aboutEyebrow || p.eyebrow || 'Computer Science Student · Developer · Builder');

  const formTopRef = useRef(null);
  const presetsRef = useRef(null);
  const previewCardRef = useRef(null);

  // Close presets dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target)) {
        setIsPresetsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Parse skill tags
  const currentSkills = useMemo(() => {
    if (!form.skills) return [];
    return form.skills.split(',').map((s) => s.trim()).filter(Boolean);
  }, [form.skills]);

  const handleAddSkill = (tagToAdd) => {
    const clean = (tagToAdd || skillInput).trim();
    if (!clean) return;
    playTick();
    if (!currentSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      const updated = [...currentSkills, clean];
      setForm((prev) => ({ ...prev, skills: updated.join(', ') }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (tagToRemove) => {
    playTick();
    const updated = currentSkills.filter((s) => s.toLowerCase() !== tagToRemove.toLowerCase());
    setForm((prev) => ({ ...prev, skills: updated.join(', ') }));
  };

  const handleEdit = (idx) => {
    playTick();
    const item = milestones[idx];
    setEditingIdx(idx);
    setMilestoneStep(1);
    setForm({
      phase: item.phase || 'Full-Stack Practice',
      yearBadge: item.yearBadge || item.year || 'Year 3',
      title: item.title || '',
      description: item.description || item.detail || '',
      status: item.status || 'in-progress',
      icon: item.icon || 'fa-layer-group',
      metric: item.metric || '',
      skills: Array.isArray(item.skills) ? item.skills.join(', ') : item.skills || '',
      link: item.link || ''
    });
    setErrors({});
    setIsFormOpen(true);

    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleCancel = () => {
    playTick();
    setEditingIdx(null);
    setMilestoneStep(1);
    setForm({
      phase: 'Full-Stack Practice',
      yearBadge: 'Year 3',
      title: '',
      description: '',
      status: 'in-progress',
      icon: 'fa-layer-group',
      metric: '',
      skills: 'React JS, Node.js, Express.js, MongoDB',
      link: ''
    });
    setErrors({});
    setIsFormOpen(false);
  };

  const handleApplyPreset = (preset) => {
    playTick();
    setMilestoneStep(1);
    setForm({
      phase: preset.phase,
      yearBadge: preset.yearBadge,
      title: preset.title,
      description: preset.description,
      status: preset.status,
      icon: preset.icon,
      metric: preset.metric,
      skills: preset.skills.join(', '),
      link: ''
    });
    setIsPresetsOpen(false);
    setIsFormOpen(true);
    showToast(`Loaded "${preset.title.slice(0, 30)}..." preset`, 'fa-wand-magic-sparkles');
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const validateMilestoneStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!form.phase.trim()) errs.phase = 'Phase category is required.';
      if (!form.yearBadge.trim()) errs.yearBadge = 'Timeline / year badge is required.';
    } else if (step === 2) {
      if (!form.title.trim()) errs.title = 'Milestone title is required.';
      if (!form.description.trim()) errs.description = 'Milestone description is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextMilestoneStep = () => {
    playTick();
    if (validateMilestoneStep(milestoneStep)) {
      setErrors({});
      setMilestoneStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevMilestoneStep = () => {
    playTick();
    setErrors({});
    setMilestoneStep((prev) => Math.max(prev - 1, 1));
  };

  const handleJumpToMilestoneStep = (targetStep) => {
    playTick();
    if (targetStep < milestoneStep || validateMilestoneStep(milestoneStep)) {
      setErrors({});
      setMilestoneStep(targetStep);
    }
  };

  const handleDelete = (idx) => {
    playTick();
    const item = milestones[idx];
    openConfirmModal(
      'Delete Milestone',
      `Are you sure you want to delete "${item?.title || 'this milestone'}"?`,
      () => {
        updateAppState((prev) => {
          const updated = [...(prev.profile?.learningJourney || [])];
          updated.splice(idx, 1);
          return {
            ...prev,
            profile: {
              ...prev.profile,
              learningJourney: updated
            }
          };
        }, session.token);
        if (editingIdx === idx) {
          handleCancel();
        }
        showToast('Milestone deleted successfully.', 'fa-trash');
      }
    );
  };

  const handleDuplicate = (idx) => {
    playTick();
    const item = milestones[idx];
    const cloned = {
      ...item,
      title: `${item.title} (Copy)`,
      status: 'in-progress'
    };

    updateAppState((prev) => {
      const list = [...(prev.profile?.learningJourney || [])];
      list.splice(idx + 1, 0, cloned);
      return {
        ...prev,
        profile: {
          ...prev.profile,
          learningJourney: list
        }
      };
    }, session.token);

    showToast('Milestone duplicated.', 'fa-copy');
  };

  const handleMove = (idx, direction) => {
    playTick();
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= milestones.length) return;
    const list = [...milestones];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        learningJourney: list
      }
    }), session.token);

    showToast('Order updated.', 'fa-arrow-up-down');
  };

  const handleSaveMilestone = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Milestone title is required.';
    if (!form.description.trim()) errs.description = 'Milestone description is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    playTick();

    const cleanItem = {
      phase: form.phase.trim() || 'Full-Stack Practice',
      yearBadge: form.yearBadge.trim() || 'Year 3',
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status || 'in-progress',
      icon: form.icon || 'fa-layer-group',
      metric: form.metric.trim(),
      skills: currentSkills,
      link: form.link.trim()
    };

    updateAppState((prev) => {
      const list = [...(prev.profile?.learningJourney || [])];
      if (editingIdx !== null) {
        list[editingIdx] = cleanItem;
      } else {
        list.push(cleanItem);
      }
      return {
        ...prev,
        profile: {
          ...prev.profile,
          learningJourney: list
        }
      };
    }, session.token);

    showToast(editingIdx !== null ? 'Milestone updated!' : 'Milestone published!', 'fa-timeline');
    handleCancel();
  };

  // Save Academic Qualifications
  const handleSaveAcademic = (e) => {
    e.preventDefault();
    playTick();

    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        education: {
          ...prev.profile?.education,
          degree: eduForm.degree.trim(),
          college: eduForm.college.trim(),
          cgpa: eduForm.cgpa.trim(),
          stage: eduForm.stage.trim(),
          schoolXII: eduForm.schoolXII.trim(),
          schoolScore: eduForm.schoolScore.trim(),
          schoolBoard: eduForm.schoolBoard.trim()
        }
      }
    }), session.token);

    showToast('Academic qualifications updated successfully!', 'fa-graduation-cap');
  };

  // Save About Biography
  const handleSaveBio = (e) => {
    e.preventDefault();
    playTick();

    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        aboutEyebrow: aboutEyebrow.trim(),
        aboutBio: bioList
      }
    }), session.token);

    showToast('About biography and story published!', 'fa-align-left');
  };

  const handleAddBioParagraph = () => {
    const text = newBioText.trim();
    if (!text) {
      showToast('Please type a paragraph first.', 'fa-circle-exclamation');
      return;
    }
    playTick();
    setBioList([...bioList, text]);
    setNewBioText('');
    showToast('Paragraph added to draft list.', 'fa-plus');
  };

  const handleRemoveBioParagraph = (idx) => {
    playTick();
    setBioList(bioList.filter((_, i) => i !== idx));
    showToast('Paragraph removed.', 'fa-trash');
  };

  // Filtered Milestones for Timeline
  const filteredMilestones = useMemo(() => {
    return milestones.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.phase?.toLowerCase().includes(q) ||
        item.yearBadge?.toLowerCase().includes(q) ||
        (Array.isArray(item.skills) && item.skills.some((s) => s.toLowerCase().includes(q))) ||
        (typeof item.skills === 'string' && item.skills.toLowerCase().includes(q));

      const matchesPhase =
        selectedPhaseFilter === 'ALL' ||
        (item.phase && item.phase.toLowerCase().includes(selectedPhaseFilter.toLowerCase()));

      const matchesStatus =
        selectedStatusFilter === 'ALL' || item.status === selectedStatusFilter;

      return matchesSearch && matchesPhase && matchesStatus;
    });
  }, [milestones, searchQuery, selectedPhaseFilter, selectedStatusFilter]);

  // Metrics
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const inProgressCount = milestones.filter((m) => m.status === 'in-progress' || !m.status).length;
  const targetCount = milestones.filter((m) => m.status === 'planned').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & HUB BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-400/10">
            <i className="fa-solid fa-timeline text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">About & Milestones Hub</h2>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Interactive CMS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage your academic credentials, chronological journey roadmap, and live public biography.
            </p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 text-emerald-400">
            <i className="fa-solid fa-cloud-check text-sm" />
            <span className="font-semibold">Live in Portfolio</span>
          </div>
        </div>
      </div>

      {/* 2. STATS & METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-card-admin p-4 rounded-2xl border border-white/10 bg-black/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 text-base">
            <i className="fa-solid fa-timeline" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{milestones.length}</div>
            <div className="text-[11px] text-slate-400">Total Milestones</div>
          </div>
        </div>

        <div className="glass-card-admin p-4 rounded-2xl border border-white/10 bg-black/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 text-base">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{completedCount}</div>
            <div className="text-[11px] text-slate-400">Completed Highlights</div>
          </div>
        </div>

        <div className="glass-card-admin p-4 rounded-2xl border border-white/10 bg-black/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 text-base">
            <i className="fa-solid fa-crosshairs" />
          </div>
          <div>
            <div className="text-lg font-bold text-purple-300 font-mono">{inProgressCount}</div>
            <div className="text-[11px] text-slate-400">Current Focus Areas</div>
          </div>
        </div>

        <div className="glass-card-admin p-4 rounded-2xl border border-white/10 bg-black/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 text-base">
            <i className="fa-solid fa-graduation-cap" />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-300 font-mono">{eduForm.cgpa ? `${eduForm.cgpa} CGPA` : '8.42'}</div>
            <div className="text-[11px] text-slate-400">Academic Distinction</div>
          </div>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION TABS (Timeline, Academic, Biography, Live Preview) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => {
              playTick();
              setActiveSubTab('timeline');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'timeline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'
            }`}
          >
            <i className="fa-solid fa-timeline text-cyan-400" />
            <span>Journey Milestones</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300">
              {milestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTick();
              setActiveSubTab('academic');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'academic'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'
            }`}
          >
            <i className="fa-solid fa-graduation-cap text-blue-400" />
            <span>Academic Qualifications</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTick();
              setActiveSubTab('bio');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'bio'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'
            }`}
          >
            <i className="fa-solid fa-align-left text-purple-400" />
            <span>About Bio & Story</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTick();
              setActiveSubTab('preview');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'preview'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'
            }`}
          >
            <i className="fa-solid fa-eye text-emerald-400" />
            <span>Live Public Preview</span>
          </button>
        </div>

        {/* Action Button for Timeline sub-tab */}
        {activeSubTab === 'timeline' && (
          <div className="flex items-center gap-2">
            {/* Presets Button */}
            <div className="relative" ref={presetsRef}>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setIsPresetsOpen((prev) => !prev);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-slate-300 hover:text-white text-xs font-mono transition-all"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-amber-400" />
                <span>Quick Presets</span>
                <i className="fa-solid fa-chevron-down text-[10px] ml-1" />
              </button>

              {isPresetsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/15 bg-[#0b1120]/95 backdrop-blur-xl p-2.5 shadow-2xl z-30 space-y-1">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                    One-Click Milestone Presets
                  </div>
                  {CURATED_PRESET_TEMPLATES.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(item)}
                      className="w-full text-left p-2 rounded-xl hover:bg-white/10 transition-colors flex items-start gap-2.5 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs shrink-0 group-hover:scale-110 transition-transform">
                        <i className={`fa-solid ${item.icon}`} />
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="text-cyan-400">{item.phase}</span>
                          <span>·</span>
                          <span>{item.yearBadge}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle Add / Close Button */}
            <button
              type="button"
              onClick={() => {
                playTick();
                if (isFormOpen) {
                  handleCancel();
                } else {
                  setEditingIdx(null);
                  setIsFormOpen(true);
                  setTimeout(() => {
                    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <i className={`fa-solid ${isFormOpen ? 'fa-xmark' : 'fa-plus'}`} />
              <span>{isFormOpen ? 'Close Editor' : 'New Milestone'}</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          SUB-TAB 1: MILESTONES TIMELINE & CREATOR
          ========================================================================= */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Milestone Creation / Edit Form (when open) */}
          {isFormOpen && (
            <div ref={formTopRef} className="glass-card-admin p-6 sm:p-7 rounded-2xl border border-cyan-400/30 bg-black/50 shadow-2xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-sm border border-cyan-500/30">
                    <i className="fa-solid fa-pen-ruler" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {editingIdx !== null ? 'Edit Milestone Highlight' : 'Create New Journey Milestone'}
                      </h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        Step {milestoneStep} of 3
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Multi-step milestone creator: configure phase & timeline, achievement details, and tech skills.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-xs text-slate-400 hover:text-white font-mono px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>

              {/* Multi-Step Stepper Progress Bar */}
              <div className="space-y-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300 ease-out shadow-sm shadow-cyan-400"
                    style={{ width: `${(milestoneStep / 3) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Step 1 Pill */}
                  <button
                    type="button"
                    onClick={() => handleJumpToMilestoneStep(1)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      milestoneStep === 1
                        ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/15'
                        : milestoneStep > 1
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-300'
                        : 'border-white/10 bg-black/40 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        milestoneStep === 1
                          ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                          : milestoneStep > 1
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {milestoneStep > 1 ? <i className="fa-solid fa-check text-xs" /> : '01'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block">Step 01</span>
                      <p className="text-xs font-bold text-white truncate">Phase & Timeline</p>
                    </div>
                  </button>

                  {/* Step 2 Pill */}
                  <button
                    type="button"
                    onClick={() => handleJumpToMilestoneStep(2)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      milestoneStep === 2
                        ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/15'
                        : milestoneStep > 2
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-300'
                        : 'border-white/10 bg-black/40 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        milestoneStep === 2
                          ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                          : milestoneStep > 2
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {milestoneStep > 2 ? <i className="fa-solid fa-check text-xs" /> : '02'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block">Step 02</span>
                      <p className="text-xs font-bold text-white truncate">Title & Details</p>
                    </div>
                  </button>

                  {/* Step 3 Pill */}
                  <button
                    type="button"
                    onClick={() => handleJumpToMilestoneStep(3)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      milestoneStep === 3
                        ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/15'
                        : 'border-white/10 bg-black/40 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        milestoneStep === 3
                          ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      03
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block">Step 03</span>
                      <p className="text-xs font-bold text-white truncate">Skills & Summary</p>
                    </div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveMilestone} noValidate className="space-y-5">
                {/* STEP 1: Phase Category & Timeline */}
                {milestoneStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                          Phase Category <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.phase}
                          onChange={(e) => {
                            setForm({ ...form, phase: e.target.value });
                            if (errors.phase) setErrors((prev) => ({ ...prev, phase: '' }));
                          }}
                          placeholder="e.g. Full-Stack Practice or Academic Degree"
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                        />
                        <FormErrorMessage message={errors.phase} />

                        {/* Phase Chips */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {PHASE_PRESETS.map((pSet) => (
                            <button
                              key={pSet.name}
                              type="button"
                              onClick={() => {
                                playTick();
                                setForm({ ...form, phase: pSet.name, icon: pSet.icon });
                                if (errors.phase) setErrors((prev) => ({ ...prev, phase: '' }));
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                                form.phase === pSet.name
                                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {pSet.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                          Timeline / Year Badge <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.yearBadge}
                          onChange={(e) => {
                            setForm({ ...form, yearBadge: e.target.value });
                            if (errors.yearBadge) setErrors((prev) => ({ ...prev, yearBadge: '' }));
                          }}
                          placeholder="e.g. Year 3, Present, or 2023 - 2027"
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 font-mono"
                        />
                        <FormErrorMessage message={errors.yearBadge} />

                        {/* Year Chips */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {YEAR_PRESETS.map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => {
                                playTick();
                                setForm({ ...form, yearBadge: yr });
                                if (errors.yearBadge) setErrors((prev) => ({ ...prev, yearBadge: '' }));
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                                form.yearBadge === yr
                                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-slate-300 font-semibold mb-1.5">
                        Status & Progress Stage
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playTick();
                            setForm({ ...form, status: 'completed' });
                          }}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            form.status === 'completed'
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                              : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          <i className="fa-solid fa-check text-xs" />
                          <span>Completed</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playTick();
                            setForm({ ...form, status: 'in-progress' });
                          }}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            form.status === 'in-progress'
                              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
                              : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          <i className="fa-solid fa-bolt text-xs" />
                          <span>Current Focus</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playTick();
                            setForm({ ...form, status: 'planned' });
                          }}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            form.status === 'planned'
                              ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-sm'
                              : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          <i className="fa-solid fa-crosshairs text-xs" />
                          <span>Planned Target</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Title, Metric, Icon & Description */}
                {milestoneStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-6">
                        <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                          Milestone Title <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => {
                            setForm({ ...form, title: e.target.value });
                            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                          }}
                          placeholder="e.g. MERN Stack & Scalable Systems or B.Tech CSE (8.42 CGPA)"
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-semibold"
                        />
                        <FormErrorMessage message={errors.title} />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                          Achievement Metric / Pill
                        </label>
                        <input
                          type="text"
                          value={form.metric}
                          onChange={(e) => setForm({ ...form, metric: e.target.value })}
                          placeholder="e.g. 8.42 CGPA or 10+ Clones"
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                          Icon
                        </label>
                        <div className="relative">
                          <select
                            value={form.icon}
                            onChange={(e) => setForm({ ...form, icon: e.target.value })}
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all appearance-none cursor-pointer"
                          >
                            {ICON_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <i className={`fa-solid ${form.icon} absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none text-xs`} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-mono text-xs text-slate-300 font-semibold">
                          Description & Key Learnings <span className="text-red-400">*</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          {form.description.length} chars
                        </span>
                      </div>
                      <textarea
                        rows="3"
                        value={form.description}
                        onChange={(e) => {
                          setForm({ ...form, description: e.target.value });
                          if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                        }}
                        placeholder="Details about achievements, coursework, practical projects, or leadership highlights..."
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500 leading-relaxed"
                      />
                      <FormErrorMessage message={errors.description} />
                    </div>
                  </div>
                )}

                {/* STEP 3: Technologies, Skills & Final Summary */}
                {milestoneStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div>
                      <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                        Technologies & Skills Acquired
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                          <i className="fa-solid fa-tags absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                          <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            placeholder="Add technology tag and press Enter (e.g. React, MongoDB)..."
                            className="w-full rounded-xl border border-white/15 bg-black/40 pl-9 pr-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddSkill()}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all border border-white/10"
                        >
                          + Tag
                        </button>
                      </div>

                      {/* Current Active Tags */}
                      {currentSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {currentSkills.map((sk) => (
                            <span
                              key={sk}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono"
                            >
                              <span>{sk}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(sk)}
                                className="text-cyan-400 hover:text-white"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Recommended Quick Click Tags */}
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-mono text-slate-500 mr-1">Recommended:</span>
                        {RECOMMENDED_SKILLS.slice(0, 8).map((rec) => {
                          const isAdded = currentSkills.some((s) => s.toLowerCase() === rec.toLowerCase());
                          return (
                            <button
                              key={rec}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  handleRemoveSkill(rec);
                                } else {
                                  handleAddSkill(rec);
                                }
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${
                                isAdded
                                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              {isAdded ? '✓ ' : '+ '}
                              {rec}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                        Reference Link (Optional URL to Project, Certificate, or University Portal)
                      </label>
                      <input
                        type="url"
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        placeholder="https://github.com/ayushprajapati9669-dev or credential link"
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                      />
                    </div>

                    {/* Milestone Live Summary Card */}
                    <div className="p-3.5 rounded-xl border border-cyan-400/20 bg-black/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                          <i className={`fa-solid ${form.icon}`} /> {form.phase || 'Phase Category'}
                        </span>
                        <span>{form.yearBadge || 'Timeline'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{form.title || 'Untitled Milestone'}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{form.description || 'No description provided.'}</p>
                    </div>
                  </div>
                )}

                {/* Form Stepper Footer Buttons */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs font-mono transition-all"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    {milestoneStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevMilestoneStep}
                        className="px-4 py-2 rounded-xl border border-white/15 bg-black/40 text-slate-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-arrow-left text-[10px]" /> Back
                      </button>
                    )}

                    {milestoneStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNextMilestoneStep}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                      >
                        <span>Continue</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                      >
                        <i className="fa-solid fa-check" />
                        <span>{editingIdx !== null ? 'Save Milestone Changes' : 'Publish Milestone'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Search, Filter & Quick Stats Bar */}
          <div className="glass-card-admin p-4 rounded-2xl border border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones by title, phase, skill, or keyword..."
                className="w-full rounded-xl border border-white/15 bg-black/40 pl-9 pr-8 py-2 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Status:</span>
              {['ALL', 'completed', 'in-progress', 'planned'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    playTick();
                    setSelectedStatusFilter(st);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                    selectedStatusFilter === st
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'in-progress' ? 'Focus' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Milestones Timeline Cards List with scrollbar limit */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredMilestones.length === 0 ? (
              <div className="glass-card-admin p-12 text-center rounded-2xl border border-white/10 bg-black/30">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 text-lg border border-cyan-500/20">
                  <i className="fa-solid fa-timeline" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">No Milestones Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  {searchQuery || selectedStatusFilter !== 'ALL'
                    ? 'No milestones match your current search or filter query. Try resetting filters.'
                    : 'Start documenting your academic highlights and full-stack roadmap by adding your first milestone.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold text-xs hover:bg-cyan-500/30 transition-all"
                >
                  + Add First Milestone
                </button>
              </div>
            ) : (
              filteredMilestones.map((item, idx) => {
                const realIdx = milestones.findIndex(
                  (m) => m.title === item.title && m.description === item.description
                );
                const actualIdx = realIdx !== -1 ? realIdx : idx;

                const skillsList = Array.isArray(item.skills)
                  ? item.skills
                  : item.skills
                  ? item.skills.split(',').map((s) => s.trim()).filter(Boolean)
                  : [];

                return (
                  <div
                    key={item.title + actualIdx}
                    className="glass-card-admin p-5 rounded-2xl border border-white/10 bg-black/40 hover:border-cyan-400/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Icon & Content */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Milestone Icon Pill */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0 text-base shadow-sm group-hover:scale-105 transition-transform">
                        <i className={`fa-solid ${item.icon || 'fa-layer-group'}`} />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        {/* Phase & Year badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-cyan-400 font-bold tracking-wide">
                            {item.phase || 'Full-Stack Practice'}
                          </span>
                          <span className="text-slate-600 font-mono">·</span>
                          <span className="font-mono text-xs text-slate-300 font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            {item.yearBadge || item.year || 'Year 3'}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
                              item.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : item.status === 'planned'
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            }`}
                          >
                            {item.status === 'completed'
                              ? '✓ Completed'
                              : item.status === 'planned'
                              ? 'Upcoming'
                              : '⚡ Current Focus'}
                          </span>

                          {/* Metric Badge */}
                          {item.metric && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              {item.metric}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                          {item.description}
                        </p>

                        {/* Skill Badges */}
                        {skillsList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {skillsList.map((sk, skIdx) => (
                              <span
                                key={skIdx}
                                className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Reorder & Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-white/10 w-full md:w-auto justify-end">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMove(actualIdx, -1)}
                        disabled={actualIdx === 0}
                        className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                        title="Move Up"
                      >
                        <i className="fa-solid fa-arrow-up text-xs" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMove(actualIdx, 1)}
                        disabled={actualIdx === milestones.length - 1}
                        className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                        title="Move Down"
                      >
                        <i className="fa-solid fa-arrow-down text-xs" />
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(actualIdx)}
                        className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 flex items-center justify-center transition-all"
                        title="Duplicate Milestone"
                      >
                        <i className="fa-solid fa-clone text-xs" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEdit(actualIdx)}
                        className="px-3 py-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-pen-to-square text-[10px]" />
                        <span>Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(actualIdx)}
                        className="w-8 h-8 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all"
                        title="Delete Milestone"
                      >
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: ACADEMIC QUALIFICATIONS
          ========================================================================= */}
      {activeSubTab === 'academic' && (
        <form onSubmit={handleSaveAcademic} className="glass-card-admin p-6 sm:p-8 rounded-2xl border border-white/10 bg-black/40 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-base">
                <i className="fa-solid fa-graduation-cap" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Academic Qualifications & Education</h3>
                <p className="text-xs text-slate-400">
                  Update college degree, cumulative CGPA, graduation batch, and higher secondary credentials.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-black font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-check" />
              <span>Save Academic Qualifications</span>
            </button>
          </div>

          {/* Section 1: College & Degree */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-building-columns" />
              <span>Undergraduate Degree Program</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Degree Program *
                </label>
                <input
                  type="text"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  placeholder="e.g. B.Tech in Computer Science and Engineering"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  College / Institute *
                </label>
                <input
                  type="text"
                  value={eduForm.college}
                  onChange={(e) => setEduForm({ ...eduForm, college: e.target.value })}
                  placeholder="e.g. SISTec, Bhopal"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Cumulative CGPA *
                </label>
                <input
                  type="text"
                  value={eduForm.cgpa}
                  onChange={(e) => setEduForm({ ...eduForm, cgpa: e.target.value })}
                  placeholder="e.g. 8.42"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                Batch & Academic Stage
              </label>
              <input
                type="text"
                value={eduForm.stage}
                onChange={(e) => setEduForm({ ...eduForm, stage: e.target.value })}
                placeholder="e.g. 2023 – 2027 (Currently in 4th Semester)"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Section 2: Higher Secondary */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-school" />
              <span>Higher Secondary / Class XII Credentials</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  School / Institution
                </label>
                <input
                  type="text"
                  value={eduForm.schoolXII}
                  onChange={(e) => setEduForm({ ...eduForm, schoolXII: e.target.value })}
                  placeholder="e.g. Kasturba Vidhya Mandir, Jamani, MP"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Examination Board
                </label>
                <input
                  type="text"
                  value={eduForm.schoolBoard}
                  onChange={(e) => setEduForm({ ...eduForm, schoolBoard: e.target.value })}
                  placeholder="e.g. MP Board (Class XII) or MPBSE"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Percentage / Score
                </label>
                <input
                  type="text"
                  value={eduForm.schoolScore}
                  onChange={(e) => setEduForm({ ...eduForm, schoolScore: e.target.value })}
                  placeholder="e.g. 80% or 83.5%"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-black font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-check" />
              <span>Save Academic Qualifications</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          SUB-TAB 3: ABOUT BIOGRAPHY & STORY
          ========================================================================= */}
      {activeSubTab === 'bio' && (
        <form onSubmit={handleSaveBio} className="glass-card-admin p-6 sm:p-8 rounded-2xl border border-white/10 bg-black/40 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center text-base">
                <i className="fa-solid fa-align-left" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">About Biography & Story</h3>
                <p className="text-xs text-slate-400">
                  Craft your professional story, academic narrative, and current focus presented on the /about page.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-black font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-check" />
              <span>Save Biography</span>
            </button>
          </div>

          {/* Eyebrow Tag */}
          <div>
            <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
              About Page Eyebrow Tag
            </label>
            <input
              type="text"
              value={aboutEyebrow}
              onChange={(e) => setAboutEyebrow(e.target.value)}
              placeholder="e.g. Computer Science Student · Developer · Builder"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {/* Biography Paragraphs List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-xs text-slate-300 font-semibold">
                Narrative Paragraphs ({bioList.length})
              </label>
              <span className="text-[10px] font-mono text-slate-500">Rendered in order on public /about</span>
            </div>

            {bioList.map((para, idx) => (
              <div key={idx} className="relative group">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center font-mono text-xs shrink-0 mt-2">
                    {idx + 1}
                  </div>
                  <textarea
                    rows="3"
                    value={para}
                    onChange={(e) => {
                      const updated = [...bioList];
                      updated[idx] = e.target.value;
                      setBioList(updated);
                    }}
                    className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-slate-200 outline-none focus:border-cyan-400 transition-all leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBioParagraph(idx)}
                    className="w-8 h-8 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center shrink-0 mt-2 transition-all"
                    title="Remove Paragraph"
                  >
                    <i className="fa-solid fa-trash text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Paragraph Box */}
          <div className="p-4 rounded-xl border border-dashed border-white/15 bg-black/20 space-y-2">
            <label className="block font-mono text-xs text-slate-300 font-semibold">
              + Add Another Paragraph
            </label>
            <textarea
              rows="2"
              value={newBioText}
              onChange={(e) => setNewBioText(e.target.value)}
              placeholder="Type new paragraph to append to your public biography..."
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddBioParagraph}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all border border-white/10"
              >
                + Add Paragraph
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-black font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-check" />
              <span>Save Biography</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          SUB-TAB 4: LIVE PUBLIC PREVIEW
          ========================================================================= */}
      {activeSubTab === 'preview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-eye text-emerald-400" />
                <span>Live Public Simulation</span>
              </h3>
              <p className="text-xs text-slate-400">
                This simulation reflects precisely how visitors see your qualifications and timeline on the /about page.
              </p>
            </div>
            <a
              href="/about"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <span>Open /about in Tab</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            </a>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* 1. Education Qualifications Card */}
            <div className="glass-card-admin p-6 rounded-2xl border border-white/15 bg-[#0b1120]/80 shadow-2xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-graduation-cap" />
                </span>
                <span>Education Qualifications</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* College */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-1">
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    {eduForm.cgpa} <span className="text-xs text-slate-400">CGPA</span>
                  </div>
                  <div className="text-xs font-bold text-white">{eduForm.degree}</div>
                  <div className="text-[11px] text-slate-400">{eduForm.college}</div>
                </div>

                {/* School */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-1">
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {eduForm.schoolScore} <span className="text-xs text-slate-400">2022</span>
                  </div>
                  <div className="text-xs font-bold text-white">{eduForm.schoolBoard}</div>
                  <div className="text-[11px] text-slate-400">{eduForm.schoolXII}</div>
                </div>
              </div>
            </div>

            {/* 2. Achievements & Journey Timeline Card */}
            <div className="glass-card-admin p-6 rounded-2xl border border-white/15 bg-[#0b1120]/80 shadow-2xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-trophy" />
                </span>
                <span>Achievements & Journey Timeline</span>
              </h4>

              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-cyan-400 before:to-transparent">
                {milestones.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-[#0b1120] shadow-sm shadow-cyan-400/50" />
                    <div className="font-mono text-[11px] text-cyan-400 font-bold flex items-center gap-2">
                      <span>{item.phase}</span>
                      <span className="text-slate-500">· {item.yearBadge || item.year}</span>
                      {item.metric && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono ml-auto">
                          {item.metric}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMilestones;

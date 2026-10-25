import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { playTick } from '../../../utils/audio';

// Curated Devicon database mapping popular technologies to Devicon classes
const DEVICON_DB = [
  { name: 'JavaScript', icon: 'devicon-javascript-plain' },
  { name: 'TypeScript', icon: 'devicon-typescript-plain' },
  { name: 'React', icon: 'devicon-react-original' },
  { name: 'Next.js', icon: 'devicon-nextjs-original' },
  { name: 'Vue.js', icon: 'devicon-vuejs-plain' },
  { name: 'Angular', icon: 'devicon-angularjs-plain' },
  { name: 'HTML5', icon: 'devicon-html5-plain' },
  { name: 'HTML', icon: 'devicon-html5-plain' },
  { name: 'CSS3', icon: 'devicon-css3-plain' },
  { name: 'CSS', icon: 'devicon-css3-plain' },
  { name: 'Tailwind CSS', icon: 'devicon-tailwindcss-original' },
  { name: 'Bootstrap', icon: 'devicon-bootstrap-plain' },
  { name: 'Node.js', icon: 'devicon-nodejs-plain' },
  { name: 'Express', icon: 'devicon-express-original' },
  { name: 'Express.js', icon: 'devicon-express-original' },
  { name: 'Python', icon: 'devicon-python-plain' },
  { name: 'Django', icon: 'devicon-django-plain' },
  { name: 'Flask', icon: 'devicon-flask-original' },
  { name: 'Java', icon: 'devicon-java-plain' },
  { name: 'Spring', icon: 'devicon-spring-plain' },
  { name: 'C', icon: 'devicon-c-plain' },
  { name: 'C++', icon: 'devicon-cplusplus-plain' },
  { name: 'C#', icon: 'devicon-csharp-plain' },
  { name: 'Go', icon: 'devicon-go-original-wordmark' },
  { name: 'Rust', icon: 'devicon-rust-plain' },
  { name: 'PHP', icon: 'devicon-php-plain' },
  { name: 'MongoDB', icon: 'devicon-mongodb-plain' },
  { name: 'MySQL', icon: 'devicon-mysql-plain' },
  { name: 'PostgreSQL', icon: 'devicon-postgresql-plain' },
  { name: 'Redis', icon: 'devicon-redis-plain' },
  { name: 'SQLite', icon: 'devicon-sqlite-plain' },
  { name: 'Docker', icon: 'devicon-docker-plain' },
  { name: 'Kubernetes', icon: 'devicon-kubernetes-plain' },
  { name: 'Amazon Web Services', icon: 'devicon-amazonwebservices-original' },
  { name: 'AWS', icon: 'devicon-amazonwebservices-original' },
  { name: 'Google Cloud', icon: 'devicon-googlecloud-plain' },
  { name: 'Azure', icon: 'devicon-azure-plain' },
  { name: 'Git', icon: 'devicon-git-plain' },
  { name: 'GitHub', icon: 'devicon-github-original' },
  { name: 'Linux', icon: 'devicon-linux-plain' },
  { name: 'Ubuntu', icon: 'devicon-ubuntu-plain' },
  { name: 'Figma', icon: 'devicon-figma-plain' },
  { name: 'Postman', icon: 'devicon-postman-plain' },
  { name: 'GraphQL', icon: 'devicon-graphql-plain' },
  { name: 'Redux', icon: 'devicon-redux-original' },
  { name: 'Vite', icon: 'devicon-vitejs-plain' },
  { name: 'Vite JS', icon: 'devicon-vitejs-plain' },
  { name: 'Firebase', icon: 'devicon-firebase-plain' },
  { name: 'Supabase', icon: 'devicon-supabase-plain' },
  { name: 'SASS', icon: 'devicon-sass-original' },
  { name: 'Jest', icon: 'devicon-jest-plain' },
  { name: 'Webpack', icon: 'devicon-webpack-plain' },
  { name: 'VS Code', icon: 'devicon-vscode-plain' },
  { name: 'PostCSS', icon: 'devicon-postcss-plain' }
];

// Helper to look up Devicon by skill name or logoKey
function lookupDevicon(name, logoKey = '') {
  const cleanName = (name || '').toLowerCase().trim();
  const cleanKey = (logoKey || '').toLowerCase().trim();

  const exact = DEVICON_DB.find(
    (d) => d.name.toLowerCase() === cleanName || d.name.toLowerCase() === cleanKey
  );
  if (exact) return exact.icon;

  const partial = DEVICON_DB.find(
    (d) =>
      cleanName.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(cleanName) ||
      (cleanKey && d.name.toLowerCase().includes(cleanKey))
  );
  return partial ? partial.icon : null;
}

// Curated colors for categories (cyan, blue, purple, amber, emerald, pink, teal, indigo)
const CATEGORY_COLORS = [
  '#00D4FF', // Cyan Glow
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Deep Cyan
  '#6366F1'  // Indigo
];

function getDefaultColorForIndex(idx) {
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
}

export function AdminSkills({
  appState,
  updateAppState,
  session,
  showToast,
  isCategoryModalOpen = false,
  setIsCategoryModalOpen = () => {}
}) {
  // 1. Categories & Skills extraction from appState
  const rawCategories = appState.skills || [];

  const categories = useMemo(() => {
    return rawCategories.map((cat, idx) => ({
      id: cat.id || `cat-${idx}`,
      name: cat.category || cat.categoryName || cat.name || `Category ${idx + 1}`,
      color: cat.color || getDefaultColorForIndex(idx),
      tabIcon: cat.tabIcon || 'code',
      description: cat.description || '',
      displayOrder: typeof cat.displayOrder === 'number' ? cat.displayOrder : idx + 1,
      items: (cat.items || []).map((item, itemIdx) => ({
        id: item.id || `skill-${cat.id}-${itemIdx}-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: item.name || '',
        logoKey: item.logoKey || item.name.toLowerCase(),
        icon: item.icon || lookupDevicon(item.name, item.logoKey),
        category: cat.id || `cat-${idx}`,
        isVisible: item.isVisible !== false,
        createdAt: item.createdAt || (Date.now() - (itemIdx * 5000))
      }))
    }));
  }, [rawCategories]);

  // Flattened skills list
  const allSkills = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.items.map((item) => ({
        ...item,
        categoryName: cat.name,
        categoryColor: cat.color
      }))
    );
  }, [categories]);

  // UI state
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('custom'); // custom, az, za, newest
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Form state
  const [skillNameInput, setSkillNameInput] = useState('');
  const [selectedFormCategory, setSelectedFormCategory] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');

  // Category Modal state (managed locally with fallback to prop)
  const [localCategoryModal, setLocalCategoryModal] = useState(false);
  const isCatModalVisible = isCategoryModalOpen || localCategoryModal;
  const setCatModalVisible = (val) => {
    setLocalCategoryModal(val);
    if (setIsCategoryModalOpen) setIsCategoryModalOpen(val);
  };

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#00D4FF');

  // Drag & drop state for reordering
  const [draggedSkillId, setDraggedSkillId] = useState(null);
  const [dragOverSkillId, setDragOverSkillId] = useState(null);

  // Refs
  const skillsListRef = useRef(null);
  const suggestionsBoxRef = useRef(null);
  const nameInputRef = useRef(null);

  // Set default selected form category
  useEffect(() => {
    if (!selectedFormCategory && categories.length > 0) {
      setSelectedFormCategory(categories[0].id);
    }
  }, [categories, selectedFormCategory]);

  // Simulate smooth skeleton on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingInitial(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // GSAP animation when category or sort changes
  useEffect(() => {
    if (!skillsListRef.current) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.fromTo(
      skillsListRef.current.querySelectorAll('.skill-row-item'),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out' }
    );
  }, [activeCategory, sortOrder, searchQuery]);

  // 3D Card Hover Physics for top stat cards
  const handleCardMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -8;
    const rotateY = ((x - rect.width / 2) / rect.width) * 8;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        suggestionsBoxRef.current &&
        !suggestionsBoxRef.current.contains(e.target) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(e.target)
      ) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter and sort skills
  const filteredSkills = useMemo(() => {
    let list = allSkills.filter((skill) => {
      const matchCat = activeCategory === 'all' || skill.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortOrder === 'az') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'za') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === 'newest') {
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    // 'custom' maintains category list order

    return list;
  }, [allSkills, activeCategory, searchQuery, sortOrder]);

  // Suggestions for auto-complete
  const matchingSuggestions = useMemo(() => {
    if (!skillNameInput.trim()) return [];
    const query = skillNameInput.toLowerCase().trim();
    return DEVICON_DB.filter((d) => d.name.toLowerCase().includes(query)).slice(0, 6);
  }, [skillNameInput]);

  // Live preview matching
  const livePreviewIcon = useMemo(() => {
    if (!skillNameInput.trim()) return null;
    return lookupDevicon(skillNameInput);
  }, [skillNameInput]);

  // Current category for live preview
  const previewCategory = useMemo(() => {
    const cat = categories.find((c) => c.id === selectedFormCategory);
    return cat || { name: 'Category', color: '#00D4FF' };
  }, [categories, selectedFormCategory]);

  // Helper to commit state changes back to appState.skills
  const syncCategories = (updatedCategories) => {
    updateAppState(
      (prev) => ({
        ...prev,
        skills: updatedCategories.map((cat) => ({
          id: cat.id,
          category: cat.name,
          categoryName: cat.name,
          color: cat.color,
          tabIcon: cat.tabIcon || 'code',
          description: cat.description || '',
          displayOrder: cat.displayOrder,
          items: cat.items.map((item) => ({
            id: item.id,
            name: item.name,
            logoKey: item.logoKey || item.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            icon: item.icon || lookupDevicon(item.name, item.logoKey),
            isVisible: item.isVisible !== false,
            createdAt: item.createdAt || Date.now()
          }))
        }))
      }),
      session.token
    );
  };

  // --- ACTIONS ---

  // Handle skill input changes
  const handleNameInputChange = (val) => {
    setSkillNameInput(val);
    const isDup = allSkills.some(
      (s) => s.name.toLowerCase().trim() === val.toLowerCase().trim()
    );
    if (isDup) {
      setDuplicateError('This skill already exists in your portfolio.');
    } else {
      setDuplicateError('');
    }
    setIsSuggestionsOpen(Boolean(val.trim() && !isDup));
  };

  // Select a suggestion
  const handleSelectSuggestion = (suggestion) => {
    playTick();
    setSkillNameInput(suggestion.name);
    setDuplicateError('');
    setIsSuggestionsOpen(false);
  };

  // Add new skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = skillNameInput.trim();
    if (!clean) return;

    if (categories.length === 0) {
      showToast('Please create a category first.', 'fa-triangle-exclamation');
      setCatModalVisible(true);
      return;
    }

    if (allSkills.some((s) => s.name.toLowerCase() === clean.toLowerCase())) {
      setDuplicateError('This skill already exists in your portfolio.');
      showToast(`"${clean}" already exists.`, 'fa-triangle-exclamation');
      return;
    }

    playTick();
    setIsAdding(true);

    setTimeout(() => {
      const detectedIcon = lookupDevicon(clean);
      const newSkillItem = {
        id: 'skill_' + Date.now(),
        name: clean,
        logoKey: clean.toLowerCase().replace(/[^a-z0-9]/g, ''),
        icon: detectedIcon,
        isVisible: true,
        createdAt: Date.now()
      };

      const targetCatId = selectedFormCategory || categories[0].id;
      const updated = categories.map((cat) => {
        if (cat.id === targetCatId) {
          return {
            ...cat,
            items: [newSkillItem, ...cat.items]
          };
        }
        return cat;
      });

      syncCategories(updated);
      setSkillNameInput('');
      setDuplicateError('');
      setIsAdding(false);
      showToast(`Added "${clean}" to ${previewCategory.name}!`, 'fa-circle-check');
    }, 300);
  };

  // Toggle Visibility switch
  const handleToggleVisibility = (skillId) => {
    playTick();
    const updated = categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) =>
        item.id === skillId ? { ...item, isVisible: !item.isVisible } : item
      )
    }));
    syncCategories(updated);
  };

  // Delete Skill
  const handleDeleteSkill = (skill) => {
    playTick();
    const updated = categories.map((cat) =>
      cat.id === skill.category
        ? { ...cat, items: cat.items.filter((item) => item.id !== skill.id) }
        : cat
    );

    // Remove from selected Set
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      next.delete(skill.id);
      return next;
    });

    syncCategories(updated);
    showToast(`Removed "${skill.name}".`, 'fa-trash-can');
  };

  // Checkbox multi-select
  const handleToggleSelect = (skillId) => {
    playTick();
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  // Toggle select all visible filtered skills
  const handleSelectAllVisible = () => {
    playTick();
    if (selectedSkills.size === filteredSkills.length && filteredSkills.length > 0) {
      setSelectedSkills(new Set());
    } else {
      setSelectedSkills(new Set(filteredSkills.map((s) => s.id)));
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = () => {
    if (selectedSkills.size === 0) return;
    playTick();
    const count = selectedSkills.size;

    const updated = categories.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => !selectedSkills.has(item.id))
    }));

    syncCategories(updated);
    setSelectedSkills(new Set());
    showToast(`Deleted ${count} selected skill(s).`, 'fa-trash-can');
  };

  // Drag and drop reordering handlers
  const handleDragStart = (e, skillId) => {
    if (sortOrder !== 'custom') {
      e.preventDefault();
      showToast('Switch to "Custom Order" to drag and reorder skills.', 'fa-info-circle');
      return;
    }
    setDraggedSkillId(skillId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', skillId);
  };

  const handleDragOver = (e, skillId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSkillId !== skillId) {
      setDragOverSkillId(skillId);
    }
  };

  const handleDrop = (e, targetSkillId) => {
    e.preventDefault();
    if (!draggedSkillId || draggedSkillId === targetSkillId) {
      setDraggedSkillId(null);
      setDragOverSkillId(null);
      return;
    }

    playTick();
    const sourceSkill = allSkills.find((s) => s.id === draggedSkillId);
    const targetSkill = allSkills.find((s) => s.id === targetSkillId);

    if (!sourceSkill || !targetSkill) {
      setDraggedSkillId(null);
      setDragOverSkillId(null);
      return;
    }

    // Reorder inside the same category or across categories
    const updated = categories.map((cat) => {
      let items = [...cat.items];
      const hasSource = items.some((i) => i.id === sourceSkill.id);
      const hasTarget = items.some((i) => i.id === targetSkill.id);

      if (hasSource && hasTarget) {
        // Same category reorder
        const srcIdx = items.findIndex((i) => i.id === sourceSkill.id);
        const tgtIdx = items.findIndex((i) => i.id === targetSkill.id);
        const [moved] = items.splice(srcIdx, 1);
        items.splice(tgtIdx, 0, moved);
        return { ...cat, items };
      }

      if (hasSource) {
        return { ...cat, items: items.filter((i) => i.id !== sourceSkill.id) };
      }

      if (hasTarget) {
        const tgtIdx = items.findIndex((i) => i.id === targetSkill.id);
        items.splice(tgtIdx, 0, { ...sourceSkill, category: cat.id });
        return { ...cat, items };
      }

      return cat;
    });

    syncCategories(updated);
    setDraggedSkillId(null);
    setDragOverSkillId(null);
    showToast(`Reordered "${sourceSkill.name}".`, 'fa-arrows-up-down');
  };

  // --- CATEGORY MODAL LOGIC ---

  const handleCreateCategory = (e) => {
    e?.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) {
      showToast('Category name cannot be empty.', 'fa-triangle-exclamation');
      return;
    }

    if (categories.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      showToast('Category already exists!', 'fa-triangle-exclamation');
      return;
    }

    playTick();
    const newCatId = 'cat_' + Date.now();
    const newCategory = {
      id: newCatId,
      name: cleanName,
      color: newCatColor,
      tabIcon: 'code',
      description: '',
      displayOrder: categories.length + 1,
      items: []
    };

    const updated = [...categories, newCategory];
    syncCategories(updated);

    setNewCatName('');
    setSelectedFormCategory(newCatId);
    showToast(`Created category "${cleanName}"!`, 'fa-folder-plus');
  };

  const handleDeleteCategory = (catId, catName, skillCount) => {
    playTick();
    if (skillCount > 0) {
      showToast(
        `Cannot delete "${catName}" because it contains ${skillCount} skills. Remove or move skills first.`,
        'fa-triangle-exclamation'
      );
      return;
    }

    const updated = categories.filter((c) => c.id !== catId);
    if (activeCategory === catId) {
      setActiveCategory('all');
    }
    if (selectedFormCategory === catId) {
      setSelectedFormCategory(updated[0]?.id || '');
    }

    syncCategories(updated);
    showToast(`Category "${catName}" removed.`, 'fa-check-circle');
  };

  const totalActiveCount = allSkills.filter((s) => s.isVisible).length;
  const totalHiddenCount = allSkills.length - totalActiveCount;

  return (
    <div className="space-y-8 w-full max-w-full min-w-0">
      {/* ========================================================
          0. TOP ACTION BANNER (Matching Projects & Certificates)
         ======================================================== */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--brand-color, #06b6d4)' }}>
            <i className="fa-solid fa-code" /> TECHNICAL CAPABILITIES · SKILLS STACK CMS
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Technical Skills & Categories</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize your full-stack capabilities, toggle public visibility, reorder via drag-and-drop, and manage category groups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/skills"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs font-semibold text-slate-300 hover:border-white/30 hover:text-white transition-all inline-flex items-center gap-2"
            title="Preview live public skills page"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-cyan-400" />
            <span>Preview Live</span>
          </a>
          <button
            type="button"
            onClick={() => {
              playTick();
              setCatModalVisible(true);
            }}
            className="btn-create-project"
          >
            <i className="fa-solid fa-tags" />
            <span>Manage Categories ({categories.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          1. TOP 4 METRICS DASHBOARD (Overview Aesthetic)
         ======================================================== */}
      <div className="stats-grid">
        {/* Card 1: Total Skills */}
        <div
          className="stat-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="stat-header">
            <div className="stat-label">Total Skills</div>
            <div className="stat-icon icon-cyan">
              <i className="fa-solid fa-code" />
            </div>
          </div>
          <div>
            <div className="stat-value cyan">{allSkills.length}</div>
            <div className="stat-trend">
              <i className="fa-solid fa-layer-group text-cyan-400" />
              <span>{categories.length} Categories</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active on Portfolio */}
        <div
          className="stat-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="stat-header">
            <div className="stat-label">Active Stack</div>
            <div className="stat-icon icon-green">
              <i className="fa-solid fa-circle-check" />
            </div>
          </div>
          <div>
            <div className="stat-value green">{totalActiveCount}</div>
            <div className="stat-trend">
              <i className="fa-solid fa-eye text-emerald-400" />
              <span>Visible on Site</span>
            </div>
          </div>
        </div>

        {/* Card 3: Categories */}
        <div
          className="stat-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="stat-header">
            <div className="stat-label">Categories</div>
            <div className="stat-icon icon-purple">
              <i className="fa-solid fa-tags" />
            </div>
          </div>
          <div>
            <div className="stat-value purple">{categories.length}</div>
            <div className="stat-trend">
              <i className="fa-solid fa-folder-tree text-purple-400" />
              <span>Domain Groups</span>
            </div>
          </div>
        </div>

        {/* Card 4: Hidden Stack */}
        <div
          className="stat-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="stat-header">
            <div className="stat-label">Hidden / Draft</div>
            <div className="stat-icon icon-orange">
              <i className="fa-solid fa-eye-slash" />
            </div>
          </div>
          <div>
            <div className="stat-value orange">{totalHiddenCount}</div>
            <div className="stat-trend">
              <i className="fa-solid fa-toggle-off text-amber-400" />
              <span>Unpublished</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. UNIFIED CONTROLS TOOLBAR (Matching Image 3)
         ======================================================== */}
      <div className="flex flex-wrap md:flex-nowrap items-center rounded-2xl border border-white/10 bg-[#070b12]/60 px-3 py-1.5 w-full gap-2">
        {/* Search Input */}
        <div className="flex-1 min-w-[220px] relative flex items-center">
          <i className="fa-solid fa-magnifying-glass text-cyan-400 text-xs pl-1 pr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter skills by name or category..."
            className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-slate-500 font-sans py-2"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
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
        <div className="hidden md:block h-6 w-px bg-white/10" />

        {/* Category Dropdown */}
        <div className="relative min-w-[170px] flex items-center">
          <i className="fa-solid fa-layer-group text-cyan-400 text-xs pl-2 mr-1 pointer-events-none" />
          <select
            value={activeCategory}
            onChange={(e) => {
              playTick();
              setActiveCategory(e.target.value);
            }}
            className="appearance-none w-full bg-transparent border-0 pl-1.5 pr-7 py-2 text-xs font-semibold text-white outline-none cursor-pointer hover:text-cyan-300 transition-colors"
            title="Filter by Skill Category"
          >
            <option value="all" className="bg-[#0b101b] text-white">
              All Skills ({allSkills.length})
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#0b101b] text-white">
                {cat.name} ({cat.items.length})
              </option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none" />
        </div>

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-white/10" />

        {/* Sort Controls */}
        <div className="relative min-w-[210px] flex items-center">
          <i className="fa-solid fa-arrow-down-up-across-line text-slate-400 text-xs pl-2 mr-1 pointer-events-none" />
          <select
            value={sortOrder}
            onChange={(e) => {
              playTick();
              setSortOrder(e.target.value);
            }}
            className="appearance-none w-full bg-transparent border-0 pl-1.5 pr-7 py-2 text-xs font-medium text-slate-200 hover:text-white outline-none cursor-pointer transition-colors"
            title="Sort Order"
          >
            <option value="custom" className="bg-[#0b101b] text-white">Custom Order (Drag & Drop)</option>
            <option value="az" className="bg-[#0b101b] text-white">Alphabetical (A-Z)</option>
            <option value="za" className="bg-[#0b101b] text-white">Alphabetical (Z-A)</option>
            <option value="newest" className="bg-[#0b101b] text-white">Newest First</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none" />
        </div>

        {/* New Category Button */}
        <button
          type="button"
          onClick={() => {
            playTick();
            setCatModalVisible(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-4 py-2 font-mono text-xs font-bold text-slate-950 transition-all shadow-md shadow-cyan-400/20 cursor-pointer whitespace-nowrap ml-auto"
          title="Create new skill category"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>New Category</span>
        </button>
      </div>

      {/* ========================================================
          3. MAIN GRID (Left: Add Skill Form, Right: Current Skills)
         ======================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start w-full max-w-full min-w-0">
        {/* LEFT COLUMN: Add New Skill Card */}
        <div className="lg:col-span-5 glass-card-admin rounded-3xl border border-white/10 p-5 sm:p-6 space-y-5 relative lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-plus-circle text-cyan-400" />
              <span>Add New Skill</span>
            </h3>
            <span className="font-mono text-[10px] text-cyan-400">
              Auto-detects Devicon
            </span>
          </div>

          <form onSubmit={handleAddSkill} className="space-y-4">
            {/* Skill Name Input with Auto-Suggestion */}
            <div className="space-y-1.5 relative">
              <label className="block font-mono text-xs font-semibold text-slate-300">
                Skill Name <span className="text-cyan-400">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={skillNameInput}
                onChange={(e) => handleNameInputChange(e.target.value)}
                onFocus={() => {
                  if (skillNameInput.trim() && !duplicateError) {
                    setIsSuggestionsOpen(true);
                  }
                }}
                placeholder="e.g. React, Docker, Python, MongoDB"
                autoComplete="off"
                required
                className={`w-full rounded-xl border bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all font-sans ${
                  duplicateError
                    ? 'border-red-500/80 focus:border-red-400'
                    : 'border-white/15 focus:border-cyan-400'
                }`}
              />

              {/* Duplicate Error Message */}
              {duplicateError && (
                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-red-400">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{duplicateError}</span>
                </p>
              )}

              {/* Auto Suggestions Dropdown */}
              {isSuggestionsOpen && matchingSuggestions.length > 0 && (
                <div ref={suggestionsBoxRef} className="skills-suggestions-box">
                  <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/5">
                    Devicon Suggestions
                  </div>
                  {matchingSuggestions.map((m) => (
                    <div
                      key={m.name}
                      onClick={() => handleSelectSuggestion(m)}
                      className="skills-suggestion-item"
                    >
                      <i className={`${m.icon} colored text-lg`} />
                      <span className="font-medium">{m.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Target Category Select */}
            <div className="space-y-1.5">
              <label className="block font-mono text-xs font-semibold text-slate-300">
                Target Category
              </label>
              <select
                value={selectedFormCategory}
                onChange={(e) => setSelectedFormCategory(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all cursor-pointer font-sans"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available - click New Category</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#0b101b] text-white">
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Live Preview Box */}
            <div
              className={`skills-live-preview ${!skillNameInput.trim() ? 'empty' : ''}`}
            >
              {skillNameInput.trim() ? (
                <>
                  <div className="skill-icon-box">
                    {typeof livePreviewIcon === 'string' &&
                    (livePreviewIcon.startsWith('http') || livePreviewIcon.startsWith('/') || livePreviewIcon.startsWith('data:')) ? (
                      <img src={livePreviewIcon} alt={skillNameInput} className="w-6 h-6 object-contain" />
                    ) : livePreviewIcon ? (
                      <i className={`${livePreviewIcon} colored`} />
                    ) : (
                      <span className="initials text-cyan-400">
                        {skillNameInput.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">
                      {skillNameInput}
                    </h4>
                    <p
                      className="font-mono text-[11px] uppercase tracking-wider font-semibold"
                      style={{ color: previewCategory.color }}
                    >
                      {previewCategory.name} Preview
                    </p>
                  </div>
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                    Live Preview
                  </span>
                </>
              ) : (
                <span>Live Preview will appear here as you type</span>
              )}
            </div>

            {/* Add Skill Button */}
            <button
              type="submit"
              disabled={isAdding || Boolean(duplicateError) || !skillNameInput.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3 font-mono text-xs font-bold text-black hover:opacity-95 transition-all shadow-md shadow-cyan-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <span>Adding Skill...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plus" />
                  <span>Add Skill to Portfolio</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Current Skills List */}
        <div className="lg:col-span-7 glass-card-admin rounded-3xl border border-white/10 p-5 sm:p-6 space-y-4 relative flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-white">Current Skills</h3>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[11px] text-cyan-400">
                {totalActiveCount} active
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              {filteredSkills.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 font-mono text-[11px] transition-all cursor-pointer"
                  title={selectedSkills.size === filteredSkills.length && filteredSkills.length > 0 ? "Deselect all visible skills" : "Select all visible skills"}
                >
                  <i className={`fa-solid ${selectedSkills.size === filteredSkills.length && filteredSkills.length > 0 ? 'fa-check-double text-cyan-400' : 'fa-list-check'}`} />
                  <span>{selectedSkills.size === filteredSkills.length && filteredSkills.length > 0 ? 'Deselect All' : 'Select All'}</span>
                </button>
              )}
              <span className="font-mono text-xs text-slate-400">
                Showing {filteredSkills.length} of {allSkills.length}
              </span>
            </div>
          </div>

          {/* Skeleton Shimmer Loading */}
          {isLoadingInitial ? (
            <div className="space-y-2">
              <div className="skill-skeleton-item" />
              <div className="skill-skeleton-item" />
              <div className="skill-skeleton-item" />
            </div>
          ) : filteredSkills.length === 0 ? (
            /* Empty State */
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <i className="fa-solid fa-box-open text-4xl text-slate-600" />
              <h3 className="text-base font-bold text-white">No skills found</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                {searchQuery
                  ? `No skills match "${searchQuery}". Try a different search.`
                  : "You haven't added any skills to this category yet. Use the form on the left to add one."}
              </p>
            </div>
          ) : (
            /* Skills List with custom sleek scrollbar */
            <div
              ref={skillsListRef}
              className="space-y-2 max-h-[520px] overflow-y-auto pr-1.5 custom-admin-scrollbar min-h-[140px]"
            >
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkills.has(skill.id);
                const isDragging = draggedSkillId === skill.id;
                const isDragOver = dragOverSkillId === skill.id;

                return (
                  <div
                    key={skill.id}
                    draggable={sortOrder === 'custom'}
                    onDragStart={(e) => handleDragStart(e, skill.id)}
                    onDragOver={(e) => handleDragOver(e, skill.id)}
                    onDrop={(e) => handleDrop(e, skill.id)}
                    onDragEnd={() => {
                      setDraggedSkillId(null);
                      setDragOverSkillId(null);
                    }}
                    className={`skill-row-item ${isSelected ? 'selected' : ''} ${
                      isDragOver ? 'border-2 border-cyan-400 bg-cyan-500/20' : ''
                    } ${isDragging ? 'opacity-40 scale-95 border-dashed border-cyan-400' : ''}`}
                  >
                    {/* Drag Handle */}
                    <div
                      className="skill-drag-handle"
                      title={sortOrder === 'custom' ? 'Drag to reorder' : 'Switch to Custom Order to reorder'}
                    >
                      <i className="fa-solid fa-grip-vertical text-sm" />
                    </div>

                    {/* Custom Checkbox */}
                    <div
                      onClick={() => handleToggleSelect(skill.id)}
                      className="skill-custom-checkbox"
                      title={isSelected ? 'Deselect' : 'Select for bulk delete'}
                    >
                      <i className="fa-solid fa-check" />
                    </div>

                    {/* Skill Icon */}
                    <div className="skill-icon-box">
                      {typeof skill.icon === 'string' &&
                      (skill.icon.startsWith('http') || skill.icon.startsWith('/') || skill.icon.startsWith('data:')) ? (
                        <img src={skill.icon} alt={skill.name} className="w-5 h-5 object-contain" />
                      ) : skill.icon ? (
                        <i className={`${skill.icon} colored`} />
                      ) : (
                        <span className="initials text-cyan-400">
                          {skill.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Skill Details */}
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {skill.name}
                      </div>
                      <div
                        className="font-mono text-[10px] uppercase tracking-wider font-semibold"
                        style={{ color: skill.categoryColor }}
                      >
                        {skill.categoryName}
                      </div>
                    </div>

                    {/* Visibility Toggle Switch */}
                    <label className="skill-toggle-switch" title="Toggle visibility on public site">
                      <input
                        type="checkbox"
                        checked={skill.isVisible}
                        onChange={() => handleToggleVisibility(skill.id)}
                      />
                      <span className="skill-slider" />
                    </label>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title={`Delete "${skill.name}"`}
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          4. FLOATING BULK ACTIONS BAR
         ======================================================== */}
      <div className={`skills-bulk-bar ${selectedSkills.size > 0 ? 'show' : ''}`}>
        <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-check-double text-cyan-400" />
          <span>{selectedSkills.size} skills selected</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-1.5 font-mono text-xs font-bold text-white shadow-md shadow-red-500/30 hover:bg-red-600 transition-all"
          >
            <i className="fa-solid fa-trash text-[10px]" />
            <span>Delete Selected</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedSkills(new Set())}
            className="rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300 hover:text-white transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ========================================================
          5. CATEGORY MANAGEMENT MODAL (Project Glassmorphic Theme)
         ======================================================== */}
      {isCatModalVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0B101B]/95 p-6 backdrop-blur-2xl shadow-2xl shadow-black/80 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-tags text-cyan-400" />
                <span>Manage Skill Categories</span>
              </h3>
              <button
                type="button"
                onClick={() => setCatModalVisible(false)}
                className="text-slate-400 hover:text-white text-lg transition-colors"
                title="Close modal"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Add New Category Box */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div>
                <label className="block font-mono text-xs font-semibold text-slate-300 mb-1">
                  New Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. DevOps, Cloud & Tools, Mobile App"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-slate-300 mb-1.5">
                  Color Tag Accent
                </label>
                <div className="category-color-picker">
                  {CATEGORY_COLORS.map((col) => (
                    <div
                      key={col}
                      onClick={() => setNewCatColor(col)}
                      className={`category-color-dot ${newCatColor === col ? 'active' : ''}`}
                      style={{ background: col }}
                      title={`Select ${col}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateCategory}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 font-mono text-xs font-bold text-black hover:opacity-90 transition-all shadow-md shadow-cyan-400/20 mt-1"
              >
                <i className="fa-solid fa-plus" />
                <span>Create Category</span>
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Existing Categories ({categories.length})
              </div>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">
                    No categories defined. Create your first one above!
                  </p>
                ) : (
                  categories.map((cat) => {
                    const skillCount = cat.items.length;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ background: cat.color }}
                          />
                          <span className="text-xs font-semibold text-white truncate">
                            {cat.name}
                          </span>
                          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                            {skillCount} skills
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name, skillCount)}
                          className="text-slate-400 hover:text-red-400 p-1.5 transition-colors"
                          title={`Delete "${cat.name}" category`}
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/10 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCatModalVisible(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-slate-300 hover:text-white transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSkills;

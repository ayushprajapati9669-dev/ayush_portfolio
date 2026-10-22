import React, { useState } from 'react';
import { playTick } from '../../../utils/audio';

function MethodBadge({ method }) {
  const m = method.toUpperCase();
  if (m === 'GET') {
    return (
      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider shrink-0">
        GET
      </span>
    );
  }
  if (m === 'POST') {
    return (
      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider shrink-0">
        POST
      </span>
    );
  }
  if (m === 'PUT') {
    return (
      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider shrink-0">
        PUT
      </span>
    );
  }
  if (m === 'PATCH') {
    return (
      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 uppercase tracking-wider shrink-0">
        PATCH
      </span>
    );
  }
  if (m === 'DELETE') {
    return (
      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider shrink-0">
        DELETE
      </span>
    );
  }
  return (
    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-500/15 text-slate-400 border border-slate-500/30 uppercase tracking-wider shrink-0">
      {m}
    </span>
  );
}

function CodeBlock({ code, language = 'bash', title = 'cURL Request' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    playTick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const ta = document.createElement('textarea');
    ta.value = code;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_e) {}
    document.body.removeChild(ta);
  };

  // Syntax highlighting for JSON or Bash
  const renderFormattedCode = () => {
    if (language === 'json') {
      const highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
          let cls = 'text-amber-300'; // number / boolean
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'text-sky-300 font-semibold'; // key
            } else {
              cls = 'text-emerald-300'; // string
            }
          } else if (/true|false/.test(match)) {
            cls = 'text-purple-300 font-semibold';
          } else if (/null/.test(match)) {
            cls = 'text-rose-300 font-semibold';
          }
          return `<span class="${cls}">${match}</span>`;
        });

      return <pre className="font-mono text-[11.5px] leading-relaxed text-slate-300 overflow-x-auto p-4 custom-admin-scrollbar" dangerouslySetInnerHTML={{ __html: highlighted }} />;
    }

    return (
      <pre className="font-mono text-[11.5px] leading-relaxed text-cyan-200 overflow-x-auto p-4 custom-admin-scrollbar">
        {code}
      </pre>
    );
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#070d14] overflow-hidden my-3 shadow-2xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-black/60">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 inline-block" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 font-semibold ml-2">
            {title}
          </span>
        </div>

        {/* Copy Button with Lucide-style Icon */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all border border-white/10 hover:border-cyan-400/40 bg-white/5 hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300"
          title="Copy snippet to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      {renderFormattedCode()}
    </div>
  );
}

export function AdminApiReference({ onSelectTab, showToast }) {
  const [activeEndpoint, setActiveEndpoint] = useState('auth-login');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');

  const scrollToEndpoint = (id) => {
    playTick();
    setActiveEndpoint(id);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const endpointsList = [
    // 1. Authentication
    {
      id: 'auth-login',
      group: 'Authentication',
      method: 'POST',
      path: '/api/auth/login',
      auth: 'Public (Rate Limited)',
      description: 'Authenticates administrator credentials with rate limiting (max 5 attempts/15m). Sets HttpOnly session cookie and returns a CSRF token for subsequent admin state mutations.',
      headers: ['Content-Type: application/json'],
      curl: `curl -X POST http://localhost:6000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"your_secure_password"}'`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "authenticated": true,
  "user": {
    "username": "admin",
    "role": "admin"
  },
  "csrfToken": "csrf_f9a8b7c6d5e4f3a2"
}`
    },
    {
      id: 'auth-session',
      group: 'Authentication',
      method: 'GET',
      path: '/api/auth/session',
      auth: 'Session / Bearer',
      description: 'Checks current session status via cookie or Bearer header. Returns authentication state, admin bootstrap flag, and CSRF token.',
      headers: ['Cookie: argon_session=<signed_cookie>', 'Authorization: Bearer <token> (optional)'],
      curl: `curl -X GET http://localhost:6000/api/auth/session \\
  -H "Cookie: argon_session=s%3AeyJzdWIiOiJhZG1pbiJ9..."`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "authenticated": true,
  "user": {
    "username": "admin",
    "role": "admin"
  },
  "csrfToken": "csrf_f9a8b7c6d5e4f3a2",
  "adminConfigured": true
}`
    },
    {
      id: 'auth-logout',
      group: 'Authentication',
      method: 'POST',
      path: '/api/auth/logout',
      auth: 'Public / Admin',
      description: 'Invalidates the current session by clearing the HttpOnly cookie.',
      headers: ['Content-Type: application/json'],
      curl: `curl -X POST http://localhost:6000/api/auth/logout`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "authenticated": false,
  "message": "Logged out."
}`
    },

    // 2. Public APIs
    {
      id: 'public-health',
      group: 'Public APIs',
      method: 'GET',
      path: '/api/health',
      auth: 'Public',
      description: 'Healthcheck endpoint reporting server operational status, storage engine (MongoDB or JSON file), admin bootstrap flag, and UTC timestamp.',
      headers: [],
      curl: `curl -X GET http://localhost:6000/api/health`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "status": "ok",
  "storageEngine": "mongodb-atlas",
  "adminConfigured": true,
  "timestamp": "2026-10-22T20:45:00.000Z"
}`
    },
    {
      id: 'public-bootstrap',
      group: 'Public APIs',
      method: 'GET',
      path: '/api/public/bootstrap',
      auth: 'Public',
      description: 'Master bootstrap bundle fetched during client initialization. Supplies profile, published projects, skills, certificates, resumes, and global site configuration in a single round-trip.',
      headers: [],
      curl: `curl -X GET http://localhost:6000/api/public/bootstrap`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "profile": {
    "displayName": "Ayush Prajapati",
    "monogram": "AP",
    "headerSubtitle": "Full-Stack Developer · SISTec, Bhopal",
    "email": "ayushprajapati9669@gmail.com",
    "location": "Bhopal, Madhya Pradesh, India",
    "education": {
      "degree": "B.Tech in Computer Science",
      "college": "SISTec, Bhopal",
      "cgpa": "8.42"
    }
  },
  "projects": [
    {
      "id": "proj-1",
      "title": "Argon Multi-Step CMS",
      "slug": "argon-multi-step-cms",
      "status": "published",
      "technologies": ["React", "Node.js", "MongoDB", "GSAP"]
    }
  ],
  "skills": [],
  "certificates": [],
  "settings": {
    "siteTitle": "Ayush Prajapati — Portfolio",
    "particlesEnabled": true
  }
}`
    },
    {
      id: 'public-profile',
      group: 'Public APIs',
      method: 'GET',
      path: '/api/public/profile',
      auth: 'Public',
      description: 'Returns public profile identity, education, social links, and biographical paragraphs.',
      headers: [],
      curl: `curl -X GET http://localhost:6000/api/public/profile`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "profile": {
    "displayName": "Ayush Prajapati",
    "monogram": "AP",
    "email": "ayushprajapati9669@gmail.com",
    "phone": "(+91) 9669802554",
    "location": "Bhopal, MP, India",
    "headline": "Building resilient full-stack systems and high-performance interfaces.",
    "socialLinks": {
      "github": "https://github.com/ayushprajapati9669-dev",
      "linkedin": "https://linkedin.com/in/ayushprajapati",
      "instagram": "https://instagram.com/ayush"
    }
  }
}`
    },
    {
      id: 'public-projects',
      group: 'Public APIs',
      method: 'GET',
      path: '/api/public/projects',
      auth: 'Public',
      description: 'Returns published portfolio projects. Supports optional category filtering via query parameter ?category=Full-Stack.',
      headers: [],
      curl: `curl -X GET "http://localhost:6000/api/public/projects?category=Full-Stack"`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "projects": [
    {
      "id": "proj-1729600000",
      "title": "Real-Time Collaborative Code Studio",
      "slug": "real-time-collaborative-code-studio",
      "category": "Full-Stack Web App",
      "shortDescription": "Cloud IDE with real-time OT sync, terminal execution, and AST linting.",
      "technologies": ["React", "Node.js", "Socket.io", "Docker"],
      "liveDemoUrl": "https://studio.ayushdev.in",
      "githubUrl": "https://github.com/ayushprajapati9669-dev/code-studio",
      "featured": true,
      "status": "published"
    }
  ]
}`
    },
    {
      id: 'public-project-slug',
      group: 'Public APIs',
      method: 'GET',
      path: '/api/public/projects/:slug',
      auth: 'Public',
      description: 'Fetches detailed case study for a single published project by its unique URL slug.',
      headers: [],
      curl: `curl -X GET http://localhost:6000/api/public/projects/real-time-collaborative-code-studio`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "project": {
    "id": "proj-1729600000",
    "title": "Real-Time Collaborative Code Studio",
    "slug": "real-time-collaborative-code-studio",
    "category": "Full-Stack Web App",
    "technologies": ["React", "Node.js", "Socket.io"],
    "keyHighlights": [
      "Engineered WebSocket room clustering for sub-20ms cursor sync",
      "Built sandboxed Node.js runner with resource throttling"
    ],
    "status": "published"
  }
}`
    },
    {
      id: 'public-skills',
      group: 'Public APIs',
      method: 'GET',
      path: '/api/public/skills',
      auth: 'Public',
      description: 'Retrieves all categorized technical skills and their official devicon identifiers.',
      headers: [],
      curl: `curl -X GET http://localhost:6000/api/public/skills`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "skills": [
    {
      "id": "cat-frontend",
      "category": "Frontend Development",
      "description": "Modern reactive client interfaces",
      "items": [
        { "name": "React.js", "logoKey": "react", "note": "Hooks & Context" },
        { "name": "Tailwind CSS", "logoKey": "tailwindcss", "note": "Custom design tokens" }
      ]
    }
  ]
}`
    },
    {
      id: 'public-certificates',
      group: 'Public APIs',
      method: 'GET',
      path: '/api/public/certificates',
      auth: 'Public',
      description: 'Retrieves all verified credentials, certificates, issuers, and verification links.',
      headers: [],
      curl: `curl -X GET http://localhost:6000/api/public/certificates`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "certificates": [
    {
      "id": "cert-1",
      "title": "Full-Stack Web Development Specialization",
      "issuer": "Coursera / Meta",
      "issueDate": "2024",
      "credentialId": "META-FS-94281",
      "credentialUrl": "https://coursera.org/verify/META-FS-94281",
      "skillsCovered": "React, REST APIs, Security, MongoDB"
    }
  ]
}`
    },
    {
      id: 'public-contact',
      group: 'Public APIs',
      method: 'POST',
      path: '/api/public/contact',
      auth: 'Public (Rate-Limited)',
      description: 'Handles recruiter and visitor message inquiries from /contact. Validates name, email, subject, and message body with spam rate-limiting.',
      headers: ['Content-Type: application/json'],
      curl: `curl -X POST http://localhost:6000/api/public/contact \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Alex Mercer","email":"recruiter@techcorp.io","subject":"Senior Full-Stack Role","message":"Hi Ayush, impressed by your portfolio projects. Are you open to discussing opportunities?"}'`,
      responseTitle: 'JSON Response (201 Created)',
      response: `{
  "message": "Thank you! Your message has been sent successfully. Ayush will get back to you shortly.",
  "deliveryMode": "database-persisted",
  "record": {
    "id": "msg-1729605599",
    "createdAt": "2026-10-22T20:45:00.000Z"
  }
}`
    },

    // 3. Admin APIs
    {
      id: 'admin-summary',
      group: 'Admin Operations',
      method: 'GET',
      path: '/api/admin/summary',
      auth: 'Admin Bearer / Session',
      description: 'Retrieves administrative dashboard metrics: total projects, published projects, certificates, total skills, unread messages, and server uptime.',
      headers: ['Authorization: Bearer <admin_token>'],
      curl: `curl -X GET http://localhost:6000/api/admin/summary \\
  -H "Authorization: Bearer <admin_token>"`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "summary": {
    "totalProjects": 4,
    "publishedProjects": 4,
    "totalCertificates": 6,
    "unreadMessages": 0,
    "skillsCount": 19,
    "lastSyncTimestamp": "2026-10-22T19:54:00.000Z"
  }
}`
    },
    {
      id: 'admin-portfolio-sync',
      group: 'Admin Operations',
      method: 'POST',
      path: '/api/portfolio/sync',
      auth: 'Admin Bearer / CSRF',
      description: 'Primary state synchronization endpoint used by the Admin CMS to commit full portfolio state updates (profile, projects, certificates, skills) to MongoDB.',
      headers: [
        'Content-Type: application/json',
        'Authorization: Bearer <admin_token>',
        'X-CSRF-Token: <csrf_token>'
      ],
      curl: `curl -X POST http://localhost:6000/api/portfolio/sync \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <admin_token>" \\
  -H "X-CSRF-Token: <csrf_token>" \\
  -d '{"profile":{...},"projects":[...],"certificates":[...],"skills":[...]}'`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "synced": true,
  "state": {
    "profile": { "displayName": "Ayush Prajapati" },
    "lastUpdated": "2026-10-22T20:45:00.000Z"
  }
}`
    },
    {
      id: 'admin-update-profile',
      group: 'Admin Operations',
      method: 'PUT',
      path: '/api/admin/profile',
      auth: 'Admin Bearer + CSRF',
      description: 'Updates personal profile attributes, education records, social profiles, hero headlines, and biography paragraphs.',
      headers: [
        'Content-Type: application/json',
        'Authorization: Bearer <admin_token>',
        'X-CSRF-Token: <csrf_token>'
      ],
      curl: `curl -X PUT http://localhost:6000/api/admin/profile \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <admin_token>" \\
  -H "X-CSRF-Token: <csrf_token>" \\
  -d '{"displayName":"Ayush Prajapati","headline":"Building resilient full-stack systems."}'`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "profile": {
    "displayName": "Ayush Prajapati",
    "headline": "Building resilient full-stack systems.",
    "updatedAt": "2026-10-22T20:45:00.000Z"
  }
}`
    },
    {
      id: 'admin-projects-list',
      group: 'Admin Operations',
      method: 'GET',
      path: '/api/admin/projects',
      auth: 'Admin Bearer',
      description: 'Lists all projects including unpublished drafts and private WIP projects with admin metadata.',
      headers: ['Authorization: Bearer <admin_token>'],
      curl: `curl -X GET http://localhost:6000/api/admin/projects \\
  -H "Authorization: Bearer <admin_token>"`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "projects": [
    {
      "id": "proj-1",
      "title": "Argon Multi-Step CMS",
      "slug": "argon-multi-step-cms",
      "status": "published",
      "completionPercent": 100
    }
  ]
}`
    },
    {
      id: 'admin-projects-create',
      group: 'Admin Operations',
      method: 'POST',
      path: '/api/admin/projects',
      auth: 'Admin Bearer + CSRF',
      description: 'Creates a new portfolio project case study.',
      headers: [
        'Content-Type: application/json',
        'Authorization: Bearer <admin_token>',
        'X-CSRF-Token: <csrf_token>'
      ],
      curl: `curl -X POST http://localhost:6000/api/admin/projects \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <admin_token>" \\
  -H "X-CSRF-Token: <csrf_token>" \\
  -d '{"title":"Cloud Monitor Dashboard","slug":"cloud-monitor-dashboard","category":"Full-Stack Web App","technologies":["React","Go","PostgreSQL"],"status":"published"}'`,
      responseTitle: 'JSON Response (201 Created)',
      response: `{
  "project": {
    "id": "proj-1729609999",
    "title": "Cloud Monitor Dashboard",
    "slug": "cloud-monitor-dashboard",
    "category": "Full-Stack Web App",
    "technologies": ["React", "Go", "PostgreSQL"],
    "status": "published",
    "createdAt": "2026-10-22T20:45:00.000Z"
  }
}`
    },
    {
      id: 'admin-projects-update',
      group: 'Admin Operations',
      method: 'PUT',
      path: '/api/admin/projects/:id',
      auth: 'Admin Bearer + CSRF',
      description: 'Updates an existing project by ID with partial or full field replacement.',
      headers: [
        'Content-Type: application/json',
        'Authorization: Bearer <admin_token>',
        'X-CSRF-Token: <csrf_token>'
      ],
      curl: `curl -X PUT http://localhost:6000/api/admin/projects/proj-1 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <admin_token>" \\
  -H "X-CSRF-Token: <csrf_token>" \\
  -d '{"status":"published","completionPercent":100}'`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "project": {
    "id": "proj-1",
    "status": "published",
    "completionPercent": 100,
    "updatedAt": "2026-10-22T20:45:00.000Z"
  }
}`
    },
    {
      id: 'admin-projects-delete',
      group: 'Admin Operations',
      method: 'DELETE',
      path: '/api/admin/projects/:id',
      auth: 'Admin Bearer + CSRF',
      description: 'Deletes a project record from the portfolio database.',
      headers: [
        'Authorization: Bearer <admin_token>',
        'X-CSRF-Token: <csrf_token>'
      ],
      curl: `curl -X DELETE http://localhost:6000/api/admin/projects/proj-1 \\
  -H "Authorization: Bearer <admin_token>" \\
  -H "X-CSRF-Token: <csrf_token>"`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "deleted": true,
  "id": "proj-1"
}`
    },
    {
      id: 'admin-messages-list',
      group: 'Admin Operations',
      method: 'GET',
      path: '/api/admin/messages',
      auth: 'Admin Bearer',
      description: 'Lists all contact messages received with sender IP, email, status, and full text.',
      headers: ['Authorization: Bearer <admin_token>'],
      curl: `curl -X GET http://localhost:6000/api/admin/messages \\
  -H "Authorization: Bearer <admin_token>"`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "messages": [
    {
      "id": "msg-1",
      "name": "Sarah Connor",
      "email": "sarah@cyberdyne.com",
      "subject": "Full-Stack Opportunity",
      "status": "unread",
      "createdAt": "2026-10-22T19:30:00.000Z"
    }
  ]
}`
    },
    {
      id: 'admin-messages-patch',
      group: 'Admin Operations',
      method: 'PATCH',
      path: '/api/admin/messages/:id',
      auth: 'Admin Bearer + CSRF',
      description: 'Updates message read status ("read", "unread", "archived").',
      headers: [
        'Content-Type: application/json',
        'Authorization: Bearer <admin_token>',
        'X-CSRF-Token: <csrf_token>'
      ],
      curl: `curl -X PATCH http://localhost:6000/api/admin/messages/msg-1 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <admin_token>" \\
  -H "X-CSRF-Token: <csrf_token>" \\
  -d '{"status":"read"}'`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "message": {
    "id": "msg-1",
    "status": "read"
  }
}`
    },
    {
      id: 'admin-settings',
      group: 'Admin Operations',
      method: 'GET',
      path: '/api/admin/settings',
      auth: 'Admin Bearer',
      description: 'Returns global site settings including SEO tags, particle canvas config, and Cloudinary upload credentials.',
      headers: ['Authorization: Bearer <admin_token>'],
      curl: `curl -X GET http://localhost:6000/api/admin/settings \\
  -H "Authorization: Bearer <admin_token>"`,
      responseTitle: 'JSON Response (200 OK)',
      response: `{
  "settings": {
    "siteTitle": "Ayush Prajapati — Full-Stack Developer",
    "seoDescription": "Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec Bhopal.",
    "particlesEnabled": true,
    "cloudinaryCloudName": "ayush-portfolio-cdn"
  }
}`
    }
  ];

  const filteredEndpoints = endpointsList.filter(ep => {
    const matchesGroup = selectedGroup === 'all' || ep.group === selectedGroup;
    const matchesSearch = searchFilter === '' ||
      ep.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-400/15">
            <i className="fa-solid fa-terminal text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                API Reference & Developer Docs
              </h2>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold uppercase tracking-wider">
                v1.0 REST
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Complete documentation for public endpoints, authentication headers, administrative mutations, and status codes.
            </p>
          </div>
        </div>

        {/* Action Button to User Guide */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('guide', '/admin/guide')}
            className="flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-sm"
          >
            <i className="fa-solid fa-book-open text-cyan-400" />
            <span>Open User Guide</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </button>
        </div>
      </div>

      {/* 2-Column Documentation Layout (Left Sticky TOC + Right Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN (lg:col-span-4 xl:col-span-3): Sticky TOC Navigation
            ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="glass-card-admin rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl bg-[#0b1120]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                <i className="fa-solid fa-code-branch text-cyan-400" />
                <span>Endpoints Directory</span>
              </h3>
              <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {filteredEndpoints.length}
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative mb-3">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search GET, POST, /profile..."
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400/60 transition-all font-mono"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-white/10 text-[10px] font-mono">
              {['all', 'Authentication', 'Public APIs', 'Admin Operations'].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => {
                    playTick();
                    setSelectedGroup(grp);
                  }}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    selectedGroup === grp
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  {grp === 'all' ? 'All' : grp.replace(' Operations', '').replace(' APIs', '')}
                </button>
              ))}
            </div>

            {/* Endpoints List */}
            <nav className="space-y-1 max-h-[calc(100vh-340px)] overflow-y-auto custom-admin-scrollbar pr-1">
              {filteredEndpoints.map((ep) => {
                const isActive = activeEndpoint === ep.id;
                return (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => scrollToEndpoint(ep.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left font-mono text-[11px] transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-white font-bold border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <MethodBadge method={ep.method} />
                    <span className="truncate">{ep.path.replace('/api', '')}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => scrollToEndpoint('status-codes')}
                className="w-full flex items-center gap-2 px-2.5 py-2 mt-2 pt-2 border-t border-white/10 text-left font-mono text-[11px] text-amber-400 hover:text-amber-300 transition-all"
              >
                <i className="fa-solid fa-table-list text-xs" />
                <span>HTTP Status Codes</span>
              </button>
            </nav>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (lg:col-span-8 xl:col-span-9): Scrollable Endpoints Content
            ========================================================================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          {/* Global API Notice & Auth Header info */}
          <div className="glass-card-admin rounded-2xl p-5 sm:p-6 space-y-3 border border-white/10 bg-[#0b1120]/80">
            <div className="flex items-center gap-2.5 font-mono text-xs font-bold text-cyan-400">
              <i className="fa-solid fa-key" />
              <span>Authentication & Security Protocols</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All administrative routes under <code className="text-cyan-300 bg-white/10 px-1 py-0.5 rounded font-mono">/api/admin/*</code> and <code className="text-cyan-300 bg-white/10 px-1 py-0.5 rounded font-mono">/api/portfolio/sync</code> require authentication. You may supply credentials either through the cryptographically signed <code className="text-emerald-300 bg-white/10 px-1 py-0.5 rounded font-mono">argon_session</code> HttpOnly cookie or by appending the HTTP header:
            </p>
            <div className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-xs text-cyan-300">
              Authorization: Bearer &lt;session_token&gt;
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              State-mutating methods (<code className="text-cyan-400">POST</code>, <code className="text-amber-400">PUT</code>, <code className="text-purple-400">PATCH</code>, <code className="text-rose-400">DELETE</code>) also enforce CSRF token validation via the <code className="text-amber-300">X-CSRF-Token</code> header to prevent Cross-Site Request Forgery.
            </p>
          </div>

          {/* Endpoints Rendering */}
          {filteredEndpoints.map((ep) => (
            <article
              key={ep.id}
              id={ep.id}
              className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10 transition-all hover:border-cyan-500/30"
            >
              {/* Endpoint Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <MethodBadge method={ep.method} />
                  <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
                    {ep.path}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className={`px-2.5 py-0.5 rounded-full border ${
                    ep.auth.includes('Admin')
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : ep.auth.includes('Rate')
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {ep.auth}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {ep.description}
              </p>

              {/* Headers List */}
              {ep.headers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Required Headers:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ep.headers.map((h, hIdx) => (
                      <span key={hIdx} className="font-mono text-[11px] text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* cURL Request */}
              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  cURL Request:
                </span>
                <CodeBlock code={ep.curl} language="bash" title={`cURL · ${ep.method} ${ep.path}`} />
              </div>

              {/* JSON Response */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Expected Response:
                </span>
                <CodeBlock code={ep.response} language="json" title={ep.responseTitle} />
              </div>
            </article>
          ))}

          {/* STATUS CODES REFERENCE TABLE */}
          <section id="status-codes" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-base">
                <i className="fa-solid fa-table-list" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">HTTP Response Status Codes</h3>
                <p className="text-xs text-slate-400">
                  Standard status codes returned by the Argon Portfolio API engine.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto custom-admin-scrollbar">
              <table className="w-full text-left text-xs text-slate-300 font-sans border-collapse">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-[11px] text-slate-400 bg-white/[0.02]">
                    <th className="py-2.5 px-3 font-semibold">Code</th>
                    <th className="py-2.5 px-3 font-semibold">Status Text</th>
                    <th className="py-2.5 px-4 font-semibold">Meaning & Context in Portfolio CMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11.5px]">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-emerald-400 font-bold">200</td>
                    <td className="py-3 px-3 text-white font-semibold">OK</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Standard success response for GET queries, profile/project updates, and deletions.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-bold">201</td>
                    <td className="py-3 px-3 text-white font-semibold">Created</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Resource successfully created. Returned on new project creation, message submissions, and media uploads.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-amber-400 font-bold">400</td>
                    <td className="py-3 px-3 text-white font-semibold">Bad Request</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Validation error. Payload has missing required fields (e.g. project title, name) or malformed URLs.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-rose-400 font-bold">401</td>
                    <td className="py-3 px-3 text-white font-semibold">Unauthorized</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Missing or invalid credentials. Sign in via /admin to obtain a valid session or Bearer token.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-rose-400 font-bold">403</td>
                    <td className="py-3 px-3 text-white font-semibold">Forbidden</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">CSRF token validation failed. State-mutating requests must include the verified X-CSRF-Token header.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-bold">404</td>
                    <td className="py-3 px-3 text-white font-semibold">Not Found</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">The requested project slug, certificate ID, media asset, or endpoint route was not found.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-purple-400 font-bold">429</td>
                    <td className="py-3 px-3 text-white font-semibold">Too Many Requests</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Rate limiter triggered. Enforced on /api/auth/login (5 attempts/15m) and /api/public/contact (5 submissions/hour).</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-red-500 font-bold">500</td>
                    <td className="py-3 px-3 text-white font-semibold">Internal Server Error</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Unhandled server-side exception occurred. Check backend console logs for stack trace.</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-amber-500 font-bold">503</td>
                    <td className="py-3 px-3 text-white font-semibold">Service Unavailable</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Admin user bootstrap required. Run "npm run setup:admin" from the server terminal to initialize credentials.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminApiReference;

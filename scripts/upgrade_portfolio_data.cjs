const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'server', 'data', 'portfolio.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. Upgrade Projects
const upgradedProjects = [
  {
    id: "proj-1792430568297",
    title: "Airbnb Clone — Vacation Rental Platform",
    slug: "airbnb-clone-platform",
    shortDescription: "Production-ready vacation rental platform featuring interactive map clustering, JWT auth, Stripe checkout simulation, and optimized MongoDB geospatial queries.",
    category: "Full-Stack Web App",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "RESTful APIs"],
    liveDemoUrl: "https://airbnbclone2-8519.onrender.com",
    githubUrl: "https://github.com/ayushprajapati9669-dev",
    featured: true,
    displayOrder: 1,
    status: "published",
    thumbnailType: "image",
    thumbnailUrl: "/images/airbnb-clone-preview.jpg",
    galleryImages: [],
    implementedFeatures: [
      "User authentication & session management with JWT and HTTP-only cookies",
      "Geospatial property searching and filtering by price, location, and guest capacity",
      "Interactive listings management with multi-image cloud uploads",
      "Booking lifecycle engine with simulated checkout transactions"
    ],
    problemContext: "Travel platforms require high-throughput search queries and real-time availability sync without latency spikes.",
    approachArchitecture: "Layered MVC architecture on Node/Express with MongoDB indexing, modular React state, and Tailwind design tokens.",
    lessonsLearned: "Fine-tuning MongoDB indexing cuts complex aggregation query latencies by over 60%.",
    disclaimer: "",
    createdAt: "2026-10-19T17:22:48.473Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "proj-1792430599188",
    title: "Zerodha Trading Dashboard Clone",
    slug: "zerodha-trading-dashboard",
    shortDescription: "Real-time trading analytics platform featuring WebSocket ticker streams, interactive candlestick charts, portfolio P&L tracking, and order execution engine.",
    category: "FinTech / Dashboard",
    technologies: ["React.js", "Node.js", "WebSocket", "Chart.js", "Express.js", "MongoDB"],
    liveDemoUrl: "https://airbnbclone2-8519.onrender.com",
    githubUrl: "https://github.com/ayushprajapati9669-dev",
    featured: true,
    displayOrder: 2,
    status: "published",
    thumbnailType: "image",
    thumbnailUrl: "/images/airbnb-clone-preview.jpg",
    galleryImages: [],
    implementedFeatures: [
      "Real-time WebSocket market data streaming with sub-100ms UI ticker updates",
      "Interactive technical charts supporting timeframe selection and volume indicators",
      "Instant portfolio valuation and profit/loss calculation engine",
      "Market and limit order placement simulation with optimistic UI updates"
    ],
    problemContext: "Financial dashboards require ultra-low latency data feeds and reliable state synchronization under heavy market volume.",
    approachArchitecture: "Decoupled WebSocket event bus with throttled React state dispatchers and memory-efficient data structures.",
    lessonsLearned: "Batching rapid incoming ticker payloads prevents unnecessary React reconciliation renders.",
    disclaimer: "",
    createdAt: "2026-10-19T17:23:19.188Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "proj-1792496192331",
    title: "Conversational AI Workspace & Assistant",
    slug: "conversational-ai-workspace",
    shortDescription: "AI workspace featuring streaming completions, multi-turn conversation memory, code syntax highlighting, and responsive desktop layout.",
    category: "AI / Machine Learning",
    technologies: ["React.js", "Node.js", "Express.js", "OpenAI API", "Tailwind CSS"],
    liveDemoUrl: "https://airbnbclone2-8519.onrender.com",
    githubUrl: "https://github.com/ayushprajapati9669-dev",
    featured: true,
    displayOrder: 3,
    status: "published",
    thumbnailType: "image",
    thumbnailUrl: "/images/airbnb-clone-preview.jpg",
    galleryImages: [],
    implementedFeatures: [
      "Server-Sent Events (SSE) token streaming for responsive typing-effect UI",
      "Dynamic session history with client-side indexing and search",
      "Syntax-highlighted code blocks with one-click clipboard copying",
      "Context-aware system prompt configuration and token budgeting"
    ],
    problemContext: "Conversational AI interfaces must handle long streaming responses smoothly without freezing the main thread.",
    approachArchitecture: "Node.js streaming backend relaying chunked LLM completions to an event-driven frontend listener.",
    lessonsLearned: "Streaming chunks directly through SSE creates an immediate perceived response time under 300ms.",
    disclaimer: "",
    createdAt: "2026-10-20T11:36:32.331Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "proj-1792781601076",
    title: "Modern E-Commerce Storefront & Cart Engine",
    slug: "modern-ecommerce-storefront",
    shortDescription: "High-conversion e-commerce storefront with client-side state caching, debounced instant search, category filtering, and secure checkout pipeline.",
    category: "E-Commerce / Full-Stack",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "Redux Toolkit"],
    liveDemoUrl: "https://airbnbclone2-8519.onrender.com",
    githubUrl: "https://github.com/ayushprajapati9669-dev",
    featured: true,
    displayOrder: 4,
    status: "published",
    thumbnailType: "image",
    thumbnailUrl: "/images/airbnb-clone-preview.jpg",
    galleryImages: [],
    implementedFeatures: [
      "Persistent cart drawer with local storage backup and instant quantity adjustments",
      "Debounced search engine across product catalog with faceted filter tags",
      "Secure order creation flow with validation and server-side price recalculation",
      "Responsive checkout stepper supporting discount coupons and address forms"
    ],
    problemContext: "Storefronts suffer high abandonment rates if client-side cart operations are sluggish or lose state on refresh.",
    approachArchitecture: "Normalized Redux Toolkit state slices synchronized with persistent browser storage and backend reconciliation.",
    lessonsLearned: "Optimistic cart updates combined with background API sync ensure zero perceived latency for shoppers.",
    disclaimer: "",
    createdAt: "2026-10-23T18:53:21.076Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "proj-1792669669594",
    title: "AI Agentic Autonomous Workspace",
    slug: "ai-agentic-workspace",
    shortDescription: "Autonomous agent execution framework featuring real-time terminal sandboxing, task decomposition, and interactive execution logs.",
    category: "AI Systems & Automation",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "Docker", "RESTful APIs"],
    liveDemoUrl: "https://agentic-workspace.onrender.com",
    githubUrl: "https://github.com/ayushprajapati9669-dev",
    featured: true,
    displayOrder: 5,
    status: "published",
    thumbnailType: "image",
    thumbnailUrl: "/images/airbnb-clone-preview.jpg",
    galleryImages: [],
    implementedFeatures: [
      "Automated prompt-to-plan decomposition with step-by-step verification gates",
      "Sandboxed command execution runtime with streaming output capture",
      "Interactive visual workflow diagrams illustrating agent decision states",
      "Comprehensive telemetry and audit trail for every LLM tool invocation"
    ],
    problemContext: "Autonomous agent execution requires isolation, state persistence, and real-time observability to ensure predictability.",
    approachArchitecture: "Event-driven orchestrator managing isolated Docker sandboxes and publishing updates via WebSockets.",
    lessonsLearned: "Granular execution logs and reversible checkpoints provide the safety needed for autonomous coding agents.",
    disclaimer: "",
    createdAt: "2026-10-22T11:47:49.594Z",
    updatedAt: new Date().toISOString()
  }
];

data.projects = upgradedProjects;

// 2. Upgrade Certificates
const upgradedCerts = [
  {
    id: "cert-1792434069380",
    title: "Full Stack Web Development (Delta Batch)",
    issuer: "Apna College",
    issueDate: "2025",
    credentialId: "APNA-DELTA-MERN-2025",
    credentialUrl: "https://apnacollege.in",
    imageUrl: "/images/apna-college-delta-certificate.jpg",
    skillsCovered: "MERN Stack, React.js, Node.js, Express.js, MongoDB, JavaScript ES6+, RESTful APIs",
    createdAt: "2026-10-19T18:21:11.371Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "cert-1792434116249",
    title: "Python, AI & Machine Learning Foundations",
    issuer: "CodeWithHarry",
    issueDate: "2025",
    credentialId: "CWH-AIML-PY-2025",
    credentialUrl: "https://codewithharry.com",
    imageUrl: "/images/apna-college-delta-certificate.jpg",
    skillsCovered: "Python, NumPy, Pandas, Scikit-Learn, Neural Networks, Machine Learning Foundations",
    createdAt: "2026-10-19T18:21:56.249Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "cert-1792595305806",
    title: "Cybersecurity Fundamentals & Network Defense",
    issuer: "Apna College",
    issueDate: "2026",
    credentialId: "APNA-CYBER-2026",
    credentialUrl: "https://apnacollege.in",
    imageUrl: "/images/apna-college-delta-certificate.jpg",
    skillsCovered: "Network Security, Cryptography, OWASP Top 10, Secure API Design, Threat Mitigation",
    createdAt: "2026-10-21T15:08:25.806Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "cert-1792578230937",
    title: "Meta Frontend Developer Specialization",
    issuer: "Meta / Coursera",
    issueDate: "2025",
    credentialId: "META-FRONTEND-2025",
    credentialUrl: "https://coursera.org",
    imageUrl: "/images/apna-college-delta-certificate.jpg",
    skillsCovered: "React, Advanced React, UI/UX Principles, Web Performance Optimization, Jest Testing",
    createdAt: "2026-10-21T10:23:50.937Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "cert-1792588849135",
    title: "AWS Cloud Practitioner Fundamentals",
    issuer: "Amazon Web Services",
    issueDate: "2025",
    credentialId: "AWS-CLOUD-PRACT-2025",
    credentialUrl: "https://aws.amazon.com",
    imageUrl: "/images/apna-college-delta-certificate.jpg",
    skillsCovered: "Cloud Architecture, EC2, S3, IAM, CloudFront, Scalability, Serverless Deployment",
    createdAt: "2026-10-21T13:20:49.135Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "cert-1792663342696",
    title: "Data Structures & Algorithms in Java / C++",
    issuer: "Apna College / Alpha Batch",
    issueDate: "2024",
    credentialId: "APNA-ALPHA-DSA-2024",
    credentialUrl: "https://apnacollege.in",
    imageUrl: "/images/apna-college-delta-certificate.jpg",
    skillsCovered: "Arrays, Trees, Graphs, Dynamic Programming, Greedy Algorithms, Time & Space Complexity",
    createdAt: "2026-10-22T10:02:22.696Z",
    updatedAt: new Date().toISOString()
  }
];

data.certificates = upgradedCerts;

// 3. Upgrade Learning Journey Milestones
const upgradedJourney = [
  {
    id: "m-workshop-mern-lead",
    title: "🎤 Lead Speaker & Instructor: MERN Stack & Cloud Architecture Workshop",
    desc: "<h3>Overview</h3><p>Delivered an intensive hands-on technical workshop for 120+ student engineers covering MERN stack fundamentals, RESTful API design, and cloud deployments on Render.</p><h3>Key Highlights</h3><ul><li>Conducted live coding demos on building scalable Express controllers and MongoDB indexing.</li><li>Mentored 15 student teams during the project build-a-thon.</li><li>Received top feedback scores with 96% positive rating.</li></ul>",
    year: "Year 3",
    phase: "Technical Leadership",
    yearBadge: "Year 3",
    status: "completed",
    metaLabel: "Workshop · Technical Leadership",
    progress: 100,
    rating: 5,
    tags: ["MERN Stack", "Public Speaking", "Cloud Deployment", "Mentorship"],
    icon: "fa-microphone",
    image: null,
    images: [],
    hdImages: [],
    published: true,
    pinned: true,
    spotlight: true,
    views: 45,
    createdAt: "2026-10-24T10:00:00.000Z"
  },
  {
    id: "m-1792870175334",
    title: "💼 Software Engineering Intern (Full-Stack & Cloud Systems)",
    desc: "<h3>Overview</h3><p>Engineered full-stack features, optimized database query execution plans, and implemented automated CI/CD test pipelines.</p><h3>Key Highlights</h3><ul><li>Refactored legacy endpoints into modular services, cutting payload transfer overhead by 35%.</li><li>Collaborated in agile sprint cycles with daily standups and code reviews.</li><li>Implemented automated backend security and validation middleware.</li></ul>",
    year: "Year 3",
    phase: "Professional Experience",
    yearBadge: "Year 3",
    status: "completed",
    metaLabel: "Internship · Experience",
    progress: 100,
    rating: 5,
    tags: ["React JS", "Node.js", "Express.js", "MongoDB", "CI/CD"],
    icon: "fa-briefcase",
    image: null,
    images: [],
    hdImages: [],
    published: true,
    pinned: true,
    spotlight: true,
    views: 38,
    createdAt: "2026-10-24T18:00:00.000Z"
  },
  {
    id: "m-1792870162021",
    title: "🏆 1st Place Winner: Smart India Internal Hackathon",
    desc: "<h3>Overview</h3><p>Awarded First Place among 36 competing engineering teams for developing an automated real-time resource allocation and dispatch platform.</p><h3>Key Highlights</h3><ul><li>Built full-stack prototype in a 36-hour non-stop sprint using React, Node.js, and MongoDB.</li><li>Engineered WebSocket bi-directional coordination for live status updates.</li><li>Presented technical architecture and business viability directly to university evaluators.</li></ul>",
    year: "Year 3",
    phase: "Hackathon Champion",
    yearBadge: "Year 3",
    status: "completed",
    metaLabel: "Hackathon · Achievement",
    progress: 100,
    rating: 5,
    tags: ["Hackathon", "React", "Node.js", "Socket.io", "Rapid Prototyping"],
    icon: "fa-trophy",
    image: null,
    images: [],
    hdImages: [],
    published: true,
    pinned: true,
    spotlight: true,
    views: 52,
    createdAt: "2026-10-24T17:30:00.000Z"
  },
  {
    id: "m-1792908995865",
    title: "⚡ High-Throughput API Engine & Real-Time Microservices",
    desc: "<h3>Overview</h3><p>Architected a high-concurrency microservice handling throttled background jobs, rate-limited tokens, and robust error recovery.</p><h3>Key Highlights</h3><ul><li>Implemented Redis-backed distributed locks and caching layers.</li><li>Designed clean RESTful contracts documented with OpenAPI specifications.</li><li>Achieved zero downtime across simulated stress benchmarks.</li></ul>",
    year: "Year 3",
    phase: "Advanced Engineering",
    yearBadge: "Year 3",
    status: "completed",
    metaLabel: "System Design · Performance",
    progress: 90,
    rating: 5,
    tags: ["System Design", "Node.js", "Redis", "Microservices"],
    icon: "fa-server",
    image: null,
    images: [],
    hdImages: [],
    published: true,
    pinned: false,
    spotlight: true,
    views: 29,
    createdAt: "2026-10-25T06:16:35.865Z"
  },
  {
    id: "m-1-1792835712842",
    title: "Core Programming & Computer Science Fundamentals",
    desc: "<h3>Overview</h3><p>Rigorous grounding in data structures, algorithms, object-oriented design, database normalization, and operating system mechanics.</p>",
    year: "Year 1–2",
    phase: "Foundation",
    yearBadge: "Year 1–2",
    status: "completed",
    metaLabel: "Foundation · Year 1–2",
    progress: 100,
    rating: 5,
    tags: ["C", "Java", "Python", "OOP", "MySQL"],
    icon: "fa-graduation-cap",
    image: null,
    images: [],
    hdImages: [],
    published: true,
    pinned: false,
    spotlight: false,
    views: 20,
    createdAt: "2026-10-24T08:00:00.000Z"
  },
  {
    id: "m-2-1792835712842",
    title: "MERN Stack & Interactive Systems Architecture",
    desc: "<h3>Overview</h3><p>End-to-end development of dynamic production web applications, reactive state management, and resilient server-side REST APIs.</p>",
    year: "Year 3",
    phase: "Full-Stack Practice",
    yearBadge: "Year 3",
    status: "completed",
    metaLabel: "Full-Stack Practice · Year 3",
    progress: 100,
    rating: 5,
    tags: ["React", "Node.js", "Express", "MongoDB"],
    icon: "fa-layer-group",
    image: null,
    images: [],
    hdImages: [],
    published: true,
    pinned: false,
    spotlight: false,
    views: 25,
    createdAt: "2026-10-24T09:00:00.000Z"
  }
];

if (!data.profile) data.profile = {};
data.profile.learningJourney = upgradedJourney;

// 4. Update Skill category items to standard names
if (data.skills && Array.isArray(data.skills)) {
  data.skills.forEach(cat => {
    if (cat.items && Array.isArray(cat.items)) {
      cat.items.forEach(item => {
        if (item.name === 'HTML') item.name = 'HTML5';
        if (item.name === 'CSS') item.name = 'CSS3';
        if (item.name === 'REST API Development') item.name = 'RESTful APIs';
      });
    }
  });
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully upgraded portfolio.json data!');


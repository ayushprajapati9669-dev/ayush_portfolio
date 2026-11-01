#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { getEnvConfig } = require('../src/config/env');
const { Profile, PortfolioState } = require('../src/models');
const mongoose = require('mongoose');

const config = getEnvConfig();
const dataFilePath = path.join(__dirname, '../data/portfolio.json');

const raw = fs.readFileSync(dataFilePath, 'utf8');
const data = JSON.parse(raw);

if (!data.profile || !Array.isArray(data.profile.learningJourney)) {
  console.error('Invalid portfolio structure: profile.learningJourney not found.');
  process.exit(1);
}

const cleanedMilestones = [
  {
    id: "m-workshop-mern-lead",
    title: "🎤 Lead Speaker & Instructor: MERN Stack & Cloud Architecture Workshop",
    desc: "<h3>Hands-on Architecture Workshop</h3><p>Organized and conducted a flagship 2-day technical bootcamp on <strong>MERN Stack Engineering and Cloud Deployment</strong> at SISTec Bhopal. Mentored 120+ engineering students building scalable REST APIs with Express & Node.js, reactive state with React, and robust schema modeling with MongoDB.</p><h3>Live Demo & Lab Outcomes</h3><ul><li>Live-coded a full-stack real-time collaboration app with Socket.io on stage.</li><li>Guided students through Git branching workflows and live cloud deployment on Render and Vercel.</li><li>Rated 4.9/5 across attendee feedback surveys.</li></ul>",
    year: "Year 3",
    status: "completed",
    metaLabel: "Workshop · Technical Leadership",
    progress: 100,
    rating: 5,
    metric: "120+ Attendees · 2-Day Live Coding Lab & Project Deployment",
    tags: [
      "React JS",
      "Node.js",
      "MongoDB",
      "Socket.io",
      "Express.js",
      "Tailwind CSS"
    ],
    icon: "fa-chalkboard-user",
    image: "/images/ayush-workshop-lead.jpg",
    images: [
      "/images/ayush-workshop-lead.jpg",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop"
    ],
    hdImages: [],
    imageAlt: "Ayush Prajapati delivering MERN Stack Workshop on stage in front of students",
    link: "https://github.com/ayushprajapati9669-dev",
    metric: "120+ Attendees · SISTec Bhopal",
    badgeText: "FLAGSHIP MILESTONE",
    badgeIcon: "fa-trophy",
    challenge: "Deliver production full-stack engineering paradigms to 120+ students within a fast-paced 48-hour hands-on curriculum.",
    solution: "Structured modular micro-lectures paired with real-time live coding labs and automated deployment verifications.",
    outcome: "120+ functional web apps successfully deployed live to Render and Vercel by student cohorts.",
    metrics: [
      { value: "120+", label: "Engineers Mentored" },
      { value: "48 Hrs", label: "Intensive Bootcamp" },
      { value: "4.9/5", label: "Participant Rating" }
    ],
    links: [
      { url: "https://github.com/ayushprajapati9669-dev", label: "Workshop Curriculum" }
    ],
    deepdive: "Spearheaded curriculum development encompassing authentication security, MongoDB indexing, and reactive front-end architectures.",
    proofs: [],
    published: true,
    pinned: true,
    spotlight: true,
    views: 450,
    createdAt: "2026-10-24T19:30:00.000Z"
  },
  {
    id: "m-1792870162021",
    title: "🏆 1st Place Winner: State Web Innovation Hackathon",
    desc: "<h3>Challenge & Problem</h3><p>Designed and built a scalable real-time solution tackling student learning and resource-sharing bottlenecks under strict 36-hour sprint constraints.</p><h3>Architecture</h3><p>Leveraged MERN stack with WebSocket event-driven communication, Redis-backed pub/sub, and intuitive responsive UI.</p><h3>Outcome</h3><p>Awarded 1st place among 40+ participating engineering teams.</p>",
    year: "Year 3",
    status: "completed",
    metaLabel: "Hackathon · 1st Place Achievement",
    progress: 100,
    rating: 5,
    tags: [
      "Hackathon",
      "React",
      "NodeJS",
      "Socket.io",
      "MongoDB"
    ],
    icon: "fa-trophy",
    image: "/uploads/journey_3_1793438989765_854.jpg",
    images: [
      "/uploads/journey_3_0_1793438989767_504.jpg",
      "/uploads/journey_3_1_1793438989768_800.jpg"
    ],
    hdImages: [],
    imageAlt: "Hackathon 1st place award celebration and project demo",
    link: "https://github.com/ayushprajapati9669-dev",
    metric: "Rank #1 / 40+ Competing Teams",
    badgeText: "STATE CHAMPION",
    badgeIcon: "fa-award",
    challenge: "Construct a fault-tolerant collaborative workspace under a rigid 36-hour sprint deadline.",
    solution: "Engineered real-time state synchronization using WebSocket channels and optimistic UI updates.",
    outcome: "Secured unanimous 1st place recognition from industry judging panel.",
    metrics: [
      { value: "1st", label: "Overall Rank" },
      { value: "40+", label: "Colleges Competed" },
      { value: "36 Hrs", label: "Sprint Duration" }
    ],
    links: [
      { url: "https://github.com/ayushprajapati9669-dev", label: "View Source Code" }
    ],
    deepdive: "Architected end-to-end full-stack prototype with real-time notifications and JWT authentication.",
    proofs: [],
    published: true,
    pinned: true,
    spotlight: true,
    views: 290,
    createdAt: "2026-10-24T19:29:22.021Z"
  },
  {
    id: "m-1792870175334",
    title: "💼 Software Engineering Intern — Full-Stack Systems",
    desc: "<h3>Role & Responsibilities</h3><p>Delivered production features, code reviews, and RESTful API integrations across React.js and Node.js microservices.</p><h3>Key Impact</h3><ul><li>Optimized database queries and API response times by 35%.</li><li>Engineered modular, reusable UI components with responsive UX and robust error boundaries.</li></ul>",
    year: "Year 3",
    status: "completed",
    metaLabel: "Internship · Professional Experience",
    progress: 100,
    rating: 5,
    tags: [
      "Internship",
      "FullStack",
      "React.js",
      "Node.js",
      "REST APIs"
    ],
    icon: "fa-briefcase",
    image: null,
    images: [],
    hdImages: [],
    imageAlt: "Software Engineering Internship",
    link: "https://github.com/ayushprajapati9669-dev",
    metric: "35% Faster Response Times · Production APIs",
    badgeText: "PRODUCTION IMPACT",
    badgeIcon: "fa-briefcase",
    challenge: "Legacy endpoints had unindexed query bottlenecks causing high latency under concurrent load.",
    solution: "Restructured MongoDB compound indexes, implemented query caching, and normalized JSON responses.",
    outcome: "Achieved sub-100ms average latency across core public endpoints.",
    metrics: [
      { value: "35%", label: "Latency Reduction" },
      { value: "12+", label: "PRs Merged" },
      { value: "99.8%", label: "Uptime" }
    ],
    links: [],
    deepdive: "Collaborated in an Agile sprint cycle delivering scalable front-end and back-end modules.",
    proofs: [],
    published: true,
    pinned: true,
    spotlight: true,
    views: 180,
    createdAt: "2026-10-24T19:29:35.334Z"
  },
  {
    id: "m-1792908995865",
    title: "🚀 Cloud Architecture & CI/CD Deployment Specialization",
    desc: "<h3>Overview</h3><p>Architected automated CI/CD deployment pipelines using GitHub Actions, Docker containerization, and cloud deployment workflows on Render, Vercel, and AWS.</p><h3>Key Outcomes</h3><ul><li>Automated build, test, and container packaging pipelines with zero downtime.</li><li>Configured reverse-proxy headers, SSL termination, and environment security guards.</li></ul>",
    year: "Year 3",
    status: "completed",
    metaLabel: "DevOps · Cloud Engineering",
    progress: 100,
    rating: 5,
    tags: [
      "DevOps",
      "Docker",
      "CI/CD",
      "AWS",
      "Render"
    ],
    icon: "fa-server",
    image: "/uploads/journey_3_1793438989765_854.jpg",
    images: [
      "/uploads/journey_3_0_1793438989767_504.jpg",
      "/uploads/journey_3_1_1793438989768_800.jpg",
      "/uploads/journey_3_2_1793438989801_732.jpg",
      "/uploads/journey_3_3_1793438989803_353.jpg"
    ],
    hdImages: [],
    imageAlt: "Cloud DevOps Architecture and CI/CD pipelines",
    link: "https://github.com/ayushprajapati9669-dev",
    metric: "Automated Zero-Downtime Deployments",
    badgeText: "DEVOPS EXCELLENCE",
    badgeIcon: "fa-server",
    challenge: "Eliminate manual deployment friction and safeguard production releases against regressions.",
    solution: "Engineered multi-stage GitHub Actions workflows with linting, unit testing, and Docker builds.",
    outcome: "100% automated release pipeline with instant rollbacks on health check failures.",
    metrics: [
      { value: "0", label: "Downtime Incidents" },
      { value: "< 3 Min", label: "Build to Deploy" },
      { value: "100%", label: "Automated Tests" }
    ],
    links: [],
    deepdive: "Streamlined infrastructure configuration with secure environment isolation and Docker multi-stage builds.",
    proofs: [],
    published: true,
    pinned: true,
    spotlight: true,
    views: 215,
    createdAt: "2026-10-25T06:16:35.865Z"
  },
  {
    id: "m-1792942230394",
    title: "📜 Full-Stack Web Development Delta Certification",
    desc: "<h3>Certification Overview</h3><p>Completed intensive full-stack curriculum covering JavaScript ES6+, React.js, Express.js REST APIs, MongoDB schema design, relational concepts, and authentication architectures.</p><h3>Key Highlights</h3><ul><li>Built and deployed multiple production-ready full-stack applications.</li><li>Mastered responsive layouts, asynchronous state management, and MVC backend patterns.</li></ul>",
    year: "Year 3",
    status: "completed",
    metaLabel: "Apna College · Verified Credential",
    progress: 100,
    rating: 5,
    tags: [
      "MERN Stack",
      "React.js",
      "Node.js",
      "MongoDB",
      "JavaScript"
    ],
    icon: "fa-certificate",
    image: null,
    images: [],
    hdImages: [],
    imageAlt: "Apna College Delta Full-Stack Certification",
    link: "https://github.com/ayushprajapati9669-dev",
    metric: "100% Curriculum Completed",
    badgeText: "VERIFIED CREDENTIAL",
    badgeIcon: "fa-certificate",
    challenge: "Master complex full-stack web technologies from fundamentals to production architecture.",
    solution: "Completed comprehensive coursework with real-world capstone projects and code reviews.",
    outcome: "Awarded certified credential in Full-Stack Web Development.",
    metrics: [
      { value: "100%", label: "Completion" },
      { value: "4+", label: "Capstone Projects" }
    ],
    links: [],
    deepdive: "Delved into React hooks, state lifting, Redux Toolkit, Express middleware, and MongoDB aggregations.",
    proofs: [],
    published: true,
    pinned: false,
    spotlight: false,
    views: 120,
    createdAt: "2026-10-25T15:30:30.394Z"
  },
  {
    id: "m-1792835816020",
    title: "🧠 Artificial Intelligence & LLM Application Engineering",
    desc: "<h3>Exploration & Implementation</h3><p>Developing conversational AI integrations and neural architectures using Google Gemini API, OpenAI APIs, and Python. Engineered real-time streaming chat interfaces with token optimizations.</p><h3>Focus Areas</h3><ul><li>LLM prompt chaining, streaming token parser, and multimodal input handling.</li><li>Applied machine learning algorithms for predictive analytics and classification.</li></ul>",
    year: "Year 3",
    status: "focus",
    metaLabel: "AI / ML · Advanced Exploration",
    progress: 85,
    rating: 5,
    tags: [
      "Python",
      "Gemini API",
      "AI / ML",
      "LLMs"
    ],
    icon: "fa-brain",
    image: null,
    images: [],
    hdImages: [],
    imageAlt: "AI and LLM exploration",
    link: "https://github.com/ayushprajapati9669-dev",
    metric: "Conversational AI & LLM Streaming Integration",
    badgeText: "INTELLIGENT SYSTEMS",
    badgeIcon: "fa-brain",
    challenge: "Implement low-latency streaming responses with resilient fallbacks for conversational AI.",
    solution: "Integrated Server-Sent Events (SSE) and token-buffering parsers for instant typing effects.",
    outcome: "Production-ready AI chat workspace integrated directly into personal portfolio.",
    metrics: [
      { value: "85%", label: "Mastery" },
      { value: "SSE", label: "Streaming" }
    ],
    links: [],
    deepdive: "Fine-tuning prompt engineering pipelines and experimenting with retrieval-augmented generation (RAG).",
    proofs: [],
    published: true,
    pinned: false,
    spotlight: false,
    views: 95,
    createdAt: "2026-10-24T09:56:56.020Z"
  },
  {
    id: "m-1-1792835712842",
    title: "Core Programming & Computer Science Fundamentals",
    desc: "<ol><li>Built a strong foundation in C, Java, Python, object-oriented programming, relational databases (MySQL), and HTML/CSS layouts at SISTec, Bhopal.</li></ol>",
    year: "Year 1-2",
    status: "completed",
    metaLabel: "Foundation · Year 1–2",
    progress: 100,
    rating: 5,
    tags: [
      "C",
      "Java",
      "Python",
      "MySQL",
      "OOP"
    ],
    icon: "fa-graduation-cap",
    image: null,
    images: [],
    hdImages: [],
    imageAlt: "Computer Science Fundamentals",
    link: "",
    metric: "8.42 CGPA · Top Tier Standing",
    badgeText: "ACADEMIC FOUNDATION",
    badgeIcon: "fa-graduation-cap",
    challenge: "Master low-level programming concepts, memory pointers, and algorithmic complexity.",
    solution: "Solved foundational DSA problems and built CLI tools in C and Java.",
    outcome: "Built rock-solid foundation for scalable software engineering.",
    metrics: [
      { value: "8.42", label: "B.Tech CGPA" }
    ],
    links: [],
    deepdive: "Coursework in Data Structures, Algorithms, OS, DBMS, Computer Networks, and Discrete Math.",
    proofs: [],
    published: true,
    pinned: false,
    spotlight: false,
    views: 85,
    createdAt: "2026-10-24T09:55:12.842Z"
  },
  {
    id: "m-2-1792835712842",
    title: "MERN Stack & Interactive Systems",
    desc: "<p>Transitioned to full-stack JavaScript engineering with React.js, Node.js, Express.js, and MongoDB—building a Zerodha-inspired trading dashboard and a ChatGPT-inspired conversational AI workspace.</p>",
    year: "Year 3",
    status: "completed",
    metaLabel: "Full-Stack Practice · Year 3",
    progress: 100,
    rating: 5,
    tags: [
      "React.js",
      "Node.js",
      "MongoDB",
      "Express.js"
    ],
    icon: "fa-layer-group",
    image: null,
    images: [],
    hdImages: [],
    imageAlt: "MERN Stack Practice",
    link: "https://github.com/ayushprajapati9669-dev",
    metric: "Production-Grade Full-Stack Applications",
    badgeText: "FULL-STACK RIGOR",
    badgeIcon: "fa-layer-group",
    challenge: "Design robust state management and REST architecture for complex interactive dashboards.",
    solution: "Combined reactive React hooks, Context API, modular Express routes, and Mongoose models.",
    outcome: "Shipped two flagship portfolio projects with full live demos and GitHub repositories.",
    metrics: [
      { value: "2", label: "Flagship Platforms" },
      { value: "100%", label: "Responsive" }
    ],
    links: [],
    deepdive: "Implemented real-time charting, order execution simulations, and multi-threaded AI chat handling.",
    proofs: [],
    published: true,
    pinned: false,
    spotlight: false,
    views: 110,
    createdAt: "2026-10-24T09:55:12.842Z"
  }
];

data.profile.learningJourney = cleanedMilestones;

// Save to portfolio.json
const tmpFile = `${dataFilePath}.tmp`;
fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
fs.renameSync(tmpFile, dataFilePath);
console.log('portfolio.json successfully updated with cleaned, professional milestones.');

// Sync to MongoDB Atlas if connection URI is available
async function syncMongo() {
  const uri = config.mongoUri;
  if (!uri) {
    console.log('No MongoDB URI provided. File update complete.');
    process.exit(0);
  }

  try {
    console.log('Connecting to MongoDB Atlas to synchronize milestones...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connected successfully.');

    // Update Profile collection
    await Profile.findOneAndUpdate(
      {},
      { $set: { learningJourney: cleanedMilestones } },
      { upsert: true, new: true }
    );
    console.log('Profile collection updated in MongoDB Atlas.');

    // Update PortfolioState collection
    if (PortfolioState) {
      await PortfolioState.findOneAndUpdate(
        { singletonKey: 'main_portfolio' },
        { $set: { 'profile.learningJourney': cleanedMilestones } },
        { upsert: true }
      );
      console.log('PortfolioState singleton updated in MongoDB Atlas.');
    }

    console.log('All MongoDB Atlas collections synchronized successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB sync warning/error:', err.message);
    process.exit(0);
  }
}

syncMongo();

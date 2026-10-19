const INITIAL_SEED_DATA = {
  profile: {
    name: "Ayush Prajapati",
    displayName: "AYUSH PRAJAPATI",
    monogram: "AP",
    eyebrow: "COMPUTER SCIENCE STUDENT · DEVELOPER · BUILDER",
    headline: "Hi, I'm Ayush.",
    supportingHeadline: "I build thoughtful web experiences.",
    heroDescription: "I’m a Computer Science student exploring the intersection of web engineering, problem solving, and intelligent applications. I enjoy turning ideas into useful digital products and continuously improving how I build them.",
    availabilityLabel: "Open to learning opportunities & SWE internships",
    primaryCtaText: "Explore my work",
    secondaryCtaText: "Let's connect",
    education: {
      degree: "B.Tech in Computer Science and Engineering",
      college: "SISTec (Sagar Institute of Science and Technology)",
      location: "Bhopal, Madhya Pradesh, India",
      stage: "Third-year undergraduate student"
    },
    aboutBio: [
      "I am a third-year B.Tech Computer Science and Engineering student at SISTec, Bhopal, focused on building full-stack web applications with the MERN stack and strengthening my core software engineering fundamentals.",
      "Alongside developing full-stack interfaces and REST APIs with React, Node.js, Express, and MongoDB, I actively practice Data Structures and Algorithms in C, Java, and Python to sharpen how I reason about time complexity, state, and system design.",
      "I am also exploring Artificial Intelligence and Machine Learning—specifically how modern conversational workflows and intelligent tooling can be integrated cleanly into practical web software."
    ],
    focusAreas: [
      {
        title: "MERN-Stack Engineering",
        detail: "Building end-to-end web applications with React.js, Node.js, Express.js, MongoDB, and structured REST APIs."
      },
      {
        title: "Data Structures & Algorithms",
        detail: "Consistent problem-solving practice across arrays, trees, graphs, recursion, and dynamic programming."
      },
      {
        title: "AI & ML Exploration",
        detail: "Studying foundational machine learning concepts and building conversational AI web interfaces."
      },
      {
        title: "Engineering Goal",
        detail: "Preparing for software engineering internships and full-time roles at engineering-driven product companies."
      }
    ],
    learningJourney: [
      {
        phase: "EDUCATION · 2024 – 2028",
        title: "B.Tech CSE — SISTec, Bhopal (CGPA: 8.42)",
        description: "Pursuing Bachelor of Technology in Computer Science & Engineering at SISTec, Bhopal with an 8.42 CGPA (Batch 2024 – 2028). Completed Class XII (MP Board) from Kasturba Vidhya Mandir, Jamani with 83.5% (2022)."
      },
      {
        phase: "ACADEMIC PROJECTS · MERN & AI",
        title: "Stock Trading Platform & Gemini AI ChatGPT Clone",
        description: "Engineered a full-stack Stock Trading Platform (holdings, orders, positions, funds, Market/Limit Buy & Sell) and a ChatGPT Clone using React.js, Node.js, Express.js, MongoDB, and Gemini API."
      },
      {
        phase: "ACHIEVEMENTS & LIVE DEPLOYMENTS",
        title: "Airbnb Clone Live Deployment & Competition Winner",
        description: "Won a website-making competition at college, completed the Apna College Delta Full-Stack Web Development course, and deployed a live Airbnb Clone on Render."
      }
    ],
    socialLinks: {
      github: "https://github.com/ayushprajapati9669-dev",
      linkedin: "https://www.linkedin.com/in/ayush-prajapati-b9042424a/",
      instagram: "https://www.instagram.com/ayush7162/"
    },
    portrait: {
      url: "/uploads/portrait_transparent.png",
      alt: "Temporary stand-in studio portrait used to demonstrate real-time pixel-to-particle dispersion (not a photograph of Ayush Prajapati)",
      caption: "Temporary Studio Stand-In · Replaceable in Admin CMS",
      isTemporaryStandIn: true,
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      particleDensity: 4
    },
    updatedAt: "2026-10-17T16:00:00.000Z"
  },
  projects: [],
  skills: [
    {
      id: "skill-cat-languages",
      category: "Languages",
      description: "Core programming languages used for data structures, coursework, scripting, and full-stack development.",
      displayOrder: 1,
      items: [
        { name: "C", logoKey: "c", note: "Pointers, memory fundamentals, and foundational procedural programming" },
        { name: "Java", logoKey: "java", note: "Object-oriented design, collections framework, and DSA implementation" },
        { name: "Python", logoKey: "python", note: "Scripting, algorithmic problem solving, and AI/ML exploration" },
        { name: "JavaScript", logoKey: "javascript", note: "ES6+, asynchronous workflows, DOM APIs, and full-stack application logic" }
      ]
    },
    {
      id: "skill-cat-frontend",
      category: "Frontend",
      description: "Building responsive, accessible, and interactive user interfaces.",
      displayOrder: 2,
      items: [
        { name: "HTML", logoKey: "html5", note: "Semantic document structure, accessible forms, and SEO conventions" },
        { name: "CSS", logoKey: "css3", note: "Responsive grid/flexbox layouts, custom properties, and fluid typography" },
        { name: "React.js", logoKey: "react", note: "Component architecture, hooks, router navigation, and state management" },
        { name: "Responsive UI Development", logoKey: "responsive", note: "Cross-viewport layouts engineered for desktop, tablet, and mobile screens" }
      ]
    },
    {
      id: "skill-cat-backend",
      category: "Backend",
      description: "Server-side application architecture, routing, authentication, and API validation.",
      displayOrder: 3,
      items: [
        { name: "Node.js", logoKey: "nodejs", note: "Event-driven server runtime, file/stream handling, and modular tooling" },
        { name: "Express.js", logoKey: "express", note: "RESTful routing, middleware pipelines, authentication, and error handling" },
        { name: "REST API Development", logoKey: "postman", note: "Resource modeling, request validation, HTTP status semantics, and API testing with Postman" }
      ]
    },
    {
      id: "skill-cat-databases",
      category: "Databases",
      description: "Document and relational data modeling.",
      displayOrder: 4,
      items: [
        { name: "MongoDB", logoKey: "mongodb", note: "Document schemas, Mongoose modeling, indexing, and CRUD aggregation" },
        { name: "MySQL", logoKey: "mysql", note: "Relational schema design, normalization, joins, and SQL queries" }
      ]
    },
    {
      id: "skill-cat-tools",
      category: "Tools & Workflow",
      description: "Version control, collaborative repositories, and API debugging.",
      displayOrder: 5,
      items: [
        { name: "Git", logoKey: "git", note: "Branching workflows, commit hygiene, and merge conflict resolution" },
        { name: "GitHub", logoKey: "github", note: "Repository hosting, documentation, and project version tracking" },
        { name: "Postman", logoKey: "postman", note: "REST endpoint verification, payload testing, and auth cookie debugging" }
      ]
    },
    {
      id: "skill-cat-dsa",
      category: "Problem Solving",
      description: "Algorithmic thinking and core computer science foundations.",
      displayOrder: 6,
      items: [
        { name: "Data Structures & Algorithms", logoKey: "dsa", note: "Arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, and dynamic programming" }
      ]
    }
  ],
  certificates: [],
  resumes: [],
  media: [],
  messages: [],
  settings: {
    siteTitle: "Ayush Prajapati — Developer Portfolio",
    seoDescription: "Portfolio of Ayush Prajapati, third-year B.Tech Computer Science Engineering student at SISTec, Bhopal, building MERN-stack web experiences and exploring AI/ML.",
    particlesEnabled: true,
    contactNote: "Messages submitted through the contact form are validated on the server and persisted directly to the portfolio database for review in the Admin CMS. No third-party SMTP relay is fabricated; a direct mailto fallback is also available.",
    updatedAt: "2026-10-17T16:00:00.000Z"
  },
  users: []
};

module.exports = { INITIAL_SEED_DATA };

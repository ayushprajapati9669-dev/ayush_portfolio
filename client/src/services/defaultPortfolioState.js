export const STORAGE_KEY = 'ayush_modern_portfolio_state_v4';
export const SESSION_KEY = 'ayush_modern_portfolio_admin_session_v4';

export function getDefaultPortfolioState() {
  return {
    uiLabels: {
      navHome: 'Home',
      navAbout: 'About',
      navSkills: 'Skills',
      navProjects: 'Projects',
      navCertificates: 'Certificates',
      navContact: 'Contact',
      navResume: 'Resume',
      navCta: 'Hire / Connect',
      navAdmin: 'Admin CMS',
      workbenchRunLabel: '▶ Run Snippet',
      workbenchCopyLabel: 'Copy Code',
      bentoLocationHeading: 'EDUCATION & CGPA',
      bentoFocusHeading: 'ACHIEVEMENTS & FOCUS',
      bentoNextBtn: 'Next Highlight →',
      particleToggleOff: 'Particle FX',
      particleToggleOn: 'Photo View',
      homeIntroEyebrow: '01 · ABOUT & EDUCATION',
      homeIntroHeading: 'Full-Stack MERN Developer & B.Tech CSE Undergraduate at SISTec, Bhopal.',
      homeProjectsEyebrow: '02 · LIVE DEPLOYED PROJECTS',
      homeProjectsHeading: 'Featured Full-Stack Applications',
      homeProjectsCta: 'View All Projects',
      homeSkillsEyebrow: '03 — TECHNICAL CAPABILITIES',
      homeSkillsHeading: 'Interactive Skills & Tech Stack',
      homeSkillsCta: 'Open Full Skills View',
      homeCertsEyebrow: '04 · VERIFIED CREDENTIALS',
      homeCertsHeading: 'Certifications & Achievements',
      homeCertsCta: 'View Certificates',
      homeJourneyEyebrow: '05 · EDUCATION & ACADEMIC PROJECTS',
      homeJourneyHeading: 'Academic Qualifications & Project Highlights',
      homeBannerEyebrow: 'OPEN FOR INTERNSHIPS & FULL-STACK ROLES',
      homeBannerHeading: 'Looking for a dedicated Full-Stack MERN Developer?',
      homeBannerSubtext: 'Reach out at ayushprajapati9669@gmail.com or (+91) 9669802554 to discuss collaborations, internships, or engineering roles.',
      confirmEyebrow: 'Confirm Action',
      confirmCancel: 'Cancel',
      confirmAction: 'Confirm'
    },
    profile: {
      name: 'Ayush Prajapati',
      displayName: 'AYUSH PRAJAPATI',
      monogram: 'AP',
      headerSubtitle: 'Full-Stack Developer · CSE | SISTec, Bhopal',
      email: 'ayushprajapati9669@gmail.com',
      phone: '(+91) 9669802554',
      eyebrow: 'FULL-STACK MERN DEVELOPER · B.TECH CSE (2028)',
      headline: 'Building modern, scalable full-stack web applications.',
      supportingHeadline: "Hi, I'm Ayush Prajapati — CS Undergrad & Full-Stack Developer.",
      heroDescription: 'Computer Science & Engineering undergraduate at SISTec, Bhopal (CGPA: 8.42) skilled in C, Java, JavaScript, Python, React.js, Node.js, Express.js, MySQL, and MongoDB. Winner of a college website-making competition.',
      availabilityLabel: 'CSE @ SISTec, Bhopal · CGPA: 8.42 (2028)',
      primaryCtaText: 'Explore Live Projects',
      secondaryCtaText: "Let's Connect",
      footerTagline: 'Ayush Prajapati · ayushprajapati9669@gmail.com · (+91) 9669802554 · SISTec, Bhopal',
      resumeUrl: '',
      resumePreviewUrl: '/images/ayush-resume-preview.jpg',
      resumeSummary: 'Computer Science & Engineering undergraduate at SISTec, Bhopal (CGPA: 8.42, 2028) with strong foundations in C, Java, JavaScript, and Python, and hands-on expertise in building full-stack web applications using HTML, CSS, Bootstrap, React.js, Node.js, Express.js, MySQL, MongoDB, and Cloudinary.',
      education: {
        degree: 'B.Tech in Computer Science & Engineering (CSE)',
        college: 'SISTec (Sagar Institute of Science and Technology), Bhopal',
        cgpa: 'CGPA: 8.42 | (2028)',
        schoolBoard: 'Class XII (MP Board)',
        schoolXII: 'Kasturba Vidhya Mandir, Jamani, Madhya Pradesh',
        schoolScore: '83.5% | 2022',
        location: 'Bhopal, Madhya Pradesh, India',
        stage: 'CGPA: 8.42 · Batch of 2024–2028'
      },
      achievements: [
        'Won a website-making competition at college.',
        'Completed Apna College Delta Full Stack Web Development Certification.'
      ],
      academicProjects: [
        {
          title: 'Stock Trading Platform',
          stack: 'React.js | Node.js | Express.js | MongoDB',
          points: [
            'Developed a full-stack stock trading platform with modules for holdings, orders, positions, and funds.',
            'Implemented Buy/Sell functionality with Market and Limit order handling and input validation.',
            'Built REST APIs using Node.js and Express.js and integrated MongoDB for data management.'
          ]
        },
        {
          title: 'ChatGPT Clone',
          stack: 'React.js | Node.js | Express.js | MongoDB | Gemini API',
          points: [
            'Developed a ChatGPT-like full-stack application using React.js, Node.js, and Express.js.',
            'Implemented chat threads and message management with persistent data storage using MongoDB.',
            'Integrated the Gemini API to generate AI-powered responses through a REST API.'
          ]
        }
      ],
      aboutBio: [
        'I am Ayush Prajapati, a Computer Science & Engineering (CSE) undergraduate at SISTec, Bhopal (2024–2028 batch) maintaining a CGPA of 8.42, after completing my Class XII (MP Board) from Kasturba Vidhya Mandir, Jamani, Madhya Pradesh with 83.5% in 2022.',
        'My core technical stack spans programming in C, Java, JavaScript, and Python alongside full-stack web engineering with HTML, CSS, Bootstrap, React.js, Node.js, Express.js, MySQL, MongoDB, Git, and GitHub.',
        'I have built and deployed real-world full-stack applications—including a live Airbnb Clone on Render, a Stock Trading Platform with Market/Limit order execution, and a ChatGPT Clone powered by the Gemini API—and won a website-making competition at my college.'
      ],
      focusAreas: [
        {
          title: 'College Website Competition Winner',
          detail: 'Won 1st place in a college website-making competition for modern responsive UI design and full-stack execution.'
        },
        {
          title: 'Full-Stack MERN & Cloud Storage',
          detail: 'Building end-to-end applications with React.js, Node.js, Express.js, MongoDB Atlas, and Cloudinary media pipelines.'
        },
        {
          title: 'Strong Academic Record (8.42 CGPA)',
          detail: 'Consistent academic excellence in B.Tech CSE at SISTec, Bhopal (8.42 CGPA) and 83.5% in MP Board Class XII.'
        },
        {
          title: 'Core Programming & AI APIs',
          detail: 'Problem solving in C, Java, JavaScript, and Python, plus integrating Gemini AI REST APIs into full-stack apps.'
        }
      ],
      learningJourney: [
        {
          phase: 'EDUCATION · 2024 – 2028',
          title: 'B.Tech CSE — SISTec, Bhopal (CGPA: 8.42)',
          description: 'Pursuing Bachelor of Technology in Computer Science & Engineering at SISTec, Bhopal with an 8.42 CGPA (Batch 2024 – 2028). Completed Class XII (MP Board) from Kasturba Vidhya Mandir, Jamani with 83.5% (2022).'
        },
        {
          phase: 'ACADEMIC PROJECTS · MERN & AI',
          title: 'Stock Trading Platform & Gemini AI ChatGPT Clone',
          description: 'Engineered a full-stack Stock Trading Platform (holdings, orders, positions, funds, Market/Limit Buy & Sell) and a ChatGPT Clone using React.js, Node.js, Express.js, MongoDB, and Gemini API.'
        },
        {
          phase: 'ACHIEVEMENTS & LIVE DEPLOYMENTS',
          title: 'Airbnb Clone Live Deployment & Competition Winner',
          description: 'Won a website-making competition at college, completed the Apna College Delta Full-Stack Web Development course, and deployed a live Airbnb Clone on Render.'
        }
      ],
      workbenchSnippets: [
        {
          id: 'profile',
          filename: 'ayushResume.js',
          code: `const ayush = {
  name: "Ayush Prajapati",
  email: "ayushprajapati9669@gmail.com",
  phone: "(+91) 9669802554",
  education: "CSE | SISTec, Bhopal (CGPA: 8.42)",
  skills: ["C", "Java", "JS", "Python", "MERN", "MySQL"]
};`,
          output: '✓ Verified Resume Profile: CGPA 8.42 | SISTec, Bhopal (2026)'
        },
        {
          id: 'db',
          filename: 'mongoCloudinary.js',
          code: `const project = await Project.create({
  title: "Airbnb Clone",
  liveDemoUrl: "https://airbnbclone2-8519.onrender.com",
  image: cloudinaryUpload.secure_url,
  db: "MongoDB Atlas"
});`,
          output: '✓ MongoDB Document Saved + Cloudinary Image Linked.'
        }
      ],
      socialLinks: {
        github: 'https://github.com/ayushprajapati9669-dev',
        linkedin: 'https://www.linkedin.com/in/ayush-prajapati-b9042424a/',
        instagram: 'https://www.instagram.com/ayush7162/'
      },
      portrait: {
        url: '/images/ayush-hero-portrait.jpg',
        alt: 'Ayush Prajapati',
        scale: 1.0,
        offsetX: 0,
        offsetY: 0,
        particleDensity: 4
      },
      updatedAt: '2026-10-18T10:00:00.000Z'
    },
    projects: [
  {
    "id": "proj-1792430568297",
    "approachArchitecture": "",
    "category": "Full-Stack Web App",
    "createdAt": "2026-10-31T08:13:37.186Z",
    "disclaimer": "",
    "displayOrder": 1,
    "featured": true,
    "galleryImages": [],
    "githubUrl": "https://github.com/ayushprajapati9669-dev",
    "implementedFeatures": [],
    "lessonsLearned": "",
    "liveDemoUrl": "https://airbnbclone2-8519.onrender.com",
    "problemContext": "",
    "shortDescription": "this is a airbnb clone",
    "slug": "airbnb-clone-1",
    "status": "published",
    "technologies": [
      "React JS",
      "Node.js",
      "Express.js",
      "MongoDB"
    ],
    "thumbnailType": "image",
    "thumbnailUrl": "/images/airbnb-clone-preview.jpg",
    "title": "Airbnb clone 1",
    "updatedAt": "2026-10-31T08:52:18.375Z"
  },
  {
    "id": "proj-1792430599188",
    "approachArchitecture": "",
    "category": "Full-Stack Web App",
    "createdAt": "2026-10-31T08:13:37.215Z",
    "disclaimer": "",
    "displayOrder": 2,
    "featured": true,
    "galleryImages": [],
    "githubUrl": "https://github.com/ayushprajapati9669-dev",
    "implementedFeatures": [],
    "lessonsLearned": "",
    "liveDemoUrl": "https://airbnbclone2-8519.onrender.com",
    "problemContext": "",
    "shortDescription": "this is a second testing project",
    "slug": "airbnb-clone-2",
    "status": "published",
    "technologies": [
      "React JS",
      "Node.js",
      "Express.js",
      "MongoDB"
    ],
    "thumbnailType": "image",
    "thumbnailUrl": "/images/airbnb-clone-preview.jpg",
    "title": "airbnb clone 2",
    "updatedAt": "2026-10-31T08:52:18.407Z"
  },
  {
    "id": "proj-1792496192331",
    "approachArchitecture": "",
    "category": "Full-Stack Web App",
    "createdAt": "2026-10-31T08:13:37.247Z",
    "disclaimer": "",
    "displayOrder": 3,
    "featured": true,
    "galleryImages": [],
    "githubUrl": "https://github.com/ayushprajapati9669-dev",
    "implementedFeatures": [],
    "lessonsLearned": "",
    "liveDemoUrl": "",
    "problemContext": "",
    "shortDescription": "ai chat boat — Modern full-stack architecture built with react.",
    "slug": "ai-chat-boat",
    "status": "published",
    "technologies": [
      "react"
    ],
    "thumbnailType": "image",
    "thumbnailUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    "title": "ai chat boat",
    "updatedAt": "2026-10-31T08:52:18.460Z"
  },
  {
    "id": "proj-1792669669594",
    "approachArchitecture": "",
    "category": "AI & Machine Learning",
    "createdAt": "2026-10-31T08:13:37.316Z",
    "disclaimer": "",
    "displayOrder": 5,
    "featured": true,
    "galleryImages": [],
    "githubUrl": "https://github.com/ayushprajapati9669-dev",
    "implementedFeatures": [],
    "lessonsLearned": "",
    "liveDemoUrl": "https://agentic-workspace.onrender.com",
    "problemContext": "",
    "shortDescription": "An advanced AI agentic workspace built with cutting-edge tools.",
    "slug": "ai-agentic-workspace",
    "status": "published",
    "technologies": [
      "React JS",
      "Node.js",
      "Express.js",
      "MongoDB"
    ],
    "thumbnailType": "image",
    "thumbnailUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    "title": "AI Agentic Workspace",
    "updatedAt": "2026-10-31T08:52:18.520Z"
  },
  {
    "id": "proj-1792781601076",
    "approachArchitecture": "",
    "category": "Full-Stack Web App",
    "createdAt": "2026-10-31T08:13:37.348Z",
    "disclaimer": "",
    "displayOrder": 4,
    "featured": true,
    "galleryImages": [],
    "githubUrl": "https://github.com/ayushprajapati9669-dev",
    "implementedFeatures": [],
    "lessonsLearned": "",
    "liveDemoUrl": "https://airbnbclone2-8519.onrender.com",
    "problemContext": "",
    "shortDescription": "hi this is a testing project",
    "slug": "airbnb-clone",
    "status": "published",
    "technologies": [
      "React JS",
      "Node.js",
      "Express.js",
      "MongoDB"
    ],
    "thumbnailType": "image",
    "thumbnailUrl": "/images/airbnb-clone-preview.jpg",
    "title": "airbnb clone",
    "updatedAt": "2026-10-31T08:52:18.494Z"
  }
],
    skills: [
      {
        id: 'skill-languages',
        category: 'Languages',
        tabIcon: 'languages',
        description: 'Programming languages used for DSA and full-stack engineering.',
        displayOrder: 1,
        items: [
          { name: 'C', logoKey: 'c' },
          { name: 'C++', logoKey: 'cpp' },
          { name: 'Java', logoKey: 'java' },
          { name: 'JavaScript', logoKey: 'javascript' },
          { name: 'Python', logoKey: 'python' }
        ]
      },
      {
        id: 'skill-frontend',
        category: 'Frontend',
        tabIcon: 'frontend',
        description: 'Frontend web technologies for responsive, modern user interfaces.',
        displayOrder: 2,
        items: [
          { name: 'React JS', logoKey: 'react' },
          { name: 'HTML', logoKey: 'html' },
          { name: 'CSS', logoKey: 'css' },
          { name: 'Tailwind CSS', logoKey: 'tailwind' },
          { name: 'Bootstrap', logoKey: 'bootstrap' },
          { name: 'JavaScript', logoKey: 'javascript' },
          { name: 'Vite JS', logoKey: 'vite' },
          { name: 'Next.js', logoKey: 'nextjs' }
        ]
      },
      {
        id: 'skill-backend',
        category: 'Backend',
        tabIcon: 'backend',
        description: 'Server runtimes and REST API architecture.',
        displayOrder: 3,
        items: [
          { name: 'Node.js', logoKey: 'nodejs' },
          { name: 'Express.js', logoKey: 'express' },
          { name: 'REST APIs', logoKey: 'postman' }
        ]
      },
      {
        id: 'skill-databases',
        category: 'Databases',
        tabIcon: 'databases',
        description: 'Relational and NoSQL document database management.',
        displayOrder: 4,
        items: [
          { name: 'MongoDB', logoKey: 'mongodb' },
          { name: 'MySQL', logoKey: 'mysql' }
        ]
      },
      {
        id: 'skill-tools',
        category: 'Tools & Workflow',
        tabIcon: 'tools',
        description: 'Version control, cloud media storage, and developer workflow tools.',
        displayOrder: 5,
        items: [
          { name: 'Git', logoKey: 'git' },
          { name: 'GitHub', logoKey: 'github' },
          { name: 'Postman', logoKey: 'postman' },
          { name: 'VS Code', logoKey: 'vscode' },
          { name: 'Cloudinary', logoKey: 'cloudinary' }
        ]
      },
      {
        id: 'skill-dsa',
        category: 'Problem Solving',
        tabIcon: 'dsa',
        description: 'Data structures, algorithms, and core computer science fundamentals.',
        displayOrder: 6,
        items: [
          { name: 'Data Structures & Algorithms', logoKey: 'dsa' }
        ]
      }
    ],
    certificates: [],
    resumes: [],
    messages: [],
    settings: {
      siteTitle: 'Ayush Prajapati — Full-Stack Developer Portfolio',
      seoDescription: 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, MySQL, and MongoDB.',
      particlesEnabled: true,
      mongodbUri: 'mongodb://127.0.0.1:27017/ayush_portfolio',
      cloudinaryCloudName: '',
      cloudinaryUploadPreset: ''
    },
    adminConfig: {
      username: 'ayushprajapati9669@gmail.com',
      passwordHash: 'sha256$6811db276104288014ad87e84e6320c6ecbc3fd6e315da2c44dbd1efbf573412',
      passwordFnvFallback: 'fnv$a15227e0',
      recoveryEmail: 'ayushprajapati9669@gmail.com',
      recoveryPhone: '9669802554',
      failedAttempts: 0,
      lockoutUntil: 0
    }
  };
}

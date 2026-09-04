export const PORTFOLIO = {
  name: 'Andile Khumalo',
  title: 'Software Developer',
  tagline: 'Full Stack Developer specializing in .NET and React',
  email: 'd.langelihlekhumalo@gmail.com',
  location: 'Cape Town, South Africa',
  social: {
    github: 'https://github.com/d-langelihlekhumalo',
    linkedin: 'https://linkedin.com/in/andile-khumalo-1087441b7',
  },
}

export const SKILLS = {
  languages: ['C#', 'TypeScript', 'JavaScript', 'Python', 'Java', 'SQL'],
  frontend: ['React', 'Vue', 'Angular', 'HTML5', 'CSS3 / SCSS', 'Tailwind CSS'],
  backend: ['ASP.NET Core', '.NET', 'Entity Framework Core', 'REST APIs'],
  database: ['SQL Server', 'PostgreSQL'],
  cloud: ['Microsoft Azure', 'Docker', 'CI/CD'],
  ai: ['Claude API', 'AI Agents', 'LLM Integration', 'Anthropic SDK', 'Prompt Engineering'],
  tools: ['Git', 'GitHub', 'Azure DevOps', 'Postman', 'Visual Studio', 'JIRA'],
}

export const EXPERIENCE = [
  {
    id: 'advania',
    company: 'Advania SA',
    position: 'Software Developer',
    duration: 'June 2024 – Present',
    highlights: [
      'Lead end-to-end delivery of high-complexity features across the full stack',
      'Mentor new team members and provide technical coaching',
      'Built reusable pagination and infinite-scrolling patterns adopted across the product',
      'Own the User Management area and its Auth0 identity implementation',
    ],
  },
  {
    id: 'clickatell',
    company: 'Clickatell',
    position: 'Junior Developer / Software Graduate Developer',
    duration: 'Feb 2023 – May 2024',
    highlights: [
      'Contributed to API integrations and user-journey design',
      'Managed complex third-party API integrations and data mapping',
      'Helped reduce R&D costs through resource optimization',
      'Maintained change tracking and documentation in JIRA',
    ],
  },
  {
    id: 'bulltech',
    company: 'Bull Tech Services',
    position: 'Intern Developer',
    duration: 'Jun 2022 – Jan 2023',
    highlights: [
      'Worked across full project lifecycles, from requirements to delivery',
      'Provided technical support and maintained web content',
      'Built foundational skills in problem-solving and team collaboration',
    ],
  },
]

export const EDUCATION = [
  {
    id: 'mut',
    year: '2022',
    institution: 'Mangosuthu University of Technology',
    qualification: 'National Diploma, Information Technology',
    description:
      'Foundation in software development, database design, and IT systems, with practical coursework in web and desktop application development.',
  },
  {
    id: 'brettonwood',
    year: '2017',
    institution: 'Brettonwood High School',
    qualification: 'National Senior Certificate',
    description:
      'Academic focus on mathematics, science, and information technology.',
  },
]

export const PROJECTS = [
  {
    id: 'budget-buddy',
    name: 'Budget Buddy',
    description: 'A modern, intuitive personal finance management application built with React and TypeScript.',
    overview:
      'Budget Buddy helps you take control of your finances by tracking income, managing budgets, monitoring expenses, and achieving your financial goals.',
    problem:
      'Many people struggle to manage their finances effectively and lack visibility into their spending patterns.',
    solution:
      'Built a finance management platform with real-time dashboards, budget tracking, transaction categorization, and actionable financial insights.',
    technologies: [
      'React 18',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'shadcn/ui',
      'Recharts',
      'React Query',
      'Framer Motion',
    ],
    features: [
      'Dashboard overview with key financial metrics',
      'Budget management with visual progress indicators',
      'Transaction tracking and categorization',
      'Financial goal monitoring',
      'Insights and analytics with data visualization',
      'Authentication and responsive design',
    ],
    challenges: [
      'Implementing financial calculations and aggregations',
      'Designing an intuitive UI for data-heavy features',
      'Keeping data consistent across components',
    ],
    keyAchievements: [
      'Shipped a feature-complete MVP covering budgeting, transactions, and goals',
      'Built a reusable charting layer for insights and analytics',
      'Kept state consistent across multiple views with React Query',
    ],
    github: 'https://github.com/d-langelihlekhumalo/budget-buddy',
    demo: '#', // Placeholder - update when deployed
    image: '#', // Placeholder - add screenshot when available
    status: 'Completed',
  },
  {
    id: 'task-manager',
    name: 'Real-Time Task Manager',
    description: 'A web-based real-time task management application with team collaboration built in.',
    overview:
      "Collaborate with your team on tasks and notes in real time. Updates appear instantly across every connected user's screen with no need to refresh.",
    problem:
      'Teams lose time with task tools that require a manual refresh to see updates, leading to miscommunication and duplicated work.',
    solution:
      'Built a real-time task management platform using SignalR for instant two-way communication between the ASP.NET Core backend and every connected client.',
    technologies: [
      'React',
      'TypeScript',
      'Vite',
      'Material UI',
      'Axios',
      'SignalR',
      'ASP.NET Core',
    ],
    features: [
      'Create and manage tasks',
      'Attach notes to tasks',
      'Real-time sync across all connected users',
      'Progress tracking with dashboard statistics',
      'Responsive design for desktop, tablet, and mobile',
      'Live connection-status indicator with graceful offline handling',
    ],
    challenges: [
      'Managing WebSocket connection state and reconnection logic',
      'Syncing data across multiple clients without conflicts',
      'Handling offline scenarios gracefully',
      'Keeping re-renders efficient under a stream of real-time updates',
    ],
    keyAchievements: [
      'Implemented a production-style SignalR integration end to end',
      'Handled reconnection and network-disconnection edge cases',
      'Delivered a responsive UI that works across devices',
    ],
    github: 'https://github.com/d-langelihlekhumalo/real-time-task-manager',
    demo: '#', // Placeholder - update when deployed
    image: '#', // Placeholder - add screenshot when available
    status: 'Completed',
  },
]

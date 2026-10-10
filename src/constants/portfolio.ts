export const PORTFOLIO = {
  name: 'Andile Khumalo',
  title: 'Full Stack Software Developer',
  tagline: 'Full Stack Developer specializing in .NET and React',
  email: 'd.langelihlekhumalo@gmail.com',
  location: 'Cape Town, South Africa',
  social: {
    github: 'https://github.com/d-langelihlekhumalo',
    linkedin: 'https://linkedin.com/in/andile-khumalo-1087441b7',
    // TODO(andile): set once an Upwork profile exists.
    upwork: undefined as string | undefined,
  },
}

// 'open'      → neutral wording, no "freelance" claims (use until consent is granted)
// 'freelance' → explicit freelance/contract wording
export const AVAILABILITY_MODE: 'open' | 'freelance' = 'open' // TODO(andile): flip after written consent

export const AVAILABILITY_COPY = {
  open: {
    statusLine: 'Open to a small number of projects',
    titleSuffix: 'React and .NET developer',
    metaDescription:
      'Cape Town developer building fast, well-tested web apps and PWAs with React, TypeScript and .NET.',
    contactSubheading: 'Get in touch about a project',
    blogDescription: 'Notes on .NET, React, and building reliable software, from Cape Town.',
  },
  freelance: {
    statusLine: 'Available for freelance and contract work',
    titleSuffix: 'freelance React and .NET developer',
    metaDescription:
      'Freelance developer in Cape Town building fast, well-tested web apps and PWAs with React, TypeScript and .NET. Available for contract work.',
    contactSubheading: 'Get in touch for freelance opportunities or project inquiries',
    blogDescription:
      'Notes on .NET, React, and building reliable software, from a freelance full-stack developer in Cape Town.',
  },
} as const

export const AVAILABILITY = AVAILABILITY_COPY[AVAILABILITY_MODE]

// Used in the hero, the footer and the JSON-LD description — one statement,
// not re-written per section.
export const POSITIONING = {
  headline: 'I build fast, well-tested web apps that keep working offline.',
  subhead:
    "React and TypeScript on the front, .NET or serverless APIs behind them. For startups, small teams and founders who want software that's done properly.",
}

export const SKILLS = {
  frontend: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3 / SCSS', 'Tailwind CSS'],
  backend: ['C#', 'ASP.NET Core', '.NET', 'Entity Framework Core', 'REST APIs', 'Python'],
  data: ['SQL', 'SQL Server', 'PostgreSQL'],
  tooling: ['Git', 'GitHub', 'Docker', 'CI/CD', 'Azure DevOps', 'Microsoft Azure', 'Postman', 'Visual Studio', 'JIRA'],
  ai: ['Claude API', 'AI Agents', 'LLM Integration', 'Anthropic SDK', 'Prompt Engineering'],
}

export const EXPERIENCE = [
  {
    id: 'advania',
    company: 'Advania SA',
    position: 'Full Stack Software Developer',
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

export interface Project {
  id: string
  slug: string
  name: string
  description: string
  overview: string
  problem: string
  solution: string
  technologies: string[]
  features: string[]
  challenges: string[]
  keyAchievements: string[]
  /** One or more GitHub repos — most projects have one; a split frontend/backend has two. */
  repos: { label: string; url: string }[]
  /** Live app URL, or null until it's deployed. */
  liveUrl: string | null
  /** True if a `content/projects/<slug>.md` case study exists. */
  hasCaseStudy: boolean
  status: string
  /** Real screenshot — never a mock-up, stock image, or generated image. */
  screenshot?: { src: string; alt: string; width: number; height: number }
}

export const PROJECTS: Project[] = [
  {
    id: 'cart-wise',
    slug: 'cart-wise',
    name: 'Cart Wise',
    description:
      "A grocery price tracker and shopping-list planner for South Africa. Build a list and eventually find out where it's cheapest — one store, or a two-store split. Early development: offline-first lists and a real price catalogue work today; the recommendation engine and pamphlet scanning are next.",
    overview:
      "Shopping lists that work offline and sync across devices, on top of a seeded South African grocery catalogue — chains, loyalty-card setup, and manual price logging. The AI pamphlet-scanning pipeline and the actual cheapest-store recommendation (the eventual point of the app) haven't shipped yet.",
    problem:
      'A two-store split can be meaningfully cheaper, but working it out by hand across loyalty-card prices, regional pamphlets and bulk-staple unit pricing is not worth the effort for a weekly shop — and a shopping list that needs signal in the aisle is one that gets abandoned.',
    solution:
      'Built the offline-first foundation first: accounts, a seeded SA product/store catalogue, loyalty-card and manual price logging, and shopping lists that sync across devices through a tested conflict-merge sync engine — verified to produce the same result whether the merge runs in JS or in SQL.',
    technologies: [
      'React',
      'TypeScript',
      'Vite',
      'Hono',
      'Cloudflare Workers',
      'D1 + Drizzle',
      'R2',
      'Queues',
      'Durable Objects',
    ],
    features: [
      'Offline-first shopping lists that sync across devices',
      'Seeded SA grocery catalogue, searchable via SQLite FTS5',
      'Store, loyalty-card and manual price setup, scoped by region',
      'Installable PWA — checklist keeps working with no signal',
    ],
    challenges: [
      'A sync protocol proven to merge identically in JS and in SQL, checked with randomised property-based tests',
      'Modelling SA grocery pricing: loyalty-card member prices, regional pamphlets, multipacks, bulk-staple unit pricing',
      'Keeping the initial JS budget enforced in CI while layering in TanStack Query, Dexie and offline sync',
    ],
    keyAchievements: [
      'Full offline list sync with a tested merge engine (JS and SQL merges verified to match)',
      'Seeded SA grocery catalogue: 17 chains, 15 categories, 84 products, searchable via FTS5',
      'M1–M3 shipped and CI-green; pamphlet scanning and the recommendation engine are next',
    ],
    repos: [{ label: 'GitHub', url: 'https://github.com/d-langelihlekhumalo/cart-wise' }],
    // TODO(andile): set once Cart Wise has a live deployment.
    liveUrl: null,
    hasCaseStudy: true,
    status: 'In development',
    screenshot: {
      src: '/projects/cart-wise-list.webp',
      alt: 'Cart Wise shopping list, grouped by category, with items ticked off as they go in the trolley',
      width: 1280,
      height: 720,
    },
  },
  {
    id: 'baby-steps-tracker',
    slug: 'baby-steps-tracker',
    name: 'Baby Steps Tracker',
    description:
      "A client-side personal-finance planner built around Dave Ramsey's 7 Baby Steps — works out which step you're on, projects your debt-free date, and checks whether your goals fit your budget.",
    overview:
      'Enter income, bills, debts, and goals; the app runs the whole projection in the browser — no accounts, no backend, nothing leaves the device.',
    problem:
      'A finance tool on a public URL that stores real income and debt figures server-side is a privacy problem — a stranger typing a guessed name away from someone else’s data.',
    solution:
      'Built it fully client-side: a pure domain engine (integer-cent money, banker’s rounding), localStorage autosave, and an encrypted JSON export (WebCrypto). The Cloudflare Worker only serves the static build.',
    technologies: [
      'React 19',
      'TypeScript',
      'Vite 7',
      'Tailwind CSS 4',
      'Radix UI',
      'Zustand',
      'Zod',
      'Cloudflare Workers',
    ],
    features: [
      'Baby-step detection from your actual numbers',
      'Debt-payoff projection (snowball or avalanche)',
      'Budget waterfall and goal-feasibility checks',
      'Scenario modelling (raise, extra payment, rate change, windfall)',
      'Payslip PDF and bank CSV import',
      'Installable PWA with offline support',
    ],
    challenges: [
      'Keeping the domain engine pure — no React, store, storage, or Date.now()',
      'Lint-enforced layering so dependencies only ever point downward',
      'Modelling the emergency-fund refill as a paused debt-attack phase',
      'Hand-rolling four SVG chart types instead of pulling in a charting library',
    ],
    keyAchievements: [
      '400+ tests, ~99% engine coverage, a11y sweep on every route',
      'CI gate: self-host, PWA, bundle-budget and contrast checks before every deploy',
      'Initial route ~120 kB gzipped against a 250 kB budget',
    ],
    repos: [{ label: 'GitHub', url: 'https://github.com/d-langelihlekhumalo/baby-steps-tracker' }],
    liveUrl: 'https://baby-steps-tracker.d-langelihlekhumalo.workers.dev',
    hasCaseStudy: true,
    status: 'Live',
    screenshot: {
      src: '/projects/baby-steps-tracker-dashboard.webp',
      alt: 'Baby Steps Tracker dashboard showing the current baby step, key numbers, and a projected debt-free date',
      width: 1280,
      height: 720,
    },
  },
  {
    id: 'task-manager',
    slug: 'real-time-task-manager',
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
    repos: [
      { label: 'Frontend', url: 'https://github.com/d-langelihlekhumalo/real-time-task-manager-frontend' },
      { label: 'Backend', url: 'https://github.com/d-langelihlekhumalo/real-time-task-manager-backend' },
    ],
    liveUrl: null,
    hasCaseStudy: false,
    status: 'Completed',
    // TODO(andile): needs the ASP.NET Core backend running locally to screenshot.
  },
]

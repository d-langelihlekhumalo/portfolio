import { useState, useEffect } from 'react'
import { Hero, Navigation, Footer, ScrollToTop } from './components'
import { About } from './sections/About'
import { Services } from './sections/Services'
import { TechStack } from './sections/TechStack'
import { Experience } from './sections/Experience'
import { Education } from './sections/Education'
import { Projects } from './sections/Projects'
// import { Testimonials } from './sections/Testimonials' // hidden until real testimonials exist
import { Contact } from './sections/Contact'
import { PORTFOLIO } from './constants/portfolio'

const THEME_STORAGE_KEY = 'portfolio-theme'

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light') return false
    if (stored === 'dark') return true
  } catch {
    /* localStorage unavailable — fall through to system preference */
  }
  return !window.matchMedia('(prefers-color-scheme: light)').matches
}

const scrollToId = (id: string) => () => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function App() {
  const [isDark, setIsDark] = useState(getInitialTheme)

  // Reflect theme on <html> and persist the choice
  useEffect(() => {
    const htmlElement = document.documentElement
    htmlElement.classList.toggle('dark', isDark)
    htmlElement.classList.toggle('light', !isDark)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light')
    } catch {
      /* ignore persistence failures (private mode, blocked storage) */
    }
  }, [isDark])

  return (
    <div>
      {/* <title>, meta description, canonical, OG/Twitter tags and structured data
          live in index.html — this is a single static page, so they don't need to
          be managed at runtime. Keep them in sync there when copy changes. */}
      <div className="min-h-screen bg-background">
        <Navigation isDark={isDark} onToggleDarkMode={setIsDark} />

        <main className="pt-16">
          {/* Hero Section */}
          <Hero
            name={PORTFOLIO.name}
            title={PORTFOLIO.title}
            statusBadge="Available for freelance & contract work"
            description="Freelance full-stack developer based in Cape Town, building reliable software with .NET and React — full stack delivery, API design, and cloud architecture."
            showVisual={true}
            animate={true}
            ctaPrimary={{ label: 'View My Work', onClick: scrollToId('projects') }}
            ctaSecondary={{ label: 'Get in Touch', onClick: scrollToId('contact') }}
          />

          {/* About Section */}
          <About
            id="about"
            animate={true}
            ctaLabel="Get in Touch"
            ctaOnClick={scrollToId('contact')}
          />

          {/* Services Section */}
          <Services id="services" animate={true} />

          {/* Tech Stack Section */}
          <TechStack id="tech-stack" animate={true} />

          {/* Experience Section */}
          <Experience id="experience" animate={true} />

          {/* Education Section */}
          <Education id="education" animate={true} />

          {/* Projects Section */}
          <Projects id="projects" animate={true} />

          {/* Testimonials — hidden until there are real client testimonials to show.
              Re-add <Testimonials id="testimonials" animate={true} /> and its import when ready. */}

          {/* Contact Section */}
          <Contact
            id="contact"
            animate={true}
            email={PORTFOLIO.email}
            github={PORTFOLIO.social.github}
            linkedin={PORTFOLIO.social.linkedin}
          />
        </main>

        {/* Footer */}
        <Footer
          name={PORTFOLIO.name}
          title={PORTFOLIO.title}
          tagline={PORTFOLIO.tagline}
          email={PORTFOLIO.email}
          github={PORTFOLIO.social.github}
          linkedin={PORTFOLIO.social.linkedin}
        />

        {/* Back-to-top control */}
        <ScrollToTop />
      </div>
    </div>
  )
}

export default App

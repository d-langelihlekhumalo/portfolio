import { Hero } from '@/components'
import { usePageMeta } from '@/hooks/usePageMeta'
import { About } from '@/sections/About'
import { Services } from '@/sections/Services'
import { TechStack } from '@/sections/TechStack'
import { Experience } from '@/sections/Experience'
import { Education } from '@/sections/Education'
import { Projects } from '@/sections/Projects'
// import { Testimonials } from '@/sections/Testimonials' // hidden until real testimonials exist
import { Contact } from '@/sections/Contact'
import { AVAILABILITY, PORTFOLIO, POSITIONING } from '@/constants/portfolio'

const scrollToId = (id: string) => () => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function HomePage() {
  // Same source as index.html's build-time defaults (vite.config.ts) — one
  // set of availability-mode strings, not two hand-maintained copies.
  usePageMeta({
    title: `${PORTFOLIO.name}, ${AVAILABILITY.titleSuffix}`,
    description: AVAILABILITY.metaDescription,
    path: '/',
  })

  return (
    <>
      {/* Hero Section */}
      <Hero
        name={PORTFOLIO.name}
        title={PORTFOLIO.title}
        statusBadge={AVAILABILITY.statusLine}
        description={POSITIONING.subhead}
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
    </>
  )
}

export default HomePage

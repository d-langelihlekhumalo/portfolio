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
import { PORTFOLIO } from '@/constants/portfolio'

const scrollToId = (id: string) => () => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function HomePage() {
  // Matches index.html's static defaults — keep these in sync there too.
  usePageMeta({
    title: 'Andile Khumalo — Freelance .NET & React Developer',
    description:
      'Freelance full-stack developer in Cape Town specializing in .NET and React. Available for contract work — reliable software, delivered end to end.',
    path: '/',
  })

  return (
    <>
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
    </>
  )
}

export default HomePage

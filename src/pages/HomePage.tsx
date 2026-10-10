import { Hero } from '@/components'
import { usePageMeta } from '@/hooks/usePageMeta'
import { AboutExperience } from '@/sections/AboutExperience'
import { Services } from '@/sections/Services'
import { HowIWork } from '@/sections/HowIWork'
import { TechStack } from '@/sections/TechStack'
import { Projects } from '@/sections/Projects'
import { Writing } from '@/sections/Writing'
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
      <Hero
        headline={POSITIONING.headline}
        description={POSITIONING.subhead}
        statusBadge={AVAILABILITY.statusLine}
        ctaPrimary={{ label: 'See the work', onClick: scrollToId('work') }}
        ctaSecondary={{ label: 'Email me', onClick: scrollToId('contact') }}
      />

      <Projects id="work" />

      <Services id="services" />

      <HowIWork id="how-i-work" />

      <AboutExperience id="about" />

      <TechStack id="tech-stack" />

      <Writing id="writing" />

      {/* Testimonials — hidden until there are real client testimonials to show.
          Re-add <Testimonials id="testimonials" /> and its import when ready. */}

      <Contact id="contact" email={PORTFOLIO.email} github={PORTFOLIO.social.github} linkedin={PORTFOLIO.social.linkedin} />
    </>
  )
}

export default HomePage

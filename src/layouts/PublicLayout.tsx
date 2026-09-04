import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navigation, Footer, ScrollToTop } from '@/components'
import { PORTFOLIO } from '@/constants/portfolio'

interface PublicLayoutProps {
  isDark: boolean
  onToggleDarkMode: (isDark: boolean) => void
}

/**
 * Shared chrome (nav, footer, back-to-top) for every public-facing route —
 * the homepage and the blog. The admin area intentionally does not use this
 * layout; it has its own minimal shell.
 */
function PublicLayout({ isDark, onToggleDarkMode }: PublicLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Cross-page anchor nav: a nav click on e.g. /blog for "About" navigates
  // here with { scrollTo: 'about' } in location state (see useNavLinkClick).
  // Once the homepage has mounted, scroll to it and clear the state so it
  // doesn't re-fire on the next unrelated navigation.
  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (!scrollTo) return

    const timeout = setTimeout(() => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
    navigate(location.pathname, { replace: true, state: {} })

    return () => clearTimeout(timeout)
  }, [location.state, location.pathname, navigate])

  return (
    <div className="min-h-screen bg-background">
      <Navigation isDark={isDark} onToggleDarkMode={onToggleDarkMode} />

      <main className="pt-16">
        <Outlet />
      </main>

      <Footer
        name={PORTFOLIO.name}
        title={PORTFOLIO.title}
        tagline={PORTFOLIO.tagline}
        email={PORTFOLIO.email}
        github={PORTFOLIO.social.github}
        linkedin={PORTFOLIO.social.linkedin}
      />

      <ScrollToTop />
    </div>
  )
}

export default PublicLayout

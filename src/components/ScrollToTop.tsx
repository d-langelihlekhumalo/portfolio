import { useCallback, useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ScrollToTopProps {
  /** Distance in pixels the user must scroll before the button appears. */
  threshold?: number
}

/**
 * ScrollToTop Component
 *
 * A fixed, bottom-right button that fades in once the user has scrolled past
 * `threshold` pixels and smoothly returns them to the top of the page.
 *
 * - Hidden from layout and assistive tech while off-screen
 * - Honors `prefers-reduced-motion` (jumps instead of smooth-scrolling)
 * - Matches the site's surface / border / primary token styling
 */
export const ScrollToTop = ({ threshold = 600 }: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  const scrollToTop = useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [])

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      tabIndex={isVisible ? 0 : -1}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'flex items-center justify-center',
        'w-11 h-11 rounded-full',
        'bg-surface border border-border',
        'text-text-secondary hover:text-primary',
        'shadow-lg hover:border-primary/40',
        'transition-all duration-300 ease-out',
        'focus:outline-2 focus:outline-offset-2 focus:outline-primary',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3 pointer-events-none',
      )}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}

ScrollToTop.displayName = 'ScrollToTop'

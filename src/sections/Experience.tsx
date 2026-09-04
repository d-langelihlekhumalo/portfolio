import { forwardRef, useEffect, useRef, useState } from 'react'
import { Badge, Card, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'
import { EXPERIENCE } from '@/constants/portfolio'

type ExperienceItem = (typeof EXPERIENCE)[number]

interface ExperienceProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ariaLabel?: string
}

/**
 * Experience Timeline Component
 *
 * Displays professional work experience in a timeline format with responsive
 * layout (vertical on mobile, horizontal on desktop). Features staggered fade-in
 * animations, accessibility-first design, and keyboard navigation support.
 *
 * @example
 * <Experience
 *   id="experience"
 *   animate={true}
 * />
 */
export const Experience = forwardRef<HTMLElement, ExperienceProps>(
  (
    {
      id = 'experience',
      animate = true,
      ariaLabel = 'Professional work experience',
      className,
      ...props
    },
    ref,
  ) => {
    const sectionRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set())

    // Handle animation on scroll using Intersection Observer
    useEffect(() => {
      if (!animate) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        },
        { threshold: 0.1 },
      )

      const currentRef = sectionRef.current || (ref as any)?.current
      if (currentRef) {
        observer.observe(currentRef)
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef)
        }
      }
    }, [animate, ref])

    const experienceData: ExperienceItem[] = EXPERIENCE

    // Staggered animation for individual cards
    useEffect(() => {
      if (!animate || !isVisible) return

      const timings = [0, 150, 300, 450]
      const timeouts = experienceData.map((_, index) =>
        setTimeout(() => {
          setVisibleCards((prev) => new Set([...prev, experienceData[index].id]))
        }, timings[index] || 0),
      )

      return () => timeouts.forEach(clearTimeout)
    }, [animate, isVisible])

    return (
      <SectionWrapper
        ref={ref || sectionRef}
        id={id}
        heading="Professional Experience"
        background="default"
        spacing="lg"
        animate={animate}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        {/* Timeline Container */}
        <div className="w-full">
          {/* Desktop Timeline Line (hidden on mobile) */}
          <div
            className={cn(
              'hidden md:block absolute left-1/2 transform -translate-x-1/2',
              'w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20',
              'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
              animate && !isVisible ? 'h-0' : 'h-full',
            )}
            style={{
              top: 0,
              bottom: 0,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />

          {/* Experience Items Grid */}
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4',
              'relative',
            )}
            role="list"
          >
            {experienceData.map((experience) => (
              <div
                key={experience.id}
                className={cn(
                  'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
                  animate && visibleCards.has(experience.id)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8',
                )}
                role="listitem"
              >
                {/* Timeline Dot (Desktop only) */}
                <div
                  className={cn(
                    'hidden md:flex absolute left-1/2 transform -translate-x-1/2 -top-16',
                    'w-4 h-4 rounded-full bg-primary border-4 border-background',
                    'z-10',
                    'transition-all duration-300 ease-out',
                    'hover:scale-125 hover:shadow-[0_0_12px_rgba(56,189,248,0.6)]',
                  )}
                  aria-hidden="true"
                />

                {/* Card Container */}
                <Card
                  padding="lg"
                  hoverable
                  className={cn(
                    'h-full group',
                    'hover:shadow-[0_8px_24px_rgba(56,189,248,0.12)]',
                  )}
                  role="article"
                  ariaLabel={`${experience.position} at ${experience.company}`}
                >
                  {/* Card Header: Company & Position */}
                  <div className="space-y-3 mb-4">
                    {/* Duration Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {experience.duration}
                      </Badge>
                    </div>

                    {/* Company Name */}
                    <h3 className={cn(
                      'text-lg md:text-xl font-bold text-text',
                      'group-hover:text-primary transition-colors duration-300',
                    )}>
                      {experience.company}
                    </h3>

                    {/* Position Title */}
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 bg-primary/40 rounded-full" />
                      <p className="text-sm md:text-base font-semibold text-text-secondary">
                        {experience.position}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border my-4" />

                  {/* Card Content: Highlights */}
                  <div className="space-y-3">
                    <ul className="space-y-2" role="list">
                      {experience.highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className={cn(
                            'flex gap-3 text-text-secondary text-sm md:text-base',
                            'leading-relaxed',
                            'transition-colors duration-300',
                            'group-hover:text-text',
                          )}
                          role="listitem"
                        >
                          {/* Highlight Bullet */}
                          <span
                            className={cn(
                              'mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full',
                              'bg-primary/60',
                              'group-hover:bg-primary transition-colors duration-300',
                            )}
                            aria-hidden="true"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Footer: Duration Indicator (Mobile) */}
                  <div
                    className={cn(
                      'md:hidden mt-6 pt-4 border-t border-border',
                      'text-xs font-semibold text-text-secondary uppercase tracking-wider',
                    )}
                  >
                    {experience.duration}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Information (Accessibility) */}
        <div className="sr-only">
          <p>
            Timeline showing {experienceData.length} professional experience
            entries
          </p>
        </div>
      </SectionWrapper>
    )
  },
)

Experience.displayName = 'Experience'

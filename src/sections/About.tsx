import { forwardRef, useEffect, useRef, useState } from 'react'
import { Button, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'

interface AboutProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ctaLabel?: string
  ctaOnClick?: () => void
  ariaLabel?: string
}

/**
 * About Section Component
 *
 * Professional narrative about the developer with focus on engineering mindset,
 * reliability, and quality-first approach. Features responsive two-column layout
 * on desktop with fade-in animation on scroll and full accessibility support.
 *
 * @example
 * <About
 *   id="about"
 *   animate={true}
 *   ctaLabel="Get in Touch"
 *   ctaOnClick={() => scrollToContact()}
 * />
 */
export const About = forwardRef<HTMLElement, AboutProps>(
  (
    {
      id = 'about',
      animate = true,
      ctaLabel = 'Get in Touch',
      ctaOnClick,
      ariaLabel = 'About the developer',
      className,
      ...props
    },
    ref,
  ) => {
    const sectionRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)

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

    return (
      <SectionWrapper
        ref={ref || sectionRef}
        id={id}
        background="surface"
        spacing="lg"
        animate={animate}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        {/* Two-column layout on desktop, single column mobile */}
        <div className={cn(
          'grid gap-8 md:gap-12 md:grid-cols-2 md:items-center',
          'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
          animate && !isVisible ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0',
        )}>
          {/* Left column: Main narrative */}
          <div className="flex flex-col gap-6">
            {/* Section heading */}
            <div className="space-y-3">
              <h2 className={cn(
                'text-2xl md:text-4xl font-bold text-text leading-tight',
                'tracking-tight',
              )}>
                Building Reliable Software with Purpose
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/40 rounded-full" />
            </div>

            {/* Main narrative paragraph */}
            <p className={cn(
              'text-base md:text-lg text-text-secondary leading-relaxed',
              'font-normal',
            )}>
              I'm a full-stack software engineer passionate about crafting reliable, maintainable solutions that solve real problems. With expertise in .NET and React, I focus on quality-first development practices where every line of code is intentional and tested. I believe that technical excellence stems from understanding both the business context and user needs—writing code that not only works today but scales gracefully tomorrow.
            </p>

            {/* Values section */}
            <div className="space-y-4 pt-2">
              <h3 className={cn(
                'text-sm md:text-base font-semibold text-text uppercase tracking-wider',
                'opacity-80',
              )}>
                Core Values
              </h3>

              {/* Values list with semantic structure */}
              <ul className="space-y-3">
                {[
                  {
                    title: 'Quality First',
                    description: 'Clean, well-tested code that prioritizes readability and maintainability over quick fixes',
                  },
                  {
                    title: 'Reliability',
                    description: 'Building systems that perform consistently under pressure and scale with confidence',
                  },
                  {
                    title: 'Technical Leadership',
                    description: 'Mentoring others and elevating team standards through best practices and knowledge sharing',
                  },
                ].map((value, index) => (
                  <li
                    key={index}
                    className={cn(
                      'flex gap-3 text-text-secondary',
                      'group cursor-default',
                    )}
                  >
                    {/* Value indicator */}
                    <span
                      className={cn(
                        'mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-primary',
                        'group-hover:shadow-[0_0_8px_rgba(56,189,248,0.4)] transition-shadow duration-300',
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-text font-semibold text-sm md:text-base">{value.title}</span>
                      <span className="text-xs md:text-sm leading-relaxed">{value.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            {ctaOnClick && (
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={ctaOnClick}
                  aria-label={ctaLabel}
                  className="w-full md:w-auto"
                >
                  {ctaLabel}
                </Button>
              </div>
            )}
          </div>

          {/* Right column: Highlight stats (desktop only) */}
          <div className="hidden md:grid grid-cols-2 gap-6">
            {[
              {
                number: '4+',
                label: 'Years of professional experience',
              },
              {
                number: '3',
                label: 'Companies delivered production work for',
              },
              {
                number: '2',
                label: 'Core stacks — .NET and React',
              },
              {
                number: '10+',
                label: 'Technologies worked with across the stack',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'p-6 rounded-lg bg-background/50',
                  'border border-border hover:border-primary/40',
                  'transition-all duration-300 ease-out',
                  'flex flex-col gap-2 items-center text-center',
                  'group',
                )}
              >
                <div className={cn(
                  'text-3xl md:text-4xl font-bold text-primary',
                  'group-hover:scale-110 transition-transform duration-300',
                )}>
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm text-text-secondary font-medium leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    )
  },
)

About.displayName = 'About'

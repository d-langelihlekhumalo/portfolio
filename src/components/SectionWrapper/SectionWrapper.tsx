import { forwardRef, useEffect, useRef, useState } from 'react'
import { SectionWrapperProps } from './SectionWrapper.types'
import { cn } from '@/utils/cn'

/**
 * SectionWrapper component - provides consistent spacing, responsive layout,
 * and optional background styling for major page sections
 */
export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  (
    {
      children,
      id,
      background = 'default',
      spacing = 'md',
      heading,
      subheading,
      variant = 'contained',
      animate = false,
      role,
      ariaLabel,
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

    // Background styling
    const backgroundClasses = {
      default: 'bg-background',
      surface: 'bg-surface',
      gradient: 'bg-gradient-to-b from-background via-surface to-background',
      none: 'bg-transparent',
    }

    // Spacing (vertical padding) - mobile and tablet+ sizes
    const spacingClasses = {
      sm: 'py-6 md:py-8',
      md: 'py-8 md:py-12',
      lg: 'py-12 md:py-16',
      xl: 'py-16 md:py-24',
    }

    // Container styling - responsive width and padding
    const containerClasses = {
      contained: 'max-w-screen-2xl mx-auto px-4 md:px-10',
      full: 'w-full',
    }

    // Animation classes
    const animationClasses = animate
      ? cn(
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
          'transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)]',
        )
      : ''

    const sectionElement = ref || sectionRef

    return (
      <section
        ref={sectionElement}
        id={id}
        className={cn(
          backgroundClasses[background],
          spacingClasses[spacing],
          animationClasses,
          className,
        )}
        role={role}
        aria-label={ariaLabel}
        {...props}
      >
        <div className={containerClasses[variant]}>
          {heading && (
            <div className="mb-8">
              <h2 className="text-4xl md:text-6xl font-bold text-text leading-tight">
                {heading}
              </h2>
              {subheading && (
                <p className="text-base md:text-lg text-text-secondary font-normal mt-3">
                  {subheading}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </section>
    )
  },
)

SectionWrapper.displayName = 'SectionWrapper'

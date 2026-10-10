import { forwardRef } from 'react'
import { SectionWrapperProps } from './SectionWrapper.types'
import { cn } from '@/utils/cn'

/**
 * SectionWrapper component - provides consistent spacing, responsive layout,
 * and optional background styling for major page sections. No scroll-reveal
 * motion — content is simply there (see the brief's Motion section).
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
      role,
      ariaLabel,
      className,
      ...props
    },
    ref,
  ) => {
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

    // Container styling - one container site-wide (matches Navigation.tsx):
    // 1120px max width, 24px side padding, 16px under 640px.
    const containerClasses = {
      contained: 'max-w-[1120px] mx-auto px-4 sm:px-6',
      full: 'w-full',
    }

    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          backgroundClasses[background],
          spacingClasses[spacing],
          // Bug fix: heading hid under the sticky nav when jumping via a nav
          // link — scroll-margin-top matches the nav's tallest (desktop) height.
          'scroll-mt-16',
          className,
        )}
        role={role}
        aria-label={ariaLabel}
        {...props}
      >
        <div className={containerClasses[variant]}>
          {heading && (
            <div className="mb-8">
              {/* All section headings are the same size — see the brief's Typography section. */}
              <h2 className="text-3xl md:text-4xl font-bold text-text leading-tight tracking-tight">
                {heading}
              </h2>
              {subheading && (
                <p className="text-base md:text-lg text-text-secondary font-normal mt-3 max-w-[68ch]">
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

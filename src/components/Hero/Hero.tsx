import { forwardRef } from 'react'
import { HeroProps } from './Hero.types'
import { Badge, Button, SectionWrapper } from '@/components'
import { HeroVisual } from './HeroVisual'
import { cn } from '@/utils/cn'

/**
 * Hero component - Premium hero section for portfolio
 * Responsive layout with animations and CTAs
 *
 * @example
 * <Hero
 *   name="Andile Khumalo"
 *   title="Software Developer"
 *   description="I build reliable, scalable software solutions..."
 *   statusBadge="Available for freelance work"
 *   ctaPrimary={{ label: 'View My Work', onClick: handleViewProjects }}
 *   ctaSecondary={{ label: 'Get in Touch', onClick: handleContact }}
 * />
 */

// Pure-CSS entrance animation — plays on paint, no JS/IntersectionObserver required.
// This keeps hero content visible (and its final layout correct) for crawlers and
// no-JS clients, which matter for both SEO and the static-prerendered build.
const animationStyle = `
  @keyframes heroFadeSlide {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .hero-animate-element {
    animation: heroFadeSlide 600ms cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-animate-element {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
`

export const Hero = forwardRef<HTMLElement, HeroProps>(
  (
    {
      name,
      title,
      description,
      statusBadge,
      showVisual = true,
      ctaPrimary,
      ctaSecondary,
      variant = 'default',
      animate = true,
      id = 'hero',
      ariaLabel = 'Hero section',
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <>
        <style>{animationStyle}</style>
        <SectionWrapper
          ref={ref}
          id={id}
          background={variant === 'gradient' ? 'gradient' : 'default'}
          spacing="xl"
          variant="contained"
          animate={false}
          role="region"
          ariaLabel={ariaLabel}
          className={className}
          {...props}
        >
          {/* Main content grid - two column on desktop */}
          <div className={cn(
            'grid gap-12 lg:grid-cols-2 lg:items-center',
          )}>
            {/* Left column: Text content */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-6 lg:gap-8">

              {/* Status Badge (optional) */}
              {statusBadge && (
                <div
                  className={cn(animate && 'hero-animate-element')}
                  style={animate ? { animationDelay: '0ms' } : undefined}
                >
                  <Badge
                    variant="primary"
                    size="md"
                  >
                    {statusBadge}
                  </Badge>
                </div>
              )}

              {/* Headline (H1) */}
              <div
                className={cn(animate && 'hero-animate-element')}
                style={animate ? { animationDelay: '100ms' } : undefined}
              >
                <h1 className={cn(
                  'text-3xl md:text-4xl lg:text-5xl',
                  'font-bold leading-tight',
                  'text-text tracking-tighter',
                )}>
                  {name}
                  <br />
                  {title}
                </h1>
              </div>

              {/* Subheading - Value Proposition */}
              <div
                className={cn(animate && 'hero-animate-element')}
                style={animate ? { animationDelay: '200ms' } : undefined}
              >
                <p className={cn(
                  'text-lg md:text-xl lg:text-xl',
                  'font-normal leading-relaxed',
                  'text-text-secondary',
                  'max-w-2xl',
                )}>
                  {description}
                </p>
              </div>

              {/* CTA Buttons */}
              <div
                className={cn(
                  'flex gap-3',
                  'flex-col md:flex-row',
                  'w-full md:w-auto',
                  'max-w-xs md:max-w-none',
                  'justify-center md:justify-start',
                  'pt-4 md:pt-0',
                  animate && 'hero-animate-element',
                )}
                style={animate ? { animationDelay: '300ms' } : undefined}
                role="group"
                aria-label="Call-to-action buttons"
              >

                {ctaPrimary && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={ctaPrimary.onClick}
                    aria-label={ctaPrimary.label}
                    className="flex-1 md:flex-none"
                  >
                    {ctaPrimary.label}
                  </Button>
                )}

                {ctaSecondary && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={ctaSecondary.onClick}
                    aria-label={ctaSecondary.label}
                    className="flex-1 md:flex-none"
                  >
                    {ctaSecondary.label}
                  </Button>
                )}
              </div>
            </div>

            {/* Right column: Visual element (desktop only) */}
            {showVisual && (
              <div
                className={cn('hidden lg:flex items-center justify-center', animate && 'hero-animate-element')}
                style={animate ? { animationDelay: '200ms' } : undefined}
                aria-hidden="true"
              >
                <HeroVisual />
              </div>
            )}
          </div>
        </SectionWrapper>
      </>
    )
  },
)

Hero.displayName = 'Hero'

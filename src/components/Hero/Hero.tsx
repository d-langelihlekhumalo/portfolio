import { forwardRef } from 'react'
import { HeroProps } from './Hero.types'
import { Badge, Button, SectionWrapper } from '@/components'
import { BuildReceipt } from './BuildReceipt'
import { cn } from '@/utils/cn'

// The hero's one orchestrated moment: the text fades in, then the build
// receipt's budget bar fills (see index.css). No per-element stagger.
const animationStyle = `
  @keyframes heroFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hero-fade-in {
    animation: heroFadeIn 500ms cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-fade-in {
      animation: none;
    }
  }
`

export const Hero = forwardRef<HTMLElement, HeroProps>(
  (
    {
      headline,
      description,
      statusBadge,
      ctaPrimary,
      ctaSecondary,
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
          background="default"
          spacing="xl"
          variant="contained"
          role="region"
          ariaLabel={ariaLabel}
          className={className}
          {...props}
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className={cn('flex flex-col items-start gap-6', animate && 'hero-fade-in')}>
              {statusBadge && (
                <Badge variant="primary" size="md">
                  {statusBadge}
                </Badge>
              )}

              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-text md:text-6xl">
                {headline}
              </h1>

              <p className="max-w-[55ch] text-lg leading-relaxed text-text-secondary md:text-xl">
                {description}
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row" role="group" aria-label="Call-to-action buttons">
                {ctaPrimary && (
                  <Button variant="primary" size="lg" onClick={ctaPrimary.onClick} aria-label={ctaPrimary.label}>
                    {ctaPrimary.label}
                  </Button>
                )}
                {ctaSecondary && (
                  <Button variant="secondary" size="lg" onClick={ctaSecondary.onClick} aria-label={ctaSecondary.label}>
                    {ctaSecondary.label}
                  </Button>
                )}
              </div>
            </div>

            <div className={cn(animate && 'hero-fade-in')} style={animate ? { animationDelay: '100ms' } : undefined}>
              <BuildReceipt />
            </div>
          </div>
        </SectionWrapper>
      </>
    )
  },
)

Hero.displayName = 'Hero'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Card, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'

interface TestimonialsProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ariaLabel?: string
}

/**
 * Testimonials Section Component
 *
 * Professional placeholder section for client testimonials and feedback.
 * Ready to be populated with actual client quotes and experiences.
 *
 * Includes:
 * - Professional placeholder messaging
 * - No fabricated content (ethical approach)
 * - Responsive design
 * - Fade-in animation on scroll
 * - Full accessibility support
 *
 * @example
 * <Testimonials
 *   id="testimonials"
 *   animate={true}
 * />
 */
export const Testimonials = forwardRef<HTMLElement, TestimonialsProps>(
  (
    {
      id = 'testimonials',
      animate = true,
      ariaLabel = 'Client testimonials and feedback',
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
        heading="What Others Say"
        subheading="Feedback from clients and collaborators"
        background="surface"
        spacing="lg"
        animate={animate}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        {/* Placeholder content */}
        <div
          className={cn(
            'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
            animate && !isVisible ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0',
          )}
        >
          <Card
            padding="lg"
            className="flex flex-col items-center gap-6 md:gap-8 py-16 md:py-20 text-center"
          >
            {/* Icon */}
            <div className={cn(
              'flex-shrink-0 w-16 h-16 rounded-full',
              'bg-primary/10 flex items-center justify-center',
              'text-primary',
            )}>
              <MessageCircle className="w-8 h-8" aria-hidden="true" />
            </div>

            {/* Heading */}
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-bold text-text">
                Client Testimonials Coming Soon
              </h3>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl">
              As I complete projects and build long-term relationships with clients, I'll be adding authentic testimonials and feedback from those I've worked with. This section will showcase real experiences and outcomes from collaborative partnerships.
            </p>

            {/* Subtext */}
            <div className="pt-6 border-t border-border mt-4 pt-8 w-full space-y-2">
              <p className="text-sm text-text-secondary/80">
                Authentic testimonials from verified clients will appear here.
              </p>
              <p className="text-xs text-text-secondary/60">
                No fabricated feedback — only genuine professional recommendations.
              </p>
            </div>
          </Card>
        </div>
      </SectionWrapper>
    )
  },
)

Testimonials.displayName = 'Testimonials'

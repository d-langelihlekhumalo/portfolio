import { forwardRef } from 'react'
import { MessageCircle } from 'lucide-react'
import { Card, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'

interface TestimonialsProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  ariaLabel?: string
}

/**
 * Placeholder for client testimonials — hidden on the live site until
 * there are real ones to show. No fabricated quotes.
 */
export const Testimonials = forwardRef<HTMLElement, TestimonialsProps>(
  ({ id = 'testimonials', ariaLabel = 'Client testimonials and feedback', className, ...props }, ref) => {
    return (
      <SectionWrapper
        ref={ref}
        id={id}
        heading="What Others Say"
        subheading="Feedback from clients and collaborators"
        background="surface"
        spacing="lg"
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        <Card padding="lg" className="flex flex-col items-center gap-6 md:gap-8 py-16 md:py-20 text-center">
          <div
            className={cn(
              'flex-shrink-0 w-16 h-16 rounded-full',
              'bg-primary/10 flex items-center justify-center',
              'text-primary',
            )}
          >
            <MessageCircle className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-2 max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-text">Client Testimonials Coming Soon</h3>
          </div>

          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl">
            As I complete projects and build long-term relationships with clients, I'll be adding authentic
            testimonials and feedback from those I've worked with.
          </p>

          <div className="pt-6 border-t border-border mt-4 pt-8 w-full space-y-2">
            <p className="text-sm text-text-secondary">
              Authentic testimonials from verified clients will appear here.
            </p>
            <p className="text-xs text-text-secondary">
              No fabricated feedback — only genuine professional recommendations.
            </p>
          </div>
        </Card>
      </SectionWrapper>
    )
  },
)

Testimonials.displayName = 'Testimonials'

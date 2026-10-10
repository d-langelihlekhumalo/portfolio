import { forwardRef } from 'react'
import { SectionWrapper } from '@/components'

interface HowIWorkProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  ariaLabel?: string
}

const STEPS = [
  'A short call, then a written scope with a fixed price per milestone.',
  'Weekly progress with a working staging link, not just status updates.',
  'Tests and CI from day one.',
  'Handover: the code is in your repo, with a README and deploy notes.',
]

/**
 * A genuine ordered sequence, so it's numbered rather than laid out as
 * unordered cards.
 */
export const HowIWork = forwardRef<HTMLElement, HowIWorkProps>(
  ({ id = 'how-i-work', ariaLabel = 'How I work', className, ...props }, ref) => {
    return (
      <SectionWrapper
        ref={ref}
        id={id}
        heading="How I work"
        background="default"
        spacing="xl"
        variant="contained"
        animate={false}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        <ol className="grid gap-8 md:grid-cols-4 md:gap-6">
          {STEPS.map((step, i) => (
            <li key={step} className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-primary">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-text">{step}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-sm text-text-secondary">
          Based in Cape Town (SAST, GMT+2). My hours overlap fully with the UK and most of Europe.
        </p>
      </SectionWrapper>
    )
  },
)

HowIWork.displayName = 'HowIWork'

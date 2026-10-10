import { forwardRef } from 'react'
import { SectionWrapper } from '@/components'
import { SKILLS } from '@/constants/portfolio'

interface TechStackProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  ariaLabel?: string
}

const GROUPS: { label: string; items: readonly string[] }[] = [
  { label: 'Frontend', items: SKILLS.frontend },
  { label: 'Backend', items: SKILLS.backend },
  { label: 'Data', items: SKILLS.data },
  { label: 'Tooling', items: SKILLS.tooling },
  { label: 'AI', items: SKILLS.ai },
]

/** Plain grouped text — no emoji icons, no pill badges. */
export const TechStack = forwardRef<HTMLElement, TechStackProps>(
  ({ id = 'tech-stack', ariaLabel = 'Technology stack', className, ...props }, ref) => {
    return (
      <SectionWrapper
        ref={ref}
        id={id}
        heading="Tech"
        background="default"
        spacing="xl"
        variant="contained"
        animate={false}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">{group.label}</h3>
              <p className="mt-3 text-text">{group.items.join(', ')}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>
    )
  },
)

TechStack.displayName = 'TechStack'

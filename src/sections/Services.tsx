import { forwardRef } from 'react'
import { SectionWrapper } from '@/components'

interface Offer {
  title: string
  description: string
  gets: string[]
}

interface ServicesProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  ariaLabel?: string
}

const OFFERS: Offer[] = [
  {
    title: 'Build your first version',
    description:
      'An MVP, internal tool or customer portal — from a written scope to a deployed app with tests.',
    gets: [
      'A written scope and fixed price before work starts',
      "A live staging link you can check in on as it's built",
      'Tests covering the parts that matter',
    ],
  },
  {
    title: 'Make your web app work offline',
    description:
      "An installable PWA with offline data, sync when the connection comes back, and fast loads on slow mobile networks.",
    gets: [
      'A service worker and app shell that installs like an app',
      "Local-first data that syncs once you're back online",
      'A bundle-size budget enforced in CI so it stays fast',
    ],
  },
  {
    title: 'Fix and speed up an existing React app',
    description:
      "Bug fixes, performance and bundle-size work, tests added to untested code, and accessibility fixes.",
    gets: [
      "A prioritised list of what's actually slow, with numbers",
      'Tests added around the code being changed',
      'Accessibility issues fixed, not just flagged',
    ],
  },
]

/**
 * "What I can help with" — three concrete offers as rows divided by rules,
 * not cards. No icons, no pill badges, no "Learn more" links.
 */
export const Services = forwardRef<HTMLElement, ServicesProps>(
  ({ id = 'services', ariaLabel = 'What I can help with', className, ...props }, ref) => {
    return (
      <SectionWrapper
        ref={ref}
        id={id}
        heading="What I can help with"
        background="default"
        spacing="xl"
        variant="contained"
        animate={false}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        <div className="divide-y divide-border">
          {OFFERS.map((offer) => (
            <div key={offer.title} className="grid gap-4 py-8 first:pt-0 last:pb-0 md:grid-cols-[1fr_1.2fr] md:gap-10">
              <div>
                <h3 className="text-xl font-bold text-text">{offer.title}</h3>
                <p className="mt-2 text-text-secondary">{offer.description}</p>
              </div>
              <ul className="space-y-2 text-sm text-text-secondary">
                {offer.gets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionWrapper>
    )
  },
)

Services.displayName = 'Services'

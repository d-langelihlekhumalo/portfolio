import { forwardRef } from 'react'
import { SectionWrapper } from '@/components'
import { EXPERIENCE, EDUCATION } from '@/constants/portfolio'

interface AboutExperienceProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  ariaLabel?: string
}

const ABOUT_PARAGRAPH =
  "I'm a full-stack developer based in Cape Town, working mostly in React and .NET. I like software that's boring in the right ways — tested, documented, and easy for the next person (often future me) to pick up. Outside my day job I build and ship my own projects end to end, from the first commit to the CI gate that runs before every deploy."

/**
 * About (one paragraph) and Experience + Education side by side — a single
 * section rather than three, per the brief's layout.
 */
export const AboutExperience = forwardRef<HTMLElement, AboutExperienceProps>(
  ({ id = 'about', ariaLabel = 'About and experience', className, ...props }, ref) => {
    return (
      <SectionWrapper
        ref={ref}
        id={id}
        background="default"
        spacing="xl"
        variant="contained"
        animate={false}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-text md:text-4xl">About</h2>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-text-secondary">{ABOUT_PARAGRAPH}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Experience</h3>
            <ul className="mt-4 space-y-8">
              {EXPERIENCE.map((job) => (
                <li key={job.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold text-text">
                      {job.position} · {job.company}
                    </p>
                    <p className="text-sm text-text-secondary">{job.duration}</p>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                    {job.highlights.slice(0, 3).map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span aria-hidden="true">·</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-text-secondary">Education</h3>
            <ul className="mt-3 space-y-1 text-sm text-text-secondary">
              {EDUCATION.map((entry) => (
                <li key={entry.id}>
                  {entry.qualification} · {entry.institution} ({entry.year})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionWrapper>
    )
  },
)

AboutExperience.displayName = 'AboutExperience'

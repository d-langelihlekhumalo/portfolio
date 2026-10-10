import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'
import { PROJECTS } from '@/constants/portfolio'

interface ProjectsProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ariaLabel?: string
}

const linkClassName = cn(
  'text-sm font-semibold text-primary underline-offset-4 hover:underline',
  'focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-sm',
)

/**
 * Selected work — each project as a row (screenshot + details), alternating
 * sides on desktop. No cards, no pill badges: rules between rows do the
 * separating.
 */
export const Projects = forwardRef<HTMLElement, ProjectsProps>(
  ({ id = 'work', animate: _animate, ariaLabel = 'Selected work', className, ...props }, ref) => {
    return (
      <SectionWrapper
        ref={ref}
        id={id}
        heading="Selected work"
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
          {PROJECTS.map((project, i) => {
            const imageOrderClass = i % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
            const textOrderClass = i % 2 === 1 ? 'lg:order-1' : 'lg:order-2'

            return (
              <article key={project.id} className="py-10 first:pt-0 last:pb-0 md:py-14">
                <div
                  className={cn(
                    'grid gap-6',
                    project.screenshot && 'lg:grid-cols-2 lg:items-center lg:gap-10',
                  )}
                >
                  {project.screenshot && (
                    <div className={cn('order-1', imageOrderClass)}>
                      <img
                        src={project.screenshot.src}
                        alt={project.screenshot.alt}
                        width={project.screenshot.width}
                        height={project.screenshot.height}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        className="w-full rounded-lg border border-border"
                      />
                    </div>
                  )}

                  <div className={cn('order-2', project.screenshot ? textOrderClass : '', 'flex flex-col gap-3')}>
                    <h3 className="text-xl font-bold text-text md:text-2xl">
                      {project.name}{' '}
                      <span className="font-normal text-text-secondary">· {project.status}</span>
                    </h3>

                    <p className="text-text-secondary">{project.description}</p>

                    {project.features.length > 0 && (
                      <ul className="space-y-1 text-sm text-text-secondary">
                        {project.features.slice(0, 2).map((feature) => (
                          <li key={feature}>· {feature}</li>
                        ))}
                      </ul>
                    )}

                    <p className="text-sm text-text-secondary">{project.technologies.join(' · ')}</p>

                    <div className="flex flex-wrap gap-5 pt-2">
                      {project.hasCaseStudy && (
                        <Link to={`/projects/${project.slug}`} className={linkClassName}>
                          Case study
                        </Link>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClassName}
                        >
                          Live
                        </a>
                      )}
                      {project.repos.map((repo) => (
                        <a
                          key={repo.url}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClassName}
                        >
                          {project.repos.length > 1 ? repo.label : 'Code'}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </SectionWrapper>
    )
  },
)

Projects.displayName = 'Projects'

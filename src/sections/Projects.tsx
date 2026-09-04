import { forwardRef, useEffect, useRef, useState } from 'react'
import { ExternalLink, GitBranch } from 'lucide-react'
import { Button, Card, SectionWrapper, Badge } from '@/components'
import { cn } from '@/utils/cn'
import { PROJECTS } from '@/constants/portfolio'

interface ProjectsProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ariaLabel?: string
}

/**
 * Projects Section Component
 *
 * Professional placeholder section for featuring completed projects.
 * Ready to be populated with actual project cards, case studies, and links.
 *
 * Includes:
 * - Professional placeholder messaging
 * - Call-to-action for contact
 * - Responsive design
 * - Fade-in animation on scroll
 * - Full accessibility support
 *
 * @example
 * <Projects
 *   id="projects"
 *   animate={true}
 * />
 */
export const Projects = forwardRef<HTMLElement, ProjectsProps>(
  (
    {
      id = 'projects',
      animate = true,
      ariaLabel = 'Featured projects and case studies',
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
        heading="Featured Projects"
        subheading="Showcase of completed work and technical solutions"
        background="default"
        spacing="lg"
        animate={animate}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        {/* Projects Grid */}
        <div
          className={cn(
            'grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8',
            'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
            animate && !isVisible ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0',
          )}
        >
          {PROJECTS.map((project) => (
            <Card
              key={project.id}
              padding="lg"
              className="flex flex-col gap-6 h-full group hover:border-primary/50 transition-colors"
            >
              {/* Project Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl md:text-2xl font-bold text-text flex-1 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <Badge variant="outline" className="flex-shrink-0">
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Problem & Solution */}
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-sm font-semibold text-text mb-1.5">Problem</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {project.problem}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text mb-1.5">Solution</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h4 className="text-sm font-semibold text-text mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 6).map((tech) => (
                    <Badge key={tech} variant="default" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 6 && (
                    <Badge variant="default" className="text-xs">
                      +{project.technologies.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Key Achievements */}
              <div>
                <h4 className="text-sm font-semibold text-text mb-2">Key Achievements</h4>
                <ul className="space-y-1.5">
                  {project.keyAchievements.slice(0, 2).map((achievement, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-text-secondary">
                      <span className="text-primary flex-shrink-0">✓</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  leftIcon={<GitBranch className="w-4 h-4" />}
                  onClick={() => window.open(project.github, '_blank')}
                  aria-label={`View ${project.name} on GitHub`}
                >
                  GitHub
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                  onClick={() => {
                    if (project.demo !== '#') {
                      window.open(project.demo, '_blank')
                    }
                  }}
                  disabled={project.demo === '#'}
                  aria-label={`View ${project.name} demo${project.demo === '#' ? ' (coming soon)' : ''}`}
                >
                  {project.demo === '#' ? 'Demo (Soon)' : 'View Demo'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </SectionWrapper>
    )
  },
)

Projects.displayName = 'Projects'

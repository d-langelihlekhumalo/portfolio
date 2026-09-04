import { forwardRef, useEffect, useRef, useState } from 'react'
import { Badge, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'
import { SKILLS } from '@/constants/portfolio'

interface Technology {
  name: string
  category: string
}

interface TechCategory {
  category: string
  icon: string
  technologies: Technology[]
}

interface TechStackProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ariaLabel?: string
}

/**
 * Tech Stack Section Component
 *
 * Showcases the developer's technology expertise across 5 categories:
 * - Frontend, Backend, Database, Cloud, and Tools
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3+ col desktop)
 * - Badge-based technology display with hover effects
 * - Fade-in animation on scroll with staggered category reveals
 * - Full accessibility support (semantic HTML, ARIA, keyboard navigation)
 *
 * @example
 * <TechStack
 *   id="tech-stack"
 *   animate={true}
 * />
 */
export const TechStack = forwardRef<HTMLElement, TechStackProps>(
  (
    {
      id = 'tech-stack',
      animate = true,
      ariaLabel = 'Technology stack and skills',
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

    // Technology categories data — kept in sync with SKILLS in constants/portfolio.ts
    const categories: TechCategory[] = [
      {
        category: 'Languages',
        icon: '📝',
        technologies: SKILLS.languages.map((name) => ({ name, category: 'Languages' })),
      },
      {
        category: 'Frontend',
        icon: '🎨',
        technologies: SKILLS.frontend.map((name) => ({ name, category: 'Frontend' })),
      },
      {
        category: 'Backend',
        icon: '⚙️',
        technologies: SKILLS.backend.map((name) => ({ name, category: 'Backend' })),
      },
      {
        category: 'Database',
        icon: '💾',
        technologies: SKILLS.database.map((name) => ({ name, category: 'Database' })),
      },
      {
        category: 'Cloud & DevOps',
        icon: '☁️',
        technologies: SKILLS.cloud.map((name) => ({ name, category: 'Cloud & DevOps' })),
      },
      {
        category: 'AI & Agents',
        icon: '🤖',
        technologies: SKILLS.ai.map((name) => ({ name, category: 'AI & Agents' })),
      },
      {
        category: 'Tools',
        icon: '🛠️',
        technologies: SKILLS.tools.map((name) => ({ name, category: 'Tools' })),
      },
    ]

    return (
      <SectionWrapper
        ref={ref || sectionRef}
        id={id}
        heading="Tech Stack"
        subheading="Technologies and tools I work with"
        background="surface"
        spacing="lg"
        animate={animate}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        {/* Category grid - responsive: 1 col mobile, 2 col tablet, 3-5 col desktop */}
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
            'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
            animate && !isVisible ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0',
          )}
          role="list"
        >
          {categories.map((cat, index) => (
            <TechCategoryCard
              key={cat.category}
              category={cat}
              index={index}
              animate={animate}
            />
          ))}
        </div>
      </SectionWrapper>
    )
  },
)

TechStack.displayName = 'TechStack'

/**
 * TechCategoryCard component - Individual technology category card
 */
interface TechCategoryCardProps {
  category: TechCategory
  index: number
  animate: boolean
}

const TechCategoryCard = ({ category, index, animate }: TechCategoryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardIsVisible, setCardIsVisible] = useState(false)

  // Stagger animation for each category card
  useEffect(() => {
    if (!animate) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger each card by 100ms based on index
          setTimeout(() => {
            setCardIsVisible(true)
          }, index * 100)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [animate, index])

  const shouldBeVisible = animate ? cardIsVisible : true

  return (
    <div
      ref={cardRef}
      role="listitem"
      className={cn(
        'p-6 rounded-lg',
        'bg-background border border-border',
        'hover:border-primary/40 hover:shadow-[0_8px_16px_rgba(56,189,248,0.1)]',
        'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'flex flex-col gap-4',
        'group',
        shouldBeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      )}
    >
      {/* Category header with icon */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'text-2xl',
            'group-hover:scale-110 transition-transform duration-300',
          )}
          role="img"
          aria-label={`${category.category} icon`}
        >
          {category.icon}
        </span>
        <h3 className={cn(
          'text-lg font-semibold text-text',
          'group-hover:text-primary transition-colors duration-300',
        )}>
          {category.category}
        </h3>
      </div>

      {/* Technology badges */}
      <div
        className="flex flex-wrap gap-2"
        role="list"
        aria-label={`${category.category} technologies`}
      >
        {category.technologies.map((tech) => (
          <div key={tech.name} role="listitem">
            <Badge
              variant="outline"
              size="sm"
              className={cn(
                'hover:bg-primary/10 hover:border-primary/40',
                'cursor-default',
                'transition-all duration-300',
              )}
              aria-label={`${tech.name} technology`}
            >
              {tech.name}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

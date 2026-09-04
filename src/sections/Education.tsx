import { forwardRef, useEffect, useRef, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { Card, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'
import { EDUCATION } from '@/constants/portfolio'

type EducationItem = (typeof EDUCATION)[number]

interface EducationProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ariaLabel?: string
}

/**
 * Education Section Component
 *
 * Displays educational background with:
 * - Chronological list of qualifications
 * - Year, institution, and qualification details
 * - Card-based layout with hover effects
 * - Fade-in animation on scroll with staggered reveals
 * - Full accessibility support (semantic HTML, ARIA, keyboard navigation)
 *
 * @example
 * <Education
 *   id="education"
 *   animate={true}
 * />
 */
export const Education = forwardRef<HTMLElement, EducationProps>(
  (
    {
      id = 'education',
      animate = true,
      ariaLabel = 'Education and qualifications',
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

    // Education data
    const educationItems: EducationItem[] = EDUCATION

    return (
      <SectionWrapper
        ref={ref || sectionRef}
        id={id}
        heading="Education"
        subheading="Academic background"
        background="surface"
        spacing="lg"
        animate={animate}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        {/* Education timeline - vertical layout */}
        <div
          className={cn(
            'space-y-6 md:space-y-8',
            'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
            animate && !isVisible ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0',
          )}
          role="list"
        >
          {educationItems.map((item, index) => (
            <EducationCard
              key={`${item.year}-${item.institution}`}
              item={item}
              index={index}
              animate={animate}
            />
          ))}
        </div>
      </SectionWrapper>
    )
  },
)

Education.displayName = 'Education'

/**
 * EducationCard component - Individual education item card
 */
interface EducationCardProps {
  item: EducationItem
  index: number
  animate: boolean
}

const EducationCard = ({ item, index, animate }: EducationCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardIsVisible, setCardIsVisible] = useState(false)

  // Stagger animation for each education item
  useEffect(() => {
    if (!animate) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger each card by 150ms based on index
          setTimeout(() => {
            setCardIsVisible(true)
          }, index * 150)
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
        'grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 md:gap-8',
        'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
        shouldBeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      )}
    >
      {/* Year badge - left column on desktop */}
      <div className="flex md:flex-col gap-4 md:gap-0 items-start md:items-center">
        <div className={cn(
          'flex-shrink-0 px-4 py-2 rounded-lg',
          'bg-primary/10 border border-primary/20',
          'flex items-center gap-2',
        )}>
          <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
          <span className="text-sm md:text-base font-bold text-primary">{item.year}</span>
        </div>

        {/* Timeline connector - hidden on mobile */}
        <div className="hidden md:flex flex-col items-center gap-2 pt-8 pb-8">
          <div className="w-1 h-12 bg-gradient-to-b from-primary/40 to-primary/10 rounded-full" />
        </div>
      </div>

      {/* Content card - right column */}
      <Card
        hoverable
        padding="lg"
        className="flex flex-col gap-4 h-full"
      >
        {/* Qualification heading */}
        <div>
          <h3 className={cn(
            'text-xl md:text-2xl font-bold text-text leading-tight',
            'group-hover:text-primary transition-colors duration-300',
          )}>
            {item.qualification}
          </h3>
          <p className={cn(
            'text-sm md:text-base text-text-secondary font-medium mt-2',
          )}>
            {item.institution}
          </p>
        </div>

        {/* Description */}
        {item.description && (
          <p className={cn(
            'text-sm md:text-base text-text-secondary leading-relaxed',
            'flex-grow',
          )}>
            {item.description}
          </p>
        )}
      </Card>
    </div>
  )
}

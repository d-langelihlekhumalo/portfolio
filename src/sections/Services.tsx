import { forwardRef, useEffect, useRef, useState } from 'react'
import { Code, Network, Cloud, RefreshCw, Settings, Gauge } from 'lucide-react'
import { Card, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'

interface ServiceProps {
  icon: React.ReactNode
  title: string
  description: string
}

interface ServicesProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ariaLabel?: string
}

/**
 * Services Section Component
 *
 * Showcases core services offered by the developer with:
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
 * - 6 service cards with icons, titles, and descriptions
 * - Hover animations with lift effect and shadow enhancement
 * - Fade-in animation on scroll
 * - Full accessibility support (semantic HTML, ARIA, keyboard navigation)
 *
 * @example
 * <Services
 *   id="services"
 *   animate={true}
 * />
 */
export const Services = forwardRef<HTMLElement, ServicesProps>(
  (
    {
      id = 'services',
      animate = true,
      ariaLabel = 'Services offered',
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

    // Service card data
    const services: ServiceProps[] = [
      {
        icon: <Code className="w-8 h-8" aria-hidden="true" />,
        title: 'Full Stack Development',
        description: 'End-to-end application development using modern frameworks. I build responsive frontends with React and robust backends with .NET, ensuring seamless integration and optimal performance across all components.',
      },
      {
        icon: <Network className="w-8 h-8" aria-hidden="true" />,
        title: 'API Design & Integration',
        description: 'RESTful and scalable API design with comprehensive documentation. I create well-structured endpoints that follow industry best practices, ensuring reliability and ease of integration for client applications.',
      },
      {
        icon: <Cloud className="w-8 h-8" aria-hidden="true" />,
        title: 'Cloud Architecture',
        description: 'Designing and implementing cloud solutions for scalability and reliability. I leverage cloud platforms to build distributed systems that handle growth efficiently while maintaining cost-effectiveness and security.',
      },
      {
        icon: <RefreshCw className="w-8 h-8" aria-hidden="true" />,
        title: 'DevOps & Deployment',
        description: 'Continuous integration and deployment pipeline setup. I automate build, test, and release processes to enable rapid, reliable deployments while maintaining code quality and system stability.',
      },
      {
        icon: <Settings className="w-8 h-8" aria-hidden="true" />,
        title: 'System Design & Architecture',
        description: 'Strategic planning for complex software systems. I design scalable architectures that balance performance, maintainability, and business requirements, ensuring solutions grow with your needs.',
      },
      {
        icon: <Gauge className="w-8 h-8" aria-hidden="true" />,
        title: 'Performance Optimization',
        description: 'Identifying and eliminating bottlenecks in applications. I analyze code, databases, and infrastructure to improve speed and efficiency, delivering faster load times and better user experiences.',
      },
    ]

    return (
      <SectionWrapper
        ref={ref || sectionRef}
        id={id}
        heading="Services"
        subheading="Comprehensive solutions tailored to your development needs"
        background="default"
        spacing="lg"
        animate={animate}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        {/* Service cards grid - responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
            'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
            animate && !isVisible ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0',
          )}
          role="list"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              animate={animate}
            />
          ))}
        </div>
      </SectionWrapper>
    )
  },
)

Services.displayName = 'Services'

/**
 * ServiceCard component - Individual service card with icon, title, and description
 */
interface ServiceCardProps {
  service: ServiceProps
  index: number
  animate: boolean
}

const ServiceCard = ({ service, index, animate }: ServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardIsVisible, setCardIsVisible] = useState(false)

  // Stagger animation for each card
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
    <Card
      ref={cardRef}
      hoverable
      padding="lg"
      role="listitem"
      className={cn(
        'flex flex-col gap-4 h-full',
        'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
        shouldBeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          'flex-shrink-0 w-12 h-12 rounded-lg',
          'bg-primary/10 flex items-center justify-center',
          'text-primary',
          'group-hover:bg-primary/20 transition-colors duration-300',
        )}
        aria-hidden="true"
      >
        {service.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text leading-tight">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed flex-grow">
        {service.description}
      </p>

      {/* Learn more link */}
      <div className="pt-2">
        <a
          href="#contact"
          className={cn(
            'inline-flex items-center gap-2',
            'text-primary text-sm font-semibold',
            'hover:gap-3 transition-all duration-300',
            'hover:text-primary/80',
            'focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded',
          )}
          aria-label={`Learn more about ${service.title}`}
        >
          Learn more
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </Card>
  )
}

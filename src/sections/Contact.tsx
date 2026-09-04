import { forwardRef, useEffect, useRef, useState } from 'react'
import { Mail, Copy, CheckCircle, GitBranch, Users, Phone } from 'lucide-react'
import { Button, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'

interface ContactProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  animate?: boolean
  ariaLabel?: string
  email?: string
  phone?: string
  github?: string
  linkedin?: string
}

/**
 * Contact Section Component
 *
 * Professional contact section with:
 * - Email link with copy-to-clipboard functionality
 * - Social media links (LinkedIn, GitHub)
 * - Optional phone contact
 * - Clear call-to-action for hiring/freelance work
 * - Fade-in animation on scroll
 * - Full accessibility support
 *
 * @example
 * <Contact
 *   id="contact"
 *   animate={true}
 *   email="d.langelihlekhumalo@gmail.com"
 *   github="https://github.com"
 *   linkedin="https://linkedin.com"
 * />
 */
export const Contact = forwardRef<HTMLElement, ContactProps>(
  (
    {
      id = 'contact',
      animate = true,
      ariaLabel = 'Contact information and social links',
      email = 'd.langelihlekhumalo@gmail.com',
      phone,
      github = 'https://github.com',
      linkedin = 'https://linkedin.com',
      className,
      ...props
    },
    ref,
  ) => {
    const sectionRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [copied, setCopied] = useState(false)

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

    // Handle email copy to clipboard
    const handleCopyEmail = async () => {
      try {
        await navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy email:', err)
      }
    }

    // Contact methods data
    const contactMethods = [
      {
        icon: Mail,
        label: 'Email',
        value: email,
        href: `mailto:${email}`,
        action: handleCopyEmail,
        actionLabel: 'Copy email address',
      },
      ...(phone ? [{
        icon: Phone,
        label: 'Phone',
        value: phone,
        href: `tel:${phone}`,
        action: () => window.location.href = `tel:${phone}`,
        actionLabel: 'Call phone number',
      }] : []),
    ]

    const socialLinks = [
      {
        icon: GitBranch,
        label: 'GitHub',
        href: github,
        color: 'text-text-secondary hover:text-primary',
      },
      {
        icon: Users,
        label: 'LinkedIn',
        href: linkedin,
        color: 'text-text-secondary hover:text-primary',
      },
    ]

    return (
      <SectionWrapper
        ref={ref || sectionRef}
        id={id}
        heading="Let's Work Together"
        subheading="Get in touch for freelance opportunities or project inquiries"
        background="default"
        spacing="lg"
        animate={animate}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        {/* Main content container */}
        <div
          className={cn(
            'max-w-2xl mx-auto',
            'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
            animate && !isVisible ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0',
          )}
        >
          {/* Intro text */}
          <div className="space-y-6 mb-12">
            <p className={cn(
              'text-lg md:text-xl text-text-secondary leading-relaxed',
              'text-center',
            )}>
              I'm always interested in hearing about new projects and opportunities. Whether you have a question or just want to say hello, feel free to reach out. I'll do my best to respond within 24 hours.
            </p>
          </div>

          {/* Contact methods */}
          <div className="space-y-4 mb-12">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              const isEmail = method.label === 'Email'
              return (
                <div
                  key={index}
                  className={cn(
                    'p-4 md:p-6 rounded-lg',
                    'border border-border',
                    'bg-surface/50 hover:bg-surface',
                    'transition-all duration-300 ease-out',
                    'flex items-center justify-between gap-4',
                    'group',
                  )}
                >
                  {/* Left side: Icon and value */}
                  <div className="flex items-center gap-4 min-w-0 flex-grow">
                    <div className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg',
                      'bg-primary/10 flex items-center justify-center',
                      'text-primary',
                      'group-hover:bg-primary/20 transition-colors duration-300',
                    )}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-grow">
                      <p className="text-xs md:text-sm text-text-secondary font-medium">
                        {method.label}
                      </p>
                      <p className={cn(
                        'text-sm md:text-base text-text font-semibold',
                        'truncate',
                        'group-hover:text-primary transition-colors duration-300',
                      )}>
                        {method.value}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Action button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={method.action}
                    aria-label={method.actionLabel}
                    rightIcon={
                      isEmail && copied ? (
                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )
                    }
                    className="flex-shrink-0"
                  >
                    {isEmail ? (copied ? 'Copied!' : 'Copy') : 'Contact'}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Primary CTA */}
          <div className="mb-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = `mailto:${email}`}
              aria-label="Send email"
              className="w-full"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              Send me an Email
            </Button>
          </div>

          {/* Social links section */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-text-secondary">
                  Or connect on social media
                </span>
              </div>
            </div>

            {/* Social links grid */}
            <div className="flex gap-4 justify-center">
              {socialLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${link.label} profile in new window`}
                    className={cn(
                      'flex items-center justify-center',
                      'w-12 h-12 rounded-lg',
                      'border border-border',
                      'bg-surface/50 hover:bg-surface',
                      link.color,
                      'transition-all duration-300 ease-out',
                      'hover:border-primary/40',
                      'focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-lg',
                    )}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Response time note */}
          <p className={cn(
            'text-xs md:text-sm text-text-secondary/60 text-center mt-8',
            'flex items-center justify-center gap-2',
          )}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            Typically responds within 24 hours
          </p>
        </div>
      </SectionWrapper>
    )
  },
)

Contact.displayName = 'Contact'

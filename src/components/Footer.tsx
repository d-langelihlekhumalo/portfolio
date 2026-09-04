import { forwardRef } from 'react'
import { GitBranch, Users, Mail } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  name?: string
  title?: string
  tagline?: string
  copyrightYear?: number
  sticky?: boolean
  github?: string
  linkedin?: string
  email?: string
}

/**
 * Footer Component
 *
 * Professional footer with:
 * - Developer name and title
 * - Professional tagline
 * - Copyright notice
 * - Social media links (GitHub, LinkedIn)
 * - Optional email link
 * - Dark mode compliant design
 * - Optional sticky positioning
 * - Full accessibility support
 *
 * @example
 * <Footer
 *   name="Andile Khumalo"
 *   title="Software Developer"
 *   tagline="Building reliable, scalable software with .NET and React"
 *   github="https://github.com"
 *   linkedin="https://linkedin.com"
 *   email="d.langelihlekhumalo@gmail.com"
 * />
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
  (
    {
      name = 'Andile Khumalo',
      title = 'Software Developer',
      tagline = 'Building reliable, scalable software with .NET and React',
      copyrightYear = new Date().getFullYear(),
      sticky = false,
      github = 'https://github.com',
      linkedin = 'https://linkedin.com',
      email = 'd.langelihlekhumalo@gmail.com',
      className,
      ...props
    },
    ref,
  ) => {
    const socialLinks = [
      {
        icon: GitBranch,
        label: 'GitHub',
        href: github,
        ariaLabel: 'Visit GitHub profile in new window',
      },
      {
        icon: Users,
        label: 'LinkedIn',
        href: linkedin,
        ariaLabel: 'Visit LinkedIn profile in new window',
      },
      {
        icon: Mail,
        label: 'Email',
        href: `mailto:${email}`,
        ariaLabel: 'Send email',
      },
    ]

    return (
      <footer
        ref={ref}
        className={cn(
          'border-t border-border bg-surface/50',
          'transition-all duration-300 ease-out',
          sticky && 'sticky bottom-0 z-40',
          className,
        )}
        role="contentinfo"
        {...props}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-12 md:py-16">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            {/* Left column: Developer info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-text">
                  {name}
                </h3>
                <p className="text-sm md:text-base text-primary font-semibold mt-1">
                  {title}
                </p>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {tagline}
              </p>
            </div>

            {/* Middle column: Quick links */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text uppercase tracking-wider opacity-80">
                Quick Links
              </h4>
              <ul className="space-y-2" role="list">
                {[
                  { label: 'About', href: '#about' },
                  { label: 'Services', href: '#services' },
                  { label: 'Projects', href: '#projects' },
                  { label: 'Contact', href: '#contact' },
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className={cn(
                        'text-sm text-text-secondary',
                        'hover:text-primary transition-colors duration-300',
                        'focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded',
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column: Social links */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text uppercase tracking-wider opacity-80">
                Connect
              </h4>
              <div className="flex gap-3" role="list">
                {socialLinks.map((link, index) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={index}
                      href={link.href}
                      target={link.href.startsWith('mailto') ? undefined : '_blank'}
                      rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                      aria-label={link.ariaLabel}
                      className={cn(
                        'flex items-center justify-center',
                        'w-10 h-10 rounded-lg',
                        'border border-border',
                        'bg-background hover:bg-surface',
                        'text-text-secondary hover:text-primary',
                        'transition-all duration-300 ease-out',
                        'hover:border-primary/40',
                        'focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-lg',
                      )}
                      role="listitem"
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Bottom footer content */}
          <div className={cn(
            'pt-8 md:pt-10',
            'flex flex-col md:flex-row md:items-center md:justify-between gap-4',
          )}>
            {/* Copyright */}
            <div className="text-xs md:text-sm text-text-secondary">
              <p>
                &copy; {copyrightYear} {name}. All rights reserved.
              </p>
            </div>

            {/* Build info */}
            <p className="text-xs text-text-secondary/60">
              Built with React, TypeScript &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    )
  },
)

Footer.displayName = 'Footer'

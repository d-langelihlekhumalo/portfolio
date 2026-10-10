import { forwardRef, useState } from 'react'
import { Copy, Check, GitBranch, Users, Briefcase } from 'lucide-react'
import { Button, SectionWrapper } from '@/components'
import { cn } from '@/utils/cn'
import { AVAILABILITY, PORTFOLIO } from '@/constants/portfolio'

interface ContactProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  ariaLabel?: string
  email?: string
  github?: string
  linkedin?: string
}

const MAILTO_SUBJECT = 'Project enquiry'
const MAILTO_BODY = 'What are you building?\nTimeline:\nBudget range:\nLink (if any):'

export const Contact = forwardRef<HTMLElement, ContactProps>(
  (
    {
      id = 'contact',
      ariaLabel = 'Contact',
      email = PORTFOLIO.email,
      github = PORTFOLIO.social.github,
      linkedin = PORTFOLIO.social.linkedin,
      className,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false)

    const handleCopyEmail = async () => {
      try {
        await navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Clipboard permission denied — the email is still right there to select.
      }
    }

    const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(MAILTO_SUBJECT)}&body=${encodeURIComponent(MAILTO_BODY)}`

    return (
      <SectionWrapper
        ref={ref}
        id={id}
        heading="Let's talk"
        subheading={AVAILABILITY.contactSubheading}
        background="default"
        spacing="xl"
        variant="contained"
        animate={false}
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <p className="break-all text-2xl font-bold text-text md:text-4xl">{email}</p>
          <button
            type="button"
            onClick={handleCopyEmail}
            className={cn(
              'inline-flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary',
              'hover:border-text-secondary transition-colors',
              'focus:outline-2 focus:outline-primary focus:outline-offset-2',
            )}
            aria-label="Copy email address"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-8 flex flex-col items-start gap-4">
          <Button variant="primary" size="lg" onClick={() => (window.location.href = mailtoHref)}>
            Start a project
          </Button>
          <p className="text-sm text-text-secondary">I reply within one working day.</p>
        </div>

        <div className="mt-10 flex gap-5 border-t border-border pt-8">
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit GitHub profile"
            className="text-text-secondary hover:text-primary transition-colors focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-sm"
          >
            <GitBranch className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit LinkedIn profile"
            className="text-text-secondary hover:text-primary transition-colors focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-sm"
          >
            <Users className="h-5 w-5" aria-hidden="true" />
          </a>
          {PORTFOLIO.social.upwork && (
            <a
              href={PORTFOLIO.social.upwork}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Upwork profile"
              className="text-text-secondary hover:text-primary transition-colors focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-sm"
            >
              <Briefcase className="h-5 w-5" aria-hidden="true" />
            </a>
          )}
        </div>
      </SectionWrapper>
    )
  },
)

Contact.displayName = 'Contact'

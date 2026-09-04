import React from 'react'

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  // Content
  name: string
  title: string
  description: string

  // Optional
  statusBadge?: string
  showVisual?: boolean

  // CTA Configuration
  ctaPrimary?: {
    label: string
    onClick: () => void
    href?: string
  }
  ctaSecondary?: {
    label: string
    onClick: () => void
    href?: string
  }

  // Visual customization
  variant?: 'default' | 'gradient'
  animate?: boolean

  // Accessibility
  id?: string
  ariaLabel?: string
}

import React from 'react'

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  headline: string
  description: string
  statusBadge?: string

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

  animate?: boolean
  id?: string
  ariaLabel?: string
}

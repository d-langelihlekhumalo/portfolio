import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Content structure
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode

  // Visual behavior
  hoverable?: boolean // Enable hover lift effect
  interactive?: boolean // Indicate card is clickable

  // Spacing control
  padding?: 'sm' | 'md' | 'lg' | 'none'

  // Click handler (if interactive)
  onClick?: () => void

  // ARIA for interactive cards
  role?: string
  ariaLabel?: string
}

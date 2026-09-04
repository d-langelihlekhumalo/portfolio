import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  // Content
  children: React.ReactNode

  // Variant (visual style)
  variant?: 'default' | 'primary' | 'success' | 'outline'

  // Size
  size?: 'sm' | 'md'

  // Optional: icon or close button
  icon?: React.ReactNode
  closeable?: boolean
  onClose?: () => void

  // Accessibility
  ariaLabel?: string
}

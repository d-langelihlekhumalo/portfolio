import React from 'react'

export interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  // Content
  children: React.ReactNode

  // Semantic section identifier
  id?: string

  // Background styling
  background?: 'default' | 'surface' | 'gradient' | 'none'

  // Vertical spacing (padding)
  spacing?: 'sm' | 'md' | 'lg' | 'xl'

  // Optional heading
  heading?: string
  subheading?: string

  // Container width constraint
  variant?: 'contained' | 'full'

  // Fade-in animation on scroll
  animate?: boolean

  // Accessibility
  role?: string
  ariaLabel?: string
}

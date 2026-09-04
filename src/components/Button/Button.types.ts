import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Visual variant
  variant?: 'primary' | 'secondary' | 'ghost'

  // Size
  size?: 'sm' | 'md' | 'lg'

  // State
  isLoading?: boolean
  disabled?: boolean

  // Content
  children: React.ReactNode

  // Optional icon support
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode

  // Accessibility
  ariaLabel?: string
  ariaPressed?: boolean
}

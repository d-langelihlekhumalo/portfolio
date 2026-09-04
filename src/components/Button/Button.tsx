import { forwardRef } from 'react'
import { ButtonProps } from './Button.types'
import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size: 'sm' | 'md' | 'lg'
}

/**
 * LoadingSpinner component - displays a rotating spinner for loading state
 */
const LoadingSpinner = ({ size }: LoadingSpinnerProps) => {
  const spinnerSize = size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px'
  return (
    <svg
      className="animate-spin"
      style={{
        width: spinnerSize,
        height: spinnerSize,
        display: 'inline-block',
      }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="15.7"
        strokeDashoffset="0"
        opacity="1"
      />
    </svg>
  )
}

/**
 * Button component - primary interactive element with multiple variants and sizes
 *
 * @example
 * // Primary button
 * <Button variant="primary">Click me</Button>
 *
 * // Secondary with icon
 * <Button variant="secondary" leftIcon={<ArrowRight />}>
 *   Learn More
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      leftIcon,
      rightIcon,
      ariaLabel,
      ariaPressed,
      className,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    // Size-based padding and font sizes
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm leading-[1.4]',
      md: 'px-6 py-3 text-base leading-[1.5]',
      lg: 'px-8 py-4 text-lg leading-[1.6]',
    }

    // Variant-based styling
    const variantClasses = {
      primary: cn(
        'bg-primary text-background font-semibold',
        'hover:opacity-90 hover:shadow-[0_4px_12px_rgba(56,189,248,0.2)] hover:-translate-y-0.5',
        'active:opacity-80 active:translate-y-0',
        'focus:outline-2 focus:outline-primary focus:outline-offset-2',
        'transition-all duration-150 ease-in-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0',
      ),
      secondary: cn(
        'bg-[rgba(255,255,255,0.08)] text-text border border-[rgba(255,255,255,0.08)] font-medium',
        'hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.12)] hover:shadow-[0_2px_8px_rgba(255,255,255,0.05)]',
        'active:bg-[rgba(255,255,255,0.16)] active:border-[rgba(255,255,255,0.16)]',
        'focus:outline-2 focus:outline-primary focus:outline-offset-2',
        'transition-all duration-150 ease-in-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 disabled:hover:shadow-none',
      ),
      ghost: cn(
        'text-primary font-medium',
        'hover:text-[#60D5FF] hover:bg-[rgba(56,189,248,0.05)]',
        'active:text-[#0EA5E9] active:bg-[rgba(56,189,248,0.1)]',
        'focus:outline-2 focus:outline-primary focus:outline-offset-2',
        'transition-all duration-150 ease-in-out',
        'disabled:text-text-secondary disabled:cursor-not-allowed',
      ),
    }

    // Icon size based on button size
    const iconSize = {
      sm: 16,
      md: 20,
      lg: 24,
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg',
          'whitespace-nowrap',
          'focus:outline-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <LoadingSpinner size={size} />
        )}
        {!isLoading && leftIcon && (
          <span
            className="flex items-center justify-center"
            style={{ width: iconSize[size], height: iconSize[size] }}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span
            className="flex items-center justify-center"
            style={{ width: iconSize[size], height: iconSize[size] }}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

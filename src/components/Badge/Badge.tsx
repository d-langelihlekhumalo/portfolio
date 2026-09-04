import { forwardRef } from 'react'
import { BadgeProps } from './Badge.types'
import { cn } from '@/utils/cn'

/**
 * Badge component - displays small labels, tags, or status indicators
 *
 * @example
 * // Simple default badge
 * <Badge>New Feature</Badge>
 *
 * // Primary badge (featured/important)
 * <Badge variant="primary">Featured</Badge>
 *
 * // Success badge (for statuses)
 * <Badge variant="success">Completed</Badge>
 *
 * // Closeable badge (e.g., filter tags)
 * <Badge
 *   closeable
 *   onClose={() => removeTag('react')}
 * >
 *   React
 * </Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      icon,
      closeable = false,
      onClose,
      ariaLabel,
      className,
      ...props
    },
    ref,
  ) => {
    // Size-based padding and font sizes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs leading-[1.3]',
      md: 'px-4 py-2 text-sm leading-[1.4]',
    }

    // Icon sizes
    const iconSize = {
      sm: 14,
      md: 16,
    }

    // Variant-based styling
    const variantClasses = {
      default: cn(
        'bg-[rgba(255,255,255,0.08)] text-text font-medium',
        'rounded-md',
      ),
      primary: cn(
        'bg-primary text-background font-semibold',
        'rounded-md',
      ),
      success: cn(
        'bg-[rgba(34,197,94,0.15)] text-success font-medium',
        'border border-[rgba(34,197,94,0.3)]',
        'rounded-md',
      ),
      outline: cn(
        'bg-transparent text-text-secondary font-medium',
        'border border-[rgba(255,255,255,0.08)]',
        'rounded-md',
      ),
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1',
          'whitespace-nowrap',
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        aria-label={ariaLabel}
        {...props}
      >
        {icon && (
          <span
            className="flex items-center justify-center"
            style={{ width: iconSize[size], height: iconSize[size] }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <span>{children}</span>
        {closeable && onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className={cn(
              'ml-1 p-1 rounded inline-flex items-center justify-center',
              'hover:opacity-75',
              'focus:outline-2 focus:outline-offset-1',
              'transition-opacity duration-100 ease-in',
              'cursor-pointer',
              'min-h-[32px] min-w-[32px]',
              'flex items-center justify-center',
            )}
            style={{
              width: iconSize[size] + 8,
              height: iconSize[size] + 8,
            }}
            aria-label="Remove badge"
            type="button"
          >
            <svg
              className="inline-block"
              style={{
                width: iconSize[size],
                height: iconSize[size],
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </span>
    )
  },
)

Badge.displayName = 'Badge'

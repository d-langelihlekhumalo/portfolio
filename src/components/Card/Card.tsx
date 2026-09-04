import { forwardRef } from 'react'
import { CardProps } from './Card.types'
import { cn } from '@/utils/cn'

/**
 * Card component - provides a contained surface for grouping related content
 *
 * @example
 * // Simple card with padding
 * <Card padding="md">
 *   <p>Content goes here</p>
 * </Card>
 *
 * // Card with header and footer
 * <Card header="Features" footer="View all →" padding="lg">
 *   <ul>
 *     <li>Feature 1</li>
 *     <li>Feature 2</li>
 *   </ul>
 * </Card>
 *
 * // Interactive clickable card
 * <Card
 *   interactive
 *   hoverable
 *   ariaLabel="Open project details"
 *   onClick={() => navigate('/projects/1')}
 * >
 *   <h3>Featured Project</h3>
 *   <p>Click to view full details...</p>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      header,
      footer,
      hoverable = false,
      interactive = false,
      padding = 'md',
      onClick,
      role,
      ariaLabel,
      className,
      tabIndex: tabIndexProp,
      ...props
    },
    ref,
  ) => {
    // Padding sizes
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    }

    // Header padding - same as card padding but reduced bottom
    const headerPaddingClasses = {
      none: 'p-0 pb-0',
      sm: 'px-3 py-3 pb-4',
      md: 'px-6 py-6 pb-4',
      lg: 'px-8 py-8 pb-4',
    }

    // Footer padding - same as card padding but reduced top
    const footerPaddingClasses = {
      none: 'p-0 pt-0',
      sm: 'px-3 py-3 pt-4',
      md: 'px-6 py-6 pt-4',
      lg: 'px-8 py-8 pt-4',
    }

    // Base card styling
    const baseClasses = cn(
      'rounded-xl',
      'bg-surface border border-[rgba(255,255,255,0.08)]',
      'shadow-[0_1px_3px_rgba(0,0,0,0.1)]',
      'overflow-hidden',
    )

    // Hover state styling
    const hoverClasses = hoverable
      ? cn(
          'hover:bg-[rgba(255,255,255,0.02)]',
          'hover:border-[rgba(255,255,255,0.12)]',
          'hover:shadow-[0_4px_16px_rgba(56,189,248,0.08)]',
          'hover:-translate-y-0.5',
          'transition-all duration-200',
          'ease-[cubic-bezier(0.4,0,0.2,1)]',
        )
      : ''

    // Interactive styling
    const interactiveClasses = interactive
      ? cn(
          'cursor-pointer',
          'focus:outline-2 focus:outline-primary focus:outline-offset-2',
          'focus:rounded-xl',
        )
      : ''

    // Determine tabIndex for keyboard accessibility
    const tabIndex = interactive && tabIndexProp === undefined ? 0 : tabIndexProp

    // Determine element role
    const elementRole = interactive ? role || 'button' : role

    return (
      <div
        ref={ref}
        className={cn(baseClasses, hoverClasses, interactiveClasses, className)}
        onClick={interactive ? onClick : undefined}
        role={elementRole}
        aria-label={ariaLabel}
        tabIndex={tabIndex}
        {...props}
      >
        {header && (
          <div
            className={cn(
              headerPaddingClasses[padding],
              'border-b border-[rgba(255,255,255,0.08)]',
            )}
          >
            {typeof header === 'string' ? (
              <h3 className="text-lg font-semibold text-text">{header}</h3>
            ) : (
              header
            )}
          </div>
        )}

        <div className={paddingClasses[padding]}>
          {children}
        </div>

        {footer && (
          <div
            className={cn(
              footerPaddingClasses[padding],
              'border-t border-[rgba(255,255,255,0.08)]',
              'text-text-secondary',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    )
  },
)

Card.displayName = 'Card'

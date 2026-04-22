import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-container-high text-on-surface-variant',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-error-container text-on-error-container',
  info: 'bg-tertiary-fixed/40 text-tertiary',
  primary: 'bg-primary-fixed/40 text-primary',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

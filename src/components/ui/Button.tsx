import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  icon?: ReactNode
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary shadow-md shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim hover:scale-[1.02] active:scale-[0.98]',
  outline:
    'bg-white/40 border border-outline-variant text-on-surface hover:bg-white/60 hover:scale-[1.02] active:scale-[0.98]',
  ghost:
    'bg-transparent text-on-surface-variant hover:bg-white/40 active:scale-[0.98]',
  danger:
    'bg-error text-on-error shadow-md shadow-error/20 hover:shadow-error/40 hover:scale-[1.02] active:scale-[0.98]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-label-sm rounded-full gap-1.5',
  md: 'px-6 py-2.5 text-label-md rounded-full gap-2',
  lg: 'px-8 py-3.5 text-body-md font-semibold rounded-full gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading,
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out cursor-pointer select-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  )
}

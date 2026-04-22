import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-card',
        hover && 'hover:-translate-y-1 hover:shadow-glass transition-all duration-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: ReactNode
  trend?: { value: string; positive: boolean }
  color?: 'primary' | 'secondary' | 'tertiary'
}

const colorMap = {
  primary: {
    iconBg: 'bg-primary-container/30',
    iconText: 'text-primary',
    shadow: 'shadow-primary-container/20',
  },
  secondary: {
    iconBg: 'bg-secondary-container/30',
    iconText: 'text-secondary',
    shadow: 'shadow-secondary-container/20',
  },
  tertiary: {
    iconBg: 'bg-tertiary-container/30',
    iconText: 'text-tertiary',
    shadow: 'shadow-tertiary-container/20',
  },
}

export function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
  const colors = colorMap[color]
  return (
    <div
      className={cn(
        'bg-surface/60 backdrop-blur-xl border border-white/50 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300',
        colors.shadow
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn('p-3 rounded-full', colors.iconBg, colors.iconText)}>
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold',
              trend.positive
                ? 'bg-tertiary-container/30 text-tertiary'
                : 'bg-error-container/30 text-error'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant mb-1">{title}</p>
        <p className="text-headline-lg font-bold text-on-background">{value}</p>
      </div>
    </div>
  )
}

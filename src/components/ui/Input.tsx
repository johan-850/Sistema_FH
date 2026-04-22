import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-label-md font-semibold text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-3 bg-white/60 border border-outline-variant/50 rounded-full text-on-surface',
              'placeholder:text-outline-variant',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container/50',
              'transition-all duration-200',
              icon && 'pl-11',
              error && 'border-error focus:ring-error-container/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-label-sm text-error">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-label-md font-semibold text-on-surface-variant">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 bg-white/60 border border-outline-variant/50 rounded-2xl text-on-surface',
            'placeholder:text-outline-variant',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container/50',
            'transition-all duration-200 resize-none',
            error && 'border-error focus:ring-error-container/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-label-sm text-error">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-label-md font-semibold text-on-surface-variant">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 bg-white/60 border border-outline-variant/50 rounded-full text-on-surface',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container/50',
            'transition-all duration-200 appearance-none cursor-pointer',
            error && 'border-error',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-label-sm text-error">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

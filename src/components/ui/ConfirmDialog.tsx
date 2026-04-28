import { useEffect } from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { S } from '../../lib/styles'
import { Portal } from './Portal'

type DialogVariant = 'warning' | 'danger' | 'info' | 'success'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: DialogVariant
  onConfirm: () => void
  onCancel: () => void
}

const VARIANTS = {
  warning: {
    icon: <AlertTriangle size={28} />,
    iconBg: 'rgba(254,243,199,0.9)',
    iconColor: '#b45309',
    confirmStyle: { background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', boxShadow: '0 8px 20px rgba(180,83,9,0.3)' },
  },
  danger: {
    icon: <XCircle size={28} />,
    iconBg: 'rgba(254,202,202,0.9)',
    iconColor: '#b91c1c',
    confirmStyle: { background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', boxShadow: '0 8px 20px rgba(185,28,28,0.3)' },
  },
  info: {
    icon: <Info size={28} />,
    iconBg: 'rgba(219,234,254,0.9)',
    iconColor: '#1d4ed8',
    confirmStyle: { ...S.btnPrimary },
  },
  success: {
    icon: <CheckCircle size={28} />,
    iconBg: 'rgba(220,252,231,0.9)',
    iconColor: '#15803d',
    confirmStyle: { background: 'linear-gradient(135deg, #22c55e, #15803d)', color: '#fff', boxShadow: '0 8px 20px rgba(21,128,61,0.3)' },
  },
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  /* Lock body scroll & handle Escape */
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter')  onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onCancel, onConfirm])

  if (!isOpen) return null

  const v = VARIANTS[variant]

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in"
        style={S.modalOverlay}
        onClick={onCancel}
      >
        {/* Ambient glow */}
        <div className="absolute w-80 h-80 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(177,156,217,0.3) 0%, transparent 70%)', filter: 'blur(60px)', top: '20%', left: '35%' }} />

        {/* Dialog card */}
        <div
          className="relative w-full max-w-sm rounded-[28px] overflow-hidden animate-fade-in-scale"
          style={{ ...S.glassPanel, boxShadow: '0 24px 60px rgba(103,85,140,0.25)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full"
               style={{ background: 'linear-gradient(90deg, #67558c 0%, #864d61 50%, #30628a 100%)' }} />

          <div className="p-7">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto"
                 style={{ background: v.iconBg, color: v.iconColor }}>
              {v.icon}
            </div>

            {/* Text */}
            <h3 className="text-xl font-black text-center mb-2" style={S.onSurface}>{title}</h3>
            <p className="text-sm text-center leading-relaxed" style={S.muted}>{message}</p>

            {/* Actions */}
            <div className="flex gap-3 mt-7">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer transition-all duration-200"
                style={S.btnOutline}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer transition-all duration-200"
                style={v.confirmStyle}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                {confirmLabel}
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-[10px] text-center mt-3" style={{ color: 'var(--c-outline)', opacity: 0.7 }}>
              Enter para confirmar · Esc para cancelar
            </p>
          </div>
        </div>
      </div>
    </Portal>
  )
}

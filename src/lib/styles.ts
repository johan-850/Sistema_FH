/* Reusable style presets using var(--c-*) tokens */
export const S = {
  /* Backgrounds */
  glassCard: {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.6)',
    boxShadow: 'var(--shadow-card)',
  } as React.CSSProperties,

  glassPanel: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: 'var(--shadow-glass)',
  } as React.CSSProperties,

  modalOverlay: {
    background: 'rgba(29,27,31,0.45)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  } as React.CSSProperties,

  /* Buttons */
  btnPrimary: {
    background: 'linear-gradient(135deg, #67558c 0%, #7a6aa0 100%)',
    color: '#ffffff',
    boxShadow: 'var(--shadow-primary)',
  } as React.CSSProperties,

  btnOutline: {
    background: 'rgba(255,255,255,0.5)',
    border: '1.5px solid var(--c-outline-var)',
    color: 'var(--c-on-surface)',
  } as React.CSSProperties,

  btnDanger: {
    background: '#ba1a1a',
    color: '#ffffff',
  } as React.CSSProperties,

  /* Colors */
  primary:     { color: 'var(--c-primary)' }     as React.CSSProperties,
  secondary:   { color: 'var(--c-secondary)' }   as React.CSSProperties,
  onSurface:   { color: 'var(--c-on-surface)' }  as React.CSSProperties,
  muted:       { color: 'var(--c-on-surface-var)' } as React.CSSProperties,
  outline:     { color: 'var(--c-outline)' }      as React.CSSProperties,
  error:       { color: 'var(--c-error)' }        as React.CSSProperties,

  /* Input */
  input: {
    background: 'rgba(255,255,255,0.65)',
    border: '1.5px solid var(--c-outline-var)',
    color: 'var(--c-on-surface)',
    borderRadius: '9999px',
    outline: 'none',
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
  } as React.CSSProperties,

  textarea: {
    background: 'rgba(255,255,255,0.65)',
    border: '1.5px solid var(--c-outline-var)',
    color: 'var(--c-on-surface)',
    borderRadius: '16px',
    outline: 'none',
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
    resize: 'none',
  } as React.CSSProperties,

  /* Chip states */
  chipAvailable: {
    background: 'var(--c-tertiary-fixed)',
    color: 'var(--c-on-tertiary-fixed)',
  } as React.CSSProperties,

  chipOccupied: {
    background: 'var(--c-secondary-fixed)',
    color: 'var(--c-secondary)',
  } as React.CSSProperties,

  /* Tags */
  tagPrimary: {
    background: 'rgba(235,221,255,0.7)',
    color: 'var(--c-primary)',
    borderRadius: '9999px',
    padding: '2px 12px',
    fontSize: '12px',
    fontWeight: 600,
  } as React.CSSProperties,

  tagSuccess: {
    background: 'rgba(220,252,231,0.8)',
    color: '#15803d',
    borderRadius: '9999px',
    padding: '2px 12px',
    fontSize: '12px',
    fontWeight: 600,
  } as React.CSSProperties,

  tagWarning: {
    background: 'rgba(254,243,199,0.8)',
    color: '#b45309',
    borderRadius: '9999px',
    padding: '2px 12px',
    fontSize: '12px',
    fontWeight: 600,
  } as React.CSSProperties,

  tagDanger: {
    background: 'var(--c-error-container)',
    color: 'var(--c-on-error-container)',
    borderRadius: '9999px',
    padding: '2px 12px',
    fontSize: '12px',
    fontWeight: 600,
  } as React.CSSProperties,
}

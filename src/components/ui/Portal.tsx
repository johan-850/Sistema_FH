import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps { children: React.ReactNode }

/**
 * Renders children directly into document.body, escaping any stacking
 * context created by layout parents (backdropFilter, transform, etc.)
 */
export function Portal({ children }: PortalProps) {
  const [el] = useState<HTMLDivElement>(() => document.createElement('div'))

  useEffect(() => {
    document.body.appendChild(el)
    return () => { document.body.removeChild(el) }
  }, [el])

  return createPortal(children, el)
}

import { Navigate, useLocation } from 'react-router-dom'
import { useCashRegisterStore } from '../../stores/cashRegisterStore'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface Props {
  children: React.ReactNode
}

export function RequireOpenRegister({ children }: Props) {
  const { currentSession } = useCashRegisterStore()
  const location = useLocation()
  
  const isOpen = currentSession?.status === 'open'

  useEffect(() => {
    if (!isOpen) {
      toast.error('Debes abrir la caja antes de usar este módulo')
    }
  }, [isOpen])

  if (!isOpen) {
    // Redirect to the open register page, but keep the intended destination in state
    return <Navigate to="/cashier/open" state={{ from: location }} replace />
  }

  return <>{children}</>
}

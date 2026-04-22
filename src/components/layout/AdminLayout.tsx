import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AdminLayout() {
  return (
    <div className="min-h-screen flex" style={{ background:'var(--c-background)' }}>
      <Sidebar role="admin" />
      <TopBar />
      <main className="flex-1 pt-24 pb-10 px-8" style={{ marginLeft:'256px' }}>
        <Outlet />
      </main>
    </div>
  )
}

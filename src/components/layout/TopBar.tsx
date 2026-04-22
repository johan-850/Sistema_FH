import { Search, Bell, User } from 'lucide-react'

export function TopBar() {
  return (
    <header className="fixed top-0 right-0 z-30 flex items-center gap-4 px-6 py-3"
            style={{ left:'256px', background:'rgba(255,255,255,0.45)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderRadius:'0 0 24px 24px', borderBottom:'1px solid rgba(255,255,255,0.5)', boxShadow:'0 4px 20px rgba(177,156,217,0.1)' }}>
      {/* Brand */}
      <span className="text-lg font-black" style={{ background:'linear-gradient(135deg,#67558c,#864d61)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        GelatoFlow
      </span>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full"
             style={{ background:'rgba(255,255,255,0.6)', border:'1.5px solid rgba(203,196,208,0.5)' }}>
          <Search size={15} style={{ color:'#7a757f' }}/>
          <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Buscar órdenes, productos..." style={{ color:'#1d1b1f' }}/>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-auto">
        <button className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/70 relative" style={{ color:'#49454f' }}>
          <Bell size={18}/>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background:'var(--c-error)' }}/>
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/70" style={{ color:'#67558c' }}>
          <User size={20}/>
        </button>
      </div>
    </header>
  )
}

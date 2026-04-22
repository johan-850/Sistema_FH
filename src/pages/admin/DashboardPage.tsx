import { DollarSign, ShoppingBag, BarChart3, Star, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard } from '../../components/ui/Card'
import { formatCurrency } from '../../lib/utils'

const salesTrend = [
  { day: 'Lun', ventas: 3200 }, { day: 'Mar', ventas: 2800 }, { day: 'Mié', ventas: 4100 },
  { day: 'Jue', ventas: 3600 }, { day: 'Vie', ventas: 5200 }, { day: 'Sáb', ventas: 6800 }, { day: 'Dom', ventas: 4250 },
]
const revenueMix = [
  { name: 'Helados', value: 65, color: '#67558c' },
  { name: 'Bebidas', value: 25, color: '#fdb5cc' },
  { name: 'Postres', value: 10, color: '#30628a' },
]
const topProducts = [
  { name: 'Fresa Suprema', sold: 142, revenue: 639 },
  { name: 'Choco Oscuro', sold: 128, revenue: 640 },
  { name: 'Menta Fresca', sold: 95, revenue: 427.5 },
  { name: 'Vainilla Clásica', sold: 88, revenue: 352 },
  { name: 'Mora Salvaje', sold: 76, revenue: 361 },
]
const recentOrders = [
  { id: '#0042', table: 'T2', total: 15.12, time: '14:32' },
  { id: '#0041', table: 'T5', total: 28.50, time: '14:15' },
  { id: '#0040', table: 'T1', total: 12.00, time: '13:58' },
  { id: '#0039', table: 'T4', total: 45.90, time: '13:40' },
  { id: '#0038', table: 'T3', total: 22.75, time: '13:22' },
]

const tooltipStyle = {
  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.6)', borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(177,156,217,0.15)',
}

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-headline-lg font-bold text-on-background mb-2">Dashboard</h2>
        <p className="text-body-md text-on-surface-variant">Bienvenido. Así va GelatoFlow hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-children">
        <StatCard title="Ventas del Día" value={formatCurrency(4250)} icon={<DollarSign size={22} />} trend={{ value: '+12%', positive: true }} color="primary" />
        <StatCard title="Órdenes" value="342" icon={<ShoppingBag size={22} />} trend={{ value: '+5%', positive: true }} color="secondary" />
        <StatCard title="Ticket Promedio" value={formatCurrency(12.40)} icon={<BarChart3 size={22} />} trend={{ value: '0%', positive: true }} color="tertiary" />
        <div className="bg-surface/60 backdrop-blur-xl border border-white/50 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container/40 rounded-full blur-xl" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-primary-fixed/50 text-primary rounded-full"><Star size={22} /></div>
          </div>
          <div className="relative z-10">
            <p className="text-label-md text-on-surface-variant mb-1">Top Sabor</p>
            <p className="text-headline-md font-semibold text-on-background">Fresa Suprema</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-surface/60 backdrop-blur-xl border border-white/50 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-headline-md font-semibold text-on-background">Tendencia de Ventas</h3>
            <select className="bg-surface-container rounded-full border-none text-sm text-on-surface py-1.5 pl-3 pr-8 font-semibold cursor-pointer">
              <option>Esta Semana</option><option>Semana Pasada</option><option>Este Mes</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesTrend}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#67558c" stopOpacity={0.3} /><stop offset="95%" stopColor="#67558c" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e1e6" />
              <XAxis dataKey="day" stroke="#7a757f" fontSize={12} />
              <YAxis stroke="#7a757f" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Ventas']} />
              <Area type="monotone" dataKey="ventas" stroke="#67558c" strokeWidth={3} fill="url(#sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-surface/60 backdrop-blur-xl border border-white/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-headline-md font-semibold text-on-background mb-4">Mix de Ingresos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={revenueMix} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">{revenueMix.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} /></PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-2">{revenueMix.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: item.color }} /><span className="text-on-surface">{item.name}</span></div>
              <span className="font-semibold text-on-background">{item.value}%</span>
            </div>))}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface/60 backdrop-blur-xl border border-white/50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4"><h3 className="text-headline-md font-semibold text-on-background">Productos Top</h3><TrendingUp size={20} className="text-primary" /></div>
          <div className="space-y-3">{topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/40 transition-colors">
              <span className="w-8 h-8 rounded-full bg-primary-container/30 text-primary flex items-center justify-center text-sm font-bold">{i + 1}</span>
              <div className="flex-1"><p className="text-sm font-semibold text-on-surface">{p.name}</p><p className="text-xs text-outline">{p.sold} vendidos</p></div>
              <span className="text-sm font-bold text-primary">{formatCurrency(p.revenue)}</span>
            </div>))}</div>
        </div>
        <div className="bg-surface/60 backdrop-blur-xl border border-white/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-headline-md font-semibold text-on-background mb-4">Órdenes Recientes</h3>
          <div className="space-y-3">{recentOrders.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 transition-colors">
              <div className="flex items-center gap-3"><span className="bg-primary-fixed/40 text-primary text-xs font-bold px-3 py-1 rounded-full">{o.table}</span><div><p className="text-sm font-semibold text-on-surface">Orden {o.id}</p><p className="text-xs text-outline">{o.time}</p></div></div>
              <div className="text-right"><p className="text-sm font-bold text-on-surface">{formatCurrency(o.total)}</p><span className="text-xs text-green-600 font-semibold">✓ Completada</span></div>
            </div>))}</div>
        </div>
      </div>
    </div>
  )
}

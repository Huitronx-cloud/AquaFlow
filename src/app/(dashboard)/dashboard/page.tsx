import { createClient } from '@/lib/supabase/server'
import { formatMXN, formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: appUser } = await supabase
    .from('app_users')
    .select('org_id')
    .eq('id', user!.id)
    .single()

  const orgId = appUser?.org_id
  const today = new Date().toISOString().split('T')[0]

  const [ordersRes, customersRes, shiftsRes] = await Promise.all([
    supabase.from('orders').select('id, status, total_mxn, garrafones').eq('org_id', orgId!).eq('fecha', today),
    supabase.from('customers').select('id, status').eq('org_id', orgId!),
    supabase.from('shifts').select('id, turno, status').eq('fecha', today),
  ])

  const orders = ordersRes.data || []
  const customers = customersRes.data || []
  const shifts = shiftsRes.data || []

  const ventasHoy = orders.reduce((sum, o) => sum + (o.total_mxn || 0), 0)
  const garrafonesHoy = orders.reduce((sum, o) => sum + (o.garrafones || 0), 0)
  const pedidosPendientes = orders.filter(o => ['pendiente','confirmado'].includes(o.status)).length
  const pedidosEntregados = orders.filter(o => o.status === 'entregado').length
  const clientesActivos = customers.filter(c => c.status === 'activo').length
  const clientesMorosos = customers.filter(c => c.status === 'moroso').length

  const stats = [
    { label: 'Ventas hoy', value: formatMXN(ventasHoy), sub: `${garrafonesHoy} garrafones`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '💰' },
    { label: 'Pedidos del día', value: String(orders.length), sub: `${pedidosEntregados} entregados · ${pedidosPendientes} pendientes`, color: 'text-sky-600', bg: 'bg-sky-50', icon: '📦' },
    { label: 'Clientes activos', value: String(clientesActivos), sub: clientesMorosos > 0 ? `${clientesMorosos} con saldo pendiente` : 'Sin cuentas vencidas', color: 'text-violet-600', bg: 'bg-violet-50', icon: '👥' },
    { label: 'Turnos hoy', value: String(shifts.length), sub: `${shifts.filter(s => s.status === 'completado').length} completados`, color: 'text-amber-600', bg: 'bg-amber-50', icon: '📋' },
  ]

  const statusMap: Record<string, { label: string; className: string }> = {
    pendiente:  { label: 'Pendiente',  className: 'bg-slate-100 text-slate-500' },
    confirmado: { label: 'Confirmado', className: 'bg-sky-100 text-sky-700' },
    en_camino:  { label: 'En camino',  className: 'bg-amber-100 text-amber-700' },
    entregado:  { label: 'Entregado',  className: 'bg-emerald-100 text-emerald-700' },
    cancelado:  { label: 'Cancelado',  className: 'bg-red-100 text-red-600' },
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Buen día 👋</h1>
        <p className="text-sm text-slate-500 mt-0.5">{formatDate(new Date())} — resumen de hoy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center text-base mb-3`}>{stat.icon}</div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-medium text-slate-700 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Turnos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Bitácora de hoy</h2>
            <Link href="/bitacora" className="text-xs text-sky-600 hover:text-sky-700 font-medium">Ver todo →</Link>
          </div>
          {shifts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-3">No hay turnos registrados hoy</p>
              <Link href="/bitacora" className="inline-flex bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
                Registrar turno
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2].map(turno => {
                const shift = shifts.find((s: any) => s.turno === turno)
                return (
                  <div key={turno} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${turno === 1 ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{turno}°</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{turno === 1 ? 'Primer turno' : 'Segundo turno'}</p>
                      <p className="text-xs text-slate-400">{turno === 1 ? '6:00 – 14:00' : '14:00 – 22:00'}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${shift ? (shift.status === 'completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700') : 'bg-slate-100 text-slate-400'}`}>
                      {shift ? (shift.status === 'completado' ? 'Completado' : 'En progreso') : 'Sin registrar'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pedidos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Pedidos de hoy</h2>
            <Link href="/pedidos" className="text-xs text-sky-600 hover:text-sky-700 font-medium">Ver todo →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-3">No hay pedidos registrados hoy</p>
              <Link href="/pedidos" className="inline-flex bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
                Nuevo pedido
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 4).map((order: any) => {
                const s = statusMap[order.status] || statusMap.pendiente
                return (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sm">💧</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{order.garrafones} garrafón{order.garrafones !== 1 ? 'es' : ''}</p>
                      <p className="text-xs text-slate-400">{formatMXN(order.total_mxn)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${s.className}`}>{s.label}</span>
                  </div>
                )
              })}
              {orders.length > 4 && <p className="text-xs text-center text-slate-400 pt-1">+{orders.length - 4} pedidos más</p>}
            </div>
          )}
        </div>

        {/* Alerta morosos */}
        {clientesMorosos > 0 && (
          <div className="lg:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-base shrink-0">⚠️</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">{clientesMorosos} cliente{clientesMorosos !== 1 ? 's' : ''} con saldo pendiente</p>
              <p className="text-xs text-amber-600 mt-0.5">Revisa la sección de cobros para enviar recordatorios</p>
            </div>
            <Link href="/cobros" className="text-xs font-medium text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition shrink-0">
              Ver cobros
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

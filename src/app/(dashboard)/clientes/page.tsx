'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [orgId, setOrgId] = useState('')
  const [locationId, setLocationId] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: appUser } = await supabase
        .from('app_users')
        .select('org_id')
        .eq('id', session.user.id)
        .single()
      if (!appUser) { setLoading(false); return }
      setOrgId(appUser.org_id)

      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .eq('org_id', appUser.org_id)
        .single()
      if (location) setLocationId(location.id)

      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('org_id', appUser.org_id)
        .order('name')
      setClientes(data || [])
      setLoading(false)
    })
  }, [])

  const clientesFiltrados = clientes.filter(c =>
    c.name.toLowerCase().includes(busqueda.toLowerCase())
  )

  const statusConfig: Record<string, { label: string; className: string }> = {
    activo:     { label: 'Activo',     className: 'bg-emerald-100 text-emerald-700' },
    suspendido: { label: 'Suspendido', className: 'bg-slate-100 text-slate-500' },
    moroso:     { label: 'Moroso',     className: 'bg-red-100 text-red-600' },
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 text-sm">Cargando...</div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clientes.length} clientes registrados</p>
        </div>
        <Link
          href={`/clientes/nuevo?location=${locationId}&org=${orgId}`}
          className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Nuevo cliente
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Lista */}
      {clientesFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm mb-4">
            {busqueda ? 'No se encontraron clientes con ese nombre' : 'No hay clientes registrados'}
          </p>
          {!busqueda && (
            <Link
              href={`/clientes/nuevo?location=${locationId}&org=${orgId}`}
              className="inline-flex bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Agregar primer cliente
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {clientesFiltrados.map((cliente, i) => {
            const s = statusConfig[cliente.status] || statusConfig.activo
            return (
              <Link
                key={cliente.id}
                href={`/clientes/${cliente.id}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition ${i !== 0 ? 'border-t border-slate-100' : ''}`}
              >
                <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-sky-700">
                    {cliente.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{cliente.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {cliente.phone}
                    {cliente.colonia ? ` · ${cliente.colonia}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {cliente.saldo_pendiente > 0 && (
                    <span className="text-xs font-medium text-red-600">
                      ${cliente.saldo_pendiente} pendiente
                    </span>
                  )}
                  {cliente.garrafones_prestados > 0 && (
                    <span className="text-xs text-slate-500">
                      {cliente.garrafones_prestados} garrafón{cliente.garrafones_prestados !== 1 ? 'es' : ''}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.className}`}>
                    {s.label}
                  </span>
                  <span className="text-slate-300 text-sm">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Resumen */}
      {clientes.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Activos', value: clientes.filter(c => c.status === 'activo').length, color: 'text-emerald-600' },
            { label: 'Morosos', value: clientes.filter(c => c.status === 'moroso').length, color: 'text-red-600' },
            { label: 'Suspendidos', value: clientes.filter(c => c.status === 'suspendido').length, color: 'text-slate-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
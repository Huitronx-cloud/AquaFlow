'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BitacoraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [shifts, setShifts] = useState<any[]>([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: appUser } = await supabase
        .from('app_users')
        .select('org_id, location_id')
        .eq('id', session.user.id)
        .single()
      if (!appUser) { setLoading(false); return }
      setOrgId(appUser.org_id)

      // Obtener el primer local
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .eq('org_id', appUser.org_id)
        .single()
      if (location) setLocationId(location.id)

      await loadShifts(supabase, appUser.org_id, fecha)
      setLoading(false)
    })
  }, [])

  async function loadShifts(supabase: any, orgId: string, date: string) {
    const { data } = await supabase
      .from('shifts')
      .select('*, app_users(name)')
      .eq('fecha', date)
      .order('turno')
    setShifts(data || [])
  }

  async function handleFechaChange(newFecha: string) {
    setFecha(newFecha)
    const supabase = createClient()
    await loadShifts(supabase, orgId, newFecha)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-400 text-sm">Cargando...</div></div>

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Bitácora</h1>
          <p className="text-sm text-slate-500 mt-0.5">Registro de operaciones por turno</p>
        </div>
        {locationId && (
          <Link href={`/bitacora/nuevo?fecha=${fecha}&location=${locationId}`}
            className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Nuevo turno
          </Link>
        )}
      </div>

      {/* Selector de fecha */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={e => handleFechaChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {fecha !== today && (
          <button onClick={() => handleFechaChange(today)}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium">
            Ir a hoy
          </button>
        )}
      </div>

      {/* Turnos */}
      {shifts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm mb-4">No hay turnos registrados para esta fecha</p>
          {locationId && (
            <Link href={`/bitacora/nuevo?fecha=${fecha}&location=${locationId}`}
              className="inline-flex bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              Registrar primer turno
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <Link key={shift.id} href={`/bitacora/${shift.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-sky-200 hover:shadow-sm transition">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${shift.turno === 1 ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                  {shift.turno}°
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {shift.turno === 1 ? 'Primer turno' : 'Segundo turno'}
                    <span className="text-slate-400 font-normal ml-2">
                      {shift.turno === 1 ? '6:00 – 14:00' : '14:00 – 22:00'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {shift.app_users?.name || 'Sin asignar'}
                    {shift.hora_llegada && ` · Llegó a las ${shift.hora_llegada.substring(0,5)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {shift.caja_chica && (
                    <span className="text-xs text-slate-500">
                      Caja: ${shift.caja_chica}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${shift.status === 'completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {shift.status === 'completado' ? 'Completado' : 'En progreso'}
                  </span>
                  <span className="text-slate-300">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Resumen del día */}
      {shifts.length > 0 && (
        <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 mb-3">Resumen del día</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {shifts.reduce((sum, s) => sum + (s.garrafones_llenados || 0), 0)}
              </p>
              <p className="text-xs text-slate-500">Garrafones llenados</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                ${shifts.reduce((sum, s) => sum + (s.total_ventas || 0), 0).toLocaleString('es-MX')}
              </p>
              <p className="text-xs text-slate-500">Ventas totales</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {shifts.filter(s => s.status === 'completado').length}/{shifts.length}
              </p>
              <p className="text-xs text-slate-500">Turnos completados</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
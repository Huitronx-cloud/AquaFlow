'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function BitacoraDetallePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [shift, setShift] = useState<any>(null)
  const [containers, setContainers] = useState<any[]>([])
  const [cleaningTasks, setCleaningTasks] = useState<any[]>([])
  const [equipmentChecks, setEquipmentChecks] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }

      const [shiftRes, containersRes, tasksRes, equipRes] = await Promise.all([
        supabase.from('shifts').select('*, app_users(name), locations(name)').eq('id', id).single(),
        supabase.from('shift_containers').select('*').eq('shift_id', id),
        supabase.from('shift_cleaning_tasks').select('*').eq('shift_id', id),
        supabase.from('shift_equipment_checks').select('*').eq('shift_id', id),
      ])

      setShift(shiftRes.data)
      setContainers(containersRes.data || [])
      setCleaningTasks(tasksRes.data || [])
      setEquipmentChecks(equipRes.data || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-400 text-sm">Cargando...</div></div>
  if (!shift) return <div className="flex items-center justify-center h-64"><div className="text-slate-400 text-sm">Turno no encontrado</div></div>

  const fecha = new Date(shift.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  function Row({ label, value }: { label: string; value: any }) {
    if (!value && value !== 0 && value !== false) return null
    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-sm font-medium text-slate-800">{String(value)}</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/bitacora" className="text-slate-400 hover:text-slate-600 transition">←</Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">
            {shift.turno === 1 ? 'Primer turno' : 'Segundo turno'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{fecha}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${shift.status === 'completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {shift.status === 'completado' ? 'Completado' : 'En progreso'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Info general */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Información del turno</h2>
          <Row label="Supervisora" value={shift.app_users?.name} />
          <Row label="Local" value={shift.locations?.name} />
          <Row label="Hora de llegada" value={shift.hora_llegada?.substring(0,5)} />
          <Row label="Caja chica" value={shift.caja_chica ? `$${shift.caja_chica}` : null} />
          <Row label="No. de remisión" value={shift.no_remision} />
        </div>

        {/* Lecturas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Lecturas del contador</h2>
          <Row label="Lectura inicial" value={shift.lectura_inicial} />
          <Row label="Lectura final" value={shift.lectura_final} />
          {shift.lectura_inicial && shift.lectura_final && (
            <Row label="Litros procesados" value={shift.lectura_final - shift.lectura_inicial} />
          )}
          <Row label="1er cambio filtro — real" value={shift.lectura_filtro_1_real} />
          <Row label="1er cambio filtro — próximo" value={shift.lectura_filtro_1_proximo} />
          <Row label="2do cambio filtro — real" value={shift.lectura_filtro_2_real} />
          <Row label="2do cambio filtro — próximo" value={shift.lectura_filtro_2_proximo} />
        </div>

        {/* Envases */}
        {containers.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Control de envases</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-xs font-medium text-slate-500">Envase</th>
                  <th className="text-center py-2 text-xs font-medium text-slate-500">Llenos</th>
                  <th className="text-center py-2 text-xs font-medium text-slate-500">Vacíos</th>
                  <th className="text-center py-2 text-xs font-medium text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {containers.map(c => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700 capitalize">{c.tipo.replace(/_/g, ' ')}</td>
                    <td className="py-2 text-center text-slate-700">{c.llenos}</td>
                    <td className="py-2 text-center text-slate-700">{c.vacios}</td>
                    <td className="py-2 text-center font-medium text-slate-900">{c.llenos + c.vacios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
              <Row label="Garrafones llenados" value={shift.garrafones_llenados} />
              <Row label="Total ventas" value={shift.total_ventas ? `$${shift.total_ventas}` : null} />
            </div>
          </div>
        )}

        {/* Limpieza */}
        {cleaningTasks.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Limpieza — {cleaningTasks.filter(t => t.completado).length}/{cleaningTasks.length} tareas
            </h2>
            <div className="space-y-1.5">
              {cleaningTasks.map(task => (
                <div key={task.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${task.completado ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${task.completado ? 'bg-emerald-500' : 'border border-slate-300'}`}>
                    {task.completado && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-xs ${task.completado ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {task.task_key.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipos */}
        {equipmentChecks.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Revisión de equipos</h2>
            <div className="space-y-2">
              {equipmentChecks.map(eq => (
                <div key={eq.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-xs text-slate-700">{eq.equipo_key.replace(/_/g, ' ')}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${eq.status === 'ok' ? 'bg-emerald-100 text-emerald-700' : eq.status === 'alerta' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {eq.status === 'ok' ? '✓ OK' : eq.status === 'alerta' ? '⚠ Alerta' : '✕ Falla'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Otros */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Otros registros</h2>
          <Row label="Jabón sanitizador" value={shift.jabon_nivel} />
          <Row label="Próximo cambio jabón" value={shift.jabon_proximo_cambio} />
          <Row label="¿Se cloraron tanques?" value={shift.se_cloraron_tanques === true ? 'Sí' : shift.se_cloraron_tanques === false ? 'No' : null} />
          <Row label="Hora ozono" value={shift.ozono_hora?.substring(0,5)} />
          <Row label="Minutos ozono" value={shift.ozono_minutos} />
          {shift.observaciones && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Observaciones</p>
              <p className="text-sm text-slate-700">{shift.observaciones}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
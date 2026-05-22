'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function NuevoTurnoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]
  const locationId = searchParams.get('location') || ''

  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [tab, setTab] = useState<'caja' | 'envases' | 'limpieza' | 'equipos' | 'obs'>('caja')

  const [form, setForm] = useState({
    turno: 1,
    hora_llegada: '',
    caja_chica: '',
    lectura_inicial: '',
    lectura_final: '',
    lectura_filtro_1_real: '',
    lectura_filtro_1_proximo: '',
    lectura_filtro_2_real: '',
    lectura_filtro_2_proximo: '',
    jabon_nivel: '',
    jabon_proximo_cambio: '',
    no_remision: '',
    se_cloraron_tanques: null as boolean | null,
    ozono_hora: '',
    ozono_minutos: '',
    garrafones_llenados: '',
    total_ventas: '',
    observaciones: '',
  })

  const [envases, setEnvases] = useState({
    garrafon_20l_llenos: '', garrafon_20l_vacios: '',
    botella_1l_llenos: '', botella_1l_vacios: '',
    botella_250ml_llenos: '', botella_250ml_vacios: '',
  })

  const tareas = [
    { key: 'barrer_banqueta', label: 'Barrer banqueta y calle' },
    { key: 'canceleria', label: 'Limpieza de cancelería y vidrios' },
    { key: 'boquillas', label: 'Desinfección de boquillas de llenado' },
    { key: 'tapas_liners', label: 'Limpiar tapas y colocar liners' },
    { key: 'limpiar_wc', label: 'Limpiar WC' },
    { key: 'barrer_interior', label: 'Barrer y trapear área interior' },
    { key: 'limpiar_tinas', label: 'Limpieza debajo de las tinas' },
    { key: 'ozono_tqe', label: 'Revisar que TQE huela a ozono' },
  ]

  const equipos = [
    { key: 'osmosis_filtros', label: 'Osmosis inversa y cab. filtros' },
    { key: 'bomba_hidroneum', label: 'Bomba de hidroneumático' },
    { key: 'bomba_agua_purif', label: 'Bomba de agua purificada' },
    { key: 'bomba_sanitizado', label: 'Bomba de sanitizado' },
  ]

  const [tareasCheck, setTareasCheck] = useState<Record<string, boolean>>({})
  const [equiposCheck, setEquiposCheck] = useState<Record<string, 'ok' | 'alerta' | null>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setUserId(session.user.id)
    })
  }, [])

  function updateForm(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(status: 'borrador' | 'completado') {
    if (!userId || !locationId) return
    setSaving(true)
    const supabase = createClient()

    const { data: shift, error } = await supabase.from('shifts').insert({
      location_id: locationId,
      user_id: userId,
      turno: form.turno,
      fecha,
      hora_llegada: form.hora_llegada || null,
      caja_chica: form.caja_chica ? parseFloat(form.caja_chica) : null,
      lectura_inicial: form.lectura_inicial ? parseFloat(form.lectura_inicial) : null,
      lectura_final: form.lectura_final ? parseFloat(form.lectura_final) : null,
      lectura_filtro_1_real: form.lectura_filtro_1_real ? parseFloat(form.lectura_filtro_1_real) : null,
      lectura_filtro_1_proximo: form.lectura_filtro_1_proximo ? parseFloat(form.lectura_filtro_1_proximo) : null,
      lectura_filtro_2_real: form.lectura_filtro_2_real ? parseFloat(form.lectura_filtro_2_real) : null,
      lectura_filtro_2_proximo: form.lectura_filtro_2_proximo ? parseFloat(form.lectura_filtro_2_proximo) : null,
      jabon_nivel: form.jabon_nivel || null,
      jabon_proximo_cambio: form.jabon_proximo_cambio || null,
      no_remision: form.no_remision || null,
      se_cloraron_tanques: form.se_cloraron_tanques,
      ozono_hora: form.ozono_hora || null,
      ozono_minutos: form.ozono_minutos ? parseInt(form.ozono_minutos) : null,
      garrafones_llenados: form.garrafones_llenados ? parseInt(form.garrafones_llenados) : 0,
      total_ventas: form.total_ventas ? parseFloat(form.total_ventas) : 0,
      observaciones: form.observaciones || null,
      status,
    }).select().single()

    if (error || !shift) { setSaving(false); return }

    // Guardar envases
    const envasesData = [
      { shift_id: shift.id, tipo: 'garrafon_20l', llenos: parseInt(envases.garrafon_20l_llenos) || 0, vacios: parseInt(envases.garrafon_20l_vacios) || 0 },
      { shift_id: shift.id, tipo: 'botella_1l', llenos: parseInt(envases.botella_1l_llenos) || 0, vacios: parseInt(envases.botella_1l_vacios) || 0 },
      { shift_id: shift.id, tipo: 'botella_250ml', llenos: parseInt(envases.botella_250ml_llenos) || 0, vacios: parseInt(envases.botella_250ml_vacios) || 0 },
    ]
    await supabase.from('shift_containers').insert(envasesData)

    // Guardar tareas
    const tareasData = Object.entries(tareasCheck).map(([key, completado]) => ({
      shift_id: shift.id, task_key: key, completado,
      completado_at: completado ? new Date().toISOString() : null,
    }))
    if (tareasData.length > 0) await supabase.from('shift_cleaning_tasks').insert(tareasData)

    // Guardar equipos
    const equiposData = Object.entries(equiposCheck).filter(([, v]) => v).map(([key, status]) => ({
      shift_id: shift.id, equipo_key: key, status,
    }))
    if (equiposData.length > 0) await supabase.from('shift_equipment_checks').insert(equiposData)

    router.push('/bitacora')
  }

  const tabs = [
    { key: 'caja', label: 'Caja y lecturas' },
    { key: 'envases', label: 'Envases' },
    { key: 'limpieza', label: 'Limpieza' },
    { key: 'equipos', label: 'Equipos' },
    { key: 'obs', label: 'Observaciones' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 transition">←</button>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Nuevo turno</h1>
          <p className="text-sm text-slate-500 mt-0.5">{new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* Selector de turno */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Turno:</span>
        {[1, 2].map(t => (
          <button key={t} onClick={() => updateForm('turno', t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${form.turno === t ? (t === 1 ? 'bg-sky-500 text-white' : 'bg-amber-500 text-white') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t === 1 ? '1° Turno (6:00–14:00)' : '2° Turno (14:00–22:00)'}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${tab === t.key ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* CAJA Y LECTURAS */}
          {tab === 'caja' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Hora de llegada</label>
                  <input type="time" value={form.hora_llegada} onChange={e => updateForm('hora_llegada', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Caja chica ($)</label>
                  <input type="number" placeholder="0.00" value={form.caja_chica} onChange={e => updateForm('caja_chica', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Lecturas del contador</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Lectura inicial</label>
                  <input type="number" placeholder="ej. 12450" value={form.lectura_inicial} onChange={e => updateForm('lectura_inicial', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Lectura final</label>
                  <input type="number" placeholder="ej. 12620" value={form.lectura_final} onChange={e => updateForm('lectura_final', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Cambios de filtro</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">1er cambio — lectura real</label>
                  <input type="number" value={form.lectura_filtro_1_real} onChange={e => updateForm('lectura_filtro_1_real', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">1er cambio — próximo</label>
                  <input type="number" value={form.lectura_filtro_1_proximo} onChange={e => updateForm('lectura_filtro_1_proximo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">2do cambio — lectura real</label>
                  <input type="number" value={form.lectura_filtro_2_real} onChange={e => updateForm('lectura_filtro_2_real', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">2do cambio — próximo</label>
                  <input type="number" value={form.lectura_filtro_2_proximo} onChange={e => updateForm('lectura_filtro_2_proximo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Otros</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">No. de remisión</label>
                  <input type="text" placeholder="REM-001" value={form.no_remision} onChange={e => updateForm('no_remision', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Jabón sanitizador — nivel</label>
                  <input type="text" placeholder="ej. 3/4 del envase" value={form.jabon_nivel} onChange={e => updateForm('jabon_nivel', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Ozono — hora</label>
                  <input type="time" value={form.ozono_hora} onChange={e => updateForm('ozono_hora', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Ozono — minutos aplicados</label>
                  <input type="number" placeholder="0" value={form.ozono_minutos} onChange={e => updateForm('ozono_minutos', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">¿Se cloraron los tanques?</label>
                <div className="flex gap-2">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => updateForm('se_cloraron_tanques', v)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${form.se_cloraron_tanques === v ? (v ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {v ? 'Sí' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ENVASES */}
          {tab === 'envases' && (
            <div>
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
                  {[
                    { key: 'garrafon_20l', label: 'Garrafón 20 L' },
                    { key: 'botella_1l', label: 'Botella 1 L' },
                    { key: 'botella_250ml', label: 'Botella 250 ml' },
                  ].map(({ key, label }) => {
                    const llenos = parseInt((envases as any)[`${key}_llenos`]) || 0
                    const vacios = parseInt((envases as any)[`${key}_vacios`]) || 0
                    return (
                      <tr key={key} className="border-b border-slate-100">
                        <td className="py-3 text-slate-700">{label}</td>
                        <td className="py-3 text-center">
                          <input type="number" min="0" value={(envases as any)[`${key}_llenos`]}
                            onChange={e => setEnvases(prev => ({ ...prev, [`${key}_llenos`]: e.target.value }))}
                            className="w-16 text-center px-2 py-1 rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </td>
                        <td className="py-3 text-center">
                          <input type="number" min="0" value={(envases as any)[`${key}_vacios`]}
                            onChange={e => setEnvases(prev => ({ ...prev, [`${key}_vacios`]: e.target.value }))}
                            className="w-16 text-center px-2 py-1 rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </td>
                        <td className="py-3 text-center font-medium text-slate-700">{llenos + vacios}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Garrafones llenados este turno</label>
                  <input type="number" min="0" placeholder="0" value={form.garrafones_llenados} onChange={e => updateForm('garrafones_llenados', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Total ventas del turno ($)</label>
                  <input type="number" min="0" placeholder="0.00" value={form.total_ventas} onChange={e => updateForm('total_ventas', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
            </div>
          )}

          {/* LIMPIEZA */}
          {tab === 'limpieza' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">Marca las tareas completadas en este turno</p>
              {tareas.map(tarea => (
                <button key={tarea.key} onClick={() => setTareasCheck(prev => ({ ...prev, [tarea.key]: !prev[tarea.key] }))}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${tareasCheck[tarea.key] ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${tareasCheck[tarea.key] ? 'bg-emerald-500' : 'border-2 border-slate-300'}`}>
                    {tareasCheck[tarea.key] && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm ${tareasCheck[tarea.key] ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>{tarea.label}</span>
                </button>
              ))}
              <p className="text-xs text-slate-400 pt-2">
                {Object.values(tareasCheck).filter(Boolean).length} de {tareas.length} tareas completadas
              </p>
            </div>
          )}

          {/* EQUIPOS */}
          {tab === 'equipos' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-3">Marca el estado de cada equipo revisado</p>
              {equipos.map(equipo => (
                <div key={equipo.key} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-sm text-slate-700 flex-1">{equipo.label}</span>
                  <div className="flex gap-2">
                    {(['ok', 'alerta', 'falla'] as const).map(status => (
                      <button key={status} onClick={() => setEquiposCheck(prev => ({ ...prev, [equipo.key]: prev[equipo.key] === status ? null : status }))}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${equiposCheck[equipo.key] === status
                          ? status === 'ok' ? 'bg-emerald-500 text-white' : status === 'alerta' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                          : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        {status === 'ok' ? '✓ OK' : status === 'alerta' ? '⚠ Alerta' : '✕ Falla'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OBSERVACIONES */}
          {tab === 'obs' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Observaciones del turno</label>
              <textarea
                value={form.observaciones}
                onChange={e => updateForm('observaciones', e.target.value)}
                placeholder="Anota cualquier incidencia, avería o situación relevante del turno..."
                rows={6}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={() => handleSave('borrador')} disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition disabled:opacity-50">
            Guardar borrador
          </button>
          <button onClick={() => handleSave('completado')} disabled={saving}
            className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium py-2 rounded-lg text-sm transition">
            {saving ? 'Guardando...' : 'Completar turno'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NuevoTurnoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-slate-400 text-sm">Cargando...</div></div>}>
      <NuevoTurnoForm />
    </Suspense>
  )
}
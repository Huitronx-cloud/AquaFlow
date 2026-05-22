'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ClienteDetallePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cliente, setCliente] = useState<any>(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()
      if (data) {
        setCliente(data)
        setForm(data)
      }
      setLoading(false)
    })
  }, [id])

  function update(field: string, value: any) {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('customers')
      .update({
        name: form.name,
        phone: form.phone,
        address: form.address,
        colonia: form.colonia,
        city: form.city,
        frecuencia_dias: form.frecuencia_dias || null,
        garrafones_prestados: form.garrafones_prestados || 0,
        saldo_pendiente: form.saldo_pendiente || 0,
        status: form.status,
        notas: form.notas || null,
      })
      .eq('id', id)

    if (!error) {
      setCliente(form)
      setEditando(false)
    }
    setSaving(false)
  }

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

  if (!cliente) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 text-sm">Cliente no encontrado</div>
    </div>
  )

  const s = statusConfig[cliente.status] || statusConfig.activo

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clientes" className="text-slate-400 hover:text-slate-600 transition">←</Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">{cliente.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{cliente.phone}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${s.className}`}>
          {s.label}
        </span>
        <button
          onClick={() => setEditando(!editando)}
          className="text-sm font-medium text-sky-600 hover:text-sky-700 border border-sky-200 rounded-lg px-3 py-1.5 transition"
        >
          {editando ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {!editando ? (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{cliente.garrafones_prestados}</p>
              <p className="text-xs text-slate-500 mt-0.5">Garrafones prestados</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className={`text-2xl font-bold ${cliente.saldo_pendiente > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                ${cliente.saldo_pendiente}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Saldo pendiente</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {cliente.frecuencia_dias ? `c/${cliente.frecuencia_dias}d` : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Frecuencia</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Información</p>
            {[
              { label: 'Nombre', value: cliente.name },
              { label: 'Teléfono', value: cliente.phone },
              { label: 'Dirección', value: cliente.address },
              { label: 'Colonia', value: cliente.colonia },
              { label: 'Ciudad', value: cliente.city },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-sm text-slate-800">{value}</span>
              </div>
            ) : null)}
            {cliente.notas && (
              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-1">Notas</p>
                <p className="text-sm text-slate-700">{cliente.notas}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {[
            { field: 'name', label: 'Nombre', type: 'text' },
            { field: 'phone', label: 'Teléfono', type: 'tel' },
            { field: 'address', label: 'Calle y número', type: 'text' },
            { field: 'colonia', label: 'Colonia', type: 'text' },
            { field: 'city', label: 'Ciudad', type: 'text' },
          ].map(({ field, label, type }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
              <input
                type={type} value={form[field] || ''}
                onChange={e => update(field, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Frecuencia (días)</label>
              <input
                type="number" min="1" value={form.frecuencia_dias || ''}
                onChange={e => update('frecuencia_dias', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Garrafones prestados</label>
              <input
                type="number" min="0" value={form.garrafones_prestados || 0}
                onChange={e => update('garrafones_prestados', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Saldo pendiente ($)</label>
              <input
                type="number" min="0" value={form.saldo_pendiente || 0}
                onChange={e => update('saldo_pendiente', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Estado</label>
              <select
                value={form.status}
                onChange={e => update('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
                <option value="moroso">Moroso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Notas</label>
            <textarea
              value={form.notas || ''} onChange={e => update('notas', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium py-2 rounded-lg text-sm transition"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  )
}
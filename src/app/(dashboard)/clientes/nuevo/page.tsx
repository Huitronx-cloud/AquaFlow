'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function NuevoClienteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locationId = searchParams.get('location') || ''
  const orgId = searchParams.get('org') || ''

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    colonia: '',
    city: '',
    frecuencia_dias: '',
    garrafones_prestados: '',
    notas: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) return
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase.from('customers').insert({
      org_id: orgId,
      location_id: locationId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      colonia: form.colonia.trim(),
      city: form.city.trim(),
      frecuencia_dias: form.frecuencia_dias ? parseInt(form.frecuencia_dias) : null,
      garrafones_prestados: form.garrafones_prestados ? parseInt(form.garrafones_prestados) : 0,
      notas: form.notas.trim() || null,
      status: 'activo',
      saldo_pendiente: 0,
    })

    if (error) {
      console.error(error)
      setSaving(false)
      return
    }

    router.push('/clientes')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 transition">←</button>
        <h1 className="text-xl font-semibold text-slate-900">Nuevo cliente</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre <span className="text-red-400">*</span></label>
            <input
              type="text" placeholder="Juan García"
              value={form.name} onChange={e => update('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Teléfono <span className="text-red-400">*</span></label>
            <input
              type="tel" placeholder="55 1234 5678"
              value={form.phone} onChange={e => update('phone', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dirección</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Calle y número</label>
              <input
                type="text" placeholder="Av. Insurgentes 123"
                value={form.address} onChange={e => update('address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Colonia</label>
              <input
                type="text" placeholder="Centro"
                value={form.colonia} onChange={e => update('colonia', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Ciudad</label>
              <input
                type="text" placeholder="Ciudad de México"
                value={form.city} onChange={e => update('city', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Servicio</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Frecuencia de entrega (días)</label>
              <input
                type="number" min="1" placeholder="ej. 7"
                value={form.frecuencia_dias} onChange={e => update('frecuencia_dias', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Garrafones prestados</label>
              <input
                type="number" min="0" placeholder="0"
                value={form.garrafones_prestados} onChange={e => update('garrafones_prestados', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Notas</label>
          <textarea
            placeholder="Instrucciones de entrega, referencias, etc."
            value={form.notas} onChange={e => update('notas', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.phone.trim()}
            className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium py-2 rounded-lg text-sm transition"
          >
            {saving ? 'Guardando...' : 'Guardar cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NuevoClientePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-slate-400 text-sm">Cargando...</div></div>}>
      <NuevoClienteForm />
    </Suspense>
  )
}
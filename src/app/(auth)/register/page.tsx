'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    // Paso 1 — cuenta
    email: '',
    password: '',
    name: '',
    // Paso 2 — negocio
    org_name: '',
    phone: '',
    city: '',
    state: '',
  })

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (step === 1) {
      if (form.password.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres')
        return
      }
      setStep(2)
      return
    }

    // Paso 2 — crear cuenta completa
    setLoading(true)
    const supabase = createClient()

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError || !authData.user) {
      toast.error(authError?.message || 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    // 2. Crear organización
    const slug = form.org_name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: form.org_name, slug: `${slug}-${Date.now()}` })
      .select()
      .single()

    if (orgError || !org) {
      toast.error('Error al crear la organización')
      setLoading(false)
      return
    }

    // 3. Crear perfil de usuario
    const { error: userError } = await supabase
      .from('app_users')
      .insert({
        id: authData.user.id,
        org_id: org.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: 'owner',
      })

    if (userError) {
      toast.error('Error al crear el perfil')
      setLoading(false)
      return
    }

    // 4. Crear local principal
    await supabase.from('locations').insert({
      org_id: org.id,
      name: 'Local principal',
      address: '',
      colonia: '',
      city: form.city,
      state: form.state,
    })

    toast.success('¡Cuenta creada! Bienvenido a Aqua Flow')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-slate-900">Aqua Flow</span>
          </div>
          <p className="text-slate-500 text-sm">30 días gratis, sin tarjeta de crédito.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">

          {/* Steps */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 1 ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
            <div className={`flex-1 h-px ${step >= 2 ? 'bg-sky-500' : 'bg-slate-200'}`} />
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 2 ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
          </div>

          <h1 className="text-lg font-semibold text-slate-900 mb-1">
            {step === 1 ? 'Crea tu cuenta' : 'Datos de tu purificadora'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {step === 1 ? 'Ingresa tus datos personales' : 'Información de tu negocio'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tu nombre</label>
                  <input
                    type="text" required placeholder="Juan García"
                    value={form.name} onChange={e => updateForm('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                  <input
                    type="email" required placeholder="hola@mipurificadora.com"
                    value={form.email} onChange={e => updateForm('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                  <input
                    type="password" required placeholder="Mínimo 8 caracteres"
                    value={form.password} onChange={e => updateForm('password', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de tu purificadora</label>
                  <input
                    type="text" required placeholder="Purificadora El Manantial"
                    value={form.org_name} onChange={e => updateForm('org_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                  <input
                    type="tel" required placeholder="55 1234 5678"
                    value={form.phone} onChange={e => updateForm('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Ciudad</label>
                    <input
                      type="text" required placeholder="Ciudad de México"
                      value={form.city} onChange={e => updateForm('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
                    <select
                      required value={form.state} onChange={e => updateForm('state', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">Selecciona</option>
                      {['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','CDMX','Coahuila','Colima','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Estado de México','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-1">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm hover:bg-slate-50 transition">
                  Atrás
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium py-2.5 rounded-lg text-sm transition">
                {loading ? 'Creando cuenta...' : step === 1 ? 'Continuar' : 'Crear cuenta gratis'}
              </button>
            </div>

          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-sky-600 hover:text-sky-700 font-medium">Inicia sesión</Link>
        </p>

      </div>
    </div>
  )
}

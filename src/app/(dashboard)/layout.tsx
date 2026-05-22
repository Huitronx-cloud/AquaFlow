'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navigation = [
  { label: 'Principal', items: [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Bitácora', href: '/bitacora', icon: '📋' },
    { name: 'Pedidos', href: '/pedidos', icon: '📦' },
  ]},
  { label: 'Gestión', items: [
    { name: 'Clientes', href: '/clientes', icon: '👥' },
    { name: 'Cobros', href: '/cobros', icon: '💰' },
    { name: 'Inventario', href: '/inventario', icon: '📦' },
  ]},
  { label: 'Análisis', items: [
    { name: 'Reportes', href: '/reportes', icon: '📊' },
    { name: 'Equipo', href: '/equipo', icon: '👤' },
    { name: 'Configuración', href: '/configuracion', icon: '⚙️' },
  ]},
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [orgName, setOrgName] = useState('Mi purificadora')
  const [userName, setUserName] = useState('')
  const [plan, setPlan] = useState('básico')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: appUser } = await supabase
        .from('app_users')
        .select('name, organizations(name, plan)')
        .eq('id', session.user.id)
        .single()
      if (appUser) {
        setUserName(appUser.name || session.user.email || '')
        const org = appUser.organizations as any
        if (org) { setOrgName(org.name); setPlan(org.plan) }
      }
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const initials = userName.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-200">
          <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">AF</span>
          </div>
          <span className="font-semibold text-slate-900 text-sm">Aqua Flow</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navigation.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 mb-1.5">{group.label}</p>
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <span className="text-base">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-6 h-6 bg-sky-100 rounded-md flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-sky-700">{orgName.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">{orgName}</p>
              <p className="text-xs text-slate-400 capitalize">Plan {plan}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <p className="text-sm text-slate-500 capitalize">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700 font-medium">{userName}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 transition">
              Salir
            </button>
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
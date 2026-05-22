import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: appUser } = await supabase
    .from('app_users')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  if (!appUser) redirect('/login')

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={appUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={appUser} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

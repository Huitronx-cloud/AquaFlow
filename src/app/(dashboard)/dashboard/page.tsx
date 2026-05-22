'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setEmail(session.user.email || '')
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div style={{padding:40}}>Cargando...</div>

  return (
    <div style={{padding:40}}>
      <h1 style={{fontSize:24, fontWeight:'bold', marginBottom:10}}>
        Bienvenido a Aqua Flow 👋
      </h1>
      <p style={{color:'#666', marginBottom:20}}>Sesión activa: {email}</p>
      <Link href="/bitacora" style={{color:'blue'}}>→ Ir a Bitácora</Link>
    </div>
  )
}

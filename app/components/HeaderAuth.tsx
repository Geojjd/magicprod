'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from "@/app/lib/supabaseClient"; // adjust path if yours differs

export default function HeaderAuth() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null)
      setLoading(false)
    })

    // Live updates on login/logout
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
      <Link href="/" style={{ fontWeight: 800 }}>MagicProd</Link>

      <nav style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Link href="/pricing">Pricing</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>

        {loading ? (
          <span style={{ opacity: 0.7 }}>Checking…</span>
        ) : email ? (
          <>
            <span style={{ opacity: 0.8 }}>{email}</span>
            <Link href="/app">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  )
}
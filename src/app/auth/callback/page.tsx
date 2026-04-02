'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      getSupabase().auth.exchangeCodeForSession(code).then(() => {
        router.replace('/')
      })
    } else {
      router.replace('/')
    }
  }, [router, searchParams])

  return <p className="text-muted">로그인 처리 중...</p>
}

export default function AuthCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Suspense fallback={<p className="text-muted">로딩 중...</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}

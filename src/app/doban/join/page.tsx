'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Users, LogIn } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { joinGroupByCode } from '@/lib/group-store'

function JoinGroupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const { user, loading, signInWithGoogle } = useAuth()
  const [status, setStatus] = useState<'loading' | 'joining' | 'error' | 'login'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return

    if (!code) {
      router.push('/doban')
      return
    }

    if (!user) {
      setStatus('login')
      return
    }

    // 자동 참여
    setStatus('joining')
    joinGroupByCode(user.id, code)
      .then(groupId => {
        router.push(`/doban/${groupId}`)
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : '참여 실패')
        setStatus('error')
      })
  }, [user, loading, code])

  return (
    <div className="px-4 py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="text-center space-y-4 max-w-sm w-full">
        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
          <Users size={28} className="text-accent" />
        </div>

        {status === 'loading' || status === 'joining' ? (
          <>
            <h2 className="text-lg font-bold text-foreground">도반 그룹 참여 중...</h2>
            <p className="text-sm text-muted">잠시만 기다려주세요</p>
          </>
        ) : status === 'login' ? (
          <>
            <h2 className="text-lg font-bold text-foreground">도반 초대</h2>
            <p className="text-sm text-muted">그룹에 참여하려면 먼저 로그인해주세요</p>
            <Button onClick={signInWithGoogle}>
              <LogIn size={16} />
              로그인 후 참여
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-foreground">참여 실패</h2>
            <p className="text-sm text-danger">{error}</p>
            <Button variant="outline" onClick={() => router.push('/doban')}>
              도반 페이지로
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={<div className="px-4 py-12 text-center text-muted">불러오는 중...</div>}>
      <JoinGroupContent />
    </Suspense>
  )
}

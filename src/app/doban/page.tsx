'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Plus, LogIn, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getMyGroups, createGroup, joinGroupByCode } from '@/lib/group-store'
import type { GroupWithStats } from '@/types'

export default function DobanPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [groups, setGroups] = useState<GroupWithStats[]>([])
  const [fetching, setFetching] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchGroups = async () => {
    if (!user) { setFetching(false); return }
    setFetching(true)
    const data = await getMyGroups(user.id)
    setGroups(data)
    setFetching(false)
  }

  useEffect(() => {
    if (!loading) fetchGroups()
  }, [user, loading])

  const handleCreate = async () => {
    if (!user || !groupName.trim()) return
    setSubmitting(true)
    try {
      await createGroup(user.id, groupName.trim())
      setGroupName('')
      setShowCreate(false)
      await fetchGroups()
    } catch (e) {
      alert(e instanceof Error ? e.message : '그룹 생성 실패')
    }
    setSubmitting(false)
  }

  const handleJoin = async () => {
    if (!user || !inviteCode.trim()) return
    setSubmitting(true)
    try {
      await joinGroupByCode(user.id, inviteCode.trim())
      setInviteCode('')
      setShowJoin(false)
      await fetchGroups()
    } catch (e) {
      alert(e instanceof Error ? e.message : '참여 실패')
    }
    setSubmitting(false)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <Users size={22} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">도반</h1>
          <p className="text-sm text-muted">함께 수행하는 벗</p>
        </div>
      </div>

      {/* 비로그인 */}
      {!loading && !user && (
        <Card className="text-center space-y-3">
          <p className="text-muted text-sm">도반 그룹에 참여하려면 로그인이 필요합니다</p>
          <Button size="sm" onClick={signInWithGoogle}>
            <LogIn size={16} />
            로그인
          </Button>
        </Card>
      )}

      {/* 로그인 상태 */}
      {user && (
        <>
          {/* 생성 / 참여 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => { setShowCreate(!showCreate); setShowJoin(false) }}
            >
              <Plus size={16} />
              그룹 만들기
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => { setShowJoin(!showJoin); setShowCreate(false) }}
            >
              <ArrowRight size={16} />
              코드로 참여
            </Button>
          </div>

          {/* 그룹 만들기 폼 */}
          {showCreate && (
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">새 도반 그룹</h3>
              <input
                type="text"
                placeholder="그룹 이름 (예: 새벽 수행 모임)"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2.5 bg-background border border-card-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              />
              <Button size="sm" className="w-full" loading={submitting} onClick={handleCreate} disabled={!groupName.trim()}>
                만들기
              </Button>
            </Card>
          )}

          {/* 코드로 참여 폼 */}
          {showJoin && (
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">초대코드 입력</h3>
              <input
                type="text"
                placeholder="6자리 초대코드"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-3 py-2.5 bg-background border border-card-border rounded-xl text-sm text-foreground text-center tracking-[0.3em] font-mono placeholder:text-muted placeholder:tracking-normal focus:outline-none focus:border-accent"
              />
              <Button size="sm" className="w-full" loading={submitting} onClick={handleJoin} disabled={inviteCode.length < 6}>
                참여하기
              </Button>
            </Card>
          )}

          {/* 그룹 리스트 */}
          {fetching ? (
            <div className="text-center text-muted py-8">불러오는 중...</div>
          ) : groups.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-3xl mb-3">🙏</p>
              <p className="text-muted text-sm">아직 참여 중인 그룹이 없습니다</p>
              <p className="text-muted text-xs mt-1">그룹을 만들거나 초대코드로 참여하세요</p>
            </Card>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted uppercase tracking-wider">내 도반 그룹</h2>
              {groups.map(g => (
                <Link key={g.id} href={`/doban/${g.id}`}>
                  <Card hover className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{g.name}</h3>
                      <p className="text-xs text-muted mt-0.5">
                        <Users size={12} className="inline mr-1" />
                        {g.member_count}명
                      </p>
                    </div>
                    <ArrowRight size={18} className="text-muted" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

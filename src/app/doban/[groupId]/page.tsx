'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Share2, Hand, Timer, BookOpen, Flame, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getGroupDashboard, sendReaction, leaveGroup, buildInviteLink, getOrCreateProfile, updateProfile } from '@/lib/group-store'
import { AVATAR_EMOJIS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { GroupWithStats, GroupMemberStatus } from '@/types'

export default function GroupDashboardPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [group, setGroup] = useState<GroupWithStats | null>(null)
  const [members, setMembers] = useState<GroupMemberStatus[]>([])
  const [fetching, setFetching] = useState(true)
  const [copied, setCopied] = useState(false)
  const [reactingTo, setReactingTo] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileEmoji, setProfileEmoji] = useState('🙏')

  const fetchDashboard = async () => {
    if (!user) return
    setFetching(true)
    try {
      const data = await getGroupDashboard(user.id, groupId)
      setGroup(data.group)
      setMembers(data.members)
    } catch {
      router.push('/doban')
    }
    setFetching(false)
  }

  useEffect(() => {
    if (!loading && user) {
      fetchDashboard()
      getOrCreateProfile(user.id).then(p => {
        setProfileName(p.display_name)
        setProfileEmoji(p.avatar_emoji)
      })
    }
    if (!loading && !user) router.push('/doban')
  }, [user, loading])

  const handleCopy = async () => {
    if (!group) return
    const link = buildInviteLink(group.invite_code)
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!group) return
    const link = buildInviteLink(group.invite_code)
    if (navigator.share) {
      await navigator.share({ title: `${group.name} - 하루수행 도반`, text: `함께 수행해요!\n초대코드: ${group.invite_code}`, url: link })
    } else {
      handleCopy()
    }
  }

  const handleReaction = async (toUserId: string) => {
    if (!user) return
    setReactingTo(toUserId)
    try {
      await sendReaction(user.id, groupId, toUserId)
      await fetchDashboard()
    } catch (e) {
      alert(e instanceof Error ? e.message : '합장 실패')
    }
    setReactingTo(null)
  }

  const handleLeave = async () => {
    if (!user) return
    const isOwner = group?.owner_id === user.id
    const msg = isOwner ? '그룹장이 나가면 그룹이 삭제됩니다. 나가시겠습니까?' : '그룹에서 나가시겠습니까?'
    if (!confirm(msg)) return
    await leaveGroup(user.id, groupId)
    router.push('/doban')
  }

  const handleSaveProfile = async () => {
    if (!user || !profileName.trim()) return
    await updateProfile(user.id, { display_name: profileName.trim(), avatar_emoji: profileEmoji })
    setShowProfile(false)
    await fetchDashboard()
  }

  if (fetching) {
    return <div className="px-5 py-12 text-center text-muted/40">불러오는 중...</div>
  }

  if (!group) return null

  return (
    <div className="px-5 py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between animate-in">
        <button onClick={() => router.push('/doban')} className="flex items-center gap-1 text-muted/50 hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">돌아가기</span>
        </button>
        <button onClick={() => setShowProfile(!showProfile)} className="text-sm text-accent font-medium">
          내 프로필
        </button>
      </div>

      {/* 프로필 편집 */}
      {showProfile && (
        <Card variant="glass" className="space-y-3 animate-in">
          <h3 className="text-sm font-bold text-foreground">프로필 설정</h3>
          <div className="flex flex-wrap gap-2">
            {AVATAR_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setProfileEmoji(e)}
                className={cn(
                  'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all',
                  profileEmoji === e ? 'bg-accent/15 ring-1 ring-accent/30' : 'hover:bg-card-bg'
                )}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            maxLength={10}
            placeholder="법명 또는 별명"
            className="w-full px-4 py-3 glass rounded-xl text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30"
          />
          <Button variant="gradient" size="sm" className="w-full" onClick={handleSaveProfile}>저장</Button>
        </Card>
      )}

      {/* 그룹 정보 */}
      <Card variant="glass" className="space-y-3 animate-in stagger-1">
        <h2 className="text-lg font-bold gradient-text">{group.name}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted/50">초대코드:</span>
          <span className="font-mono text-sm text-accent tracking-wider">{group.invite_code}</span>
          <button onClick={handleCopy} className="text-muted/40 hover:text-foreground transition-colors">
            <Copy size={14} />
          </button>
          <button onClick={handleShare} className="text-muted/40 hover:text-foreground transition-colors">
            <Share2 size={14} />
          </button>
          {copied && <span className="text-[11px] text-success font-medium">복사됨!</span>}
        </div>
      </Card>

      {/* 멤버 리스트 */}
      <div className="space-y-3 animate-in stagger-2">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest px-1">
          오늘의 수행 현황 · {members.length}명
        </h2>
        {members.map(m => {
          const completedCount = [m.today_bae108, m.today_meditation, m.today_yeobul].filter(Boolean).length
          const isMe = m.user_id === user?.id

          return (
            <Card key={m.user_id} variant="glass" className={cn(isMe && 'ring-1 ring-accent/20')}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.avatar_emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm truncate">
                      {m.display_name}
                      {isMe && <span className="text-xs text-muted/40 ml-1">(나)</span>}
                    </span>
                    {m.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-[11px] text-accent">
                        <Flame size={12} />
                        {m.streak}일
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <Hand size={15} className={m.today_bae108 ? 'text-success' : 'text-muted/20'} />
                    <Timer size={15} className={m.today_meditation ? 'text-success' : 'text-muted/20'} />
                    <BookOpen size={15} className={m.today_yeobul ? 'text-success' : 'text-muted/20'} />
                    <span className="text-xs text-muted/40 ml-1">{completedCount}/3</span>
                  </div>
                </div>
                {!isMe && (
                  <button
                    onClick={() => handleReaction(m.user_id)}
                    disabled={m.has_reacted || reactingTo === m.user_id}
                    className={cn(
                      'flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all',
                      m.has_reacted ? 'opacity-30' : 'hover:bg-accent/10 active:scale-95'
                    )}
                  >
                    <span className="text-xl">🙏</span>
                    {m.reactions_received > 0 && (
                      <span className="text-[10px] text-accent">{m.reactions_received}</span>
                    )}
                  </button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* 그룹 탈퇴 */}
      <button
        onClick={handleLeave}
        className="flex items-center gap-1.5 mx-auto text-sm text-danger/60 hover:text-danger transition-colors py-4"
      >
        <LogOut size={14} />
        {group.owner_id === user?.id ? '그룹 삭제' : '그룹 탈퇴'}
      </button>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Share2, Hand, Timer, BookOpen, Flame, LogOut, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getGroupDashboard, sendReaction, leaveGroup, buildInviteLink, getOrCreateProfile, updateProfile } from '@/lib/group-store'
import { AVATAR_EMOJIS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { MoodBackdrop } from '@/components/mood-backdrop'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await navigator.share({ title: `${group.name} · 하루수행 도반`, text: `함께 수행해요\n초대 코드: ${group.invite_code}`, url: link })
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
      alert(e instanceof Error ? e.message : '응원 실패')
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
    return (
      <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
        <MoodBackdrop mood="amber" />
        <p className="px-5 py-12 text-center label-tag">불러오는 중...</p>
      </div>
    )
  }

  if (!group) return null

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="amber" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <button
          onClick={() => router.push('/doban')}
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <p className="label-upper truncate max-w-[60%]">{group.name}</p>
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="text-[11px] text-accent hover:text-accent-light transition-colors uppercase tracking-[0.18em]"
        >
          Profile
        </button>
      </header>

      {/* 프로필 편집 */}
      {showProfile && (
        <section className="px-5 mb-6 animate-in">
          <div className="surface-paper rounded-2xl p-5 space-y-3">
            <p className="label-upper">프로필 설정</p>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setProfileEmoji(e)}
                  className={cn(
                    'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all',
                    profileEmoji === e
                      ? 'bg-foreground text-background'
                      : 'hover:bg-[var(--surface-hover)]',
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
              className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground placeholder:text-muted/50 bg-[var(--surface)] border border-[var(--surface-border)] focus:outline-none focus:border-[var(--accent-glow)] transition-colors"
            />
            <button
              onClick={handleSaveProfile}
              disabled={!profileName.trim()}
              className="w-full py-3 rounded-full bg-foreground text-background text-[13px] tracking-wide active:scale-[0.98] transition-all disabled:opacity-30"
            >
              저장
            </button>
          </div>
        </section>
      )}

      {/* 그룹 정보 */}
      <section className="px-5 pb-6 animate-in stagger-1">
        <p className="label-tag mb-2">Fellowship</p>
        <h1 className="text-foreground text-[26px] tracking-tight font-medium mb-3">
          {group.name}
        </h1>
        <div className="flex items-center gap-3 surface-subtle rounded-xl px-4 py-3">
          <p className="label-tag">Invite</p>
          <p className="font-mono text-[13px] text-accent tracking-[0.25em] flex-1">
            {group.invite_code}
          </p>
          <button
            onClick={handleCopy}
            aria-label="초대 코드 복사"
            className="p-1.5 text-foreground-dim hover:text-foreground transition-colors"
          >
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} strokeWidth={1.5} />}
          </button>
          <button
            onClick={handleShare}
            aria-label="공유"
            className="p-1.5 text-foreground-dim hover:text-foreground transition-colors"
          >
            <Share2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      </section>

      {/* 멤버 리스트 */}
      <section className="px-5 pb-8 animate-in stagger-2">
        <div className="flex items-baseline justify-between mb-4">
          <p className="label-upper">Today&apos;s Practice</p>
          <p className="label-tag">{members.length} members</p>
        </div>

        <ul className="space-y-0">
          {members.map(m => {
            const completedCount = [m.today_bae108, m.today_meditation, m.today_yeobul].filter(Boolean).length
            const isMe = m.user_id === user?.id

            return (
              <li
                key={m.user_id}
                className={cn(
                  'flex items-center gap-3 py-4 border-b border-[var(--surface-border)]',
                  isMe && 'bg-[var(--surface)] -mx-2 px-2 rounded-lg',
                )}
              >
                <div className="w-11 h-11 rounded-full bg-[var(--surface-strong)] flex items-center justify-center text-xl shrink-0">
                  {m.avatar_emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-foreground text-[14px] tracking-tight truncate">
                      {m.display_name}
                    </p>
                    {isMe && (
                      <span className="label-tag text-foreground-dim">(나)</span>
                    )}
                    {m.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-accent">
                        <Flame size={10} strokeWidth={2} />
                        {m.streak}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Hand size={13} className={m.today_bae108 ? 'text-success' : 'text-muted-deep'} strokeWidth={1.5} />
                    <Timer size={13} className={m.today_meditation ? 'text-success' : 'text-muted-deep'} strokeWidth={1.5} />
                    <BookOpen size={13} className={m.today_yeobul ? 'text-success' : 'text-muted-deep'} strokeWidth={1.5} />
                    <span className="label-tag">{completedCount}/3</span>
                  </div>
                </div>

                {!isMe && (
                  <button
                    onClick={() => handleReaction(m.user_id)}
                    disabled={m.has_reacted || reactingTo === m.user_id}
                    aria-label="응원 보내기"
                    className={cn(
                      'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all',
                      m.has_reacted
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-[var(--surface-hover)] active:scale-95',
                    )}
                  >
                    <span className="text-lg">🙏</span>
                    {m.reactions_received > 0 && (
                      <span className="text-[9px] text-accent tabular-nums">{m.reactions_received}</span>
                    )}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* 그룹 탈퇴 */}
      <div className="px-5 pb-8 mt-auto">
        <button
          onClick={handleLeave}
          className="flex items-center gap-1.5 mx-auto text-[12px] text-danger/70 hover:text-danger transition-colors py-3"
        >
          <LogOut size={12} strokeWidth={1.5} />
          {group.owner_id === user?.id ? '그룹 삭제' : '그룹 탈퇴'}
        </button>
      </div>
    </div>
  )
}

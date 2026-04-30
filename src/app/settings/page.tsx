'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getOrCreateProfile, updateProfile } from '@/lib/group-store'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { BottomSheet, OptionRow } from '@/components/bottom-sheet'
import { COUNT_SOUNDS, playCountSound, type CountSoundId } from '@/components/audio-player'
import { getBellSettings, saveBellSettings } from '@/lib/mindful-bell-store'
import { cn } from '@/lib/utils'

const SOUND_KEY = 'haru-bae108-sound'
const VIBRATION_KEY = 'haru-vibration-on'
const REMINDER_KEY = 'haru-reminder-on'
const FELLOWSHIP_NOTIFY_KEY = 'haru-fellowship-notify'

function loadBool(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  const v = localStorage.getItem(key)
  if (v === null) return fallback
  return v === '1'
}
function saveBool(key: string, value: boolean) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value ? '1' : '0')
  } catch {
    // 무시
  }
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()

  // 사운드
  const [countSound, setCountSound] = useState<CountSoundId>('moktak')
  const [showSoundSheet, setShowSoundSheet] = useState(false)

  // 토글들
  const [vibration, setVibration] = useState(true)
  const [reminder, setReminder] = useState(false)
  const [fellowshipNotify, setFellowshipNotify] = useState(true)

  // 수행자 종 (마음챙김 알림)
  const [bellEnabled, setBellEnabled] = useState(false)
  const [bellTimes, setBellTimes] = useState<string[]>(['09:00', '13:00', '18:00'])

  // 이름 (display_name)
  const [displayName, setDisplayName] = useState<string>('')
  const [showNameSheet, setShowNameSheet] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(SOUND_KEY)
    if (saved && COUNT_SOUNDS.some(s => s.id === saved)) {
      setCountSound(saved as CountSoundId)
    }
    setVibration(loadBool(VIBRATION_KEY, true))
    setReminder(loadBool(REMINDER_KEY, false))
    setFellowshipNotify(loadBool(FELLOWSHIP_NOTIFY_KEY, true))
    const bell = getBellSettings()
    setBellEnabled(bell.enabled)
    setBellTimes(bell.times)
  }, [])

  // 이름 로드
  useEffect(() => {
    if (user) {
      getOrCreateProfile(user.id)
        .then(p => setDisplayName(p.display_name))
        .catch(() => setDisplayName(''))
    }
  }, [user])

  const handleSaveName = async () => {
    if (!user) return
    const trimmed = nameInput.trim()
    if (!trimmed || trimmed.length > 10) return
    try {
      await updateProfile(user.id, { display_name: trimmed })
      setDisplayName(trimmed)
      setShowNameSheet(false)
      setNameInput('')
    } catch (e) {
      alert(e instanceof Error ? e.message : '이름 저장 실패')
    }
  }

  const handleSelectSound = (id: CountSoundId) => {
    setCountSound(id)
    try { localStorage.setItem(SOUND_KEY, id) } catch {}
    playCountSound(id)
  }

  const currentSoundName = COUNT_SOUNDS.find(s => s.id === countSound)?.name ?? '목탁'

  const handleDeleteAll = () => {
    if (!confirm('정말 모든 데이터를 삭제하시겠습니까?\n수행 기록, 마음기록, 도반 그룹 등 모든 데이터가 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.')) return
    // localStorage 정리
    if (typeof window !== 'undefined') {
      const keys = ['haru-journal-entries', 'haru-custom-mantras', 'haru-bae108-sound', 'haru-chat-daily-use', 'haru-chat-guest-count']
      keys.forEach(k => localStorage.removeItem(k))
    }
    alert('로컬 데이터가 삭제되었습니다.\n클라우드 데이터(로그인 시 저장된 기록)는 계정 탈퇴 시 자동 삭제됩니다.')
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="charcoal" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link
          href="/me"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Settings</p>
        <div className="w-8" />
      </header>

      <section className="px-5 pb-6 animate-in">
        <p className="label-tag">Preferences</p>
        <h1 className="text-foreground text-[28px] tracking-tight font-medium mt-1.5">
          설정
        </h1>
      </section>

      {/* 오디오 */}
      <section className="px-5 pb-6 animate-in stagger-1">
        <p className="label-upper mb-3">Audio</p>
        <ul>
          <SettingRow
            label="카운트 사운드"
            sub="108배 · 염불"
            value={currentSoundName}
            onClick={() => setShowSoundSheet(true)}
          />
          <ToggleRow
            label="진동 피드백"
            sub="카운트 시 살짝 진동"
            value={vibration}
            onChange={v => { setVibration(v); saveBool(VIBRATION_KEY, v) }}
          />
        </ul>
      </section>

      {/* 알림 */}
      <section className="px-5 pb-6 animate-in stagger-2">
        <p className="label-upper mb-3">Notifications</p>
        <ul>
          <ToggleRow
            label="수행자 종"
            sub="정해진 시간에 잠시 멈춤 알림 (앱이 열려 있을 때)"
            value={bellEnabled}
            onChange={v => {
              setBellEnabled(v)
              saveBellSettings({ enabled: v, times: bellTimes })
            }}
          />
          {bellEnabled && (
            <li className="px-2 -mx-2 py-3">
              <p className="label-tag mb-2">시각 (최대 3개)</p>
              <div className="grid grid-cols-3 gap-2">
                {bellTimes.map((t, i) => (
                  <input
                    key={i}
                    type="time"
                    value={t}
                    onChange={e => {
                      const next = [...bellTimes]
                      next[i] = e.target.value
                      setBellTimes(next)
                      saveBellSettings({ enabled: bellEnabled, times: next })
                    }}
                    className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-lg px-2.5 py-2 text-foreground text-[13px] tabular-nums focus:outline-none focus:border-accent"
                  />
                ))}
              </div>
            </li>
          )}
          <ToggleRow
            label="매일 수행 리마인더"
            sub="매일 정해진 시간에 알림 (추후)"
            value={reminder}
            onChange={v => { setReminder(v); saveBool(REMINDER_KEY, v) }}
            disabled
          />
          <ToggleRow
            label="도반 응원 알림"
            sub="도반이 응원 보냈을 때 (추후)"
            value={fellowshipNotify}
            onChange={v => { setFellowshipNotify(v); saveBool(FELLOWSHIP_NOTIFY_KEY, v) }}
            disabled
          />
        </ul>
      </section>

      {/* 계정 */}
      {user && (
        <section className="px-5 pb-6 animate-in stagger-3">
          <p className="label-upper mb-3">Account</p>
          <ul>
            <SettingRow
              label="수행자명"
              sub="홈에서 ㅇㅇㅇ 수행자님 으로 표시됩니다"
              value={displayName || '미설정'}
              onClick={() => { setNameInput(displayName); setShowNameSheet(true) }}
            />
            <SettingRow
              label="이메일"
              value={user.email ?? '—'}
              readonly
            />
            <SettingRow
              label="로그아웃"
              onClick={signOut}
              danger
            />
          </ul>
        </section>
      )}

      {/* 데이터 */}
      <section className="px-5 pb-6 animate-in stagger-4">
        <p className="label-upper mb-3">Data</p>
        <ul>
          <SettingRow
            label="모든 데이터 삭제"
            sub="기기에 저장된 로컬 데이터 정리"
            onClick={handleDeleteAll}
            danger
          />
        </ul>
      </section>

      {/* 앱 정보 */}
      <section className="px-5 pb-12 animate-in stagger-5">
        <p className="label-upper mb-3">About</p>
        <ul>
          <SettingRow label="버전" value="1.0.0" readonly />
          <SettingRow label="이용약관" onClick={() => alert('준비 중입니다')} />
          <SettingRow label="개인정보 처리방침" onClick={() => alert('준비 중입니다')} />
          <SettingRow label="피드백 보내기" onClick={() => alert('피드백은 edithtech@edithtech.co.kr로 부탁드립니다')} />
        </ul>
      </section>

      {/* 이름 변경 모달 */}
      {showNameSheet && (
        <BottomSheet title="수행자명" onClose={() => setShowNameSheet(false)}>
          <div className="space-y-4 pb-2">
            <p className="label-tag">홈 화면과 도반 그룹에 표시됩니다</p>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="법명 또는 별명"
              maxLength={10}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName() }}
              className="w-full px-4 py-3 rounded-xl text-[15px] text-foreground placeholder:text-muted/50 bg-[var(--surface)] border border-[var(--surface-border)] focus:outline-none focus:border-[var(--accent-glow)] transition-colors"
            />
            <p className="label-tag text-right">{nameInput.length} / 10</p>
            <button
              onClick={handleSaveName}
              disabled={!nameInput.trim()}
              className="w-full py-3.5 rounded-full bg-foreground text-background text-[14px] tracking-wide active:scale-[0.98] transition-all disabled:opacity-30"
            >
              저장
            </button>
          </div>
        </BottomSheet>
      )}

      {/* 사운드 선택 모달 */}
      {showSoundSheet && (
        <BottomSheet title="Count Sound" onClose={() => setShowSoundSheet(false)}>
          <p className="label-tag mb-4">탭으로 미리 듣고 선택하세요</p>
          {COUNT_SOUNDS.map(s => (
            <OptionRow
              key={s.id}
              label={s.name}
              description={s.description}
              selected={countSound === s.id}
              onClick={() => handleSelectSound(s.id)}
              trailing={
                <button
                  onClick={(e) => { e.stopPropagation(); playCountSound(s.id) }}
                  aria-label={`${s.name} 미리 듣기`}
                  className="w-9 h-9 rounded-full border border-[var(--surface-strong-border)] hover:border-foreground/60 hover:bg-[var(--surface-hover)] flex items-center justify-center text-foreground-dim hover:text-foreground transition-colors active:scale-95"
                >
                  ▶
                </button>
              }
            />
          ))}
        </BottomSheet>
      )}
    </div>
  )
}

// ===== 공통 행 컴포넌트 =====

function SettingRow({
  label,
  sub,
  value,
  onClick,
  readonly,
  danger,
}: {
  label: string
  sub?: string
  value?: string
  onClick?: () => void
  readonly?: boolean
  danger?: boolean
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <li>
      <Comp
        onClick={onClick}
        className={cn(
          'w-full flex items-center justify-between gap-3 py-3.5 border-b border-[var(--surface-border)] text-left',
          onClick && 'hover:bg-[var(--surface)] -mx-2 px-2 rounded-lg transition-colors',
        )}
      >
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-[15px] tracking-tight',
            danger ? 'text-danger' : 'text-foreground',
          )}>
            {label}
          </p>
          {sub && <p className="label-tag mt-0.5 truncate">{sub}</p>}
        </div>
        {value && (
          <p className={cn(
            'text-[13px] shrink-0',
            readonly ? 'text-foreground-dim' : 'text-foreground',
          )}>
            {value}
          </p>
        )}
        {onClick && !readonly && !danger && (
          <ChevronRight size={14} className="text-foreground-dim shrink-0" strokeWidth={1.5} />
        )}
      </Comp>
    </li>
  )
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
  disabled,
}: {
  label: string
  sub?: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <li>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-3 py-3.5 border-b border-[var(--surface-border)] text-left transition-colors',
          !disabled && 'hover:bg-[var(--surface)] -mx-2 px-2 rounded-lg',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-[15px] tracking-tight">{label}</p>
          {sub && <p className="label-tag mt-0.5 truncate">{sub}</p>}
        </div>
        <div
          className={cn(
            'shrink-0 w-10 h-6 rounded-full relative transition-colors',
            value ? 'bg-accent' : 'bg-[var(--surface-strong)]',
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground transition-transform',
              value && 'translate-x-4',
            )}
          />
        </div>
      </button>
    </li>
  )
}

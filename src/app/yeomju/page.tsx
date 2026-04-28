'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, Plus, X } from 'lucide-react'
import { MANTRAS } from '@/lib/sutras'
import { SUTRAS as YEOBUL_SUTRAS } from '@/lib/constants'
import { getSoundGenerator } from '@/components/audio-player'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { cn } from '@/lib/utils'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { Mandala } from '@/components/mandala'
import { BottomSheet } from '@/components/bottom-sheet'

type Mode = 'yeomju' | 'dokgyeong'
type SutraKey = keyof typeof YEOBUL_SUTRAS

interface CustomMantra {
  id: string
  label: string
  text: string
}

const BEAD_COUNT = 108
const CUSTOM_MANTRAS_KEY = 'haru-custom-mantras'

function loadCustomMantras(): CustomMantra[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_MANTRAS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveCustomMantras(mantras: CustomMantra[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CUSTOM_MANTRAS_KEY, JSON.stringify(mantras))
  } catch {
    // 무시
  }
}

export default function YeomjuPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<Mode>('yeomju')
  const [count, setCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [pressing, setPressing] = useState(false)
  const startTimeRef = useRef(0)
  const [mantraId, setMantraId] = useState(MANTRAS[0].id)
  const [selectedSutra, setSelectedSutra] = useState<SutraKey>('나무아미타불')
  const [customMantras, setCustomMantras] = useState<CustomMantra[]>([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newText, setNewText] = useState('')

  useEffect(() => {
    setCustomMantras(loadCustomMantras())
  }, [])

  const allMantras = [
    ...MANTRAS.map(m => ({ ...m, isCustom: false })),
    ...customMantras.map(m => ({ ...m, isCustom: true })),
  ]
  const mantra = allMantras.find(m => m.id === mantraId) || allMantras[0]
  const progress = count / BEAD_COUNT

  const handleAddCustom = () => {
    if (!newLabel.trim() || !newText.trim()) return
    const id = `custom-${crypto.randomUUID()}`
    const next: CustomMantra = { id, label: newLabel.trim(), text: newText.trim() }
    const updated = [...customMantras, next]
    setCustomMantras(updated)
    saveCustomMantras(updated)
    setMantraId(id)
    setNewLabel('')
    setNewText('')
    setShowAddSheet(false)
  }

  const handleDeleteCustom = (id: string) => {
    if (!confirm('이 진언을 삭제하시겠습니까?')) return
    const updated = customMantras.filter(m => m.id !== id)
    setCustomMantras(updated)
    saveCustomMantras(updated)
    if (mantraId === id) setMantraId(MANTRAS[0].id)
  }

  const handleReset = useCallback(() => {
    setCount(0)
    setCompleted(false)
    startTimeRef.current = 0
  }, [])

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode)
    handleReset()
  }, [handleReset])

  const handleCount = useCallback(() => {
    if (completed) return
    if (count === 0) startTimeRef.current = Date.now()
    if (navigator.vibrate) navigator.vibrate(30)
    getSoundGenerator().playMoktak()
    setPressing(true)
    setTimeout(() => setPressing(false), 120)
    const newCount = count + 1
    setCount(newCount)
    if (newCount >= BEAD_COUNT) {
      setCompleted(true)
      setTimeout(() => getSoundGenerator().playBell(1), 300)
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      savePractice(user?.id ?? null, 'yeobul', duration, BEAD_COUNT, true)
    }
  }, [count, completed, user])

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="olive" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Chant</p>
        {count > 0 ? (
          <button
            onClick={handleReset}
            aria-label="초기화"
            className="p-2 -mr-2 text-foreground-dim hover:text-foreground transition-colors"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      {/* 타이틀 */}
      <section className="px-5 pb-4 animate-in">
        <h1 className="text-foreground text-[26px] tracking-tight font-medium">
          염불
        </h1>
        <p className="label-tag mt-1">진언과 경전으로 마음을 모으세요</p>
      </section>

      {/* 모드 탭 (미니멀 텍스트 탭) */}
      <nav className="px-5 pb-5 flex items-center gap-5 border-b border-[var(--surface-border)] animate-in stagger-1">
        {(['yeomju', 'dokgyeong'] as const).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              'pb-2 text-[15px] tracking-tight transition-all relative',
              mode === m ? 'text-foreground' : 'text-muted hover:text-foreground-dim',
            )}
          >
            {m === 'yeomju' ? '염주' : '독경'}
            {mode === m && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-foreground" />
            )}
          </button>
        ))}
      </nav>

      {/* 콘텐츠 */}
      <section className="flex-1 flex flex-col px-5 pt-6 pb-8 animate-in stagger-2">
        {mode === 'yeomju' ? (
          <>
            {/* 진언 칩 */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide mb-2">
              {allMantras.map(m => (
                <div key={m.id} className="relative shrink-0">
                  <button
                    onClick={() => { setMantraId(m.id); handleReset() }}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-all',
                      mantraId === m.id
                        ? 'bg-foreground text-background'
                        : 'border border-[var(--surface-border)] text-foreground-dim hover:text-foreground',
                      m.isCustom && mantraId !== m.id && 'border-[var(--accent-glow)] text-accent',
                      m.isCustom && 'pr-7',
                    )}
                  >
                    {m.label}
                  </button>
                  {m.isCustom && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCustom(m.id) }}
                      aria-label="진언 삭제"
                      className={cn(
                        'absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-colors',
                        mantraId === m.id ? 'text-background/70 hover:text-background' : 'text-foreground-dim/60 hover:text-danger',
                      )}
                    >
                      <X size={10} strokeWidth={2} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setShowAddSheet(true)}
                aria-label="진언 추가"
                className="shrink-0 px-3 py-1.5 rounded-full text-[12px] border border-dashed border-[var(--surface-border)] text-foreground-dim hover:text-foreground hover:border-[var(--accent-glow)] transition-all flex items-center gap-1"
              >
                <Plus size={11} strokeWidth={2} />
                추가
              </button>
            </div>

            {/* 진언 + 만다라 + 카운트 (탭 영역) */}
            <div
              role="button"
              tabIndex={completed ? -1 : 0}
              aria-label="화면을 탭하여 진언 카운트"
              aria-disabled={completed}
              className="relative flex-1 min-h-[55vh] flex flex-col items-center justify-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
              onClick={handleCount}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCount()
                }
              }}
              onTouchStart={(e) => { e.preventDefault(); handleCount() }}
            >
              {/* 큰 만다라 배경 */}
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700',
                  pressing && 'scale-[1.02]',
                  completed && 'opacity-60',
                )}
              >
                <Mandala
                  size={260}
                  className={cn(
                    'transition-colors duration-500',
                    completed ? 'text-success/60' : 'text-foreground/22',
                  )}
                  inner
                />
              </div>

              {/* 진행 외곽 회전 */}
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `rotate(${progress * 360}deg)`,
                  transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <Mandala size={320} className="text-accent/15" />
              </div>

              <div className="relative z-10 text-center px-4">
                <p className="label-upper mb-2 text-foreground-dim">
                  {mantra.label}
                </p>
                <p
                  className={cn(
                    'text-foreground text-[22px] leading-tight tracking-tight transition-opacity duration-300',
                    pressing ? 'opacity-90' : 'opacity-100',
                    completed && 'text-success',
                  )}
                >
                  {completed ? '수행을 마쳤습니다' : mantra.text}
                </p>
                <p
                  className={cn(
                    'text-foreground text-[68px] tracking-tight leading-none tabular-nums font-light mt-6 transition-transform duration-100',
                    pressing && 'scale-[0.96]',
                    completed && 'text-success',
                  )}
                  style={{ fontVariationSettings: '"wght" 280' }}
                >
                  {count}
                </p>
                <p className="label-tag mt-2 tabular-nums">/ {BEAD_COUNT}</p>
              </div>

              {!completed && (
                <p className="absolute bottom-2 label-upper text-foreground-dim animate-in stagger-3">
                  Tap anywhere
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 경전 칩 */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide mb-4">
              {(Object.keys(YEOBUL_SUTRAS) as SutraKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => { setSelectedSutra(key); handleReset() }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-all',
                    selectedSutra === key
                      ? 'bg-foreground text-background'
                      : 'border border-[var(--surface-border)] text-foreground-dim hover:text-foreground',
                  )}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* 경전 본문 */}
            <div className="surface-subtle rounded-2xl p-5 mb-6">
              <p className="text-foreground/90 leading-[1.7] whitespace-pre-line text-[14px] tracking-tight">
                {YEOBUL_SUTRAS[selectedSutra]}
              </p>
            </div>

            {/* 카운트 영역 */}
            <div
              role="button"
              tabIndex={completed ? -1 : 0}
              aria-label="화면을 탭하여 독경 카운트"
              aria-disabled={completed}
              className="relative flex-1 min-h-[40vh] flex flex-col items-center justify-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
              onClick={handleCount}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCount()
                }
              }}
              onTouchStart={(e) => { e.preventDefault(); handleCount() }}
            >
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center pointer-events-none',
                  pressing && 'scale-[1.02]',
                )}
              >
                <Mandala
                  size={220}
                  className={cn(
                    'transition-colors',
                    completed ? 'text-success/60' : 'text-foreground/20',
                  )}
                />
              </div>

              <div className="relative z-10 text-center">
                <p className="label-upper mb-2 text-foreground-dim">
                  Recitation
                </p>
                <p
                  className={cn(
                    'text-foreground text-[80px] tracking-tight leading-none tabular-nums font-light transition-transform duration-100',
                    pressing && 'scale-[0.96]',
                    completed && 'text-success',
                  )}
                  style={{ fontVariationSettings: '"wght" 280' }}
                >
                  {count}
                </p>
                <p className="label-tag mt-2 tabular-nums">/ {BEAD_COUNT}</p>
                {completed && (
                  <p className="text-success text-[12px] uppercase tracking-[0.3em] mt-4">
                    Complete
                  </p>
                )}
              </div>

              {!completed && (
                <p className="absolute bottom-2 label-upper text-foreground-dim">
                  Tap to count
                </p>
              )}
            </div>
          </>
        )}
      </section>

      {/* 진언 추가 모달 */}
      {showAddSheet && (
        <BottomSheet
          title="새 진언 추가"
          onClose={() => { setShowAddSheet(false); setNewLabel(''); setNewText('') }}
        >
          <div className="space-y-4 pb-2">
            <div>
              <p className="label-tag mb-2">이름</p>
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="예: 나의 진언"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-[14px] text-foreground placeholder:text-muted/50 bg-[var(--surface)] border border-[var(--surface-border)] focus:outline-none focus:border-[var(--accent-glow)] transition-colors"
              />
            </div>
            <div>
              <p className="label-tag mb-2">내용</p>
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="외울 진언 또는 발원문을 입력하세요"
                rows={3}
                maxLength={200}
                className="w-full resize-none px-4 py-3 rounded-xl text-[14px] text-foreground placeholder:text-muted/50 bg-[var(--surface)] border border-[var(--surface-border)] focus:outline-none focus:border-[var(--accent-glow)] transition-colors"
              />
              <p className="label-tag mt-1.5 text-right">{newText.length} / 200</p>
            </div>
            <button
              onClick={handleAddCustom}
              disabled={!newLabel.trim() || !newText.trim()}
              className="w-full py-3.5 rounded-full bg-foreground text-background text-[14px] tracking-wide active:scale-[0.98] transition-all disabled:opacity-30"
            >
              저장
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}

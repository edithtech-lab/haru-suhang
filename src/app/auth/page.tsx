'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

type Step = 'welcome' | 'email' | 'password' | 'check-inbox'
type Mode = 'sign-up' | 'sign-in'

const PASSWORD_MIN = 6

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export default function AuthPage() {
  const router = useRouter()
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()

  const [step, setStep] = useState<Step>('welcome')
  const [mode, setMode] = useState<Mode>('sign-up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 이미 로그인된 경우 홈으로
  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [user, loading, router])

  // step 변경 시 input focus
  useEffect(() => {
    if (step === 'email' || step === 'password') {
      const t = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [step])

  const handleBack = () => {
    setError(null)
    if (step === 'welcome') router.push('/')
    else if (step === 'email') setStep('welcome')
    else if (step === 'password') setStep('email')
    else if (step === 'check-inbox') setStep('welcome')
  }

  const handleSelectMode = (m: Mode) => {
    setMode(m)
    setStep('email')
    setError(null)
  }

  const handleEmailNext = () => {
    if (!isValidEmail(email)) {
      setError('올바른 이메일 주소를 입력해주세요.')
      return
    }
    setError(null)
    setStep('password')
  }

  const handleSubmitPassword = useCallback(async () => {
    if (mode === 'sign-up' && password.length < PASSWORD_MIN) {
      setError(`비밀번호는 최소 ${PASSWORD_MIN}자 이상이어야 합니다.`)
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      if (mode === 'sign-up') {
        const { error: err, needsConfirmation } = await signUpWithEmail(email, password)
        if (err) {
          setError(err)
        } else if (needsConfirmation) {
          setStep('check-inbox')
        } else {
          router.replace('/')
        }
      } else {
        const { error: err } = await signInWithEmail(email, password)
        if (err) setError(err)
        else router.replace('/')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }, [mode, email, password, signUpWithEmail, signInWithEmail, router])

  const handleGoogle = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const { error: err } = await signInWithGoogle()
      if (err) {
        setError(
          err.toLowerCase().includes('provider is not enabled')
            ? 'Google 로그인이 아직 설정되지 않았습니다. 이메일로 가입해주세요.'
            : `Google 로그인 실패: ${err}`,
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-black overflow-hidden">
      {/* ===== 인물 사진 placeholder 배경 (Open #3 차용) ===== */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 55% at 50% 35%, rgba(170, 120, 95, 0.5) 0%, rgba(60, 35, 30, 0.7) 40%, transparent 70%),
              radial-gradient(ellipse 90% 80% at 50% 110%, rgba(0, 0, 0, 0.9) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 50% 0%, rgba(220, 160, 110, 0.18) 0%, transparent 60%),
              linear-gradient(180deg, #1a0e08 0%, #050302 50%, #000 100%)
            `,
          }}
        />
        {/* 인물 광택 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 28% 38% at 76% 32%, rgba(232, 168, 110, 0.28) 0%, transparent 55%),
              radial-gradient(ellipse 23% 28% at 24% 24%, rgba(180, 110, 70, 0.22) 0%, transparent 55%)
            `,
            filter: 'blur(2px)',
          }}
        />
        {/* 코·턱 음영 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 12% 25% at 50% 55%, rgba(0, 0, 0, 0.55) 0%, transparent 70%),
              radial-gradient(ellipse 18% 12% at 50% 70%, rgba(0, 0, 0, 0.45) 0%, transparent 70%)
            `,
            filter: 'blur(8px)',
          }}
        />
        {/* 강한 블러로 인물이 흐릿하게 */}
        <div className="absolute inset-0 backdrop-blur-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }} />
        {/* 비네트 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        {/* 그레인 */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ===== 상단 뒤로 ===== */}
      {step !== 'welcome' && (
        <button
          onClick={handleBack}
          aria-label="뒤로"
          className="absolute top-5 left-5 z-20 p-2 text-foreground/80 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
      )}

      {/* ===== 콘텐츠 ===== */}
      <div className="relative z-10 flex-1 flex flex-col mx-auto w-full max-w-lg">
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-end pb-12 px-8 animate-in">
            {/* 중앙 큰 자간 타이포 */}
            <div className="flex-1 flex items-center justify-center w-full">
              <h1
                className="text-foreground text-[44px] font-light"
                style={{
                  letterSpacing: '0.5em',
                  fontVariationSettings: '"wght" 280',
                  paddingLeft: '0.5em',
                }}
              >
                하루 수행
              </h1>
            </div>

            {/* CTA 영역 */}
            <div className="w-full space-y-3">
              <button
                onClick={() => handleSelectMode('sign-up')}
                className="w-full py-4 rounded-full border border-foreground/40 hover:border-foreground hover:bg-foreground/5 text-foreground text-[15px] tracking-tight active:scale-[0.98] transition-all"
              >
                Create account →
              </button>

              <button
                onClick={() => handleSelectMode('sign-in')}
                className="w-full py-3 text-foreground-dim text-[14px] tracking-tight hover:text-foreground transition-colors"
              >
                Sign in
              </button>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-[1px] bg-foreground/15" />
                <span className="label-tag">or</span>
                <div className="flex-1 h-[1px] bg-foreground/15" />
              </div>

              <button
                onClick={handleGoogle}
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-foreground text-background text-[14px] tracking-tight active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Continue with Google
              </button>

              <Link
                href="/"
                className="block text-center pt-3 text-foreground-dim text-[12px] hover:text-foreground transition-colors"
              >
                Continue as guest
              </Link>

              {error && (
                <p className="pt-2 text-center text-danger text-[12px] leading-relaxed">{error}</p>
              )}
            </div>
          </div>
        )}

        {step === 'email' && (
          <div className="flex-1 flex flex-col px-8 pt-24 pb-8 animate-in">
            <p className="label-upper mb-2">{mode === 'sign-up' ? 'Step 1 of 2' : 'Sign in'}</p>
            <h2 className="text-foreground text-[34px] tracking-tight font-light leading-[1.1] mb-12">
              Enter your email
            </h2>

            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              onKeyDown={e => { if (e.key === 'Enter') handleEmailNext() }}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              className="w-full bg-transparent border-b border-foreground/40 focus:border-foreground py-3 text-foreground text-[18px] placeholder:text-foreground/30 focus:outline-none transition-colors"
            />

            {error && (
              <p className="mt-3 text-danger text-[12px]">{error}</p>
            )}

            {/* 우측 하단 → 버튼 (Open #2 차용) */}
            <div className="mt-auto flex justify-end">
              <button
                onClick={handleEmailNext}
                disabled={!isValidEmail(email)}
                aria-label="다음"
                className={cn(
                  'w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-95',
                  isValidEmail(email)
                    ? 'border-foreground bg-foreground/5 text-foreground'
                    : 'border-foreground/20 text-foreground/30',
                )}
              >
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {step === 'password' && (
          <div className="flex-1 flex flex-col px-8 pt-24 pb-8 animate-in">
            <p className="label-upper mb-2">
              {mode === 'sign-up' ? 'Step 2 of 2' : 'Welcome back'}
            </p>
            <h2 className="text-foreground text-[34px] tracking-tight font-light leading-[1.1] mb-12">
              {mode === 'sign-up' ? 'Create a password' : 'Enter your password'}
            </h2>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmitPassword() }}
                placeholder="••••••"
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                className="w-full bg-transparent border-b border-foreground/40 focus:border-foreground py-3 pr-8 text-foreground text-[18px] placeholder:text-foreground/30 focus:outline-none transition-colors tracking-widest"
              />
              {/* ✓ 유효 표시 */}
              {(mode === 'sign-up' ? password.length >= PASSWORD_MIN : password.length > 0) && (
                <Check
                  size={16}
                  strokeWidth={2}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-success"
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="label-tag">
                {mode === 'sign-up' ? `${PASSWORD_MIN} CHARACTERS MINIMUM` : ''}
              </p>
              <button
                onClick={() => setShowPassword(s => !s)}
                className="label-tag text-foreground-dim hover:text-foreground transition-colors"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-danger text-[12px]">{error}</p>
            )}

            <div className="mt-auto flex justify-end">
              <button
                onClick={handleSubmitPassword}
                disabled={submitting || (mode === 'sign-up' && password.length < PASSWORD_MIN) || password.length === 0}
                aria-label={mode === 'sign-up' ? '가입' : '로그인'}
                className={cn(
                  'w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-95',
                  password.length >= PASSWORD_MIN
                    ? 'border-foreground bg-foreground/5 text-foreground'
                    : 'border-foreground/20 text-foreground/30',
                )}
              >
                {submitting ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <ArrowRight size={20} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'check-inbox' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-in">
            <div className="w-16 h-16 rounded-full border border-foreground/30 flex items-center justify-center mb-6">
              <Check size={20} strokeWidth={1.5} className="text-success" />
            </div>
            <p className="label-upper mb-3">Check your inbox</p>
            <h2 className="text-foreground text-[28px] tracking-tight font-light leading-tight mb-4">
              인증 메일을<br />보내드렸어요
            </h2>
            <p className="text-foreground-dim text-[14px] leading-relaxed max-w-sm">
              <span className="text-foreground">{email}</span> 으로<br />
              인증 링크를 전송했습니다.<br />
              메일의 링크를 클릭하면 가입이 완료됩니다.
            </p>
            <Link
              href="/"
              className="mt-12 text-foreground-dim text-[13px] hover:text-foreground transition-colors"
            >
              홈으로 돌아가기 →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

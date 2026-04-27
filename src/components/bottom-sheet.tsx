'use client'

import { ReactNode } from 'react'
import { X, Check } from 'lucide-react'

interface BottomSheetProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Bottom Sheet 모달 (Open #1 차용)
 * - 검정 배경 + rounded-t-3xl
 * - 상단 X 닫기 + 가운데 제목
 * - children에 OptionRow 등 배치
 */
export function BottomSheet({ title, onClose, children }: BottomSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
      <div
        className="relative w-full max-w-lg bg-black border-t border-[var(--surface-border)] rounded-t-3xl pb-8 max-h-[80vh] overflow-y-auto animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-3 sticky top-0 bg-black z-10">
          <div className="flex-1" />
          <p className="text-foreground text-[16px] tracking-tight">{title}</p>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex-1 flex justify-end p-2 text-foreground-dim hover:text-foreground transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-4 px-5">{children}</div>
      </div>
    </div>
  )
}

interface OptionRowProps {
  label: string
  description?: string
  selected: boolean
  onClick: () => void
  /** 우측에 추가 액션 (예: 미리 듣기 버튼) */
  trailing?: ReactNode
}

/**
 * Bottom Sheet 내 옵션 한 줄
 * - 좌: label + description
 * - 우: ✓ (선택 시) 또는 trailing
 */
export function OptionRow({ label, description, selected, onClick, trailing }: OptionRowProps) {
  return (
    <div className="w-full flex items-center justify-between py-4 border-b border-[var(--surface-border)] -mx-5 px-5">
      <button
        onClick={onClick}
        className="flex-1 text-left flex items-center justify-between gap-3 hover:bg-[var(--surface-hover)] -mx-3 px-3 py-1 rounded-lg transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-[15px] tracking-tight">{label}</p>
          {description && (
            <p className="label-tag mt-0.5 truncate">{description}</p>
          )}
        </div>
        {selected && <Check size={16} className="text-foreground" strokeWidth={1.8} />}
      </button>
      {trailing && <div className="ml-2 shrink-0">{trailing}</div>}
    </div>
  )
}

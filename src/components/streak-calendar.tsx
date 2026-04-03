'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getMonthlyLogs } from '@/lib/practice-store'
import { getMonthHolidays } from '@/lib/lunar'
import { useAuth } from '@/lib/auth-context'
import type { PracticeType } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const TYPE_COLORS: Record<PracticeType, string> = {
  bae108: 'bg-accent',
  meditation: 'bg-blue-400',
  yeobul: 'bg-success',
}

export function StreakCalendar() {
  const { user } = useAuth()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [logs, setLogs] = useState<Record<string, PracticeType[]>>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const holidays = getMonthHolidays(year, month)

  useEffect(() => {
    getMonthlyLogs(user?.id ?? null, year, month).then(setLogs)
  }, [user, year, month])

  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const selectedHoliday = selectedDate ? holidays[selectedDate] : null
  const selectedLogs = selectedDate ? (logs[selectedDate] || []) : []

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-muted hover:text-foreground">
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-bold text-foreground">
          {year}년 {month}���
        </h3>
        <button onClick={nextMonth} className="p-2 text-muted hover:text-foreground">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs text-muted py-1">{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayLogs = logs[dateStr] || []
          const isToday = dateStr === new Date().toISOString().slice(0, 10)
          const holiday = holidays[dateStr]
          const isSelected = dateStr === selectedDate

          return (
            <div
              key={day}
              onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative cursor-pointer transition-colors',
                isToday && 'ring-1 ring-accent',
                isSelected && 'bg-accent/20',
                dayLogs.length > 0 && !isSelected && 'bg-card-bg',
                holiday && 'border border-danger/30'
              )}
            >
              <span className={cn(
                'text-xs',
                holiday ? 'text-danger font-medium' : dayLogs.length > 0 ? 'text-foreground font-medium' : 'text-muted'
              )}>
                {day}
              </span>
              {dayLogs.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayLogs.map(type => (
                    <div
                      key={type}
                      className={cn('w-1.5 h-1.5 rounded-full', TYPE_COLORS[type])}
                    />
                  ))}
                </div>
              )}
              {holiday && !dayLogs.length && (
                <div className="w-1.5 h-1.5 rounded-full bg-danger/50 mt-0.5" />
              )}
            </div>
          )
        })}
      </div>

      {/* 선택된 날짜 정보 */}
      {selectedDate && (selectedHoliday || selectedLogs.length > 0) && (
        <div className="mt-4 p-3 bg-card-bg rounded-xl border border-card-border">
          <p className="text-xs text-muted mb-1">{selectedDate}</p>
          {selectedHoliday && (
            <div className="mb-2">
              <p className="text-sm font-bold text-danger">{selectedHoliday.name}</p>
              <p className="text-xs text-muted">{selectedHoliday.description}</p>
            </div>
          )}
          {selectedLogs.length > 0 && (
            <div className="flex gap-2">
              {selectedLogs.map(type => (
                <span key={type} className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                  {type === 'bae108' ? '108배' : type === 'meditation' ? '명상' : '예불'}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-muted">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>108배</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span>명상</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>예불</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-danger/50" />
          <span>기념일</span>
        </div>
      </div>
    </div>
  )
}

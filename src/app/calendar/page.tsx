'use client'

import { StreakCalendar } from '@/components/streak-calendar'

export default function CalendarPage() {
  return (
    <div className="px-5 py-8 space-y-6">
      <div className="text-center animate-in">
        <h1 className="text-2xl font-bold">
          <span className="gradient-text">수행 캘린더</span>
        </h1>
        <p className="text-sm text-muted mt-1.5">꾸준한 수행의 발자취</p>
      </div>

      <div className="animate-in stagger-1">
        <StreakCalendar />
      </div>
    </div>
  )
}

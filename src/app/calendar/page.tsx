'use client'

import { StreakCalendar } from '@/components/streak-calendar'

export default function CalendarPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">수행 캘린더</h1>
        <p className="text-sm text-muted mt-1">꾸준한 수행의 발자취</p>
      </div>

      <StreakCalendar />
    </div>
  )
}

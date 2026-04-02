import { getSupabase } from '@/lib/supabase/client'
import type { PracticeType, DailyStatus, PracticeStats } from '@/types'
import { formatDate } from '@/lib/utils'

// 로컬 저장소 키
const LOCAL_KEY = 'haru-practice-logs'

interface LocalLog {
  type: PracticeType
  duration_sec: number
  count: number
  completed: boolean
  created_at: string
}

// 로컬에 수행 기록 저장 (비로그인 시)
function getLocalLogs(): LocalLog[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalLog(log: LocalLog) {
  const logs = getLocalLogs()
  logs.push(log)
  localStorage.setItem(LOCAL_KEY, JSON.stringify(logs))
}

// 수행 기록 저장
export async function savePractice(
  userId: string | null,
  type: PracticeType,
  durationSec: number,
  count: number,
  completed: boolean
) {
  const log: LocalLog = {
    type,
    duration_sec: durationSec,
    count,
    completed,
    created_at: new Date().toISOString(),
  }

  if (userId) {
    const { error } = await getSupabase().from('practice_logs').insert({
      user_id: userId,
      ...log,
    })
    if (error) {
      console.error('수행 기록 저장 실패:', error)
      saveLocalLog(log)
    }
  } else {
    saveLocalLog(log)
  }
}

// 오늘의 수행 상태 조회
export async function getTodayStatus(userId: string | null): Promise<DailyStatus> {
  const today = formatDate(new Date())
  const status: DailyStatus = { bae108: false, meditation: false, yeobul: false }

  if (userId) {
    const { data } = await getSupabase()
      .from('practice_logs')
      .select('type')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`)

    data?.forEach(log => {
      if (log.type === 'bae108') status.bae108 = true
      if (log.type === 'meditation') status.meditation = true
      if (log.type === 'yeobul') status.yeobul = true
    })
  } else {
    const logs = getLocalLogs()
    logs
      .filter(l => l.completed && l.created_at.startsWith(today))
      .forEach(l => {
        if (l.type === 'bae108') status.bae108 = true
        if (l.type === 'meditation') status.meditation = true
        if (l.type === 'yeobul') status.yeobul = true
      })
  }

  return status
}

// 수행 통계 조회
export async function getPracticeStats(userId: string | null): Promise<PracticeStats> {
  const stats: PracticeStats = {
    streak: 0,
    totalDays: 0,
    totalBae108: 0,
    totalMeditation: 0,
    totalYeobul: 0,
  }

  let completedDates: Set<string>

  if (userId) {
    const { data } = await getSupabase()
      .from('practice_logs')
      .select('type, created_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('created_at', { ascending: false })

    if (!data) return stats

    completedDates = new Set(data.map(l => l.created_at.slice(0, 10)))
    stats.totalBae108 = data.filter(l => l.type === 'bae108').length
    stats.totalMeditation = data.filter(l => l.type === 'meditation').length
    stats.totalYeobul = data.filter(l => l.type === 'yeobul').length
  } else {
    const logs = getLocalLogs().filter(l => l.completed)
    completedDates = new Set(logs.map(l => l.created_at.slice(0, 10)))
    stats.totalBae108 = logs.filter(l => l.type === 'bae108').length
    stats.totalMeditation = logs.filter(l => l.type === 'meditation').length
    stats.totalYeobul = logs.filter(l => l.type === 'yeobul').length
  }

  stats.totalDays = completedDates.size

  // 연속 수행일 계산
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (completedDates.has(formatDate(d))) {
      stats.streak++
    } else {
      break
    }
  }

  return stats
}

// 캘린더용 월별 기록 조회
export async function getMonthlyLogs(
  userId: string | null,
  year: number,
  month: number
): Promise<Record<string, PracticeType[]>> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  const result: Record<string, PracticeType[]> = {}

  let logs: { type: string; created_at: string }[]

  if (userId) {
    const { data } = await getSupabase()
      .from('practice_logs')
      .select('type, created_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('created_at', startDate)
      .lt('created_at', endDate)

    logs = data || []
  } else {
    logs = getLocalLogs()
      .filter(l => l.completed && l.created_at >= startDate && l.created_at < endDate)
  }

  logs.forEach(l => {
    const date = l.created_at.slice(0, 10)
    if (!result[date]) result[date] = []
    if (!result[date].includes(l.type as PracticeType)) {
      result[date].push(l.type as PracticeType)
    }
  })

  return result
}

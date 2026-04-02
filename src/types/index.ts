export type PracticeType = 'bae108' | 'meditation' | 'yeobul'

export interface PracticeLog {
  id: string
  user_id: string
  type: PracticeType
  duration_sec: number
  count: number
  completed: boolean
  created_at: string
}

export interface DailyWisdom {
  id: number
  date: string
  sutra_text: string
  source: string
  ai_commentary: string | null
  created_at: string
}

export interface DailyStatus {
  bae108: boolean
  meditation: boolean
  yeobul: boolean
}

export interface PracticeStats {
  streak: number
  totalDays: number
  totalBae108: number
  totalMeditation: number
  totalYeobul: number
}

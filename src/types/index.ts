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

// ===== 챌린지 =====

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'seasonal' | 'special' | 'continuous'
  start_date: string
  end_date: string
  target_days: number
  badge_emoji: string
  created_at: string
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  joined_at: string
  completed: boolean
  completed_at: string | null
}

export interface ChallengeWithProgress extends Challenge {
  joined: boolean
  progress_days: number
  participant_count: number
}

// ===== 도반 그룹 =====

export interface UserProfile {
  user_id: string
  display_name: string
  avatar_emoji: string
}

export interface Group {
  id: string
  name: string
  invite_code: string
  owner_id: string
  max_members: number
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
}

export interface GroupReaction {
  id: string
  group_id: string
  from_user_id: string
  to_user_id: string
  reaction: string
  date: string
}

export interface GroupMemberStatus {
  user_id: string
  display_name: string
  avatar_emoji: string
  today_bae108: boolean
  today_meditation: boolean
  today_yeobul: boolean
  streak: number
  reactions_received: number
  has_reacted: boolean
}

export interface GroupWithStats extends Group {
  member_count: number
}

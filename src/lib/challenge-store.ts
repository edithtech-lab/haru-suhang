import { getSupabase } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { ChallengeWithProgress } from '@/types'

// 챌린지 목록 + 참여 여부
export async function getChallenges(userId: string | null): Promise<ChallengeWithProgress[]> {
  const supabase = getSupabase()
  const today = formatDate(new Date())

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .gte('end_date', today)
    .order('start_date', { ascending: true })

  if (!challenges) return []

  // 참여자수 뷰
  const { data: counts } = await supabase
    .from('challenge_participant_counts')
    .select('challenge_id, participant_count')

  const countMap = new Map(counts?.map(c => [c.challenge_id, c.participant_count]) ?? [])

  // 내 참여 정보
  let myParticipations = new Set<string>()
  if (userId) {
    const { data: parts } = await supabase
      .from('challenge_participants')
      .select('challenge_id')
      .eq('user_id', userId)

    myParticipations = new Set(parts?.map(p => p.challenge_id) ?? [])
  }

  // 진행도 계산
  const results: ChallengeWithProgress[] = []
  for (const ch of challenges) {
    let progress_days = 0
    if (userId && myParticipations.has(ch.id)) {
      progress_days = await getChallengeProgress(userId, ch.id, ch.start_date, ch.end_date)
    }

    results.push({
      ...ch,
      joined: myParticipations.has(ch.id),
      progress_days,
      participant_count: countMap.get(ch.id) ?? 0,
    })
  }

  return results
}

// practice_logs에서 기간 내 고유 날짜 수 집계
export async function getChallengeProgress(
  userId: string,
  _challengeId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('practice_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('created_at', `${startDate}T00:00:00`)
    .lte('created_at', `${endDate}T23:59:59`)

  if (!data) return 0

  const uniqueDates = new Set(data.map(l => l.created_at.slice(0, 10)))
  return uniqueDates.size
}

// 챌린지 참여
export async function joinChallenge(userId: string, challengeId: string) {
  const { error } = await getSupabase()
    .from('challenge_participants')
    .insert({ challenge_id: challengeId, user_id: userId })

  if (error) throw new Error('챌린지 참여 실패: ' + error.message)
}

// 챌린지 탈퇴
export async function leaveChallenge(userId: string, challengeId: string) {
  const { error } = await getSupabase()
    .from('challenge_participants')
    .delete()
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)

  if (error) throw new Error('챌린지 탈퇴 실패: ' + error.message)
}

// 챌린지 완료 마킹
export async function markChallengeCompleted(userId: string, challengeId: string) {
  const { error } = await getSupabase()
    .from('challenge_participants')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)

  if (error) throw new Error('챌린지 완료 처리 실패: ' + error.message)
}

// 홈 위젯용: 활성 참여 챌린지 1건
export async function getActiveChallengeForWidget(userId: string): Promise<ChallengeWithProgress | null> {
  const supabase = getSupabase()
  const today = formatDate(new Date())

  // 내가 참여한 활성 챌린지
  const { data: parts } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .eq('user_id', userId)
    .eq('completed', false)

  if (!parts?.length) return null

  const challengeIds = parts.map(p => p.challenge_id)

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .in('id', challengeIds)
    .gte('end_date', today)
    .lte('start_date', today)
    .order('end_date', { ascending: true })
    .limit(1)

  if (!challenges?.length) return null

  const ch = challenges[0]
  const progress_days = await getChallengeProgress(userId, ch.id, ch.start_date, ch.end_date)

  const { data: counts } = await supabase
    .from('challenge_participant_counts')
    .select('participant_count')
    .eq('challenge_id', ch.id)
    .single()

  return {
    ...ch,
    joined: true,
    progress_days,
    participant_count: counts?.participant_count ?? 0,
  }
}

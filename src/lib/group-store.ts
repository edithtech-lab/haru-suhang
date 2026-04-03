import { getSupabase } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { UserProfile, GroupWithStats, GroupMemberStatus } from '@/types'

// ===== 프로필 =====

export async function getOrCreateProfile(userId: string): Promise<UserProfile> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (data) return data

  const profile: UserProfile = {
    user_id: userId,
    display_name: '수행자',
    avatar_emoji: '🙏',
  }

  await supabase.from('user_profiles').insert(profile)
  return profile
}

export async function updateProfile(userId: string, updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_emoji'>>) {
  const { error } = await getSupabase()
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) throw new Error('프로필 업데이트 실패: ' + error.message)
}

// ===== 그룹 =====

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function createGroup(userId: string, name: string): Promise<string> {
  const supabase = getSupabase()

  // 프로필 보장
  await getOrCreateProfile(userId)

  // 내 그룹 수 제한 (최대 5개)
  const { data: myGroups } = await supabase
    .from('group_members')
    .select('id')
    .eq('user_id', userId)

  if (myGroups && myGroups.length >= 5) {
    throw new Error('최대 5개 그룹까지 참여할 수 있습니다')
  }

  const invite_code = generateInviteCode()

  const { data, error } = await supabase
    .from('groups')
    .insert({ name, invite_code, owner_id: userId })
    .select('id')
    .single()

  if (error) throw new Error('그룹 생성 실패: ' + error.message)

  // 오너를 멤버로 등록
  await supabase.from('group_members').insert({
    group_id: data.id,
    user_id: userId,
  })

  return data.id
}

export async function joinGroupByCode(userId: string, code: string): Promise<string> {
  const supabase = getSupabase()

  await getOrCreateProfile(userId)

  // 코드로 그룹 찾기
  const { data: group } = await supabase
    .from('groups')
    .select('id, max_members')
    .eq('invite_code', code.toUpperCase().trim())
    .single()

  if (!group) throw new Error('유효하지 않은 초대코드입니다')

  // 이미 멤버인지
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', userId)
    .single()

  if (existing) throw new Error('이미 참여 중인 그룹입니다')

  // 정원 체크
  const { count } = await supabase
    .from('group_members')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', group.id)

  if (count !== null && count >= group.max_members) {
    throw new Error('그룹 정원이 가득 찼습니다')
  }

  // 내 그룹 수 제한
  const { data: myGroups } = await supabase
    .from('group_members')
    .select('id')
    .eq('user_id', userId)

  if (myGroups && myGroups.length >= 5) {
    throw new Error('최대 5개 그룹까지 참여할 수 있습니다')
  }

  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId })

  if (error) throw new Error('그룹 참여 실패: ' + error.message)

  return group.id
}

export async function getMyGroups(userId: string): Promise<GroupWithStats[]> {
  const supabase = getSupabase()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  if (!memberships?.length) return []

  const groupIds = memberships.map(m => m.group_id)

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: false })

  if (!groups) return []

  const results: GroupWithStats[] = []
  for (const g of groups) {
    const { count } = await supabase
      .from('group_members')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', g.id)

    results.push({ ...g, member_count: count ?? 0 })
  }

  return results
}

export async function getGroupDashboard(
  userId: string,
  groupId: string
): Promise<{ group: GroupWithStats; members: GroupMemberStatus[] }> {
  const supabase = getSupabase()
  const today = formatDate(new Date())

  // 그룹 정보
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) throw new Error('그룹을 찾을 수 없습니다')

  // 멤버 목록
  const { data: memberRows } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)

  if (!memberRows) throw new Error('멤버 조회 실패')

  const memberIds = memberRows.map(m => m.user_id)

  // 프로필
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', memberIds)

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? [])

  // 오늘 수행 기록
  const { data: todayLogs } = await supabase
    .from('practice_logs')
    .select('user_id, type')
    .in('user_id', memberIds)
    .eq('completed', true)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`)

  const logMap = new Map<string, Set<string>>()
  todayLogs?.forEach(l => {
    if (!logMap.has(l.user_id)) logMap.set(l.user_id, new Set())
    logMap.get(l.user_id)!.add(l.type)
  })

  // 오늘 합장 반응
  const { data: reactions } = await supabase
    .from('group_reactions')
    .select('from_user_id, to_user_id')
    .eq('group_id', groupId)
    .eq('date', today)

  const reactionsToMap = new Map<string, number>()
  const myReactions = new Set<string>()
  reactions?.forEach(r => {
    reactionsToMap.set(r.to_user_id, (reactionsToMap.get(r.to_user_id) ?? 0) + 1)
    if (r.from_user_id === userId) myReactions.add(r.to_user_id)
  })

  // 연속 수행일 (간이 계산 - 최근 7일 데이터만)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: recentLogs } = await supabase
    .from('practice_logs')
    .select('user_id, created_at')
    .in('user_id', memberIds)
    .eq('completed', true)
    .gte('created_at', formatDate(weekAgo))
    .order('created_at', { ascending: false })

  const streakMap = new Map<string, number>()
  const userDatesMap = new Map<string, Set<string>>()
  recentLogs?.forEach(l => {
    if (!userDatesMap.has(l.user_id)) userDatesMap.set(l.user_id, new Set())
    userDatesMap.get(l.user_id)!.add(l.created_at.slice(0, 10))
  })

  for (const [uid, dates] of userDatesMap) {
    let streak = 0
    const d = new Date()
    for (let i = 0; i < 8; i++) {
      if (dates.has(formatDate(d))) {
        streak++
      } else {
        break
      }
      d.setDate(d.getDate() - 1)
    }
    streakMap.set(uid, streak)
  }

  const members: GroupMemberStatus[] = memberIds.map(uid => {
    const profile = profileMap.get(uid)
    const types = logMap.get(uid) ?? new Set()
    return {
      user_id: uid,
      display_name: profile?.display_name ?? '수행자',
      avatar_emoji: profile?.avatar_emoji ?? '🙏',
      today_bae108: types.has('bae108'),
      today_meditation: types.has('meditation'),
      today_yeobul: types.has('yeobul'),
      streak: streakMap.get(uid) ?? 0,
      reactions_received: reactionsToMap.get(uid) ?? 0,
      has_reacted: myReactions.has(uid),
    }
  })

  // 오늘 수행 완료가 많은 순으로 정렬
  members.sort((a, b) => {
    const aCount = [a.today_bae108, a.today_meditation, a.today_yeobul].filter(Boolean).length
    const bCount = [b.today_bae108, b.today_meditation, b.today_yeobul].filter(Boolean).length
    return bCount - aCount || b.streak - a.streak
  })

  return {
    group: { ...group, member_count: memberIds.length },
    members,
  }
}

export async function sendReaction(userId: string, groupId: string, toUserId: string) {
  const { error } = await getSupabase()
    .from('group_reactions')
    .insert({
      group_id: groupId,
      from_user_id: userId,
      to_user_id: toUserId,
      reaction: '🙏',
      date: formatDate(new Date()),
    })

  if (error) {
    if (error.code === '23505') throw new Error('오늘은 이미 합장을 보냈습니다')
    throw new Error('합장 전송 실패: ' + error.message)
  }
}

export async function leaveGroup(userId: string, groupId: string) {
  const supabase = getSupabase()

  // 오너인 경우 그룹 삭제
  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (group?.owner_id === userId) {
    await supabase.from('groups').delete().eq('id', groupId)
  } else {
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId)
  }
}

export function buildInviteLink(inviteCode: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/doban/join?code=${inviteCode}`
}

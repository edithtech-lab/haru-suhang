import { getSupabase } from '@/lib/supabase/client'
import type { ChatMessage } from '@/types'

// 최근 대화 로드
export async function getRecentMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('대화 기록 로드 실패:', error)
    return []
  }

  return data ?? []
}

// 메시지 저장
export async function saveMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage | null> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .insert({ user_id: userId, role, content })
    .select()
    .single()

  if (error) {
    console.error('메시지 저장 실패:', error)
    return null
  }

  return data
}

// 대화 기록 삭제
export async function clearChatHistory(userId: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('chat_messages')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('대화 기록 삭제 실패:', error)
    return false
  }

  return true
}

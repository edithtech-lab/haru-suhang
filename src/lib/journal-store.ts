import { getSupabase } from '@/lib/supabase/client'
import type { JournalEntry } from '@/types'

const LOCAL_KEY = 'haru-journal-entries'
const LOCAL_LIMIT = 50

// ===== 로컬(비로그인) =====

function loadLocal(): JournalEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocal(entries: JournalEntry[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, LOCAL_LIMIT)))
  } catch {
    // 저장 실패 무시
  }
}

// ===== 통합 API =====

/** 최근 저널 로드 (로그인 시 Supabase, 비로그인 시 localStorage) */
export async function loadJournal(userId: string | null): Promise<JournalEntry[]> {
  if (userId) {
    const { data, error } = await getSupabase()
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) {
      console.error('저널 로드 실패:', error)
      return []
    }
    return data ?? []
  }
  return loadLocal()
}

/** 저널 저장. 로그인 시 클라우드 + 로컬 양쪽, 비로그인 시 로컬만 */
export async function saveJournal(
  userId: string | null,
  entry: string,
  reply: string,
  emotion: string | null,
): Promise<JournalEntry> {
  const created: JournalEntry = {
    id: crypto.randomUUID(),
    user_id: userId ?? undefined,
    entry,
    reply,
    emotion,
    created_at: new Date().toISOString(),
  }

  if (userId) {
    const { data, error } = await getSupabase()
      .from('journal_entries')
      .insert({ user_id: userId, entry, reply, emotion })
      .select()
      .single()
    if (!error && data) {
      // 클라우드 ID로 갱신
      return data as JournalEntry
    }
    console.error('저널 클라우드 저장 실패, 로컬 폴백:', error)
  }

  // 비로그인 또는 클라우드 실패 시 로컬 저장
  const list = [created, ...loadLocal()]
  saveLocal(list)
  return created
}

/** 저널 삭제 */
export async function deleteJournal(userId: string | null, id: string): Promise<boolean> {
  if (userId) {
    const { error } = await getSupabase()
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) {
      console.error('저널 삭제 실패:', error)
      return false
    }
    return true
  }
  // 로컬에서 삭제
  const list = loadLocal().filter(e => e.id !== id)
  saveLocal(list)
  return true
}

/** 비로그인 → 로그인 시 로컬 데이터를 클라우드로 마이그레이션 (1회) */
export async function migrateLocalToCloud(userId: string): Promise<number> {
  const local = loadLocal()
  if (local.length === 0) return 0

  const sb = getSupabase()
  const rows = local.map(e => ({
    user_id: userId,
    entry: e.entry,
    reply: e.reply,
    emotion: e.emotion,
    created_at: e.created_at,
  }))

  const { error } = await sb.from('journal_entries').insert(rows)
  if (error) {
    console.error('저널 마이그레이션 실패:', error)
    return 0
  }
  // 마이그레이션 완료 → 로컬 비움
  saveLocal([])
  return rows.length
}

-- Phase 5: chat_messages 테이블 + RLS
-- 멱등(idempotent) — 테이블/정책 있든 없든 안전 실행
-- Supabase SQL Editor에서 실행

-- ============================================================
-- 1) 테이블 (없으면 생성)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_user_created_idx
  ON chat_messages(user_id, created_at);

-- ============================================================
-- 2) RLS 활성화
-- ============================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3) 정책 표준화
-- ============================================================
DROP POLICY IF EXISTS "chat_select_own" ON chat_messages;
CREATE POLICY "chat_select_own" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_insert_own" ON chat_messages;
CREATE POLICY "chat_insert_own" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_delete_own" ON chat_messages;
CREATE POLICY "chat_delete_own" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4) 검증
-- ============================================================
SELECT policyname, cmd, qual::text AS using_clause, with_check::text AS check_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'chat_messages'
ORDER BY policyname;

-- Phase 5: chat_messages RLS 점검 + 정상화
-- 멱등(idempotent) — 정책이 있든 없든 안전하게 실행
-- Supabase SQL Editor에서 실행

-- ============================================================
-- 1) RLS 활성화 (이미 활성이면 무영향)
-- ============================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2) 기존 정책 정리 후 표준 정책으로 재생성
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

-- update 정책 없음 (immutable, 삭제 후 재작성)

-- ============================================================
-- 3) 검증 쿼리 — 실행 후 결과 확인
-- ============================================================
-- 정책이 정확히 3개 보여야 함
SELECT policyname, cmd, qual::text AS using_clause, with_check::text AS check_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'chat_messages'
ORDER BY policyname;

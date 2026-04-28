-- Phase 4: AI 마음기록 (Journal) Supabase 마이그레이션
-- Supabase SQL Editor에서 실행
-- 의존: auth.users, gen_random_uuid()

-- ============================================================
-- journal_entries 테이블
-- ============================================================

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry text NOT NULL,           -- 사용자 입력 본문
  reply text NOT NULL,           -- AI(법현 스님) 응답
  emotion text,                  -- 감정 태그 (평온/기쁨/감사/불안/분노/슬픔/지침/혼란)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX journal_entries_user_created_idx ON journal_entries(user_id, created_at DESC);

-- ============================================================
-- RLS — 본인 데이터만 접근
-- ============================================================

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_select_own" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "journal_insert_own" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_delete_own" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- update는 허용 안 함 (immutable, 삭제 후 재작성)

-- Phase 3: 수행 챌린지 + 도반 그룹
-- Supabase SQL Editor에서 실행

-- ============================================================
-- 1. 챌린지 테이블
-- ============================================================

CREATE TABLE challenges (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('seasonal', 'special', 'continuous')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  target_days integer NOT NULL,
  badge_emoji text NOT NULL DEFAULT '🏆',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges_read" ON challenges FOR SELECT USING (true);

-- ============================================================
-- 2. 챌린지 참여자
-- ============================================================

CREATE TABLE challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE (challenge_id, user_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp_read_own" ON challenge_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cp_insert_own" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp_update_own" ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cp_delete_own" ON challenge_participants FOR DELETE USING (auth.uid() = user_id);

-- 참여자수 뷰
CREATE VIEW challenge_participant_counts AS
  SELECT challenge_id, count(*)::int AS participant_count
  FROM challenge_participants
  GROUP BY challenge_id;

-- ============================================================
-- 3. 사용자 프로필
-- ============================================================

CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '수행자',
  avatar_emoji text NOT NULL DEFAULT '🙏',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_read" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "profile_insert_own" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profile_update_own" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 4. 도반 그룹
-- ============================================================

CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members integer NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
-- 그룹 멤버만 조회 가능
CREATE POLICY "group_read_member" ON groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND user_id = auth.uid())
  OR owner_id = auth.uid()
);
-- 초대코드로 조회 (참여 시)
CREATE POLICY "group_read_by_code" ON groups FOR SELECT USING (true);
CREATE POLICY "group_insert" ON groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "group_delete_owner" ON groups FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================
-- 5. 그룹 멤버
-- ============================================================

CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gm_read_member" ON group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm2 WHERE gm2.group_id = group_members.group_id AND gm2.user_id = auth.uid())
);
CREATE POLICY "gm_insert_own" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gm_delete_own" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 6. 합장 반응
-- ============================================================

CREATE TABLE group_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL DEFAULT '🙏',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, from_user_id, to_user_id, date)
);

ALTER TABLE group_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gr_read_member" ON group_reactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_reactions.group_id AND user_id = auth.uid())
);
CREATE POLICY "gr_insert_own" ON group_reactions FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- ============================================================
-- 7. practice_logs RLS 추가: 같은 그룹 멤버 조회 허용
-- ============================================================

CREATE POLICY "pl_read_group_member" ON practice_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() AND gm2.user_id = practice_logs.user_id
  )
);

-- ============================================================
-- 8. 초기 챌린지 데이터
-- ============================================================

INSERT INTO challenges (id, title, description, type, start_date, end_date, target_days, badge_emoji) VALUES
  ('2026-buddha-birthday', '부처님 오신 날 수행', '부처님 오신 날(음력 4월 8일)을 기념하여 7일간 매일 수행합니다', 'seasonal', '2026-05-18', '2026-05-24', 7, '🪷'),
  ('2026-spring-retreat', '봄 안거 정진', '봄 안거 기간 동안 21일 연속 수행에 도전합니다', 'seasonal', '2026-04-15', '2026-05-05', 21, '🌸'),
  ('108-challenge', '108일 연속 수행', '108일 동안 하루도 빠짐없이 수행합니다. 언제든 시작 가능!', 'continuous', '2026-01-01', '2026-12-31', 108, '📿'),
  ('30-day-meditation', '30일 명상 챌린지', '30일간 매일 명상 수행을 완수합니다', 'special', '2026-04-01', '2026-04-30', 30, '🧘');

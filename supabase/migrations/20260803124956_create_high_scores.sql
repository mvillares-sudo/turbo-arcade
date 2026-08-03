/*
# Create high_scores table (single-tenant, no auth)

## Purpose
Stores per-game high scores for the car minigames arcade. The app has no
sign-in screen, so scores are intentionally public/shared — any visitor can
read the leaderboard and submit a score with a nickname.

1. New Tables
- `high_scores`
  - `id` (uuid, primary key)
  - `game_id` (text, not null) — slug identifying which game the score belongs to
  - `nickname` (text, not null) — player display name (max 20 chars, enforced by app)
  - `score` (integer, not null) — the player's score
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `high_scores`.
- Allow anon + authenticated to read all scores (shared leaderboard).
- Allow anon + authenticated to insert scores.
- No update or delete — scores are immutable once submitted.

3. Indexes
- `idx_high_scores_game_score` on (game_id, score DESC) for fast leaderboard queries.
*/

CREATE TABLE IF NOT EXISTS high_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL,
  nickname text NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 20),
  score integer NOT NULL CHECK (score >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_high_scores" ON high_scores;
CREATE POLICY "anon_select_high_scores"
ON high_scores FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_high_scores" ON high_scores;
CREATE POLICY "anon_insert_high_scores"
ON high_scores FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_high_scores_game_score
ON high_scores (game_id, score DESC);

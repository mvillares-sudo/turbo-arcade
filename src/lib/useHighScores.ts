import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { ScoreEntry } from './types';

interface SubmitResult {
  success: boolean;
  isHighScore: boolean;
  rank: number;
}

export function useHighScores(gameId: string | null) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('high_scores')
      .select('id, game_id, nickname, score, created_at')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);
    if (error) {
      setError(error.message);
    } else {
      setScores(data ?? []);
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const submitScore = useCallback(
    async (nickname: string, score: number): Promise<SubmitResult> => {
      if (!gameId || score <= 0) {
        return { success: false, isHighScore: false, rank: -1 };
      }
      const name = nickname.trim().slice(0, 20) || 'Player';
      const { data, error } = await supabase
        .from('high_scores')
        .insert({ game_id: gameId, nickname: name, score })
        .select('id, game_id, nickname, score, created_at')
        .single();
      if (error) {
        setError(error.message);
        return { success: false, isHighScore: false, rank: -1 };
      }
      const { count } = await supabase
        .from('high_scores')
        .select('id', { count: 'exact', head: true })
        .eq('game_id', gameId)
        .gt('score', score);
      const rank = (count ?? 0) + 1;
      void data;
      await fetchScores();
      return { success: true, isHighScore: rank <= 10, rank };
    },
    [gameId, fetchScores],
  );

  return { scores, loading, error, submitScore, refresh: fetchScores };
}

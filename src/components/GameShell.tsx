import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Send, Loader2, AlertCircle } from 'lucide-react';
import { link, navigate } from '@/lib/router';
import type { GameMeta } from '@/lib/types';
import { useHighScores } from '@/lib/useHighScores';
import { GameIcon } from './GameIcon';

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Hard: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
};

interface GameShellProps {
  game: GameMeta;
  onRestartRequest: () => void;
  children: (props: { onScore: (score: number) => void; onGameOver: (score: number) => void }) => React.ReactNode;
}

export function GameShell({ game, onRestartRequest, children }: GameShellProps) {
  const { scores, loading, error, submitScore } = useHighScores(game.slug);
  const [currentScore, setCurrentScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const handleScore = useCallback((s: number) => setCurrentScore(s), []);
  const handleGameOver = useCallback((s: number) => { setFinalScore(s); setCurrentScore(s); }, []);
  const handleRestart = useCallback(() => { setFinalScore(null); setCurrentScore(0); setSubmitMsg(null); setNickname(''); onRestartRequest(); }, [onRestartRequest]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalScore === null || finalScore <= 0) return;
    setSubmitting(true); setSubmitMsg(null);
    const res = await submitScore(nickname, finalScore);
    setSubmitting(false);
    if (res.success) { setSubmitMsg(res.isHighScore ? `Submitted! You ranked #${res.rank} on the leaderboard.` : `Submitted! Your score: ${finalScore}.`); setNickname(''); }
    else setSubmitMsg('Could not submit score. Please try again.');
  }, [finalScore, nickname, submitScore]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/'); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <button onClick={() => navigate('/')} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-600 dark:hover:text-brand-400">
        <ArrowLeft className="h-4 w-4" /> All games
      </button>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: game.accent }}>
            <GameIcon name={game.icon} className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{game.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{game.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${DIFFICULTY_STYLES[game.difficulty]}`}>{game.difficulty}</span>
          <span className="badge bg-slate-100 capitalize text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">{game.category}</span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400"><Trophy className="h-4 w-4 text-accent-500" /> Score</div>
            <div className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{currentScore.toLocaleString()}</div>
            <button onClick={handleRestart} className="btn-ghost px-3 py-1.5 text-sm"><RotateCcw className="h-4 w-4" /> Restart</button>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-900 no-select flex items-center justify-center min-h-[400px]">
            {children({ onScore: handleScore, onGameOver: handleGameOver })}
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Controls</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {game.controls.map((c) => (<kbd key={c} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">{c}</kbd>))}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{game.description}</p>
        </div>
        <aside className="space-y-4">
          {finalScore !== null && (
            <div className="card animate-scale-in p-5">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Game Over</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">You scored <span className="font-bold text-brand-600 dark:text-brand-400">{finalScore.toLocaleString()}</span> points.</p>
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Save to leaderboard</span>
                  <div className="mt-1.5 flex gap-2">
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 20))} placeholder="Your nickname" maxLength={20} className="input flex-1" />
                    <button type="submit" disabled={submitting} className="btn-primary px-3">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
                  </div>
                </label>
                {submitMsg && <p className="text-sm font-medium text-brand-600 dark:text-brand-400">{submitMsg}</p>}
                <button onClick={handleRestart} className="btn-outline w-full"><RotateCcw className="h-4 w-4" /> Play again</button>
              </form>
            </div>
          )}
          <div className="card p-5">
            <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent-500" /><h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Leaderboard</h3></div>
            {loading ? (<div className="flex items-center justify-center py-8 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>)
            : error ? (<div className="flex items-center gap-2 py-4 text-sm text-rose-500"><AlertCircle className="h-4 w-4" /> Could not load scores</div>)
            : scores.length === 0 ? (<p className="py-6 text-center text-sm text-slate-400">No scores yet. Be the first!</p>)
            : (<ol className="mt-3 space-y-1.5">{scores.map((s, i) => (<li key={s.id} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-700/40"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : i === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200' : i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700/50'}`}>{i + 1}</span><span className="flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{s.nickname}</span><span className="font-display text-sm font-bold tabular-nums text-slate-900 dark:text-white">{s.score.toLocaleString()}</span></li>))}</ol>)}
          </div>
          <div className="card p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">More games</h3>
            <a href={link('/')} className="mt-3 flex items-center justify-between text-sm font-semibold text-brand-600 dark:text-brand-400">Browse all 16 games <ArrowLeft className="h-4 w-4 rotate-180" /></a>
          </div>
        </aside>
      </div>
    </div>
  );
}

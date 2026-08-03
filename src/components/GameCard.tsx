import { Play, ChevronRight } from 'lucide-react';
import type { GameMeta } from '@/lib/types';
import { GameIcon } from './GameIcon';
import { link } from '@/lib/router';

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Hard: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
};

export function GameCard({ game, index = 0 }: { game: GameMeta; index?: number }) {
  return (
    <a
      href={link(`/game/${game.slug}`)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${game.accent}22, ${game.accent}55)` }}
      >
        <div
          className="absolute inset-0 opacity-20 transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, ${game.accent} 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${game.accent} 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            style={{ backgroundColor: game.accent }}
          >
            <GameIcon name={game.icon} className="h-8 w-8" />
          </div>
        </div>
        <div className="absolute left-3 top-3">
          <span className={`badge ${DIFFICULTY_STYLES[game.difficulty]}`}>{game.difficulty}</span>
        </div>
        <div className="absolute right-3 top-3">
          <span className="badge bg-white/80 text-slate-700 capitalize backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">
            {game.category}
          </span>
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all duration-300 group-hover:bg-slate-900/40 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-600 shadow-2xl">
            <Play className="h-6 w-6 fill-current" />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
          {game.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {game.tagline}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">
            {game.controls.slice(0, 2).join(' · ')}
          </span>
          <span className="flex items-center gap-0.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
            Play <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

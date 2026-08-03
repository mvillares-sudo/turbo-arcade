import { useState } from 'react';
import { Gamepad2, Search, Sparkles, TrendingUp, Car, ArrowRight } from 'lucide-react';
import { getAllGames, getFeaturedGames } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { link, navigate } from '@/lib/router';
import type { GameCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<GameCategory | 'all', string> = { all: 'All Games', racing: 'Racing', parking: 'Parking', dodge: 'Dodge', puzzle: 'Puzzle', action: 'Action', skill: 'Skill' };
const HERO_IMG = 'https://images.pexels.com/photos/33074675/pexels-photo-33074675.jpeg?auto=compress&cs=tinysrgb&w=1600';
const DRIFT_IMG = 'https://images.pexels.com/photos/25637489/pexels-photo-25637489.jpeg?auto=compress&cs=tinysrgb&w=1200';

export function HomePage() {
  const allGames = getAllGames();
  const featured = getFeaturedGames();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GameCategory | 'all'>('all');
  const filtered = allGames.filter((g) => { const matchesCat = category === 'all' || g.category === category; const matchesQuery = !query || g.title.toLowerCase().includes(query.toLowerCase()) || g.tagline.toLowerCase().includes(query.toLowerCase()); return matchesCat && matchesQuery; });
  const categories = Object.keys(CATEGORY_LABELS) as (GameCategory | 'all')[];

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0"><img src={HERO_IMG} alt="Race car at speed" className="h-full w-full object-cover" loading="eager" /><div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-slate-50 dark:to-slate-950" /></div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28"><div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm ring-1 ring-white/20"><Sparkles className="h-4 w-4 text-accent-400" />16 free car games — no download</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">Turbo <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">Arcade</span></h1>
          <p className="mt-4 max-w-xl text-lg text-slate-200">Race, drift, park, dodge and puzzle your way through a garage full of fun car minigames. Pick a game, beat your high score, and climb the leaderboard.</p>
          <div className="mt-8 flex flex-wrap gap-3"><button onClick={() => navigate(`/game/${featured[0].slug}`)} className="btn-accent text-base"><Gamepad2 className="h-5 w-5" /> Play featured</button><a href="#games-grid" className="btn bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm hover:bg-white/20">Browse all games <ArrowRight className="h-4 w-4" /></a></div>
        </div></div>
      </section>
      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-px sm:grid-cols-4">{[{ label: 'Car Games', value: '16' }, { label: 'Categories', value: '6' }, { label: 'Price', value: 'Free' }, { label: 'Downloads', value: '0' }].map((s) => (<div key={s.label} className="px-4 py-6 text-center"><div className="font-display text-3xl font-bold text-brand-600 dark:text-brand-400">{s.value}</div><div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{s.label}</div></div>))}</div></section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="mb-6 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent-500" /><h2 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">Featured Games</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((g, i) => (<GameCard key={g.slug} game={g} index={i} />))}</div></section>
      <section id="games-grid" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6"><div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-2"><Car className="h-5 w-5 text-brand-500" /><h2 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">All Games</h2></div><div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search games..." className="input pl-10" /></div></div><div className="mb-6 flex flex-wrap gap-2">{categories.map((cat) => (<button key={cat} onClick={() => setCategory(cat)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${category === cat ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>{CATEGORY_LABELS[cat]}</button>))}</div>{filtered.length > 0 ? (<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((g, i) => (<GameCard key={g.slug} game={g} index={i} />))}</div>) : (<div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center"><p className="text-slate-400">No games match your search.</p></div>)}</section>
      <section className="relative overflow-hidden"><img src={DRIFT_IMG} alt="Drift car at night" className="h-full w-full object-cover" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-950/50" /><div className="relative mx-auto max-w-7xl px-6 py-16"><div className="max-w-lg"><h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Love the arcade?</h2><p className="mt-3 text-slate-200">Turbo Arcade is free forever. If you're having fun, consider buying us a tank of gas — every donation keeps the servers running and new games rolling out.</p><a href={link('/donate')} className="btn-accent mt-6 text-base">Support Turbo Arcade <ArrowRight className="h-5 w-5" /></a></div></div></section>
    </div>
  );
}

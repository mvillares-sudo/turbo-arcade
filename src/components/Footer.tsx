import { Car, Heart, Github } from 'lucide-react';
import { link } from '@/lib/router';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <Car className="h-4 w-4" />
            </span>
            <span className="font-display font-bold text-slate-900 dark:text-white">
              Turbo<span className="text-brand-500">Arcade</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <a href={link('/')} className="text-slate-500 transition hover:text-brand-600 dark:hover:text-brand-400">
              All Games
            </a>
            <a href={link('/donate')} className="text-slate-500 transition hover:text-brand-600 dark:hover:text-brand-400">
              Donate & Credits
            </a>
          </div>

          <a
            href={link('/donate')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-accent-500"
          >
            Made with <Heart className="h-3.5 w-3.5 fill-accent-500 text-accent-500" /> for car fans
          </a>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Github className="h-3.5 w-3.5" />
          <span>© {new Date().getFullYear()} Turbo Arcade. All games are free to play.</span>
        </div>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Car, Menu, X, Sun, Moon, Heart, Home } from 'lucide-react';
import { link, navigate, useRouter } from '@/lib/router';
import { useTheme } from '@/lib/useTheme';

const NAV_LINKS = [
  { label: 'Games', path: '/' },
  { label: 'Donate', path: '/donate' },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const route = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? route.path === '/' : route.path.startsWith(path);

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-2.5 transition hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/30">
            <Car className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Turbo<span className="text-brand-500">Arcade</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.path}
              onClick={() => handleNav(l.path)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive(l.path)
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => handleNav('/donate')}
            className="hidden btn-accent px-3 py-2 text-sm sm:inline-flex"
          >
            <Heart className="h-4 w-4" /> Donate
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 md:hidden">
          <div className="space-y-1 px-4 py-3">
            <button
              onClick={() => handleNav('/')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Home className="h-4 w-4" /> Games
            </button>
            <button
              onClick={() => handleNav('/donate')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Heart className="h-4 w-4" /> Donate
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export { link };

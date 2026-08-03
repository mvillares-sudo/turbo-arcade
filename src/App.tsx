import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { DonatePage } from '@/pages/DonatePage';

const GamePage = lazy(() =>
  import('@/pages/GamePage').then((m) => ({ default: m.GamePage })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}

function App() {
  const route = useRouter();
  const path = route.path;

  let page: React.ReactNode;
  if (path === '/' || path === '') {
    page = <HomePage />;
  } else if (path === '/donate') {
    page = <DonatePage />;
  } else if (path.startsWith('/game/')) {
    const slug = path.replace('/game/', '');
    page = <GamePage slug={slug} />;
  } else {
    page = <HomePage />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>{page}</Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;

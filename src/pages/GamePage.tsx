import { Suspense, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getGameBySlug } from '@/lib/games';
import { gameLoader } from '@/lib/gameLoader';
import { navigate } from '@/lib/router';
import { GameShell } from '@/components/GameShell';

export function GamePage({ slug }: { slug: string }) {
  const game = getGameBySlug(slug);
  const [restartKey, setRestartKey] = useState(0);

  if (!game) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-slate-500">Game not found.</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to games
        </button>
      </div>
    );
  }

  const GameComponent = gameLoader[game.slug];
  if (!GameComponent) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-slate-500">This game isn't available yet.</p>
      </div>
    );
  }

  return (
    <GameShell
      game={game}
      onRestartRequest={() => setRestartKey((k) => k + 1)}
    >
      {({ onScore, onGameOver }) => (
        <Suspense
          key={restartKey}
          fallback={
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          }
        >
          <GameComponent key={restartKey} onScore={onScore} onGameOver={onGameOver} />
        </Suspense>
      )}
    </GameShell>
  );
}

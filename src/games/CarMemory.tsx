import { useEffect, useRef, useState } from 'react';
import { Car, Shuffle, Check } from 'lucide-react';
import type { GameProps } from '@/lib/gameLoader';

const BRANDS = [
  { name: 'Bolt', color: '#3b82f6' }, { name: 'Veloce', color: '#ef4444' },
  { name: 'Apex', color: '#22c55e' }, { name: 'Nova', color: '#f97316' },
  { name: 'Zenith', color: '#a855f7' }, { name: 'Drift', color: '#06b6d4' },
  { name: 'Raptor', color: '#eab308' }, { name: 'Comet', color: '#ec4899' },
];

interface Card { id: number; brandIndex: number; flipped: boolean; matched: boolean; }
const TOTAL_PAIRS = 8;

export default function CarMemory({ onScore, onGameOver }: GameProps) {
  const [cards, setCards] = useState<Card[]>(() => shuffle());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [lock, setLock] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const overRef = useRef(false);

  function shuffle(): Card[] {
    const deck = [...Array(8).keys(), ...Array(8).keys()];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck.map((brandIndex, id) => ({ id, brandIndex, flipped: false, matched: false }));
  }

  useEffect(() => {
    if (matches >= TOTAL_PAIRS) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    return () => clearInterval(t);
  }, [matches, startTime]);

  useEffect(() => {
    if (flipped.length === 2) {
      setLock(true); setMoves((m) => m + 1);
      const [a, b] = flipped;
      if (cards[a].brandIndex === cards[b].brandIndex) {
        setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setMatches((m) => m + 1); setFlipped([]); setLock(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setFlipped([]); setLock(false);
        }, 900);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    const score = Math.max(100, 1000 + matches * 100 - moves * 10 - elapsed * 2);
    onScore(score);
    if (matches >= TOTAL_PAIRS && !overRef.current) { overRef.current = true; onGameOver(score); }
  }, [matches, moves, elapsed]);

  const flip = (i: number) => {
    if (lock || cards[i].flipped || cards[i].matched) return;
    setCards((cs) => cs.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setFlipped((f) => [...f, i]);
  };

  const reset = () => {
    setCards(shuffle()); setFlipped([]); setMoves(0); setMatches(0); setLock(false); overRef.current = false;
  };

  return (
    <div className="w-full max-w-md p-4" style={{ width: 480 }}>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-white">Moves: {moves}</span>
        <span className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-white">Matches: {matches}/{TOTAL_PAIRS}</span>
        <span className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-white">{elapsed}s</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {cards.map((card, i) => {
          const brand = BRANDS[card.brandIndex];
          const show = card.flipped || card.matched;
          return (
            <button key={card.id} onClick={() => flip(i)}
              className="relative aspect-[3/4] rounded-xl transition-all duration-300"
              style={{ transform: show ? 'rotateY(0deg)' : 'rotateY(180deg)', transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 flex items-center justify-center rounded-xl transition-all"
                style={{ backgroundColor: show ? brand.color : '#334155', opacity: card.matched ? 0.6 : 1 }}>
                {show ? (
                  <div className="flex flex-col items-center gap-1">
                    <Car className="h-7 w-7 text-white" />
                    <span className="text-[10px] font-bold text-white">{brand.name}</span>
                  </div>
                ) : <Shuffle className="h-6 w-6 text-slate-500" />}
                {card.matched && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {matches >= TOTAL_PAIRS && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 py-3 text-emerald-300">
          <Check className="h-5 w-5" /> Cleared in {moves} moves and {elapsed}s!
          <button onClick={reset} className="ml-2 text-sm underline">Play again</button>
        </div>
      )}
    </div>
  );
}

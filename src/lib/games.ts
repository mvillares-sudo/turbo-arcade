import { GAMES } from './gameRegistry';

export function getAllGames() {
  return GAMES;
}

export function getGameBySlug(slug: string) {
  return GAMES.find((g) => g.slug === slug) ?? null;
}

export function getFeaturedGames() {
  return GAMES.filter((g) => g.featured);
}

export function getGamesByCategory() {
  const map = new Map<string, typeof GAMES>();
  for (const g of GAMES) {
    const arr = map.get(g.category) ?? [];
    arr.push(g);
    map.set(g.category, arr);
  }
  return map;
}

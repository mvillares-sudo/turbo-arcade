export type GameCategory = 'racing' | 'parking' | 'dodge' | 'puzzle' | 'action' | 'skill';

export interface GameMeta {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: GameCategory;
  icon: string;
  accent: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  controls: string[];
  featured?: boolean;
}

export interface ScoreEntry {
  id: string;
  game_id: string;
  nickname: string;
  score: number;
  created_at: string;
}

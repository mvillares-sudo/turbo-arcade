import { lazy } from 'react';

export const gameLoader: Record<string, React.LazyExoticComponent<React.ComponentType<GameProps>>> = {
  'highway-rush': lazy(() => import('@/games/HighwayRush')),
  'parking-master': lazy(() => import('@/games/ParkingMaster')),
  'drift-circle': lazy(() => import('@/games/DriftCircle')),
  'taxi-frenzy': lazy(() => import('@/games/TaxiFrenzy')),
  'reflex-lights': lazy(() => import('@/games/ReflexLights')),
  'fuel-run': lazy(() => import('@/games/FuelRun')),
  'drag-reaction': lazy(() => import('@/games/DragReaction')),
  'car-memory': lazy(() => import('@/games/CarMemory')),
  'traffic-jam': lazy(() => import('@/games/TrafficJam')),
  'overtake': lazy(() => import('@/games/Overtake')),
  'color-match-cars': lazy(() => import('@/games/ColorMatchCars')),
  'road-maze': lazy(() => import('@/games/RoadMaze')),
  'wheel-spin': lazy(() => import('@/games/WheelSpin')),
  'rally-countdown': lazy(() => import('@/games/RallyCountdown')),
  'lane-weaver': lazy(() => import('@/games/LaneWeaver')),
  'night-drive': lazy(() => import('@/games/NightDrive')),
};

export interface GameProps {
  onScore: (score: number) => void;
  onGameOver: (score: number) => void;
}

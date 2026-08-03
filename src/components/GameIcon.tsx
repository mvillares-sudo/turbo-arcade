import {
  Car,
  ParkingCircle,
  CircleDot,
  CarTaxiFront,
  TrafficCone,
  Fuel,
  Flag,
  Brain,
  Grid3x3,
  Split,
  Palette,
  Navigation,
  Disc3,
  Timer,
  GitBranch,
  Moon,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Car,
  ParkingCircle,
  CircleDot,
  CarTaxiFront,
  TrafficCone,
  Fuel,
  Flag,
  Brain,
  Grid3x3,
  Split,
  Palette,
  Navigation,
  Disc3,
  Timer,
  GitBranch,
  Moon,
};

export function GameIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Car;
  return <Icon className={className} />;
}

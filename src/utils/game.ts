import type { PracticeStats } from '../types';

export function calculateStars(stats: PracticeStats): number {
  if (stats.wrongCharIds.length === 0) {
    return 3;
  }

  if (stats.wrongCharIds.length === 1) {
    return 2;
  }

  return 1;
}

export function renderStars(stars: number): string {
  return '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
}

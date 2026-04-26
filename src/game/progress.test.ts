import { describe, expect, it } from 'vitest';
import {
  getLevelNumber,
  getLevelProgress,
  getMissionNumber,
  getMissionStops,
  getStarScore,
  isRewardUnlocked,
} from './progress';

describe('game progress helpers', () => {
  it('starts from level 3, 25 stars, and mission 7', () => {
    expect(getLevelNumber()).toBe(3);
    expect(getStarScore(0)).toBe(25);
    expect(getLevelProgress(0)).toEqual({ current: 120, max: 200 });
    expect(getMissionNumber(0)).toBe(7);
  });

  it('adds stars and progress after correct missions', () => {
    expect(getStarScore(2)).toBe(35);
    expect(getLevelProgress(2)).toEqual({ current: 152, max: 200 });
  });

  it('marks completed, current, and locked mission stops', () => {
    expect(getMissionStops(7, 0).map((stop) => stop.status)).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'current',
      'locked',
      'locked',
      'locked',
    ]);
  });

  it('unlocks rewards after a completed mission', () => {
    expect(isRewardUnlocked(0)).toBe(false);
    expect(isRewardUnlocked(1)).toBe(true);
  });
});

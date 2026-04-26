import { beforeEach, describe, expect, it } from 'vitest';
import {
  PROGRESS_STORAGE_KEY,
  awardMission,
  isExplorationComplete,
  getLevelNumber,
  getLevelProgress,
  getInitialProgress,
  getMissionNumber,
  getMissionStops,
  restartExploration,
  getStarScore,
  isRewardUnlocked,
  moveMissionCursor,
  readStoredProgress,
  writeStoredProgress,
} from './progress';

describe('game progress helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts new learners from level 1, 0 experience, 0 stars, and mission 1', () => {
    const progress = getInitialProgress();

    expect(progress).toEqual({
      completedStops: 0,
      experience: 0,
      stars: 0,
      nextMissionIndex: 0,
    });
    expect(getLevelNumber(progress.experience)).toBe(1);
    expect(getStarScore(progress.stars)).toBe(0);
    expect(getLevelProgress(progress.experience)).toEqual({ current: 0, max: 100 });
    expect(getMissionNumber(progress.completedStops)).toBe(1);
  });

  it('adds stars and experience after correct missions', () => {
    const progress = awardMission(awardMission(getInitialProgress(), 1), 2);

    expect(progress.completedStops).toBe(2);
    expect(getStarScore(progress.stars)).toBe(10);
    expect(getLevelProgress(progress.experience)).toEqual({ current: 40, max: 100 });
  });

  it('levels up every 100 experience points', () => {
    let progress = getInitialProgress();

    for (let index = 0; index < 5; index += 1) {
      progress = awardMission(progress, progress.nextMissionIndex + 1);
    }

    expect(getLevelNumber(progress.experience)).toBe(2);
    expect(getLevelProgress(progress.experience)).toEqual({ current: 0, max: 100 });
  });

  it('marks a brand-new map as mission 1 current with 0 completed stops', () => {
    expect(getMissionStops(0).map((stop) => stop.status)).toEqual([
      'current',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
    ]);
  });

  it('marks completed, current, and locked mission stops after progress is earned', () => {
    expect(getMissionStops(3).map((stop) => stop.status)).toEqual([
      'completed',
      'completed',
      'completed',
      'current',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
    ]);
  });

  it('unlocks rewards after a completed mission', () => {
    expect(isRewardUnlocked(false)).toBe(false);
    expect(isRewardUnlocked(true)).toBe(true);
  });

  it('persists progress to local storage', () => {
    const storage = window.localStorage;
    const progress = awardMission(getInitialProgress(), 1);

    writeStoredProgress(progress, storage);

    expect(readStoredProgress(storage)).toEqual(progress);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toContain('"stars":5');
  });

  it('moves the next mission cursor without changing earned scores', () => {
    const progress = moveMissionCursor(getInitialProgress(), 4);

    expect(progress).toEqual({
      completedStops: 0,
      experience: 0,
      stars: 0,
      nextMissionIndex: 4,
    });
  });

  it('detects a completed exploration and restarts the map without removing scores', () => {
    let progress = getInitialProgress();

    for (let index = 0; index < 10; index += 1) {
      progress = awardMission(progress, progress.nextMissionIndex + 1);
    }

    expect(isExplorationComplete(progress.completedStops)).toBe(true);
    expect(getMissionStops(progress.completedStops).every((stop) => stop.status === 'completed')).toBe(true);

    expect(restartExploration(progress)).toEqual({
      completedStops: 0,
      experience: 200,
      stars: 50,
      nextMissionIndex: 10,
    });
  });
});

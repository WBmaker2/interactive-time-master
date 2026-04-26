export type MissionStop = {
  number: number;
  status: 'completed' | 'current' | 'locked';
};

const BASE_LEVEL = 3;
const BASE_STARS = 25;
const BASE_PROGRESS = 120;
const PROGRESS_MAX = 200;
const CURRENT_MISSION_NUMBER = 7;
const STARS_PER_MISSION = 5;
const PROGRESS_PER_MISSION = 16;
const MISSION_STOP_COUNT = 10;

export function getLevelNumber(): number {
  return BASE_LEVEL;
}

export function getLevelProgress(completedInSession: number): { current: number; max: number } {
  return {
    current: Math.min(PROGRESS_MAX, BASE_PROGRESS + Math.max(0, completedInSession) * PROGRESS_PER_MISSION),
    max: PROGRESS_MAX,
  };
}

export function getStarScore(completedInSession: number): number {
  return BASE_STARS + Math.max(0, completedInSession) * STARS_PER_MISSION;
}

export function getMissionNumber(missionIndex: number): number {
  return CURRENT_MISSION_NUMBER + Math.max(0, missionIndex);
}

export function getMissionStops(currentMissionNumber: number, completedInSession: number): MissionStop[] {
  const completedThrough = Math.min(
    MISSION_STOP_COUNT,
    Math.max(CURRENT_MISSION_NUMBER - 1, currentMissionNumber - 1 + completedInSession),
  );
  const current = Math.min(MISSION_STOP_COUNT, Math.max(1, currentMissionNumber));

  return Array.from({ length: MISSION_STOP_COUNT }, (_, index) => {
    const number = index + 1;

    if (number <= completedThrough) {
      return { number, status: 'completed' };
    }

    if (number === current) {
      return { number, status: 'current' };
    }

    return { number, status: 'locked' };
  });
}

export function isRewardUnlocked(completedInSession: number): boolean {
  return completedInSession > 0;
}

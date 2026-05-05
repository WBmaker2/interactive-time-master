export type MissionStop = {
  number: number;
  status: 'completed' | 'current' | 'locked';
};

export type LearningProgress = {
  completedStops: number;
  experience: number;
  stars: number;
  nextMissionIndex: number;
};

export type ProgressSummary = {
  level: number;
  levelExperience: number;
  levelExperienceMax: number;
  stars: number;
  completedStops: number;
  totalExplorationsCompleted: number;
  nextMissionIndex: number;
};

export const PROGRESS_STORAGE_KEY = 'interactive-time-master.progress.v1';

const INITIAL_PROGRESS: LearningProgress = {
  completedStops: 0,
  experience: 0,
  stars: 0,
  nextMissionIndex: 0,
};

const EXPERIENCE_PER_LEVEL = 100;
const EXPERIENCE_PER_MISSION = 20;
const STARS_PER_MISSION = 5;
export const MISSION_STOP_COUNT = 10;

function toSafeCount(value: unknown): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(Number(value))) : 0;
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.localStorage;
}

export function getInitialProgress(): LearningProgress {
  return { ...INITIAL_PROGRESS };
}

type StoredProgressShape = Partial<LearningProgress> & {
  totalSolved?: unknown;
};

export function sanitizeProgress(progress: StoredProgressShape | null | undefined): LearningProgress {
  if (!progress) {
    return getInitialProgress();
  }

  return {
    completedStops: Math.min(
      MISSION_STOP_COUNT,
      toSafeCount(progress.completedStops ?? progress.totalSolved),
    ),
    experience: toSafeCount(progress.experience),
    stars: toSafeCount(progress.stars),
    nextMissionIndex: toSafeCount(progress.nextMissionIndex),
  };
}

export function readStoredProgress(storage = getBrowserStorage()): LearningProgress {
  if (!storage) {
    return getInitialProgress();
  }

  try {
    const rawProgress = storage.getItem(PROGRESS_STORAGE_KEY);

    if (!rawProgress) {
      return getInitialProgress();
    }

    const parsed = JSON.parse(rawProgress);

    if (typeof parsed !== 'object' || parsed === null) {
      return getInitialProgress();
    }

    return sanitizeProgress(parsed as StoredProgressShape);
  } catch {
    return getInitialProgress();
  }
}

export function writeStoredProgress(
  progress: LearningProgress,
  storage = getBrowserStorage(),
): void {
  if (!storage) {
    return;
  }

  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(sanitizeProgress(progress)));
}

export function awardMission(progress: LearningProgress, nextMissionIndex: number): LearningProgress {
  const safeProgress = sanitizeProgress(progress);

  return {
    completedStops: Math.min(MISSION_STOP_COUNT, safeProgress.completedStops + 1),
    experience: safeProgress.experience + EXPERIENCE_PER_MISSION,
    stars: safeProgress.stars + STARS_PER_MISSION,
    nextMissionIndex: Math.max(safeProgress.nextMissionIndex, toSafeCount(nextMissionIndex)),
  };
}

export function moveMissionCursor(progress: LearningProgress, nextMissionIndex: number): LearningProgress {
  const safeProgress = sanitizeProgress(progress);

  return {
    ...safeProgress,
    nextMissionIndex: Math.max(safeProgress.nextMissionIndex, toSafeCount(nextMissionIndex)),
  };
}

export function restartExploration(progress: LearningProgress): LearningProgress {
  const safeProgress = sanitizeProgress(progress);

  return {
    ...safeProgress,
    completedStops: 0,
  };
}

export function resetAllProgress(): LearningProgress {
  return getInitialProgress();
}

export function getLevelNumber(experience: number): number {
  return Math.floor(toSafeCount(experience) / EXPERIENCE_PER_LEVEL) + 1;
}

export function getLevelProgress(experience: number): { current: number; max: number } {
  return {
    current: toSafeCount(experience) % EXPERIENCE_PER_LEVEL,
    max: EXPERIENCE_PER_LEVEL,
  };
}

export function getStarScore(stars: number): number {
  return toSafeCount(stars);
}

export function getMissionNumber(completedStops: number, currentMissionCompleted = false): number {
  return Math.min(
    MISSION_STOP_COUNT,
    toSafeCount(completedStops) + (currentMissionCompleted ? 0 : 1),
  );
}

export function getMissionStops(completedStops: number): MissionStop[] {
  const completedThrough = Math.min(MISSION_STOP_COUNT, toSafeCount(completedStops));
  const current = Math.min(MISSION_STOP_COUNT, completedThrough + 1);

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

export function isRewardUnlocked(currentMissionCompleted: boolean): boolean {
  return currentMissionCompleted;
}

export function isExplorationComplete(completedStops: number): boolean {
  return toSafeCount(completedStops) >= MISSION_STOP_COUNT;
}

export function getProgressSummary(progress: LearningProgress): ProgressSummary {
  const safeProgress = sanitizeProgress(progress);
  const levelProgress = getLevelProgress(safeProgress.experience);

  return {
    level: getLevelNumber(safeProgress.experience),
    levelExperience: levelProgress.current,
    levelExperienceMax: levelProgress.max,
    stars: safeProgress.stars,
    completedStops: safeProgress.completedStops,
    totalExplorationsCompleted: Math.floor(
      safeProgress.experience / (MISSION_STOP_COUNT * EXPERIENCE_PER_MISSION),
    ),
    nextMissionIndex: safeProgress.nextMissionIndex,
  };
}

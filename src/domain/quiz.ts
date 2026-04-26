import { normalizeMinutes } from './time';

export type QuizMission = {
  id: string;
  label: string;
  targetMinutes: number;
};

export type QuizResult = {
  correct: boolean;
  differenceMinutes: number;
};

const CLOCK_CYCLE_MINUTES = 12 * 60;

export const QUIZ_MISSIONS: QuizMission[] = [
  { id: 'four-fifteen', label: '4시 15분', targetMinutes: 4 * 60 + 15 },
  { id: 'three-thirty', label: '3시 반', targetMinutes: 3 * 60 + 30 },
  { id: 'four-oclock', label: '4시', targetMinutes: 4 * 60 },
  { id: 'six-forty-five', label: '6시 45분', targetMinutes: 6 * 60 + 45 },
  { id: 'eight-five-before', label: '8시 55분', targetMinutes: 8 * 60 + 55 },
];

export function getMissionByIndex(index: number): QuizMission {
  const safeIndex = ((index % QUIZ_MISSIONS.length) + QUIZ_MISSIONS.length) % QUIZ_MISSIONS.length;
  return QUIZ_MISSIONS[safeIndex];
}

function hasFinalConsonant(text: string): boolean {
  const lastChar = text.trim().slice(-1);

  if (!lastChar) {
    return false;
  }

  const code = lastChar.charCodeAt(0);
  const hangulBase = 0xac00;
  const hangulEnd = 0xd7a3;

  if (code < hangulBase || code > hangulEnd) {
    return false;
  }

  return (code - hangulBase) % 28 !== 0;
}

export function getMissionPrompt(mission: QuizMission): string {
  const particle = hasFinalConsonant(mission.label) ? '을' : '를';
  return `${mission.label}${particle} 만들어보세요!`;
}

export function checkQuizAnswer(
  currentMinutes: number,
  mission: QuizMission,
  toleranceMinutes = 0,
): QuizResult {
  const current = normalizeMinutes(currentMinutes);
  const target = normalizeMinutes(mission.targetMinutes);
  const rawDifference = Math.abs(current - target);
  const differenceMinutes = Math.min(rawDifference, CLOCK_CYCLE_MINUTES - rawDifference);

  return {
    correct: differenceMinutes <= toleranceMinutes,
    differenceMinutes,
  };
}

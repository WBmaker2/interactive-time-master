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
  { id: 'one-twenty', label: '1시 20분', targetMinutes: 1 * 60 + 20 },
  { id: 'two-ten', label: '2시 10분', targetMinutes: 2 * 60 + 10 },
  { id: 'five-half', label: '5시 반', targetMinutes: 5 * 60 + 30 },
  { id: 'seven-five', label: '7시 5분', targetMinutes: 7 * 60 + 5 },
  { id: 'nine-twenty-five', label: '9시 25분', targetMinutes: 9 * 60 + 25 },
  { id: 'ten-forty', label: '10시 40분', targetMinutes: 10 * 60 + 40 },
  { id: 'eleven-fifty', label: '11시 50분', targetMinutes: 11 * 60 + 50 },
  { id: 'twelve-oclock', label: '12시', targetMinutes: 12 * 60 },
  { id: 'twelve-thirty-five', label: '12시 35분', targetMinutes: 35 },
  { id: 'three-five-before', label: '2시 55분', targetMinutes: 2 * 60 + 55 },
  { id: 'six-five-before', label: '5시 55분', targetMinutes: 5 * 60 + 55 },
  { id: 'eight-quarter', label: '8시 15분', targetMinutes: 8 * 60 + 15 },
  { id: 'nine-half', label: '9시 반', targetMinutes: 9 * 60 + 30 },
  { id: 'eleven-quarter-before', label: '10시 45분', targetMinutes: 10 * 60 + 45 },
  { id: 'one-five-before', label: '12시 55분', targetMinutes: 12 * 60 - 5 },
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

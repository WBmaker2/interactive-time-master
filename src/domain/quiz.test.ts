import { describe, expect, it } from 'vitest';
import {
  QUIZ_MISSIONS,
  checkQuizAnswer,
  getMissionByIndex,
  getMissionPrompt,
} from './quiz';

describe('quiz missions', () => {
  it('includes missions that cover minute, half-hour, hour, and before-the-hour reading', () => {
    expect(QUIZ_MISSIONS.length).toBeGreaterThanOrEqual(20);
    expect(QUIZ_MISSIONS.map((mission) => mission.label)).toEqual(expect.arrayContaining([
      '4시 15분',
      '3시 반',
      '4시',
      '6시 45분',
      '8시 55분',
      '12시',
      '10시 40분',
      '12시 55분',
    ]));
  });

  it('returns missions by cycling through the list', () => {
    expect(getMissionByIndex(0).label).toBe('4시 15분');
    expect(getMissionByIndex(QUIZ_MISSIONS.length).label).toBe('4시 15분');
  });

  it('creates a Korean classroom prompt with the correct object particle', () => {
    expect(getMissionPrompt(getMissionByIndex(0))).toBe('4시 15분을 만들어보세요!');
    expect(getMissionPrompt(getMissionByIndex(2))).toBe('4시를 만들어보세요!');
  });

  it('checks answers with exact normalized time', () => {
    expect(checkQuizAnswer(4 * 60 + 15, getMissionByIndex(0))).toEqual({
      correct: true,
      differenceMinutes: 0,
    });
    expect(checkQuizAnswer(4 * 60 + 20, getMissionByIndex(0))).toEqual({
      correct: false,
      differenceMinutes: 5,
    });
  });

  it('uses circular distance on a 12-hour clock', () => {
    expect(checkQuizAnswer(0, { id: 'midnight', label: '12시', targetMinutes: 720 })).toEqual({
      correct: true,
      differenceMinutes: 0,
    });
  });
});

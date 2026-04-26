import { describe, expect, it } from 'vitest';
import {
  angleToMinute,
  formatDigitalTime,
  getClockAngles,
  getKoreanTimeParts,
  getShortestAngleDelta,
  normalizeMinutes,
  snapMinute,
} from './time';

describe('clock time math', () => {
  it('normalizes minutes into one 12-hour clock cycle', () => {
    expect(normalizeMinutes(0)).toBe(0);
    expect(normalizeMinutes(720)).toBe(0);
    expect(normalizeMinutes(-5)).toBe(715);
    expect(normalizeMinutes(12 * 60 + 185)).toBe(185);
    expect(normalizeMinutes(Number.NaN)).toBe(0);
  });

  it('calculates minute and hour hand angles like a real analog clock', () => {
    expect(getClockAngles(3 * 60 + 30)).toEqual({
      hourAngle: 105,
      minuteAngle: 180,
    });
    expect(getClockAngles(11 * 60 + 45)).toEqual({
      hourAngle: 352.5,
      minuteAngle: 270,
    });
  });

  it('formats digital time for classroom display', () => {
    expect(formatDigitalTime(0)).toBe('12:00');
    expect(formatDigitalTime(3 * 60 + 5)).toBe('3:05');
    expect(formatDigitalTime(12 * 60 + 65)).toBe('1:05');
  });

  it('creates Korean reading text including half-hour and before-the-hour forms', () => {
    expect(getKoreanTimeParts(3 * 60)).toEqual({
      primary: '3시',
      secondary: '',
    });
    expect(getKoreanTimeParts(3 * 60 + 30)).toEqual({
      primary: '3시 30분',
      secondary: '3시 반',
    });
    expect(getKoreanTimeParts(3 * 60 + 55)).toEqual({
      primary: '3시 55분',
      secondary: '4시 5분 전',
    });
  });

  it('snaps raw minutes to the nearest 5-minute mark', () => {
    expect(snapMinute(2, 5)).toBe(0);
    expect(snapMinute(3, 5)).toBe(5);
    expect(snapMinute(718, 5)).toBe(0);
  });

  it('converts drag angle to clock minute', () => {
    expect(angleToMinute(0)).toBe(0);
    expect(angleToMinute(90)).toBe(15);
    expect(angleToMinute(180)).toBe(30);
    expect(angleToMinute(270)).toBe(45);
  });

  it('calculates small angle deltas across the 12 oclock boundary', () => {
    expect(getShortestAngleDelta(350, 10)).toBe(20);
    expect(getShortestAngleDelta(10, 350)).toBe(-20);
  });
});

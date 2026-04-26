export type ClockAngles = {
  hourAngle: number;
  minuteAngle: number;
};

export type KoreanTimeParts = {
  primary: string;
  secondary: string;
};

const CLOCK_CYCLE_MINUTES = 12 * 60;

export function normalizeMinutes(totalMinutes: number): number {
  if (!Number.isFinite(totalMinutes)) {
    return 0;
  }

  const rounded = Math.round(totalMinutes);
  return ((rounded % CLOCK_CYCLE_MINUTES) + CLOCK_CYCLE_MINUTES) % CLOCK_CYCLE_MINUTES;
}

export function getHour(totalMinutes: number): number {
  const hour = Math.floor(normalizeMinutes(totalMinutes) / 60);
  return hour === 0 ? 12 : hour;
}

export function getMinute(totalMinutes: number): number {
  return normalizeMinutes(totalMinutes) % 60;
}

export function getClockAngles(totalMinutes: number): ClockAngles {
  const normalized = normalizeMinutes(totalMinutes);

  return {
    hourAngle: normalized * 0.5,
    minuteAngle: getMinute(normalized) * 6,
  };
}

export function formatDigitalTime(totalMinutes: number): string {
  const hour = getHour(totalMinutes);
  const minute = getMinute(totalMinutes);
  return `${hour}:${minute.toString().padStart(2, '0')}`;
}

export function getKoreanTimeParts(totalMinutes: number): KoreanTimeParts {
  const hour = getHour(totalMinutes);
  const minute = getMinute(totalMinutes);

  if (minute === 0) {
    return { primary: `${hour}시`, secondary: '' };
  }

  if (minute === 30) {
    return { primary: `${hour}시 30분`, secondary: `${hour}시 반` };
  }

  if (minute >= 45) {
    const nextHour = hour === 12 ? 1 : hour + 1;
    return {
      primary: `${hour}시 ${minute}분`,
      secondary: `${nextHour}시 ${60 - minute}분 전`,
    };
  }

  return { primary: `${hour}시 ${minute}분`, secondary: '' };
}

export function snapMinute(totalMinutes: number, step = 5): number {
  const safeStep = step > 0 ? step : 5;
  return normalizeMinutes(Math.round(totalMinutes / safeStep) * safeStep);
}

export function angleToMinute(angleDegrees: number): number {
  const normalizedAngle = ((angleDegrees % 360) + 360) % 360;
  return normalizeMinutes(Math.round(normalizedAngle / 6));
}

export function replaceMinute(totalMinutes: number, minute: number): number {
  const hourStart = normalizeMinutes(totalMinutes) - getMinute(totalMinutes);
  return normalizeMinutes(hourStart + minute);
}

export function getShortestAngleDelta(previousAngle: number, nextAngle: number): number {
  return ((((nextAngle - previousAngle) % 360) + 540) % 360) - 180;
}

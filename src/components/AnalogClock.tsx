import { useEffect, useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import {
  formatDigitalTime,
  getClockAngles,
  getShortestAngleDelta,
  normalizeMinutes,
  snapMinute,
} from '../domain/time';

type AnalogClockProps = {
  totalMinutes: number;
  onTimeChange: (nextMinutes: number) => void;
};

const CENTER = 160;
const CLOCK_RADIUS = 140;
const NUMBER_RADIUS = 112;
const HOUR_HAND_LENGTH = 72;
const MINUTE_HAND_LENGTH = 116;

function getPointerAngle(clientX: number, clientY: number, element: SVGSVGElement): number {
  const rect = element.getBoundingClientRect();
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;
  const angleFromTop = Math.atan2(y, x) * (180 / Math.PI) + 90;
  return (angleFromTop + 360) % 360;
}

export function AnalogClock({ totalMinutes, onTimeChange }: AnalogClockProps) {
  const { hourAngle, minuteAngle } = getClockAngles(totalMinutes);
  const draggingRef = useRef(false);
  const lastAngleRef = useRef<number | null>(null);
  const rawMinutesRef = useRef(totalMinutes);

  useEffect(() => {
    if (!draggingRef.current) {
      rawMinutesRef.current = totalMinutes;
    }
  }, [totalMinutes]);

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    rawMinutesRef.current = totalMinutes;
    lastAngleRef.current = getPointerAngle(event.clientX, event.clientY, event.currentTarget);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!draggingRef.current || lastAngleRef.current === null) {
      return;
    }

    const nextAngle = getPointerAngle(event.clientX, event.clientY, event.currentTarget);
    const deltaAngle = getShortestAngleDelta(lastAngleRef.current, nextAngle);
    rawMinutesRef.current += deltaAngle / 6;
    lastAngleRef.current = nextAngle;
    onTimeChange(snapMinute(rawMinutesRef.current, 5));
  }

  function handlePointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    draggingRef.current = false;
    lastAngleRef.current = null;
    rawMinutesRef.current = totalMinutes;
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onTimeChange(normalizeMinutes(totalMinutes + 5));
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onTimeChange(normalizeMinutes(totalMinutes - 5));
    }
  }

  return (
    <svg
      className="analog-clock"
      viewBox="0 0 320 320"
      role="slider"
      aria-label="분침을 움직이는 아날로그 시계"
      aria-valuemin={0}
      aria-valuemax={719}
      aria-valuenow={normalizeMinutes(totalMinutes)}
      aria-valuetext={formatDigitalTime(totalMinutes)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <circle className="clock-face" cx={CENTER} cy={CENTER} r={CLOCK_RADIUS} />
      {Array.from({ length: 60 }, (_, index) => {
        const angle = index * 6;
        const isHour = index % 5 === 0;
        const length = isHour ? 16 : 7;
        const start = CLOCK_RADIUS - length;
        const end = CLOCK_RADIUS - 4;
        const radians = ((angle - 90) * Math.PI) / 180;

        return (
          <line
            key={index}
            className={isHour ? 'hour-tick' : 'minute-tick'}
            x1={CENTER + Math.cos(radians) * start}
            y1={CENTER + Math.sin(radians) * start}
            x2={CENTER + Math.cos(radians) * end}
            y2={CENTER + Math.sin(radians) * end}
          />
        );
      })}
      {Array.from({ length: 12 }, (_, index) => {
        const number = index === 0 ? 12 : index;
        const angle = index * 30;
        const radians = ((angle - 90) * Math.PI) / 180;

        return (
          <text
            key={number}
            className="clock-number"
            x={CENTER + Math.cos(radians) * NUMBER_RADIUS}
            y={CENTER + Math.sin(radians) * NUMBER_RADIUS}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {number}
          </text>
        );
      })}
      <line
        className="hour-hand"
        x1={CENTER}
        y1={CENTER}
        x2={CENTER}
        y2={CENTER - HOUR_HAND_LENGTH}
        transform={`rotate(${hourAngle} ${CENTER} ${CENTER})`}
      />
      <line
        className="minute-hand"
        x1={CENTER}
        y1={CENTER + 18}
        x2={CENTER}
        y2={CENTER - MINUTE_HAND_LENGTH}
        transform={`rotate(${minuteAngle} ${CENTER} ${CENTER})`}
      />
      <circle className="hand-pin" cx={CENTER} cy={CENTER} r="11" />
      <circle
        className="minute-handle"
        cx={CENTER}
        cy={CENTER - MINUTE_HAND_LENGTH}
        r="18"
        transform={`rotate(${minuteAngle} ${CENTER} ${CENTER})`}
      />
    </svg>
  );
}

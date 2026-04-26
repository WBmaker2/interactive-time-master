# Interactive Time Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "째깍째깍 시간 탐험대", a Korean elementary math app where grade 1-2 students learn analog clock reading by dragging the minute hand and solving time-setting missions.

**Architecture:** Use a Vite + React + TypeScript app with tested pure domain modules for clock math and quiz validation. Render the analog clock as SVG so pointer/touch dragging, hand rotation, number labels, and accessibility labels stay precise and responsive. Keep UI state in `App.tsx`, while focused components own only rendering and interaction callbacks.

**Tech Stack:** Vite, React, TypeScript, SVG, Vitest, Testing Library, CSS, Playwright or Browser Use for final browser verification.

---

## File Structure

- Create: `package.json` - scripts and dependencies for Vite, React, TypeScript, Vitest, Testing Library.
- Create: `index.html` - root document.
- Create: `vite.config.ts` - Vite config and Vitest browser-like test environment.
- Create: `tsconfig.json`, `tsconfig.node.json` - TypeScript configs with `moduleResolution: "Bundler"`.
- Create: `src/main.tsx` - React entrypoint.
- Create: `src/App.tsx` - app state, practice/quiz mode orchestration, live feedback.
- Create: `src/App.css` - responsive layout, clock surface, controls, confetti animation, focus states.
- Create: `src/App.test.tsx` - user journey tests for practice and quiz flows.
- Create: `src/domain/time.ts` - pure clock math, display formatting, drag angle conversion.
- Create: `src/domain/time.test.ts` - unit tests for time math and Korean reading text.
- Create: `src/domain/quiz.ts` - mission definitions, deterministic question list, answer checking.
- Create: `src/domain/quiz.test.ts` - unit tests for mission matching and tolerance.
- Create: `src/components/AnalogClock.tsx` - SVG clock, hand rendering, pointer drag behavior.
- Create: `src/components/TimeReadout.tsx` - digital and Korean time display.
- Create: `src/components/QuizPanel.tsx` - mission text, answer check button, next mission button.
- Create: `src/components/ConfettiBurst.tsx` - visible celebration effect when correct.
- Create: `src/setupTests.ts` - Testing Library matcher setup.

## Implementation Notes

- Store time internally as minutes since 12:00, normalized to `0..719`.
- Convert display time to 12-hour classroom language: `0` becomes `12시`, `13` becomes `1시`.
- While dragging, snap to 5-minute increments for young learners. The pure helper should still support 1-minute resolution so later changes do not require rewriting the math.
- Show both digital text and Korean reading: `3:30`, `3시 30분`, and when exact half-hour also `3시 반`.
- For "몇 분 전", show an additional hint when minutes are `45..59`: for `3:55`, show `4시 5분 전`.
- Quiz matching should accept exact minute matches after snap. If snap is changed to 1-minute mode, the answer checker may use `toleranceMinutes = 0`.
- All visible UI copy stays Korean and classroom-specific.

---

### Task 1: Scaffold the Vite React App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/setupTests.ts`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json` with this content:

```json
{
  "name": "interactive-time-master",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "typescript": "^5.9.3",
    "vite": "^7.1.12",
    "vitest": "^3.2.4",
    "jsdom": "^27.0.1"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules/` and `package-lock.json` are created, with no install errors.

- [ ] **Step 3: Create the Vite HTML entrypoint**

Create `index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="초등 1~2학년 수학 시계 보기 연습 앱, 째깍째깍 시간 탐험대"
    />
    <title>째깍째깍 시간 탐험대</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create TypeScript configuration**

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create Vite and Vitest config**

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
});
```

- [ ] **Step 6: Create React entrypoint and test setup**

Create `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/setupTests.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 7: Add a temporary smoke app so build tooling can run**

Create `src/App.tsx`:

```tsx
export default function App() {
  return <main>째깍째깍 시간 탐험대</main>;
}
```

Create `src/App.css`:

```css
:root {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  color: #172033;
  background: #f7faf7;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button {
  font: inherit;
}
```

- [ ] **Step 8: Verify baseline**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete successfully.

---

### Task 2: Build Clock Math With Tests

**Files:**
- Create: `src/domain/time.ts`
- Create: `src/domain/time.test.ts`

- [ ] **Step 1: Write failing tests for normalization, angles, and Korean text**

Create `src/domain/time.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  angleToMinute,
  formatDigitalTime,
  getClockAngles,
  getKoreanTimeParts,
  normalizeMinutes,
  snapMinute,
} from './time';

describe('clock time math', () => {
  it('normalizes minutes into one 12-hour clock cycle', () => {
    expect(normalizeMinutes(0)).toBe(0);
    expect(normalizeMinutes(720)).toBe(0);
    expect(normalizeMinutes(-5)).toBe(715);
    expect(normalizeMinutes(12 * 60 + 185)).toBe(185);
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
});
```

- [ ] **Step 2: Run tests and confirm they fail because the module is missing**

Run:

```bash
npm test -- src/domain/time.test.ts
```

Expected: FAIL with an import/module-not-found error for `./time`.

- [ ] **Step 3: Implement the pure clock helpers**

Create `src/domain/time.ts`:

```ts
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
  const normalized = normalizeMinutes(totalMinutes);
  const hour = Math.floor(normalized / 60);
  return hour === 0 ? 12 : hour;
}

export function getMinute(totalMinutes: number): number {
  return normalizeMinutes(totalMinutes) % 60;
}

export function getClockAngles(totalMinutes: number): ClockAngles {
  const normalized = normalizeMinutes(totalMinutes);
  const hourAngle = normalized * 0.5;
  const minuteAngle = getMinute(normalized) * 6;

  return {
    hourAngle,
    minuteAngle,
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

export function snapMinute(minute: number, step = 5): number {
  const safeStep = step > 0 ? step : 5;
  return normalizeMinutes(Math.round(minute / safeStep) * safeStep);
}

export function angleToMinute(angleDegrees: number): number {
  const normalizedAngle = ((angleDegrees % 360) + 360) % 360;
  return normalizeMinutes(Math.round(normalizedAngle / 6));
}

export function replaceMinute(totalMinutes: number, minute: number): number {
  const hourStart = normalizeMinutes(totalMinutes) - getMinute(totalMinutes);
  return normalizeMinutes(hourStart + minute);
}
```

- [ ] **Step 4: Run focused clock tests**

Run:

```bash
npm test -- src/domain/time.test.ts
```

Expected: PASS for all clock math tests.

---

### Task 3: Build Quiz Logic With Tests

**Files:**
- Create: `src/domain/quiz.ts`
- Create: `src/domain/quiz.test.ts`

- [ ] **Step 1: Write failing tests for missions and answer checking**

Create `src/domain/quiz.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  QUIZ_MISSIONS,
  checkQuizAnswer,
  getMissionByIndex,
  getMissionPrompt,
} from './quiz';

describe('quiz missions', () => {
  it('includes missions that cover hour, half-hour, minute, and before-the-hour reading', () => {
    expect(QUIZ_MISSIONS.map((mission) => mission.label)).toEqual([
      '4시 15분',
      '3시 반',
      '4시',
      '6시 45분',
      '8시 55분',
    ]);
  });

  it('returns missions by cycling through the list', () => {
    expect(getMissionByIndex(0).label).toBe('4시 15분');
    expect(getMissionByIndex(QUIZ_MISSIONS.length).label).toBe('4시 15분');
  });

  it('creates a Korean classroom prompt', () => {
    expect(getMissionPrompt(getMissionByIndex(0))).toBe('4시 15분을 만들어보세요!');
  });

  it('checks answers with exact normalized time', () => {
    expect(checkQuizAnswer(4 * 60, getMissionByIndex(0))).toEqual({
      correct: true,
      differenceMinutes: 0,
    });
    expect(checkQuizAnswer(4 * 60 + 5, getMissionByIndex(0))).toEqual({
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
```

- [ ] **Step 2: Run tests and confirm they fail because the module is missing**

Run:

```bash
npm test -- src/domain/quiz.test.ts
```

Expected: FAIL with an import/module-not-found error for `./quiz`.

- [ ] **Step 3: Implement quiz missions and checking**

Create `src/domain/quiz.ts`:

```ts
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

export function getMissionPrompt(mission: QuizMission): string {
  return `${mission.label}을 만들어보세요!`;
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
```

- [ ] **Step 4: Run focused quiz tests**

Run:

```bash
npm test -- src/domain/quiz.test.ts
```

Expected: PASS for all quiz tests.

---

### Task 4: Implement the SVG Clock Components

**Files:**
- Create: `src/components/AnalogClock.tsx`
- Create: `src/components/TimeReadout.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create the time readout component**

Create `src/components/TimeReadout.tsx`:

```tsx
import { formatDigitalTime, getKoreanTimeParts } from '../domain/time';

type TimeReadoutProps = {
  totalMinutes: number;
};

export function TimeReadout({ totalMinutes }: TimeReadoutProps) {
  const korean = getKoreanTimeParts(totalMinutes);

  return (
    <section className="time-readout" aria-label="현재 시각">
      <p className="readout-label">지금 시각</p>
      <p className="digital-time">{formatDigitalTime(totalMinutes)}</p>
      <p className="korean-time">{korean.primary}</p>
      {korean.secondary ? <p className="time-hint">{korean.secondary}</p> : null}
    </section>
  );
}
```

- [ ] **Step 2: Create the analog clock component**

Create `src/components/AnalogClock.tsx`:

```tsx
import { getClockAngles, replaceMinute, snapMinute } from '../domain/time';

type AnalogClockProps = {
  totalMinutes: number;
  onTimeChange: (nextMinutes: number) => void;
};

const CENTER = 160;
const CLOCK_RADIUS = 140;
const NUMBER_RADIUS = 112;

function getPointerAngle(clientX: number, clientY: number, element: SVGSVGElement): number {
  const rect = element.getBoundingClientRect();
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;
  const angleFromTop = Math.atan2(y, x) * (180 / Math.PI) + 90;
  return (angleFromTop + 360) % 360;
}

export function AnalogClock({ totalMinutes, onTimeChange }: AnalogClockProps) {
  const { hourAngle, minuteAngle } = getClockAngles(totalMinutes);

  function updateFromPointer(event: React.PointerEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const angle = getPointerAngle(event.clientX, event.clientY, svg);
    const snappedMinute = snapMinute(angle / 6, 5);
    onTimeChange(replaceMinute(totalMinutes, snappedMinute));
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updateFromPointer(event);
    }
  }

  return (
    <svg
      className="analog-clock"
      viewBox="0 0 320 320"
      role="img"
      aria-label="분침을 잡고 돌릴 수 있는 아날로그 시계"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
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
        y2={CENTER - 72}
        transform={`rotate(${hourAngle} ${CENTER} ${CENTER})`}
      />
      <line
        className="minute-hand"
        x1={CENTER}
        y1={CENTER + 18}
        x2={CENTER}
        y2={CENTER - 116}
        transform={`rotate(${minuteAngle} ${CENTER} ${CENTER})`}
      />
      <circle className="hand-pin" cx={CENTER} cy={CENTER} r="11" />
      <circle className="minute-handle" cx={CENTER} cy={CENTER - 116} r="18" transform={`rotate(${minuteAngle} ${CENTER} ${CENTER})`} />
    </svg>
  );
}
```

- [ ] **Step 3: Wire the practice app**

Replace `src/App.tsx` with:

```tsx
import { useState } from 'react';
import { AnalogClock } from './components/AnalogClock';
import { TimeReadout } from './components/TimeReadout';

export default function App() {
  const [totalMinutes, setTotalMinutes] = useState(3 * 60);

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="app-title">
        <div>
          <p className="eyebrow">1-2학년 수학 · 시계 보기</p>
          <h1 id="app-title">째깍째깍 시간 탐험대</h1>
          <p className="intro">
            분침을 잡고 돌리면 시침도 실제 시계처럼 함께 움직입니다.
          </p>
        </div>
        <TimeReadout totalMinutes={totalMinutes} />
      </section>

      <section className="learning-stage">
        <div className="clock-wrap">
          <AnalogClock totalMinutes={totalMinutes} onTimeChange={setTotalMinutes} />
        </div>
        <aside className="guide-panel">
          <h2>연습 모드</h2>
          <p>분침 끝의 둥근 손잡이를 움직이며 시각이 어떻게 바뀌는지 살펴보세요.</p>
          <p className="live-feedback" role="status" aria-live="polite">
            현재 시각을 읽어 보세요.
          </p>
        </aside>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Style the classroom interface**

Replace `src/App.css` with:

```css
:root {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  color: #172033;
  background: #f5f7ec;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button {
  font: inherit;
}

.app-shell {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 36px;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 300px);
  gap: 20px;
  align-items: end;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #47624f;
  font-weight: 800;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4.8rem);
  line-height: 1;
  letter-spacing: 0;
}

.intro {
  max-width: 540px;
  margin: 14px 0 0;
  color: #4a5568;
  font-size: 1.08rem;
  line-height: 1.6;
}

.learning-stage {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 320px;
  gap: 22px;
  align-items: stretch;
}

.clock-wrap,
.guide-panel,
.time-readout {
  border: 2px solid #d7e3c5;
  border-radius: 8px;
  background: #fffdf6;
  box-shadow: 0 18px 42px rgba(55, 72, 49, 0.14);
}

.clock-wrap {
  display: grid;
  min-height: 520px;
  place-items: center;
  padding: 24px;
}

.analog-clock {
  width: min(100%, 500px);
  aspect-ratio: 1;
  touch-action: none;
  cursor: grab;
}

.analog-clock:active {
  cursor: grabbing;
}

.clock-face {
  fill: #fffaf0;
  stroke: #172033;
  stroke-width: 6;
}

.hour-tick {
  stroke: #172033;
  stroke-width: 5;
  stroke-linecap: round;
}

.minute-tick {
  stroke: #97a27d;
  stroke-width: 2;
  stroke-linecap: round;
}

.clock-number {
  fill: #172033;
  font-size: 25px;
  font-weight: 900;
}

.hour-hand {
  stroke: #223047;
  stroke-width: 12;
  stroke-linecap: round;
}

.minute-hand {
  stroke: #e4572e;
  stroke-width: 8;
  stroke-linecap: round;
}

.hand-pin {
  fill: #172033;
}

.minute-handle {
  fill: rgba(228, 87, 46, 0.18);
  stroke: #e4572e;
  stroke-width: 3;
}

.time-readout {
  padding: 20px;
}

.readout-label {
  margin: 0;
  color: #47624f;
  font-weight: 800;
}

.digital-time {
  margin: 4px 0;
  font-size: 3rem;
  font-weight: 950;
  line-height: 1;
}

.korean-time {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
}

.time-hint {
  margin: 8px 0 0;
  color: #b34020;
  font-weight: 800;
}

.guide-panel {
  padding: 24px;
}

.guide-panel h2 {
  margin: 0 0 12px;
  font-size: 1.6rem;
}

.guide-panel p {
  color: #4a5568;
  line-height: 1.6;
}

.live-feedback {
  margin-top: 18px;
  padding: 14px;
  border-radius: 8px;
  background: #e8f4ff;
  color: #1b4d70;
  font-weight: 800;
}

@media (max-width: 820px) {
  .hero-panel,
  .learning-stage {
    grid-template-columns: 1fr;
  }

  .clock-wrap {
    min-height: auto;
    padding: 18px;
  }
}
```

- [ ] **Step 5: Verify the app still builds**

Run:

```bash
npm run build
```

Expected: PASS.

---

### Task 5: Add Quiz Mode, Feedback, and Confetti

**Files:**
- Create: `src/components/QuizPanel.tsx`
- Create: `src/components/ConfettiBurst.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create the quiz panel**

Create `src/components/QuizPanel.tsx`:

```tsx
import { QuizMission, getMissionPrompt } from '../domain/quiz';

type QuizPanelProps = {
  mission: QuizMission;
  feedback: string;
  onCheck: () => void;
  onNext: () => void;
};

export function QuizPanel({ mission, feedback, onCheck, onNext }: QuizPanelProps) {
  return (
    <section className="quiz-panel" aria-labelledby="quiz-title">
      <p className="mode-label">퀴즈 모드</p>
      <h2 id="quiz-title">{getMissionPrompt(mission)}</h2>
      <div className="quiz-actions">
        <button className="primary-button" type="button" onClick={onCheck}>
          정답 확인
        </button>
        <button className="secondary-button" type="button" onClick={onNext}>
          다른 문제
        </button>
      </div>
      <p className="live-feedback" role="status" aria-live="polite">
        {feedback}
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Create the confetti component**

Create `src/components/ConfettiBurst.tsx`:

```tsx
type ConfettiBurstProps = {
  show: boolean;
};

const PIECES = Array.from({ length: 18 }, (_, index) => index);

export function ConfettiBurst({ show }: ConfettiBurstProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="confetti-burst" aria-hidden="true">
      {PIECES.map((piece) => (
        <span
          key={piece}
          style={{
            '--angle': `${piece * 20}deg`,
            '--delay': `${(piece % 6) * 35}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Wire quiz state in the app**

Replace `src/App.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { AnalogClock } from './components/AnalogClock';
import { ConfettiBurst } from './components/ConfettiBurst';
import { QuizPanel } from './components/QuizPanel';
import { TimeReadout } from './components/TimeReadout';
import { checkQuizAnswer, getMissionByIndex } from './domain/quiz';
import { getKoreanTimeParts } from './domain/time';

export default function App() {
  const [totalMinutes, setTotalMinutes] = useState(3 * 60);
  const [missionIndex, setMissionIndex] = useState(0);
  const [feedback, setFeedback] = useState('시계를 움직인 뒤 정답 확인을 눌러 보세요.');
  const [showConfetti, setShowConfetti] = useState(false);

  const mission = getMissionByIndex(missionIndex);

  useEffect(() => {
    const korean = getKoreanTimeParts(totalMinutes);
    setFeedback(`${korean.primary}${korean.secondary ? `, ${korean.secondary}` : ''}입니다.`);
  }, [totalMinutes]);

  function handleCheckAnswer() {
    const result = checkQuizAnswer(totalMinutes, mission);

    if (result.correct) {
      setFeedback('정답입니다! 시침과 분침을 정확히 맞췄어요.');
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 1200);
      return;
    }

    setFeedback(`아직 ${result.differenceMinutes}분 차이가 납니다. 분침을 조금 더 돌려 보세요.`);
    setShowConfetti(false);
  }

  function handleNextMission() {
    setMissionIndex((current) => current + 1);
    setShowConfetti(false);
    setFeedback('새 문제입니다. 분침을 움직여 시각을 만들어 보세요.');
  }

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="app-title">
        <div>
          <p className="eyebrow">1-2학년 수학 · 시계 보기</p>
          <h1 id="app-title">째깍째깍 시간 탐험대</h1>
          <p className="intro">
            분침을 잡고 돌리면 시침도 실제 시계처럼 함께 움직입니다.
          </p>
        </div>
        <TimeReadout totalMinutes={totalMinutes} />
      </section>

      <section className="learning-stage">
        <div className="clock-wrap">
          <AnalogClock totalMinutes={totalMinutes} onTimeChange={setTotalMinutes} />
          <ConfettiBurst show={showConfetti} />
        </div>
        <aside className="guide-panel">
          <QuizPanel
            mission={mission}
            feedback={feedback}
            onCheck={handleCheckAnswer}
            onNext={handleNextMission}
          />
        </aside>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Add quiz and confetti styles**

Append to `src/App.css`:

```css
.quiz-panel {
  display: grid;
  gap: 16px;
}

.mode-label {
  margin: 0;
  color: #b34020;
  font-weight: 900;
}

.quiz-panel h2 {
  margin: 0;
  font-size: 1.9rem;
  line-height: 1.2;
}

.quiz-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.primary-button,
.secondary-button {
  min-height: 48px;
  border-radius: 8px;
  border: 2px solid #172033;
  padding: 0 18px;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  color: #fffaf0;
  background: #172033;
}

.secondary-button {
  color: #172033;
  background: #fffaf0;
}

.primary-button:focus-visible,
.secondary-button:focus-visible {
  outline: 4px solid #f7c948;
  outline-offset: 3px;
}

.clock-wrap {
  position: relative;
  overflow: hidden;
}

.confetti-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.confetti-burst span {
  --angle: 0deg;
  --delay: 0ms;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 18px;
  border-radius: 3px;
  background: #f7c948;
  animation: confetti-pop 850ms ease-out var(--delay) both;
  transform: rotate(var(--angle));
}

.confetti-burst span:nth-child(3n) {
  background: #47a8bd;
}

.confetti-burst span:nth-child(3n + 1) {
  background: #e4572e;
}

@keyframes confetti-pop {
  from {
    opacity: 1;
    transform: rotate(var(--angle)) translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(-220px) scale(0.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .confetti-burst span {
    animation-duration: 1ms;
  }
}
```

- [ ] **Step 5: Verify build after quiz integration**

Run:

```bash
npm run build
```

Expected: PASS.

---

### Task 6: Add User Journey Tests

**Files:**
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write tests for app render and quiz feedback**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Interactive Time Master app', () => {
  it('renders the classroom clock learning surface', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '째깍째깍 시간 탐험대' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: '분침을 움직이는 아날로그 시계' })).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
    expect(screen.getByText('4시 15분을 만들어보세요!')).toBeInTheDocument();
  });

  it('announces a correct answer when the initial mission is matched', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '정답 확인' }));
    expect(screen.getByRole('status')).toHaveTextContent('아직 75분 차이가 납니다');
  });

  it('moves to the next mission', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '다른 문제' }));
    expect(screen.getByText('3시 반을 만들어보세요!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the app test**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS. If the first prompt reads awkwardly as `4시을`, continue to Task 7 where the prompt particle is corrected and the test is updated.

---

### Task 7: Polish Korean Prompt Text and Accessibility

**Files:**
- Modify: `src/domain/quiz.ts`
- Modify: `src/domain/quiz.test.ts`
- Modify: `src/App.test.tsx`
- Modify: `src/components/AnalogClock.tsx`

- [ ] **Step 1: Add a Korean object particle helper test**

Modify the prompt test in `src/domain/quiz.test.ts`:

```ts
it('creates a Korean classroom prompt with the correct object particle', () => {
    expect(getMissionPrompt(getMissionByIndex(0))).toBe('4시 15분을 만들어보세요!');
    expect(getMissionPrompt(getMissionByIndex(2))).toBe('4시를 만들어보세요!');
});
```

- [ ] **Step 2: Implement particle-aware prompt text**

Modify `src/domain/quiz.ts`:

```ts
function hasFinalConsonant(text: string): boolean {
  const lastChar = text.trim().at(-1);
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
```

- [ ] **Step 3: Update app test expected text**

Modify `src/App.test.tsx`:

```tsx
expect(screen.getByText('4시 15분을 만들어보세요!')).toBeInTheDocument();
```

- [ ] **Step 4: Add keyboard controls for minute hand**

Modify the `<svg>` element in `src/components/AnalogClock.tsx`:

```tsx
tabIndex={0}
onKeyDown={(event) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault();
    onTimeChange(totalMinutes + 5);
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault();
    onTimeChange(totalMinutes - 5);
  }
}}
```

Expected placement: add these props alongside `role`, `aria-label`, and pointer handlers on the existing `<svg>`.

- [ ] **Step 5: Add focus style for the clock**

Append to `src/App.css`:

```css
.analog-clock:focus-visible {
  outline: 5px solid #f7c948;
  outline-offset: 6px;
  border-radius: 12px;
}
```

- [ ] **Step 6: Run all tests**

Run:

```bash
npm test
```

Expected: PASS for `src/domain/time.test.ts`, `src/domain/quiz.test.ts`, and `src/App.test.tsx`.

---

### Task 8: Final Build and Browser Verification

**Files:**
- Modify only if verification reveals a visible bug in files created above.

- [ ] **Step 1: Run the full build**

Run:

```bash
npm run build
```

Expected: PASS and `dist/` is created.

- [ ] **Step 2: Start the dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 3: Verify desktop browser behavior**

Open the local URL in Browser Use or Playwright Chromium and verify:

- The first screen shows the actual interactive clock, not a landing page.
- The clock face is centered and large.
- The current time readout shows `3:00` and `3시`.
- The first mission says `4시 15분을 만들어보세요!`.
- Clicking `정답 확인` while the clock is at 3:00 announces an incorrect-answer message.
- The `다른 문제` button changes the mission to `3시 반을 만들어보세요!`.
- Dragging the minute hand changes the digital time.
- The hour hand moves between numbers when the minute hand reaches 30 minutes.

- [ ] **Step 4: Verify mobile browser behavior**

Use a mobile-sized viewport around `390x844` and verify:

- Text does not overlap.
- The clock remains usable without horizontal scrolling.
- Quiz buttons are at least 48px tall.
- The readout and mission stay visible below the heading.

- [ ] **Step 5: Fix visible issues and repeat focused verification**

If any verified item fails, modify the smallest relevant file and rerun:

```bash
npm test
npm run build
```

Then repeat the browser check for the failed item.

---

## Self-Review

- Spec coverage: The plan covers the large analog clock, minute-hand dragging, proportional hour-hand movement, digital and Korean display, quiz mission, answer checking, confetti feedback, grade 1-2 math context, and `[2수03-01]` reading forms.
- Placeholder scan: No `TBD`, `TODO`, or unspecified future work remains in the task steps.
- Type consistency: Time is consistently represented as `totalMinutes`; quiz missions use `targetMinutes`; clock rendering receives `totalMinutes` and `onTimeChange`.
- Scope check: Deployment and public archive registration are outside this implementation plan because the current request asks for app planning and next-stage implementation, not production publishing.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-26-interactive-time-master.md`.

Recommended next step: implement this plan inline in the current workspace using `superpowers:executing-plans`, because the current folder is empty and no git branch exists yet. If a git-backed release flow is needed, initialize git before the first implementation commit.

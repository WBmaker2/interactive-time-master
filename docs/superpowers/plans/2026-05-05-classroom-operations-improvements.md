# Classroom Operations Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make "째깍째깍 시간 탐험대" easier to operate in class by restoring the local verification chain, adding a visible learning-record panel with reset controls, and preparing missions by difficulty.

**Architecture:** Keep the current Vite + React + TypeScript structure. Extend the existing `LearningProgress` helper layer for reset/stat behavior, add one focused presentational component for classroom progress controls, and keep mission organization in `src/domain/quiz.ts` so the app state remains simple. Local progress stays in `localStorage`; no accounts or server storage are added.

**Tech Stack:** Vite, React, TypeScript, CSS, Vitest, Testing Library, localStorage, GitHub Pages.

---

## File Structure

- Modify: `package-lock.json` and `node_modules/` only through package manager commands if the Rollup optional dependency is broken locally.
- Modify: `src/game/progress.ts` - add reset/stat helpers for classroom operation.
- Modify: `src/game/progress.test.ts` - protect reset/stat helper behavior.
- Create: `src/components/LearningRecord.tsx` - render total level/star/experience, current exploration progress, and reset buttons.
- Modify: `src/App.tsx` - wire learning-record handlers and pass progress data.
- Modify: `src/App.css` - style the learning-record panel in the bottom section without overlap.
- Modify: `src/App.test.tsx` - add user-flow tests for resetting current exploration and all saved progress.
- Modify: `src/domain/quiz.ts` - group existing missions into difficulty buckets while preserving `getMissionByIndex`.
- Modify: `src/domain/quiz.test.ts` - assert difficulty buckets contain useful grade 1-2 mission types.

## Current State

- App is deployed on GitHub Pages at `https://wbmaker2.github.io/interactive-time-master/`.
- Hong's Vibe Coding Lab registration is complete.
- Existing features include draggable SVG clock, Korean time readout, missions, rewards, map, persistent score, and complete/restart flow.
- Local verification currently fails because Rollup's native optional package in `node_modules` has a macOS code-signature/loading problem. This must be repaired before trusting local test/build output.

---

### Task 1: Restore Local Verification

**Files:**
- Modify via package manager only: `node_modules/`
- Possible modify via package manager: `package-lock.json`

- [ ] **Step 1: Reinstall dependencies**

Run:

```bash
npm install
```

Expected: Rollup optional dependency is reinstalled correctly for darwin-arm64.

- [ ] **Step 2: Run the automated checks**

Run:

```bash
npm test
npm run build
```

Expected: all Vitest tests pass and Vite production build completes.

- [ ] **Step 3: If reinstall changes only lock metadata, inspect before committing**

Run:

```bash
git diff -- package-lock.json package.json
```

Expected: no unexpected dependency changes. If there are no file changes, no commit is needed for this task.

---

### Task 2: Add Progress Reset and Summary Helpers

**Files:**
- Modify: `src/game/progress.ts`
- Modify: `src/game/progress.test.ts`

- [ ] **Step 1: Add failing tests for progress summaries and reset helpers**

Add tests in `src/game/progress.test.ts`:

```ts
it('summarizes saved progress for classroom display', () => {
  const progress = {
    completedStops: 4,
    experience: 140,
    stars: 35,
    nextMissionIndex: 9,
  };

  expect(getProgressSummary(progress)).toEqual({
    level: 2,
    levelExperience: 40,
    levelExperienceMax: 100,
    stars: 35,
    completedStops: 4,
    totalExplorationsCompleted: 0,
    nextMissionIndex: 9,
  });
});

it('resets all saved progress to a brand-new learner state', () => {
  expect(resetAllProgress()).toEqual(getInitialProgress());
});
```

- [ ] **Step 2: Implement helpers**

Add to `src/game/progress.ts`:

```ts
export type ProgressSummary = {
  level: number;
  levelExperience: number;
  levelExperienceMax: number;
  stars: number;
  completedStops: number;
  totalExplorationsCompleted: number;
  nextMissionIndex: number;
};

export function getProgressSummary(progress: LearningProgress): ProgressSummary {
  const safeProgress = sanitizeProgress(progress);
  const levelProgress = getLevelProgress(safeProgress.experience);

  return {
    level: getLevelNumber(safeProgress.experience),
    levelExperience: levelProgress.current,
    levelExperienceMax: levelProgress.max,
    stars: safeProgress.stars,
    completedStops: safeProgress.completedStops,
    totalExplorationsCompleted: Math.floor(safeProgress.experience / (MISSION_STOP_COUNT * 20)),
    nextMissionIndex: safeProgress.nextMissionIndex,
  };
}

export function resetAllProgress(): LearningProgress {
  return getInitialProgress();
}
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
npm test -- src/game/progress.test.ts
```

Expected: progress helper tests pass.

---

### Task 3: Add Learning Record UI

**Files:**
- Create: `src/components/LearningRecord.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Create `LearningRecord` component**

Create `src/components/LearningRecord.tsx`:

```tsx
import type { ProgressSummary } from '../game/progress';

type LearningRecordProps = {
  summary: ProgressSummary;
  onRestartMap: () => void;
  onResetAll: () => void;
};

export function LearningRecord({ summary, onRestartMap, onResetAll }: LearningRecordProps) {
  return (
    <section className="learning-record" aria-label="학습 기록">
      <div>
        <strong>학습 기록</strong>
        <p>
          탐험 {summary.completedStops} / 10 · 별 {summary.stars}개 · Lv.{summary.level}
        </p>
      </div>
      <div className="learning-record-actions">
        <button type="button" onClick={onRestartMap}>지도 다시 시작</button>
        <button type="button" onClick={onResetAll}>전체 초기화</button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire handlers in `App.tsx`**

Use `getProgressSummary`, `restartExploration`, and `resetAllProgress`:

```tsx
const progressSummary = getProgressSummary(session.progress);

function handleResetAllProgress() {
  const nextProgress = resetAllProgress();
  setSession({
    progress: nextProgress,
    missionIndex: nextProgress.nextMissionIndex,
    awardedMissionIndexes: [],
    journeyStatus: 'playing',
  });
  setTotalMinutes(INITIAL_TIME);
  setShowConfetti(false);
  setRewardOpened(false);
  setFeedback('학습 기록을 처음 상태로 되돌렸어요.');
}
```

Render `LearningRecord` in `.adventure-footer`.

- [ ] **Step 3: Style without overlapping the map or reward chest**

Update `.adventure-footer` to support three children on desktop:

```css
.adventure-footer {
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px) 232px;
}

.learning-record {
  display: grid;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #ddd3c3;
  border-radius: 8px;
  background: #fffdf8;
}
```

- [ ] **Step 4: Add user-flow tests**

Add tests in `src/App.test.tsx`:

```ts
it('shows a learning record and can restart only the map', async () => {
  const user = userEvent.setup();
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
    completedStops: 6,
    experience: 120,
    stars: 30,
    nextMissionIndex: 6,
  }));

  render(<App />);
  expect(screen.getByRole('region', { name: '학습 기록' })).toHaveTextContent('탐험 6 / 10');

  await user.click(screen.getByRole('button', { name: '지도 다시 시작' }));

  expect(screen.getByLabelText('별 점수 30점')).toBeInTheDocument();
  expect(screen.getByLabelText('1번 미션 current')).toBeInTheDocument();
});

it('can reset all saved learning progress', async () => {
  const user = userEvent.setup();
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
    completedStops: 6,
    experience: 120,
    stars: 30,
    nextMissionIndex: 6,
  }));

  render(<App />);
  await user.click(screen.getByRole('button', { name: '전체 초기화' }));

  expect(screen.getByLabelText('레벨 1, 경험치 0 / 100')).toBeInTheDocument();
  expect(screen.getByLabelText('별 점수 0점')).toBeInTheDocument();
  expect(screen.getByLabelText('1번 미션 current')).toBeInTheDocument();
});
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: all tests and build pass.

---

### Task 4: Group Missions by Difficulty

**Files:**
- Modify: `src/domain/quiz.ts`
- Modify: `src/domain/quiz.test.ts`

- [ ] **Step 1: Add mission difficulty tests**

Add tests:

```ts
it('groups missions by clock-reading difficulty', () => {
  expect(getMissionsByDifficulty('basic').some((mission) => mission.label === '4시')).toBe(true);
  expect(getMissionsByDifficulty('half').some((mission) => mission.label === '3시 반')).toBe(true);
  expect(getMissionsByDifficulty('minute').some((mission) => mission.label === '4시 15분')).toBe(true);
  expect(getMissionsByDifficulty('before').some((mission) => mission.label === '8시 55분')).toBe(true);
});
```

- [ ] **Step 2: Add difficulty metadata while preserving current mission order**

Extend `QuizMission`:

```ts
export type MissionDifficulty = 'basic' | 'half' | 'minute' | 'before';

export type QuizMission = {
  id: string;
  label: string;
  targetMinutes: number;
  difficulty: MissionDifficulty;
};
```

Add:

```ts
export function getMissionsByDifficulty(difficulty: MissionDifficulty): QuizMission[] {
  return QUIZ_MISSIONS.filter((mission) => mission.difficulty === difficulty);
}
```

- [ ] **Step 3: Run domain tests**

Run:

```bash
npm test -- src/domain/quiz.test.ts
```

Expected: quiz domain tests pass.

---

## Verification Checklist

- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] Desktop layout keeps `탐험 지도`, `학습 기록`, and `보상함` as separate bottom sections.
- [ ] Mobile layout has no horizontal page overflow.
- [ ] `지도 다시 시작` preserves stars/experience but resets map progress.
- [ ] `전체 초기화` resets level, experience, stars, map, and next mission to the beginning.
- [ ] Existing deployed app URL remains unchanged.

## Self-Review

- Spec coverage: Covers the recommended next phase: local verification recovery, classroom-friendly progress controls, and mission difficulty organization.
- Placeholder scan: No `TBD`, `TODO`, or unspecified “add tests” steps remain.
- Type consistency: `LearningProgress`, `ProgressSummary`, `resetAllProgress`, and difficulty names are introduced before use.

## Implementation Record

- 2026-05-05: Saved this plan before code changes.
- 2026-05-05: Restored local verification by using the nvm Node/npm path ahead of the Codex embedded Node path.
- 2026-05-05: Added progress summary/reset helpers, `LearningRecord` UI, map-only restart, all-progress reset, and mission difficulty grouping.
- 2026-05-05: Verified `npm test` with 34 passing tests and `npm run build` with a successful Vite production build.
- 2026-05-05: Verified desktop footer layout and mobile overflow/button height with Playwright against local dev server.

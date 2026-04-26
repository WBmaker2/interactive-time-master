# Interactive Time Master Game UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign "째깍째깍 시간 탐험대" into a polished game-like elementary learning UI with a top level/star HUD, a staged mission panel, a bottom exploration map, and a reward chest while preserving the working draggable analog clock.

**Architecture:** Keep the existing Vite + React + TypeScript app and pure time/quiz domain modules. Add lightweight game progress state in `App.tsx`, extract presentational pieces for the top HUD, mission map, reward chest, and generated asset use, and keep all core clock math tested in domain tests. Use generated image assets only for decorative classroom-friendly reward/map art; all important text, buttons, clock hands, and progress values remain code-native and accessible.

**Tech Stack:** Vite, React, TypeScript, SVG clock, CSS responsive layout, Vitest, Testing Library, Browser/Playwright verification, Image Generation for concept and supporting visual assets.

---

## Design Direction

- Preserve the reference image's structure: a top bar with a menu button, title mark, level progress, and star score; a large clock on the left; a current-time and mission panel on the right; a bottom exploration map with numbered mission stops and a reward chest.
- Make the app feel appropriate for grade 1-2 students: friendly, bright, tactile, and rewarding, but not visually crowded.
- Use green as the main exploration color, yellow/gold for rewards, red-orange for the minute hand, and deep ink for readability.
- Avoid a landing page. The first screen remains the usable clock activity.
- Keep cards at 8px radius or less where possible; make panels feel like sturdy learning-tool surfaces instead of marketing cards.
- Use image generation for a UI concept and a supporting reward/map illustration asset, but implement the interface in real React/CSS so the clock and buttons stay interactive.

## File Structure

- Modify: `src/App.tsx` - add mission progression, level/star state, current mission display, reward state.
- Modify: `src/App.css` - replace current layout with the game-like visual system and responsive map layout.
- Modify: `src/App.test.tsx` - update expected copy and add tests for level/star/map/reward interactions.
- Modify: `src/components/AnalogClock.tsx` - keep drag behavior; tune CSS classes if needed.
- Create: `src/components/TopStatusBar.tsx` - menu/title/level/star HUD.
- Create: `src/components/MissionCard.tsx` - right-side mission prompt, hint, answer controls, feedback.
- Create: `src/components/AdventureMap.tsx` - bottom mission path with completed/current/locked stops.
- Create: `src/components/RewardChest.tsx` - reward chest button and unlocked reward display.
- Create: `src/components/AssetBadge.tsx` - optional small generated-art thumbnail wrapper if generated assets are used.
- Create: `src/game/progress.ts` - pure helpers for mission progress, stars, level meter, reward unlock state.
- Create: `src/game/progress.test.ts` - unit tests for progress helpers.
- Create: `public/assets/` - generated supporting image assets copied into the app if the Image Generation output is suitable.

---

### Task 1: Generate Design Concept and Supporting Asset

**Files:**
- Create: `public/assets/time-adventure-reward.png` if generated art is suitable.
- Reference: generated concept path under `/Users/kimhongnyeon/.codex/generated_images/...`

- [ ] **Step 1: Generate a UI concept**

Use Image Generation with a prompt for a Korean elementary clock-learning game UI based on the provided reference. Required visual elements:

- top HUD with level and star score
- large analog clock
- mission card
- bottom exploration map
- reward chest
- warm green/yellow classroom adventure palette

Expected: a concept image exists and its path is recorded in the final response.

- [ ] **Step 2: Generate a supporting reward/map asset**

Use Image Generation to create a transparent or clean-background friendly illustration containing a treasure chest, compass/map motif, star badge, and clock badge. The asset must not contain important text.

Expected: one generated image is selected and copied to `public/assets/time-adventure-reward.png`, or if the generated asset is unsuitable, the app uses code-native icons and the final response states the deviation.

---

### Task 2: Add Progress Helpers

**Files:**
- Create: `src/game/progress.ts`
- Create: `src/game/progress.test.ts`

- [ ] **Step 1: Add tests for level, star, and map progress**

Create tests that assert:

- initial level is `3`
- initial star score is `25`
- mission progress starts at mission 7
- completing a mission adds stars and progress
- reward chest unlocks when at least one mission is completed in this session

- [ ] **Step 2: Implement progress helpers**

Implement:

- `getLevelProgress(completedCount: number)`
- `getStarScore(completedCount: number)`
- `getMissionStops(currentMissionNumber: number, completedInSession: number)`
- `isRewardUnlocked(completedInSession: number)`

Expected: `npm test -- src/game/progress.test.ts` passes.

---

### Task 3: Build Game UI Components

**Files:**
- Create: `src/components/TopStatusBar.tsx`
- Create: `src/components/MissionCard.tsx`
- Create: `src/components/AdventureMap.tsx`
- Create: `src/components/RewardChest.tsx`
- Create: `src/components/AssetBadge.tsx`

- [ ] **Step 1: Build `TopStatusBar`**

Render:

- menu icon button
- clock title mark and title text
- level indicator `Lv. 3`
- horizontal progress meter with `120 / 200`
- star score `25`

- [ ] **Step 2: Build `MissionCard`**

Render:

- current time label and digital readout
- mission number label
- mission prompt
- blank-style answer line such as `__ 시 __ 분`
- hint pill
- answer check and next mission buttons
- live feedback region

- [ ] **Step 3: Build `AdventureMap`**

Render:

- "탐험 지도" label button-like element
- mission stops 1-10
- completed stops with check marks
- current stop with highlighted ring
- upcoming stops muted

- [ ] **Step 4: Build `RewardChest`**

Render:

- reward chest button
- locked/unlocked state
- unlocked reward message when a correct answer is submitted

Expected: components are presentational, receive props from `App.tsx`, and avoid duplicating time/quiz logic.

---

### Task 4: Wire App State and Redesign CSS

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Update app state**

Add state for:

- `completedInSession`
- `lastAnswerCorrect`
- `rewardOpened`

Correct answers should:

- show confetti
- increment completed session count once per current mission
- update stars/level meter through progress helpers
- unlock the reward chest

- [ ] **Step 2: Replace the layout**

Use this page anatomy:

- `.game-shell`
- `.top-status-bar`
- `.play-layout`
- `.clock-zone`
- `.mission-zone`
- `.adventure-footer`

- [ ] **Step 3: Style for desktop**

Match the reference image's balance:

- clock consumes the left half
- mission panel consumes the right half
- bottom map spans full width
- level/star HUD stays in the top right
- clock remains large and touch-friendly

- [ ] **Step 4: Style for mobile**

On `390px` width:

- top HUD wraps without text overlap
- clock appears before mission controls
- mission map becomes horizontally scrollable or compact
- reward chest remains reachable
- all buttons stay at least 48px tall

---

### Task 5: Update Tests

**Files:**
- Modify: `src/App.test.tsx`
- Create/Modify: `src/game/progress.test.ts`

- [ ] **Step 1: Update render test**

Assert that the app shows:

- `Lv. 3`
- `25`
- `탐험 지도`
- `보상함`
- mission prompt `4시 15분을 만들어보세요!`

- [ ] **Step 2: Update interaction test**

Use keyboard controls to reach `4:15`, click `정답 확인`, and assert:

- correct feedback is announced
- star score increases
- reward chest becomes available

- [ ] **Step 3: Add next mission test**

Click `다음 미션` and assert the mission advances to `3시 반을 만들어보세요!`.

Expected: `npm test` passes.

---

### Task 6: Verify Build and Browser UI

**Files:**
- Modify only if visual or interaction verification reveals a bug.

- [ ] **Step 1: Run automated verification**

Run:

```bash
npm test
npm run build
```

Expected: both pass.

- [ ] **Step 2: Run local browser verification**

Start:

```bash
npm run dev -- --host 127.0.0.1
```

Verify in browser:

- desktop first viewport resembles the provided reference structure
- top level/star HUD is visible
- clock drag still changes time
- correct answer updates feedback and rewards
- bottom map highlights progress
- reward chest opens or shows unlocked state
- mobile layout has no horizontal page overflow and buttons are at least 48px tall

- [ ] **Step 3: Clean up QA artifacts**

Remove temporary screenshots, Playwright logs, and scratch files before final response.

---

## Self-Review

- Spec coverage: The plan covers the reference-style redesign, top level/star display, staged mission UI, bottom exploration map, reward chest, image generation, preservation of draggable clock behavior, tests, and browser verification.
- Placeholder scan: No unresolved placeholder or vague implementation-only step remains.
- Scope check: This is a UI/UX redesign plus lightweight local progress state. It does not add user accounts, persistence, or deployment.
- Type consistency: Progress helpers use `completedInSession` and mission number state consistently; quiz/time logic remains in the existing domain modules.

## Implementation Record

- UI concept image: `/Users/kimhongnyeon/.codex/generated_images/019dc706-ae4a-7ea0-ac0b-52fc42941366/ig_04a870781d0f3a520169ed5b46bc9c8191a325454edadab2e2.png`
- Supporting reward/map asset source: `/Users/kimhongnyeon/.codex/generated_images/019dc706-ae4a-7ea0-ac0b-52fc42941366/ig_04a870781d0f3a520169ed5b8866e8819199821ae41f428baf.png`
- App asset copy: `public/assets/time-adventure-reward.png`
- Verification: `npm test` passed with 21 tests, `npm run build` passed, Playwright verified desktop drag from `03:00` to `04:15`, correct-answer feedback, star score increase to `30`, reward chest opening, and mobile layout without horizontal page overflow.

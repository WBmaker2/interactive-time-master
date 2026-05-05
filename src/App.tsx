import { useEffect, useState } from 'react';
import { AdventureMap } from './components/AdventureMap';
import { AnalogClock } from './components/AnalogClock';
import { ConfettiBurst } from './components/ConfettiBurst';
import { LearningRecord } from './components/LearningRecord';
import { MissionCard } from './components/MissionCard';
import { RewardChest } from './components/RewardChest';
import { TopStatusBar } from './components/TopStatusBar';
import { checkQuizAnswer, getMissionByIndex } from './domain/quiz';
import { getKoreanTimeParts, normalizeMinutes } from './domain/time';
import {
  type LearningProgress,
  awardMission,
  getMissionNumber,
  getMissionStops,
  getProgressSummary,
  isExplorationComplete,
  isRewardUnlocked,
  moveMissionCursor,
  readStoredProgress,
  restartExploration,
  resetAllProgress,
  writeStoredProgress,
} from './game/progress';

const INITIAL_TIME = 3 * 60;

type SessionState = {
  progress: LearningProgress;
  missionIndex: number;
  awardedMissionIndexes: number[];
  journeyStatus: 'playing' | 'complete' | 'ended';
};

function getCurrentTimeFeedback(totalMinutes: number): string {
  const korean = getKoreanTimeParts(totalMinutes);
  return `${korean.primary}${korean.secondary ? `, ${korean.secondary}` : ''}입니다.`;
}

export default function App() {
  const [totalMinutes, setTotalMinutes] = useState(INITIAL_TIME);
  const [session, setSession] = useState<SessionState>(() => {
    const progress = readStoredProgress();

    return {
      progress,
      missionIndex: progress.nextMissionIndex,
      awardedMissionIndexes: [],
      journeyStatus: isExplorationComplete(progress.completedStops) ? 'complete' : 'playing',
    };
  });
  const [feedback, setFeedback] = useState(getCurrentTimeFeedback(INITIAL_TIME));
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardOpened, setRewardOpened] = useState(false);

  const currentMissionCompleted = session.awardedMissionIndexes.includes(session.missionIndex);
  const mission = getMissionByIndex(session.missionIndex);
  const missionNumber = getMissionNumber(session.progress.completedStops, currentMissionCompleted);
  const rewardUnlocked = isRewardUnlocked(currentMissionCompleted);
  const journeyComplete = session.journeyStatus === 'complete';
  const journeyEnded = session.journeyStatus === 'ended';
  const progressSummary = getProgressSummary(session.progress);

  useEffect(() => {
    setFeedback(getCurrentTimeFeedback(totalMinutes));
    setShowConfetti(false);
  }, [totalMinutes]);

  useEffect(() => {
    writeStoredProgress(session.progress);
  }, [session.progress]);

  function handleTimeChange(nextMinutes: number) {
    setTotalMinutes(normalizeMinutes(nextMinutes));
  }

  function handleCheckAnswer() {
    const result = checkQuizAnswer(totalMinutes, mission);

    if (result.correct) {
      setFeedback('정답입니다! 시침과 분침을 정확히 맞췄어요.');
      setSession((current) => {
        if (current.awardedMissionIndexes.includes(current.missionIndex)) {
          return current;
        }

        const nextProgress = awardMission(current.progress, current.missionIndex + 1);

        return {
          ...current,
          progress: nextProgress,
          awardedMissionIndexes: [...current.awardedMissionIndexes, current.missionIndex],
          journeyStatus: isExplorationComplete(nextProgress.completedStops)
            ? 'complete'
            : current.journeyStatus,
        };
      });
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 1200);
      return;
    }

    setFeedback(`아직 ${result.differenceMinutes}분 차이가 납니다. 분침을 조금 더 돌려 보세요.`);
    setShowConfetti(false);
  }

  function handleNextMission() {
    setSession((current) => {
      if (isExplorationComplete(current.progress.completedStops)) {
        return {
          ...current,
          journeyStatus: 'complete',
        };
      }

      const nextMissionIndex = Math.max(
        current.missionIndex + 1,
        current.progress.nextMissionIndex,
      );

      return {
        ...current,
        missionIndex: nextMissionIndex,
        progress: moveMissionCursor(current.progress, nextMissionIndex),
      };
    });
    setShowConfetti(false);
    setRewardOpened(false);
    setFeedback('새 문제입니다. 분침을 움직여 시각을 만들어 보세요.');
  }

  function handleRestartExploration() {
    setSession((current) => {
      const nextProgress = restartExploration(current.progress);

      return {
        progress: nextProgress,
        missionIndex: nextProgress.nextMissionIndex,
        awardedMissionIndexes: [],
        journeyStatus: 'playing',
      };
    });
    setShowConfetti(false);
    setRewardOpened(false);
    setFeedback('새 탐험을 시작합니다. 분침을 움직여 시각을 만들어 보세요.');
  }

  function handleRestartMapOnly() {
    setSession((current) => {
      const nextProgress = restartExploration(current.progress);

      return {
        progress: nextProgress,
        missionIndex: nextProgress.nextMissionIndex,
        awardedMissionIndexes: [],
        journeyStatus: 'playing',
      };
    });
    setShowConfetti(false);
    setRewardOpened(false);
    setFeedback('탐험 지도만 1번부터 다시 시작해요. 별과 경험치는 그대로 남아 있어요.');
  }

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

  function handleExitExploration() {
    setSession((current) => ({
      ...current,
      journeyStatus: 'ended',
    }));
    setShowConfetti(false);
    setRewardOpened(false);
    setFeedback('오늘의 탐험을 종료했어요. 기록은 저장되어 다음에 이어서 볼 수 있어요.');
  }

  return (
    <main className="game-shell">
      <TopStatusBar experience={session.progress.experience} stars={session.progress.stars} />

      <section className="play-layout" aria-label="시계 조작과 미션">
        <div className="clock-zone">
          <div className="clock-stage">
            <AnalogClock totalMinutes={totalMinutes} onTimeChange={handleTimeChange} />
            <ConfettiBurst show={showConfetti} />
          </div>
          <p className="clock-instruction">
            <span aria-hidden="true">💡</span>
            분침을 드래그해서 시간을 맞춰 보세요.
          </p>
        </div>

        <MissionCard
          mission={mission}
          missionNumber={missionNumber}
          totalMinutes={totalMinutes}
          feedback={feedback}
          onCheck={handleCheckAnswer}
          onNext={handleNextMission}
          journeyComplete={journeyComplete}
          journeyEnded={journeyEnded}
          onRestart={handleRestartExploration}
          onExit={handleExitExploration}
        />
      </section>

      <section className="adventure-footer" aria-label="탐험 진행과 보상">
        <AdventureMap
          stops={getMissionStops(session.progress.completedStops)}
        />
        <LearningRecord
          summary={progressSummary}
          onRestartMap={handleRestartMapOnly}
          onResetAll={handleResetAllProgress}
        />
        <RewardChest
          unlocked={rewardUnlocked}
          opened={rewardOpened}
          onOpen={() => setRewardOpened(true)}
        />
      </section>
    </main>
  );
}

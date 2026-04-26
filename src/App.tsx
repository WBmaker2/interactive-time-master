import { useEffect, useState } from 'react';
import { AdventureMap } from './components/AdventureMap';
import { AnalogClock } from './components/AnalogClock';
import { ConfettiBurst } from './components/ConfettiBurst';
import { MissionCard } from './components/MissionCard';
import { RewardChest } from './components/RewardChest';
import { TopStatusBar } from './components/TopStatusBar';
import { checkQuizAnswer, getMissionByIndex } from './domain/quiz';
import { getKoreanTimeParts, normalizeMinutes } from './domain/time';
import {
  getMissionNumber,
  getMissionStops,
  isRewardUnlocked,
} from './game/progress';

const INITIAL_TIME = 3 * 60;

function getCurrentTimeFeedback(totalMinutes: number): string {
  const korean = getKoreanTimeParts(totalMinutes);
  return `${korean.primary}${korean.secondary ? `, ${korean.secondary}` : ''}입니다.`;
}

export default function App() {
  const [totalMinutes, setTotalMinutes] = useState(INITIAL_TIME);
  const [missionIndex, setMissionIndex] = useState(0);
  const [feedback, setFeedback] = useState(getCurrentTimeFeedback(INITIAL_TIME));
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedInSession, setCompletedInSession] = useState(0);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [rewardOpened, setRewardOpened] = useState(false);

  const mission = getMissionByIndex(missionIndex);
  const missionNumber = getMissionNumber(missionIndex);
  const rewardUnlocked = isRewardUnlocked(completedInSession);

  useEffect(() => {
    setFeedback(getCurrentTimeFeedback(totalMinutes));
    setShowConfetti(false);
  }, [totalMinutes]);

  function handleTimeChange(nextMinutes: number) {
    setTotalMinutes(normalizeMinutes(nextMinutes));
  }

  function handleCheckAnswer() {
    const result = checkQuizAnswer(totalMinutes, mission);

    if (result.correct) {
      setFeedback('정답입니다! 시침과 분침을 정확히 맞췄어요.');
      if (!completedMissionIds.includes(mission.id)) {
        setCompletedMissionIds((ids) => [...ids, mission.id]);
        setCompletedInSession((count) => count + 1);
      }
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
    setRewardOpened(false);
    setFeedback('새 문제입니다. 분침을 움직여 시각을 만들어 보세요.');
  }

  return (
    <main className="game-shell">
      <TopStatusBar completedInSession={completedInSession} />

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
        />
      </section>

      <section className="adventure-footer" aria-label="탐험 진행과 보상">
        <AdventureMap
          stops={getMissionStops(missionNumber, completedInSession)}
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

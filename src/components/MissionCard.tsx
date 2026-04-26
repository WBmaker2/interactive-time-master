import { QuizMission, getMissionPrompt } from '../domain/quiz';
import { formatDigitalTime, getKoreanTimeParts } from '../domain/time';

type MissionCardProps = {
  mission: QuizMission;
  missionNumber: number;
  totalMinutes: number;
  feedback: string;
  onCheck: () => void;
  onNext: () => void;
  journeyComplete: boolean;
  journeyEnded: boolean;
  onRestart: () => void;
  onExit: () => void;
};

export function MissionCard({
  mission,
  missionNumber,
  totalMinutes,
  feedback,
  onCheck,
  onNext,
  journeyComplete,
  journeyEnded,
  onRestart,
  onExit,
}: MissionCardProps) {
  const korean = getKoreanTimeParts(totalMinutes);
  const missionDigitalTime = formatDigitalTime(totalMinutes);
  const displayDigitalTime = missionDigitalTime.length === 4 ? `0${missionDigitalTime}` : missionDigitalTime;

  return (
    <aside className="mission-zone" aria-label="현재 미션">
      <section className="current-time-panel" aria-label="현재 시간">
        <span className="ribbon-label">현재 시간</span>
        <div className="mission-time-row">
          <p className="mission-digital-time">{displayDigitalTime}</p>
          <span className="period-pill">오후</span>
        </div>
        <p className="mission-korean-time">{korean.primary}</p>
      </section>

      {journeyEnded ? (
        <section className="mission-card completion-card" aria-labelledby="completion-title">
          <span className="ribbon-label mission-ribbon">탐험 종료</span>
          <div className="completion-copy">
            <span className="completion-icon" aria-hidden="true">✓</span>
            <div>
              <h2 id="completion-title">오늘의 탐험을 종료했어요.</h2>
              <p>기록은 저장되어 다음에 다시 열어도 이어서 확인할 수 있어요.</p>
            </div>
          </div>
          <button className="next-button completion-button" type="button" onClick={onRestart}>
            <span aria-hidden="true">↻</span>
            다시 탐험하기
          </button>
        </section>
      ) : journeyComplete ? (
        <section className="mission-card completion-card" aria-labelledby="completion-title">
          <span className="ribbon-label mission-ribbon">탐험 완료</span>
          <div className="completion-copy">
            <span className="completion-icon" aria-hidden="true">★</span>
            <div>
              <h2 id="completion-title">모든 탐험을 끝냈어요!</h2>
              <p>처음부터 다시 탐험을 시작하시겠습니까?</p>
            </div>
          </div>
          <div className="completion-actions">
            <button className="primary-button" type="button" onClick={onExit}>
              <span aria-hidden="true">✓</span>
              오늘은 종료
            </button>
            <button className="next-button" type="button" onClick={onRestart}>
              <span aria-hidden="true">↻</span>
              처음부터 다시
            </button>
          </div>
        </section>
      ) : (
        <>
      <section className="mission-card" aria-labelledby="mission-title">
        <span className="ribbon-label mission-ribbon">미션 {missionNumber}</span>
        <div className="mission-copy">
          <span className="flag-badge" aria-hidden="true">⚑</span>
          <div>
            <h2 id="mission-title">{getMissionPrompt(mission)}</h2>
            <p>시계를 보고 알맞은 시간을 완성해 보세요.</p>
          </div>
        </div>

        <div className="answer-line" aria-hidden="true">
          <span />
          <strong>시</strong>
          <span />
          <strong>분</strong>
        </div>

        <p className="hint-pill">
          <strong>힌트</strong>
          긴 바늘은 분, 짧은 바늘은 시간을 알려줘요.
        </p>
      </section>

      <div className="mission-actions">
        <button className="primary-button" type="button" onClick={onCheck}>
          <span aria-hidden="true">✓</span>
          정답 확인
        </button>
        <button className="next-button" type="button" onClick={onNext}>
          <span aria-hidden="true">→</span>
          다음 미션
        </button>
      </div>

      <p className="live-feedback" role="status" aria-live="polite">
        {feedback}
      </p>
        </>
      )}
    </aside>
  );
}

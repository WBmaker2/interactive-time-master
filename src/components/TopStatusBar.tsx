import { getLevelNumber, getLevelProgress, getStarScore } from '../game/progress';

type TopStatusBarProps = {
  experience: number;
  stars: number;
};

export function TopStatusBar({ experience, stars }: TopStatusBarProps) {
  const level = getLevelNumber(experience);
  const progress = getLevelProgress(experience);
  const starScore = getStarScore(stars);
  const percent = Math.round((progress.current / progress.max) * 100);

  return (
    <header className="top-status-bar">
      <button className="menu-button" type="button" aria-label="메뉴 열기">
        <span />
        <span />
        <span />
      </button>

      <div className="brand-lockup">
        <span className="clock-badge" aria-hidden="true">🕘</span>
        <h1 aria-label="째깍째깍 시간 탐험대">
          <span className="brand-red">째깍째깍</span>
          <span className="brand-green"> 시간 탐험대</span>
        </h1>
      </div>

      <div className="status-cluster" aria-label="학습 진행 상태">
        <section className="level-card" aria-label={`레벨 ${level}, 경험치 ${progress.current} / ${progress.max}`}>
          <span className="shield-badge" aria-hidden="true">✦</span>
          <strong>Lv. {level}</strong>
          <span className="level-meter" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </span>
          <span className="meter-text">{progress.current} / {progress.max}</span>
        </section>

        <section className="star-card" aria-label={`별 점수 ${starScore}점`}>
          <span className="star-icon" aria-hidden="true">★</span>
          <strong>{starScore}</strong>
        </section>
      </div>
    </header>
  );
}

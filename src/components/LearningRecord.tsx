import type { ProgressSummary } from '../game/progress';

type LearningRecordProps = {
  summary: ProgressSummary;
  onRestartMap: () => void;
  onResetAll: () => void;
};

export function LearningRecord({ summary, onRestartMap, onResetAll }: LearningRecordProps) {
  return (
    <section className="learning-record" aria-label="학습 기록">
      <div className="learning-record-copy">
        <strong>학습 기록</strong>
        <p>
          탐험 {summary.completedStops} / 10 · 별 {summary.stars}개 · Lv.{summary.level}
        </p>
        <span>
          누적 완료 {summary.totalExplorationsCompleted}회 · 다음 문제 {summary.nextMissionIndex + 1}
        </span>
      </div>
      <div className="learning-record-actions">
        <button type="button" onClick={onRestartMap}>
          지도 다시 시작
        </button>
        <button type="button" onClick={onResetAll}>
          전체 초기화
        </button>
      </div>
    </section>
  );
}

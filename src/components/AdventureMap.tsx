import type { MissionStop } from '../game/progress';

type AdventureMapProps = {
  stops: MissionStop[];
};

export function AdventureMap({ stops }: AdventureMapProps) {
  return (
    <section className="adventure-map" aria-labelledby="adventure-map-title">
      <div className="map-label" id="adventure-map-title">
        <span aria-hidden="true">◈</span>
        탐험 지도
      </div>
      <ol className="mission-path" aria-label="미션 진행 지도">
        {stops.map((stop) => (
          <li className={`mission-stop ${stop.status}`} key={stop.number}>
            <span className="stop-node" aria-label={`${stop.number}번 미션 ${stop.status}`}>
              {stop.status === 'completed' ? '✓' : stop.number}
            </span>
            <span className="stop-number">{stop.number}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

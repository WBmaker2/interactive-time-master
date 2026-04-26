import type { CSSProperties } from 'react';

type ConfettiBurstProps = {
  show: boolean;
};

const PIECES = Array.from({ length: 22 }, (_, index) => index);

export function ConfettiBurst({ show }: ConfettiBurstProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="confetti-burst" aria-hidden="true">
      {PIECES.map((piece) => (
        <span
          key={piece}
          style={
            {
              '--angle': `${piece * 17}deg`,
              '--distance': `${150 + (piece % 5) * 18}px`,
              '--delay': `${(piece % 7) * 28}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

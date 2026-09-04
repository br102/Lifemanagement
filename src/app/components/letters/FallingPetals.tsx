import { useMemo } from 'react';

export function FallingPetals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${7 + Math.random() * 8}s`,
        size: `${10 + Math.random() * 12}px`,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map(petal => (
        <span
          key={petal.id}
          className="absolute top-[-30px] text-rose-300/60"
          style={{
            left: petal.left,
            animation: `fall ${petal.duration} linear ${petal.delay} infinite`,
            fontSize: petal.size,
          }}
        >
          ♥
        </span>
      ))}

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-40px) rotate(0deg);
            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          50% {
            transform: translateY(50vh) translateX(40px) rotate(180deg);
          }

          100% {
            transform: translateY(110vh) translateX(-40px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
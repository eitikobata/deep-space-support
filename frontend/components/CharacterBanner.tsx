'use client';

import { useEffect, useState } from 'react';

const ROTATE_MS = 6500;

function shuffle(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export function CharacterBanner({
  imageSrc,
  imageAlt,
  lines,
  sceneKey,
  aspectRatio,
}: {
  imageSrc: string;
  imageAlt: string;
  lines: readonly string[];
  sceneKey: string;
  aspectRatio: string;
}) {
  const [order, setOrder] = useState<number[]>([]);
  const [step, setStep] = useState(0);

  // Fresh shuffled rotation whenever the scene genuinely changes.
  useEffect(() => {
    setOrder(shuffle(lines.length));
    setStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey]);

  // Advance through the shuffled order every ROTATE_MS, looping (and
  // reshuffling once a full lap completes) as long as there's more than
  // one line to rotate through.
  useEffect(() => {
    if (order.length < 2) return;
    const interval = setInterval(() => {
      setStep((s) => {
        const next = s + 1;
        if (next >= order.length) {
          setOrder(shuffle(lines.length));
          return 0;
        }
        return next;
      });
    }, ROTATE_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, lines.length]);

  const line = lines[order[step] ?? 0] ?? lines[0];

  return (
    <div className="character-banner" style={{ aspectRatio }}>
      <img src={imageSrc} alt={imageAlt} />
      <div key={`${sceneKey}-${step}`} className="speech-bubble speech-bubble-fade">
        {line}
      </div>
    </div>
  );
}

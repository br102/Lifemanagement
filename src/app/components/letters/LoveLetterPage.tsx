import { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Envelope } from './Envelope';
import { FallingPetals } from './FallingPetals';
import { TypewriterLetter } from './TypewriterLetter';

export function LoveLetterPage() {
  const [opened, setOpened] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-gray-950 dark:via-rose-950/20 dark:to-gray-950">
      <FallingPetals />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        {!opened ? (
          <div className="text-center">
            <Heart className="mx-auto mb-5 w-10 h-10 text-rose-500 fill-rose-500 animate-pulse" />

            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-rose-900 dark:text-rose-100">
              For You, With Love
            </h1>

            <p className="mt-3 mb-8 text-rose-500 dark:text-rose-300">
              There is something I want you to read...
            </p>

            <Envelope onOpen={() => setOpened(true)} />
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <TypewriterLetter onClose={() => setOpened(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
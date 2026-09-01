import { useEffect, useState } from 'react';
import { Heart, X, Sparkles } from 'lucide-react';

interface TypewriterLetterProps {
  onClose: () => void;
}

const letterText = `My dearest,

I don't think words will ever be enough to explain what you mean to me.

You have a way of making ordinary moments feel magical. Your smile can change my entire day, and being with you makes the world feel a little softer and brighter.

I love the little things about us — the laughs, the quiet moments, the silly conversations, and all the memories we have created together.

If I could choose one place to be, it would always be somewhere beside you.

Thank you for being the person who makes my heart feel at home.

I hope we have countless more sunsets, adventures, laughs, and beautiful memories ahead of us.

Whatever comes next, I want you to know one thing:

You are deeply, truly, and endlessly loved.

Forever yours ❤️`;

export function TypewriterLetter({ onClose }: TypewriterLetterProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;

    const timer = setInterval(() => {
      setDisplayedText(letterText.slice(0, index + 1));
      index++;

      if (index >= letterText.length) {
        clearInterval(timer);
      }
    }, 28);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#fffdf8] shadow-2xl border border-rose-100 dark:bg-gray-900 dark:border-rose-900/40">

      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="grid md:grid-cols-[0.9fr_1.1fr]">

        {/* Photo */}
        <div className="relative min-h-[350px] md:min-h-[650px] bg-rose-100">
          <img
            src="/couple-photo.jpg"
            alt="Our favorite memory"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/70 via-transparent to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 text-white">
            <Sparkles className="mb-3 w-6 h-6" />

            <p className="font-serif text-2xl italic">
              “Every love story is beautiful,
              but ours is my favorite.”
            </p>
          </div>
        </div>

        {/* Letter */}
        <div className="p-7 sm:p-10 md:p-12">

          <div className="mb-7 text-center">
            <Heart className="mx-auto w-7 h-7 text-rose-500 fill-rose-500" />

            <h2 className="mt-3 font-serif text-3xl font-bold text-rose-900 dark:text-rose-100">
              To My Love
            </h2>

            <div className="mx-auto mt-3 h-px w-20 bg-rose-200 dark:bg-rose-800" />
          </div>

          <div className="min-h-[500px] whitespace-pre-line font-serif text-[1.05rem] leading-8 text-gray-700 dark:text-gray-200">
            {displayedText}
            {displayedText.length < letterText.length && (
              <span className="ml-1 inline-block h-5 w-px translate-y-1 animate-pulse bg-rose-500" />
            )}
          </div>

          <div className="mt-8 text-center">
            <Heart className="mx-auto w-5 h-5 text-rose-500 fill-rose-500" />

            <p className="mt-2 font-serif italic text-rose-500">
              With all my love
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
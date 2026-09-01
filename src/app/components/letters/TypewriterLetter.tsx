import { useEffect, useState } from 'react';
import { Heart, X, Sparkles } from 'lucide-react';

interface TypewriterLetterProps {
  onClose: () => void;
}

const letterText = `My zlowiki,

We met each other by causality, as when a leaf reach your hand moved by the wind.

Since then I have been only feeling excited, afraid and blissful. It is the same feeling as when you are watching the landscape from the top of a huge cliff.

You have made me change, and change, and change, helping me to find myself and I cannot appreciate it more. Changing scares but with you is easy to work on the best version of me.

With this I only want to say Gracias. Thank you for being there, and always try to support me. And I hope that with me, at least you have learn something valuable.

Now, everyday I wake up it is special, only with looking at your face. When sneak into my mind, my heart starts to beat harder, faster, blissfulness, yearning, with all the happiness of still being beating.

Because continue beating means keep sharing moments with you.

One of the best, is just being able to sleep hearing your snores, scratching and hugging you.


Currently, we are faraway from each other. Although, when I go out and I feel the wind in my cheek, hair; It reminds me to your gentle caresses.

The wind reminds me you, to your part that is always moving and changing. But also the sea, whose waves tuck in the sand, as you do with my soul. 

We may be really different in a lot of thing, but at the same time I think our waves synchronize in our differences. We use them to get better, to know more about the world we live, and to enjoy more the time we spend together.

I love you and I really hope I will be able to spend my life with the most special person I have ever met.

Te quiero Karolina.

I wrote it in Spanish, because it is the only way I can express my real feeling. They are not only words, but a caress from the deepest of my heart.

I will continue studying polish to being able to talk with you, your friends, your family; to being able to truly understand you, and you to feel my real feelings.

You taught me to follow the wind, without thinking. Just trust and close my eyes, even though it can be scary and painful sometimes. 

Every day it is easier, I overthink less. Because every time I close my eyes I see you, I see your smile, your cap and your beautiful blonde hair.

When I feel your lips next to mines, I melt, slowly, I melt. And I don't how I get more in love with you, even though I thought It is not possible.

The universe can move around me, the stars, the floor, the celling; and I don't fucking care, if I can feel your body next to mine.

I enjoy that, at least for the moment, we spend our lives together, free and unpredictable as wind. Learning new things that we could never imagine before.

Your always loved one,

Borja`;

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
            src="/couple-photo.jpeg"
            alt="Our favorite memory"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/70 via-transparent to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 text-white">
            <Sparkles className="mb-3 w-6 h-6" />

            <p className="font-serif text-2xl italic">
              “To spend more time in the beach with my bitch.”
            </p>
          </div>
        </div>

        {/* Letter */}
        <div className="p-7 sm:p-10 md:p-12">

          <div className="mb-7 text-center">
            <Heart className="mx-auto w-7 h-7 text-rose-500 fill-rose-500" />

            <h2 className="mt-3 font-serif text-3xl font-bold text-rose-900 dark:text-rose-100">
              To My Skarbie
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
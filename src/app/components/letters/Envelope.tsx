import { MailOpen, Heart } from 'lucide-react';

interface EnvelopeProps {
  onOpen: () => void;
}

export function Envelope({ onOpen }: EnvelopeProps) {
  return (
    <button
      onClick={onOpen}
      className="group relative mx-auto block w-[320px] sm:w-[420px] focus:outline-none"
    >
      <div className="relative h-56 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-rose-300/50">

        {/* Envelope flap */}
        <div className="absolute inset-x-0 top-0 h-32 overflow-hidden">
          <div className="absolute left-1/2 top-[-75px] h-40 w-40 -translate-x-1/2 rotate-45 bg-rose-300 shadow-inner" />
        </div>

        {/* Letter inside */}
        <div className="absolute left-8 right-8 top-5 h-40 rounded-lg bg-[#fffdf8] shadow-md transition-transform duration-500 group-hover:-translate-y-8">
          <div className="flex h-full flex-col items-center justify-center">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            <span className="mt-2 font-serif italic text-rose-600">
              For you
            </span>
          </div>
        </div>

        {/* Envelope front */}
        <div className="absolute inset-x-0 bottom-0 h-32 rounded-b-2xl bg-rose-500">
          <div className="absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-rose-600" />
        </div>

        {/* Center heart */}
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-full bg-white p-4 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>

      <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all group-hover:bg-rose-600">
        <MailOpen className="w-4 h-4" />
        Open my letter
      </div>
    </button>
  );
}
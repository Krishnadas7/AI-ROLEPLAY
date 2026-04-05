import { Volume2 } from 'lucide-react';

interface SoundEnableOverlayProps {
  soundEnabled: boolean;
  enableSound: () => void;
}

export default function SoundEnableOverlay({ soundEnabled, enableSound }: SoundEnableOverlayProps) {
  if (soundEnabled) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-sm px-8">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center">
          <Volume2 className="w-10 h-10 text-indigo-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Enable Sound</h2>
          <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
            This session uses AI voice. Tap below so your browser allows audio playback on your device.
          </p>
        </div>

        <button
          onClick={enableSound}
          className="mt-2 flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-base font-semibold rounded-2xl shadow-lg shadow-indigo-900/40 transition-all border border-indigo-400/30"
        >
          <Volume2 className="w-5 h-5" />
          Enable Sound
        </button>

        <p className="text-xs text-neutral-600">
          Required by mobile browsers · No extra permissions needed
        </p>
      </div>
    </div>
  );
}

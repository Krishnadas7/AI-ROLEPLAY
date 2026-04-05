import { Mic, Square, Volume2 } from 'lucide-react';

interface PTTControlsProps {
  micPermission: 'unknown' | 'granted' | 'denied';
  isRecording: boolean;
  isLoading: boolean;
  sessionId: string | null;
  pendingSpeech: string | null;
  playPendingSpeech: (text: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  unlockAudio: () => void;
}

export default function PTTControls({
  micPermission,
  isRecording,
  isLoading,
  sessionId,
  pendingSpeech,
  playPendingSpeech,
  startRecording,
  stopRecording,
  unlockAudio
}: PTTControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent">
      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto w-full">
        {micPermission === 'denied' ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Mic className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm font-semibold text-red-400">Microphone Access Denied</p>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              This app needs microphone access to record your voice.
              Please tap the lock /&#8203;info icon in your browser's address bar and allow microphone, then reload the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl font-medium transition-colors"
            >
              Reload &amp; Try Again
            </button>
          </div>
        ) : (
          <>
            <div className={`h-8 flex items-center justify-center gap-1 transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
              {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${h * 4}px` }} />
              ))}
            </div>

            {pendingSpeech && !isRecording && (
              <button
                onClick={() => playPendingSpeech(pendingSpeech)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-sm font-medium rounded-full animate-pulse hover:bg-indigo-600/30 active:scale-95 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                Tap to hear AI reply
              </button>
            )}

            <button
              disabled={isLoading || !sessionId || micPermission === 'unknown'}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                unlockAudio();
                startRecording();
              }}
              onPointerUp={stopRecording}
              onPointerCancel={stopRecording}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              style={{
                touchAction: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 select-none ${isRecording
                  ? 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)] scale-95'
                  : 'bg-neutral-800 hover:bg-neutral-700 shadow-xl border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
              {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-indigo-400" />}
            </button>

            <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest text-center">
              {micPermission === 'unknown' ? 'Requesting mic...' : isRecording ? 'Release to Send' : 'Push to Talk'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

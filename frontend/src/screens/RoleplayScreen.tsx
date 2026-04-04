import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, X, Timer, Volume2 } from 'lucide-react';
import { startSession, sendMessage } from '../api/roleplayApi';

interface RoleplayScreenProps {
  onEnd: (sessionId?: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export default function RoleplayScreen({ onEnd }: RoleplayScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  // Whether the user has tapped "Enable Sound" (required on mobile to unlock audio)
  const [soundEnabled, setSoundEnabled] = useState(false);
  // UI state for pending speech (shown as fallback replay button)
  const [pendingSpeech, setPendingSpeech] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHoldingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const finalTranscriptRef = useRef('');
  const sessionStartedRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioCtxRef = useRef<any>(null);
  // Ref mirrors: prevent stale closure issues in onend callbacks
  const soundEnabledRef = useRef(false);
  const pendingSpeechRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Load voices into ref — on mobile, voices load async after voiceschanged fires
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) voicesRef.current = v;
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // ── Audio helpers ──────────────────────────────────────────────────────────

  /** Build a voice-matched SpeechSynthesisUtterance (does NOT call speak) */
  const buildUtterance = (text: string): SpeechSynthesisUtterance => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 1.0;
    u.volume = 1.0;
    const preferred =
      voicesRef.current.find(v => v.lang.startsWith('en') && !v.name.includes('Google')) ||
      voicesRef.current.find(v => v.lang.startsWith('en'));
    if (preferred) u.voice = preferred;
    return u;
  };

  /**
   * enableSound — must be called from a button onClick (user gesture).
   *
   * Steps:
   *  1. cancel() — clears any utterances stuck in the queue from blocked async
   *     speak() calls that happened before sound was enabled.
   *  2. AudioContext silent buffer — forces Android Chrome to MEDIA audio route
   *     (loudspeaker) instead of the earpiece/call route.
   *  3. Unlock utterance — '.' at rate=10 (<50ms, inaudible). Calling speak()
   *     inside a gesture permanently unlocks speechSynthesis for the page.
   *  4. unlock.onend — after unlock plays, speak the buffered pending AI message
   *     using pendingSpeechRef (ref avoids stale closure issues).
   */
  const enableSound = () => {
    setSoundEnabled(true);
    soundEnabledRef.current = true;

    // 1. Clear any stuck async utterances queued before sound was enabled
    window.speechSynthesis.cancel();

    // 2. AudioContext — forces Android loudspeaker routing
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        audioCtxRef.current = ctx;
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        ctx.resume();
        console.log('[Audio] AudioContext – loudspeaker route activated');
      }
    } catch (e) { console.error('[Audio] AudioContext error:', e); }

    // 3. Gesture-triggered unlock utterance
    const unlock = new SpeechSynthesisUtterance('.');
    unlock.rate = 10;
    unlock.volume = 1;
    unlock.lang = 'en-US';

    // 4. After unlock: speak the AI message that loaded while overlay was visible.
    //    Use pendingSpeechRef (not state) to avoid stale closure.
    unlock.onend = () => {
      console.log('[Audio] Unlock complete – speech synthesis ready');
      const pending = pendingSpeechRef.current;
      if (pending) {
        pendingSpeechRef.current = null;
        setPendingSpeech(null);
        window.speechSynthesis.speak(buildUtterance(pending));
      }
    };
    unlock.onerror = (e) => console.error('[Audio] Unlock utterance error:', e.error);

    window.speechSynthesis.speak(unlock);
    console.log('[Audio] Unlock utterance dispatched');
  };

  /**
   * speakText — called from async context (after AI API response).
   *
   * KEY RULE: If sound is NOT yet enabled, do NOT call speak() — doing so queues
   * a stuck utterance that will block the unlock utterance later (deadlock).
   * Instead, just buffer the text; enableSound will play it.
   *
   * If sound IS enabled, speak now (audio is already unlocked for the session).
   */
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text.trim()) return;

    if (!soundEnabledRef.current) {
      // Not yet enabled — buffer only, do NOT call speak()
      console.log('[Audio] Sound not enabled – buffering text');
      pendingSpeechRef.current = text;
      setPendingSpeech(text);
      return;
    }

    // Sound is enabled — safe to speak from async context
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      setTimeout(() => window.speechSynthesis.speak(buildUtterance(text)), 100);
    } else {
      window.speechSynthesis.speak(buildUtterance(text));
    }
  };

  /** Called from button onClick — guaranteed gesture context, always safe to speak. */
  const playPendingSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    pendingSpeechRef.current = null;
    setPendingSpeech(null);
    try { audioCtxRef.current?.resume(); } catch (_) {}
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      setTimeout(() => window.speechSynthesis.speak(buildUtterance(text)), 100);
    } else {
      window.speechSynthesis.speak(buildUtterance(text));
    }
  };

  /** Resume AudioContext on mic press (in case it was suspended by the OS) */
  const unlockAudio = () => {
    try { audioCtxRef.current?.resume(); } catch (_) {}
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Request microphone permission proactively on mount
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop the stream — we just needed the permission grant
        stream.getTracks().forEach(t => t.stop());
        setMicPermission('granted');
      } catch (err: any) {
        console.error('Mic permission error:', err);
        setMicPermission('denied');
      }
    };
    requestMicPermission();
  }, []);

  const doSendMessage = useCallback(async (text: string) => {
    const sid = sessionIdRef.current;
    console.log('[PTT] doSendMessage called. sid=', sid, 'text=', text);
    if (!sid || !text.trim()) {
      console.warn('[PTT] Aborting send — no session or empty text');
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendMessage(sid, text);
      if (res.success) {
        const aiMsg: Message = {
          id: res.data.aiMessage._id,
          role: 'ai',
          text: res.data.aiMessage.text,
        };
        setMessages(prev => [...prev, aiMsg]);
        speakText(res.data.aiMessage.text);
      }
    } catch (error) {
      console.error('Error sending message', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize Speech Recognition ONCE
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    // continuous=false is more reliable on Android — we manually restart 
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      // With continuous=false, event.results[0] is always the final result
      const chunk = event.results[0]?.[0]?.transcript || '';
      console.log('[Speech] onresult chunk:', chunk);
      if (chunk) {
        finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + chunk).trim();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[Speech] onerror:', event.error);
      if (event.error === 'no-speech') {
        // On Android no-speech fires when silent — restart if still holding
        if (isHoldingRef.current) {
          try { recognition.start(); } catch (_) {}
        }
        return;
      }
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
      }
      setIsRecording(false);
      isHoldingRef.current = false;
    };

    recognition.onend = () => {
      console.log('[Speech] onend. isHolding=', isHoldingRef.current, 'transcript=', finalTranscriptRef.current);
      if (isHoldingRef.current) {
        // User still holding — restart to keep capturing speech
        try { recognition.start(); } catch (_) {}
      } else {
        // User released — send everything accumulated
        setIsRecording(false);
        const text = finalTranscriptRef.current;
        finalTranscriptRef.current = '';
        if (text) {
          doSendMessage(text);
        } else {
          console.warn('[PTT] Released but transcript was empty');
        }
      }
    };

    recognitionRef.current = recognition;
    return () => { try { recognition.abort(); } catch (_) {} };
  }, [doSendMessage]);

  // Start Session — guarded to prevent React StrictMode double-fire
  useEffect(() => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    const initSession = async () => {
      try {
        setIsLoading(true);
        const res = await startSession();
        if (res.success) {
          const sid = res.data.session._id;
          setSessionId(sid);
          sessionIdRef.current = sid;
          setMessages([{
            id: res.data.initialMessage._id,
            role: 'ai',
            text: res.data.initialMessage.text,
          }]);
          speakText(res.data.initialMessage.text);
        }
      } catch (error) {
        console.error('Error starting session', error);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();
  }, []);

  const startRecording = () => {
    if (!sessionIdRef.current || isLoading) return;
    console.log('[PTT] startRecording');
    finalTranscriptRef.current = '';
    isHoldingRef.current = true;
    setIsRecording(true);
    try { recognitionRef.current?.start(); } catch (_) {}
  };

  const stopRecording = () => {
    if (!isHoldingRef.current) return;
    console.log('[PTT] stopRecording. transcript so far=', finalTranscriptRef.current);
    isHoldingRef.current = false;
    setIsRecording(false);
    // stop() will trigger onend, which sends the final accumulated transcript
    try { recognitionRef.current?.stop(); } catch (_) {}
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 z-10 relative">
      <header className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <span className="text-purple-400 font-bold text-sm">RM</span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">Rahul Mehta</h2>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Customer AI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            <Timer className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-mono text-neutral-300">{formatTime(seconds)}</span>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              isHoldingRef.current = false;
              try { recognitionRef.current?.abort(); } catch (_) {}
              onEnd(sessionId || undefined);
            }}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-900/20'
                : 'bg-neutral-800 text-neutral-100 rounded-tl-sm shadow-black/20'
            } shadow-lg`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              {msg.role === 'ai' && (
                <button
                  onClick={() => playPendingSpeech(msg.text)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-indigo-400 active:text-indigo-300 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tap to hear</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800/80 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto w-full">
        {micPermission === 'denied' ? (
          /* Permission denied — show a clear in-app guided banner */
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
              {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${h * 4}px` }} />
              ))}
            </div>

            {/* Tap to Hear — shown when auto-play is blocked (iOS Safari) */}
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
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 select-none ${
                isRecording
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

      {/* Sound Enable Overlay — shown until user explicitly taps to enable audio.
          Mobile browsers (Android Chrome, iOS Safari) REQUIRE a user gesture before
          speechSynthesis.speak() is allowed. This overlay IS that gesture. */}
      {!soundEnabled && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-sm px-8">
          {/* Ambient glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col items-center gap-6 text-center">
            {/* Icon */}
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
      )}
    </div>
  );
}

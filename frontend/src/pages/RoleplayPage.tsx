import { useState, useEffect, useRef, useCallback } from 'react';
import { startSession, sendMessage } from '../api/roleplayApi';
import RoleplayHeader from '../components/RoleplayHeader';
import RoleplayTranscript from '../components/RoleplayTranscript';
import PTTControls from '../components/PTTControls';
import SoundEnableOverlay from '../components/SoundEnableOverlay';

interface RoleplayPageProps {
  userId: string;
  userName: string;
  scenarioId: string;
  onEnd: (sessionId?: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export default function RoleplayPage({ userId, userName, scenarioId, onEnd }: RoleplayPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [pendingSpeech, setPendingSpeech] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHoldingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const finalTranscriptRef = useRef('');
  const sessionStartedRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioCtxRef = useRef<any>(null);
  const soundEnabledRef = useRef(false);
  const pendingSpeechRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

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

  const enableSound = () => {
    setSoundEnabled(true);
    soundEnabledRef.current = true;
    window.speechSynthesis.cancel();

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

    const unlock = new SpeechSynthesisUtterance('.');
    unlock.rate = 10;
    unlock.volume = 1;
    unlock.lang = 'en-US';

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

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text.trim()) return;

    if (!soundEnabledRef.current) {
      console.log('[Audio] Sound not enabled – buffering text');
      pendingSpeechRef.current = text;
      setPendingSpeech(text);
      return;
    }

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      setTimeout(() => window.speechSynthesis.speak(buildUtterance(text)), 100);
    } else {
      window.speechSynthesis.speak(buildUtterance(text));
    }
  };

  const playPendingSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    pendingSpeechRef.current = null;
    setPendingSpeech(null);
    try { audioCtxRef.current?.resume(); } catch (_) { }
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      setTimeout(() => window.speechSynthesis.speak(buildUtterance(text)), 100);
    } else {
      window.speechSynthesis.speak(buildUtterance(text));
    }
  };

  const unlockAudio = () => {
    try { audioCtxRef.current?.resume(); } catch (_) { }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const chunk = event.results[0]?.[0]?.transcript || '';
      console.log('[Speech] onresult chunk:', chunk);
      if (chunk) {
        finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + chunk).trim();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[Speech] onerror:', event.error);
      if (event.error === 'no-speech') {
        if (isHoldingRef.current) {
          try { recognition.start(); } catch (_) { }
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
        try { recognition.start(); } catch (_) { }
      } else {
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
    return () => { try { recognition.abort(); } catch (_) { } };
  }, [doSendMessage]);

  useEffect(() => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    const initSession = async () => {
      try {
        setIsLoading(true);
        const res = await startSession(userId, scenarioId);
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

  const handleEnd = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    isHoldingRef.current = false;
    try { recognitionRef.current?.abort(); } catch (_) { }
    onEnd(sessionId || undefined);
  };

  const startRecording = () => {
    if (!sessionIdRef.current || isLoading) return;
    console.log('[PTT] startRecording');
    finalTranscriptRef.current = '';
    isHoldingRef.current = true;
    setIsRecording(true);
    try { recognitionRef.current?.start(); } catch (_) { }
  };

  const stopRecording = () => {
    if (!isHoldingRef.current) return;
    console.log('[PTT] stopRecording. transcript so far=', finalTranscriptRef.current);
    isHoldingRef.current = false;
    setIsRecording(false);
    try { recognitionRef.current?.stop(); } catch (_) { }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 z-10 relative">
      <RoleplayHeader 
        scenarioId={scenarioId}
        userName={userName}
        seconds={seconds}
        onEnd={handleEnd}
      />

      <RoleplayTranscript 
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        playPendingSpeech={playPendingSpeech}
      />

      <PTTControls 
        micPermission={micPermission}
        isRecording={isRecording}
        isLoading={isLoading}
        sessionId={sessionId}
        pendingSpeech={pendingSpeech}
        playPendingSpeech={playPendingSpeech}
        startRecording={startRecording}
        stopRecording={stopRecording}
        unlockAudio={unlockAudio}
      />

      <SoundEnableOverlay 
        soundEnabled={soundEnabled}
        enableSound={enableSound}
      />
    </div>
  );
}

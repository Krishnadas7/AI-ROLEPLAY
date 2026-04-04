import { useState, useEffect, useRef } from 'react';
import { Mic, Square, X, Timer } from 'lucide-react';
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
  
  // Voice recognition refs
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [sessionId]);

  // Start Session
  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        const res = await startSession();
        if (res.success) {
          setSessionId(res.data.session._id);
          setMessages([{
            id: res.data.initialMessage._id,
            role: 'ai',
            text: res.data.initialMessage.text,
          }]);
          speakText(res.data.initialMessage.text);
        }
      } catch (error) {
        console.error("Error starting session", error);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();
  }, []);

  const handleSendTranscript = async (text: string) => {
    if (!sessionId) return;
    
    // Optimistic UI update
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendMessage(sessionId, text);
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
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 z-10 relative">
      {/* Header */}
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
          <button onClick={() => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (recognitionRef.current && isRecording) recognitionRef.current.stop();
            onEnd(sessionId || undefined);
          }} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20">
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
            } shadow-lg backdrop-blur-sm`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
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

      {/* Constraints Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto w-full">
          {/* Audio Visualizer Mock */}
          <div className={`h-8 flex items-center justify-center gap-1 transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
            {[1,2,3,4,5,4,3,2,1].map((h, i) => (
              <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${h * 4}px` }} />
            ))}
          </div>

          <button 
            disabled={isLoading || !sessionId}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)] scale-95' 
                : 'bg-neutral-800 hover:bg-neutral-700 shadow-xl border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-indigo-400" />}
          </button>
          
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest text-center">
            {isRecording ? 'Release to Send' : 'Push to Talk'}
          </p>
        </div>
      </div>
    </div>
  );
}

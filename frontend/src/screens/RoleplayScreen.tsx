import { useState, useEffect } from 'react';
import { Mic, Square, X, Timer } from 'lucide-react';

interface RoleplayScreenProps {
  onEnd: () => void;
}

export default function RoleplayScreen({ onEnd }: RoleplayScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Mock messages for UI demonstration
  const [messages] = useState([
    { id: 1, role: 'ai', text: 'Hi, I need help. My phone was stolen this morning and I need a replacement SIM card immediately.' },
    { id: 2, role: 'user', text: 'I am so sorry to hear that, Mr. Mehta. Let me help you with that right away. Do you have a photo ID with you?' },
    { id: 3, role: 'ai', text: 'Yes, I have my Aadhaar card, but I do not have the physical copy, just on my DigiLocker. Will that work?' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

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
          <button onClick={onEnd} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20">
             <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
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

        {/* AI Typing indicator mockup */}
        <div className="flex justify-start">
          <div className="bg-neutral-800/80 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
          </div>
        </div>
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
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => setIsRecording(false)}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)] scale-95' 
                : 'bg-neutral-800 hover:bg-neutral-700 shadow-xl border border-neutral-700'
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

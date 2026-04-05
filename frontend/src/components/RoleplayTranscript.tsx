import React from 'react';
import { Volume2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

interface RoleplayTranscriptProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  playPendingSpeech: (text: string) => void;
}

export default function RoleplayTranscript({ messages, isLoading, messagesEndRef, playPendingSpeech }: RoleplayTranscriptProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 scroll-smooth">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
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
  );
}

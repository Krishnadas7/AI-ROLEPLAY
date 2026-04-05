import { MessageSquareText, Volume2 } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatTranscriptProps {
  messages: Message[];
  playAudio: (text: string) => void;
}

export default function ChatTranscript({ messages, playAudio }: ChatTranscriptProps) {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-neutral-800/80 mt-4">
      <div className="flex items-center gap-2">
        <MessageSquareText className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider px-1">Session Transcript</h3>
      </div>
      <div className="space-y-4 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl group ${
              msg.sender === 'user' 
                ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30 rounded-tr-sm' 
                : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-sm'
            }`}>
              <div className="flex items-center justify-between gap-4 mb-1">
                <p className="text-xs font-semibold opacity-75">{msg.sender === 'user' ? 'You' : 'Rahul Mehta'} {msg.sender !== 'user' && '(AI)'}</p>
                <button 
                  onClick={() => playAudio(msg.text)}
                  className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print ${msg.sender === 'user' ? 'bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300' : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'}`}
                  title="Play Audio"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

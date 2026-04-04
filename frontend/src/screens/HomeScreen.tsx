import { useState, useEffect } from 'react';
import { User, Phone, ShieldCheck, Play, History, Clock } from 'lucide-react';
import { getSessionHistory } from '../api/roleplayApi';

interface HomeScreenProps {
  onStart: () => void;
  onViewHistory: (sessionId: string) => void;
}

export default function HomeScreen({ onStart, onViewHistory }: HomeScreenProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    getSessionHistory().then(res => {
      if (res.success) {
        setHistory(res.data);
      }
      setIsLoadingHistory(false);
    }).catch(err => {
      console.error(err);
      setIsLoadingHistory(false);
    });
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 z-10 relative overflow-y-auto">
      <div className="flex-none flex flex-col justify-center gap-6 mt-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2 border border-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">ConnectIndia</h1>
          <p className="text-neutral-400">AI Roleplay Assessment</p>
        </div>

        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          
          <h2 className="text-xl font-semibold mb-4 text-white/90">Scenario Briefing</h2>
          
          <p className="text-neutral-300 leading-relaxed mb-6">
            A customer named <strong className="text-indigo-300">Rahul Mehta</strong> walks into the store. His phone was stolen this morning and he urgently needs a SIM replacement.
            You must handle his request appropriately while adhering to company protocols.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800">
              <div className="bg-purple-500/20 p-2 rounded-xl">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Customer (AI)</p>
                <p className="text-xs text-neutral-400">Rahul Mehta, mid-30s</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800">
              <div className="bg-indigo-500/20 p-2 rounded-xl">
                <Phone className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Store Executive</p>
                <p className="text-xs text-neutral-400">You (Candidate)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 flex-none">
        <button
          onClick={() => {
            // Unlock SpeechSynthesis on mobile by playing a silent utterance on first user interaction
            if ('speechSynthesis' in window) {
              window.speechSynthesis.resume();
              const utterance = new SpeechSynthesisUtterance('');
              utterance.volume = 0;
              window.speechSynthesis.speak(utterance);
            }
            onStart();
          }}
          className="w-full relative group overflow-hidden rounded-2xl p-[1px]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
          <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-2xl text-white font-medium text-lg transition-transform duration-200 group-hover:scale-[0.98]">
            Start Roleplay
            <Play className="w-5 h-5 fill-current" />
          </div>
        </button>
      </div>

      <div className="flex-1 space-y-4 pb-6">
        <div className="flex items-center gap-2 px-2 text-neutral-400">
          <History className="w-5 h-5" />
          <h2 className="text-lg font-medium text-white">Past Attempts</h2>
        </div>
        
        <div className="space-y-3">
          {isLoadingHistory ? (
            <div className="flex justify-center p-4">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-6 border border-neutral-800 rounded-2xl bg-neutral-900/30 text-neutral-500 text-sm">
              No past attempts yet. Check back here later!
            </div>
          ) : (
            history.map((attempt: any) => (
              <button 
                key={attempt.id} 
                onClick={() => attempt.sessionId && onViewHistory(attempt.sessionId)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800/80 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${attempt.overallScore >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {attempt.overallScore}%
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Simulation Session</p>
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(attempt.createdAt)}
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-widest ${attempt.overallScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {attempt.overallScore >= 80 ? 'Passed' : 'Review'}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

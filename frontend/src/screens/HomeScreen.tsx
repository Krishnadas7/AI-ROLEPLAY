import { useState, useEffect } from 'react';
import { User as UserIcon, Phone, ShieldCheck, Play, History, Clock, KeyRound } from 'lucide-react';
import { getSessionHistory, identifyUser } from '../api/roleplayApi';

interface HomeScreenProps {
  user: { _id: string; name: string; email: string } | null;
  onSetUser: (u: any) => void;
  onStart: () => void;
  onViewHistory: (sessionId: string) => void;
}

export default function HomeScreen({ user, onSetUser, onStart, onViewHistory }: HomeScreenProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isIdentifying, setIsIdentifying] = useState(false);

  useEffect(() => {
    if (!user || !user._id) {
      setHistory([]);
      return;
    }
    setIsLoadingHistory(true);
    getSessionHistory(user._id).then(res => {
      if (res.success) {
        setHistory(res.data);
      }
      setIsLoadingHistory(false);
    }).catch(err => {
      console.error(err);
      setIsLoadingHistory(false);
    });
  }, [user]);

  const handleIdentify = async () => {
    if (!name || !email) return;
    setIsIdentifying(true);
    try {
      const res = await identifyUser(name, email);
      if (res.success) {
        onSetUser(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsIdentifying(false);
    }
  };

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
                <UserIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Customer (AI)</p>
                <p className="text-xs text-neutral-400">Rahul Mehta, mid-30s</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl bg-neutral-950/50 border ${user ? 'border-emerald-500/30' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-500/20 p-2 rounded-xl">
                  <Phone className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Store Executive</p>
                  <p className="text-xs text-neutral-400">{user ? 'Identified successfully' : 'Enter details to start'}</p>
                </div>
              </div>

              {!user ? (
                <div className="space-y-3 mt-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    onClick={handleIdentify}
                    disabled={isIdentifying || !name || !email}
                    className="w-full flex justify-center items-center gap-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    {isIdentifying ? 'Identifying...' : 'Save & Continue'}
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-neutral-900 p-3 rounded-xl border border-neutral-800 mt-2">
                  <div>
                    <p className="text-sm text-white font-medium">{user.name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <button onClick={() => onSetUser(null)} className="text-xs text-indigo-400 hover:text-indigo-300">Change</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 flex-none">
        <button
          disabled={!user}
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
          className={`w-full relative group overflow-hidden rounded-2xl p-[1px] ${!user && 'opacity-50 cursor-not-allowed'}`}
        >
          {user && <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>}
          <div className={`relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-medium text-lg transition-transform duration-200 ${user ? 'bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:scale-[0.98]' : 'bg-neutral-800'}`}>
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
          {!user ? (
            <div className="text-center p-6 border border-neutral-800 rounded-2xl bg-neutral-900/30 text-neutral-500 text-sm">
              Please enter your name and email to view past attempts.
            </div>
          ) : isLoadingHistory ? (
            <div className="flex justify-center p-4">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-6 border border-neutral-800 rounded-2xl bg-neutral-900/30 text-neutral-500 text-sm">
              No past attempts found. Try a session!
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

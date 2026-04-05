import { useState, useEffect } from 'react';
import { User as UserIcon, Phone, ShieldCheck, Play, History, KeyRound } from 'lucide-react';
import { getSessionHistory, identifyUser } from '../api/roleplayApi';

interface HomeScreenProps {
  user: { _id: string; name: string; email: string } | null;
  onSetUser: (u: any) => void;
  onStart: (scenarioId: string) => void;
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
    <div className="flex-1 flex flex-col p-6 z-10 relative overflow-y-auto scrollbar-hide">
      <div className="flex-none flex flex-col gap-6 mt-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2 border border-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">ConnectIndia</h1>
          <p className="text-neutral-400">AI Roleplay Assessment</p>
        </div>

        {/* Identity Section */}
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />

          <h2 className="text-xl font-semibold mb-4 text-white/90">Your Identity</h2>
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

        {/* Scenarios Area */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4 text-white/90">Available Scenarios</h2>
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x text-left scrollbar-hide lg:px-2 w-full max-w-full md:justify-center">
            {[
              {
                id: "mobile_stolen",
                title: "Mobile Stolen",
                customer: "Rahul Mehta",
                description: "His phone was stolen this morning and he urgently needs a SIM replacement. You must handle his request appropriately while adhering to company protocols."
              },
              {
                id: "network_issue",
                title: "Network Issue (Angry Customer)",
                customer: "Priya Nair",
                description: "Facing severe call drops and extremely slow internet speeds. She is very frustrated. You must de-escalate the situation and provide a clear resolution timeline."
              }
            ].map(scenario => {
              const scenarioHistory = history.filter(h => h.scenarioTitle === scenario.title);

              return (
                <div key={scenario.id} className="snap-center shrink-0 w-[300px] lg:w-[320px] bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-[2rem] p-5 flex flex-col shadow-lg shadow-black/20">
                  <div>
                    <h2 className="text-lg font-semibold text-white/90 mb-2">{scenario.title}</h2>
                    <p className="text-neutral-300 text-sm leading-relaxed mb-4">{scenario.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800">
                      <div className="bg-purple-500/20 p-2 rounded-xl">
                        <UserIcon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Customer (AI)</p>
                        <p className="text-xs text-neutral-400">{scenario.customer}</p>
                      </div>
                    </div>

                    <button
                      disabled={!user}
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.resume();
                          const utterance = new SpeechSynthesisUtterance('');
                          utterance.volume = 0;
                          window.speechSynthesis.speak(utterance);
                        }
                        onStart(scenario.id);
                      }}
                      className={`w-full relative group overflow-hidden rounded-xl p-[1px] ${!user && 'opacity-50 cursor-not-allowed'}`}
                    >
                      {user && <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>}
                      <div className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium text-sm transition-transform duration-200 ${user ? 'bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:scale-[0.98]' : 'bg-neutral-800'}`}>
                        Start {scenario.title.split(' ')[0]}
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                    </button>

                    {/* Embedded Past Attempts */}
                    {user && (
                      <div className="mt-4 pt-4 border-t border-neutral-800/80">
                        <div className="flex items-center justify-between mb-3 text-neutral-400">
                          <div className="flex items-center gap-1.5 focus:outline-none">
                            <History className="w-4 h-4" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider">Past Attempts</h3>
                          </div>
                          <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded-full">{scenarioHistory.length}</span>
                        </div>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hide pr-1">
                          {isLoadingHistory ? (
                            <div className="flex justify-center p-4"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                          ) : scenarioHistory.length === 0 ? (
                            <div className="text-center p-4 border border-neutral-800/50 rounded-xl bg-neutral-900/30 text-neutral-500 text-xs">
                              No past attempts yet.
                            </div>
                          ) : (
                            scenarioHistory.map((attempt: any) => (
                              <button
                                key={attempt.id}
                                onClick={() => attempt.sessionId && onViewHistory(attempt.sessionId)}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 hover:bg-neutral-800 transition-all hover:scale-[1.02]"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex flex-col items-center justify-center font-bold text-[10px] sm:text-xs leading-none ${attempt.overallScore >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                    {attempt.overallScore}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs font-medium text-white/90">Score Details</p>
                                    <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                                      {formatDate(attempt.createdAt)}
                                    </div>
                                  </div>
                                </div>
                                <div className={`text-[10px] font-semibold uppercase tracking-wider ${attempt.overallScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {attempt.overallScore >= 80 ? 'Pass' : 'Review'}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

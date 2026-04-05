import { User as UserIcon, Play, History } from 'lucide-react';

interface ScenarioCardProps {
  scenario: {
    id: string;
    title: string;
    customer: string;
    description: string;
  };
  user: any;
  history: any[];
  isLoadingHistory: boolean;
  onStart: (scenarioId: string) => void;
  onViewHistory: (sessionId: string) => void;
  formatDate: (dateStr: string) => string;
}

export default function ScenarioCard({
  scenario,
  user,
  history,
  isLoadingHistory,
  onStart,
  onViewHistory,
  formatDate
}: ScenarioCardProps) {
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
}

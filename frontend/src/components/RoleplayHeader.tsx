import { Timer, X } from 'lucide-react';

interface RoleplayHeaderProps {
  scenarioId: string;
  userName: string;
  seconds: number;
  onEnd: () => void;
}

export default function RoleplayHeader({ scenarioId, userName, seconds, onEnd }: RoleplayHeaderProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-20 overflow-hidden">
      <div className="flex items-center gap-2 min-w-0 mr-2">
        <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
          <span className="text-purple-400 font-bold text-xs sm:text-sm">
            {scenarioId === 'network_issue' ? 'PN' : 'RM'}
          </span>
        </div>
        <div className="truncate">
          <h2 className="text-sm font-medium text-white truncate">
            {scenarioId === 'network_issue' ? 'Priya Nair' : 'Rahul Mehta'}
          </h2>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-neutral-400 truncate">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="truncate">Customer AI</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="hidden min-[360px]:flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 py-1 pl-1 pr-2 rounded-full relative" title={userName || 'You'}>
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <span className="text-indigo-400 font-bold text-[10px] leading-none">{userName ? userName.charAt(0).toUpperCase() : 'Y'}</span>
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-neutral-300 truncate max-w-[45px] sm:max-w-[70px]">
            {userName ? userName.split(' ')[0] : 'You'}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 bg-neutral-900 px-2 sm:px-3 py-1.5 rounded-lg border border-neutral-800">
          <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 shrink-0" />
          <span className="text-xs sm:text-sm font-mono text-neutral-300 tracking-tight">{formatTime(seconds)}</span>
        </div>
        <button
          onClick={onEnd}
          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

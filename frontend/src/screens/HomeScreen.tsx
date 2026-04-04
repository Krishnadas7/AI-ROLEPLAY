import { User, Phone, ShieldCheck, Play } from 'lucide-react';

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col p-6 z-10 relative overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center gap-6 mt-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2 border border-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">ConnectIndia</h1>
          <p className="text-neutral-400">AI Roleplay Assessment</p>
        </div>

        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 shadow-xl mt-4 relative overflow-hidden">
          {/* Subtle gradient overlay */}
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

      <div className="pt-8 pb-4">
        <button
          onClick={onStart}
          className="w-full relative group overflow-hidden rounded-2xl p-[1px]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
          <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-2xl text-white font-medium text-lg transition-transform duration-200 group-hover:scale-[0.98]">
            Start Roleplay
            <Play className="w-5 h-5 fill-current" />
          </div>
        </button>
      </div>
    </div>
  );
}

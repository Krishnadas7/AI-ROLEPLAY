import { CheckCircle2, ChevronRight, Home, ShieldX, RotateCcw } from 'lucide-react';

interface ScoreScreenProps {
  onHome: () => void;
}

export default function ScoreScreen({ onHome }: ScoreScreenProps) {
  const score = 84;

  const rubric = [
    { title: 'Protocol Adherence', score: 90, comment: 'Verified ID perfectly.', passed: true },
    { title: 'Problem Solving', score: 85, comment: 'Provided quick workaround.', passed: true },
    { title: 'Empathy & Tone', score: 60, comment: 'Slightly robotic initially.', passed: false },
    { title: 'Time Efficiency', score: 100, comment: 'Handled within 2 mins.', passed: true },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 z-10 relative overflow-y-auto">
      <div className="flex-1 flex flex-col gap-8 mt-8 pb-10">
        
        {/* Score Header */}
        <div className="text-center space-y-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
          <div className="relative w-40 h-40 mx-auto rounded-full border-[6px] border-indigo-500/20 flex flex-col items-center justify-center">
            {/* Mock circular progress using SVG could go here, replaced with simple border for UI demo */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="74" cy="74" r="71" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-neutral-800" />
              <circle cx="74" cy="74" r="71" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="446" strokeDashoffset={446 - (446 * score) / 100} className="text-indigo-500 transition-all duration-1000 ease-out" />
            </svg>
            <span className="text-4xl font-bold tracking-tight text-white">{score}<span className="text-xl text-neutral-400">%</span></span>
            <span className="text-xs text-neutral-400 font-medium tracking-wide">TOTAL SCORE</span>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-white">Evaluation Complete</h2>
            <p className="text-neutral-400 mt-1">Great job! Here's your detailed breakdown.</p>
          </div>
        </div>

        {/* Criteria Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">Performance Rubric</h3>
          
          {rubric.map((item, idx) => (
            <div key={idx} className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/80 rounded-2xl p-4 transition-all hover:bg-neutral-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ShieldX className="w-5 h-5 text-amber-500" />
                  )}
                  <h4 className="text-white font-medium text-sm">{item.title}</h4>
                </div>
                <span className={`font-bold text-sm ${item.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {item.score}/100
                </span>
              </div>
              <p className="text-neutral-400 text-sm ml-7">{item.comment}</p>
            </div>
          ))}
        </div>

      </div>

      <div className="mt-auto space-y-3">
         <button className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3.5 rounded-xl font-medium transition-colors">
          <RotateCcw className="w-4 h-4" />
          Review Transcript
        </button>
        <button
          onClick={onHome}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-medium transition-colors border border-indigo-500/50"
        >
          <Home className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

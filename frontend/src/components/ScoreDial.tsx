
interface ScoreDialProps {
  overallScore: number;
}

export default function ScoreDial({ overallScore }: ScoreDialProps) {
  return (
    <div className="text-center space-y-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
      <div className="relative w-40 h-40 mx-auto rounded-full border-[6px] border-indigo-500/20 flex flex-col items-center justify-center bg-neutral-950/50">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="74" cy="74" r="71" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-neutral-800" />
          <circle cx="74" cy="74" r="71" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="446" strokeDashoffset={446 - (446 * overallScore) / 100} className="text-indigo-500 transition-all duration-1000 ease-out" />
        </svg>
        <span className="text-4xl font-bold tracking-tight text-white">{overallScore}<span className="text-xl text-neutral-400">%</span></span>
        <span className="text-xs text-neutral-400 font-medium tracking-wide">TOTAL SCORE</span>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-white">Evaluation Complete</h2>
        <p className="text-neutral-400 mt-1">Here is the detailed breakdown.</p>
      </div>
    </div>
  );
}

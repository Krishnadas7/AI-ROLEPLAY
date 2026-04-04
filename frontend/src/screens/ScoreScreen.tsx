import { useState, useEffect } from 'react';
import { CheckCircle2, Home, ShieldX, Printer } from 'lucide-react';
import { endSession } from '../api/roleplayApi';

interface ScoreScreenProps {
  sessionId: string | null;
  onHome: () => void;
}

export default function ScoreScreen({ sessionId, onHome }: ScoreScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      endSession(sessionId)
        .then(res => {
          setScoreData(res.data.score);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch score", err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative h-full">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-6 text-neutral-300 font-medium animate-pulse text-lg tracking-wide">Generating Evaluation Report...</p>
        <p className="mt-2 text-neutral-500 text-sm text-center max-w-xs">Our AI is analyzing the transcript for protocol adherence, problem solving, empathy, and efficiency.</p>
      </div>
    );
  }

  const overallScore = scoreData?.overallScore || 0;

  const rubric = [
    { 
      title: 'Protocol Adherence', 
      score: scoreData?.criteria?.protocolAdherence || 0, 
      comment: scoreData?.feedback?.protocolAdherence || 'N/A', 
      passed: (scoreData?.criteria?.protocolAdherence || 0) >= 80 
    },
    { 
      title: 'Problem Solving', 
      score: scoreData?.criteria?.problemSolving || 0, 
      comment: scoreData?.feedback?.problemSolving || 'N/A', 
      passed: (scoreData?.criteria?.problemSolving || 0) >= 80 
    },
    { 
      title: 'Empathy & Tone', 
      score: scoreData?.criteria?.empathyAndTone || 0, 
      comment: scoreData?.feedback?.empathyAndTone || 'N/A', 
      passed: (scoreData?.criteria?.empathyAndTone || 0) >= 80 
    },
    { 
      title: 'Time Efficiency', 
      score: scoreData?.criteria?.timeEfficiency || 0, 
      comment: scoreData?.feedback?.timeEfficiency || 'N/A', 
      passed: (scoreData?.criteria?.timeEfficiency || 0) >= 80 
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 z-10 relative overflow-y-auto">
      <div className="flex-1 flex flex-col gap-8 mt-8 pb-10">
        
        {/* Score Header */}
        <div className="text-center space-y-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
          <div className="relative w-40 h-40 mx-auto rounded-full border-[6px] border-indigo-500/20 flex flex-col items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="74" cy="74" r="71" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-neutral-800" />
              <circle cx="74" cy="74" r="71" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="446" strokeDashoffset={446 - (446 * overallScore) / 100} className="text-indigo-500 transition-all duration-1000 ease-out" />
            </svg>
            <span className="text-4xl font-bold tracking-tight text-white">{overallScore}<span className="text-xl text-neutral-400">%</span></span>
            <span className="text-xs text-neutral-400 font-medium tracking-wide">TOTAL SCORE</span>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-white">Evaluation Complete</h2>
            <p className="text-neutral-400 mt-1">Great job! Here's your detailed breakdown.</p>
          </div>
        </div>

        {/* AI Summary */}
        {scoreData?.summary && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
            <p className="text-sm text-indigo-200 leading-relaxed italic">"{scoreData.summary}"</p>
          </div>
        )}

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

      <div className="mt-auto space-y-3 no-print">
        <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3.5 rounded-xl font-medium transition-colors">
          <Printer className="w-4 h-4" />
          Download/Print Score Report
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

import { CheckCircle2, ShieldX } from 'lucide-react';

interface RubricItem {
  title: string;
  score: number;
  comment: string;
  passed: boolean;
}

interface RubricListProps {
  rubric: RubricItem[];
}

export default function RubricList({ rubric }: RubricListProps) {
  return (
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
  );
}

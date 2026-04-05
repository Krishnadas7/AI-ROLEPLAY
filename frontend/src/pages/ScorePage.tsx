import { useState, useEffect } from 'react';
import { Home, ArrowLeft, Printer } from 'lucide-react';
import { endSession, getSessionDetails } from '../api/roleplayApi';
import ScoreDial from '../components/ScoreDial';
import RubricList from '../components/RubricList';
import ChatTranscript from '../components/ChatTranscript';

interface ScorePageProps {
  sessionId: string | null;
  mode: 'end' | 'history';
  onHome: () => void;
}

export default function ScorePage({ sessionId, mode, onHome }: ScorePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      if (mode === 'end') {
        endSession(sessionId)
          .then(res => {
            setScoreData(res.data.score);
            setMessages(res.data.messages || []);
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Failed to end session", err);
            setIsLoading(false);
          });
      } else {
        getSessionDetails(sessionId)
          .then(res => {
            setScoreData(res.data.score);
            setMessages(res.data.messages || []);
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Failed to fetch session details", err);
            setIsLoading(false);
          });
      }
    } else {
      setIsLoading(false);
    }
  }, [sessionId, mode]);

  const handlePrint = () => {
    window.print();
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en-') && !v.name.includes('Google'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative h-full">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-6 text-neutral-300 font-medium animate-pulse text-lg tracking-wide">
          {mode === 'end' ? 'Generating Evaluation Report...' : 'Loading Past Attempt...'}
        </p>
        {mode === 'end' && (
          <p className="mt-2 text-neutral-500 text-sm text-center max-w-xs">Our AI is analyzing the transcript for protocol adherence, problem solving, empathy, and efficiency.</p>
        )}
      </div>
    );
  }

  const overallScore = scoreData?.overallScore || 0;

  const rubric = [
    { 
      title: 'Relevance', 
      score: scoreData?.criteria?.relevance || 0, 
      comment: scoreData?.feedback?.relevance || 'N/A', 
      passed: (scoreData?.criteria?.relevance || 0) >= 80 
    },
    { 
      title: 'Clarity', 
      score: scoreData?.criteria?.clarity || 0, 
      comment: scoreData?.feedback?.clarity || 'N/A', 
      passed: (scoreData?.criteria?.clarity || 0) >= 80 
    },
    { 
      title: 'Completeness', 
      score: scoreData?.criteria?.completeness || 0, 
      comment: scoreData?.feedback?.completeness || 'N/A', 
      passed: (scoreData?.criteria?.completeness || 0) >= 80 
    },
    { 
      title: 'Confidence', 
      score: scoreData?.criteria?.confidence || 0, 
      comment: scoreData?.feedback?.confidence || 'N/A', 
      passed: (scoreData?.criteria?.confidence || 0) >= 80 
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 z-10 relative overflow-y-auto">
      <button 
        onClick={onHome} 
        className="absolute top-4 left-4 p-2 bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition-colors z-20 no-print backdrop-blur-sm"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 flex flex-col gap-8 mt-8 pb-10">
        
        <ScoreDial overallScore={overallScore} />

        {scoreData?.summary && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 page-break-inside-avoid">
            <p className="text-sm text-indigo-200 leading-relaxed italic">"{scoreData.summary}"</p>
          </div>
        )}

        <RubricList rubric={rubric} />

        <ChatTranscript messages={messages} playAudio={playAudio} />

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

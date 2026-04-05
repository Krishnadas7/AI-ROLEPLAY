import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getSessionHistory, identifyUser } from '../api/roleplayApi';
import IdentitySection from '../components/IdentitySection';
import ScenarioCard from '../components/ScenarioCard';

interface HomePageProps {
  user: { _id: string; name: string; email: string } | null;
  onSetUser: (u: any) => void;
  onStart: (scenarioId: string) => void;
  onViewHistory: (sessionId: string) => void;
}

export default function HomePage({ user, onSetUser, onStart, onViewHistory }: HomePageProps) {
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

  const scenarios = [
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
  ];

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

        <IdentitySection
          user={user}
          name={name}
          email={email}
          setName={setName}
          setEmail={setEmail}
          isIdentifying={isIdentifying}
          handleIdentify={handleIdentify}
          onSetUser={onSetUser}
        />

        {/* Scenarios Area */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4 text-white/90">Available Scenarios</h2>
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x text-left scrollbar-hide lg:px-2 w-full max-w-full md:justify-center">
            {scenarios.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                user={user}
                history={history}
                isLoadingHistory={isLoadingHistory}
                onStart={onStart}
                onViewHistory={onViewHistory}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

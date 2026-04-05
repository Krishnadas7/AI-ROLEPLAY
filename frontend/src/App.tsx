import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import RoleplayPage from './pages/RoleplayPage';
import ScorePage from './pages/ScorePage';
import NotFoundPage from './pages/NotFoundPage';
import ServerErrorPage from './pages/ServerErrorPage';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'roleplay' | 'score' | '404' | '500'>('home');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('mobile_stolen');
  const [sessionMode, setSessionMode] = useState<'end' | 'history'>('end');
  const [user, setUser] = useState<{ _id: string; name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('roleplay_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('roleplay_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('roleplay_active_user');
    }
  }, [user]);

  useEffect(() => {
    const handleAppError = (event: Event) => {
      const customEvent = event as CustomEvent<{ type: '404' | '500' }>;
      setCurrentScreen(customEvent.detail.type);
    };

    window.addEventListener('app-error', handleAppError);
    return () => window.removeEventListener('app-error', handleAppError);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 flex items-center justify-center lg:py-8">
      {/* 
        Main Container 
        Added max-w-md and mobile-app-like constraints so it looks great on Desktop 
        while remaining natively responsive for Mobile.
      */}
      <main
        className="w-full h-[100dvh] lg:h-[90vh] bg-[#0a0a0a] lg:border border-neutral-800/50 lg:rounded-[40px] lg:shadow-2xl flex flex-col relative overflow-hidden"
        style={{ maxWidth: currentScreen === 'home' ? '72rem' : '48rem' }}
      >

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        {currentScreen === 'home' && <HomePage user={user} onSetUser={setUser} onStart={(scenarioId) => { setSelectedScenarioId(scenarioId); setCurrentScreen('roleplay'); }} onViewHistory={(id) => { setActiveSessionId(id); setSessionMode('history'); setCurrentScreen('score'); }} />}
        {currentScreen === 'roleplay' && <RoleplayPage userId={user?._id || ''} userName={user?.name || ''} scenarioId={selectedScenarioId} onEnd={(id) => { setActiveSessionId(id || null); setSessionMode('end'); setCurrentScreen('score'); }} />}
        {currentScreen === 'score' && <ScorePage sessionId={activeSessionId} mode={sessionMode} onHome={() => setCurrentScreen('home')} />}
        {currentScreen === '404' && <NotFoundPage onHome={() => setCurrentScreen('home')} />}
        {currentScreen === '500' && <ServerErrorPage onHome={() => setCurrentScreen('home')} />}
      </main>
    </div>
  );
}

export default App;

import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import RoleplayScreen from './screens/RoleplayScreen';
import ScoreScreen from './screens/ScoreScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'roleplay' | 'score'>('home');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 flex items-center justify-center lg:py-8">
      {/* 
        Main Container 
        Added max-w-md and mobile-app-like constraints so it looks great on Desktop 
        while remaining natively responsive for Mobile.
      */}
      <main className="w-full max-w-md h-[100dvh] lg:h-[850px] lg:max-h-[90vh] bg-[#0a0a0a] lg:border border-neutral-800/50 lg:rounded-[40px] lg:shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        {currentScreen === 'home' && <HomeScreen onStart={() => setCurrentScreen('roleplay')} />}
        {currentScreen === 'roleplay' && <RoleplayScreen onEnd={() => setCurrentScreen('score')} />}
        {currentScreen === 'score' && <ScoreScreen onHome={() => setCurrentScreen('home')} />}
      </main>
    </div>
  );
}

export default App;

import React from 'react';
import { Home, AlertCircle } from 'lucide-react';

interface NotFoundPageProps {
  onHome: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onHome }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center z-10 relative">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
        <AlertCircle className="w-24 h-24 text-indigo-400 relative z-10 animate-[bounce_3s_ease-in-out_infinite]" />
      </div>
      <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
        404
      </h1>
      <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
      <p className="text-neutral-400 mb-10 max-w-sm text-lg">
        The destination you are trying to reach has vanished into the digital void.
      </p>
      <button
        onClick={onHome}
        className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95"
      >
        <Home className="w-5 h-5" />
        Return Home
      </button>
    </div>
  );
};

export default NotFoundPage;

import React from 'react';
import { Home, ServerCrash } from 'lucide-react';

interface ServerErrorScreenProps {
  onHome: () => void;
  onRetry?: () => void;
}

const ServerErrorScreen: React.FC<ServerErrorScreenProps> = ({ onHome, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center z-10 relative">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
        <ServerCrash className="w-24 h-24 text-red-500 relative z-10 animate-pulse" />
      </div>
      <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
        500
      </h1>
      <h2 className="text-2xl font-bold text-white mb-3">Internal Server Error</h2>
      <p className="text-neutral-400 mb-10 max-w-sm text-lg">
        Our servers are currently experiencing difficulties. We are working on resolving the issue.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-2xl transition-all w-full sm:w-auto"
          >
            Try Again
          </button>
        )}
        <button
          onClick={onHome}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-medium rounded-2xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 w-full sm:w-auto"
        >
          <Home className="w-5 h-5" />
          Return Home
        </button>
      </div>
    </div>
  );
};

export default ServerErrorScreen;

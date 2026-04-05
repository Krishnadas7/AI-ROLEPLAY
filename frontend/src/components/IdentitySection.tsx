import { Phone, KeyRound } from 'lucide-react';

interface IdentitySectionProps {
  user: { _id: string; name: string; email: string } | null;
  name: string;
  email: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  isIdentifying: boolean;
  handleIdentify: () => void;
  onSetUser: (user: any) => void;
}

export default function IdentitySection({
  user,
  name,
  email,
  setName,
  setEmail,
  isIdentifying,
  handleIdentify,
  onSetUser
}: IdentitySectionProps) {
  return (
    <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />

      <h2 className="text-xl font-semibold mb-4 text-white/90">Your Identity</h2>
      <div className={`p-4 rounded-2xl bg-neutral-950/50 border ${user ? 'border-emerald-500/30' : 'border-neutral-800'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-indigo-500/20 p-2 rounded-xl">
            <Phone className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Store Executive</p>
            <p className="text-xs text-neutral-400">{user ? 'Identified successfully' : 'Enter details to start'}</p>
          </div>
        </div>

        {!user ? (
          <div className="space-y-3 mt-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={handleIdentify}
              disabled={isIdentifying || !name || !email}
              className="w-full flex justify-center items-center gap-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              {isIdentifying ? 'Identifying...' : 'Save & Continue'}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-neutral-900 p-3 rounded-xl border border-neutral-800 mt-2">
            <div>
              <p className="text-sm text-white font-medium">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.email}</p>
            </div>
            <button onClick={() => onSetUser(null)} className="text-xs text-indigo-400 hover:text-indigo-300">Change</button>
          </div>
        )}
      </div>
    </div>
  );
}

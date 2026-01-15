'use client';

import { LazorkitProvider } from '@lazorkit/wallet';
import { TipJar } from '@/components/TipJar';

// Lazorkit SDK configuration
const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymasterConfig: {
    paymasterUrl: 'https://lazorkit-paymaster.onrender.com',
  },
};

export default function Home() {
  return (
    <LazorkitProvider {...LAZORKIT_CONFIG}>
      <div className="min-h-screen relative">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-cream via-cream to-latte -z-10" />
        <div 
          className="fixed inset-0 -z-10 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L30 12 L25 15 Z' fill='%23D4A574' fill-opacity='0.1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Main content */}
        <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
          {/* Header */}
          <header className="text-center max-w-xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="gradient-text">Lazorkit</span> Tip Jar
            </h1>
            <p className="text-lg text-mocha/70">
              Accept crypto tips without wallet popups.
              <br />
              One tap → FaceID → Done. ⚡
            </p>
          </header>

          {/* Tip Jar Widget */}
          <TipJar />

          {/* Features */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl w-full">
            <div className="text-center p-4">
              <span className="text-3xl block mb-2">🔐</span>
              <h3 className="font-semibold text-espresso">No Seed Phrases</h3>
              <p className="text-sm text-mocha/60">Login with FaceID or TouchID</p>
            </div>
            <div className="text-center p-4">
              <span className="text-3xl block mb-2">⚡</span>
              <h3 className="font-semibold text-espresso">Gasless</h3>
              <p className="text-sm text-mocha/60">No SOL needed for fees</p>
            </div>
            <div className="text-center p-4">
              <span className="text-3xl block mb-2">🚀</span>
              <h3 className="font-semibold text-espresso">Instant</h3>
              <p className="text-sm text-mocha/60">One-tap transactions</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center p-6 text-sm text-mocha/60">
          <p>
            Built with{' '}
            <a href="https://lazorkit.com" target="_blank" rel="noopener noreferrer" className="text-copper hover:underline">
              Lazorkit SDK
            </a>
            {' '}• Running on Solana Devnet
          </p>
        </footer>
      </div>
    </LazorkitProvider>
  );
}


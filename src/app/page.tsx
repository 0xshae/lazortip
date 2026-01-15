'use client';

/**
 * Home Page
 * 
 * This is the main entry point for the Lazorkit Tip Jar application.
 * It sets up the LazorkitProvider context which enables passkey authentication
 * and gasless transactions throughout the app.
 * 
 * The page displays:
 * - A hero header explaining the app
 * - The TipJar widget for accepting tips
 * - Feature highlights showing key benefits
 */

import { LazorkitProvider } from '@lazorkit/wallet';
import { TipJar } from '@/components/TipJar';

// =============================================================================
// Lazorkit SDK Configuration
// =============================================================================

/**
 * Configuration for Lazorkit SDK.
 * 
 * @property rpcUrl - Solana RPC endpoint
 *   - Devnet: 'https://api.devnet.solana.com' (for testing)
 *   - Mainnet: 'https://api.mainnet-beta.solana.com' (for production)
 * 
 * @property portalUrl - Lazorkit authentication portal
 *   This is where users authenticate with their passkeys.
 *   The portal handles passkey creation, authentication, and wallet derivation.
 * 
 * @property paymasterConfig - Configuration for gasless transactions
 *   The paymaster service sponsors transaction fees so users don't pay gas.
 *   This is what makes "gasless" transactions possible!
 * 
 * ⚠️ NOTE: If the paymaster service is down, users will need to pay their own fees.
 * Contact Lazorkit team on Telegram (https://t.me/lazorkit) for updated URLs.
 */
const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  // Using Kora paymaster (the original lazorkit-paymaster.onrender.com was down)
  paymasterConfig: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
};

// =============================================================================
// Home Component
// =============================================================================

export default function Home() {
  return (
    /**
     * LazorkitProvider must wrap all components that use Lazorkit hooks.
     * It provides the wallet context including:
     * - connect/disconnect functions
     * - signAndSendTransaction for gasless transactions
     * - Wallet state (isConnected, smartWalletPubkey, etc.)
     */
    <LazorkitProvider {...LAZORKIT_CONFIG}>
      <div className="min-h-screen relative">
        {/* ================================================================
            Background Design
            Creates a warm, coffee-themed atmosphere with subtle patterns
            ================================================================ */}
        <div className="fixed inset-0 bg-gradient-to-br from-cream via-cream to-latte -z-10" />
        
        {/* Decorative SVG pattern overlay */}
        <div 
          className="fixed inset-0 -z-10 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L30 12 L25 15 Z' fill='%23D4A574' fill-opacity='0.1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* ================================================================
            Main Content
            ================================================================ */}
        <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
          
          {/* Hero Header */}
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

          {/* The Main Tip Jar Widget */}
          <TipJar />

          {/* Feature Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl w-full">
            {/* Feature 1: No Seed Phrases */}
            <div className="text-center p-4">
              <span className="text-3xl block mb-2">🔐</span>
              <h3 className="font-semibold text-espresso">No Seed Phrases</h3>
              <p className="text-sm text-mocha/60">Login with FaceID or TouchID</p>
            </div>
            
            {/* Feature 2: Gasless */}
            <div className="text-center p-4">
              <span className="text-3xl block mb-2">⚡</span>
              <h3 className="font-semibold text-espresso">Gasless</h3>
              <p className="text-sm text-mocha/60">No SOL needed for fees</p>
            </div>
            
            {/* Feature 3: Instant */}
            <div className="text-center p-4">
              <span className="text-3xl block mb-2">🚀</span>
              <h3 className="font-semibold text-espresso">Instant</h3>
              <p className="text-sm text-mocha/60">One-tap transactions</p>
            </div>
          </section>
        </main>

        {/* ================================================================
            Footer
            ================================================================ */}
        <footer className="text-center p-6 text-sm text-mocha/60">
          <p>
            Built with{' '}
            <a 
              href="https://lazorkit.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-copper hover:underline"
            >
              Lazorkit SDK
            </a>
            {' '}• Running on Solana Devnet
          </p>
        </footer>
      </div>
    </LazorkitProvider>
  );
}

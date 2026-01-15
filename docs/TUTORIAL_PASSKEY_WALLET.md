# Tutorial 1: Create a Passkey-Based Wallet with Lazorkit

Learn how to implement passwordless wallet authentication using Lazorkit SDK in Next.js. No more seed phrases or wallet extensions — just biometric authentication!

## 🎯 What You'll Learn

- Set up Lazorkit SDK in a Next.js project
- Configure webpack for Solana compatibility
- Implement passkey-based wallet creation
- Handle wallet connection states
- Display wallet information

## ⏱️ Time: 10 minutes

---

## Prerequisites

- Node.js 18+ installed
- Basic React/Next.js knowledge
- A device with biometric support (FaceID, TouchID, Windows Hello)

---

## Step 1: Create a New Next.js Project

```bash
npx create-next-app@latest my-lazorkit-app --typescript --tailwind --app
cd my-lazorkit-app
```

## Step 2: Install Dependencies

Install the Lazorkit SDK and required Solana libraries:

```bash
npm install @lazorkit/wallet @solana/web3.js zustand framer-motion
```

Also install the polyfills needed for Solana in browser environments:

```bash
npm install buffer crypto-browserify stream-browserify process globalthis
```

## Step 3: Configure Next.js for Solana

The Solana web3.js library was designed for Node.js, so we need to configure webpack to provide browser-compatible polyfills.

Update your `next.config.js`:

```javascript
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Provide browser-compatible fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,          // Not available in browser
        net: false,         // Not available in browser
        tls: false,         // Not available in browser
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };
      
      // Make Buffer and process available globally
      config.plugins.push(
        new webpack.ProvidePlugin({
          global: ['globalthis', 'globalThis'],
          Buffer: ['buffer', 'Buffer'],
          process: ['process', 'default'],
        })
      );
      
      // Define global for libraries expecting Node environment
      config.plugins.push(
        new webpack.DefinePlugin({
          'global': 'globalThis',
        })
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;
```

## Step 4: Add Global Polyfills

Some libraries check for `global` at runtime. Add this polyfill to your `layout.tsx`:

```tsx
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script id="polyfills" strategy="beforeInteractive">
          {`
            if (typeof globalThis !== 'undefined') {
              globalThis.global = globalThis;
            } else if (typeof window !== 'undefined') {
              window.global = window;
            }
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Step 5: Set Up the Lazorkit Provider

The `LazorkitProvider` component initializes the SDK and must wrap your application.

```tsx
// app/page.tsx
'use client';

import { LazorkitProvider } from '@lazorkit/wallet';

/**
 * Lazorkit SDK Configuration
 * 
 * rpcUrl: Solana RPC endpoint (devnet for testing, mainnet-beta for production)
 * portalUrl: Lazorkit authentication portal URL
 * paymasterConfig: Configuration for gasless transaction support
 */
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
      <main className="min-h-screen flex items-center justify-center">
        <WalletConnect />
      </main>
    </LazorkitProvider>
  );
}
```

## Step 6: Create the Wallet Connect Component

Now let's build the wallet connection component:

```tsx
// components/WalletConnect.tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';

export function WalletConnect() {
  const [error, setError] = useState<string | null>(null);
  
  /**
   * The useWallet hook provides:
   * - connect(): Opens passkey authentication portal
   * - disconnect(): Clears wallet session
   * - isConnected: Boolean connection status
   * - isLoading: True during async operations
   * - smartWalletPubkey: User's Solana wallet public key
   */
  const { 
    connect, 
    disconnect, 
    isConnected, 
    isLoading, 
    smartWalletPubkey 
  } = useWallet();

  /**
   * Handle wallet connection
   * 
   * The connect() function:
   * 1. Opens the Lazorkit portal in a popup
   * 2. User creates/authenticates with passkey (FaceID/TouchID)
   * 3. Returns wallet info on success
   * 
   * The feeMode: 'paymaster' option enables gasless transactions
   */
  const handleConnect = async () => {
    try {
      setError(null);
      await connect({ feeMode: 'paymaster' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  // Render connected state
  if (isConnected && smartWalletPubkey) {
    const address = smartWalletPubkey.toBase58();
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">Wallet Connected!</h2>
        
        <div className="bg-gray-100 p-3 rounded-lg mb-4">
          <p className="text-xs text-gray-500 uppercase">Your Wallet Address</p>
          <p className="font-mono text-sm break-all">{address}</p>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          This is your smart wallet (PDA) created via passkey.
          <br />
          No seed phrase needed!
        </p>
        
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Render connect button
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg text-center">
      <div className="text-4xl mb-4">🔐</div>
      <h2 className="text-xl font-bold mb-2">Welcome!</h2>
      <p className="text-gray-600 mb-4">
        Connect your wallet using FaceID, TouchID, or Windows Hello.
        <br />
        No extensions or seed phrases required!
      </p>
      
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Connecting...' : '🔐 Connect with Passkey'}
      </button>
    </div>
  );
}
```

## Step 7: Run Your App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click "Connect with Passkey".

---

## How Passkey Authentication Works

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. User clicks "Connect with Passkey"                      │
│                    ↓                                        │
│  2. Lazorkit portal opens in popup                          │
│                    ↓                                        │
│  3. User authenticates with biometrics                      │
│     (FaceID / TouchID / Windows Hello)                      │
│                    ↓                                        │
│  4. Passkey signs a challenge, proving identity             │
│                    ↓                                        │
│  5. Lazorkit creates/retrieves smart wallet (PDA)           │
│                    ↓                                        │
│  6. Wallet info returned to your app                        │
│                    ↓                                        │
│  7. User is now connected! 🎉                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### What is a Smart Wallet (PDA)?

Instead of a traditional Solana keypair, Lazorkit creates a **Program Derived Address (PDA)** for each user. This smart wallet:

- Is controlled by the user's passkey (biometrics)
- Doesn't require users to manage private keys
- Works across devices with passkey sync (iCloud, Google, etc.)
- Supports gasless transactions via paymaster

---

## Troubleshooting

### "global is not defined" Error

Make sure you've added the polyfill script in `layout.tsx` and configured `next.config.js` properly.

### Popup Blocked

The Lazorkit portal opens in a popup. Ensure your browser allows popups from localhost.

### Passkey Not Working

- Ensure your device supports WebAuthn (most modern devices do)
- Check if biometrics are set up on your device
- Try using Chrome or Safari for best compatibility

---

## Next Steps

Now that you can connect wallets, learn how to send gasless transactions:

→ **[Tutorial 2: Send a Gasless Transaction](./TUTORIAL_GASLESS_TRANSACTION.md)**

---

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com)
- [WebAuthn Specification](https://webauthn.io)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js)

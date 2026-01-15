# Tutorial 1: Create a Passkey-Based Wallet with Lazorkit

Learn how to implement passwordless wallet authentication using Lazorkit SDK in Next.js.

## 🎯 What You'll Learn

- Set up Lazorkit SDK in Next.js
- Implement passkey-based wallet creation
- Handle wallet connection states

## ⏱️ Time: 5 minutes

---

## Step 1: Install Dependencies

```bash
npm install @lazorkit/wallet @solana/web3.js zustand
```

## Step 2: Configure Next.js

Update `next.config.js` for Solana compatibility:

```javascript
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    };
    return config;
  },
};

module.exports = nextConfig;
```

## Step 3: Set Up Provider

```tsx
// app/page.tsx
'use client';

import { LazorkitProvider } from '@lazorkit/wallet';

export default function Home() {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      paymasterConfig={{
        paymasterUrl: "https://lazorkit-paymaster.onrender.com"
      }}
    >
      <YourApp />
    </LazorkitProvider>
  );
}
```

## Step 4: Create Wallet Component

```tsx
'use client';

import { useWallet } from '@lazorkit/wallet';

export function WalletConnect() {
  const { connect, disconnect, isConnected, smartWalletPubkey } = useWallet();

  const handleConnect = async () => {
    await connect({ feeMode: 'paymaster' });
  };

  if (isConnected && smartWalletPubkey) {
    return (
      <div>
        <p>Connected: {smartWalletPubkey.toBase58().slice(0, 8)}...</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect}>
      🔐 Connect with Passkey
    </button>
  );
}
```

## How It Works

1. User clicks "Connect with Passkey"
2. Lazorkit portal opens
3. FaceID/TouchID prompt appears
4. Smart wallet is created on Solana
5. App receives wallet info

---

## Next Steps

→ [Tutorial 2: Send a Gasless Transaction](./TUTORIAL_GASLESS_TRANSACTION.md)


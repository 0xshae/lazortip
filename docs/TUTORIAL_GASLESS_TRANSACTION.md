# Tutorial 2: Send a Gasless Transaction with Lazorkit

Learn how to send SOL transfers where users don't pay any gas fees. The Lazorkit paymaster covers all transaction costs!

## 🎯 What You'll Learn

- Understand how gasless transactions work
- Build Solana transfer instructions
- Send transactions using Lazorkit SDK
- Handle transaction states with proper UX feedback
- Verify transactions on Solana Explorer

## ⏱️ Time: 15 minutes

---

## Prerequisites

- Completed [Tutorial 1: Create a Passkey-Based Wallet](./TUTORIAL_PASSKEY_WALLET.md)
- A connected Lazorkit wallet
- Some devnet SOL in your wallet (for the transfer amount — fees are free!)

### Get Devnet SOL

```bash
# Install Solana CLI tools (if not installed)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Airdrop devnet SOL to your wallet
solana airdrop 1 YOUR_WALLET_ADDRESS --url devnet
```

Or use the [Solana Faucet](https://faucet.solana.com/) web interface.

---

## How Gasless Transactions Work

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. User initiates a transfer (e.g., send 0.01 SOL)         │
│                    ↓                                        │
│  2. App creates the transfer instruction                    │
│                    ↓                                        │
│  3. User confirms with biometrics (FaceID/TouchID)          │
│                    ↓                                        │
│  4. Lazorkit signs transaction with passkey                 │
│                    ↓                                        │
│  5. Paymaster adds fee payment instruction                  │
│                    ↓                                        │
│  6. Transaction submitted to Solana network                 │
│                    ↓                                        │
│  ✅ User's SOL transferred, fees paid by Paymaster!         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Point

The user only needs SOL for the **transfer amount**, not for fees. The paymaster service covers all transaction fees!

---

## Step 1: Create a Send Transaction Component

```tsx
// components/SendTransaction.tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Replace with your recipient address
const RECIPIENT_ADDRESS = 'YOUR_RECIPIENT_ADDRESS_HERE';

export function SendTransaction() {
  const [status, setStatus] = useState<'idle' | 'confirming' | 'sending' | 'success' | 'error'>('idle');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get wallet methods from Lazorkit
  const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();

  // Amount to send (in SOL)
  const amountSOL = 0.01;

  /**
   * Send a gasless SOL transfer
   */
  const handleSend = async () => {
    // Ensure wallet is connected
    if (!smartWalletPubkey) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      setStatus('confirming');

      // ----- Step 1: Create the transfer instruction -----
      const recipientPubkey = new PublicKey(RECIPIENT_ADDRESS);
      const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

      /**
       * SystemProgram.transfer creates a native SOL transfer instruction.
       * 
       * fromPubkey: Your smart wallet (the PDA controlled by your passkey)
       * toPubkey: The recipient's Solana address
       * lamports: Amount in lamports (1 SOL = 1,000,000,000 lamports)
       */
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: recipientPubkey,
        lamports,
      });

      setStatus('sending');

      // ----- Step 2: Sign and send the transaction -----
      /**
       * signAndSendTransaction handles:
       * 1. Creating a Solana transaction with recent blockhash
       * 2. Prompting user for biometric confirmation
       * 3. Signing with the user's passkey
       * 4. Adding paymaster fee payment
       * 5. Submitting to the Solana network
       * 
       * Returns the transaction signature on success.
       */
      const signature = await signAndSendTransaction({
        instructions: [transferInstruction],
        transactionOptions: {
          clusterSimulation: 'devnet', // Use 'mainnet-beta' for production
        },
      });

      setTxSignature(signature);
      setStatus('success');
      console.log('Transaction successful! Signature:', signature);

    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setStatus('error');
    }
  };

  // Reset to send another transaction
  const handleReset = () => {
    setStatus('idle');
    setTxSignature(null);
    setError(null);
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg text-center">
        <p className="text-gray-600">Please connect your wallet first.</p>
      </div>
    );
  }

  // Success state
  if (status === 'success' && txSignature) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-green-600 mb-2">Transaction Sent!</h2>
        <p className="text-gray-600 mb-4">Your {amountSOL} SOL transfer was successful.</p>
        
        <a
          href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline block mb-4"
        >
          View on Solana Explorer →
        </a>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Send Another
        </button>
      </div>
    );
  }

  // Main send form
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Send SOL (Gasless)</h2>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Amount:</span>
          <span className="font-bold">{amountSOL} SOL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Gas Fee:</span>
          <span className="font-bold text-green-600">FREE ⚡</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleSend}
        disabled={status === 'confirming' || status === 'sending'}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {status === 'confirming' && '🔐 Confirm with FaceID...'}
        {status === 'sending' && '⏳ Sending...'}
        {status === 'idle' && `Send ${amountSOL} SOL`}
        {status === 'error' && 'Try Again'}
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-3">
        Gas fees are covered by Lazorkit Paymaster
      </p>
    </div>
  );
}
```

## Step 2: Integrate into Your Page

```tsx
// app/page.tsx
'use client';

import { LazorkitProvider } from '@lazorkit/wallet';
import { WalletConnect } from '@/components/WalletConnect';
import { SendTransaction } from '@/components/SendTransaction';

const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymasterConfig: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
};

export default function Home() {
  return (
    <LazorkitProvider {...LAZORKIT_CONFIG}>
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-md mx-auto space-y-6">
          <WalletConnect />
          <SendTransaction />
        </div>
      </main>
    </LazorkitProvider>
  );
}
```

---

## Understanding the Transaction Flow

### 1. Create Instructions

```tsx
const instruction = SystemProgram.transfer({
  fromPubkey: smartWalletPubkey,  // Your smart wallet
  toPubkey: recipientPubkey,      // Destination
  lamports: 0.01 * LAMPORTS_PER_SOL,
});
```

This creates a standard Solana transfer instruction. You can create any Solana instruction — it doesn't have to be a simple transfer!

### 2. Sign and Send

```tsx
const signature = await signAndSendTransaction({
  instructions: [instruction],  // Can include multiple instructions!
  transactionOptions: {
    clusterSimulation: 'devnet',
  },
});
```

The `signAndSendTransaction` function:
- Bundles your instructions into a transaction
- Prompts for biometric confirmation
- Signs with the user's passkey
- Adds paymaster fee payment
- Submits to Solana

### 3. Verify on Explorer

```tsx
const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
```

Always provide a link to Solana Explorer so users can verify their transaction!

---

## Best Practices

### 1. Always Show Transaction Status

```tsx
const [status, setStatus] = useState<'idle' | 'confirming' | 'sending' | 'success' | 'error'>('idle');

// Update status at each step
setStatus('confirming');  // Waiting for biometric
setStatus('sending');     // Transaction in progress
setStatus('success');     // Transaction confirmed
```

### 2. Handle Errors Gracefully

```tsx
try {
  const signature = await signAndSendTransaction({...});
} catch (err) {
  // Common errors:
  // - User cancelled biometric prompt
  // - Insufficient balance
  // - Network error
  // - Paymaster rate limit
  setError(err.message);
}
```

### 3. Provide Explorer Links

Always give users a way to verify their transaction on-chain:

```tsx
<a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}>
  View on Explorer →
</a>
```

### 4. Convert SOL to Lamports Correctly

```tsx
// SOL has 9 decimal places
const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

// Alternatively, for more precision:
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
const lamports = Math.floor(amountSOL * 1_000_000_000);
```

---

## Advanced: Multiple Instructions

You can include multiple instructions in a single gasless transaction:

```tsx
import { SystemProgram } from '@solana/web3.js';

// Send to multiple recipients in one transaction
const instructions = [
  SystemProgram.transfer({
    fromPubkey: smartWalletPubkey,
    toPubkey: recipient1,
    lamports: 0.01 * LAMPORTS_PER_SOL,
  }),
  SystemProgram.transfer({
    fromPubkey: smartWalletPubkey,
    toPubkey: recipient2,
    lamports: 0.02 * LAMPORTS_PER_SOL,
  }),
];

const signature = await signAndSendTransaction({
  instructions,  // Array of instructions
  transactionOptions: {
    clusterSimulation: 'devnet',
  },
});
```

---

## Troubleshooting

### "Insufficient Balance"

The user needs SOL for the transfer amount (not for fees). Make sure they have enough SOL in their smart wallet.

### "Transaction Failed"

- Check if the recipient address is valid
- Verify you're on the correct network (devnet vs mainnet)
- Check the Solana Explorer for error details

### "Paymaster Error"

The paymaster service may have rate limits. If you hit limits during testing, wait a few minutes and try again.

---

## Summary

| What You Did | Why It Matters |
|--------------|----------------|
| Created transfer instruction | Standard Solana instruction building |
| Used `signAndSendTransaction` | Lazorkit handles signing + fees |
| Showed transaction status | Good UX for users |
| Linked to Explorer | Transaction verification |

---

## What's Next?

Now that you can send gasless transactions, try:

- Building a tip jar widget
- Creating a token transfer flow
- Implementing subscription payments

---

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com)
- [Solana Web3.js Reference](https://solana-labs.github.io/solana-web3.js)
- [Solana Explorer](https://explorer.solana.com)
- [Solana Devnet Faucet](https://faucet.solana.com)

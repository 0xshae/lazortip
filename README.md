# ☕ Lazorkit Tip Jar

> A gasless tip jar widget powered by Lazorkit SDK — Accept SOL tips with passkey authentication, no wallet popups!

![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-blueviolet)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Lazorkit](https://img.shields.io/badge/powered%20by-Lazorkit-orange)

## ✨ Features

- **🔐 No Seed Phrases** — Users authenticate with FaceID, TouchID, or Windows Hello
- **⚡ Gasless Transactions** — Tips are sent without users paying any gas fees
- **🎨 Beautiful UI** — Coffee-themed design with smooth animations
- **📦 Production Ready** — Built with Next.js 14 and TypeScript

## 🎬 Demo Flow

```
User taps "☕ Buy me a Coffee"
        ↓
FaceID/TouchID prompt appears
        ↓
✅ Transaction sent (gasless!)
```

No wallet extensions. No popups. No seed phrases. Just tap and tip.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/lazorkit-tip-jar.git
cd lazorkit-tip-jar

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Configuration

Update `src/components/TipJar.tsx` with your wallet address:

```typescript
// Replace with your Solana wallet address
const TIP_RECIPIENT = 'YOUR_WALLET_ADDRESS_HERE';
```

---

## 📖 How It Works

### Lazorkit SDK Integration

The app uses `@lazorkit/wallet` to provide:

1. **Passkey Authentication** — Users create/access wallets with biometrics
2. **Smart Wallets** — Each user gets a programmable Solana account (PDA)
3. **Gasless Transactions** — Paymaster sponsors transaction fees

### Key Components

```
src/
├── app/
│   ├── layout.tsx      # Root layout with fonts
│   ├── page.tsx        # Main page with LazorkitProvider
│   └── globals.css     # Global styles
├── components/
│   └── TipJar.tsx      # Main tip jar widget
```

---

## 🔧 SDK Usage

### 1. Wrap with Provider

```tsx
import { LazorkitProvider } from '@lazorkit/wallet';

<LazorkitProvider
  rpcUrl="https://api.devnet.solana.com"
  portalUrl="https://portal.lazor.sh"
  paymasterConfig={{
    paymasterUrl: "https://lazorkit-paymaster.onrender.com"
  }}
>
  <YourApp />
</LazorkitProvider>
```

### 2. Use the Wallet Hook

```tsx
import { useWallet } from '@lazorkit/wallet';

function Component() {
  const { 
    connect,              // Connect with passkey
    disconnect,           // Disconnect wallet
    signAndSendTransaction, // Send gasless tx
    isConnected,          // Connection status
    smartWalletPubkey,    // Wallet public key
  } = useWallet();
}
```

### 3. Send Gasless Transactions

```tsx
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const sendTip = async () => {
  const instruction = SystemProgram.transfer({
    fromPubkey: smartWalletPubkey,
    toPubkey: recipientPubkey,
    lamports: 0.01 * LAMPORTS_PER_SOL,
  });

  const signature = await signAndSendTransaction({
    instructions: [instruction],
    transactionOptions: {
      clusterSimulation: 'devnet',
    },
  });
};
```

---

## 📚 Tutorials

### Tutorial 1: Create a Passkey-Based Wallet
📄 [Read Tutorial →](./docs/TUTORIAL_PASSKEY_WALLET.md)

### Tutorial 2: Send a Gasless Transaction  
📄 [Read Tutorial →](./docs/TUTORIAL_GASLESS_TRANSACTION.md)

---

## 🚢 Deployment

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Environment Variables

No environment variables required for devnet.

---

## 🏗️ Project Structure

```
lazorkit-tip-jar/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       └── TipJar.tsx
├── docs/
│   ├── TUTORIAL_PASSKEY_WALLET.md
│   └── TUTORIAL_GASLESS_TRANSACTION.md
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Lazorkit](https://lazorkit.com) — Passkey wallet SDK
- [Solana](https://solana.com) — Blockchain infrastructure
- [Next.js](https://nextjs.org) — React framework

---

<p align="center">
  Made with ☕ and <a href="https://lazorkit.com">Lazorkit</a>
</p>


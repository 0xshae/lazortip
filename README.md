# ☕ Lazorkit Tip Jar

> A gasless tip jar widget powered by Lazorkit SDK — Accept SOL tips with passkey authentication, no wallet popups!

[![Live Demo](https://img.shields.io/badge/🔗_Live_Demo-lazortip.vercel.app-blue?style=for-the-badge)](https://lazortip.vercel.app/)

![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-blueviolet)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Lazorkit](https://img.shields.io/badge/powered%20by-Lazorkit-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

![Screenshot_16-1-2026_222142_lazortip vercel app](https://github.com/user-attachments/assets/5b45ebb9-f5f6-4c0c-9df0-45d22fd916b2)

## ✨ Features

- **🔐 No Seed Phrases** — Users authenticate with FaceID, TouchID, or Windows Hello
- **⚡ Gasless Transactions** — Tips are sent without users paying any gas fees
- **🎨 Beautiful UI** — Coffee-themed design with smooth animations
- **📦 Production Ready** — Built with Next.js 14 and TypeScript
- **📱 Mobile Friendly** — Works great on all devices

## 🎬 Demo Flow

```
User taps "☕ Buy me a Coffee"
        ↓
FaceID/TouchID prompt appears
        ↓
✅ Transaction sent (gasless!)
```

**No wallet extensions. No popups. No seed phrases. Just tap and tip.**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (recommended) or 18.17+
- npm or yarn
- A device with biometric support (FaceID, TouchID, or Windows Hello)

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

## 🎯 Live Demo

**[🔗 View Live Demo](https://lazortip.vercel.app/)**

*Running on Solana Devnet*

### Testing the Demo

1. Visit the demo URL
2. Click "☕ Buy me a Coffee"
3. Create a passkey (first time) or authenticate
4. Select a tip amount and confirm with biometrics
5. View your transaction on Solana Explorer!
---

## ⚠️ Known Issues

### Chrome Browser Compatibility

The app may encounter a **"Signing failed"** error on Google Chrome due to WebAuthn TLS certificate restrictions with the Lazorkit portal's iframe.

**Workaround:** Use **Microsoft Edge** or **Firefox** instead — both work correctly with Windows Hello and other passkey providers.

> This is a known limitation with how Chrome handles WebAuthn in cross-origin iframes with certain TLS configurations.

---

---

## 📖 How It Works

### The Lazorkit Advantage

Traditional crypto donations require users to:
1. Install a wallet extension (Phantom, Solflare, etc.)
2. Create an account and backup seed phrase
3. Fund with SOL for gas fees
4. Approve transactions in popups

**With Lazorkit:**
1. Tap a button
2. Use FaceID/TouchID
3. Done! ✅

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your App (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐   │
│   │   TipJar    │───▶│  Lazorkit    │───▶│  Paymaster  │   │
│   │  Component  │    │   Portal     │    │  (Gasless)  │   │
│   └─────────────┘    └──────────────┘    └─────────────┘   │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│   ┌─────────────────────────────────────────────────────┐  │
│   │               Solana Blockchain (Devnet)            │  │
│   │                                                     │  │
│   │   User's Smart Wallet (PDA) ──▶ Your Wallet        │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Passkey** | Cryptographic credential stored on device, accessed via biometrics |
| **Smart Wallet (PDA)** | Program-derived address controlled by the user's passkey |
| **Paymaster** | Service that pays transaction fees on behalf of users |
| **Gasless** | Transactions where users don't pay any network fees |

---

## 🔧 SDK Integration

### 1. Install Dependencies

```bash
npm install @lazorkit/wallet @solana/web3.js zustand framer-motion
npm install buffer crypto-browserify stream-browserify process globalthis
```

### 2. Configure Next.js

See `next.config.js` for required webpack configuration to handle Solana's Node.js dependencies in the browser.

### 3. Wrap with Provider

```tsx
import { LazorkitProvider } from '@lazorkit/wallet';

<LazorkitProvider
  rpcUrl="https://api.devnet.solana.com"
  portalUrl="https://portal.lazor.sh"
  paymasterConfig={{
    paymasterUrl: "https://kora.devnet.lazorkit.com"
  }}
>
  <YourApp />
</LazorkitProvider>
```

### 4. Use the Wallet Hook

```tsx
import { useWallet } from '@lazorkit/wallet';

function Component() {
  const { 
    connect,                  // Connect with passkey
    disconnect,               // Disconnect wallet
    signAndSendTransaction,   // Send gasless transaction
    isConnected,              // Connection status
    smartWalletPubkey,        // Wallet public key
  } = useWallet();
}
```

### 5. Send Gasless Transactions

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

## 📚 Step-by-Step Tutorials

### Tutorial 1: Create a Passkey-Based Wallet
📄 [Read Full Tutorial →](./docs/TUTORIAL_PASSKEY_WALLET.md)

Learn how to:
- Set up Lazorkit SDK in Next.js
- Configure webpack for Solana
- Implement passkey authentication
- Handle wallet states

### Tutorial 2: Send a Gasless Transaction  
📄 [Read Full Tutorial →](./docs/TUTORIAL_GASLESS_TRANSACTION.md)

Learn how to:
- Build Solana transfer instructions
- Send transactions without gas fees
- Handle transaction states
- Verify on Solana Explorer

---

## 🏗️ Project Structure

```
lazorkit-tip-jar/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with fonts & polyfills
│   │   ├── page.tsx         # Main page with LazorkitProvider
│   │   └── globals.css      # Custom CSS & animations
│   └── components/
│       └── TipJar.tsx       # Main tip jar widget (fully commented!)
├── docs/
│   ├── TUTORIAL_PASSKEY_WALLET.md
│   └── TUTORIAL_GASLESS_TRANSACTION.md
├── next.config.js           # Webpack config for Solana polyfills
├── tailwind.config.ts       # Custom coffee-themed colors
├── package.json
└── README.md
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `TipJar.tsx` | The main widget component with full SDK integration |
| `page.tsx` | Sets up `LazorkitProvider` with configuration |
| `next.config.js` | Critical webpack settings for Solana in browser |
| `globals.css` | Custom animations and coffee color palette |

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
npm run build
# Upload .next folder to Netlify
```

### Environment Variables

No environment variables required for devnet deployment.

For mainnet, update the RPC URL and paymaster configuration in `page.tsx`:

```tsx
const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  // ... rest of config
};
```

---

## 🎨 Customization

### Change Tip Amounts

Edit `src/components/TipJar.tsx`:

```tsx
const TIP_AMOUNTS = [
  { value: 0.01, label: 'Coffee', emoji: '☕' },
  { value: 0.05, label: 'Pizza', emoji: '🍕' },
  { value: 0.1, label: 'Party', emoji: '🎉' },
];
```

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  espresso: '#2C1810',   // Dark brown
  mocha: '#4A2C2A',      // Medium brown
  caramel: '#C17F59',    // Accent
  cream: '#FFF8F0',      // Background
  // ... add your own!
}
```

### Change Recipient

Edit `src/components/TipJar.tsx`:

```tsx
const TIP_RECIPIENT = 'YOUR_WALLET_ADDRESS_HERE';
```

---

## 🔒 Security Considerations

- **Passkeys** are stored securely on user devices, never on servers
- **Smart wallets** are program-derived addresses (PDAs) that can only be controlled by the passkey
- **Transactions** require biometric confirmation for every action
- The **paymaster** only covers fees, never has access to user funds

---
## 🧪 Testing

### Get Devnet SOL

To test the tip jar, you'll need devnet SOL in your smart wallet:

1. Connect with passkey (this creates your smart wallet)
2. Copy your wallet address from the UI
3. Get devnet SOL: [faucet.solana.com](https://faucet.solana.com)

### Verify Transactions

All transactions can be verified on [Solana Explorer](https://explorer.solana.com/?cluster=devnet).

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Lazorkit](https://lazorkit.com) — Passkey wallet SDK for Solana
- [Solana](https://solana.com) — High-performance blockchain
- [Next.js](https://nextjs.org) — React framework
- [Framer Motion](https://www.framer.com/motion/) — Animation library

---

## 📞 Support

- **Lazorkit Telegram**: [t.me/lazorkit](https://t.me/lazorkit)
- **Lazorkit Docs**: [docs.lazorkit.com](https://docs.lazorkit.com)
- **Lazorkit GitHub**: [github.com/lazor-kit/lazor-kit](https://github.com/lazor-kit/lazor-kit)

---

## 🏆 Hackathon Submission

This project was built for the **Lazorkit SDK Integration Bounty** (Dec 2024 - Jan 2025).

### Deliverables Checklist

| Requirement | Status |
|-------------|--------|
| ✅ Working Example Repo | Next.js 14 + TypeScript |
| ✅ Clean folder structure | `src/app`, `src/components`, `docs/` |
| ✅ Well-documented code | Extensive comments in all files |
| ✅ Quick-Start Guide | This README |
| ✅ Tutorial 1: Passkey Wallet | [docs/TUTORIAL_PASSKEY_WALLET.md](./docs/TUTORIAL_PASSKEY_WALLET.md) |
| ✅ Tutorial 2: Gasless Transaction | [docs/TUTORIAL_GASLESS_TRANSACTION.md](./docs/TUTORIAL_GASLESS_TRANSACTION.md) |
| ✅ Live Demo | [lazortip.vercel.app](https://lazortip.vercel.app/) |

### What Makes This Example Useful

- **Real-world use case**: Tip jar widget that anyone can embed
- **Complete integration**: Shows passkey auth + gasless transactions
- **Production-ready UI**: Beautiful coffee-themed design with animations
- **Copy-paste code**: Fully commented, easy to understand and adapt
- **Comprehensive tutorials**: Step-by-step guides for key features

---

<p align="center">
  Made with ☕ and <a href="https://lazorkit.com">Lazorkit</a>
</p>

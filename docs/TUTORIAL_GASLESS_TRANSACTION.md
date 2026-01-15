# Tutorial 2: Send a Gasless Transaction with Lazorkit

Learn how to send SOL transfers without users paying gas fees.

## 🎯 What You'll Learn

- Build transfer instructions
- Send gasless transactions via Lazorkit
- Handle transaction states

## ⏱️ Time: 10 minutes

---

## How Gasless Works

```
User initiates transfer
       ↓
App creates instruction
       ↓
Lazorkit adds passkey signature
       ↓
Paymaster adds fee payment
       ↓
✅ User's SOL transferred, fees paid by Paymaster
```

## Step 1: Create Transfer Function

```tsx
import { useWallet } from '@lazorkit/wallet';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

function TipButton() {
  const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();

  const sendTip = async (recipient: string, amountSol: number) => {
    if (!smartWalletPubkey) return;

    // Create transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey(recipient),
      lamports: amountSol * LAMPORTS_PER_SOL,
    });

    // Send gasless transaction
    const signature = await signAndSendTransaction({
      instructions: [instruction],
      transactionOptions: {
        clusterSimulation: 'devnet',
      },
    });

    console.log('Transaction sent:', signature);
    return signature;
  };

  return (
    <button 
      onClick={() => sendTip('RECIPIENT_ADDRESS', 0.01)}
      disabled={!isConnected}
    >
      Send 0.01 SOL
    </button>
  );
}
```

## Step 2: Handle Transaction States

```tsx
const [status, setStatus] = useState('idle');

const handleSend = async () => {
  try {
    setStatus('confirming');  // Show "Confirm with FaceID..."
    setStatus('sending');     // Show "Sending..."
    
    const sig = await signAndSendTransaction({...});
    
    setStatus('success');     // Show "Success!"
  } catch (err) {
    setStatus('error');
  }
};
```

## Step 3: Display Result

```tsx
{status === 'success' && (
  <a
    href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
    target="_blank"
  >
    View on Explorer →
  </a>
)}
```

---

## Key Points

- User only needs SOL for transfer amount, NOT for fees
- Paymaster covers all transaction fees
- Every transaction requires biometric confirmation

## Resources

- [Lazorkit Docs](https://docs.lazorkit.com)
- [Solana Explorer](https://explorer.solana.com)


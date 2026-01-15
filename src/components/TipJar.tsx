'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@lazorkit/wallet';
import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection
} from '@solana/web3.js';

// Configuration
const TIP_AMOUNTS = [
  { value: 0.01, label: 'Coffee', emoji: '☕' },
  { value: 0.05, label: 'Pizza', emoji: '🍕' },
  { value: 0.1, label: 'Party', emoji: '🎉' },
];

// Replace with your wallet address to receive tips
const TIP_RECIPIENT = 'hij78MKbJSSs15qvkHWTDCtnmba2c1W4r1V22g5sD8w';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

type Status = 'idle' | 'connecting' | 'confirming' | 'sending' | 'success' | 'error';

export function TipJar() {
  const { 
    connect, 
    disconnect, 
    signAndSendTransaction,
    isConnected, 
    isLoading, 
    smartWalletPubkey 
  } = useWallet();

  const [selectedAmount, setSelectedAmount] = useState(TIP_AMOUNTS[0].value);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const walletAddress = smartWalletPubkey?.toBase58();

  // Fetch balance when connected
  useEffect(() => {
    if (!smartWalletPubkey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const connection = new Connection(RPC_ENDPOINT, 'confirmed');
        const bal = await connection.getBalance(smartWalletPubkey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [smartWalletPubkey]);

  // Handle connect/tip
  const handleAction = useCallback(async () => {
    setError(null);

    try {
      // If not connected, connect first
      if (!isConnected) {
        setStatus('connecting');
        await connect({ feeMode: 'paymaster' });
        setStatus('idle');
        return;
      }

      // If connected, send tip
      if (!smartWalletPubkey) return;

      setStatus('confirming');

      const recipientPubkey = new PublicKey(TIP_RECIPIENT);
      const lamports = Math.floor(selectedAmount * LAMPORTS_PER_SOL);

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: recipientPubkey,
        lamports,
      });

      setStatus('sending');

      const signature = await signAndSendTransaction({
        instructions: [transferInstruction],
        transactionOptions: {
          clusterSimulation: 'devnet',
        },
      });

      setTxSignature(signature);
      setStatus('success');

    } catch (err) {
      console.error('Action failed:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }, [isConnected, connect, smartWalletPubkey, selectedAmount, signAndSendTransaction]);

  // Reset to send another tip
  const reset = () => {
    setStatus('idle');
    setError(null);
    setTxSignature(null);
  };

  // Button text based on state
  const getButtonText = () => {
    if (isLoading || status === 'connecting') return 'Connecting...';
    if (status === 'confirming') return 'Confirm with FaceID...';
    if (status === 'sending') return 'Sending tip...';
    if (!isConnected) return '☕ Buy me a Coffee';
    return `☕ Send ${selectedAmount} SOL`;
  };

  const isButtonDisabled = isLoading || ['connecting', 'confirming', 'sending'].includes(status);

  return (
    <div className="w-full max-w-md">
      <motion.div 
        className="bg-white rounded-2xl shadow-xl border border-caramel/20 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-caramel via-gold to-copper" />

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">☕</div>
            <h2 className="text-xl font-display font-semibold text-espresso">
              Buy me a Coffee
            </h2>
            <p className="text-sm text-mocha/60 mt-1">
              Support my work with a gasless tip ✨
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' && txSignature ? (
              /* Success State */
              <motion.div
                key="success"
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-espresso mb-2">Thank you!</h3>
                <p className="text-sm text-mocha/60 mb-4">Your tip was sent successfully</p>
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-copper hover:underline text-sm block mb-4"
                >
                  View on Explorer →
                </a>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-cream text-espresso rounded-lg border border-caramel/30 hover:bg-latte transition-colors"
                >
                  Send another tip
                </button>
              </motion.div>
            ) : (
              /* Form State */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Amount Selection */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {TIP_AMOUNTS.map((amount) => (
                    <motion.button
                      key={amount.value}
                      onClick={() => setSelectedAmount(amount.value)}
                      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                        selectedAmount === amount.value
                          ? 'bg-white border-2 border-caramel shadow-sm'
                          : 'bg-cream border-2 border-transparent hover:bg-latte'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{amount.emoji}</span>
                      <span className="text-sm font-semibold text-espresso mt-1">
                        {amount.value} SOL
                      </span>
                      <span className="text-xs text-mocha/60">{amount.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Wallet Info */}
                {isConnected && walletAddress && (
                  <motion.div
                    className="bg-cream rounded-xl p-3 mb-4 flex items-center justify-between flex-wrap gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div>
                      <div className="text-xs text-mocha/60 uppercase tracking-wide">Wallet</div>
                      <div className="text-sm font-mono text-espresso">
                        {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                      </div>
                    </div>
                    {balance !== null && (
                      <div className="text-right">
                        <div className="text-xs text-mocha/60 uppercase tracking-wide">Balance</div>
                        <div className="text-sm font-semibold text-espresso">
                          {balance.toFixed(4)} SOL
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => disconnect()}
                      className="text-xs text-mocha/60 hover:text-red-500 transition-colors"
                    >
                      Disconnect
                    </button>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Main Action Button */}
                <motion.button
                  onClick={handleAction}
                  disabled={isButtonDisabled}
                  className={`tip-button w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                    isButtonDisabled
                      ? 'bg-mocha/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-mocha to-espresso hover:shadow-lg'
                  }`}
                  whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
                  whileTap={!isButtonDisabled ? { scale: 0.99 } : {}}
                >
                  {isButtonDisabled && <span className="loading-spinner" />}
                  <span>{getButtonText()}</span>
                </motion.button>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-caramel/10">
                  <span className="text-xs text-mocha/50">
                    Powered by{' '}
                    <a href="https://lazorkit.com" target="_blank" rel="noopener noreferrer" className="text-copper hover:underline">
                      Lazorkit
                    </a>
                  </span>
                  <span className="text-xs bg-gradient-to-r from-teal-400 to-cyan-500 text-white px-2 py-0.5 rounded-full font-medium">
                    ⚡ Gasless
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}


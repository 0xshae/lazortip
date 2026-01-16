'use client';

/**
 * TipJar Component
 * 
 * A gasless tip jar widget that demonstrates Lazorkit SDK integration.
 * Users can send SOL tips without paying gas fees, using passkey authentication
 * (FaceID, TouchID, or Windows Hello) instead of traditional wallet extensions.
 * 
 * Key Features:
 * - Passkey-based wallet creation and authentication
 * - Gasless transactions via Lazorkit paymaster
 * - Real-time balance updates
 * - Smooth animations with Framer Motion
 * 
 * @see https://docs.lazorkit.com for SDK documentation
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@lazorkit/wallet';
import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection
} from '@solana/web3.js';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Fee mode for transactions:
 * - 'paymaster': Gasless transactions (paymaster pays fees) - RECOMMENDED
 * - 'user': User pays their own transaction fees (requires SOL in wallet)
 * 
 * Using Kora paymaster for gasless transactions!
 */
const FEE_MODE: 'paymaster' | 'user' = 'paymaster';

/**
 * Predefined tip amounts with friendly labels.
 * Customize these values for your use case.
 */
const TIP_AMOUNTS = [
  { value: 0.01, label: 'Coffee', emoji: '☕' },
  { value: 0.05, label: 'Pizza', emoji: '🍕' },
  { value: 0.1, label: 'Party', emoji: '🎉' },
];

/**
 * IMPORTANT: Replace this with your own Solana wallet address!
 * This is the wallet that will receive the tips.
 */
const TIP_RECIPIENT = 'hij78MKbJSSs15qvkHWTDCtnmba2c1W4r1V22g5sD8w';

/**
 * Solana RPC endpoint for balance queries.
 * Using devnet for development; switch to mainnet-beta for production.
 */
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

// ============================================================================
// Types
// ============================================================================

/**
 * Transaction status states for UI feedback.
 * - idle: Ready for user action
 * - connecting: Creating/accessing passkey wallet
 * - confirming: Waiting for biometric confirmation
 * - sending: Transaction in progress
 * - success: Transaction completed successfully
 * - error: Something went wrong
 */
type Status = 'idle' | 'connecting' | 'confirming' | 'sending' | 'success' | 'error';

// ============================================================================
// Component
// ============================================================================

export function TipJar() {
  // ---------------------------------------------------------------------------
  // Lazorkit Wallet Hook
  // ---------------------------------------------------------------------------
  
  /**
   * The useWallet hook provides all wallet functionality:
   * - connect: Opens passkey authentication portal
   * - disconnect: Clears wallet session
   * - signAndSendTransaction: Signs and submits transactions (gasless!)
   * - isConnected: Boolean indicating wallet connection status
   * - isLoading: Boolean for loading states during async operations
   * - smartWalletPubkey: The user's Solana wallet public key (PDA)
   */
  const { 
    connect, 
    disconnect, 
    signAndSendTransaction,
    isConnected, 
    isLoading, 
    smartWalletPubkey 
  } = useWallet();

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------

  const [selectedAmount, setSelectedAmount] = useState(TIP_AMOUNTS[0].value);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Derive wallet address string for display
  const walletAddress = smartWalletPubkey?.toBase58();

  // ---------------------------------------------------------------------------
  // Balance Fetching
  // ---------------------------------------------------------------------------

  /**
   * Fetch and update wallet balance when connected.
   * Uses an interval to periodically refresh the balance.
   */
  useEffect(() => {
    // Clear balance when disconnected
    if (!smartWalletPubkey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        // Create connection to Solana network
        const connection = new Connection(RPC_ENDPOINT, 'confirmed');
        
        // Query balance in lamports and convert to SOL
        const bal = await connection.getBalance(smartWalletPubkey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    };

    // Fetch immediately and then every 10 seconds
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    
    // Cleanup interval on unmount or wallet change
    return () => clearInterval(interval);
  }, [smartWalletPubkey]);

  // ---------------------------------------------------------------------------
  // Main Action Handler
  // ---------------------------------------------------------------------------

  /**
   * Handles the main button action:
   * - If not connected: Initiates passkey wallet connection
   * - If connected: Sends a gasless tip transaction
   */
  const handleAction = useCallback(async () => {
    // Reset any previous errors
    setError(null);

    try {
      // ----- STEP 1: Connect if not already connected -----
      if (!isConnected) {
        setStatus('connecting');
        
        /**
         * connect() opens the Lazorkit portal where users:
         * 1. Create a new passkey (first time) or
         * 2. Authenticate with existing passkey
         * 
         * The feeMode option controls who pays transaction fees:
         * - 'paymaster': Gasless (paymaster service pays fees)
         * - 'user': User pays fees (requires SOL in wallet)
         */
        console.log('Connecting with feeMode:', FEE_MODE);
        await connect({ feeMode: FEE_MODE });
        console.log('Connection successful!');
        
        setStatus('idle');
        return;
      }

      // ----- STEP 2: Build and send the tip transaction -----
      if (!smartWalletPubkey) return;

      setStatus('confirming');

      // Parse recipient address
      const recipientPubkey = new PublicKey(TIP_RECIPIENT);
      
      // Convert SOL to lamports (1 SOL = 1 billion lamports)
      const lamports = Math.floor(selectedAmount * LAMPORTS_PER_SOL);

      /**
       * Create a native SOL transfer instruction.
       * This is a standard Solana instruction - Lazorkit handles the
       * signing and fee payment behind the scenes.
       */
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,  // User's smart wallet (PDA)
        toPubkey: recipientPubkey,       // Tip recipient
        lamports,                         // Amount in lamports
      });

      setStatus('sending');

      /**
       * signAndSendTransaction() does the following:
       * 1. Prompts user for biometric confirmation (FaceID/TouchID)
       * 2. Signs the transaction with the user's passkey
       * 3. Paymaster adds fee payment instruction
       * 4. Submits transaction to Solana network
       * 
       * Returns the transaction signature on success.
       */
      console.log('Starting signAndSendTransaction...');
      console.log('Transfer details:', {
        from: smartWalletPubkey.toBase58(),
        to: recipientPubkey.toBase58(),
        lamports,
        solAmount: selectedAmount
      });
      
      let signature: string;
      try {
        signature = await signAndSendTransaction({
          instructions: [transferInstruction],
          transactionOptions: {
            clusterSimulation: 'devnet',  // Use devnet for testing
          },
        });
        console.log('Transaction successful! Signature:', signature);
      } catch (signError) {
        console.error('SignAndSendTransaction error details:', signError);
        console.error('Error type:', signError?.constructor?.name);
        console.error('Error stack:', signError instanceof Error ? signError.stack : 'N/A');
        throw signError;
      }

      // Save signature for explorer link
      setTxSignature(signature);
      setStatus('success');

    } catch (err) {
      console.error('Action failed:', err);
      // Show more detailed error for debugging
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Full error:', errorMessage);
      setError(errorMessage || 'Something went wrong. Check browser console for details.');
      setStatus('error');
    }
  }, [isConnected, connect, smartWalletPubkey, selectedAmount, signAndSendTransaction]);

  // ---------------------------------------------------------------------------
  // Reset Handler
  // ---------------------------------------------------------------------------

  /**
   * Reset state to allow sending another tip.
   */
  const reset = () => {
    setStatus('idle');
    setError(null);
    setTxSignature(null);
  };

  // ---------------------------------------------------------------------------
  // Dynamic Button Text
  // ---------------------------------------------------------------------------

  /**
   * Returns appropriate button text based on current state.
   */
  const getButtonText = () => {
    if (isLoading || status === 'connecting') return 'Connecting...';
    if (status === 'confirming') return 'Confirm with FaceID...';
    if (status === 'sending') return 'Sending tip...';
    if (!isConnected) return '☕ Buy me a Coffee';
    return `☕ Send ${selectedAmount} SOL`;
  };

  // Disable button during async operations
  const isButtonDisabled = isLoading || ['connecting', 'confirming', 'sending'].includes(status);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-md">
      <motion.div 
        className="bg-white rounded-2xl shadow-xl border border-caramel/20 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative top accent bar */}
        <div className="h-1 bg-gradient-to-r from-caramel via-gold to-copper" />

        <div className="p-6">
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">☕</div>
            <h2 className="text-xl font-display font-semibold text-espresso">
              Buy me a Coffee
            </h2>
            <p className="text-sm text-mocha/60 mt-1">
              Support my work with a tip ✨
            </p>
          </div>

          {/* Debug Info - Collapsible */}
          <div className="mb-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="w-full flex items-center justify-between text-xs text-mocha/40 hover:text-mocha/60 transition-colors py-1"
            >
              <span>🔧 Debug Info</span>
              <span>{showDebug ? '▲' : '▼'}</span>
            </button>
            {showDebug && (
              <motion.div 
                className="bg-gray-100 rounded-lg p-2 mt-1 text-xs font-mono"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div>Status: <span className="text-blue-600">{status}</span></div>
                <div>Connected: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{String(isConnected)}</span></div>
                <div>Loading: <span className="text-orange-600">{String(isLoading)}</span></div>
                <div>Wallet: <span className="text-purple-600">{walletAddress ? walletAddress.slice(0, 8) + '...' : 'null'}</span></div>
                <div>Fee Mode: <span className="text-teal-600">{FEE_MODE}</span></div>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' && txSignature ? (
              /* ============ Success State ============ */
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
                
                {/* Link to Solana Explorer to verify transaction */}
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
              /* ============ Form State ============ */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Tip Amount Selection Grid */}
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

                {/* Connected Wallet Info */}
                {isConnected && walletAddress && (
                  <motion.div
                    className="bg-cream rounded-xl p-3 mb-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    {/* Wallet Address with Copy Button */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-mocha/60 uppercase tracking-wide">Your Smart Wallet</div>
                      <button
                        onClick={() => disconnect()}
                        className="text-xs text-mocha/60 hover:text-red-500 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                    
                    {/* Full Address Display with Copy */}
                    <div 
                      className="bg-white rounded-lg p-2 mb-2 flex items-center gap-2 cursor-pointer hover:bg-latte/50 transition-colors border border-caramel/20"
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      title="Click to copy full address"
                    >
                      <div className="text-xs font-mono text-espresso flex-1 break-all">
                        {walletAddress}
                      </div>
                      <span className="text-xs text-copper whitespace-nowrap">
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </span>
                    </div>
                    
                    {/* Balance and Faucet Link */}
                    <div className="flex items-center justify-between">
                      {balance !== null && (
                        <div>
                          <span className="text-xs text-mocha/60">Balance: </span>
                          <span className="text-sm font-semibold text-espresso">
                            {balance.toFixed(4)} SOL
                          </span>
                        </div>
                      )}
                      {balance !== null && balance < 0.01 && (
                        <a
                          href="https://faucet.solana.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-copper hover:underline"
                        >
                          Get devnet SOL →
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Error Message Display */}
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

                {/* Footer with Branding */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-caramel/10">
                  <span className="text-xs text-mocha/50">
                    Powered by{' '}
                    <a href="https://lazorkit.com" target="_blank" rel="noopener noreferrer" className="text-copper hover:underline">
                      Lazorkit
                    </a>
                  </span>
                  {FEE_MODE === 'paymaster' ? (
                    <span className="text-xs bg-gradient-to-r from-teal-400 to-cyan-500 text-white px-2 py-0.5 rounded-full font-medium">
                      ⚡ Gasless
                    </span>
                  ) : (
                    <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                      💰 User Pays Fees
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

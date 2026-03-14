import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { PegasusAnimation } from '@/components/PegasusAnimation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, HelpCircle } from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';

const GlassCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_30px_rgba(124,58,237,0.1)] p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const Refund = () => {
  const [service, setService] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [wallet, setWallet] = useState('');
  const [showFaqModal, setShowFaqModal] = useState(false);

  const handleSubmit = () => {
    if (!service || !reason || !amount || !txId || !wallet) {
      toast.error('Please fill in all fields.');
      return;
    }
    toast.success('Refund request submitted successfully. Our team will review your request.');
    setService('');
    setReason('');
    setAmount('');
    setTxId('');
    setWallet('');
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-primary/30">
      <PegasusAnimation />
      <Navigation />

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-16">
        {/* Two-column layout: Logo left, Form right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT SIDE - Logo and description */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex justify-center lg:justify-start mb-8">
                <AnimatedLogo className="w-48 h-48 md:w-64 md:h-64" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
                Request a Refund
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                If you are not satisfied with a service you purchased, you can submit a refund request. Our team will review your request and respond shortly.
              </p>
            </motion.div>
          </div>

          {/* RIGHT SIDE - Form */}
          <div>
            <GlassCard delay={0.3}>
              <h2 className="text-xl font-semibold text-foreground mb-6">Refund Request Form</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Service Purchased</label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volume-boost">Volume Boost Package</SelectItem>
                      <SelectItem value="marketing">Marketing Campaign</SelectItem>
                      <SelectItem value="promotion">Token Promotion</SelectItem>
                      <SelectItem value="trading-volume">Trading Volume Boost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Reason for Refund</label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe why you are requesting a refund..."
                    className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Refund Amount</label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 100 USDT"
                    className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Transaction ID or Order ID</label>
                  <Input
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="Enter your transaction or order ID"
                    className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Wallet Address for Refund</label>
                  <Input
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSubmit}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Request Refund
                  </Button>
                </motion.div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* BOTTOM - FAQ & Support */}
        <GlassCard className="mt-10" delay={0.5}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-6 h-6 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">FAQ & Support</h3>
                <p className="text-sm text-muted-foreground">
                  If you have questions about your refund request, please contact support or review our refund policy.
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => setShowFaqModal(true)}
                className="border-primary/30 text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all duration-300"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </motion.div>
          </div>
        </GlassCard>

        {/* Support Modal */}
        {showFaqModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowFaqModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(124,58,237,0.15)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-foreground mb-3">Contact Support</h3>
              <p className="text-sm text-muted-foreground mb-6">
                For refund inquiries, reach out to our support team. We typically respond within 24 hours.
              </p>
              <div className="space-y-3 mb-6">
                <p className="text-sm text-foreground">📧 support@pegasusswap.com</p>
                <p className="text-sm text-foreground">💬 Telegram: @PegasusSupport</p>
              </div>
              <Button
                onClick={() => setShowFaqModal(false)}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Refund;

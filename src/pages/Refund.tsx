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

const REFUND_HISTORY = [
  { service: 'Volume Boost Package', amount: '100 USDT', reason: 'Boosted volume did not meet expectations', status: 'Processing' as const },
  { service: 'Social Media Promotion', amount: '75 USDT', reason: 'Promotion did not deliver expected engagement', status: 'Processing' as const },
  { service: 'Ad Campaign Boost', amount: '250 USDT', reason: 'Ad campaign did not reach target audience', status: 'Refunded' as const },
];

type RefundStatus = 'Processing' | 'Approved' | 'Rejected' | 'Refunded';

const statusColors: Record<RefundStatus, string> = {
  Processing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  Refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

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
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0B0F1A' }}>
      <PegasusAnimation />
      <Navigation />

      {/* Nebula / star effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full bg-blue-600/8 blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-16">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] to-[#00E5FF] mb-4">
                Request a Refund
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                If you are not satisfied with a service you purchased, you can submit a refund request. Our team will review your request and respond shortly.
              </p>
            </motion.div>

            {/* Refund History */}
            <GlassCard delay={0.2}>
              <h2 className="text-xl font-semibold text-foreground mb-4">My Refund Requests</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground">
                      <th className="text-left py-3 pr-4 font-medium">Service</th>
                      <th className="text-left py-3 pr-4 font-medium">Amount</th>
                      <th className="text-left py-3 pr-4 font-medium hidden md:table-cell">Reason</th>
                      <th className="text-left py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REFUND_HISTORY.map((item, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 pr-4 text-foreground">{item.service}</td>
                        <td className="py-3 pr-4 text-foreground font-mono">{item.amount}</td>
                        <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell text-xs">{item.reason}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT SIDE - Form */}
          <div>
            <GlassCard delay={0.3}>
              <h2 className="text-xl font-semibold text-foreground mb-6">Refund Request Form</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Service Purchased</label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-[#7C3AED]/50 focus:ring-[#7C3AED]/20">
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
                    className="bg-white/5 border-white/10 focus:border-[#7C3AED]/50 focus:ring-[#7C3AED]/20 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Refund Amount</label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 100 USDT"
                    className="bg-white/5 border-white/10 focus:border-[#7C3AED]/50 focus:ring-[#7C3AED]/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Transaction ID or Order ID</label>
                  <Input
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="Enter your transaction or order ID"
                    className="bg-white/5 border-white/10 focus:border-[#7C3AED]/50 focus:ring-[#7C3AED]/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Wallet Address for Refund</label>
                  <Input
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="bg-white/5 border-white/10 focus:border-[#7C3AED]/50 focus:ring-[#7C3AED]/20"
                  />
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSubmit}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#7C3AED] to-[#00E5FF] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300"
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
              <HelpCircle className="w-6 h-6 text-[#7C3AED] mt-0.5 shrink-0" />
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
                className="border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/10 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all duration-300"
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
              className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(124,58,237,0.15)]"
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
                className="w-full bg-gradient-to-r from-[#7C3AED] to-[#00E5FF]"
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

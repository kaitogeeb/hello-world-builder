import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { PegasusAnimation } from '@/components/PegasusAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpDown, Clock, Send, FileText, Wallet, ExternalLink, Search, Loader2, AlertCircle, Check } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { fetchTokenInfo, DexScreenerTokenInfo } from '@/services/dexScreener';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { Link } from 'react-router-dom';

interface OTCOrder {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenLogo?: string;
  side: 'buy' | 'sell';
  price: string;
  amount: string;
  totalValue: string;
  traderWallet: string;
  timePosted: Date;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  minFillAmount?: string;
  expiration?: string;
  message?: string;
}

interface RecentTrade {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  amount: string;
  price: string;
  buyerWallet: string;
  sellerWallet: string;
  timestamp: Date;
}

// Mock data for demo
const MOCK_ORDERS: OTCOrder[] = [
  {
    id: '1', tokenAddress: 'So11111111111111111111111111111111111111112', tokenName: 'Solana', tokenSymbol: 'SOL',
    tokenLogo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    side: 'sell', price: '93.50', amount: '5,000', totalValue: '$467,500', traderWallet: '7xKX...3mPq', timePosted: new Date(Date.now() - 1200000), status: 'active'
  },
  {
    id: '2', tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', tokenName: 'USD Coin', tokenSymbol: 'USDC',
    side: 'buy', price: '1.00', amount: '250,000', totalValue: '$250,000', traderWallet: '4E9G...wdHj', timePosted: new Date(Date.now() - 3600000), status: 'active'
  },
  {
    id: '3', tokenAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', tokenName: 'Jupiter', tokenSymbol: 'JUP',
    side: 'sell', price: '0.85', amount: '100,000', totalValue: '$85,000', traderWallet: '9yWF...NNpm', timePosted: new Date(Date.now() - 7200000), status: 'active'
  },
];

const MOCK_TRADES: RecentTrade[] = [
  { id: '1', tokenName: 'Solana', tokenSymbol: 'SOL', amount: '2,500', price: '$93.20', buyerWallet: '3THb...d82i', sellerWallet: '7xKX...3mPq', timestamp: new Date(Date.now() - 600000) },
  { id: '2', tokenName: 'Raydium', tokenSymbol: 'RAY', amount: '50,000', price: '$2.15', buyerWallet: 'Eoxf...aHcP', sellerWallet: '4E9G...wdHj', timestamp: new Date(Date.now() - 1800000) },
];

const OTC = () => {
  const { connected, publicKey } = useWallet();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [showTradeConfirm, setShowTradeConfirm] = useState<OTCOrder | null>(null);

  // Post Order Form
  const [postContractAddress, setPostContractAddress] = useState('');
  const [postTokenInfo, setPostTokenInfo] = useState<DexScreenerTokenInfo | null>(null);
  const [postSide, setPostSide] = useState<'buy' | 'sell'>('buy');
  const [postPrice, setPostPrice] = useState('');
  const [postAmount, setPostAmount] = useState('');
  const [postMinFill, setPostMinFill] = useState('');
  const [postExpiration, setPostExpiration] = useState('24h');
  const [postMessage, setPostMessage] = useState('');
  const [isFetchingToken, setIsFetchingToken] = useState(false);

  // Listing Form
  const [listingName, setListingName] = useState('');
  const [listingSymbol, setListingSymbol] = useState('');
  const [listingContract, setListingContract] = useState('');
  const [listingWebsite, setListingWebsite] = useState('');
  const [listingTelegram, setListingTelegram] = useState('');
  const [listingLiquidity, setListingLiquidity] = useState('');
  const [listingTokenInfo, setListingTokenInfo] = useState<DexScreenerTokenInfo | null>(null);

  // Orders and trades  
  const [orders] = useState<OTCOrder[]>(MOCK_ORDERS);
  const [trades] = useState<RecentTrade[]>(MOCK_TRADES);
  const [userOrders] = useState<OTCOrder[]>([]);
  const [orderSort, setOrderSort] = useState<'time' | 'value'>('time');

  const fetchTokenDetails = async (address: string, setInfo: (info: DexScreenerTokenInfo | null) => void) => {
    if (!address.trim()) return;
    setIsFetchingToken(true);
    try {
      const info = await fetchTokenInfo(address);
      setInfo(info);
    } catch {
      toast.error('Failed to fetch token details');
    } finally {
      setIsFetchingToken(false);
    }
  };

  const handlePostOrder = () => {
    if (!connected) { toast.error('Please connect your wallet first'); return; }
    if (!postTokenInfo || !postPrice || !postAmount) { toast.error('Please fill all required fields'); return; }
    toast.success('OTC order successfully posted.');
    setShowPostModal(false);
    resetPostForm();
  };

  const handleTakeOrder = (order: OTCOrder) => {
    if (!connected) { toast.error('Please connect your wallet first'); return; }
    setShowTradeConfirm(order);
  };

  const handleConfirmTrade = () => {
    toast.success('Trade executed successfully!');
    setShowTradeConfirm(null);
  };

  const handleListingSubmit = () => {
    if (!listingContract || !listingName) { toast.error('Please fill required fields'); return; }
    toast.success('Token listing request submitted for review.');
    setShowListingModal(false);
    setListingName(''); setListingSymbol(''); setListingContract(''); setListingWebsite(''); setListingTelegram(''); setListingLiquidity(''); setListingTokenInfo(null);
  };

  const resetPostForm = () => {
    setPostContractAddress(''); setPostTokenInfo(null); setPostSide('buy'); setPostPrice(''); setPostAmount(''); setPostMinFill(''); setPostExpiration('24h'); setPostMessage('');
  };

  const timeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto glass-card rounded-2xl border border-white/10 p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{title}</h3>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const TokenPreview = ({ info }: { info: DexScreenerTokenInfo }) => (
    <Card className="glass-card border-white/10 mb-4">
      <CardContent className="p-4 flex items-center gap-3">
        {info.baseToken.logoURI && <img src={info.baseToken.logoURI} alt="" className="w-10 h-10 rounded-full" />}
        <div className="flex-1">
          <div className="font-bold">{info.baseToken.name} <span className="text-muted-foreground text-sm">({info.baseToken.symbol})</span></div>
          <div className="text-sm text-muted-foreground">Price: ${info.priceUsd} · Liq: ${Number(info.liquidity?.usd || 0).toLocaleString()} · Vol: ${Number(info.volume?.h24 || 0).toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-transparent text-foreground overflow-hidden relative">
      <PegasusAnimation />
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">OTC Trading Desk</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-xl">
              Trade large Solana token positions directly with other traders without impacting public market prices.
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => connected ? setShowPostModal(true) : toast.error('Connect your wallet first')}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50 transition-all">
                <Send className="w-4 h-4 mr-2" /> Post OTC Order
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={() => connected ? setShowQuoteModal(true) : toast.error('Connect your wallet first')}
                className="border-white/10 hover:bg-white/5">
                <FileText className="w-4 h-4 mr-2" /> Request Quote
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Section 2: Live OTC Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-white/10 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Live OTC Orders</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setOrderSort(s => s === 'time' ? 'value' : 'time')} className="text-muted-foreground">
                  <ArrowUpDown className="w-4 h-4 mr-1" /> Sort by {orderSort === 'time' ? 'Value' : 'Time'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground">
                      <th className="text-left p-3">Token</th>
                      <th className="text-left p-3">Side</th>
                      <th className="text-right p-3">Price</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-right p-3">Total Value</th>
                      <th className="text-left p-3">Trader</th>
                      <th className="text-left p-3">Posted</th>
                      <th className="text-right p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status === 'active').map(order => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {order.tokenLogo && <img src={order.tokenLogo} alt="" className="w-6 h-6 rounded-full" />}
                            <div>
                              <div className="font-medium">{order.tokenName}</div>
                              <div className="text-xs text-muted-foreground">{order.tokenSymbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={order.side === 'buy' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                            {order.side.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono">${order.price}</td>
                        <td className="p-3 text-right font-mono">{order.amount}</td>
                        <td className="p-3 text-right font-mono">{order.totalValue}</td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{order.traderWallet}</td>
                        <td className="p-3 text-muted-foreground text-xs">{timeAgo(order.timePosted)}</td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/20 text-xs" onClick={() => handleTakeOrder(order)}>
                            Take Order
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 3: Recent Trades & Section 4: Token Listing */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card border-white/10 h-full">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Clock className="w-5 h-5" /> Recent OTC Trades</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trades.map((trade, i) => (
                    <motion.div key={trade.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <div className="font-medium">{trade.tokenName} <span className="text-muted-foreground text-sm">({trade.tokenSymbol})</span></div>
                        <div className="text-xs text-muted-foreground">{trade.amount} @ {trade.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground font-mono">{trade.buyerWallet} ↔ {trade.sellerWallet}</div>
                        <div className="text-xs text-muted-foreground">{timeAgo(trade.timestamp)}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass-card border-white/10 h-full">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><FileText className="w-5 h-5" /> List Your Token for OTC</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">Submit your Solana token to be available in the OTC marketplace.</p>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600" onClick={() => setShowListingModal(true)}>
                  Submit Token Listing
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Section 5: User Orders */}
        {connected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass-card border-white/10">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Wallet className="w-5 h-5" /> My OTC Orders</CardTitle></CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders yet. Post your first OTC order to get started.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-muted-foreground">
                        <th className="text-left p-3">Token</th>
                        <th className="text-left p-3">Side</th>
                        <th className="text-right p-3">Price</th>
                        <th className="text-right p-3">Amount</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-right p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map(order => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-3 font-medium">{order.tokenSymbol}</td>
                          <td className="p-3"><Badge>{order.side.toUpperCase()}</Badge></td>
                          <td className="p-3 text-right font-mono">${order.price}</td>
                          <td className="p-3 text-right font-mono">{order.amount}</td>
                          <td className="p-3"><Badge variant="outline">{order.status}</Badge></td>
                          <td className="p-3 text-right">
                            <Button size="sm" variant="ghost" className="text-red-400 text-xs">Cancel</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-12 text-center text-xs text-muted-foreground">
          <p>Built with ⚡ on Solana</p>
          <Link to="/why-pegasus" className="text-primary hover:underline mt-1 inline-block">Why Pegasus?</Link>
        </motion.footer>
      </main>

      {/* Post OTC Order Modal */}
      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post OTC Order">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Token Contract Address</label>
            <div className="flex gap-2">
              <Input value={postContractAddress} onChange={e => setPostContractAddress(e.target.value)} placeholder="Enter Solana token address" className="bg-white/5 border-white/10" />
              <Button size="sm" onClick={() => fetchTokenDetails(postContractAddress, setPostTokenInfo)} disabled={isFetchingToken}>
                {isFetchingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          {postTokenInfo && <TokenPreview info={postTokenInfo} />}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Side</label>
            <div className="flex gap-2">
              <Button variant={postSide === 'buy' ? 'default' : 'outline'} className={postSide === 'buy' ? 'bg-green-600 flex-1' : 'flex-1 border-white/10'} onClick={() => setPostSide('buy')}>Buy</Button>
              <Button variant={postSide === 'sell' ? 'default' : 'outline'} className={postSide === 'sell' ? 'bg-red-600 flex-1' : 'flex-1 border-white/10'} onClick={() => setPostSide('sell')}>Sell</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Price per Token ($)</label>
              <Input type="number" value={postPrice} onChange={e => setPostPrice(e.target.value)} placeholder="0.00" className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Token Amount</label>
              <Input type="number" value={postAmount} onChange={e => setPostAmount(e.target.value)} placeholder="0" className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Min Fill Amount</label>
              <Input type="number" value={postMinFill} onChange={e => setPostMinFill(e.target.value)} placeholder="Optional" className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Expiration</label>
              <select value={postExpiration} onChange={e => setPostExpiration(e.target.value)} className="w-full h-10 rounded-md bg-white/5 border border-white/10 px-3 text-sm">
                <option value="1h">1 Hour</option>
                <option value="6h">6 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Message (Optional)</label>
            <Input value={postMessage} onChange={e => setPostMessage(e.target.value)} placeholder="Message to traders..." className="bg-white/5 border-white/10" />
          </div>
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 mt-2" onClick={handlePostOrder}>Submit Order</Button>
        </div>
      </Modal>

      {/* Request Quote Modal */}
      <Modal isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} title="Request Quote">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">Submit a request for a custom OTC quote from our trading desk.</p>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Token Contract Address</label>
            <Input placeholder="Enter Solana token address" className="bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Buy / Sell</label>
              <select className="w-full h-10 rounded-md bg-white/5 border border-white/10 px-3 text-sm">
                <option>Buy</option><option>Sell</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Amount</label>
              <Input type="number" placeholder="Token amount" className="bg-white/5 border-white/10" />
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600" onClick={() => { toast.success('Quote request submitted. Our team will respond shortly.'); setShowQuoteModal(false); }}>
            Submit Quote Request
          </Button>
        </div>
      </Modal>

      {/* Token Listing Modal */}
      <Modal isOpen={showListingModal} onClose={() => setShowListingModal(false)} title="Submit Token for OTC Listing">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Contract Address *</label>
            <div className="flex gap-2">
              <Input value={listingContract} onChange={e => setListingContract(e.target.value)} placeholder="Solana token address" className="bg-white/5 border-white/10" />
              <Button size="sm" onClick={() => fetchTokenDetails(listingContract, setListingTokenInfo)} disabled={isFetchingToken}>
                {isFetchingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          {listingTokenInfo && <TokenPreview info={listingTokenInfo} />}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Token Name *</label>
              <Input value={listingName} onChange={e => setListingName(e.target.value)} placeholder="Token name" className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Symbol</label>
              <Input value={listingSymbol} onChange={e => setListingSymbol(e.target.value)} placeholder="Symbol" className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Network</label>
            <Input value="Solana" disabled className="bg-white/5 border-white/10 opacity-60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Website</label>
              <Input value={listingWebsite} onChange={e => setListingWebsite(e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Telegram</label>
              <Input value={listingTelegram} onChange={e => setListingTelegram(e.target.value)} placeholder="t.me/..." className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Initial Liquidity Commitment</label>
            <Input value={listingLiquidity} onChange={e => setListingLiquidity(e.target.value)} placeholder="Amount in USD" className="bg-white/5 border-white/10" />
          </div>
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600" onClick={handleListingSubmit}>Submit Listing Request</Button>
        </div>
      </Modal>

      {/* Trade Confirmation Modal */}
      <Modal isOpen={!!showTradeConfirm} onClose={() => setShowTradeConfirm(null)} title="Confirm OTC Trade">
        {showTradeConfirm && (
          <div className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Token</span><span className="font-bold">{showTradeConfirm.tokenName} ({showTradeConfirm.tokenSymbol})</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Side</span><Badge className={showTradeConfirm.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{showTradeConfirm.side.toUpperCase()}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-mono">${showTradeConfirm.price}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono">{showTradeConfirm.amount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-mono font-bold">{showTradeConfirm.totalValue}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Counterparty</span><span className="font-mono text-xs">{showTradeConfirm.traderWallet}</span></div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-white/10" onClick={() => setShowTradeConfirm(null)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600" onClick={handleConfirmTrade}>
                <Check className="w-4 h-4 mr-2" /> Confirm Trade
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OTC;

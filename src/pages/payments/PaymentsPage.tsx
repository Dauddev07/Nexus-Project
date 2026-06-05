import React, { useState } from 'react';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CreditCard,
  DollarSign, TrendingUp, TrendingDown, Search, Filter, Eye, EyeOff,
  CheckCircle, Clock, AlertCircle, Plus, Send
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'funding';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  sender: string;
  receiver: string;
  status: TransactionStatus;
  date: string;
  description: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'funding', amount: 250000, currency: 'USD', sender: 'Michael Rodriguez', receiver: 'TechWave AI', status: 'completed', date: '2026-06-04', description: 'Series A Investment - Tranche 1' },
  { id: 't2', type: 'deposit', amount: 50000, currency: 'USD', sender: 'Bank Transfer', receiver: 'Wallet', status: 'completed', date: '2026-06-03', description: 'Deposit from Chase Bank' },
  { id: 't3', type: 'transfer', amount: 15000, currency: 'USD', sender: 'You', receiver: 'Jennifer Lee', status: 'completed', date: '2026-06-02', description: 'Consulting fee payment' },
  { id: 't4', type: 'withdrawal', amount: 10000, currency: 'USD', sender: 'Wallet', receiver: 'Bank Account', status: 'pending', date: '2026-06-01', description: 'Withdrawal to savings account' },
  { id: 't5', type: 'funding', amount: 500000, currency: 'USD', sender: 'Jennifer Lee', receiver: 'GreenLife Solutions', status: 'completed', date: '2026-05-28', description: 'Seed Round Investment' },
  { id: 't6', type: 'deposit', amount: 25000, currency: 'USD', sender: 'Wire Transfer', receiver: 'Wallet', status: 'completed', date: '2026-05-25', description: 'Revenue from Q1 sales' },
  { id: 't7', type: 'transfer', amount: 5000, currency: 'USD', sender: 'Robert Torres', receiver: 'You', status: 'completed', date: '2026-05-20', description: 'Advisory fee' },
  { id: 't8', type: 'funding', amount: 100000, currency: 'USD', sender: 'Robert Torres', receiver: 'HealthPulse', status: 'pending', date: '2026-06-05', description: 'Bridge Round Funding' },
];

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [walletBalance, setWalletBalance] = useState(345000);
  const [showBalance, setShowBalance] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [showModal, setShowModal] = useState<'deposit' | 'withdraw' | 'transfer' | 'fund' | null>(null);
  const [formData, setFormData] = useState({ amount: '', recipient: '', description: '' });

  if (!user) return null;

  const isInvestor = user.role === 'investor';

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchQuery === '' || t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.sender.toLowerCase().includes(searchQuery.toLowerCase()) || t.receiver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  const handleAction = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) return;

    const newTx: Transaction = {
      id: `t${Date.now()}`,
      type: showModal === 'fund' ? 'funding' : showModal!,
      amount,
      currency: 'USD',
      sender: showModal === 'deposit' ? 'Bank Transfer' : showModal === 'fund' ? user.name : 'You',
      receiver: showModal === 'withdraw' ? 'Bank Account' : formData.recipient || 'Recipient',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      description: formData.description || `${showModal} transaction`,
    };

    setTransactions(prev => [newTx, ...prev]);

    if (showModal === 'deposit') setWalletBalance(prev => prev + amount);
    else if (showModal === 'withdraw' || showModal === 'transfer' || showModal === 'fund') setWalletBalance(prev => prev - amount);

    setFormData({ amount: '', recipient: '', description: '' });
    setShowModal(null);
  };

  const typeIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft size={16} className="text-green-500" />;
      case 'withdrawal': return <ArrowUpRight size={16} className="text-red-500" />;
      case 'transfer': return <ArrowLeftRight size={16} className="text-blue-500" />;
      case 'funding': return <DollarSign size={16} className="text-purple-500" />;
    }
  };

  const statusBadge = (status: TransactionStatus) => {
    const variants: Record<TransactionStatus, 'success' | 'warning' | 'error'> = { completed: 'success', pending: 'warning', failed: 'error' };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const totalIncoming = transactions.filter(t => (t.type === 'deposit' || t.type === 'funding') && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const totalOutgoing = transactions.filter(t => (t.type === 'withdrawal' || t.type === 'transfer') && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Wallet</h1>
          <p className="text-gray-600">Manage your funds, transactions, and deal payments</p>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wallet size={20} />
                <span className="text-sm font-medium opacity-90">Wallet Balance</span>
              </div>
              <button onClick={() => setShowBalance(!showBalance)} className="opacity-70 hover:opacity-100">
                {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold">{showBalance ? formatCurrency(walletBalance) : '••••••••'}</h2>
              <p className="text-sm opacity-75 mt-1">Available for transactions</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowModal('deposit')} className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-medium transition-colors">
                Deposit
              </button>
              <button onClick={() => setShowModal('withdraw')} className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-medium transition-colors">
                Withdraw
              </button>
              <button onClick={() => setShowModal('transfer')} className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-medium transition-colors">
                Transfer
              </button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-100 rounded-lg"><TrendingUp size={18} className="text-green-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Total Incoming</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncoming)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 rounded-lg"><TrendingDown size={18} className="text-red-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Total Outgoing</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalOutgoing)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardBody className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              {isInvestor ? 'Investor Actions' : 'Entrepreneur Actions'}
            </h3>
            <div className="space-y-2">
              {isInvestor ? (
                <>
                  <Button fullWidth variant="outline" leftIcon={<Send size={16} />} onClick={() => setShowModal('fund')}>
                    Fund a Startup
                  </Button>
                  <Button fullWidth variant="outline" leftIcon={<DollarSign size={16} />} onClick={() => setShowModal('deposit')}>
                    Add Funds to Wallet
                  </Button>
                </>
              ) : (
                <>
                  <Button fullWidth variant="outline" leftIcon={<ArrowDownLeft size={16} />} onClick={() => setShowModal('deposit')}>
                    Deposit Revenue
                  </Button>
                  <Button fullWidth variant="outline" leftIcon={<ArrowUpRight size={16} />} onClick={() => setShowModal('withdraw')}>
                    Withdraw Funds
                  </Button>
                </>
              )}
              <Button fullWidth variant="outline" leftIcon={<ArrowLeftRight size={16} />} onClick={() => setShowModal('transfer')}>
                Send Payment
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Funding Flow (Investor → Entrepreneur) */}
      {isInvestor && (
        <Card className="bg-purple-50 border border-purple-100">
          <CardBody>
            <h3 className="text-sm font-semibold text-purple-800 mb-3">Active Funding Deals</h3>
            <div className="space-y-3">
              {transactions.filter(t => t.type === 'funding').slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <DollarSign size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.receiver}</p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-purple-700">{formatCurrency(t.amount)}</p>
                    {statusBadge(t.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <div className="flex gap-2">
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} startAdornment={<Search size={16} />} />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="flex gap-2 px-6 py-3 border-b overflow-x-auto">
            {(['all', 'deposit', 'withdrawal', 'transfer', 'funding'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${typeFilter === t ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Transaction</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Sender</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Receiver</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
              </tr></thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">{typeIcon(t.type)}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.description}</p>
                          <p className="text-xs text-gray-400 capitalize">{t.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{t.sender}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{t.receiver}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-semibold ${t.type === 'deposit' || (t.type === 'funding' && t.receiver === user.name) ? 'text-green-600' : 'text-gray-900'}`}>
                        {t.type === 'deposit' ? '+' : t.type === 'withdrawal' || t.type === 'transfer' ? '-' : ''}{formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{statusBadge(t.status)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500 hidden md:table-cell">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showModal === 'deposit' && 'Deposit Funds'}
              {showModal === 'withdraw' && 'Withdraw Funds'}
              {showModal === 'transfer' && 'Send Payment'}
              {showModal === 'fund' && 'Fund a Startup'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00" className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              {(showModal === 'transfer' || showModal === 'fund') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {showModal === 'fund' ? 'Startup / Entrepreneur' : 'Recipient'}
                  </label>
                  <input type="text" value={formData.recipient} onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                    placeholder={showModal === 'fund' ? 'e.g., TechWave AI' : 'e.g., Sarah Johnson'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Investment payment" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Current Balance</span>
                  <span className="font-medium">{formatCurrency(walletBalance)}</span>
                </div>
                {formData.amount && (
                  <div className="flex justify-between text-gray-600 mt-1">
                    <span>After Transaction</span>
                    <span className={`font-medium ${showModal === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {formatCurrency(showModal === 'deposit' ? walletBalance + parseFloat(formData.amount || '0') : walletBalance - parseFloat(formData.amount || '0'))}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAction} fullWidth disabled={!formData.amount}>Confirm</Button>
                <Button variant="outline" onClick={() => setShowModal(null)} fullWidth>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

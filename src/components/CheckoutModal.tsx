import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ShieldCheck, Loader2, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: 'monthly' | 'yearly') => void;
  plan: 'monthly' | 'yearly';
}

export function CheckoutModal({ isOpen, onClose, onSuccess, plan }: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const price = plan === 'monthly' ? '₹99' : '₹199';
  const planName = plan === 'monthly' ? 'Monthly' : 'Yearly';

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onSuccess(plan);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <header className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </header>

            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-surface rounded-2xl p-4 flex items-center justify-between border border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Lock size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{planName} Pro Plan</p>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Premium Access</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{price}</p>
                  {plan === 'yearly' && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">SAVE 83%</span>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="flex gap-2 bg-surface p-1 rounded-2xl border border-black/5">
                {[
                  { id: 'upi', label: 'UPI' },
                  { id: 'card', label: 'Card' },
                  { id: 'netbanking', label: 'Net Banking' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      paymentMethod === m.id ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'upi' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-4 gap-3">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <button 
                        key={app}
                        onClick={handlePayment}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-black/5 hover:border-primary/50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                          <img 
                            src={`https://www.vectorlogo.zone/logos/${app === 'GPay' ? 'google_pay' : app === 'PhonePe' ? 'phonepe' : app === 'Paytm' ? 'paytm' : 'bhim'}/index.svg`} 
                            alt={app} 
                            className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all"
                            onError={(e) => { e.currentTarget.src = 'https://www.svgrepo.com/show/440537/brand-upi.svg'; }}
                          />
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest">{app}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.2em] text-gray-400">
                      <span className="bg-white px-4">Or Enter UPI ID</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input 
                      className="w-full bg-surface border-0 ring-1 ring-black/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                      placeholder="username@bankid"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 text-center font-medium">Verified by NPCI Secure</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <form onSubmit={handlePayment} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Card Number</label>
                    <div className="relative">
                      <input 
                        required
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-surface border-0 ring-1 ring-black/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                      />
                      <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
                      <input 
                        required
                        placeholder="MM/YY"
                        className="w-full bg-surface border-0 ring-1 ring-black/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CVC</label>
                      <input 
                        required
                        placeholder="123"
                        maxLength={3}
                        className="w-full bg-surface border-0 ring-1 ring-black/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                </form>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-2 gap-2">
                    {['SBI', 'HDFC', 'ICICI', 'Axis'].map(bank => (
                      <button 
                        key={bank}
                        onClick={handlePayment}
                        className="py-3 px-4 rounded-xl border border-black/5 hover:border-primary text-xs font-bold text-gray-600 hover:text-primary transition-all bg-surface"
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                  <button className="w-full py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
                    View More Banks
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={handlePayment}
                  disabled={isProcessing || (paymentMethod === 'upi' && !upiId.includes('@') && !upiId.trim())}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay {price} Now
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-4">
                <ShieldCheck size={14} className="text-green-500" />
                Secure 256-bit SSL Encrypted Payment
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

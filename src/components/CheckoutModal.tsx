
import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { confirmPayment, createPaymentIntent } from '../services/paymentService';
import { toast } from 'react-hot-toast';

interface CheckoutModalProps {
    planName: string;
    price: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ planName, price, isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    if (!isOpen) return null;

    const handlePay = async () => {
        if (!cardNumber || !expiry || !cvc) {
            toast.error("Completa los datos de la tarjeta");
            return;
        }

        setStep('processing');

        try {
            await createPaymentIntent(price * 100); // Create intent
            const result = await confirmPayment('pi_mock', 'pm_mock'); // Confirm

            if (result.success) {
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                toast.error(result.error || "Error en el pago");
                setStep('details');
            }
        } catch (e) {
            toast.error("Error de conexión");
            setStep('details');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="p-8">
                    {step === 'details' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8 text-indigo-500" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Checkout Seguro</h2>
                                <p className="text-slate-500 font-medium">Suscribiéndose a <span className="text-indigo-500 font-bold">{planName}</span></p>
                                <div className="text-4xl font-black dark:text-white my-4">${price}<span className="text-sm text-slate-400">/mes</span></div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Número de Tarjeta (Mock)</label>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={e => setCardNumber(e.target.value)}
                                        placeholder="4242 4242 4242 4242"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-xl font-bold dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Expiración</label>
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={e => setExpiry(e.target.value)}
                                            placeholder="MM/YY"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-xl font-bold dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">CVC</label>
                                        <input
                                            type="text"
                                            value={cvc}
                                            onChange={e => setCvc(e.target.value)}
                                            placeholder="123"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-xl font-bold dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handlePay} className="w-full h-14 rounded-xl font-black uppercase text-sm shadow-xl shadow-indigo-500/20">
                                Pagar ${price}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                                <Lock className="w-3 h-3" /> Pagos procesados de forma segura (Simulado)
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-10 text-center space-y-6">
                            <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <h3 className="text-xl font-black uppercase tracking-tighter animate-pulse dark:text-white">Procesando Pago...</h3>
                            <p className="text-slate-500">No cierres esta ventana.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-10 text-center space-y-6 animate-fade-in">
                            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-emerald-500">¡Pago Exitoso!</h3>
                            <p className="text-slate-500">Tu suscripción ha sido activada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

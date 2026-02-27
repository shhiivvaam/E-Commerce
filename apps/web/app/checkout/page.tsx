"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, MapPin, Package, Lock, Plus, Tag, X, ChevronRight, ShieldCheck, Zap, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface AppliedCoupon {
    couponId: string;
    code: string;
    discountAmount: number;
    finalTotal: number;
}

const steps = [
    { id: 1, name: "Logistics", icon: MapPin, label: "Shipping Node" },
    { id: 2, name: "Protocol", icon: CreditCard, label: "Payment Gateway" },
    { id: 3, name: "Validate", icon: Package, label: "Manifest Review" },
];

interface SavedAddress {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export default function CheckoutPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const { items, total, clearCart } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);

    // Address state
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const [address, setAddress] = useState({
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        zipCode: "",
        state: "NY",
        country: "US"
    });

    const router = useRouter();

    const finalTotal = appliedCoupon ? appliedCoupon.finalTotal : total;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        try {
            const { data } = await api.post('/coupons/apply', { code: couponCode.trim(), cartTotal: total });
            setAppliedCoupon(data);
            toast.success(`Coupon authorized: -${data.discountAmount.toFixed(2)} Credits`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid coupon signature');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
    };

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const { data } = await api.get('/addresses');
                setSavedAddresses(data);
                if (data.length > 0) {
                    const def = data.find((a: SavedAddress) => a.isDefault);
                    setSelectedAddressId(def ? def.id : data[0].id);
                } else {
                    setIsAddingNew(true);
                }
            } catch (error) {
                console.error("Address registry retrieval failure", error);
                setIsAddingNew(true);
            }
        };
        fetchAddresses();
    }, []);

    if (items.length === 0 && currentStep !== 4) {
        return (
            <div className="container mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center px-8 bg-white">
                <div className="h-20 w-20 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center mb-8 text-slate-200">
                    <ShieldAlert className="h-10 w-10" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Manifest Empty.</h2>
                <p className="text-slate-400 font-medium mt-4 italic">Acquisition protocol requires active assets in current registry.</p>
                <Link href="/products" className="mt-8">
                    <Button size="lg" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px]">Return to Archives</Button>
                </Link>
            </div>
        );
    }

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            const orderPayload: Record<string, unknown> = {
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                ...(appliedCoupon && { couponId: appliedCoupon.couponId }),
            };

            if (selectedAddressId && !isAddingNew) {
                orderPayload.addressId = selectedAddressId;
            } else {
                orderPayload.address = {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    zipCode: address.zipCode
                };
            }

            const orderRes = await api.post('/orders', orderPayload);
            const orderId = orderRes.data.id;

            await clearCart();

            const checkoutPayload = {
                orderId,
                items: items.map(i => ({
                    title: i.title,
                    price: i.price,
                    quantity: i.quantity
                })),
                successUrl: `${window.location.origin}/dashboard/orders?success=true`,
                cancelUrl: `${window.location.origin}/checkout?canceled=true`,
                ...(appliedCoupon && { discountAmount: appliedCoupon.discountAmount }),
            };

            const paymentRes = await api.post('/payments/checkout', checkoutPayload);

            if (paymentRes.data.url) {
                window.location.href = paymentRes.data.url;
            } else {
                setCurrentStep(4);
            }

        } catch (error) {
            console.error("Acquisition failure", error);
            toast.error("Protocol rejection. Verify data integrity and re-initialize.");
            setIsProcessing(false);
        }
    };

    const updateAddress = (field: string, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    };

    const canProceedFromAddress = () => {
        if (!isAddingNew && selectedAddressId) return true;
        if (isAddingNew && address.street && address.city && address.zipCode) return true;
        return false;
    };

    return (
        <div className="bg-white min-h-screen pb-40">
            {/* Architectural Header */}
            <header className="pt-20 pb-12 border-b-2 border-slate-50">
                <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Finalization Stage</span>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">Acquisition <br />Protocol</h1>
                        <p className="text-slate-400 font-medium text-lg italic mt-4 max-w-lg leading-tight uppercase tracking-tighter">Securely transferring ownership of selected assets to your physical location.</p>
                    </div>

                    {/* Progress Stepper */}
                    {currentStep < 4 && (
                        <div className="flex gap-4 md:gap-8 pb-4 w-full md:w-auto overflow-x-auto no-scrollbar">
                            {steps.map((step) => {
                                const isActive = currentStep >= step.id;
                                const isDone = currentStep > step.id;
                                return (
                                    <div key={step.id} className="flex items-center gap-4 shrink-0">
                                        <div className={`h-14 w-14 rounded-[20px] border-2 flex items-center justify-center transition-all ${isActive ? "bg-black border-black text-white shadow-xl shadow-black/10" : "bg-white border-slate-100 text-slate-300"}`}>
                                            {isDone ? <CheckCircle2 className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                                        </div>
                                        <div className="hidden xl:block">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-black' : 'text-slate-300'}`}>{step.name}</p>
                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">{step.label}</p>
                                        </div>
                                        {step.id < 3 && <div className="hidden lg:block h-px w-12 bg-slate-100" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </header>

            <div className="container px-8 py-20 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Execution Panel */}
                    <div className="lg:col-span-12 xl:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-12"
                            >
                                {currentStep === 1 && (
                                    <div className="space-y-10">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">Physical Logistics</h2>
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Destination node identification</p>
                                        </div>

                                        {savedAddresses.length > 0 && !isAddingNew && (
                                            <div className="space-y-6">
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    {savedAddresses.map((addr) => (
                                                        <motion.div
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            key={addr.id}
                                                            onClick={() => setSelectedAddressId(addr.id)}
                                                            className={`p-8 rounded-[32px] border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-black bg-slate-50 shadow-xl' : 'border-slate-100 hover:border-slate-200 opacity-60'}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-6">
                                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 ${selectedAddressId === addr.id ? 'bg-black text-white border-black' : 'border-slate-100 text-slate-200'}`}>
                                                                    <MapPin className="h-5 w-5" />
                                                                </div>
                                                                {selectedAddressId === addr.id && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-4" />}
                                                            </div>
                                                            <p className="text-lg font-black uppercase tracking-tight">{addr.street}</p>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{addr.city}, {addr.state} {addr.zipCode}</p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                <Button variant="outline" onClick={() => setIsAddingNew(true)} className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-200 hover:border-black hover:bg-slate-50 transition-all gap-3 font-black uppercase tracking-widest text-[10px]">
                                                    <Plus className="h-4 w-4" /> Define New Protocol Address
                                                </Button>
                                            </div>
                                        )}

                                        {isAddingNew && (
                                            <div className="bg-slate-50 p-10 rounded-[40px] border-2 border-slate-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                {savedAddresses.length > 0 && (
                                                    <Button variant="ghost" onClick={() => setIsAddingNew(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black p-0 h-auto">
                                                        &larr; Return to Registry
                                                    </Button>
                                                )}
                                                <div className="grid sm:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Acquirer First Name</label>
                                                        <Input value={address.firstName} onChange={e => updateAddress('firstName', e.target.value)} placeholder="e.g. MARCUS" className="h-14 rounded-2xl border-2 font-bold focus-visible:ring-primary/20" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Acquirer Last Name</label>
                                                        <Input value={address.lastName} onChange={e => updateAddress('lastName', e.target.value)} placeholder="e.g. AURELIUS" className="h-14 rounded-2xl border-2 font-bold focus-visible:ring-primary/20" />
                                                    </div>
                                                    <div className="space-y-4 sm:col-span-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Primary Conduit (Street)</label>
                                                        <Input value={address.street} onChange={e => updateAddress('street', e.target.value)} placeholder="e.g. 742 EVERGREEN TERRACE" className="h-14 rounded-2xl border-2 font-bold focus-visible:ring-primary/20" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">City Node</label>
                                                        <Input value={address.city} onChange={e => updateAddress('city', e.target.value)} placeholder="e.g. SPRINGFIELD" className="h-14 rounded-2xl border-2 font-bold focus-visible:ring-primary/20" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Postal Reference</label>
                                                        <Input value={address.zipCode} onChange={e => updateAddress('zipCode', e.target.value)} placeholder="e.g. 52401" className="h-14 rounded-2xl border-2 font-black tracking-widest focus-visible:ring-primary/20" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-10 flex justify-between items-center border-t-2 border-slate-50">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter italic">Step 01 / 03 — Operational Verification</p>
                                            <Button
                                                size="lg"
                                                onClick={handleNext}
                                                disabled={!canProceedFromAddress()}
                                                className="h-16 px-12 rounded-[24px] font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl transition-all active:scale-95"
                                            >
                                                Authorize & Proceed <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-10">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">Acquisition Gateway</h2>
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Financial synchronization protocol</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-[48px] p-12 border-4 border-slate-100 flex flex-col items-center justify-center gap-8 text-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                                <CreditCard className="h-48 w-48 -rotate-12" />
                                            </div>

                                            <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center text-primary shadow-2xl relative z-10">
                                                <Lock className="h-10 w-10 fill-primary/10" />
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter">IRONCLAD STRIPE PROTOCOL</h3>
                                                <p className="text-sm font-medium text-slate-400 max-w-sm italic leading-relaxed">External redirection to military-grade encryption hub for financial settlement. No card data persist on locale.</p>
                                            </div>

                                            <div className="flex gap-4 pt-4 relative z-10">
                                                <div className="h-10 w-16 bg-white border border-slate-100 rounded-lg flex items-center justify-center grayscale opacity-40">VISA</div>
                                                <div className="h-10 w-16 bg-white border border-slate-100 rounded-lg flex items-center justify-center grayscale opacity-40">AMEX</div>
                                                <div className="h-10 w-16 bg-white border border-slate-100 rounded-lg flex items-center justify-center grayscale opacity-40">MC</div>
                                            </div>
                                        </div>

                                        <div className="pt-10 flex justify-between items-center border-t-2 border-slate-50">
                                            <Button variant="ghost" onClick={handleBack} className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400">Revert Stage</Button>
                                            <Button
                                                size="lg"
                                                onClick={handleNext}
                                                className="h-16 px-12 rounded-[24px] font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl transition-all active:scale-95"
                                            >
                                                Initialize Review <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-10">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">Manifest Finalization</h2>
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Asset validation & loyalty synchronization</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-[48px] border-2 border-slate-100 overflow-hidden divide-y divide-slate-100">
                                            <div className="p-10 space-y-8">
                                                {items.map(item => (
                                                    <div key={item.id} className="flex justify-between items-center gap-10">
                                                        <div className="flex items-center gap-10">
                                                            <div className="relative h-20 w-20 bg-white border border-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                                                <Image src={item.image ?? ''} alt={item.title} fill unoptimized className="object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="text-lg font-black uppercase tracking-tight line-clamp-1">{item.title}</p>
                                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">QUANTITY: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xl font-black tracking-tighter tabular-nums">${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-10 bg-white/50 space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loyalty Credits / Coupon Protocol</label>
                                                </div>

                                                {appliedCoupon ? (
                                                    <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-100 rounded-[28px] px-8 py-5">
                                                        <div className="flex items-center gap-4 text-emerald-800">
                                                            <Tag className="h-5 w-5" />
                                                            <span className="font-black uppercase tracking-widest text-xs">{appliedCoupon.code} Authorized</span>
                                                            <span className="text-[10px] font-bold italic opacity-60">(-${appliedCoupon.discountAmount.toFixed(2)})</span>
                                                        </div>
                                                        <button onClick={handleRemoveCoupon} className="h-10 w-10 rounded-xl hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-4">
                                                        <Input
                                                            value={couponCode}
                                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                            placeholder="ENTER COUPE CODE"
                                                            className="h-16 rounded-2xl border-2 font-black tracking-[0.3em] uppercase text-center focus-visible:ring-primary/20 placeholder:text-slate-200"
                                                            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleApplyCoupon}
                                                            disabled={isApplyingCoupon || !couponCode.trim()}
                                                            className="h-16 px-10 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px]"
                                                        >
                                                            {isApplyingCoupon ? '...' : 'Validate'}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-10 bg-black text-white space-y-4">
                                                <div className="flex justify-between items-baseline opacity-40">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gross Subtotal</span>
                                                    <span className="text-xl font-black tabular-nums">${total.toFixed(2)}</span>
                                                </div>
                                                {appliedCoupon && (
                                                    <div className="flex justify-between items-baseline text-emerald-400">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Coupon Override</span>
                                                        <span className="text-xl font-black tabular-nums">-${appliedCoupon.discountAmount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Final Liability</span>
                                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter italic">Authorized for Transfer</p>
                                                    </div>
                                                    <span className="text-6xl font-black tracking-tighter tabular-nums">${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 flex justify-between items-center border-t-2 border-slate-50">
                                            <Button variant="ghost" onClick={handleBack} disabled={isProcessing} className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400">Revert Manifest</Button>
                                            <Button
                                                size="lg"
                                                onClick={handlePlaceOrder}
                                                disabled={isProcessing}
                                                className="h-16 px-16 rounded-[24px] font-black uppercase tracking-widest text-[10px] gap-4 shadow-2xl transition-all active:scale-95 group"
                                            >
                                                {isProcessing ? "Transmitting..." : "Establish Final Acquisition"}
                                                <Zap className="h-5 w-5 transition-transform group-hover:scale-125" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="text-center space-y-12 py-20 px-10 bg-slate-50 rounded-[60px] border-4 border-slate-100 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from- emerald-500/5 via-transparent to-transparent pointer-events-none" />

                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", damping: 15 }}
                                            className="mx-auto h-32 w-32 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                                        >
                                            <ShieldCheck className="h-16 w-16" />
                                        </motion.div>

                                        <div className="space-y-4">
                                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Acquisition <br /><span className="text-emerald-500">Authorized.</span></h2>
                                            <p className="text-lg text-slate-400 font-medium max-w-lg mx-auto italic leading-relaxed">
                                                Registry updated successfully. Your assets have been committed to the logistics flow and will materialize shortly.
                                            </p>
                                        </div>

                                        <div className="pt-12 flex flex-col md:flex-row justify-center gap-6">
                                            <Link href="/dashboard/orders">
                                                <Button size="lg" variant="outline" className="h-18 px-12 rounded-[24px] font-black uppercase tracking-widest text-[10px] border-2">Monitor Dispatch</Button>
                                            </Link>
                                            <Link href="/">
                                                <Button size="lg" className="h-18 px-12 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl">Return to Core</Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, MapPin, Package, Lock, Plus, Tag, X } from "lucide-react";
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
    { id: 1, name: "Shipping Address", icon: MapPin },
    { id: 2, name: "Payment Method", icon: CreditCard },
    { id: 3, name: "Review Order", icon: Package },
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
            toast.success(`Coupon applied! You saved $${data.discountAmount.toFixed(2)}`);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid coupon code';
            toast.error(msg);
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
                console.error("Could not fetch addresses", error);
                setIsAddingNew(true);
            }
        };
        fetchAddresses();
    }, []);

    if (items.length === 0 && currentStep !== 4) {
        return (
            <div className="container mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Cart is empty</h2>
                <p className="text-muted-foreground mb-6">You need items in your cart to checkout.</p>
                <Link href="/products"><Button>Go Shopping</Button></Link>
            </div>
        );
    }

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            // 1. Create Order
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

            // 2. Clear Local Cart since the order was successfully created
            await clearCart();

            // 3. Initiate Checkout Session
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

            // Redirect to Stripe or external handler
            if (paymentRes.data.url) {
                window.location.href = paymentRes.data.url;
            } else {
                // Fallback to step 4 if no URL is provided
                setCurrentStep(4);
            }

        } catch (error) {
            console.error("Order failed", error);
            toast.error("Failed to place order. Please check your information and try again.");
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
        <div className="container mx-auto px-4 py-12 max-w-4xl bg-muted/10 min-h-[80vh]">
            {/* Progress Stepper */}
            {currentStep < 4 && (
                <div className="mb-12">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full" />
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500 rounded-full"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        />

                        {steps.map((step) => {
                            const isActive = currentStep >= step.id;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-background p-2">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background text-muted-foreground"
                                        }`}>
                                        {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                    </div>
                                    <span className={`text-xs font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                        {step.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Steps Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border shadow-sm rounded-xl p-6 sm:p-10"
                >
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Shipping Details</h2>

                            {savedAddresses.length > 0 && !isAddingNew && (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium">Select a Saved Address</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {savedAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedAddressId === addr.id ? 'border-primary' : 'border-muted-foreground'}`}>
                                                        {selectedAddressId === addr.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                    </div>
                                                    <span className="font-semibold text-sm">Delivery Address</span>
                                                </div>
                                                <p className="text-sm">{addr.street}</p>
                                                <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" onClick={() => setIsAddingNew(true)} className="w-full flex items-center gap-2">
                                        <Plus className="h-4 w-4" /> Use a different address
                                    </Button>
                                </div>
                            )}

                            {isAddingNew && (
                                <div className="space-y-6 pt-2">
                                    {savedAddresses.length > 0 && (
                                        <Button variant="ghost" onClick={() => setIsAddingNew(false)} className="-ml-4 text-primary">
                                            &larr; Back to saved addresses
                                        </Button>
                                    )}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">First Name</label>
                                            <Input value={address.firstName} onChange={e => updateAddress('firstName', e.target.value)} placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name</label>
                                            <Input value={address.lastName} onChange={e => updateAddress('lastName', e.target.value)} placeholder="Doe" />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-medium">Street Address</label>
                                            <Input value={address.street} onChange={e => updateAddress('street', e.target.value)} placeholder="123 Main St" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">City</label>
                                            <Input value={address.city} onChange={e => updateAddress('city', e.target.value)} placeholder="New York" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">ZIP Code</label>
                                            <Input value={address.zipCode} onChange={e => updateAddress('zipCode', e.target.value)} placeholder="10001" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button size="lg" onClick={handleNext} disabled={!canProceedFromAddress()}>
                                    Continue to Payment
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Payment Setup</h2>
                            <p className="text-muted-foreground">You will be redirected securely to Stripe to complete your transaction after reviewing your order.</p>

                            <div className="border rounded-lg p-6 flex flex-col items-center justify-center gap-4 bg-muted/30">
                                <Lock className="h-8 w-8 text-primary" />
                                <div className="text-center">
                                    <p className="font-semibold">Secure Stripe Gateway</p>
                                    <p className="text-sm text-muted-foreground">We never store your raw credit card information.</p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button variant="ghost" onClick={handleBack}>Back</Button>
                                <Button size="lg" onClick={handleNext}>Review Order</Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Review Order</h2>
                            <div className="space-y-4 border rounded-lg p-4 divide-y">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between py-2 items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-12 w-12 bg-muted rounded overflow-hidden">
                                                <Image src={item.image ?? ''} alt={item.title} fill unoptimized className="object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-medium line-clamp-1">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}

                                {/* Coupon input */}
                                <div className="pt-4 space-y-3">
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                                <Tag className="h-4 w-4" />
                                                <span className="font-semibold text-sm">{appliedCoupon.code}</span>
                                                <span className="text-sm">(-${appliedCoupon.discountAmount.toFixed(2)})</span>
                                            </div>
                                            <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Coupon code"
                                                className="flex-1"
                                                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                            />
                                            <Button variant="outline" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode.trim()}>
                                                {isApplyingCoupon ? '...' : 'Apply'}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                            <span>Discount ({appliedCoupon.code})</span>
                                            <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Total Amount Due</span>
                                        <span>${finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button variant="ghost" onClick={handleBack} disabled={isProcessing}>Back</Button>
                                <Button size="lg" onClick={handlePlaceOrder} disabled={isProcessing}>
                                    {isProcessing ? "Processing..." : "Place Order Securely"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="text-center space-y-6 py-10">
                            <div className="mx-auto h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight">Order Confirmed!</h2>
                            <p className="text-lg text-muted-foreground max-w-md mx-auto">
                                Thank you for your purchase. Your payment was successful and we are processing your order.
                            </p>
                            <div className="pt-8">
                                <Button size="lg" onClick={() => router.push('/dashboard/orders')} variant="outline" className="mr-4">View Orders</Button>
                                <Button size="lg" onClick={() => router.push('/')}>Continue Shopping</Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

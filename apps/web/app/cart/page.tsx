"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag, Minus, Plus, ChevronLeft, ShieldCheck, Zap, Info } from "lucide-react";

export default function CartPage() {
    const { items, total, removeItem, updateQuantity } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="container min-h-[70vh] flex flex-col items-center justify-center text-center px-8 py-20 bg-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                >
                    <div className="h-24 w-24 bg-slate-50 border-2 border-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-200">
                        <ShoppingBag className="h-10 w-10" />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter">Registry Empty.</h2>
                        <p className="text-slate-400 font-medium mt-3 italic">Establish your first collection entry to proceed with acquisition.</p>
                    </div>
                    <Link href="/products">
                        <Button size="lg" className="rounded-2xl h-16 px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Return to Archives</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-40">
            <header className="pt-20 pb-12 border-b-2 border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="container mx-auto px-8 relative z-10">
                    <div className="space-y-4">
                        <Link href="/products" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black transition-colors mb-8">
                            <ChevronLeft className="h-3 w-3" /> Back to Collections
                        </Link>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">Consignment <br />Registry</h1>
                        <p className="text-slate-400 font-medium text-lg italic mt-4">Review and finalize your pending acquisitions.</p>
                    </div>
                </div>
            </header>

            <div className="container px-8 py-16 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Item Manifest */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="flex justify-between items-center pb-6 border-b-2 border-slate-50">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Asset Designation</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Valuation</span>
                        </div>

                        <div className="space-y-8">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group relative flex items-center gap-8 p-6 rounded-[32px] border-2 border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all"
                                    >
                                        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-[24px] bg-white border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                                            <Image src={item.image ?? ''} alt={item.title} fill unoptimized className="object-cover" />
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-4">
                                            <div className="space-y-1">
                                                <Link href={`/products/${item.productId}`} className="text-xl font-black uppercase tracking-tight hover:text-primary transition-colors block truncate">
                                                    {item.title}
                                                </Link>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Global Item Ref: {item.productId.slice(0, 8)}</p>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl h-10 px-1 shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="h-8 w-8 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-10 text-center text-xs font-black tabular-nums">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="h-8 w-8 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="h-10 w-px bg-slate-100 mx-2" />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border-2 border-transparent hover:border-rose-100"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-2xl font-black tracking-tighter tabular-nums">${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mt-1">${item.price.toFixed(2)}/unit</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Summary Cockpit */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-40 bg-black text-white rounded-[48px] p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Acquisition Summary</h2>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest italic leading-relaxed">System-calculated valuation and logistics estimates.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex justify-between items-baseline border-b border-white/10 pb-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Subtotal Valuation</span>
                                    <span className="text-2xl font-black tracking-tighter tabular-nums">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center group cursor-help">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Logistics Fee</span>
                                            <Info className="h-3 w-3 text-white/20" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Calculated Below</span>
                                    </div>
                                    <div className="flex justify-between items-center group cursor-help">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Tax Protocol</span>
                                            <Info className="h-3 w-3 text-white/20" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Dynamic Calculation</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t-2 border-white/20 flex justify-between items-end">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black uppercase tracking-widest">Total Liability</h3>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter italic">Subject to Final Confirmation</p>
                                    </div>
                                    <span className="text-5xl font-black tracking-tighter tabular-nums text-primary">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Link href="/checkout">
                                    <Button className="w-full h-20 bg-white text-black hover:bg-white/90 rounded-[30px] font-black uppercase tracking-widest text-xs gap-4 shadow-2xl transition-transform active:scale-95 group" size="lg">
                                        Initialize Checkout <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>

                                <div className="grid grid-cols-2 gap-4 pt-6">
                                    <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Secure Node</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <Zap className="h-5 w-5 text-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Priority Stream</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

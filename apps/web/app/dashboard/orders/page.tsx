"use client";

import { useEffect, useState } from "react";
import { Package, Clock, CheckCircle, Truck, XCircle, RefreshCcw, ArrowRight, ShieldCheck, ChevronRight, Activity, Calendar, Hash, DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'PROCESSING': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'SHIPPED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'RETURNED': return 'bg-slate-50 text-slate-600 border-slate-100';
        default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'PENDING': return <Clock className="h-3.5 w-3.5" />;
        case 'PROCESSING': return <RefreshCcw className="h-3.5 w-3.5 animate-spin-slow" />;
        case 'SHIPPED': return <Truck className="h-3.5 w-3.5" />;
        case 'DELIVERED': return <CheckCircle className="h-3.5 w-3.5" />;
        case 'CANCELLED': return <XCircle className="h-3.5 w-3.5" />;
        case 'RETURNED': return <RefreshCcw className="h-3.5 w-3.5" />;
        default: return <Package className="h-3.5 w-3.5" />;
    }
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<{
        id: string;
        createdAt: string;
        totalAmount: number;
        status: string;
        items: {
            id: string;
            productTitle: string;
            quantity: number;
            price: number;
        }[];
    }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data);
            } catch (error) {
                console.error('Manifest retrieval failure:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();

        if (searchParams.get('success') === 'true') {
            toast.success('Acquisition authorized. Registry updated.', { icon: '🛡️' });
        }
    }, [searchParams]);

    const handleCancel = async (orderId: string) => {
        if (!confirm('PROTOCOL PROTOCOL: Cancel acquisition authorization?')) return;
        try {
            await api.patch(`/orders/${orderId}/cancel`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
            toast.success('Acquisition terminated. Assets restored to archives.');
        } catch {
            toast.error('Termination failure. Fulfillment in progress.');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-12 w-64 bg-slate-100 rounded-2xl" />
                <div className="space-y-6">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[40px]" />)}
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
                <div className="h-24 w-24 bg-slate-50 border-2 border-slate-100 rounded-[32px] flex items-center justify-center text-slate-200">
                    <Package className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Manifest Empty</h3>
                    <p className="text-sm font-medium text-slate-400 max-w-sm italic leading-relaxed"> No verified transactions detected in current user identity profile.</p>
                </div>
                <Link href="/products">
                    <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Explore Archives</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-black/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Transaction Ledger</span>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">Historical Archives</h1>
                <p className="text-sm font-medium text-slate-400 italic">Inventory of all verified acquisitions and fulfillment states.</p>
            </header>

            <div className="space-y-8">
                {orders.map((order, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={order.id}
                        className="group bg-white rounded-[40px] border-2 border-slate-50 hover:border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all"
                    >
                        <div className="p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 bg-slate-50/50 border-b-2 border-slate-50">
                            <div className="space-y-6 flex-1">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                                            <Hash className="h-3 w-3" /> Entry Identifier
                                        </p>
                                        <p className="font-black uppercase text-xs tracking-tighter text-slate-400">{order.id.slice(0, 16)}...</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                                            <Calendar className="h-3 w-3" /> Timestamp
                                        </p>
                                        <p className="font-black uppercase text-xs tracking-tighter">
                                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                                            <DollarSign className="h-3 w-3" /> Valuation
                                        </p>
                                        <p className="font-black text-lg tracking-tighter tabular-nums">${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:text-right flex flex-col lg:items-end gap-4 shrink-0">
                                <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border-2 ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </div>
                                {['PENDING', 'PROCESSING'].includes(order.status) && (
                                    <button
                                        onClick={() => handleCancel(order.id)}
                                        className="text-[10px] font-black uppercase tracking-widest text-rose-300 hover:text-rose-500 transition-colors italic"
                                    >
                                        Terminate Protocol
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-8 flex items-center gap-3">
                                <Activity className="h-4 w-4" /> Manifest Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center group/item border-b border-slate-50 pb-4 last:border-0">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black uppercase tracking-tight group-hover/item:text-primary transition-colors">{item.productTitle}</span>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">LOGGED QTY: {item.quantity}</span>
                                        </div>
                                        <span className="font-black text-sm tracking-tighter tabular-nums">${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChevronDown, RefreshCw, ShoppingBag, Clock, CheckCircle2, Package, Search, X, MapPin, User, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
    id: string;
    productTitle: string;
    price: number;
    quantity: number;
    sku?: string;
}

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { email: string; name?: string };
    items: OrderItem[];
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
}

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
    SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
    DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders/admin/all');
            setOrders(data);
        } catch {
            toast.error("Cloud synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId: string, status: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status });
            }
            toast.success(`Order transition: ${status}`);
        } catch {
            toast.error("Status update rejected");
        }
    };

    const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === "PENDING").length,
        processing: orders.filter(o => o.status === "PROCESSING").length,
    };

    return (
        <div className="space-y-10 pb-12 relative min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">Logistics Core</h2>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Control tower for global order flow and fulfillment intelligence.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchOrders} className="rounded-2xl h-12 px-6 gap-2 border-2 active:scale-95 transition-transform">
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /> Sync Data
                    </Button>
                </div>
            </div>

            {/* Global Order Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Volume", value: stats.total, icon: ShoppingBag, color: "bg-blue-600" },
                    { label: "Awaiting Action", value: stats.pending, icon: Clock, color: "bg-amber-500" },
                    { label: "Transit Flow", value: stats.processing, icon: RefreshCw, color: "bg-indigo-600" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        key={stat.label}
                        className="bg-card border-2 rounded-[32px] p-8 flex items-center gap-6 shadow-sm hover:shadow-lg transition-shadow"
                    >
                        <div className={`p-4 rounded-[24px] ${stat.color} text-white shadow-xl shadow-black/5`}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <h4 className="text-4xl font-black tabular-nums">{stat.value}</h4>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-8">
                {/* Filtration Matrix */}
                <div className="flex flex-wrap gap-2.5 bg-muted/10 p-2 rounded-[28px] w-fit border-2">
                    {["ALL", ...STATUS_OPTIONS].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${filter === s
                                ? "bg-card text-primary shadow-md scale-[1.05] border-2 border-primary/10"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {s} {s !== "ALL" && <span className="ml-2 opacity-40">{orders.filter(o => o.status === s).length}</span>}
                        </button>
                    ))}
                </div>

                <div className="bg-card border-2 rounded-[40px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-muted/5 border-b-2">
                                    <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest">Transaction ID</th>
                                    <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest">Customer Profile</th>
                                    <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest">Quantity</th>
                                    <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-right">Net Value</th>
                                    <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-center">Status</th>
                                    <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-right">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-muted/10">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="p-8"><div className="h-16 bg-muted/30 rounded-[28px]" /></td>
                                            </tr>
                                        ))
                                    ) : filtered.length > 0 ? (
                                        filtered.map(order => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={order.id}
                                                className="group hover:bg-muted/5 transition-colors cursor-pointer"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <td className="px-8 py-6">
                                                    <span className="font-mono text-xs font-black bg-muted px-3 py-1.5 rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">#{(order.id || "").slice(-8).toUpperCase()}</span>
                                                    <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-base text-foreground leading-none">{order.user?.name || "Independent Buyer"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 font-medium">{order.user?.email}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2.5 text-muted-foreground font-black text-xs uppercase">
                                                        <Package className="h-4 w-4" />
                                                        {order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0} Products
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <p className="font-black text-xl tracking-tighter text-foreground">${(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                    <div className="flex items-center justify-end gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Secure Capture
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${STATUS_COLORS[order.status] || "bg-muted text-muted-foreground"}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={order.status}
                                                            onChange={e => handleStatusChange(order.id, e.target.value)}
                                                            className="appearance-none text-[11px] font-black border-2 rounded-2xl px-5 py-2.5 pr-10 bg-background cursor-pointer hover:border-primary/50 transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 tracking-widest uppercase"
                                                        >
                                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-32 text-center opacity-30">
                                                <div className="max-w-[240px] mx-auto">
                                                    <ShoppingBag className="h-16 w-16 mx-auto mb-6" />
                                                    <p className="text-lg font-black uppercase tracking-widest">No Log Entries</p>
                                                    <p className="text-xs font-medium uppercase mt-2">Adjust your status parameters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Order Detail Slide-over */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l-2 shadow-2xl z-[101] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-8 border-b-2 flex items-center justify-between bg-muted/5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">Manifest Details</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${STATUS_COLORS[selectedOrder.status]}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono font-bold text-muted-foreground">ID REFERENCE: {selectedOrder.id}</p>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-2xl h-12 w-12 border-2">
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                                {/* Section: Logistics Progress */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Fulfillment Status
                                    </h4>
                                    <div className="flex justify-between items-center relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full" />
                                        {STATUS_OPTIONS.slice(0, 4).map((s, idx) => {
                                            const activeIdx = STATUS_OPTIONS.indexOf(selectedOrder.status);
                                            const isDone = STATUS_OPTIONS.indexOf(s) <= activeIdx;
                                            return (
                                                <div key={s} className="relative z-10 flex flex-col items-center gap-2 bg-card">
                                                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-primary border-primary text-white scale-110 shadow-lg' : 'bg-card border-muted text-muted-foreground'}`}>
                                                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                                    </div>
                                                    <span className={`text-[10px] font-black tracking-tighter uppercase ${isDone ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>{s}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-muted/10 border-2 border-dashed rounded-3xl p-6 flex items-center justify-between">
                                        <p className="text-sm font-bold opacity-70">Shift Fulfillment Phase:</p>
                                        <select
                                            value={selectedOrder.status}
                                            onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                                            className="appearance-none text-xs font-black border-2 rounded-xl px-5 py-2 pr-10 bg-card cursor-pointer"
                                        >
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Section: Entity Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-muted/10 rounded-[32px] p-8 border-2 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <User className="h-4 w-4" /> Customer Entity
                                        </h4>
                                        <div className="space-y-1">
                                            <p className="text-xl font-black">{selectedOrder.user?.name || "Independent Buyer"}</p>
                                            <p className="text-sm font-medium text-muted-foreground">{selectedOrder.user?.email}</p>
                                        </div>
                                        <Button variant="link" className="p-0 h-auto text-xs font-black uppercase text-primary tracking-widest gap-2">
                                            Full Profile <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="bg-muted/10 rounded-[32px] p-8 border-2 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <MapPin className="h-4 w-4" /> Destination Node
                                        </h4>
                                        {selectedOrder.address ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold uppercase tracking-tight leading-tight">{selectedOrder.address.street}</p>
                                                <p className="text-xs font-medium text-muted-foreground uppercase">{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipCode}</p>
                                                <p className="text-xs font-black uppercase text-muted-foreground mt-2">{selectedOrder.address.country}</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs font-bold text-muted-foreground italic">No address metadata captured.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Section: Itemized Manifest */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                                        <Package className="h-4 w-4" /> Itemized Manifest
                                    </h4>
                                    <div className="bg-card border-2 rounded-[32px] overflow-hidden">
                                        <div className="divide-y-2">
                                            {selectedOrder.items.map((item) => (
                                                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground/30">
                                                            IMG
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-base">{item.productTitle}</p>
                                                            <p className="text-[10px] font-mono text-muted-foreground uppercase">SKU: {item.sku || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-base font-black">${(item.price * item.quantity).toFixed(2)}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{item.quantity} UNITS @ ${item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Financial Settlement */}
                                <div className="bg-muted/20 rounded-[40px] p-8 border-2 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" /> Settlement Summary
                                    </h4>
                                    <div className="space-y-3 font-bold">
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-50 uppercase tracking-widest">Subtotal</span>
                                            <span className="tabular-nums">${(selectedOrder.totalAmount * 0.9).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-50 uppercase tracking-widest">Shipping & Handling</span>
                                            <span className="tabular-nums text-emerald-600">FREE</span>
                                        </div>
                                        <div className="pt-4 border-t-2 border-muted flex justify-between items-baseline">
                                            <span className="text-base font-black uppercase tracking-[0.2em]">Net Capture</span>
                                            <span className="text-4xl font-black tabular-nums tracking-tighter text-primary">${selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 border-t-2 bg-muted/5 grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-14 rounded-2xl font-black uppercase tracking-widest border-2" onClick={() => setSelectedOrder(null)}>
                                    Close Manifest
                                </Button>
                                <Button className="h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/10" onClick={() => {
                                    toast.loading("Generating packing slip...", { duration: 2000 });
                                }}>
                                    Pack Order
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

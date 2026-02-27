"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChevronDown, RefreshCw, ShoppingBag, Clock, CheckCircle2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { email: string; name?: string };
    items: { quantity: number }[];
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

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders/admin/all'); // Assuming there's an admin-specific endpoint or all orders
            setOrders(data);
        } catch {
            // Fallback to regular user orders if admin one fails or use whatever is available
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
            } catch {
                toast.error("Failed to load orders");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId: string, status: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            toast.success(`Order status updated to ${status}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === "PENDING").length,
        processing: orders.filter(o => o.status === "PROCESSING").length,
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Order Fulfillment</h2>
                    <p className="text-muted-foreground mt-2">Monitor and manage customer purchases and delivery status.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchOrders} className="rounded-full h-11 px-6 gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Orders", value: stats.total, icon: ShoppingBag, color: "bg-blue-500" },
                    { label: "Pending", value: stats.pending, icon: Clock, color: "bg-amber-500" },
                    { label: "Processing", value: stats.processing, icon: RefreshCw, color: "bg-indigo-500" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-card border rounded-3xl p-6 flex items-center gap-5 shadow-sm"
                    >
                        <div className={`p-3.5 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}/20`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <h4 className="text-2xl font-bold">{stat.value}</h4>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-6">
                {/* Status filter tabs */}
                <div className="flex flex-wrap gap-2 bg-muted/30 p-1.5 rounded-2xl w-fit border">
                    {["ALL", ...STATUS_OPTIONS].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === s
                                ? "bg-card text-foreground shadow-sm scale-[1.02]"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {s} {s !== "ALL" && <span className="ml-1 opacity-50 px-1.5 py-0.5 bg-muted rounded-md">{orders.filter(o => o.status === s).length}</span>}
                        </button>
                    ))}
                </div>

                <div className="bg-card border rounded-[32px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b bg-muted/10">
                                    <th className="h-14 px-6 font-bold text-foreground">Order Ref</th>
                                    <th className="h-14 px-6 font-bold text-foreground">Customer</th>
                                    <th className="h-14 px-6 font-bold text-foreground">Items</th>
                                    <th className="h-14 px-6 font-bold text-foreground text-right">Amount</th>
                                    <th className="h-14 px-6 font-bold text-foreground text-center">Status</th>
                                    <th className="h-14 px-6 font-bold text-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="p-4"><div className="h-12 bg-muted/40 rounded-2xl" /></td>
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
                                                className="group hover:bg-muted/20 transition-colors"
                                            >
                                                <td className="px-6 py-5">
                                                    <span className="font-mono text-[11px] font-bold bg-muted px-2 py-1 rounded text-muted-foreground">#{(order.id || "").slice(-8).toUpperCase()}</span>
                                                    <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-foreground">{order.user?.name || "Anonymous"}</p>
                                                    <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                                        <Package className="h-3.5 w-3.5" />
                                                        {order.items?.reduce((s, i) => s + i.quantity, 0) || 0} units
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <p className="font-black text-foreground">${(order.totalAmount || 0).toFixed(2)}</p>
                                                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Paid</p>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${STATUS_COLORS[order.status] || "bg-muted text-muted-foreground"}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={order.status}
                                                            onChange={e => handleStatusChange(order.id, e.target.value)}
                                                            className="appearance-none text-[11px] font-bold border-2 rounded-xl px-4 py-2 pr-9 bg-background cursor-pointer hover:border-primary/50 transition-all focus:outline-none focus:ring-4 focus:ring-primary/10"
                                                        >
                                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-24 text-center">
                                                <div className="max-w-[200px] mx-auto opacity-40">
                                                    <ShoppingBag className="h-12 w-12 mx-auto mb-4" />
                                                    <p className="text-sm font-bold">No orders found</p>
                                                    <p className="text-xs mt-1">Try adjusting your status filter.</p>
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
        </div>
    );
}

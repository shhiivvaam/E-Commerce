"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

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
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId: string, status: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            toast.success("Status updated");
        } catch {
            toast.error("Failed to update status");
        }
    };

    const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                    <p className="text-muted-foreground mt-1">{orders.length} total orders</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchOrders} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-2">
                {["ALL", ...STATUS_OPTIONS].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        {s} {s !== "ALL" && `(${orders.filter(o => o.status === s).length})`}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border bg-card shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="border-b bg-muted/30">
                        <tr>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Order ID</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Customer</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Items</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-right">Total</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-center">Status</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-center">Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="border-b">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <td key={j} className="p-4"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.map(order => (
                            <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                                <td className="p-4 font-mono text-xs text-muted-foreground">{order.id.slice(0, 12)}…</td>
                                <td className="p-4">
                                    <p className="font-medium">{order.user?.name ?? "Customer"}</p>
                                    <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {order.items?.reduce((s, i) => s + i.quantity, 0) ?? "—"} items
                                </td>
                                <td className="p-4 text-right font-semibold">${(order.totalAmount ?? 0).toFixed(2)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] ?? ""}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="relative inline-block">
                                        <select
                                            value={order.status}
                                            onChange={e => handleStatusChange(order.id, e.target.value)}
                                            className="appearance-none text-xs border rounded-lg px-3 py-1.5 pr-7 bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No orders found.</div>
                )}
            </div>
        </div>
    );
}

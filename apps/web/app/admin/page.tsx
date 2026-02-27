"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Package, Clock, Users, ArrowUpRight, TrendingUp, Activity } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        pendingOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState<{ id: string; user: { email: string; name?: string }; totalAmount: number; status: string; createdAt: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats({
                    totalRevenue: data.totalRevenue,
                    totalOrders: data.totalOrders,
                    totalProducts: data.totalProducts,
                    totalUsers: data.totalUsers || 0,
                    pendingOrders: data.statusCounts?.find((sc: { status: string; _count: number }) => sc.status === "PENDING")?._count || 0,
                });
                setRecentOrders(data.recentOrders || []);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const kpis = [
        { title: "Net Revenue", value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "bg-emerald-500", trend: "+12.5%" },
        { title: "Active Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-500", trend: "+3.2%" },
        { title: "Inventory", value: stats.totalProducts, icon: Package, color: "bg-indigo-500", trend: "Stable" },
        { title: "Customer Base", value: stats.totalUsers, icon: Users, color: "bg-rose-500", trend: "+24 today" },
    ];

    const STATUS_STYLING: Record<string, string> = {
        PENDING: "bg-amber-100 text-amber-700 border-amber-200",
        PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
        SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
        DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
        CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
    };

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">Admin Performance</h2>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Real-time health pulse of your digital commerce engine.</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live Network Stream</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative rounded-[32px] border-2 bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white ${kpi.color} shadow-lg shadow-black/5`}>
                                <kpi.icon className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black px-2 py-1 bg-muted rounded-full text-muted-foreground uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {kpi.trend}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-3xl font-black tracking-tighter">{loading ? "..." : kpi.value}</h4>
                            <p className="text-xs font-bold text-muted-foreground uppercase opacity-70 tracking-widest">{kpi.title}</p>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] rotate-12 transition-transform group-hover:scale-125 duration-700">
                            <kpi.icon className="h-24 w-24" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Visual Activity Chart (Placeholder style) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="lg:col-span-8 bg-card border-2 rounded-[40px] p-8 shadow-sm relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-black text-2xl uppercase tracking-tight flex items-center gap-3">
                                <TrendingUp className="h-6 w-6 text-primary" />
                                Sales Velocity
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground mt-1">Order volume distributed across the last 24 hours.</p>
                        </div>
                    </div>

                    {/* Fake Chart Visualization */}
                    <div className="h-64 flex items-end justify-between gap-1 w-full pb-2">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.random() * 80 + 10}%` }}
                                transition={{ delay: 0.5 + (i * 0.02), type: "spring", stiffness: 50 }}
                                className="w-full bg-primary/10 hover:bg-primary rounded-t-lg transition-all relative group cursor-crosshair"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 shadow-xl transition-opacity pointer-events-none">
                                    {(Math.random() * 10).toFixed(0)} Sales
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                        <span>Yesterday</span>
                        <span>Midday</span>
                        <span>Now</span>
                    </div>
                </motion.div>

                {/* Quick Actions Stream */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-4 bg-muted/10 border-2 border-dashed rounded-[40px] p-8 space-y-6"
                >
                    <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-3">
                        <Activity className="h-5 w-5 text-indigo-500" />
                        Control Hub
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { label: "Inventory Logic", href: "/admin/products", icon: Package, color: "text-purple-600" },
                            { label: "Dispatch Module", href: "/admin/orders", icon: ShoppingBag, color: "text-blue-600" },
                            { label: "Global Policies", href: "/admin/settings", icon: DollarSign, color: "text-emerald-600" },
                            { label: "Auth & Access", href: "/admin/customers", icon: Users, color: "text-rose-600" },
                        ].map((action, i) => (
                            <Link key={action.href} href={action.href}
                                className="flex items-center gap-4 p-4 rounded-3xl bg-card border-2 border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group scale-100 active:scale-95">
                                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center bg-muted group-hover:bg-primary group-hover:text-white transition-colors ${action.color}`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-tight">{action.label}</span>
                                <ArrowUpRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Latest Transaction Stream */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="lg:col-span-12 bg-card border-2 rounded-[40px] p-8 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-2xl uppercase tracking-tight">Recent Transaction Stream</h3>
                        <Link href="/admin/orders" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Full Log →</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-[32px]" />
                            ))
                        ) : recentOrders.length > 0 ? recentOrders.map((order, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + (i * 0.05) }}
                                key={order.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[24px] border-2 border-transparent hover:border-muted-foreground/10 hover:bg-muted/5 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground font-black text-xs uppercase group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                        #{(order.id || "").slice(-4)}
                                    </div>
                                    <div>
                                        <p className="font-black text-base leading-none">{order.user?.name || "Independent Buyer"}</p>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">{order.user?.email}</p>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                                    <div>
                                        <p className="text-lg font-black tracking-tighter text-right">${(order.totalAmount || 0).toFixed(2)}</p>
                                        <p className="text-[10px] text-muted-foreground text-right uppercase font-bold tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${STATUS_STYLING[order.status] || "bg-muted"}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-center py-10 opacity-40">
                                <Clock className="h-12 w-12 mx-auto mb-4" />
                                <p className="font-black uppercase tracking-widest">No Activity Stream Detected</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

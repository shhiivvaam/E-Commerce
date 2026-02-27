"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, RefreshCw, Pencil, Package, AlertTriangle, CheckCircle, ExternalLink, Clock, Zap } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Product {
    id: string;
    title: string;
    price: number;
    stock: number;
    category?: { name: string };
    gallery: string[];
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        outOfStock: 0,
        lowStock: 0
    });

    const fetchProducts = async (q = "") => {
        setLoading(true);
        try {
            const { data } = await api.get(`/products?limit=100${q ? `&search=${encodeURIComponent(q)}` : ""}`);
            setProducts(data.products);

            if (!q) {
                const { data: adminStats } = await api.get('/admin/stats');
                setStats({
                    total: adminStats.totalProducts,
                    outOfStock: adminStats.outOfStockCount,
                    lowStock: adminStats.lowStockCount
                });
            } else {
                setStats({
                    total: data.total,
                    outOfStock: data.products.filter((p: Product) => p.stock === 0).length,
                    lowStock: data.products.filter((p: Product) => p.stock > 0 && p.stock < 10).length
                });
            }
        } catch {
            toast.error("Failed to synchronize product catalog");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("This action is irreversible. Permanently purge this product from the database?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success("Product successfully removed");
            fetchProducts(search);
        } catch {
            toast.error("Critical: Deletion request failed");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts(search);
    };

    return (
        <div className="space-y-16 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-black/10 dark:bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Inventory Engine</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-black dark:text-white">Catalog <br />Intelligence</h2>
                    <p className="text-lg font-medium text-slate-400 dark:text-slate-500 italic max-w-xl">Manage, track, and deploy your sovereign product manifest across the platform.</p>
                </div>
                <div className="flex gap-4 pt-4">
                    <Button variant="outline" size="icon" onClick={() => fetchProducts(search)} className="rounded-2xl h-16 w-16 border-4 border-slate-50 dark:border-slate-800 active:scale-90 transition-all">
                        <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Link href="/admin/products/new">
                        <Button className="rounded-[24px] h-16 px-10 gap-4 shadow-2xl shadow-primary/20 font-black uppercase tracking-[0.2em] text-[11px] active:scale-95 transition-all">
                            <Plus className="h-5 w-5" /> Initialize Product
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Catalog Health KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Total Catalog", value: stats.total, icon: Package, color: "bg-blue-600 dark:bg-blue-500" },
                    { label: "Critical Stock", value: stats.outOfStock, icon: AlertTriangle, color: "bg-rose-600 dark:bg-rose-500", sub: "Purged Items" },
                    { label: "Replenish Soon", value: stats.lowStock, icon: Zap, color: "bg-amber-600 dark:bg-amber-500", sub: "Under 10 Units" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white dark:bg-[#0a0a0a] border-4 border-slate-50 dark:border-slate-800 rounded-[40px] p-10 flex items-center gap-8 shadow-sm transition-all hover:shadow-2xl"
                    >
                        <div className={`h-20 w-20 rounded-[28px] ${stat.color} text-white flex items-center justify-center shadow-2xl`}>
                            <stat.icon className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em] italic mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-3">
                                <h4 className="text-5xl font-black tracking-tighter text-black dark:text-white">{stat.value}</h4>
                                {stat.sub && <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{stat.sub}</span>}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border-4 border-slate-50 dark:border-slate-800 rounded-[56px] overflow-hidden shadow-2xl transition-colors">
                <div className="p-10 border-b-4 border-slate-50 dark:border-slate-900 flex flex-col md:flex-row gap-8 items-center justify-between bg-slate-50/30 dark:bg-white/5">
                    <form onSubmit={handleSearch} className="relative w-full md:max-w-xl group">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 dark:text-slate-700 transition-colors group-focus-within:text-primary" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="QUERY MANIFEST SIGNATURE..."
                            className="pl-20 h-20 bg-white dark:bg-black rounded-[30px] border-4 dark:border-slate-800 text-xs font-black uppercase tracking-widest focus-visible:ring-primary/20 transition-all"
                        />
                    </form>
                    <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] italic">
                        <span>LATEST SYNC: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/5 border-b-4 border-slate-50 dark:border-slate-900">
                                <th className="h-20 px-10 font-black text-black dark:text-white uppercase text-[10px] tracking-[0.4em] text-left">Product Entity</th>
                                <th className="h-20 px-10 font-black text-black dark:text-white uppercase text-[10px] tracking-[0.4em] text-left">Classification</th>
                                <th className="h-20 px-10 font-black text-black dark:text-white uppercase text-[10px] tracking-[0.4em] text-right">Liability</th>
                                <th className="h-20 px-10 font-black text-black dark:text-white uppercase text-[10px] tracking-[0.4em] text-center">Stock status</th>
                                <th className="h-20 px-10 font-black text-black dark:text-white uppercase text-[10px] tracking-[0.4em] text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-slate-50 dark:divide-slate-900">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-10"><div className="h-24 bg-slate-50 dark:bg-slate-900/50 rounded-[40px]" /></td>
                                    </tr>
                                ))
                            ) : products.length > 0 ? (
                                products.map(p => (
                                    <motion.tr
                                        layout
                                        key={p.id}
                                        className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                    >
                                        <td className="px-10 py-10">
                                            <div className="flex items-center gap-8">
                                                <div className="h-24 w-24 rounded-[32px] bg-slate-50 dark:bg-black overflow-hidden border-4 border-slate-100 dark:border-slate-800 group-hover:border-primary/20 transition-all flex-shrink-0 shadow-inner">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={p.gallery?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop'}
                                                        alt={p.title}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                                    />
                                                </div>
                                                <div className="min-w-0 space-y-2">
                                                    <p className="font-black text-xl text-black dark:text-white leading-tight uppercase tracking-tight truncate">{p.title}</p>
                                                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] italic">Node: {p.id.slice(-12).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10">
                                            <span className="inline-flex items-center px-5 py-2 bg-slate-100 dark:bg-white/5 border-2 border-slate-100 dark:border-slate-800 rounded-full text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] italic">
                                                {p.category?.name || "UNCLASSIFIED"}
                                            </span>
                                        </td>
                                        <td className="px-10 py-10 text-right font-black text-3xl text-black dark:text-white tracking-tighter tabular-nums">
                                            ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-10 py-10 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-sm transition-colors ${p.stock === 0
                                                    ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-950/30"
                                                    : p.stock < 10
                                                        ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-950/30"
                                                        : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/30"
                                                    }`}>
                                                    {p.stock === 0 ? <AlertTriangle className="h-4 w-4" /> : p.stock < 10 ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                    {p.stock === 0 ? "MANIFEST PURGED" : p.stock < 10 ? "CRITICAL LOAD" : "NOMINAL LOAD"}
                                                </span>
                                                <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest italic">{p.stock} UNITS IN GRID</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 text-right">
                                            <div className="flex justify-end gap-3">
                                                <Link href={`/products/${p.id}`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-300 dark:text-slate-700 hover:text-primary">
                                                        <ExternalLink className="h-6 w-6" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/products/${p.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-300 dark:text-slate-700 hover:text-black dark:hover:text-white">
                                                        <Pencil className="h-6 w-6" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-14 w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 hover:border-rose-100 dark:hover:border-rose-950/20 transition-all"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    <Trash2 className="h-6 w-6" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-40 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-8">
                                            <div className="h-24 w-24 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-100 dark:text-slate-900 border-2 border-slate-50 dark:border-slate-900">
                                                <Package className="h-12 w-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-3xl font-black uppercase tracking-tighter text-black dark:text-white">Manifest Empty</h4>
                                                <p className="text-sm font-medium text-slate-400 dark:text-slate-600 italic">No products detected in the current query stream.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

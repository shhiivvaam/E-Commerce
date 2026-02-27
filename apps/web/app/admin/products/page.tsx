"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, RefreshCw, Pencil, Package, AlertTriangle, CheckCircle, ExternalLink, MoreVertical, Clock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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

            // If it's the initial load, we can also grab global stats from the admin endpoint
            if (!q) {
                const { data: adminStats } = await api.get('/admin/stats');
                setStats({
                    total: adminStats.totalProducts,
                    outOfStock: adminStats.outOfStockCount,
                    lowStock: adminStats.lowStockCount
                });
            } else {
                // Approximate for the searched set
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
            // Refresh stats
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
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">Inventory Engine</h2>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Manage, track, and deploy your product catalog across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => fetchProducts(search)} className="rounded-2xl h-12 w-12 border-2 active:scale-90 transition-transform">
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Link href="/admin/products/new">
                        <Button className="rounded-2xl h-12 px-8 gap-3 shadow-xl shadow-primary/20 font-bold active:scale-95 transition-transform">
                            <Plus className="h-5 w-5" /> New Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Catalog Health KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Catalog", value: stats.total, icon: Package, color: "bg-blue-500" },
                    { label: "Critical Stock", value: stats.outOfStock, icon: AlertTriangle, color: "bg-rose-500", sub: "Out of Stock" },
                    { label: "Replenish Soon", value: stats.lowStock, icon: RefreshCw, color: "bg-amber-500", sub: "Below 10 units" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-card border-2 rounded-[32px] p-6 flex items-center gap-5 shadow-sm"
                    >
                        <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg shadow-black/5`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-3xl font-black">{stat.value}</h4>
                                {stat.sub && <span className="text-[10px] font-bold text-muted-foreground">{stat.sub}</span>}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-card border-2 rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-6 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/5">
                    <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find products by name, ID or SKU..."
                            className="pl-12 h-12 bg-background rounded-2xl border-2 focus-visible:ring-primary/20"
                        />
                    </form>
                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <span>Latest Update: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-muted/10">
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest">Product Entity</th>
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest">Category</th>
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-right">Pricing</th>
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-center">Stock status</th>
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-muted/10">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-4"><div className="h-20 bg-muted/40 rounded-3xl" /></td>
                                    </tr>
                                ))
                            ) : products.length > 0 ? (
                                products.map(p => (
                                    <motion.tr
                                        layout
                                        key={p.id}
                                        className="group hover:bg-muted/5 transition-colors"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 rounded-2xl bg-muted overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all flex-shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={p.gallery?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop'}
                                                        alt={p.title}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-base text-foreground leading-tight truncate">{p.title}</p>
                                                    <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">ID: {p.id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">
                                                {p.category?.name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-lg text-foreground">
                                            ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${p.stock === 0
                                                    ? "bg-rose-100 text-rose-800 border-rose-200"
                                                    : p.stock < 10
                                                        ? "bg-amber-100 text-amber-800 border-amber-200"
                                                        : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                    }`}>
                                                    {p.stock === 0 ? <AlertTriangle className="h-3 w-3" /> : p.stock < 10 ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                                    {p.stock === 0 ? "Purged" : p.stock < 10 ? "Critical" : "Stable"}
                                                </span>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-tighter">{p.stock} Units left</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/products/${p.id}`} target="_blank">
                                                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-2 hover:bg-muted group-hover:border-primary/20 transition-all">
                                                        <ExternalLink className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/products/${p.id}/edit`}>
                                                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-2 hover:bg-muted group-hover:border-primary/20 transition-all">
                                                        <Pencil className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-11 w-11 rounded-2xl border-2 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <Package className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
                                            <h4 className="text-xl font-black text-foreground/50 uppercase tracking-tighter">Manifest Empty</h4>
                                            <p className="text-sm text-muted-foreground mt-2">The search yields no recorded products. Create a new entry or adjust your query.</p>
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

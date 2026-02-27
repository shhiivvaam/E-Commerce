"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, RefreshCw, LayoutGrid, Target, DollarSign, Percent, Globe, Palette } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Settings {
    id: string;
    storeName?: string;
    storeMode: string;
    singleProductId?: string;
    taxRate?: number;
    shippingRate?: number;
    currency?: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        storeName: "",
        storeMode: "multi",
        singleProductId: "",
        taxRate: 0,
        shippingRate: 0,
        currency: "USD",
    });

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/settings');
            setSettings(data);
            setForm({
                storeName: data.storeName ?? "",
                storeMode: data.storeMode ?? "multi",
                singleProductId: data.singleProductId ?? "",
                taxRate: data.taxRate ?? 0,
                shippingRate: data.shippingRate ?? 0,
                currency: data.currency ?? "USD",
            });
        } catch {
            toast.error("Failed to load settings configuration");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                storeName: form.storeName || undefined,
                storeMode: form.storeMode,
                taxRate: form.taxRate,
                shippingRate: form.shippingRate,
                currency: form.currency,
            };
            if (form.storeMode === "single" && form.singleProductId) {
                payload.singleProductId = form.singleProductId;
            }
            const { data } = await api.patch('/settings', payload);
            setSettings(data);
            toast.success("Global settings synchronized successfully");
        } catch {
            toast.error("Failed to commit settings changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 max-w-4xl">
                <div className="h-20 bg-muted/40 animate-pulse rounded-[32px]" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-[400px] bg-muted/40 animate-pulse rounded-[32px]" />
                    <div className="h-[400px] bg-muted/40 animate-pulse rounded-[32px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">System Configuration</h2>
                    <p className="text-muted-foreground mt-2 text-lg">Define the global behavior, financial rates, and UI mode of your platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={fetchSettings} className="rounded-2xl h-12 w-12 border-2 active:scale-90 transition-transform">
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="rounded-2xl h-12 px-8 gap-3 shadow-xl shadow-primary/20 font-bold active:scale-95 transition-transform">
                        <Save className="h-5 w-5" />
                        {saving ? "Synchronizing..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Identity & Core Info */}
                <div className="lg:col-span-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border-2 rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <Globe className="h-64 w-64 rotate-12" />
                        </div>
                        <div className="flex-1 space-y-6 z-10">
                            <h3 className="text-2xl font-black uppercase flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-xl"><Globe className="h-5 w-5 text-primary" /></span>
                                Global Identity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Company / Store Name</label>
                                    <Input
                                        value={form.storeName}
                                        onChange={e => setForm({ ...form, storeName: e.target.value })}
                                        placeholder="e.g. Nexus E-Commerce"
                                        className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 text-lg font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Preferred Currency</label>
                                    <div className="relative">
                                        <select
                                            value={form.currency}
                                            onChange={e => setForm({ ...form, currency: e.target.value })}
                                            className="w-full h-14 border-2 rounded-2xl px-12 text-lg font-bold bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 appearance-none transition-all"
                                        >
                                            <option value="USD">USD — US Dollar ($)</option>
                                            <option value="EUR">EUR — Euro (€)</option>
                                            <option value="GBP">GBP — British Pound (£)</option>
                                            <option value="INR">INR — Indian Rupee (₹)</option>
                                        </select>
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Operations Mode */}
                <div className="lg:col-span-7">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card border-2 rounded-[32px] p-8 shadow-sm space-y-6 h-full"
                    >
                        <h3 className="text-2xl font-black uppercase flex items-center gap-3">
                            <span className="p-2 bg-amber-500/10 rounded-xl"><Target className="h-5 w-5 text-amber-500" /></span>
                            Store Architect
                        </h3>
                        <p className="text-muted-foreground font-medium leading-relaxed">Choose how customers interact with your products. Multi-mode showcases everything, while Single-mode forces a dedicated landing page for one item.</p>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: "multi", label: "Multi-Catalog", desc: "Full browseable store", icon: LayoutGrid },
                                { id: "single", label: "Single-Landing", desc: "Targeted product focus", icon: Target },
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setForm({ ...form, storeMode: mode.id })}
                                    className={`relative p-6 rounded-3xl border-2 text-left transition-all group overflow-hidden ${form.storeMode === mode.id
                                        ? "border-primary bg-primary/5 shadow-inner"
                                        : "hover:border-primary/20 bg-muted/20 border-transparent text-muted-foreground grayscale hover:grayscale-0"}`}
                                >
                                    <mode.icon className={`h-8 w-8 mb-4 transition-transform group-hover:scale-110 ${form.storeMode === mode.id ? "text-primary" : ""}`} />
                                    <p className="font-black uppercase tracking-tight text-foreground">{mode.label}</p>
                                    <p className="text-xs font-medium opacity-70 mt-1">{mode.desc}</p>
                                    {form.storeMode === mode.id && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-ping" />}
                                </button>
                            ))}
                        </div>

                        {form.storeMode === "single" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4 pt-4 border-t-2 border-dashed"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Target Product UUID</label>
                                    <Input
                                        value={form.singleProductId}
                                        onChange={e => setForm({ ...form, singleProductId: e.target.value })}
                                        placeholder="Paste the product ID here..."
                                        className="h-14 rounded-2xl border-2 border-primary/20 bg-primary/5 font-mono text-xs font-bold leading-normal focus-visible:ring-primary/40"
                                    />
                                    <p className="text-[10px] text-muted-foreground text-center font-bold">All homepage traffic will redirect to this product's detail page.</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Fiscal & Shipping */}
                <div className="lg:col-span-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card border-2 rounded-[32px] p-8 shadow-sm space-y-8 h-full"
                    >
                        <h3 className="text-2xl font-black uppercase flex items-center gap-3">
                            <span className="p-2 bg-emerald-500/10 rounded-xl"><DollarSign className="h-5 w-5 text-emerald-500" /></span>
                            Economic Rates
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sales Tax Rate</label>
                                    <span className="text-lg font-black text-emerald-600">{form.taxRate}%</span>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number" min={0} max={100} step={0.01}
                                        value={form.taxRate}
                                        onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                                        className="h-14 pl-12 rounded-2xl border-2 text-lg font-black"
                                    />
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t-2 border-muted/20">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Flat Delivery Fee</label>
                                    <span className="text-lg font-black text-primary">{form.currency} {form.shippingRate.toFixed(2)}</span>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number" min={0} step={0.01}
                                        value={form.shippingRate}
                                        onChange={e => setForm({ ...form, shippingRate: parseFloat(e.target.value) || 0 })}
                                        className="h-14 pl-12 rounded-2xl border-2 text-lg font-black"
                                    />
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/20 border-2 border-dashed rounded-2xl">
                            <p className="text-[10px] font-bold text-muted-foreground leading-tight uppercase tracking-tighter">Note: These rates are applied globally during the automated checkout calculation process.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

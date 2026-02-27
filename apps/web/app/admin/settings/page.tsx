"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, RefreshCw, LayoutGrid, Target, DollarSign, Percent, Globe, Zap, Shield, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
            toast.error("Failed to recover system configuration");
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
            toast.success("Global parameters synchronized");
        } catch {
            toast.error("Protocol commit rejected");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-12 max-w-5xl">
                <div className="h-32 bg-slate-50/50 dark:bg-white/5 animate-pulse rounded-[48px] border-4 border-slate-50 dark:border-slate-900" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="h-[500px] bg-slate-50/50 dark:bg-white/5 animate-pulse rounded-[56px] border-4 border-slate-50 dark:border-slate-900" />
                    <div className="h-[500px] bg-slate-50/50 dark:bg-white/5 animate-pulse rounded-[56px] border-4 border-slate-50 dark:border-slate-900" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-16 pb-20 max-w-6xl transition-colors duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-black/10 dark:bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">System Core</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-black dark:text-white">Global <br />Parameters</h2>
                    <p className="text-lg font-medium text-slate-400 dark:text-slate-500 italic max-w-xl">Architect the global behavior, financial manifestations, and interface modes of your ecosystem.</p>
                </div>
                <div className="flex gap-4 pt-4">
                    <Button variant="outline" size="icon" onClick={fetchSettings} className="rounded-2xl h-16 w-16 border-4 border-slate-50 dark:border-slate-800 active:scale-95 transition-all">
                        <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="rounded-[24px] h-16 px-10 gap-4 shadow-2xl shadow-primary/20 font-black uppercase tracking-[0.2em] text-[11px] active:scale-95 transition-all">
                        <Save className="h-5 w-5" />
                        {saving ? "SYCHRONIZING..." : "Save Configuration"}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Identity & Core Info */}
                <div className="lg:col-span-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#0a0a0a] border-4 border-slate-50 dark:border-slate-800 rounded-[56px] p-12 shadow-sm relative overflow-hidden transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none dark:invert">
                            <Globe className="h-64 w-64 rotate-12" />
                        </div>
                        <div className="flex-1 space-y-10 z-10 relative">
                            <h3 className="text-3xl font-black uppercase flex items-center gap-4 text-black dark:text-white">
                                <span className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20"><Globe className="h-7 w-7 text-primary" /></span>
                                Global Identity manifest
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 ml-2 italic">Entity Designation (Store Name)</label>
                                    <Input
                                        value={form.storeName}
                                        onChange={e => setForm({ ...form, storeName: e.target.value })}
                                        placeholder="E.G. NEXUS COMMAND"
                                        className="h-20 rounded-[28px] bg-slate-50 dark:bg-black border-4 border-slate-50 dark:border-slate-800 text-2xl font-black uppercase tracking-tighter focus-visible:ring-primary/20 transition-all px-10 text-black dark:text-white"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 ml-2 italic">Standard Settlement Currency</label>
                                    <div className="relative group">
                                        <select
                                            value={form.currency}
                                            onChange={e => setForm({ ...form, currency: e.target.value })}
                                            className="w-full h-20 border-4 border-slate-50 dark:border-slate-800 rounded-[28px] px-16 text-xl font-black bg-slate-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 appearance-none transition-all uppercase tracking-widest outline-none"
                                        >
                                            <option value="USD">USD — DOLLAR ($)</option>
                                            <option value="EUR">EUR — EURO (€)</option>
                                            <option value="GBP">GBP — POUND (£)</option>
                                            <option value="INR">INR — RUPEE (₹)</option>
                                        </select>
                                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 dark:text-slate-700 pointer-events-none group-hover:text-primary transition-colors" />
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 dark:text-slate-700 pointer-events-none group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Operations Mode */}
                <div className="lg:col-span-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#0a0a0a] border-4 border-slate-50 dark:border-slate-800 rounded-[56px] p-12 shadow-sm space-y-10 relative overflow-hidden transition-colors"
                    >
                        <h3 className="text-3xl font-black uppercase flex items-center gap-4 text-black dark:text-white">
                            <span className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/20"><Target className="h-7 w-7 text-amber-500" /></span>
                            Ecosystem Architect
                        </h3>
                        <p className="text-slate-400 dark:text-slate-600 font-bold leading-relaxed italic max-w-2xl px-2">Define the operational interaction protocol. Multi-Catalog provides a sovereign browseable manifest, while Single-Protocol forces focused landing injection for a specific asset.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { id: "multi", label: "Multi-Catalog Protocol", desc: "Full sovereign manifest access", icon: LayoutGrid, color: "text-blue-500" },
                                { id: "single", label: "Single-Asset Protocol", desc: "Targeted landing page injection", icon: Target, color: "text-amber-500" },
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setForm({ ...form, storeMode: mode.id })}
                                    className={`relative p-10 rounded-[40px] border-4 text-left transition-all group overflow-hidden ${form.storeMode === mode.id
                                        ? "border-primary bg-primary/5 dark:bg-primary/5 shadow-2xl"
                                        : "border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-black/50 grayscale hover:grayscale-0 hover:border-primary/20"}`}
                                >
                                    <div className={`h-16 w-16 mb-6 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${form.storeMode === mode.id ? "bg-primary text-white" : "bg-white dark:bg-black text-slate-300 dark:text-slate-700"}`}>
                                        <mode.icon className="h-8 w-8" />
                                    </div>
                                    <p className={`font-black uppercase tracking-tight text-3xl transition-colors ${form.storeMode === mode.id ? "text-black dark:text-white" : "text-slate-300 dark:text-slate-700"}`}>{mode.label}</p>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-40 mt-3 italic">{mode.desc}</p>
                                    {form.storeMode === mode.id && <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]" />}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {form.storeMode === "single" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-6 pt-10 border-t-4 border-dashed border-slate-50 dark:border-slate-900 overflow-hidden"
                                >
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary ml-2 italic">Target Asset Signature (Product ID)</label>
                                        <Input
                                            value={form.singleProductId}
                                            onChange={e => setForm({ ...form, singleProductId: e.target.value })}
                                            placeholder="PASTE PRODUCT ID SIGNATURE..."
                                            className="h-20 rounded-[28px] bg-primary/5 border-4 border-primary/20 text-xs font-black tracking-widest focus-visible:ring-primary/40 transition-all px-10 text-primary"
                                        />
                                        <div className="flex items-center gap-3 justify-center text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest italic group">
                                            <Zap className="h-4 w-4 animate-pulse text-amber-500" />
                                            Active Redirection Protocol: All homepage traffic will inject into this specific asset manifest.
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Fiscal & Shipping */}
                <div className="lg:col-span-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-[#0a0a0a] border-4 border-slate-50 dark:border-slate-800 rounded-[56px] p-12 shadow-sm space-y-12 relative overflow-hidden transition-colors"
                    >
                        <h3 className="text-3xl font-black uppercase flex items-center gap-4 text-black dark:text-white">
                            <span className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20"><DollarSign className="h-7 w-7 text-emerald-500" /></span>
                            Economic Metrics
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 italic">Sales Tax Threshold</label>
                                    <span className="text-3xl font-black text-emerald-500 tabular-nums">{form.taxRate}%</span>
                                </div>
                                <div className="relative group">
                                    <Input
                                        type="number" min={0} max={100} step={0.01}
                                        value={form.taxRate}
                                        onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                                        className="h-20 pl-20 rounded-[28px] bg-slate-50 dark:bg-black border-4 border-slate-50 dark:border-slate-800 text-3xl font-black tabular-nums focus-visible:ring-primary/20 transition-all text-black dark:text-white"
                                    />
                                    <Percent className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-100 dark:text-slate-900 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest italic px-2">Global taxation manifest applied to all checkout sequences.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 italic">Static Logistics Fee</label>
                                    <span className="text-3xl font-black text-primary tabular-nums">{form.currency} {form.shippingRate.toFixed(2)}</span>
                                </div>
                                <div className="relative group">
                                    <Input
                                        type="number" min={0} step={0.01}
                                        value={form.shippingRate}
                                        onChange={e => setForm({ ...form, shippingRate: parseFloat(e.target.value) || 0 })}
                                        className="h-20 pl-20 rounded-[28px] bg-slate-50 dark:bg-black border-4 border-slate-50 dark:border-slate-800 text-3xl font-black tabular-nums focus-visible:ring-primary/20 transition-all text-black dark:text-white"
                                    />
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-100 dark:text-slate-900 group-focus-within:text-primary transition-colors" />
                                </div>
                                <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest italic px-2">Flat deployment liability for all physical assets.</p>
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50/50 dark:bg-black/50 border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[40px] flex items-center gap-6">
                            <Shield className="h-10 w-10 text-emerald-500 shrink-0" />
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 leading-relaxed uppercase tracking-[0.1em] italic">Operational Protocol: These Economic Metrics are applied with absolute priority during the automated checkout sequence and financial settlement phase.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

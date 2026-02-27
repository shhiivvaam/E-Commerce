"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, Trash2, Pencil, X, Package, Layers, Hash, Activity, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
    id: string;
    name: string;
    description?: string;
    slug: string;
    _count: { products: number };
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch { toast.error("Taxonomy synchronization failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        setSaving(true);
        try {
            if (editingId) {
                await api.patch(`/categories/${editingId}`, formData);
                toast.success("Classification metadata updated");
            } else {
                await api.post('/categories', formData);
                toast.success("New collection initialized");
            }
            setFormData({ name: "", description: "" });
            setShowForm(false);
            setEditingId(null);
            fetchCategories();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Protocol rejection");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("This action will disconnect all products from this taxonomy node. Proceed with deletion?")) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success("Taxonomy node purged");
            fetchCategories();
        } catch { toast.error("Deletion sequence failed"); }
    };

    const startEdit = (c: Category) => {
        setFormData({ name: c.name, description: c.description || "" });
        setEditingId(c.id);
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", description: "" });
    };

    const stats = {
        total: categories.length,
        avgDensity: categories.length > 0 ? (categories.reduce((s, c) => s + (c._count?.products || 0), 0) / categories.length).toFixed(1) : 0,
    };

    return (
        <div className="space-y-16 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-black/10 dark:bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Taxonomy Engine</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-black dark:text-white">Classification <br />Clusters</h2>
                    <p className="text-lg font-medium text-slate-400 dark:text-slate-500 italic max-w-xl">Architect your catalog hierarchy and navigational clusters across the ecosystem.</p>
                </div>
                <div className="flex gap-4 pt-4">
                    <Button
                        onClick={() => setShowForm(true)}
                        disabled={showForm}
                        className="rounded-[24px] h-16 px-10 gap-4 shadow-2xl shadow-primary/20 font-black uppercase tracking-[0.2em] text-[11px] active:scale-95 transition-all"
                    >
                        <Plus className="h-5 w-5" /> Initialize Node
                    </Button>
                </div>
            </header>

            {/* Taxonomy States */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Collection Nodes", value: stats.total, icon: Layers, color: "bg-blue-600 dark:bg-blue-500" },
                    { label: "Product Density", value: stats.avgDensity, icon: Activity, color: "bg-emerald-600 dark:bg-emerald-500", sub: "Items / Node" },
                    { label: "Operational Registry", value: "NOMINAL", icon: Zap, color: "bg-indigo-600 dark:bg-indigo-500" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
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

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-black border-4 border-primary/20 rounded-[56px] p-12 shadow-3xl space-y-12 relative overflow-hidden transition-colors">
                            <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none dark:invert">
                                <Layers className="h-64 w-64 rotate-12" />
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">{editingId ? "Modify Classification" : "New Taxonomy Entry"}</h3>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Protocol Override Active</p>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={cancelForm} className="rounded-2xl h-16 w-16 border-4 border-slate-100 dark:border-slate-800">
                                    <X className="h-8 w-8 text-black dark:text-white" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 ml-2 italic">Label Designation</label>
                                    <Input
                                        required
                                        placeholder="E.G. KINETIC WEAR"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="rounded-[28px] h-20 bg-slate-50 dark:bg-transparent border-4 border-slate-50 dark:border-slate-800 text-xl font-black uppercase tracking-widest focus-visible:ring-primary/20 transition-all px-10"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 ml-2 italic">Manifest Context (Optional)</label>
                                    <Input
                                        placeholder="DEFINE COLLECTIVE SCOPE..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="rounded-[28px] h-20 bg-slate-50 dark:bg-transparent border-4 border-slate-50 dark:border-slate-800 text-base font-bold uppercase tracking-widest transition-all px-10"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-6 pt-10 border-t-4 border-slate-50 dark:border-slate-900 relative z-10 mt-10">
                                <Button type="button" variant="ghost" onClick={cancelForm} className="rounded-[24px] h-16 px-12 font-black uppercase text-[11px] tracking-widest text-slate-400 dark:text-slate-600">Deactivate</Button>
                                <Button type="submit" disabled={saving} className="rounded-[24px] h-16 px-16 shadow-2xl shadow-primary/30 font-black uppercase text-[11px] tracking-widest min-w-[240px]">
                                    {saving ? "Processing..." : editingId ? "Commit Update" : "Establish Node"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-50/50 dark:bg-white/5 animate-pulse rounded-[48px] border-4 border-slate-50 dark:border-slate-900" />
                    ))
                ) : categories.length > 0 ? (
                    categories.map((c, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            layout
                            key={c.id}
                            className="group p-10 rounded-[48px] border-4 border-slate-50 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] transition-all hover:shadow-3xl hover:-translate-y-2 hover:border-primary/20 flex flex-col justify-between"
                        >
                            <div className="space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="h-16 w-16 bg-slate-50 dark:bg-black rounded-[24px] flex items-center justify-center text-slate-200 dark:text-slate-800 group-hover:bg-primary group-hover:text-white transition-all border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary/20 shadow-inner">
                                        <Hash className="h-8 w-8" />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(c)} className="h-12 w-12 rounded-2xl border-2 border-slate-50 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                                            <Pencil className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-12 w-12 rounded-2xl border-2 border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-700 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 hover:border-transparent transition-all">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white leading-none">{c.name}</h4>
                                    <div className="inline-block text-[9px] font-black bg-slate-50 dark:bg-black px-3 py-1 rounded-full text-slate-300 dark:text-slate-700 uppercase tracking-widest italic border-2 border-slate-100 dark:border-slate-900">REF: {c.slug}</div>
                                    <p className="text-xs text-slate-400 dark:text-slate-600 font-medium line-clamp-2 leading-relaxed mt-4 italic">{c.description || "No metadata description provided for this node."}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center justify-between border-t-2 border-slate-50 dark:border-slate-900 pt-8">
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] italic">
                                    <Package className="h-4 w-4 text-primary opacity-50" />
                                    {c._count?.products || 0} Registered Assets
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-60 text-center bg-slate-50/30 dark:bg-white/5 rounded-[64px] border-4 border-dashed border-slate-100 dark:border-slate-900 relative overflow-hidden transition-colors">
                        <Tag className="h-32 w-32 mx-auto text-slate-100 dark:text-slate-900 mb-10 opacity-50" />
                        <h3 className="text-4xl font-black uppercase tracking-[0.2em] text-slate-200 dark:text-slate-800">Taxonomy Void</h3>
                        <p className="text-sm font-black text-slate-300 dark:text-slate-700 mt-4 max-w-sm mx-auto italic uppercase tracking-widest leading-relaxed">No active classification nodes detected in the current directory stream.</p>
                        <Button
                            onClick={() => setShowForm(true)}
                            className="mt-12 rounded-[28px] h-20 px-16 font-black uppercase tracking-[0.2em] text-[11px] shadow-3xl"
                        >
                            Establish First Node
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

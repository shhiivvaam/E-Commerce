"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, Trash2, Pencil, X, Package, Layers, Hash, Activity } from "lucide-react";
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
        unallocated: 0 // In a real app we'd fetch this
    };

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight uppercase text-foreground">Taxonomy Engine</h2>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Architect your catalog hierarchy and navigational clusters.</p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    disabled={showForm}
                    className="gap-3 shrink-0 rounded-2xl h-12 px-8 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs transition-transform active:scale-95"
                >
                    <Plus className="h-4 w-4" /> Initialize Node
                </Button>
            </div>

            {/* Taxonomy States */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Collection Nodes", value: stats.total, icon: Layers, color: "bg-blue-600" },
                    { label: "Product Density", value: stats.avgDensity, icon: Activity, color: "bg-emerald-600", sub: "Items / Node" },
                    { label: "Operational Integrity", value: "Optimal", icon: Tag, color: "bg-indigo-600" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-card border-2 rounded-[32px] p-8 flex items-center gap-6 shadow-sm"
                    >
                        <div className={`p-4 rounded-[24px] ${stat.color} text-white shadow-xl shadow-black/5`}>
                            <stat.icon className="h-7 w-7" />
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

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="bg-card border-4 border-primary/10 rounded-[40px] p-8 md:p-10 shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                <Layers className="h-48 w-48 rotate-12" />
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{editingId ? "Modify Classification" : "New Taxonomy Entry"}</h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Protocol Override Active</p>
                                </div>
                                <Button type="button" variant="outline" size="icon" onClick={cancelForm} className="rounded-2xl h-12 w-12 border-2">
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Label Designation</label>
                                    <Input
                                        required
                                        placeholder="e.g. Kinetic Wear"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="rounded-2xl h-14 border-2 text-lg font-bold focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Manifest Context (Optional)</label>
                                    <Input
                                        placeholder="Define the scope of this collection..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="rounded-2xl h-14 border-2 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t-2 border-muted relative z-10">
                                <Button type="button" variant="ghost" onClick={cancelForm} className="rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest">Deactivate</Button>
                                <Button type="submit" disabled={saving} className="rounded-2xl h-12 px-10 shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest min-w-[180px]">
                                    {saving ? "Processing..." : editingId ? "Commit Update" : "Initialize Link"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 bg-muted/30 animate-pulse rounded-[32px] border-2" />
                    ))
                ) : categories.length > 0 ? (
                    categories.map((c, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            layout
                            key={c.id}
                            className="group p-8 rounded-[32px] border-2 border-slate-100 bg-card transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-primary/20 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Hash className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">{c.name}</h4>
                                            <div className="text-[9px] font-mono bg-muted/50 px-2 py-0.5 rounded text-muted-foreground uppercase mt-1 tracking-tighter">REF: {c.slug}</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed mt-2 italic">{c.description || "No metadata description provided."}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => startEdit(c)} className="h-10 w-10 rounded-xl border-2 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all active:scale-90">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleDelete(c.id)} className="h-10 w-10 rounded-xl border-2 text-muted-foreground hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all active:scale-90">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground bg-muted/10 px-4 py-2 rounded-2xl border-2 border-transparent group-hover:border-primary/5 transition-all uppercase tracking-widest">
                                    <Package className="h-3.5 w-3.5" />
                                    {c._count?.products || 0} Registered Assets
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center bg-muted/5 rounded-[48px] border-4 border-dashed border-muted relative overflow-hidden">
                        <Tag className="h-20 w-20 mx-auto text-muted-foreground mb-6 opacity-10" />
                        <h3 className="text-2xl font-black uppercase tracking-widest text-muted-foreground/50">Taxonomy Void</h3>
                        <p className="text-sm font-bold text-muted-foreground/40 mt-3 max-w-xs mx-auto italic uppercase tracking-tighter">No active classification nodes detected in the current directory.</p>
                        <Button
                            variant="secondary"
                            onClick={() => setShowForm(true)}
                            className="mt-10 rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-xs shadow-xl"
                        >
                            Establish First Node
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

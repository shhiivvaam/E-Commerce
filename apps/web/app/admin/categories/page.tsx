"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface Category {
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch { toast.error("Failed to load categories"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const { data } = await api.post('/categories', { name: newName.trim() });
            setCategories(prev => [...prev, data]);
            setNewName("");
            setAdding(false);
            toast.success("Category created");
        } catch { toast.error("Failed to create category"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category? Products in it won't be deleted.")) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success("Category deleted");
        } catch { toast.error("Failed to delete category"); }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                    <p className="text-muted-foreground mt-1">{categories.length} categories</p>
                </div>
                <Button onClick={() => setAdding(true)} disabled={adding} className="gap-2">
                    <Plus className="h-4 w-4" /> New Category
                </Button>
            </div>

            {adding && (
                <div className="border rounded-xl p-4 bg-card space-y-3">
                    <p className="text-sm font-semibold">Create Category</p>
                    <div className="flex gap-2">
                        <Input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. Electronics"
                            autoFocus
                            onKeyDown={e => e.key === "Enter" && handleAdd()}
                            className="flex-1"
                        />
                        <Button onClick={handleAdd} disabled={!newName.trim() || saving}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => { setAdding(false); setNewName(""); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="border-b bg-muted/30">
                        <tr>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Name</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Slug</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-right">Products</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="border-b">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <td key={j} className="p-4"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : categories.map(c => (
                            <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                                <td className="p-4 font-medium">{c.name}</td>
                                <td className="p-4 font-mono text-xs text-muted-foreground">{c.slug}</td>
                                <td className="p-4 text-right text-muted-foreground">{c._count?.products ?? 0}</td>
                                <td className="p-4 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(c.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && categories.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No categories yet.</div>
                )}
            </div>
        </div>
    );
}

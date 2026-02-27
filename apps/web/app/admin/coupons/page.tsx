"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface Coupon {
    id: string;
    code: string;
    discount: number;
    type: string;
    isActive: boolean;
    usageCount: number;
    maxUsage?: number;
    minCartTotal?: number;
    expiresAt?: string;
}

const EMPTY_FORM = { code: "", discount: 10, type: "PERCENTAGE", minCartTotal: 0, maxUsage: 100, expiresAt: "" };

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch { toast.error("Failed to load coupons"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleCreate = async () => {
        if (!form.code.trim()) { toast.error("Code is required"); return; }
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                code: form.code.toUpperCase(),
                discount: form.discount,
                type: form.type,
            };
            if (form.minCartTotal > 0) payload.minCartTotal = form.minCartTotal;
            if (form.maxUsage > 0) payload.maxUsage = form.maxUsage;
            if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();

            const { data } = await api.post('/coupons', payload);
            setCoupons(prev => [data, ...prev]);
            setAdding(false);
            setForm(EMPTY_FORM);
            toast.success(`Coupon ${data.code} created`);
        } catch { toast.error("Failed to create coupon"); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
                    <p className="text-muted-foreground mt-1">{coupons.length} coupons</p>
                </div>
                <Button onClick={() => setAdding(true)} disabled={adding} className="gap-2">
                    <Plus className="h-4 w-4" /> New Coupon
                </Button>
            </div>

            {adding && (
                <div className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
                    <p className="font-semibold">Create Coupon</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Code *</label>
                            <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-full h-9 border rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Discount {form.type === "PERCENTAGE" ? "(%)" : "($)"}
                            </label>
                            <Input type="number" min={1} value={form.discount} onChange={e => setForm({ ...form, discount: +e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Min Cart Total ($, optional)</label>
                            <Input type="number" min={0} value={form.minCartTotal} onChange={e => setForm({ ...form, minCartTotal: +e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Max Usage (0 = unlimited)</label>
                            <Input type="number" min={0} value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: +e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Expires At (optional)</label>
                            <Input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button variant="ghost" onClick={() => { setAdding(false); setForm(EMPTY_FORM); }}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!form.code.trim() || saving}>
                            <Check className="h-4 w-4 mr-1" /> Create
                        </Button>
                    </div>
                </div>
            )}

            <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="border-b bg-muted/30">
                        <tr>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Code</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Discount</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-right">Used</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Expires</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="border-b">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} className="p-4"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : coupons.map(c => (
                            <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                                <td className="p-4 font-mono font-bold tracking-wide">{c.code}</td>
                                <td className="p-4 font-semibold">
                                    {c.type === "PERCENTAGE" ? `${c.discount}%` : `$${c.discount}`}
                                    {c.minCartTotal ? <span className="text-xs text-muted-foreground font-normal ml-1">(min ${c.minCartTotal})</span> : null}
                                </td>
                                <td className="p-4 text-right text-muted-foreground">
                                    {c.usageCount}{c.maxUsage ? ` / ${c.maxUsage}` : ""}
                                </td>
                                <td className="p-4 text-muted-foreground text-sm">
                                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.isActive
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        }`}>
                                        {c.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && coupons.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No coupons yet.</div>
                )}
            </div>
        </div>
    );
}

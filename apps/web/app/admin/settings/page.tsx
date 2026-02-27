"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

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
            toast.error("Failed to load settings");
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
            toast.success("Settings saved");
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}</div>;
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Store Settings</h2>
                    <p className="text-muted-foreground mt-1">Configure your store behaviour and preferences.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchSettings} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="border rounded-xl bg-card shadow-sm divide-y">
                {/* Store Info */}
                <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-base">Store Information</h3>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Store Name</label>
                        <Input value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} placeholder="My Awesome Store" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Currency</label>
                        <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                            className="w-full h-9 border rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="USD">USD — US Dollar</option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="GBP">GBP — British Pound</option>
                            <option value="INR">INR — Indian Rupee</option>
                        </select>
                    </div>
                </div>

                {/* Store Mode */}
                <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-base">Store Mode</h3>
                    <p className="text-sm text-muted-foreground">Switch between displaying your full catalog or a single-product landing page.</p>
                    <div className="flex gap-3">
                        {["multi", "single"].map(mode => (
                            <button key={mode} onClick={() => setForm({ ...form, storeMode: mode })}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${form.storeMode === mode
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border text-muted-foreground hover:border-primary/50"
                                    }`}>
                                {mode === "multi" ? "🏪 Multi-Product" : "🎯 Single-Product"}
                            </button>
                        ))}
                    </div>
                    {form.storeMode === "single" && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Single Product ID</label>
                            <Input value={form.singleProductId} onChange={e => setForm({ ...form, singleProductId: e.target.value })} placeholder="Product ID to feature" />
                        </div>
                    )}
                </div>

                {/* Tax & Shipping */}
                <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-base">Tax & Shipping</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Tax Rate (%)</label>
                            <Input type="number" min={0} max={100} step={0.01}
                                value={form.taxRate}
                                onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Flat Shipping Rate ($)</label>
                            <Input type="number" min={0} step={0.01}
                                value={form.shippingRate}
                                onChange={e => setForm({ ...form, shippingRate: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[120px]">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Shield, ShieldOff, Search, RefreshCw, Users, UserCheck, UserX, Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface User {
    id: string;
    name?: string;
    email: string;
    deletedAt?: string | null;
    createdAt: string;
    role: { name: string };
    _count: { orders: number };
}

export default function AdminCustomersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");

    const fetchUsers = async (q = "") => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users?limit=50${q ? `&search=${encodeURIComponent(q)}` : ""}`);
            setUsers(data.users || []);
            setTotal(data.total || 0);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handleToggleBlock = async (id: string, isBlocked: boolean) => {
        const action = isBlocked ? "Unblock" : "Block";
        if (!confirm(`${action} this user? Account access will be restricted immediately.`)) return;
        try {
            const { data } = await api.patch(`/users/${id}/block`);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, deletedAt: data.deletedAt } : u));
            toast.success(`User successfully ${isBlocked ? "unblocked" : "blocked"}`);
        } catch {
            toast.error("Failed to update user status");
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const { data } = await api.patch(`/users/${id}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: data.role } : u));
            toast.success(`Role elevated to ${newRole}`);
        } catch {
            toast.error("Failed to change user role");
        }
    };

    const stats = {
        total: total,
        active: users.filter(u => !u.deletedAt).length,
        blocked: users.filter(u => !!u.deletedAt).length,
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground mt-2">Oversee registered accounts, assign administrative roles, and manage access.</p>
                </div>
                <Button variant="outline" onClick={() => fetchUsers(search)} className="rounded-full h-11 px-6 gap-2 border-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Registered Users", value: total, icon: Users, color: "bg-primary" },
                    { label: "Active Accounts", value: stats.active, icon: UserCheck, color: "bg-emerald-500" },
                    { label: "Restricted", value: stats.blocked, icon: UserX, color: "bg-rose-500" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-card border-2 rounded-3xl p-6 flex items-center gap-5 shadow-sm"
                    >
                        <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg shadow-black/5`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <h4 className="text-3xl font-black">{stat.value}</h4>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-card border-2 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-6 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/5">
                    <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find matches in names or emails..."
                            className="pl-12 h-12 bg-background rounded-2xl border-2 focus-visible:ring-primary/20"
                        />
                    </form>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Showing up to 50 active records
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-muted/10">
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest">Subscriber</th>
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest">Authorization</th>
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-center">Engagement</th>
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-center">Status</th>
                                <th className="h-14 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-muted/10">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-4"><div className="h-16 bg-muted/40 rounded-3xl" /></td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map(u => {
                                    const isBlocked = !!u.deletedAt;
                                    return (
                                        <tr key={u.id} className={`group hover:bg-muted/5 transition-all ${isBlocked ? "bg-rose-50/10" : ""}`}>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border-2 border-primary/10">
                                                        {(u.name?.[0] || u.email[0]).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-base text-foreground leading-none">{u.name || "Identified User"}</p>
                                                        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="text-xs font-medium">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={u.role?.name || "CUSTOMER"}
                                                        onChange={e => handleRoleChange(u.id, e.target.value)}
                                                        className="appearance-none text-[11px] font-black border-2 rounded-xl px-4 py-2 pr-9 bg-background cursor-pointer hover:border-primary/50 transition-all focus:ring-4 focus:ring-primary/10"
                                                    >
                                                        <option value="CUSTOMER">CUSTOMER</option>
                                                        <option value="ADMIN">ADMINISTRATOR</option>
                                                    </select>
                                                    <MoreHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-lg font-black text-foreground">{u._count?.orders || 0}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Placements</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${isBlocked
                                                    ? "bg-rose-100 text-rose-800 border-rose-200"
                                                    : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                    }`}>
                                                    {isBlocked ? "Blacklisted" : "Verified"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className={`h-11 w-11 rounded-2xl border-2 transition-transform active:scale-95 ${isBlocked ? "text-emerald-600 hover:bg-emerald-50 border-emerald-100" : "text-rose-600 hover:bg-rose-50 border-rose-100"}`}
                                                    onClick={() => handleToggleBlock(u.id, isBlocked)}
                                                    title={isBlocked ? "Reinstate Access" : "Revoke Access"}
                                                >
                                                    {isBlocked ? <Shield className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <Users className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
                                            <h4 className="text-xl font-black text-foreground/50 uppercase tracking-tighter">No users detected</h4>
                                            <p className="text-sm text-muted-foreground mt-2">Adjust your search parameters to find existing customer records.</p>
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

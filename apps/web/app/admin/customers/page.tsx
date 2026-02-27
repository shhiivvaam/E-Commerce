"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Shield, ShieldOff, Search, RefreshCw, Users, UserCheck, UserX, Mail, MoreHorizontal, X, MapPin, Calendar, ShoppingBag, ArrowUpRight, DollarSign, Activity, ChevronDown } from "lucide-react";
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
    orders?: any[];
    addresses?: any[];
}

export default function AdminCustomersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    const fetchUsers = async (q = "") => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users?limit=50${q ? `&search=${encodeURIComponent(q)}` : ""}`);
            setUsers(data.users || []);
            setTotal(data.total || 0);
        } catch {
            toast.error("Failed to load user segment");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetail = async (userId: string) => {
        setIsFetchingDetail(true);
        try {
            const { data } = await api.get(`/users/${userId}`);
            setSelectedUser(data);
        } catch {
            toast.error("User metadata recovery failed");
        } finally {
            setIsFetchingDetail(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handleToggleBlock = async (id: string, isBlocked: boolean) => {
        try {
            const { data } = await api.patch(`/users/${id}/block`);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, deletedAt: data.deletedAt } : u));
            if (selectedUser?.id === id) setSelectedUser({ ...selectedUser, deletedAt: data.deletedAt });
            toast.success(`Access ${isBlocked ? "reinstated" : "revoked"} for user`);
        } catch {
            toast.error("Access modification failed");
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const { data } = await api.patch(`/users/${id}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: data.role } : u));
            if (selectedUser?.id === id) setSelectedUser({ ...selectedUser, role: data.role });
            toast.success(`Privileges elevated to ${newRole}`);
        } catch {
            toast.error("Role reassignment rejected");
        }
    };

    const stats = {
        total: total,
        active: users.filter(u => !u.deletedAt).length,
        blocked: users.filter(u => !!u.deletedAt).length,
    };

    return (
        <div className="space-y-10 pb-12 relative min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">Identity Hub</h2>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Govern registered accounts, access permissions, and customer data.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchUsers(search)} className="rounded-2xl h-12 px-6 gap-2 border-2 active:scale-95 transition-transform">
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
                    </Button>
                </div>
            </div>

            {/* Account Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Population", value: total, icon: Users, color: "bg-indigo-600" },
                    { label: "Verified Active", value: stats.active, icon: UserCheck, color: "bg-emerald-600" },
                    { label: "Revoked Access", value: stats.blocked, icon: UserX, color: "bg-rose-600" },
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
                            <h4 className="text-4xl font-black">{stat.value}</h4>
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
                            placeholder="Find matches in name, email or ID..."
                            className="pl-12 h-12 bg-background rounded-2xl border-2 focus-visible:ring-primary/20"
                        />
                    </form>
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Live Directory Sync
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-muted/10 border-b-2">
                                <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-left">Subscriber Profile</th>
                                <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-left">Internal Access</th>
                                <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-center">Engagement</th>
                                <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-center">Protocol Status</th>
                                <th className="h-16 px-8 font-black text-foreground uppercase text-[10px] tracking-widest text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-muted/10">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-8"><div className="h-16 bg-muted/30 rounded-[28px]" /></td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map(u => {
                                    const isBlocked = !!u.deletedAt;
                                    return (
                                        <motion.tr
                                            layout
                                            key={u.id}
                                            className={`group hover:bg-muted/5 transition-all cursor-pointer ${isBlocked ? "opacity-70 bg-rose-50/10 grayscale" : ""}`}
                                            onClick={() => fetchUserDetail(u.id)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-14 w-14 rounded-[20px] bg-primary/10 flex items-center justify-center text-primary font-black text-xl border-2 border-primary/5 transition-all group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
                                                        {(u.name?.[0] || u.email[0]).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-base text-foreground leading-none">{u.name || "Identified User"}</p>
                                                        <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="text-[11px] font-bold uppercase tracking-tighter">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6" onClick={e => e.stopPropagation()}>
                                                <div className="relative inline-block">
                                                    <select
                                                        value={u.role?.name || "CUSTOMER"}
                                                        onChange={e => handleRoleChange(u.id, e.target.value)}
                                                        className="appearance-none text-[10px] font-black border-2 rounded-2xl px-5 py-2.5 pr-10 bg-background cursor-pointer hover:border-primary/50 transition-all uppercase tracking-widest"
                                                    >
                                                        <option value="CUSTOMER">CUSTOMER</option>
                                                        <option value="ADMIN">ADMINISTRATOR</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-xl font-black text-foreground tabular-nums">{u._count?.orders || 0}</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Successful Deals</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${isBlocked
                                                    ? "bg-rose-100 text-rose-800 border-rose-200"
                                                    : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                    }`}>
                                                    {isBlocked ? "Restricted" : "Active Node"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className={`h-12 w-12 rounded-2xl border-2 transition-transform active:scale-95 ${isBlocked ? "text-emerald-600 hover:bg-emerald-50 border-emerald-100" : "text-rose-600 hover:bg-rose-50 border-rose-100"}`}
                                                    onClick={() => handleToggleBlock(u.id, isBlocked)}
                                                >
                                                    {isBlocked ? <Shield className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center opacity-30">
                                        <div className="max-w-xs mx-auto">
                                            <Users className="h-16 w-16 mx-auto mb-6" />
                                            <h4 className="text-xl font-black uppercase tracking-widest">Directory Empty</h4>
                                            <p className="text-xs font-bold uppercase mt-2">No matches found for your current query.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Slide-over */}
            <AnimatePresence>
                {(selectedUser || isFetchingDetail) && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l-2 shadow-2xl z-[101] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-8 border-b-2 flex items-center justify-between bg-muted/5 relative">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-[28px] bg-primary text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-primary/20">
                                        {(selectedUser?.name?.[0] || selectedUser?.email?.[0] || '?').toUpperCase()}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">{selectedUser?.name || "Anonymous User"}</h3>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                            <p className="text-sm font-bold text-muted-foreground tracking-tighter">{selectedUser?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => setSelectedUser(null)} className="rounded-2xl h-12 w-12 border-2">
                                    <X className="h-6 w-6" />
                                </Button>
                                {isFetchingDetail && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20 animate-pulse overflow-hidden">
                                        <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-full origin-left scale-x-0" />
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Content */}
                            {selectedUser && (
                                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                                    {/* Action Bar */}
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex-1 min-w-[200px] bg-muted/10 border-2 rounded-3xl p-4 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Access Protocol</span>
                                            <Button
                                                onClick={() => handleToggleBlock(selectedUser.id, !!selectedUser.deletedAt)}
                                                className={`h-10 rounded-xl px-4 font-black uppercase text-[10px] tracking-widest ${selectedUser.deletedAt ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                                            >
                                                {selectedUser.deletedAt ? "Reinstate" : "Restrict"}
                                            </Button>
                                        </div>
                                        <div className="flex-1 min-w-[200px] bg-muted/10 border-2 rounded-3xl p-4 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Internal Rule</span>
                                            <select
                                                value={selectedUser.role?.name}
                                                onChange={e => handleRoleChange(selectedUser.id, e.target.value)}
                                                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none"
                                            >
                                                <option value="CUSTOMER">Customer</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Section: Professional KPIs */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-muted/10 rounded-[32px] p-8 border-2 space-y-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <ShoppingBag className="h-4 w-4" /> Lifetime Value
                                            </h4>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black tracking-tighter">${selectedUser.orders?.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2) || '0.00'}</span>
                                            </div>
                                        </div>
                                        <div className="bg-muted/10 rounded-[32px] p-8 border-2 space-y-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Calendar className="h-4 w-4" /> Service Age
                                            </h4>
                                            <p className="text-xl font-black uppercase tracking-tighter">
                                                {Math.floor((new Date().getTime() - new Date(selectedUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))} Days
                                            </p>
                                        </div>
                                    </div>

                                    {/* Section: Delivery Manifests */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                                            <Activity className="h-4 w-4" /> Transaction Log
                                        </h4>
                                        <div className="bg-card border-2 rounded-[32px] overflow-hidden">
                                            {selectedUser.orders && selectedUser.orders.length > 0 ? (
                                                <div className="divide-y-2">
                                                    {selectedUser.orders.map((order: any) => (
                                                        <div key={order.id} className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                                            <div>
                                                                <p className="font-black text-sm uppercase">#{(order.id || "").slice(-8).toUpperCase()}</p>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-black text-base text-primary">${order.totalAmount.toFixed(2)}</p>
                                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">{order.status}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-12 text-center opacity-30">
                                                    <p className="text-xs font-black uppercase tracking-widest">No transactions recorded.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section: Known Deployment Nodes */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                                            <MapPin className="h-4 w-4" /> Registered Nodes
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            {selectedUser.addresses && selectedUser.addresses.length > 0 ? selectedUser.addresses.map((addr: any) => (
                                                <div key={addr.id} className="p-6 bg-muted/10 border-2 rounded-3xl flex items-start gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center text-muted-foreground scale-90">
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black uppercase tracking-tight leading-none">{addr.street}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{addr.city}, {addr.state} {addr.zipCode}</p>
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 mt-1">{addr.country}</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="p-12 bg-muted/5 border-2 border-dashed rounded-[32px] text-center opacity-30">
                                                    <p className="text-xs font-black uppercase tracking-widest">No address metadata found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="p-8 border-t-2 bg-muted/5 flex justify-end">
                                <Button variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest border-2" onClick={() => setSelectedUser(null)}>
                                    Exit Profile
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

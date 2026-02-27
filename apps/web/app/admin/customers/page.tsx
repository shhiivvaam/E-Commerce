"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Shield, ShieldOff, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

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
            setUsers(data.users);
            setTotal(data.total);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(search); };

    const handleToggleBlock = async (id: string, isBlocked: boolean) => {
        const action = isBlocked ? "Unblock" : "Block";
        if (!confirm(`${action} this user?`)) return;
        try {
            const { data } = await api.patch(`/users/${id}/block`);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, deletedAt: data.deletedAt } : u));
            toast.success(`User ${isBlocked ? "unblocked" : "blocked"}`);
        } catch {
            toast.error("Failed to update user");
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const { data } = await api.patch(`/users/${id}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: data.role } : u));
            toast.success("Role updated");
        } catch {
            toast.error("Failed to change role");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground mt-1">{total} registered users</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => fetchUsers(search)} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-xl border bg-card shadow overflow-hidden">
                <div className="p-4 border-b">
                    <form onSubmit={handleSearch} className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="pl-8 bg-background"
                        />
                    </form>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="border-b bg-muted/30">
                        <tr>
                            <th className="h-11 px-4 font-medium text-muted-foreground">User</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground">Role</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-right">Orders</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-center">Status</th>
                            <th className="h-11 px-4 font-medium text-muted-foreground text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="border-b">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} className="p-4"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : users.map(u => {
                            const isBlocked = !!u.deletedAt;
                            return (
                                <tr key={u.id} className={`border-b hover:bg-muted/30 transition-colors ${isBlocked ? "opacity-60" : ""}`}>
                                    <td className="p-4">
                                        <p className="font-medium">{u.name ?? "—"}</p>
                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={u.role.name}
                                            onChange={e => handleRoleChange(u.id, e.target.value)}
                                            className="text-xs border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="CUSTOMER">CUSTOMER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-right text-muted-foreground">{u._count.orders}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isBlocked
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                            }`}>
                                            {isBlocked ? "Blocked" : "Active"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${isBlocked ? "text-green-600 hover:text-green-700" : "text-destructive hover:text-destructive/80"}`}
                                            onClick={() => handleToggleBlock(u.id, isBlocked)}
                                            title={isBlocked ? "Unblock" : "Block"}
                                        >
                                            {isBlocked ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!loading && users.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No users found.</div>
                )}
            </div>
        </div>
    );
}

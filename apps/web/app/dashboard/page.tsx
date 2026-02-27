"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Phone, User as UserIcon, AlertTriangle, Save, Trash2, Smartphone } from "lucide-react";

export default function DashboardOverviewPage() {
    const { user, updateUser, logout } = useAuthStore();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user?.name) {
            const parts = user.name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const newName = `${firstName} ${lastName}`.trim();
            await api.patch("/users/me", { name: newName });

            updateUser({ name: newName });
            toast.success("Identity records synchronized", { icon: '👤' });
        } catch (error) {
            console.error(error);
            toast.error("Protocol rejection: Update failure");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("CRITICAL PROTOCOL: Are you sure you want to purge this identity node? This action is irreversible.")) return;
        setIsDeleting(true);
        try {
            await api.delete("/users/me");
            toast.success("Identity purged");
            logout();
            router.push("/");
        } catch (error) {
            console.error(error);
            toast.error("Purge failure: Database rejection");
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-16">
            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-black/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Operational Profile</span>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">Identity Management</h1>
                <p className="text-sm font-medium text-slate-400 italic">Configure your primary user parameters and security protocols.</p>
            </header>

            <form onSubmit={handleSave} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                            <UserIcon className="h-3 w-3" /> Designated First Name
                        </label>
                        <Input
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="e.g. MARCUS"
                            className="h-16 rounded-[20px] border-2 font-bold px-6 focus-visible:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                            <UserIcon className="h-3 w-3" /> Designated Last Name
                        </label>
                        <Input
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="e.g. AURELIUS"
                            className="h-16 rounded-[20px] border-2 font-bold px-6 focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                            <Mail className="h-3 w-3" /> Protocol Email Hub
                        </label>
                        <div className="relative group">
                            <Input value={user?.email || ''} disabled className="h-16 rounded-[20px] border-2 border-slate-100 bg-slate-50 font-bold px-6 opacity-60" />
                            <div className="absolute top-1/2 -translate-y-1/2 right-6">
                                <ShieldCheck className="h-5 w-5 text-emerald-500/30" />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">Read-only field. Contact administration for modifications.</p>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                            <Smartphone className="h-3 w-3" /> Mobile Link Node
                        </label>
                        <Input disabled placeholder="TRANSMISSION LINK INACTIVE" className="h-16 rounded-[20px] border-2 border-slate-100 bg-slate-50 font-black tracking-widest px-6 italic text-[10px] opacity-40" />
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">Two-factor authentication module offline.</p>
                    </div>
                </div>

                <div className="pt-6">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-16 px-12 rounded-[24px] font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl transition-all active:scale-95 group"
                    >
                        {isSaving ? "Synchronizing..." : "Initialize Identity Sync"}
                        <Save className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                    </Button>
                </div>
            </form>

            <section className="pt-16 border-t-2 border-slate-50 mt-20">
                <div className="bg-rose-50/50 rounded-[40px] border-2 border-rose-100/50 p-10 xl:p-12 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <AlertTriangle className="h-48 w-48 rotate-12" />
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3 text-rose-500">
                            <AlertTriangle className="h-5 w-5" />
                            <h2 className="text-xl font-black uppercase tracking-widest">Danger Zone</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic leading-relaxed">
                            Initializing the identity purge protocol will permanently eliminate your presence from the NexusOS database. All transactions, curations, and logistics history will be purged asynchronously.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-rose-200 transition-all active:scale-95 group"
                        >
                            {isDeleting ? "Purging Node..." : "Establish Identity Purge"}
                            <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

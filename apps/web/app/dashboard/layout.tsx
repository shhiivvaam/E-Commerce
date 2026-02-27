"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, MapPin, Heart, Bell, LogOut, ShieldCheck, ChevronRight, Activity } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const navItems = [
        { name: "My Profile", href: "/dashboard", icon: User, label: "Identity" },
        { name: "Order History", href: "/dashboard/orders", icon: ShoppingBag, label: "Transactions" },
        { name: "Addresses", href: "/dashboard/addresses", icon: MapPin, label: "Logistics" },
        { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart, label: "Curation" },
        { name: "Notifications", href: "/dashboard/notifications", icon: Bell, label: "Traffic" },
    ];

    if (!user) {
        return (
            <div className="container min-h-[70vh] flex flex-col items-center justify-center text-center px-8 bg-white">
                <div className="h-20 w-20 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center mb-8 text-slate-200">
                    <Activity className="h-10 w-10" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Session Required.</h2>
                <p className="text-slate-400 font-medium mt-4 italic uppercase tracking-tighter">Identity validation is mandatory for dashboard access.</p>
                <Link href="/auth/login" className="mt-8">
                    <Button size="lg" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px]">Initialize Login</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-40">
            {/* Context Header */}
            <header className="pt-24 pb-12 border-b-2 border-slate-50">
                <div className="container mx-auto px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">User Control Hub</span>
                            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">Command <br />Center</h1>
                        </div>
                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border-2 border-slate-100">
                            <div className="h-16 w-16 rounded-2xl bg-black border-4 border-white shadow-xl flex items-center justify-center text-xl font-black text-white italic">
                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                                <p className="text-lg font-black uppercase tracking-tight">{user.name || "Customer"}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Verified Active Node</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-8 pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Navigation Sidebar */}
                    <aside className="lg:col-span-3">
                        <nav className="space-y-3 sticky top-32">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group flex items-center justify-between px-6 py-5 rounded-[24px] border-2 transition-all active:scale-95 ${isActive
                                            ? "bg-black border-black text-white shadow-2xl shadow-black/10"
                                            : "bg-white border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-all ${isActive ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-100 text-slate-300 group-hover:bg-white group-hover:text-black'}`}>
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-widest leading-none">{item.name}</p>
                                                <p className={`text-[9px] font-bold uppercase tracking-tighter mt-1 italic ${isActive ? 'text-white/40' : 'text-slate-300'}`}>{item.label}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                    </Link>
                                );
                            })}

                            <div className="h-px bg-slate-50 mx-6 my-6" />

                            <button
                                onClick={() => logout()}
                                className="w-full flex items-center gap-4 px-6 py-5 rounded-[24px] border-2 border-transparent text-rose-500 hover:bg-rose-50 transition-all font-black uppercase tracking-widest text-[11px] text-left group"
                            >
                                <div className="h-10 w-10 rounded-xl bg-rose-100/50 flex items-center justify-center transition-transform group-hover:rotate-12">
                                    <LogOut className="h-5 w-5" />
                                </div>
                                Terminate Session
                            </button>
                        </nav>
                    </aside>

                    {/* Operational Core */}
                    <main className="lg:col-span-9">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-50/50 rounded-[48px] border-2 border-slate-50 p-10 xl:p-16 min-h-[600px] shadow-sm relative overflow-hidden"
                        >
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
}

import { Button } from "@/components/ui/button";

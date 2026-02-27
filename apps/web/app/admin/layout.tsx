"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, ShoppingCart, Tag, Ticket, LogOut, Settings, Image as ImageIcon, Menu, X, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#F8F9FC] text-[#1A1C1E]">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 border-r-2 border-slate-200/60 bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.02)]">
                <div className="p-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center">
                            <div className="h-5 w-5 border-2 border-white rounded-sm rotate-45" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight uppercase">Admin<span className="text-primary opacity-50">OS</span></h2>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between group rounded-2xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-900'}`} />
                                    {item.name}
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 mt-auto">
                    <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 flex flex-col gap-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">System Session</p>
                        <Button
                            onClick={() => logout()}
                            variant="destructive"
                            className="w-full h-12 rounded-2xl gap-3 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-100"
                        >
                            <LogOut className="h-4 w-4" />
                            Terminate Port
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b-2 border-slate-100 z-[90] px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                        <div className="h-4 w-4 border-2 border-white rounded-sm rotate-45" />
                    </div>
                    <h2 className="text-sm font-black tracking-tight uppercase">AdminOS</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-xl">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </Button>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="lg:hidden fixed inset-0 top-20 bg-white z-[89] p-6 pt-10"
                    >
                        <nav className="space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-slate-400"
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <div className="pt-10">
                                <Button
                                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl gap-3 font-black uppercase text-xs border-2 text-rose-600 border-rose-100"
                                >
                                    <LogOut className="h-5 w-5" /> Logout Session
                                </Button>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 min-h-screen">
                <div className="container p-8 lg:p-14 mx-auto max-w-7xl pt-28 lg:pt-14">
                    {children}
                </div>
            </main>
        </div>
    );
}

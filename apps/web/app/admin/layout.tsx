"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, ShoppingCart, Tag, Ticket, LogOut, Settings, Image as ImageIcon, Menu, X, ChevronRight, Zap } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

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
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-100 transition-colors duration-500">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-80 flex-col fixed inset-y-0 border-r-2 border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#0a0a0a] shadow-[10px_0_30px_-15px_rgba(0,0,0,0.02)] transition-colors">
                <div className="p-12">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="h-12 w-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12">
                            <Zap className="h-6 w-6 text-white dark:text-black fill-current" />
                        </div>
                        <h2 className="text-xl font-black tracking-tighter uppercase">Admin<span className="text-primary opacity-50 italic">OS</span></h2>
                    </Link>
                </div>

                <nav className="flex-1 px-8 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="pb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 ml-4">Main Protocol</span>
                    </div>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between group rounded-2xl px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${isActive
                                    ? "bg-black dark:bg-white text-white dark:text-black shadow-2xl scale-[1.02]"
                                    : "text-slate-400 dark:text-slate-600 hover:text-black dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-5">
                                    <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-300 dark:text-slate-800 group-hover:text-black dark:group-hover:text-white'}`} />
                                    {item.name}
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 mt-auto space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-800">Ambient Mode</span>
                        <ThemeToggle />
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 rounded-[32px] p-8 border-2 border-slate-100 dark:border-white/5 space-y-6 transition-colors">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Session ID</p>
                            <p className="text-[9px] font-bold text-slate-300 dark:text-slate-800 uppercase tracking-widest overflow-hidden text-ellipsis italic">Port: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>
                        <Button
                            onClick={() => logout()}
                            variant="destructive"
                            className="w-full h-14 rounded-2xl gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-100 dark:shadow-none transition-transform active:scale-95"
                        >
                            <LogOut className="h-4 w-4" />
                            Terminate Port
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-24 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b-2 border-slate-100 dark:border-slate-800 z-[90] px-8 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white dark:text-black fill-current" />
                    </div>
                    <h2 className="text-base font-black tracking-tighter uppercase">AdminOS</h2>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-xl h-12 w-12 border-2 border-slate-100 dark:border-slate-800">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden fixed inset-0 top-24 bg-white dark:bg-[#050505] z-[89] p-8 pt-10 transition-colors"
                    >
                        <nav className="space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-6 rounded-2xl px-6 py-5 text-xs font-black uppercase tracking-widest transition-all ${isActive
                                            ? "bg-black dark:bg-white text-white dark:text-black"
                                            : "text-slate-400"
                                            }`}
                                    >
                                        <item.icon className="h-6 w-6" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <div className="pt-12">
                                <Button
                                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                    variant="outline"
                                    className="w-full h-20 rounded-[30px] gap-4 font-black uppercase text-xs border-4 text-rose-600 border-rose-100 dark:border-rose-900/20"
                                >
                                    <LogOut className="h-5 w-5" /> Logout Session
                                </Button>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-80 min-h-screen">
                <div className="container p-8 lg:p-16 mx-auto max-w-7xl pt-32 lg:pt-16">
                    {children}
                </div>
            </main>
        </div>
    );
}

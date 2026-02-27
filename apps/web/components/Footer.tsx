"use client";

import Link from "next/link";
import { Github, Twitter, Instagram, ArrowUpRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) return null;

    return (
        <footer className="bg-background border-t border-border relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/8 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-8 pt-24 pb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24 mb-20">
                    {/* Brand */}
                    <div className="lg:col-span-5 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-11 w-11 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3 shadow-lg shadow-primary/40">
                                <div className="h-5 w-5 border-2 border-primary-foreground/80 rounded-lg rotate-6 bg-card/30" />
                            </div>
                            <span className="text-2xl font-semibold tracking-tight text-foreground">
                                Nex<span className="text-primary">Cart</span>
                            </span>
                        </Link>
                        <p className="text-sm md:text-base text-muted-foreground max-w-sm leading-relaxed">
                            A thoughtful marketplace for the things you love most – curated products, smooth checkout, and delivery you can trust.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Instagram].map((Icon, i) => (
                                <button
                                    key={i}
                                    className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-md transition-all"
                                >
                                    <Icon className="h-5 w-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nav Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Shop
                            </h4>
                            <ul className="space-y-4">
                                {['All Products', 'Collections', 'New Arrivals', 'Sales'].map(item => (
                                    <li key={item}>
                                        <Link
                                            href="/products"
                                            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                                        >
                                            {item} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Support
                            </h4>
                            <ul className="space-y-4">
                                {['Help Center', 'Shipping', 'Returns', 'Contact'].map(item => (
                                    <li key={item}>
                                        <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                                            {item} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Legal
                            </h4>
                            <ul className="space-y-4">
                                {['Privacy', 'Terms', 'Security', 'Cookie Policy'].map(item => (
                                    <li key={item}>
                                        <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                                            {item} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] text-muted-foreground">
                        © 2026 NexCart. All rights reserved.
                    </p>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500/70" />
                            <span className="text-[11px] text-muted-foreground">Secure checkout</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary/80" />
                            <span className="text-[11px] text-muted-foreground">Fast delivery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-500/70" />
                            <span className="text-[11px] text-muted-foreground">Global shipping</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

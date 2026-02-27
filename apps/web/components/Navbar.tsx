"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart, User, LogOut, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
    const { isAuthenticated, logout, user } = useAuthStore();
    const cartItems = useCartStore((state) => state.items);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    const isAdmin = user?.role === 'admin';

    // Don't show public navbar on admin pages
    if (pathname?.startsWith('/admin')) return null;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
                ? "py-3 px-4 md:px-10"
                : "py-6 px-6 md:px-16"
                }`}
        >
            <div className={`container mx-auto max-w-7xl h-16 md:h-18 px-5 md:px-7 flex items-center justify-between transition-all duration-500 rounded-[999px] border bg-card/80 backdrop-blur-xl relative overflow-hidden shadow-[0_18px_45px_-25px_rgba(15,23,42,0.55)] ${scrolled
                ? "border-border/70"
                : "border-transparent"
                }`}>
                {/* Brand */}
                <div className="flex items-center gap-12 z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-9 w-9 md:h-10 md:w-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-6 shadow-lg shadow-primary/40">
                            <div className="h-4 w-4 md:h-5 md:w-5 border-2 border-primary-foreground/80 rounded-lg rotate-6 bg-card/30" />
                        </div>
                        <span className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
                            Nex<span className="text-primary">Cart</span>
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        {['Shop', 'Categories', 'Deals'].map(item => {
                            const href =
                                item === 'Shop'
                                    ? '/products'
                                    : item === 'Categories'
                                        ? '/categories'
                                        : '/deals';
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={item}
                                    href={href}
                                    className={`text-xs font-medium transition-colors ${isActive
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {item}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Search overlay */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 bg-card/95 z-[20] flex items-center px-6 md:px-10"
                        >
                            <Search className="h-5 w-5 text-muted-foreground mr-4" />
                            <form onSubmit={handleSearchSubmit} className="flex-1">
                                <input
                                    ref={inputRef}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search products, brands, or categories"
                                    className="w-full bg-transparent h-11 text-sm outline-none placeholder:text-muted-foreground text-foreground"
                                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                                />
                            </form>
                            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-2 z-10">
                    <ThemeToggle />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
                        className="rounded-full h-11 w-11 hover:bg-accent/60"
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-full hover:bg-accent/60 group">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground group-hover:scale-110 transition-transform">
                                    {cartCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    <div className="h-7 w-px bg-border mx-1.5" />

                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <Link href="/admin">
                                    <Button variant="outline" size="sm" className="hidden md:flex h-10 rounded-full gap-2 text-xs font-medium hover:text-primary">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent/60">
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => logout()}
                                className="h-10 w-10 rounded-full text-rose-500 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 hover:text-rose-600"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" className="h-10 px-5 rounded-full text-xs font-medium">
                                    Sign in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="h-10 px-6 rounded-full text-xs font-semibold shadow-lg shadow-primary/30">
                                    Create account
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart, User, LogOut, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
    const { isAuthenticated, logout } = useAuthStore();
    const cartItems = useCartStore((state) => state.items);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    const handleSearchOpen = () => {
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xl font-bold tracking-tight">NexCart</span>
                </Link>

                {/* Search bar — expands in middle */}
                {searchOpen ? (
                    <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="pl-9 pr-4 h-9 rounded-full"
                                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                                onKeyDown={e => e.key === "Escape" && setSearchOpen(false)}
                            />
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center gap-5">
                        <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary hidden sm:block">
                            Products
                        </Link>
                    </div>
                )}

                <div className="flex items-center gap-1 border-l pl-3 ml-1 flex-shrink-0">
                    {!searchOpen && (
                        <Button variant="ghost" size="icon" onClick={handleSearchOpen} title="Search">
                            <Search className="h-5 w-5" />
                        </Button>
                    )}
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {cartCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-1">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" title="My Account">
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => logout()} title="Sign out">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm" className="rounded-full px-4">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const cartItems = useCartStore((state) => state.items);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">NexCart</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
                        Products
                    </Link>
                    <div className="flex items-center gap-2 border-l pl-4 ml-2">
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
                            <div className="flex items-center gap-2">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="icon" onClick={() => logout()}>
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button variant="default" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

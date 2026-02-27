"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        description: string;
        price: number;
        discounted?: number;
        image: string;
    };
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const { isAuthenticated } = useAuthStore();
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const displayPrice = product.discounted ?? product.price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            productId: product.id,
            title: product.title,
            price: displayPrice,
            quantity: 1,
            image: product.image,
        });
        toast.success("Added to cart!");
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please log in to save items");
            return;
        }
        setWishlistLoading(true);
        try {
            if (wishlisted) {
                await api.delete(`/wishlist/${product.id}`);
                setWishlisted(false);
            } else {
                await api.post(`/wishlist/${product.id}`);
                setWishlisted(true);
                toast.success("Saved to wishlist!");
            }
        } catch {
            toast.error("Failed to update wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg backdrop-blur-sm bg-white/50 dark:bg-black/50"
        >
            {/* Wishlist button */}
            <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className={`absolute top-3 right-3 z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all shadow-md ${wishlisted
                    ? "bg-red-50 dark:bg-red-950/50"
                    : "bg-white/80 dark:bg-black/60 opacity-0 group-hover:opacity-100"
                    }`}
                title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            >
                <Heart
                    className={`h-4 w-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                />
            </button>

            <Link href={`/products/${product.id}`} className="block">
                <div className="relative h-64 w-full overflow-hidden bg-muted/50 rounded-t-2xl">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        unoptimized
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.discounted && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Sale
                        </div>
                    )}
                </div>
                <div className="p-5">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground line-clamp-1">{product.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">${displayPrice.toFixed(2)}</span>
                            {product.discounted && (
                                <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                            )}
                        </div>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full shadow-sm"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

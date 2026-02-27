"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    category?: string;
}

export default function ProductsPage() {
    const [filter, setFilter] = useState("all");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // If filter is "all", fetch without categoryId.
                // Ideally we'd need a way to map category slug to categoryId or the API would support slug filters.
                // For now, we will fetch all and filter client side if the category API is not fully hooked up.
                const { data } = await api.get('/products?limit=50');

                const formattedProducts = data.products.map((p: { id: string; title: string; description: string; price: number; gallery: string[]; category?: { slug: string } }) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    image: p.gallery && p.gallery.length > 0 ? p.gallery[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
                    category: p.category?.slug || 'uncategorized'
                }));

                setProducts(formattedProducts);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = filter === "all"
        ? products
        : products.filter(p => p.category === filter);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">All Products</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Explore our extensive collection of premium lifestyle gear curated just for you.
                </p>
            </div>

            <div className="flex justify-center gap-2 mb-12 flex-wrap">
                {["all", "audio", "wearable", "accessories", "photography"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl" />
                    ))
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-xl text-muted-foreground">No products found for this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

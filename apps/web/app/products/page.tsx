"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronDown, LayoutGrid, ListFilter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    discounted?: number;
    image: string;
    category?: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: { products: number };
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    // Fetch categories
    useEffect(() => {
        api.get('/categories').then(({ data }) => setCategories(data)).catch(() => { });
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                limit: 50,
                sortBy,
                sortOrder,
                ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
                ...(search && { search }),
            };

            const { data } = await api.get('/products', { params });

            let formatted = data.products.map((p: any) => ({
                id: p.id,
                title: p.title,
                description: p.description,
                price: p.price,
                discounted: p.discounted,
                image: p.gallery?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
            }));

            if (minPrice) formatted = formatted.filter((p: any) => (p.discounted || p.price) >= parseFloat(minPrice));
            if (maxPrice) formatted = formatted.filter((p: any) => (p.discounted || p.price) <= parseFloat(maxPrice));

            setProducts(formatted);
        } catch (error) {
            console.error("Gallery synchronization failed", error);
        } finally {
            setLoading(false);
        }
    }, [search, selectedCategory, sortBy, sortOrder, minPrice, maxPrice]);

    const timerRef = useRef<NodeJS.Timeout>();
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(fetchProducts, 400);
        return () => clearTimeout(timerRef.current);
    }, [fetchProducts]);

    const resetFilters = () => {
        setSearch("");
        setSelectedCategory("all");
        setMinPrice("");
        setMaxPrice("");
        setSortBy("createdAt");
        setSortOrder("desc");
    };

    return (
        <div className="bg-background min-h-screen pb-32 transition-colors duration-500">
            {/* Header */}
            <header className="pt-24 pb-10 border-b border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="container mx-auto px-8 relative z-10">
                    <div className="space-y-4">
                        <span className="text-xs font-medium text-primary/80 tracking-wide uppercase">
                            Shop all products
                        </span>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                            <div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
                                    Find your next favorite thing.
                                </h1>
                                <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl">
                                    Browse the full catalog, filter by category or price, and quickly compare what
                                    fits you best.
                                </p>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-2 flex items-center shadow-sm w-full md:w-auto">
                                <Search className="ml-4 h-4 w-4 text-muted-foreground" />
                                <input
                                    placeholder="Search products"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-transparent h-10 px-4 text-sm outline-none w-full md:w-64 placeholder:text-muted-foreground text-foreground"
                                />
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="h-10 px-4 rounded-full text-xs font-medium gap-2"
                                    variant={showFilters ? "default" : "outline"}
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-8 mt-12">
                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-card border border-border rounded-3xl p-8 mb-10 shadow-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none">
                                <ListFilter className="h-48 w-48 rotate-12 text-black dark:text-white" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-medium text-muted-foreground ml-1">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-11 pl-4 pr-10 border border-border bg-background rounded-2xl outline-none text-xs font-medium appearance-none focus:border-primary transition-all text-foreground"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                        >
                                            <option value="all">All products</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-medium text-muted-foreground ml-1">
                                        Price range
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input placeholder="Min" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="rounded-2xl h-11 text-xs" />
                                        <Input placeholder="Max" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="rounded-2xl h-11 text-xs" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-medium text-muted-foreground ml-1">
                                        Sort by
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-11 pl-4 pr-10 border border-border bg-background rounded-2xl outline-none text-xs font-medium appearance-none focus:border-primary transition-all text-foreground"
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={(e) => {
                                                const [field, order] = e.target.value.split("-");
                                                setSortBy(field);
                                                setSortOrder(order);
                                            }}
                                        >
                                            <option value="createdAt-desc">Newest first</option>
                                            <option value="price-asc">Price: low to high</option>
                                            <option value="price-desc">Price: high to low</option>
                                            <option value="name-asc">Name: A–Z</option>
                                            <option value="name-desc">Name: Z–A</option>
                                        </select>
                                        <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end">
                                    <Button
                                        variant="ghost"
                                        className="h-11 rounded-2xl gap-2 text-xs font-medium border border-dashed border-border hover:border-primary hover:text-primary transition-all"
                                        onClick={resetFilters}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Reset filters
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Listing Stats */}
                <div className="flex justify-between items-center mb-10 overflow-x-auto no-scrollbar gap-8">
                    <div className="flex items-center gap-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                                Showing
                            </span>
                            <span className="text-lg font-semibold text-foreground">
                                {products.length}
                            </span>
                        </div>
                        <span className="h-6 w-px bg-border" />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedCategory("all")}
                                className={`px-4 py-2 rounded-full text-[11px] font-medium transition-all ${selectedCategory === "all" ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card text-muted-foreground hover:bg-accent'}`}
                            >
                                All
                            </button>
                            {categories.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCategory(c.id)}
                                    className={`px-4 py-2 rounded-full text-[11px] font-medium transition-all ${selectedCategory === c.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card text-muted-foreground hover:bg-accent'}`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
                        <LayoutGrid className="h-5 w-5" />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-6">
                                <div className="aspect-[4/5] bg-slate-50 dark:bg-slate-900 animate-pulse rounded-[40px] border-2 border-slate-50 dark:border-slate-800" />
                                <div className="h-8 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-full w-2/3" />
                                <div className="h-12 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-full w-1/3" />
                            </div>
                        ))
                    ) : products.length > 0 ? (
                        products.map((product, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={product.id}
                            >
                                <ProductCard product={product as any} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center bg-card rounded-3xl border border-dashed border-border transition-colors">
                            <div className="h-16 w-16 bg-background shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                <RotateCcw className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-semibold text-foreground">No products found</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Try adjusting your filters or clearing them to see more results.
                            </p>
                            <Button
                                onClick={resetFilters}
                                className="mt-8 rounded-full h-11 px-8 text-xs font-medium"
                            >
                                Clear filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

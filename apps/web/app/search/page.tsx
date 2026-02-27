"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    discounted?: number;
    image: string;
}

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get("q") ?? "";
    const [inputValue, setInputValue] = useState(query);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setInputValue(query);
        if (!query.trim()) {
            setProducts([]);
            return;
        }
        const fetchResults = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&limit=24`);
                const formatted = data.products.map((p: { id: string; title: string; description: string; price: number; discounted?: number; gallery: string[] }) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    discounted: p.discounted,
                    image: p.gallery && p.gallery.length > 0 ? p.gallery[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
                }));
                setProducts(formatted);
                setTotal(data.total);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Search products..."
                        className="pl-12 h-14 text-lg rounded-full shadow-sm"
                    />
                </div>
            </form>

            {query && (
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {loading ? "Searching..." : `${total} result${total !== 1 ? "s" : ""} for "${query}"`}
                    </h1>
                </div>
            )}

            {!query && (
                <div className="text-center py-20">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                    <p className="text-xl text-muted-foreground">Start typing to search for products</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl" />
                    ))
                ) : products.length > 0 ? (
                    products.map(product => <ProductCard key={product.id} product={product} />)
                ) : query && !loading ? (
                    <div className="col-span-full text-center py-16">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                        <p className="text-xl font-semibold mb-2">No results found</p>
                        <p className="text-muted-foreground">Try a different search term.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense>
            <SearchResults />
        </Suspense>
    );
}

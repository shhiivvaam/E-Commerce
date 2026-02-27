"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    category?: string;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const addItem = useCartStore(state => state.addItem);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${params.id}`);
                setProduct({
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    image: data.gallery && data.gallery.length > 0 ? data.gallery[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
                });
            } catch (err) {
                console.error("Failed to load product details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity,
            image: product.image
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 flex justify-center items-center text-xl text-muted-foreground animate-pulse">
                Loading product...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col justify-center items-center text-center">
                <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
                <p className="text-muted-foreground mb-8">The product you are looking for does not exist.</p>
                <Link href="/products"><Button>Browse All Products</Button></Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
                    <Image src={product.image} alt={product.title} fill unoptimized className="object-cover" />
                </div>

                <div className="flex flex-col justify-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{product.title}</h1>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                        <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" className="w-4 h-4" />)}
                            <span className="text-muted-foreground text-sm ml-2">(124 reviews)</span>
                        </div>
                    </div>

                    <p className="mt-6 text-base text-muted-foreground leading-relaxed">{product.description}</p>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex items-center border rounded-md h-12">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-lg hover:bg-muted transition-colors rounded-l-md">-</button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-lg hover:bg-muted transition-colors rounded-r-md">+</button>
                        </div>
                        <Button size="lg" className="h-12 flex-1 rounded-full shadow-lg" onClick={handleAddToCart}>
                            <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                        </Button>
                    </div>

                    <div className="mt-12 space-y-4 border-t pt-8">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Truck className="h-5 w-5 text-primary" /> Free shipping on orders over $100
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <ShieldCheck className="h-5 w-5 text-primary" /> 1-year extended warranty included
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

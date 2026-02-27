"use client";

import { useEffect, useState, useCallback } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, Send, Heart, ChevronRight, Zap, Award, Info, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface Variant {
    id: string;
    size?: string;
    color?: string;
    sku?: string;
    stock: number;
    priceDiff: number;
}

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    discounted?: number;
    image: string;
    gallery: string[];
    stock: number;
    category?: { id: string; name: string; slug: string };
    variants?: Variant[];
}

interface RelatedProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    discounted?: number;
    gallery: string[];
}

interface Review {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: { id: string; name?: string; avatar?: string };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    const addItem = useCartStore(state => state.addItem);
    const { isAuthenticated, user } = useAuthStore();
    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            const { data } = await api.get(`/products/${params.id}/reviews`);
            setReviews(data.reviews);
            setAvgRating(data.avgRating);
        } catch (err) {
            console.error("Reviews sync failure", err);
        }
    }, [params.id]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${params.id}`);
                setProduct({
                    ...data,
                    image: data.gallery && data.gallery.length > 0 ? data.gallery[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
                    gallery: data.gallery || ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"],
                });

                if (data.category?.id) {
                    api.get(`/products?categoryId=${data.category.id}&limit=5`)
                        .then(({ data: related }) => {
                            setRelatedProducts(related.products.filter((p: RelatedProduct) => p.id !== data.id).slice(0, 4));
                        })
                        .catch(() => { });
                }
            } catch (err) {
                console.error("Product core retrieval failure", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        fetchReviews();

        if (isAuthenticated) {
            api.get(`/wishlist/${params.id}/check`)
                .then(({ data }) => setWishlisted(data.inWishlist))
                .catch(() => { });
        }
    }, [params.id, isAuthenticated, fetchReviews]);

    const handleAddToCart = () => {
        if (!product) return;
        const basePrice = product.discounted ?? product.price;
        const variantPrice = basePrice + (selectedVariant?.priceDiff ?? 0);
        addItem({
            productId: product.id,
            title: product.title + (selectedVariant ? ` (${[selectedVariant.size, selectedVariant.color].filter(Boolean).join(', ')})` : ''),
            price: variantPrice,
            quantity,
            image: product.image,
        });
        toast.success("Consignment staging successful", { icon: '🛍️' });
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) { toast.error("Authentication required for curation"); return; }
        if (!product) return;
        setWishlistLoading(true);
        try {
            if (wishlisted) {
                await api.delete(`/wishlist/${product.id}`);
                setWishlisted(false);
                toast.success("Curation entry removed");
            } else {
                await api.post(`/wishlist/${product.id}`);
                setWishlisted(true);
                toast.success("Asset saved to curation", { icon: '🤍' });
            }
        } catch {
            toast.error("Curation sync failed");
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userRating === 0) { toast.error("Rating magnitude undefined"); return; }
        setIsSubmittingReview(true);
        try {
            await api.post(`/products/${params.id}/reviews`, { rating: userRating, comment: userComment });
            toast.success("Social proof established");
            setUserRating(0);
            setUserComment("");
            await fetchReviews();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
                : "Unable to submit your review right now. Please try again.";
            toast.error(errorMessage || "Unable to submit your review right now. Please try again.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const basePrice = product?.discounted ?? product?.price ?? 0;
    const displayPrice = basePrice + (selectedVariant?.priceDiff ?? 0);
    const originalPrice = product?.discounted ? product.price + (selectedVariant?.priceDiff ?? 0) : undefined;
    const effectiveStock = selectedVariant ? selectedVariant.stock : (product?.stock ?? 0);

    const sizes = Array.from(new Set((product?.variants ?? []).map(v => v.size).filter((s): s is string => Boolean(s))));
    const colors = Array.from(new Set((product?.variants ?? []).map(v => v.color).filter((c): c is string => Boolean(c))));

    if (loading) {
        return (
            <div className="container mx-auto px-8 py-40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 animate-pulse">
                    <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-900 rounded-[40px]" />
                    <div className="space-y-10">
                        <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl" />
                        <div className="h-40 bg-slate-100 dark:bg-slate-900 rounded-3xl" />
                        <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-8 py-32 text-center space-y-6 bg-background transition-colors">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                    We couldn’t find that product.
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                    It may have been removed or is temporarily unavailable.
                </p>
                <Link href="/products">
                    <Button size="lg" className="rounded-full px-8 h-11 text-sm font-medium mt-2">
                        Back to products
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pb-32 transition-colors duration-500">
            <div className="container mx-auto px-8 pt-12">
                {/* Header / Breadcrumbs */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/products" className="group flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center group-hover:bg-accent transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        Back to products
                    </Link>
                    <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Home</span>
                        <ChevronRight className="h-3 w-3" />
                        <span>Products</span>
                        {product.category?.name && (
                            <>
                                <ChevronRight className="h-3 w-3" />
                                <span>{product.category.name}</span>
                            </>
                        )}
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-foreground font-medium truncate max-w-[200px]">
                            {product.title}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    {/* Gallery */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="relative aspect-[4/5] w-full bg-card rounded-3xl overflow-hidden border border-border group shadow-lg transition-colors">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={product.gallery[activeImage]}
                                        alt={product.title}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.discounted && (
                                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[11px] font-medium shadow-sm">
                                        Save {Math.round((1 - (product.discounted / product.price)) * 100)}%
                                    </span>
                                )}
                                {product.stock < 5 && product.stock > 0 && (
                                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[11px] font-medium shadow-sm">
                                        Only {product.stock} left in stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.gallery.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {product.gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative h-24 aspect-[4/5] rounded-2xl overflow-hidden border transition-all ${activeImage === idx ? 'border-primary scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <Image src={img} alt={`${product.title} view ${idx}`} fill unoptimized className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="lg:col-span-5 space-y-12 py-4">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                {product.category?.name && (
                                    <>
                                        <span className="h-6 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                            {product.category.name}
                                        </span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-snug text-foreground">
                                {product.title}
                            </h1>

                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-medium text-muted-foreground mb-1">
                                        Price
                                    </span>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-3xl font-semibold tracking-tight text-foreground transition-colors">
                                            ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                        {originalPrice && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                ${originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {reviews.length > 0 && (
                                    <div className="pl-6 border-l border-border transition-colors">
                                        <span className="text-[11px] font-medium text-muted-foreground">
                                            Reviews
                                        </span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex text-black dark:text-white">
                                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(avgRating) ? "fill-current" : "opacity-10"}`} />)}
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                ({reviews.length})
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-card rounded-3xl border border-border space-y-4 transition-colors">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <Info className="h-4 w-4 text-primary" /> Product details
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Options & Add to cart */}
                        <div className="space-y-12">
                            {sizes.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Size
                                        </label>
                                        <span className="text-[11px] text-muted-foreground">
                                            Select one
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => {
                                                    const match = product.variants?.find(v => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color));
                                                    setSelectedVariant(match ?? product.variants?.find(v => v.size === size) ?? null);
                                                }}
                                                className={`h-10 min-w-[72px] px-4 rounded-full border text-[11px] font-medium transition-all active:scale-95 ${selectedVariant?.size === size ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card border-border text-muted-foreground hover:bg-accent"}`}
                                            >{size}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {colors.length > 0 && (
                                <div className="space-y-4">
                                    <label className="text-xs font-medium text-muted-foreground px-1">
                                        Color
                                    </label>
                                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    const match = product.variants?.find(v => v.color === color && (!selectedVariant?.size || v.size === selectedVariant.size));
                                                    setSelectedVariant(match ?? product.variants?.find(v => v.color === color) ?? null);
                                                }}
                                                className={`group flex items-center gap-3 pr-6 h-11 rounded-2xl border transition-all active:scale-95 shrink-0 ${selectedVariant?.color === color ? "bg-primary/10 border-primary text-foreground" : "bg-card border-border text-muted-foreground hover:bg-accent"}`}
                                            >
                                                <div className="h-7 w-7 m-1 rounded-full border border-border shadow-inner group-hover:scale-110 transition-transform" style={{ backgroundColor: color.toLowerCase() }} />
                                                <span className="text-[11px] font-medium">
                                                    {color}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-4 pt-4">
                                <div className="flex items-center bg-card border border-border rounded-full p-1 h-11 w-full md:w-auto">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-full transition-colors text-foreground"><Minus className="h-4 w-4" /></button>
                                    <span className="w-10 text-center text-sm font-medium tabular-nums text-foreground">{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))} className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-full transition-colors text-foreground"><Plus className="h-4 w-4" /></button>
                                </div>
                                <Button
                                    size="lg"
                                    className="h-11 md:h-12 flex-1 rounded-full shadow-md font-semibold text-xs gap-3 group active:scale-95 transition-all"
                                    onClick={handleAddToCart}
                                    disabled={effectiveStock === 0}
                                >
                                    {effectiveStock === 0 ? "Out of stock" : "Add to cart"}
                                    <ShoppingCart className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className={`h-11 w-11 rounded-full p-0 flex-shrink-0 transition-all active:scale-95 ${wishlisted ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-900 text-rose-500' : 'bg-card border-border hover:border-rose-400 hover:text-rose-500'}`}
                                    onClick={handleToggleWishlist}
                                    disabled={wishlistLoading}
                                >
                                    <Heart className={`h-6 w-6 ${wishlisted ? "fill-current" : ""}`} />
                                </Button>
                            </div>

                            <div className="pt-8 border-t border-border grid grid-cols-2 gap-8 transition-colors">
                                <div className="space-y-4">
                                    <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500"><Truck className="h-6 w-6" /></div>
                                    <h4 className="text-sm font-semibold text-foreground">Free shipping over $100</h4>
                                    <p className="text-xs text-muted-foreground leading-snug">
                                        Enjoy free standard delivery when your order total is over $100.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-500"><ShieldCheck className="h-6 w-6" /></div>
                                    <h4 className="text-sm font-semibold text-foreground">Secure & protected</h4>
                                    <p className="text-xs text-muted-foreground leading-snug">
                                        Safe checkout and easy support if anything doesn’t arrive as expected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <section className="mt-52 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-primary/80 tracking-wide uppercase">
                                Customer reviews
                            </span>
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
                                What people are saying
                            </h2>
                        </div>
                        {reviews.length > 0 && (
                            <div className="flex gap-16 pr-4">
                                <div className="text-center">
                                    <div className="text-6xl font-black text-black dark:text-white">{avgRating}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700 mt-3 italic">Aggregate Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl font-black text-black dark:text-white">{reviews.length}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700 mt-3 italic">Verified Logs</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        <div className="lg:col-span-8 space-y-10">
                            {reviews.length === 0 ? (
                                <div className="py-16 text-center border border-dashed rounded-3xl border-border transition-colors">
                                    <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground">No reviews yet</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Be the first to share your experience with this product.
                                    </p>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        key={review.id}
                                        className="p-8 bg-card rounded-3xl border border-border flex flex-col md:flex-row gap-8 transition-colors relative overflow-hidden group"
                                    >
                                            <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none group-hover:scale-110 transition-transform">
                                            <Award className="h-32 w-32" />
                                        </div>
                                            <div className="flex flex-col items-center gap-4 shrink-0 relative z-10">
                                            <div className="h-16 w-16 rounded-2xl bg-background border border-border flex items-center justify-center font-semibold text-lg text-foreground transition-colors">
                                                {review.user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-medium text-foreground">{review.user.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">
                                                    Verified buyer
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4 relative z-10">
                                            <div className="flex justify-between items-center">
                                                <div className="flex text-black dark:text-white">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-5 w-5 ${i <= review.rating ? "fill-current" : "opacity-10"}`} />)}
                                                </div>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="lg:col-span-4">
                            {isAuthenticated && !reviews.some(r => r.user.id === user?.id) ? (
                                <div className="sticky top-24 p-8 bg-card text-foreground rounded-3xl shadow-md space-y-6 border border-border">
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold tracking-tight">Write a review</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Share how this product worked for you to help other shoppers decide.
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmitReview} className="space-y-10">
                                        <div className="flex justify-between px-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setUserRating(star)}
                                                    className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all border active:scale-95 ${star <= userRating ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                                                >
                                                    <Star className={`w-6 h-6 ${star <= userRating ? "fill-current" : ""}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={userComment}
                                            onChange={e => setUserComment(e.target.value)}
                                            placeholder="How was the fit, quality, and overall experience?"
                                            className="w-full min-h-[160px] bg-background border border-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-primary/40 transition-all resize-none text-foreground placeholder:text-muted-foreground"
                                        />
                                        <Button type="submit" disabled={isSubmittingReview} className="w-full h-11 rounded-full text-xs font-semibold gap-3 shadow-md transition-all active:scale-95">
                                            {isSubmittingReview ? "Submitting..." : "Submit review"} <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            ) : !isAuthenticated && (
                                <div className="p-8 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center text-center space-y-6 transition-colors">
                                    <div className="h-14 w-14 bg-background rounded-2xl flex items-center justify-center text-muted-foreground shadow-sm"><Zap className="h-8 w-8" /></div>
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-foreground">
                                            Sign in to leave a review
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed px-2">
                                            Log in to share how this product worked for you and see your past reviews.
                                        </p>
                                    </div>
                                    <Link href="/auth/login" className="w-full">
                                        <Button variant="outline" className="w-full h-11 rounded-full text-xs font-semibold active:scale-95 transition-all">
                                            Sign in
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Related Assets */}
                {relatedProducts.length > 0 && (
                    <section className="mt-24">
                        <div className="flex justify-between items-end mb-20 px-4">
                            <div className="space-y-2">
                                <span className="text-xs font-medium text-primary/80 tracking-wide uppercase">
                                    You may also like
                                </span>
                                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-foreground">
                                    Similar products
                                </h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
                            {relatedProducts.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={{
                                        id: p.id,
                                        title: p.title,
                                        description: p.description,
                                        price: p.price,
                                        discounted: p.discounted,
                                        image: p.gallery?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

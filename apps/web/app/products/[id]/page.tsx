"use client";

import { useEffect, useState } from "react";
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

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/products/${params.id}/reviews`);
            setReviews(data.reviews);
            setAvgRating(data.avgRating);
        } catch (err) {
            console.error("Reviews sync failure", err);
        }
    };

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
    }, [params.id, isAuthenticated]);

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
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Protocol rejection");
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
                    <div className="aspect-[4/5] bg-slate-100 rounded-[40px]" />
                    <div className="space-y-10">
                        <div className="h-20 bg-slate-100 rounded-3xl" />
                        <div className="h-40 bg-slate-100 rounded-3xl" />
                        <div className="h-20 bg-slate-100 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-8 py-40 text-center space-y-8">
                <h1 className="text-6xl font-black uppercase tracking-tighter">Asset Lost.</h1>
                <p className="text-xl text-slate-400 font-medium">The requested item has been purged from our active directories.</p>
                <Link href="/products">
                    <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest text-xs">Return to Gallery</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-32">
            <div className="container mx-auto px-8 pt-12">
                {/* Unified Header / Breadcrumbs */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/products" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black transition-colors">
                        <div className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        Back to Archives
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        Index <ChevronRight className="h-3 w-3" /> {product.category?.name} <ChevronRight className="h-3 w-3" /> <span className="text-black italic">{product.title}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    {/* Media Engine */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/5] w-full bg-slate-50 rounded-[48px] overflow-hidden border border-slate-100 group shadow-2xl shadow-slate-200/50">
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

                            <div className="absolute top-8 left-8 flex flex-col gap-3">
                                {product.discounted && (
                                    <span className="bg-black text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Archive Sale -{Math.round((1 - (product.discounted / product.price)) * 100)}%</span>
                                )}
                                {product.stock < 5 && product.stock > 0 && (
                                    <span className="bg-rose-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Critical Inventory</span>
                                )}
                            </div>
                        </div>

                        {/* Gallery Thumbnails */}
                        {product.gallery.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {product.gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative h-28 aspect-[4/5] rounded-[24px] overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-black scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <Image src={img} alt={`${product.title} view ${idx}`} fill unoptimized className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Information Cockpit */}
                    <div className="lg:col-span-5 space-y-12 py-4">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="h-px w-8 bg-black/10" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{product.category?.name}</span>
                            </div>
                            <h1 className="text-5xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.9]">{product.title}</h1>

                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Standard Unit Price</span>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black tracking-tighter">${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        {originalPrice && (
                                            <span className="text-lg text-slate-300 font-bold line-through italic">${originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        )}
                                    </div>
                                </div>

                                {reviews.length > 0 && (
                                    <div className="pl-6 border-l-2 border-slate-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consensus</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex text-black">
                                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(avgRating) ? "fill-black" : "opacity-10"}`} />)}
                                            </div>
                                            <span className="text-sm font-black italic">({reviews.length})</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 rounded-[40px] border-2 border-slate-100/50 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Info className="h-3 w-3 text-slate-400" /> Executive Summary
                            </h3>
                            <p className="text-base text-slate-500 font-medium leading-relaxed italic">
                                {product.description}
                            </p>
                        </div>

                        {/* Configuration Engine */}
                        <div className="space-y-10">
                            {sizes.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dimensions</label>
                                        <span className="text-[10px] font-bold text-slate-300">Size Chart Available</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => {
                                                    const match = product.variants?.find(v => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color));
                                                    setSelectedVariant(match ?? product.variants?.find(v => v.size === size) ?? null);
                                                }}
                                                className={`h-14 px-8 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${selectedVariant?.size === size ? "bg-black text-white border-black shadow-xl shadow-black/10" : "bg-white border-slate-100 text-slate-400 hover:border-black/20"}`}
                                            >{size}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {colors.length > 0 && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chromatic Selection</label>
                                    <div className="flex flex-wrap gap-4">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    const match = product.variants?.find(v => v.color === color && (!selectedVariant?.size || v.size === selectedVariant.size));
                                                    setSelectedVariant(match ?? product.variants?.find(v => v.color === color) ?? null);
                                                }}
                                                className={`group flex items-center gap-3 pr-6 h-14 rounded-2xl border-2 transition-all active:scale-95 ${selectedVariant?.color === color ? "bg-black text-white border-black shadow-xl" : "bg-white border-slate-100 text-slate-400"}`}
                                            >
                                                <div className="h-10 w-10 m-1.5 rounded-xl border-2 border-slate-100 shadow-inner group-hover:scale-110 transition-transform" style={{ backgroundColor: color.toLowerCase() }} />
                                                <span className="text-xs font-black uppercase tracking-widest">{color}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6 pt-6">
                                <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-[30px] p-2 h-20 w-full md:w-auto">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-16 w-16 flex items-center justify-center hover:bg-white rounded-full transition-colors"><Minus className="h-5 w-5" /></button>
                                    <span className="w-16 text-center text-xl font-black tabular-nums">{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))} className="h-16 w-16 flex items-center justify-center hover:bg-white rounded-full transition-colors"><Plus className="h-5 w-5" /></button>
                                </div>
                                <Button
                                    size="lg"
                                    className="h-20 flex-1 rounded-[30px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] font-black uppercase tracking-widest text-xs gap-3 group"
                                    onClick={handleAddToCart}
                                    disabled={effectiveStock === 0}
                                >
                                    {effectiveStock === 0 ? "Purged from Stock" : "Initialize Acquisition"}
                                    <ShoppingCart className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className={`h-20 w-20 rounded-[30px] border-2 p-0 flex-shrink-0 transition-all ${wishlisted ? 'bg-rose-50 border-rose-100 text-rose-500' : 'hover:border-rose-500 hover:text-rose-500'}`}
                                    onClick={handleToggleWishlist}
                                    disabled={wishlistLoading}
                                >
                                    <Heart className={`h-6 w-6 ${wishlisted ? "fill-rose-500" : ""}`} />
                                </Button>
                            </div>

                            <div className="pt-8 border-t-2 border-slate-50 grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Truck className="h-6 w-6" /></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Global Logistics</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight italic">Complimentary transit for acquisitions exceeding 100.00 Credits.</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShieldCheck className="h-6 w-6" /></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Ironclad Protocol</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight italic">365-day extended validation and hardware protection cycles included.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <section className="mt-40 max-w-5xl">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Social Proof Protocol</span>
                            <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">Voter <br />Consensus</h2>
                        </div>
                        {reviews.length > 0 && (
                            <div className="flex gap-12">
                                <div className="text-center">
                                    <div className="text-5xl font-black">{avgRating}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-2">Aggregate Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl font-black">{reviews.length}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-2">Verified Logs</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8 space-y-8">
                            {reviews.length === 0 ? (
                                <div className="py-24 text-center border-4 border-dashed rounded-[48px] border-slate-50">
                                    <Award className="h-20 w-20 mx-auto text-slate-100 mb-6" />
                                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-200">Manifest Empty</h3>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-tighter mt-2">No field reports submitted for this asset yet.</p>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        key={review.id}
                                        className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col md:flex-row gap-10"
                                    >
                                        <div className="flex flex-col items-center gap-4 shrink-0">
                                            <div className="h-20 w-20 rounded-[28px] bg-white border-2 border-slate-100 flex items-center justify-center font-black text-2xl shadow-sm italic">
                                                {review.user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest">{review.user.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">Verified User</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            <div className="flex justify-between items-center">
                                                <div className="flex text-black">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-4 w-4 ${i <= review.rating ? "fill-black" : "opacity-10"}`} />)}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-lg text-slate-500 font-medium italic leading-relaxed">"{review.comment}"</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="lg:col-span-4">
                            {isAuthenticated && !reviews.some(r => r.user.id === user?.id) ? (
                                <div className="sticky top-24 p-10 bg-black text-white rounded-[48px] shadow-2xl space-y-8">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">Submit Log</h3>
                                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest italic">Asset Contribution Protocol</p>
                                    </div>
                                    <form onSubmit={handleSubmitReview} className="space-y-8">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setUserRating(star)}
                                                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all border-2 ${star <= userRating ? "bg-white text-black border-white" : "border-white/10 text-white/40 hover:border-white/20"}`}
                                                >
                                                    <Star className={`w-5 h-5 ${star <= userRating ? "fill-black" : ""}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={userComment}
                                            onChange={e => setUserComment(e.target.value)}
                                            placeholder="Transmit your conclusions..."
                                            className="w-full min-h-[160px] bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:border-white/30 transition-colors resize-none italic"
                                        />
                                        <Button type="submit" disabled={isSubmittingReview} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-[28px] font-black uppercase tracking-widest text-[10px] gap-3">
                                            {isSubmittingReview ? "Transmitting..." : "Initialize Transmission"} <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            ) : !isAuthenticated && (
                                <div className="p-10 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center text-center space-y-6">
                                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm"><Zap className="h-8 w-8" /></div>
                                    <h3 className="text-lg font-black uppercase tracking-widest">Authentication Required</h3>
                                    <p className="text-xs text-slate-400 font-bold leading-relaxed italic uppercase tracking-tighter">Log in to contribute to the social proof manifest.</p>
                                    <Link href="/auth/login" className="w-full">
                                        <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2">Initialize Login</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Related Assets */}
                {relatedProducts.length > 0 && (
                    <section className="mt-40">
                        <div className="flex justify-between items-end mb-16 px-4">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Temporal Associations</span>
                                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Similar <br />Architectures</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
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

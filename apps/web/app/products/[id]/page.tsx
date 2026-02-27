"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, Send, Heart } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    discounted?: number;
    image: string;
    stock: number;
    category?: { name: string; slug: string };
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
    const [avgRating, setAvgRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const addItem = useCartStore(state => state.addItem);
    const { isAuthenticated, user } = useAuthStore();
    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/products/${params.id}/reviews`);
            setReviews(data.reviews);
            setAvgRating(data.avgRating);
        } catch (err) {
            console.error("Failed to load reviews", err);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${params.id}`);
                setProduct({
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    discounted: data.discounted,
                    stock: data.stock,
                    image: data.gallery && data.gallery.length > 0 ? data.gallery[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
                    category: data.category,
                });
            } catch (err) {
                console.error("Failed to load product details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            productId: product.id,
            title: product.title,
            price: product.discounted ?? product.price,
            quantity,
            image: product.image
        });
        toast.success("Added to cart!");
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) { toast.error("Please log in to use wishlist"); return; }
        if (!product) return;
        setWishlistLoading(true);
        try {
            if (wishlisted) {
                await api.delete(`/wishlist/${product.id}`);
                setWishlisted(false);
                toast.success("Removed from wishlist");
            } else {
                await api.post(`/wishlist/${product.id}`);
                setWishlisted(true);
                toast.success("Added to wishlist!");
            }
        } catch {
            toast.error("Failed to update wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userRating === 0) { toast.error("Please select a rating"); return; }
        setIsSubmittingReview(true);
        try {
            await api.post(`/products/${params.id}/reviews`, { rating: userRating, comment: userComment });
            toast.success("Review submitted!");
            setUserRating(0);
            setUserComment("");
            await fetchReviews();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to submit review";
            toast.error(msg);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const hasReviewed = reviews.some(r => r.user.id === user?.id);
    const displayPrice = product?.discounted ?? product?.price;
    const originalPrice = product?.discounted ? product.price : undefined;

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
                    {product.category && (
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">{product.category.name}</span>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{product.title}</h1>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="text-2xl font-bold">${displayPrice?.toFixed(2)}</span>
                        {originalPrice !== undefined && (
                            <span className="text-lg text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
                        )}
                        {reviews.length > 0 && (
                            <div className="flex items-center text-amber-500">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} fill={i <= Math.round(avgRating) ? "currentColor" : "none"} className="w-4 h-4" />
                                ))}
                                <span className="text-muted-foreground text-sm ml-2">({reviews.length})</span>
                            </div>
                        )}
                    </div>

                    <p className="mt-6 text-base text-muted-foreground leading-relaxed">{product.description}</p>

                    {product.stock === 0 ? (
                        <p className="mt-4 text-sm font-semibold text-destructive">Out of stock</p>
                    ) : (
                        <p className="mt-4 text-sm text-muted-foreground">{product.stock} in stock</p>
                    )}

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex items-center border rounded-md h-12">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-lg hover:bg-muted transition-colors rounded-l-md">-</button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 text-lg hover:bg-muted transition-colors rounded-r-md">+</button>
                        </div>
                        <Button size="lg" className="h-12 flex-1 rounded-full shadow-lg" onClick={handleAddToCart} disabled={product.stock === 0}>
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

            {/* Reviews Section */}
            <section className="mt-20 border-t pt-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
                        {reviews.length > 0 && (
                            <p className="text-muted-foreground mt-1">{avgRating} out of 5 &bull; {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                        )}
                    </div>
                </div>

                {/* Submit Review Form */}
                {isAuthenticated && !hasReviewed && (
                    <div className="border rounded-xl p-6 bg-card mb-10">
                        <h3 className="font-semibold mb-4">Write a Review</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setUserRating(star)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-7 h-7 ${star <= userRating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={userComment}
                                onChange={e => setUserComment(e.target.value)}
                                placeholder="Share your thoughts about this product (optional)"
                                className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                            <Button type="submit" disabled={isSubmittingReview} className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                            </Button>
                        </form>
                    </div>
                )}

                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/20">
                        <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No reviews yet</p>
                        <p className="text-sm mt-1">Be the first to review this product.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map(review => (
                            <div key={review.id} className="border rounded-xl p-6 bg-card">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                                            {review.user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{review.user.name || 'Anonymous'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                                        ))}
                                    </div>
                                </div>
                                {review.comment && <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

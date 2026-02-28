"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { analytics } from "@/lib/analytics";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    discounted?: number | null;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated } = useAuthStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const displayPrice = product.discounted ?? product.price;
  const hasDiscount = product.discounted && product.discounted < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - displayPrice) / product.price) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      price: displayPrice,
      quantity: 1,
      image: product.image,
    });
    analytics.track("ADD_TO_CART", {
      productId: product.id,
      title: product.title,
      price: displayPrice,
      location: "product_card",
    });
    toast.success("Added to bag");
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Sign in to save favorites");
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setWishlisted(false);
        toast.success("Removed from favorites");
      } else {
        await api.post(`/wishlist/${product.id}`);
        setWishlisted(true);
        toast.success("Saved to favorites");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .pc-root {
          position: relative;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
        }

        /* Image wrapper */
        .pc-img-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #ede9e3;
        }
        .pc-img-wrap img {
          transition: transform .75s cubic-bezier(.4,0,.2,1);
        }
        .pc-root:hover .pc-img-wrap img {
          transform: scale(1.07);
        }

        /* Scrim */
        .pc-scrim {
          position: absolute;
          inset: 0;
          background: rgba(10,10,10,0);
          transition: background .4s;
          z-index: 1;
        }
        .pc-root:hover .pc-scrim {
          background: rgba(10,10,10,.08);
        }

        /* Badges */
        .pc-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 3;
          font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
          background: #c8ff00;
          color: #0a0a0a;
          line-height: 1.4;
        }

        /* Wishlist btn */
        .pc-wish {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 3;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245,243,239,.88);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(10,10,10,.1);
          color: #8a8a8a;
          cursor: pointer;
          transition: color .2s, background .2s, transform .2s, opacity .3s;
          opacity: 0;
          transform: translateY(-4px);
        }
        .pc-root:hover .pc-wish,
        .pc-wish.active {
          opacity: 1;
          transform: translateY(0);
        }
        .pc-wish:hover { background: #fff; color: #e11d48; }
        .pc-wish.wishlisted { color: #e11d48; }

        /* Quick add bar */
        .pc-add {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 16px;
          background: #0a0a0a;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
          transform: translateY(100%);
          transition: transform .35s cubic-bezier(.4,0,.2,1);
          border: none;
          width: 100%;
        }
        .pc-add:hover { background: #c8ff00; color: #0a0a0a; }
        .pc-root:hover .pc-add { transform: translateY(0); }

        /* Info */
        .pc-info {
          padding: 16px 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-top: 1px solid rgba(10,10,10,.06);
        }
        .pc-title {
          font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          color: #0a0a0a;
          line-height: 1.2;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .pc-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 2px;
        }
        .pc-price {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 500;
          color: #0a0a0a;
        }
        .pc-price-orig {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #aaa;
          text-decoration: line-through;
        }
      `}</style>

      <motion.div
        className="pc-root"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <Link href={`/products/${product.id}`} className="block" style={{ textDecoration: "none" }}>
          {/* Image */}
          <div className="pc-img-wrap">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            <div className="pc-scrim" />

            {/* Discount badge */}
            {discountPct && (
              <span className="pc-badge">−{discountPct}%</span>
            )}

            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className={`pc-wish ${wishlisted ? "wishlisted active" : ""}`}
              aria-label={wishlisted ? "Remove from favorites" : "Save to favorites"}
            >
              <Heart size={16} fill={wishlisted ? "#e11d48" : "none"} />
            </button>

            {/* Quick add */}
            <button className="pc-add" onClick={handleAddToCart}>
              <ShoppingBag size={14} />
              Add to Bag
            </button>
          </div>

          {/* Info */}
          <div className="pc-info">
            <p className="pc-title">{product.title}</p>
            <div className="pc-price-row">
              <span className="pc-price">${displayPrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="pc-price-orig">${product.price.toFixed(2)}</span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </>
  );
}
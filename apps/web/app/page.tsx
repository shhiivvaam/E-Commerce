"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const { data } = await api.get('/products?limit=4');
        const formattedProducts = data.products.map((p: { id: string; title: string; description: string; price: number; gallery: string[] }) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          image: p.gallery && p.gallery.length > 0 ? p.gallery[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingProducts();
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04]" />
        <div className="container relative z-10 px-4 mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70"
          >
            Elevate Your <br className="hidden sm:block" /> Shopping Experience.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Discover hand-picked premium items designed to enhance your lifestyle. Fast shipping, secure payments.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex justify-center gap-4"
          >
            <Link href="/products">
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all h-12 px-8">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
            <Link href="/products" className="text-primary hover:underline font-medium text-sm flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl" />
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-10">
                <p className="text-muted-foreground">No trending products available right now. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="py-20 bg-muted/30 border-t border-b overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { icon: Zap, title: "Lightning Fast Delivery", desc: "Get your items within 24 hours in selected locations." },
              { icon: Shield, title: "Secure Checkout", desc: "Your payment data is encrypted and completely secure." },
              { icon: Truck, title: "Free Returns", desc: "Not satisfied? Return it within 30 days for free." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

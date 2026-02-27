"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck, ShoppingCart, Star, Award, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
  subtitle?: string;
}

export default function Home() {
  const router = useRouter();
  const [storeMode, setStoreMode] = useState<{ mode: string; productId: string | null }>({ mode: 'multi', productId: null });
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeMode.mode === 'single' && storeMode.productId) {
      router.push(`/products/${storeMode.productId}`);
    }
  }, [storeMode, router]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [settingsRes, productsRes, bannersRes] = await Promise.all([
          api.get('/settings').catch(() => ({ data: null })),
          api.get('/products?limit=8').catch(() => ({ data: { products: [] } })),
          api.get('/banners').catch(() => ({ data: [] })),
        ]);

        const settings = settingsRes.data;
        if (settings?.storeMode === 'single' && settings?.singleProductId) {
          setStoreMode({ mode: 'single', productId: settings.singleProductId });
        }

        const formattedProducts = productsRes.data.products?.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          image: p.gallery?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
        })) || [];

        setProducts(formattedProducts);
        setBanners(bannersRes.data || []);
      } catch (error) {
        console.error("Critical: Homepage intelligence failure", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Cinematic Banner / Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          {banners.length > 0 ? (
            <motion.div
              key={banners[activeBanner].id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={banners[activeBanner].imageUrl}
                alt={banners[activeBanner].title || "Luxury Feature"}
                fill
                unoptimized
                className="object-cover opacity-80"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

              <div className="container relative z-10 h-full flex flex-col justify-center px-8 md:px-20">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl space-y-6"
                >
                  <span className="inline-block px-4 py-1.5 bg-primary/20 backdrop-blur-md rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
                    {banners[activeBanner].subtitle || "Featured Collection"}
                  </span>
                  <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                    {banners[activeBanner].title || "Define Your Style."}
                  </h1>
                  <p className="text-lg md:text-xl text-white/60 font-medium max-w-lg leading-relaxed">
                    Discover the intersection of meticulous craftsmanship and modern aesthetics. Only at <span className="text-white">AdminOS Store</span>.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-6">
                    <Link href={banners[activeBanner].linkUrl || "/products"}>
                      <Button size="lg" className="rounded-2xl h-16 px-10 gap-3 text-sm font-black uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] transition-transform active:scale-95 group">
                        Explore Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" size="lg" className="rounded-2xl h-16 px-10 border-white/20 text-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest text-sm bg-white/5 backdrop-blur-sm">
                        View Gallery
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
              <div className="container">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-8">
                  <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">THE NEXT ERA OF <br />COMMERCE.</h1>
                  <p className="text-xl text-white/50 font-medium max-w-xl">A curated selection of world-class products, delivered with unmatched speed and precision.</p>
                  <Link href="/products">
                    <Button size="lg" className="rounded-2xl h-16 px-12 gap-3 text-sm font-black uppercase tracking-widest">
                      Start Shopping <ArrowRight />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Progress indicators for banners */}
        {banners.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                className={`group relative h-1 transition-all duration-500 overflow-hidden ${i === activeBanner ? 'w-16' : 'w-4 hover:w-8'}`}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full" />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: i === activeBanner ? 0 : "-100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="absolute inset-0 bg-white rounded-full"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Stats Bar */}
      <section className="py-8 border-b-2 bg-white flex items-center">
        <div className="container px-8 flex flex-wrap justify-between items-center gap-10 opacity-40">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em]"><Award className="h-4 w-4" /> Global Recognition</div>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em]"><Shield className="h-4 w-4" /> Secure Protocol</div>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em]"><Zap className="h-4 w-4" /> Instant Response</div>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em]"><TrendingUp className="h-4 w-4" /> High Velocity</div>
        </div>
      </section>

      {/* Featured / Trending Section */}
      <section className="py-32 relative">
        <div className="container px-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Curated Intelligence</span>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">The Trending <br /> Protocol</h2>
            </div>
            <Link href="/products">
              <Button variant="link" className="text-xs font-black uppercase tracking-widest gap-2 bg-slate-50 px-6 py-8 rounded-2xl hover:bg-slate-100 transition-colors h-auto no-underline">
                View Complete Gallery <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-slate-100 animate-pulse rounded-[40px]" />
                  <div className="h-6 bg-slate-100 animate-pulse rounded-full w-2/3" />
                  <div className="h-10 bg-slate-100 animate-pulse rounded-full w-1/3" />
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((p, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  key={p.id}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed">
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Inventory Sync pending...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-24 bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
        <div className="container px-8 mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
          {[
            { icon: Zap, title: "EXPRESS FLOW", desc: "Proprietary logistics engine ensuring delivery cycles under 48 hours for premium members." },
            { icon: Shield, title: "IRONCLAD GATEWAY", desc: "Military-grade encryption securing every transaction point and data node in our network." },
            { icon: Truck, title: "FLUX RETURNS", desc: "No questions asked. Seamless reversal of any acquisition within a 30-day temporal window." },
          ].map((f, i) => (
            <div key={i} className="space-y-6">
              <div className="h-16 w-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center">
                <f.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest">{f.title}</h3>
              <p className="text-white/40 font-medium leading-relaxed italic">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-40 bg-white">
        <div className="container px-8 mx-auto text-center space-y-12">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">Ready to join the <br className="hidden md:block" /><span className="text-primary italic">Elite Circle.</span></h2>
          <div className="flex justify-center flex-wrap gap-6 pt-6">
            <Link href="/auth/register">
              <Button size="lg" className="h-20 px-12 rounded-[30px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30">
                Initialize Account <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="h-20 px-12 rounded-[30px] font-black uppercase tracking-widest text-sm border-2">
                Browse Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

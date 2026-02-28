"use client";

import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag, Minus, Plus, ChevronLeft, ShieldCheck, Truck } from "lucide-react";

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCartStore();

  const freeShippingThreshold = 50;
  const remaining = Math.max(0, freeShippingThreshold - total);
  const progressPct = Math.min(100, (total / freeShippingThreshold) * 100);

  /* ── EMPTY STATE ─────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
          :root{--ink:#0a0a0a;--paper:#f5f3ef;--accent:#c8ff00;--mid:#8a8a8a;--border:rgba(10,10,10,0.1);}
        `}</style>
        <div style={{ fontFamily: "'DM Sans',sans-serif", background: "var(--paper)", color: "var(--ink)", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 12, border: "1.5px solid var(--border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mid)" }}>
              <ShoppingBag size={32} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 48, fontWeight: 900, textTransform: "uppercase", lineHeight: 1, marginBottom: 12 }}>Your Bag is Empty</h2>
              <p style={{ fontSize: 15, fontWeight: 300, color: "var(--mid)", maxWidth: 340 }}>Start adding items to see them here and check out when you're ready.</p>
            </div>
            <Link href="/products">
              <button style={{ padding: "14px 36px", borderRadius: 6, background: "var(--ink)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 10 }}>
                Browse Products <ArrowRight size={15} />
              </button>
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        :root{--ink:#0a0a0a;--paper:#f5f3ef;--accent:#c8ff00;--mid:#8a8a8a;--border:rgba(10,10,10,0.1);--card:#fff;}

        .cp-wrap { font-family:'DM Sans',sans-serif;background:var(--paper);color:var(--ink);min-height:100vh; }
        .font-display { font-family:'Barlow Condensed',sans-serif; }

        .cp-header { background:var(--ink);padding:80px 0 48px;position:relative;overflow:hidden; }
        .cp-header-noise {
          position:absolute;inset:0;opacity:.03;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:200px;
        }
        .cp-header-inner { max-width:1400px;margin:0 auto;padding:0 32px;position:relative;z-index:1; }

        .cp-back {
          display:inline-flex;align-items:center;gap:8px;
          font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;
          color:rgba(255,255,255,.4);text-decoration:none;margin-bottom:28px;
          transition:color .2s;
        }
        .cp-back:hover { color:#fff; }

        .cp-ship-bar {
          margin-top:24px;padding:16px 20px;border-radius:8px;
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          display:flex;flex-direction:column;gap:10px;max-width:480px;
        }
        .cp-ship-text { font-size:13px;font-weight:300;color:rgba(255,255,255,.55); }
        .cp-ship-text strong { color:#fff;font-weight:500; }
        .cp-progress-track { height:3px;background:rgba(255,255,255,.12);border-radius:2px;overflow:hidden; }
        .cp-progress-fill { height:100%;background:var(--accent);border-radius:2px;transition:width .6s cubic-bezier(.4,0,.2,1); }

        .cp-grid {
          max-width:1400px;margin:0 auto;padding:48px 32px 96px;
          display:grid;grid-template-columns:1fr;gap:32px;
        }
        @media(min-width:1024px){ .cp-grid{grid-template-columns:1fr 400px;gap:48px;align-items:start;} }

        .cp-items-head {
          display:flex;justify-content:space-between;align-items:center;
          padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:16px;
        }
        .cp-col-label { font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--mid); }

        .cp-item {
          display:flex;align-items:flex-start;gap:20px;
          padding:20px;border-radius:8px;border:1.5px solid var(--border);
          background:var(--card);margin-bottom:10px;
          transition:border-color .2s;
        }
        .cp-item:hover { border-color:rgba(10,10,10,.2); }

        .cp-item-img { position:relative;width:90px;height:108px;border-radius:6px;overflow:hidden;background:#ede9e3;flex-shrink:0; }

        .cp-item-body { flex:1;min-width:0;display:flex;flex-direction:column;gap:10px; }
        .cp-item-title {
          font-family:'Barlow Condensed',sans-serif;
          font-size:17px;font-weight:700;text-transform:uppercase;letter-spacing:.02em;
          color:var(--ink);text-decoration:none;display:block;line-height:1.2;
          overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
          transition:opacity .2s;
        }
        .cp-item-title:hover { opacity:.6; }
        .cp-item-sku { font-size:11px;color:var(--mid);font-weight:300; }

        .cp-item-controls { display:flex;align-items:center;gap:10px; }
        .cp-qty { display:inline-flex;align-items:center;border:1.5px solid var(--border);border-radius:6px;overflow:hidden; }
        .cp-qty-btn { width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;color:var(--ink);transition:background .2s; }
        .cp-qty-btn:hover { background:rgba(10,10,10,.05); }
        .cp-qty-val { width:34px;text-align:center;font-size:14px;font-weight:500; }

        .cp-remove {
          width:34px;height:34px;border-radius:6px;border:1.5px solid var(--border);
          background:transparent;cursor:pointer;color:rgba(10,10,10,.3);
          display:flex;align-items:center;justify-content:center;
          transition:border-color .2s,color .2s,background .2s;
        }
        .cp-remove:hover { border-color:#e11d48;color:#e11d48;background:#fff0f3; }

        .cp-item-price { text-align:right;flex-shrink:0;padding-left:8px; }
        .cp-item-total { font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;white-space:nowrap; }
        .cp-item-unit { font-size:11px;font-weight:300;color:var(--mid);margin-top:3px;white-space:nowrap; }

        /* Summary */
        .cp-summary { background:var(--ink);color:#fff;border-radius:8px;padding:32px;position:sticky;top:88px; }
        .cp-summary-title { font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:900;text-transform:uppercase;margin-bottom:28px; }

        .cp-srow { display:flex;justify-content:space-between;align-items:baseline;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.08); }
        .cp-srow:last-of-type { border-bottom:none; }
        .cp-skey { font-size:12px;font-weight:300;color:rgba(255,255,255,.4); }
        .cp-sval { font-size:14px;font-weight:400; }
        .cp-sval.free { color:var(--accent); }
        .cp-sval.muted { color:rgba(255,255,255,.3);font-size:12px;font-weight:300; }

        .cp-total-row { display:flex;justify-content:space-between;align-items:flex-end;padding:24px 0 28px;border-top:1px solid rgba(255,255,255,.12); }
        .cp-total-label { font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.35);display:block;margin-bottom:4px; }
        .cp-total-sub { font-size:11px;font-weight:300;color:rgba(255,255,255,.25); }
        .cp-total-amt { font-family:'Barlow Condensed',sans-serif;font-size:48px;font-weight:900;line-height:1;color:var(--accent); }

        .cp-checkout {
          width:100%;height:52px;border-radius:6px;border:none;
          background:var(--accent);color:var(--ink);cursor:pointer;
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
          letter-spacing:.1em;text-transform:uppercase;
          display:flex;align-items:center;justify-content:center;gap:10px;
          transition:opacity .2s,transform .15s;margin-bottom:14px;
        }
        .cp-checkout:hover { opacity:.88;transform:translateY(-1px); }

        .cp-trust { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
        .cp-trust-item { display:flex;align-items:center;gap:8px;padding:11px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.08);font-size:11px;color:rgba(255,255,255,.35); }
        .cp-trust-dot { width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0; }
      `}</style>

      <div className="cp-wrap">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="cp-header">
          <div className="cp-header-noise" />
          <div className="cp-header-inner">
            <Link href="/products" className="cp-back">
              <ChevronLeft size={14} /> Continue Shopping
            </Link>
            <h1 className="font-display" style={{ fontSize: "clamp(44px,7vw,80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 1, letterSpacing: "-.01em", color: "#fff" }}>
              Your Bag
              <span style={{ marginLeft: 20, fontSize: "clamp(24px,3vw,40px)", color: "rgba(255,255,255,.25)", fontWeight: 700 }}>
                {items.length}
              </span>
            </h1>

            <div className="cp-ship-bar">
              <p className="cp-ship-text">
                {remaining > 0
                  ? <><strong>${remaining.toFixed(2)}</strong> away from free shipping</>
                  : <strong style={{ color: "var(--accent)" }}>Free shipping unlocked 🎉</strong>
                }
              </p>
              <div className="cp-progress-track">
                <div className="cp-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN GRID ──────────────────────────────────────── */}
        <div className="cp-grid">

          {/* Items */}
          <div>
            <div className="cp-items-head">
              <span className="cp-col-label">{items.length} Item{items.length !== 1 ? "s" : ""}</span>
              <span className="cp-col-label">Price</span>
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: .25 } }}
                  className="cp-item"
                >
                  <div className="cp-item-img">
                    <Image src={item.image ?? ""} alt={item.title} fill unoptimized className="object-cover" />
                  </div>

                  <div className="cp-item-body">
                    <div>
                      <Link href={`/products/${item.productId}`} className="cp-item-title">{item.title}</Link>
                      <p className="cp-item-sku">SKU: {item.productId.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="cp-item-controls">
                      <div className="cp-qty">
                        <button className="cp-qty-btn" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Minus size={13} /></button>
                        <span className="cp-qty-val">{item.quantity}</span>
                        <button className="cp-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={13} /></button>
                      </div>
                      <button className="cp-remove" onClick={() => removeItem(item.id)} aria-label="Remove">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="cp-item-price">
                    <p className="cp-item-total">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="cp-item-unit">${item.price.toFixed(2)} each</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div>
            <div className="cp-summary">
              <h2 className="cp-summary-title">Summary</h2>

              <div className="cp-srow">
                <span className="cp-skey">Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                <span className="cp-sval">${total.toFixed(2)}</span>
              </div>
              <div className="cp-srow">
                <span className="cp-skey">Shipping</span>
                <span className={`cp-sval ${total >= freeShippingThreshold ? "free" : ""}`}>
                  {total >= freeShippingThreshold ? "Free" : "At checkout"}
                </span>
              </div>
              <div className="cp-srow">
                <span className="cp-skey">Tax</span>
                <span className="cp-sval muted">At checkout</span>
              </div>

              <div className="cp-total-row">
                <div>
                  <span className="cp-total-label">Estimated Total</span>
                  <p className="cp-total-sub">Final amount shown at checkout</p>
                </div>
                <span className="cp-total-amt">${total.toFixed(2)}</span>
              </div>

              <Link href="/checkout">
                <button className="cp-checkout">
                  Checkout <ArrowRight size={16} />
                </button>
              </Link>

              <div className="cp-trust">
                <div className="cp-trust-item"><span className="cp-trust-dot" /><ShieldCheck size={13} /> Secure</div>
                <div className="cp-trust-item"><span className="cp-trust-dot" /><Truck size={13} /> Fast Delivery</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users as UsersIcon, Activity } from "lucide-react";

export default function AdminOverview() {
    const kpis = [
        { title: "Total Revenue", value: "$45,231.89", icon: DollarSign, trend: "+20.1% from last month" },
        { title: "Subscriptions", value: "+2350", icon: UsersIcon, trend: "+180.1% from last month" },
        { title: "Sales", value: "+12,234", icon: ShoppingBag, trend: "+19% from last month" },
        { title: "Active Now", value: "+573", icon: Activity, trend: "+201 since last hour" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground mt-2">Welcome back. Here&apos;s what&apos;s happening with your store today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6"
                    >
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{kpi.title}</h3>
                            <kpi.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">{kpi.trend}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="rounded-xl border bg-card text-card-foreground shadow col-span-4 min-h-[400px] flex items-center justify-center p-6"
                >
                    <div className="text-center text-muted-foreground">
                        <Activity className="h-10 w-10 mx-auto mb-4 opacity-50" />
                        <p>Revenue Chart Visualization (Requires Recharts or similar)</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="rounded-xl border bg-card text-card-foreground shadow col-span-3 p-6"
                >
                    <h3 className="font-semibold text-lg mb-4">Recent Sales</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                                    U{i}
                                </div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Customer {i}</p>
                                    <p className="text-sm text-muted-foreground">customer{i}@example.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$1,999.00</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Package, Clock, CheckCircle, Truck, XCircle, RefreshCcw } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'PROCESSING': return 'bg-blue-100 text-blue-800';
        case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
        case 'DELIVERED': return 'bg-green-100 text-green-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        case 'RETURNED': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'PENDING': return <Clock className="h-4 w-4" />;
        case 'PROCESSING': return <RefreshCcw className="h-4 w-4" />;
        case 'SHIPPED': return <Truck className="h-4 w-4" />;
        case 'DELIVERED': return <CheckCircle className="h-4 w-4" />;
        case 'CANCELLED': return <XCircle className="h-4 w-4" />;
        case 'RETURNED': return <RefreshCcw className="h-4 w-4" />;
        default: return <Package className="h-4 w-4" />;
    }
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<{
        id: string;
        createdAt: string;
        totalAmount: number;
        status: string;
        items: {
            id: string;
            productTitle: string;
            quantity: number;
            price: number;
        }[];
    }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();

        if (searchParams.get('success') === 'true') {
            toast.success('Your order was placed successfully!');
        }
    }, [searchParams]);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card/50 px-4">
                <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-2xl font-semibold tracking-tight mb-2">No orders yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                    Looks like you haven&apos;t made your first purchase. Explore our catalog and find something you love!
                </p>
                <Link href="/products">
                    <Button>Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
            <p className="text-muted-foreground">View your recent orders and track their delivery status.</p>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-xl bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
                        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 border-b">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                                <p className="font-mono text-sm">{order.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date Placed</p>
                                <p className="font-semibold text-sm">
                                    {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                <p className="font-bold text-lg">${order.totalAmount.toFixed(2)}</p>
                            </div>
                            <div className="sm:text-right">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Items Included
                            </h4>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium line-clamp-1">{item.productTitle}</span>
                                            <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

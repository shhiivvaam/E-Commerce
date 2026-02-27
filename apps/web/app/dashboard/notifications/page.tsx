"use client";

import { Bell, Package, Tag, MessageSquare } from "lucide-react";

const MOCK_NOTIFICATIONS = [
    {
        id: "1",
        type: "order",
        icon: Package,
        iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
        title: "Order Shipped",
        message: "Your order #ord_abc123 has been shipped and is on its way.",
        time: "2 hours ago",
        read: false,
    },
    {
        id: "2",
        type: "promo",
        icon: Tag,
        iconColor: "text-green-500 bg-green-50 dark:bg-green-950/40",
        title: "New Coupon Available",
        message: "Use code SAVE20 to get 20% off your next order over $50.",
        time: "1 day ago",
        read: false,
    },
    {
        id: "3",
        type: "review",
        icon: MessageSquare,
        iconColor: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
        title: "Review Request",
        message: "How was your recent purchase? Leave a review and help others decide.",
        time: "3 days ago",
        read: true,
    },
];

export default function NotificationsPage() {
    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground mt-1">Stay updated on your orders and offers.</p>
            </div>

            <div className="space-y-3">
                {MOCK_NOTIFICATIONS.map((notif) => (
                    <div
                        key={notif.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${notif.read ? "bg-card" : "bg-primary/5 border-primary/20"}`}
                    >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.iconColor}`}>
                            <notif.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className={`font-semibold text-sm ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                                    {notif.title}
                                </p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                        {!notif.read && (
                            <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center py-6 text-sm text-muted-foreground border-t">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>You&apos;re all caught up! Check back later for new updates.</p>
            </div>
        </div>
    );
}

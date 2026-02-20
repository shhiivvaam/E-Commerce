"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const MOCK_PRODUCTS = [
    { id: "PROD-001", name: "Premium Wireless Headphones", category: "Audio", price: "$299.99", stock: 45, status: "Active" },
    { id: "PROD-002", name: "Minimalist Smartwatch", category: "Wearables", price: "$199.99", stock: 12, status: "Low Stock" },
    { id: "PROD-003", name: "Mechanical Keyboard", category: "Accessories", price: "$149.99", stock: 0, status: "Out of Stock" },
    { id: "PROD-004", name: "Polaroid Camera", category: "Photography", price: "$129.99", stock: 89, status: "Active" },
];

export default function AdminProductsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground mt-1">Manage your store inventory, pricing, and variants.</p>
                </div>
                <Button className="shrink-0 gap-2">
                    <Plus className="h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-4 border-b flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search products..." className="pl-8 bg-background" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Export CSV</Button>
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Product</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Price</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Stock</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground"></th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {MOCK_PRODUCTS.map((product, i) => (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    <td className="p-4 align-middle font-medium">{product.name}</td>
                                    <td className="p-4 align-middle text-muted-foreground">{product.category}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right">{product.price}</td>
                                    <td className="p-4 align-middle text-right">{product.stock}</td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

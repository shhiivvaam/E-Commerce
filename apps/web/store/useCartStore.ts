import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // Internal cart item id
    productId: string;
    variantId?: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            total: 0,
            addItem: (newItem) => {
                set((state) => {
                    const existingItem = state.items.find(
                        (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
                    );

                    let updatedItems;
                    if (existingItem) {
                        updatedItems = state.items.map((i) =>
                            i.id === existingItem.id
                                ? { ...i, quantity: i.quantity + newItem.quantity }
                                : i
                        );
                    } else {
                        updatedItems = [...state.items, { ...newItem, id: Math.random().toString(36).substring(7) }];
                    }

                    const total = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    return { items: updatedItems, total };
                });
            },
            removeItem: (id) => {
                set((state) => {
                    const updatedItems = state.items.filter((i) => i.id !== id);
                    const total = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    return { items: updatedItems, total };
                });
            },
            updateQuantity: (id, quantity) => {
                set((state) => {
                    const updatedItems = state.items.map((i) =>
                        i.id === id ? { ...i, quantity } : i
                    );
                    const total = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    return { items: updatedItems, total };
                });
            },
            clearCart: () => set({ items: [], total: 0 }),
        }),
        {
            name: 'ecommerce-cart',
        }
    )
);

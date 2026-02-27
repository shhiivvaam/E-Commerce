"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const [newAddress, setNewAddress] = useState({
        street: "",
        city: "",
        state: "NY",
        zipCode: "",
        country: "US",
        isDefault: false
    });

    const fetchAddresses = async () => {
        try {
            const { data } = await api.get('/addresses');
            setAddresses(data);
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
            toast.error("Could not load your addresses.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSaveAddress = async () => {
        if (!newAddress.street || !newAddress.city || !newAddress.zipCode) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            await api.post('/addresses', newAddress);
            toast.success("Address added successfully.");
            setIsAdding(false);
            setNewAddress({ street: "", city: "", state: "NY", zipCode: "", country: "US", isDefault: false });
            fetchAddresses();
        } catch (error) {
            console.error("Failed to save address:", error);
            toast.error("Could not save address.");
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;

        try {
            await api.delete(`/addresses/${id}`);
            toast.success("Address deleted.");
            fetchAddresses();
        } catch (error) {
            console.error("Failed to delete address:", error);
            toast.error("Could not delete address.");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await api.patch(`/addresses/${id}`, { isDefault: true });
            toast.success("Default address updated.");
            fetchAddresses();
        } catch (error) {
            console.error("Failed to update address:", error);
            toast.error("Could not update default address.");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading addresses...</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Saved Addresses</h1>
                    <p className="text-muted-foreground mt-1">Manage your shipping and delivery addresses.</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add New Address
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="bg-muted/10 p-6 rounded-xl border space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" /> Add a new address
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium">Street Address</label>
                            <Input value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} placeholder="123 Main St" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <Input value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="New York" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">State / Province</label>
                            <Input value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} placeholder="NY" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ZIP Code</label>
                            <Input value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} placeholder="10001" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Country</label>
                            <Input value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} placeholder="US" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isDefault" className="text-sm text-foreground">Set as default shipping address</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                        <Button onClick={handleSaveAddress}>Save Address</Button>
                    </div>
                </div>
            )}

            {!isAdding && addresses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card/50 px-4">
                    <MapPin className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold tracking-tight mb-2">No addresses saved</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Add an address to make your checkout experience faster and easier next time.
                    </p>
                    <Button onClick={() => setIsAdding(true)} variant="outline">Add Your First Address</Button>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                    <div key={addr.id} className={`p-6 rounded-xl border relative transition-all ${addr.isDefault ? 'border-primary bg-primary/5 shadow-sm' : 'bg-card hover:border-border/80'}`}>
                        {addr.isDefault && (
                            <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                <Star className="h-3 w-3 fill-primary" /> Default
                            </div>
                        )}

                        <div className="mb-4 pr-16 space-y-1">
                            <p className="font-medium text-lg">{addr.street}</p>
                            <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                            <p className="text-muted-foreground">{addr.country}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-border/40 mt-auto">
                            {!addr.isDefault && (
                                <Button variant="secondary" size="sm" onClick={() => handleSetDefault(addr.id)} className="h-8 text-xs flex-1">
                                    Set as Default
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(addr.id)} className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 sm:flex-none">
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

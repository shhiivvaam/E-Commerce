"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DashboardOverviewPage() {
    const { user, updateUser, logout } = useAuthStore();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user?.name) {
            const parts = user.name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const newName = `${firstName} ${lastName}`.trim();
            await api.patch("/users/me", { name: newName });

            updateUser({ name: newName });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        setIsDeleting(true);
        try {
            await api.delete("/users/me");
            toast.success("Account deleted");
            logout();
            router.push("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete account");
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Personal Information</h1>
                <p className="text-muted-foreground mt-1">Manage your account details and preferences.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">First Name</label>
                        <Input
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="First Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Last Name</label>
                        <Input
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="Last Name"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <Input type="email" value={user?.email || ''} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">To change your email address, please contact support.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input type="tel" placeholder="+1 (555) 000-0000" disabled />
                    <p className="text-xs text-muted-foreground">Phone number updates not currently supported.</p>
                </div>

                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </form>

            <div className="pt-6 border-t mt-10">
                <h2 className="text-xl font-bold text-destructive mb-4">Danger Zone</h2>
                <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
            </div>
        </motion.div>
    );
}

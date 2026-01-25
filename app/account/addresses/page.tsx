"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, MapPin, Trash2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc, query, where } from "firebase/firestore";
import { Address } from "@/types/user";

export default function AddressesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State
    const [newLabel, setNewLabel] = useState("");
    const [newAddress, setNewAddress] = useState("");

    useEffect(() => {
        if (user) {
            fetchAddresses();
        } else if (!loading) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const fetchAddresses = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const q = query(collection(db, "users", user.uid, "addresses"));
            const querySnapshot = await getDocs(q);
            const fetchedAddresses: Address[] = [];
            querySnapshot.forEach((doc) => {
                fetchedAddresses.push({ id: doc.id, ...doc.data() } as Address);
            });
            // Sort: Default first
            fetchedAddresses.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
            setAddresses(fetchedAddresses);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAddress = async () => {
        if (!user || !newLabel || !newAddress) return;
        try {
            const isFirst = addresses.length === 0;
            await addDoc(collection(db, "users", user.uid, "addresses"), {
                label: newLabel,
                address: newAddress,
                isDefault: isFirst // First address is default by default
            });
            setNewLabel("");
            setNewAddress("");
            setIsAdding(false);
            fetchAddresses();
        } catch (error) {
            console.error("Error adding address:", error);
            alert("Failed to add address.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!user || !confirm("Are you sure you want to delete this address?")) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "addresses", id));
            fetchAddresses();
        } catch (error) {
            console.error("Error deleting address:", error);
            alert("Failed to delete address.");
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!user) return;
        try {
            // 1. Remove default from current default
            const currentDefault = addresses.find(a => a.isDefault);
            if (currentDefault) {
                await updateDoc(doc(db, "users", user.uid, "addresses", currentDefault.id), { isDefault: false });
            }
            // 2. Set new default
            await updateDoc(doc(db, "users", user.uid, "addresses", id), { isDefault: true });
            fetchAddresses();
        } catch (error) {
            console.error("Error setting default:", error);
            alert("Failed to set default address.");
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-14 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900">Saved Addresses</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-lg pt-6 px-4">
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-10 text-gray-400">Loading addresses...</div>
                    ) : (
                        <>
                            {addresses.map((addr) => (
                                <div key={addr.id} className={`bg-white border rounded-2xl p-4 shadow-sm flex items-start gap-4 transition-all ${addr.isDefault ? 'border-primary/50 ring-1 ring-primary/10' : 'border-gray-200'}`}>
                                    <div className={`mt-1 p-2 rounded-full ${addr.isDefault ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                                        <MapPin size={20} />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{addr.label}</h3>
                                            {addr.isDefault && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Default</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed mb-3">{addr.address}</p>
                                        
                                        <div className="flex gap-3">
                                            {!addr.isDefault && (
                                                <button 
                                                    onClick={() => handleSetDefault(addr.id)}
                                                    className="text-xs font-medium text-gray-500 hover:text-primary transition-colors"
                                                >
                                                    Set as Default
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(addr.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            {addresses.length === 0 && !isAdding && (
                                <div className="text-center py-10 text-gray-400">No addresses saved yet.</div>
                            )}
                        </>
                    )}

                    {isAdding ? (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="font-bold text-gray-900 mb-4">Add New Address</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Label</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Home, Work" 
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Address</label>
                                    <textarea 
                                        placeholder="Street, City, Zip Code" 
                                        value={newAddress}
                                        onChange={(e) => setNewAddress(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none h-24 resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button onClick={handleAddAddress} className="flex-1">Save Address</Button>
                                    <Button variant="outline" onClick={() => setIsAdding(false)} className="flex-1">Cancel</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            Add New Address
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

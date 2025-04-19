import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const CartTab = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchCartItems(user.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchCartItems = async (userId) => {
        try {
            const cartRef = doc(db, "carts", userId);
            const cartSnap = await getDoc(cartRef);
            if (cartSnap.exists()) {
                setCartItems(cartSnap.data().items || []);
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
            toast.error("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const cartRef = doc(db, "carts", userId);
            const cartSnap = await getDoc(cartRef);
            
            if (cartSnap.exists()) {
                const itemToRemove = cartSnap.data().items.find(item => item.productId === productId);
                if (itemToRemove) {
                    await updateDoc(cartRef, {
                        items: arrayRemove(itemToRemove),
                        updatedAt: new Date().toISOString()
                    });
                    setCartItems(cartItems.filter(item => item.productId !== productId));
                    toast.success("Item removed from cart");
                }
            }
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error("Failed to remove item");
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const cartRef = doc(db, "carts", userId);
            const updatedItems = cartItems.map(item => 
                item.productId === productId ? { ...item, quantity: newQuantity } : item
            );
            
            await updateDoc(cartRef, {
                items: updatedItems,
                updatedAt: new Date().toISOString()
            });
            setCartItems(updatedItems);
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Failed to update quantity");
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    if (loading) {
        return <div className="text-center py-8">Loading cart...</div>;
    }

    if (!auth.currentUser) {
        return (
            <div className="text-center py-8">
                <p className="mb-4">Please login to view your cart</p>
                <Button onClick={() => navigate("/login")}>Login</Button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return <div className="text-center py-8">Your cart is empty</div>;
    }

    return (
        <div className="space-y-6">
            <Table>
                <TableCaption>Your Shopping Cart</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cartItems.map((item) => (
                        <TableRow key={item.productId}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    {item.name}
                                </div>
                            </TableCell>
                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </Button>
                                    <span>{item.quantity}</span>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    >
                                        +
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                            <TableCell>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeFromCart(item.productId)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-end">
                <div className="w-full max-w-md space-y-4 border p-6 rounded-lg">
                    <div className="flex justify-between">
                        <span className="font-medium">Subtotal:</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Shipping:</span>
                        <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <Button className="w-full mt-4" onClick={() => navigate("/checkout")}>
                        Proceed to Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartTab;
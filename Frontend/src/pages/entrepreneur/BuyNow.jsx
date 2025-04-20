import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { db, auth } from "../../firebase";
import { doc, addDoc, collection, updateDoc, getDoc, runTransaction } from "firebase/firestore";

const BuyNow = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state || {};
    let cartItems = [];
    let total = 0;

    if (Array.isArray(state.items)) {
        cartItems = state.items;
        total = state.totalAmount || 0;
    } else if (state.product) {
        cartItems = [{
            productId: state.product.id,
            name: state.product.name,
            price: state.product.price,
            imageUrl: state.product.imageUrl,
            quantity: state.product.quantity || 1,
            subtotal: state.product.subtotal || state.product.price
        }];
        total = state.product.subtotal || state.product.price;
    }

    const [address, setAddress] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!state.product && (!state.items || state.items.length === 0)) {
            toast.error("No items found for checkout");
            navigate('/');
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [state, navigate]);

    useEffect(() => {
        if (auth.currentUser) {
            setEmail(auth.currentUser.email || '');
            setName(auth.currentUser.displayName || '');
        }
    }, []);

    const validateForm = () => {
        if (!name.trim()) {
            toast.error("Please enter your name");
            return false;
        }
        if (!email.trim()) {
            toast.error("Please enter your email");
            return false;
        }
        if (!phone.trim() || phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return false;
        }
        if (!address.trim()) {
            toast.error("Please enter a delivery address");
            return false;
        }
        return true;
    };

    const updateProductInventory = async (productId, quantityToSubtract) => {
        const productRef = doc(db, "products", productId);

        try {
            await runTransaction(db, async (transaction) => {
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) {
                    throw new Error("Product does not exist!");
                }

                const currentStock = productDoc.data().stock || 0;
                if (currentStock < quantityToSubtract) {
                    throw new Error(`Insufficient stock for ${productDoc.data().name}`);
                }

                transaction.update(productRef, {
                    stock: currentStock - quantityToSubtract
                });
            });
        } catch (error) {
            console.error("Error updating product inventory:", error);
            throw error;
        }
    };

    const saveOrder = async (paymentId, paymentStatus, orderStatus = "pending") => {
        try {
            const userId = auth.currentUser?.uid;
            const orderData = {
                items: cartItems,
                totalAmount: total,
                address,
                name,
                email,
                phone,
                payment: {
                    id: paymentId,
                    status: paymentStatus
                },
                userId: userId || 'guest',
                createdAt: new Date().toISOString(),
                status: orderStatus
            };

            const ordersRef = collection(db, "orders");
            const orderRef = await addDoc(ordersRef, orderData);

            // Update inventory for each product in the order
            for (const item of cartItems) {
                await updateProductInventory(item.productId, item.quantity || 1);
            }

            // Only clear cart if it's a logged in user and we came from the cart
            if (userId && Array.isArray(state.items)) {
                const cartRef = doc(db, "carts", userId);
                await updateDoc(cartRef, {
                    items: [],
                    updatedAt: new Date().toISOString()
                });
            }

            return orderRef.id;
        } catch (error) {
            console.error("Error saving order:", error);
            throw new Error("Failed to save order");
        }
    };

    const handleRazorpayPayment = () => {
        if (!validateForm()) return;

        setIsProcessing(true);

        const options = {
            key: "rzp_test_rS2pK6GHbnndos",
            amount: total * 100,
            currency: "INR",
            name: "Empower Her",
            description: `Purchase of ${cartItems.length} ${cartItems.length > 1 ? 'items' : 'item'}`,
            image: "https://your-logo-url.png",
            handler: async function (response) {
                try {
                    const paymentId = response.razorpay_payment_id;
                    const orderId = await saveOrder(paymentId, "completed", "paid");

                    toast.success("Payment successful!");
                    navigate('/order-confirmation', {
                        state: {
                            orderId,
                            paymentId,
                            total,
                            cartItems
                        }
                    });
                } catch (error) {
                    toast.error("Error processing order: " + error.message);
                    console.error("Order processing error:", error);
                } finally {
                    setIsProcessing(false);
                }
            },
            prefill: {
                name,
                email,
                contact: phone
            },
            notes: {
                address
            },
            theme: {
                color: "#3399cc"
            },
            modal: {
                ondismiss: function () {
                    setIsProcessing(false);
                    toast.error("Payment cancelled");
                }
            }
        };

        try {
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            setIsProcessing(false);
            console.error("Razorpay error:", error);
            toast.error("Payment gateway error. Please try again later.");
        }
    };

    const handlePayLater = async () => {
        if (!validateForm()) return;

        setIsProcessing(true);
        try {
            const orderId = await saveOrder("pay_later", "pending");
            toast.success("Order placed successfully!");
            navigate('/order-confirmation', {
                state: {
                    orderId,
                    paymentMethod: "Cash on Delivery",
                    total,
                    cartItems
                }
            });
        } catch (error) {
            toast.error("Error processing order: " + error.message);
            console.error("Order processing error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!cartItems.length) {
        return (
            <div className="text-center py-10 space-y-4">
                <h2 className="text-xl font-semibold">Your cart is empty</h2>
                <Button onClick={() => navigate('/')}>Continue Shopping</Button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
            <h1 className="text-2xl font-semibold">Checkout</h1>

            <div className="border rounded-lg p-4 space-y-3">
                <h2 className="font-medium text-lg">Order Summary</h2>
                {cartItems.map((item, index) => (
                    <div key={`${item.productId || index}`} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {item.imageUrl && (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                />
                            )}
                            <div>
                                <h3 className="font-medium">{item.name || 'Unnamed Product'}</h3>
                                <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                            </div>
                        </div>
                        <span className="font-medium">
                            ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total Amount</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4">
                <h2 className="text-xl font-semibold">Customer Information</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full p-2 border rounded"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Delivery Address</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your complete delivery address"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Payment Method</h2>

                <div className="flex flex-col gap-3">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleRazorpayPayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Processing..." : "Pay with Razorpay"}
                    </Button>

                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={handlePayLater}
                        disabled={isProcessing}
                    >
                        Cash on Delivery
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BuyNow;
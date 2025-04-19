import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    console.log();
    // Provide safe defaults for state
    const { cartItems = [], total = 0 } = location.state || {};

    // Handle cases where user navigates directly to checkout
    React.useEffect(() => {
        if (!location.state?.cartItems) {
            toast.error("No items found for checkout");
            navigate('/Entrepreneurship'); // Redirect back to cart if empty
        }
    }, [location.state, navigate]);

    const handlePayment = () => {
        navigate('/payment-method', { 
            state: { 
                cartItems: cartItems || [],
                totalAmount: total || 0
            } 
        });
    };

    if (!cartItems?.length) {
        return (
            <div className="text-center py-10 space-y-4">
                <h2 className="text-xl font-semibold">Your cart is empty</h2>
                <Button onClick={() => navigate('/')}>Continue Shopping</Button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
            <h1 className="text-2xl font-semibold">Order Summary</h1>
            
            <div className="border rounded-lg p-4 space-y-3">
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
                    <span>₹{(total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total Amount</span>
                    <span>₹{(total || 0).toFixed(2)}</span>
                </div>
            </div>

            <Button className="w-full" onClick={handlePayment}>
                Proceed to Payment
            </Button>
        </div>
    );
};

export default Checkout;
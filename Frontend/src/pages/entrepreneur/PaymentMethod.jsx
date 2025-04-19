import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const PaymentMethodPage = () => {
    const [method, setMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, totalAmount } = location.state || {};

    const handlePay = async () => {
        if (!method) {
            toast.error('Please select a payment method');
            return;
        }

        setIsProcessing(true);

        try {
            if (method === "upi") {
                navigate('/pay-upi', { state: { totalAmount } });
            } else {
                // Simulate API call for COD order
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast.success('Order placed successfully! Cash on Delivery selected.');
                navigate('/order-confirmation', { 
                    state: { 
                        orderDetails: cartItems,
                        paymentMethod: 'COD',
                        totalAmount 
                    } 
                });
            }
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 space-y-6 p-4">
            <h2 className="text-2xl font-bold">Select Payment Method</h2>
            
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                        type="radio" 
                        name="method" 
                        value="upi" 
                        checked={method === "upi"}
                        onChange={() => setMethod('upi')}
                        className="h-5 w-5"
                    />
                    <div className="flex-1">
                        <h3 className="font-medium">Google Pay / UPI</h3>
                        <p className="text-sm text-gray-500">Instant payment using UPI apps</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                        type="radio" 
                        name="method" 
                        value="cod" 
                        checked={method === "cod"}
                        onChange={() => setMethod('cod')}
                        className="h-5 w-5"
                    />
                    <div className="flex-1">
                        <h3 className="font-medium">Cash on Delivery</h3>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <Button 
                    className="w-full mt-4" 
                    onClick={handlePay} 
                    disabled={!method || isProcessing}
                >
                    {isProcessing ? 'Processing...' : 
                     method === "upi" ? "Pay with UPI" : "Place Order (COD)"}
                </Button>
            </div>
        </div>
    );
};

export default PaymentMethodPage;
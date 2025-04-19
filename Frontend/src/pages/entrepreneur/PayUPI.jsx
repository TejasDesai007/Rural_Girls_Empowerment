import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const PayUPI = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { totalAmount } = location.state || { totalAmount: 0 };
    const [redirectFailed, setRedirectFailed] = useState(false);
    
    const upiId = "your-merchant@upi"; // Replace with your UPI ID
    const name = "Your Store Name";
    const transactionNote = `Payment for Order #${Math.floor(100000 + Math.random() * 900000)}`;

    const generateUpiLink = () => {
        return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                window.location.href = generateUpiLink();
            } catch (error) {
                setRedirectFailed(true);
                toast.error('Failed to redirect to UPI app');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (redirectFailed) {
        return (
            <div className="max-w-md mx-auto text-center mt-10 p-6 space-y-6 border rounded-lg">
                <h2 className="text-xl font-semibold">UPI Payment</h2>
                <p className="text-gray-600">Couldn't redirect to UPI app automatically.</p>
                
                <div className="p-4 bg-gray-50 rounded">
                    <p className="font-medium">Manual Payment Details:</p>
                    <p>Amount: ₹{totalAmount.toFixed(2)}</p>
                    <p>UPI ID: {upiId}</p>
                    <p>Note: {transactionNote}</p>
                </div>

                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate('/payment-method')}>
                        Back
                    </Button>
                    <Button onClick={() => {
                        window.location.href = generateUpiLink();
                    }}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto text-center mt-20 p-6 space-y-4">
            <div className="animate-pulse">
                <div className="h-16 w-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            </div>
            <h2 className="text-xl font-semibold">Redirecting to UPI Payment</h2>
            <p className="text-gray-500">Please wait while we redirect you to your UPI app...</p>
        </div>
    );
};

export default PayUPI;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AddressPage = () => {
    const [address, setAddress] = useState('');
    const navigate = useNavigate();

    const handleContinue = () => {
        if (address.trim()) {
            localStorage.setItem("deliveryAddress", address);
            navigate('/payment-method');
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 space-y-4">
            <h2 className="text-2xl font-bold">Delivery Address</h2>
            <textarea 
                className="w-full p-3 border rounded-lg"
                rows={4}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address"
            />
            <Button className="w-full" onClick={handleContinue}>
                Continue to Payment
            </Button>
        </div>
    );
};

export default AddressPage;

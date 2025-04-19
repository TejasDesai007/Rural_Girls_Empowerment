import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const RazorpayButton = ({ buttonText = "Pay Now" }) => {
  const formRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.setAttribute('data-payment_button_id', 'lF2d6UdHxfDLp8PNmYi6wvEt');
    
    // Set up an observer to detect when Razorpay injects its button
    const observer = new MutationObserver(() => {
      const razorpayButton = form.querySelector('.razorpay-payment-button');
      if (razorpayButton) {
        // Hide the original button but keep it in the DOM
        razorpayButton.style.position = 'absolute';
        razorpayButton.style.opacity = '0';
        razorpayButton.style.zIndex = '-1';
        setIsReady(true);
        observer.disconnect();
      }
    });
    
    observer.observe(form, { childList: true, subtree: true });
    form.appendChild(script);
    
    return () => {
      observer.disconnect();
      if (form) form.innerHTML = '';
    };
  }, []);
  
  const handlePayClick = () => {
    const razorpayButton = formRef.current?.querySelector('.razorpay-payment-button');
    if (razorpayButton) razorpayButton.click();
  };
  
  return (
    <div className="relative">
      <form ref={formRef} className="h-0 overflow-hidden" />
      <Button 
        onClick={handlePayClick} 
        disabled={!isReady}
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default RazorpayButton;
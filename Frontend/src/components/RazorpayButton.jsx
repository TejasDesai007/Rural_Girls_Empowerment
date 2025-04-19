import React, { useEffect, useRef } from 'react';

const RazorpayButton = () => {
  const formRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.setAttribute('data-payment_button_id', 'pl_Lay4Py24qv0EwQ');

    if (formRef.current) {
      formRef.current.appendChild(script);
    }

    return () => {
      // Optional: Cleanup
      if (formRef.current) {
        formRef.current.innerHTML = '';
      }
    };
  }, []);

  return <form ref={formRef}></form>;
};

export default RazorpayButton;

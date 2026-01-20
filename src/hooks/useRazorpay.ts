import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UseRazorpayOptions {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const useRazorpay = (options?: UseRazorpayOptions) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiatePayment = async (orderId: string, amount: number, userDetails: {
    name: string;
    email: string;
    phone: string;
  }) => {
    if (!scriptLoaded) {
      toast({
        title: "Loading...",
        description: "Payment gateway is loading. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order via edge function
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { order_id: orderId, amount }
      });

      if (error) throw error;

      const razorpayOptions = {
        key: data.razorpay_key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Aurelia Fine Dining',
        description: `Order #${orderId.slice(0, 8)}`,
        order_id: data.razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderId,
              }
            });

            if (verifyError) throw verifyError;

            toast({
              title: "Payment Successful!",
              description: "Your order has been confirmed.",
            });

            options?.onSuccess?.(verifyData);
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive"
            });
            options?.onError?.(err);
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        theme: {
          color: '#D4A543',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again when ready.",
            });
          }
        }
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast({
        title: "Payment Failed",
        description: "Could not initiate payment. Please try again.",
        variant: "destructive"
      });
      options?.onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    loading,
    scriptLoaded,
  };
};

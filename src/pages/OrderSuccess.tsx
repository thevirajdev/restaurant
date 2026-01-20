import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Clock, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
  delivery_city: string;
  estimated_delivery: string | null;
}

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pt-32 pb-20">
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <CheckCircle className="w-14 h-14 text-primary" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-display text-gradient-gold mb-4">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Thank you for your order. We're preparing your delicious food!
            </p>

            {/* Order Details Card */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-xl p-6 text-left mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-display text-xl text-primary">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-display text-xl text-foreground">₹{order.total_amount}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-foreground capitalize">{order.status}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="text-foreground">30-45 minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Address</p>
                      <p className="text-foreground">
                        {order.delivery_address}, {order.delivery_city}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-xl p-6 mb-8"
            >
              <h3 className="font-display text-lg text-foreground mb-4">Order Status</h3>
              <div className="flex justify-between relative">
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
                <div className="absolute top-3 left-0 w-1/4 h-0.5 bg-primary" />
                
                {['Confirmed', 'Preparing', 'Ready', 'Delivered'].map((step, index) => (
                  <div key={step} className="relative flex flex-col items-center z-10">
                    <div className={`w-6 h-6 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}>
                      {index === 0 && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <span className={`text-xs mt-2 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link to="/orders">
                  <FileText className="mr-2 h-5 w-5" />
                  View All Orders
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/menu">
                  Continue Shopping
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              You will receive order updates on your registered phone number.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;

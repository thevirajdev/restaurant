import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';

interface OrderItem {
  menu_item_id?: string;
  item_name: string;
  quantity: number;
  item_price: number;
}

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  delivery_address: string;
  delivery_city?: string;
  subtotal?: number;
  tax_amount?: number;
  delivery_fee?: number;
  total_amount: number;
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) { setLoading(false); return; }
      const { data: orderData } = await supabase
        .from('orders')
        .select('id, order_number, status, created_at, delivery_address, delivery_city, subtotal, tax_amount, delivery_fee, total_amount')
        .eq('id', id)
        .single();
      setOrder(orderData as any);

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('menu_item_id, item_name, quantity, item_price')
        .eq('order_id', id);
      setItems((itemsData as any) || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center text-muted-foreground">
          Order not found
        </div>
      </Layout>
    );
  }

  const steps = ['confirmed', 'preparing', 'ready', 'delivered'] as const;
  const status = (order.status || 'pending').toLowerCase();
  const indexInSteps = steps.indexOf(status as any);
  const activeIndex = indexInSteps >= 0 ? indexInSteps : -1;

  return (
    <Layout>
      <div className="min-h-screen pt-32 pb-20">
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-display text-gradient-gold mb-2">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.order_number}</p>
          </motion.div>

          {/* Status */}
          <div className="glass-card rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">Order Status</h3>
              {status === 'cancelled' ? (
                <span className="inline-flex items-center gap-1 text-sm text-destructive">
                  <XCircle className="w-4 h-4" /> Cancelled
                </span>
              ) : status === 'pending' ? (
                <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                  <Clock className="w-4 h-4" /> Pending
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-primary">
                  <CheckCircle className="w-4 h-4" /> {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              )}
            </div>
            {activeIndex >= 0 && (
              <div className="flex justify-between relative">
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
                <div className="absolute top-3 left-0 h-0.5 bg-primary" style={{ width: `${((activeIndex+1)/steps.length)*100}%` }} />
                {['Confirmed','Preparing','Ready','Delivered'].map((label, idx) => (
                  <div key={label} className="relative flex flex-col items-center z-10">
                    <div className={`w-6 h-6 rounded-full ${idx <= activeIndex ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}>
                      {idx <= activeIndex && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <span className={`text-xs mt-2 ${idx <= activeIndex ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="glass-card rounded-xl p-6 mb-8">
            <h3 className="font-display text-lg text-foreground mb-4">Items</h3>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{it.quantity}x {it.item_name}</span>
                  <span>₹{(it.item_price * it.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card rounded-xl p-6 mb-8">
            <h3 className="font-display text-lg text-foreground mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              {typeof order.subtotal === 'number' && (
                <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(0)}</span></div>
              )}
              {typeof order.delivery_fee === 'number' && (
                <div className="flex justify-between"><span>Delivery Fee</span><span>{Number(order.delivery_fee) === 0 ? 'FREE' : `₹${Number(order.delivery_fee).toFixed(0)}`}</span></div>
              )}
              {typeof order.tax_amount === 'number' && (
                <div className="flex justify-between"><span>GST</span><span>₹{Number(order.tax_amount).toFixed(0)}</span></div>
              )}
              <div className="flex justify-between font-medium"><span>Total</span><span>₹{Number(order.total_amount).toFixed(0)}</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/orders"><FileText className="mr-2 h-4 w-4" />Back to Orders</Link>
            </Button>
            <Button variant="gold" asChild>
              <Link to="/menu">Order Again</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

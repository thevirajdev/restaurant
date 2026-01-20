import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Truck, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
  subtotal?: number;
  tax_amount?: number;
  delivery_fee?: number;
  order_items: {
    menu_item_id?: string;
    item_name: string;
    quantity: number;
    item_price: number;
  }[];
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500', label: 'Confirmed' },
  preparing: { icon: ChefHat, color: 'text-orange-500', label: 'Preparing' },
  ready: { icon: Package, color: 'text-purple-500', label: 'Ready' },
  delivered: { icon: Truck, color: 'text-green-500', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-500', label: 'Cancelled' },
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<{ itemName: string; rating: number; comment: string }>({ itemName: '', rating: 5, comment: '' });
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Step 1: fetch orders without join to avoid RLS join failures
      const { data: baseOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at, delivery_address, subtotal, tax_amount, delivery_fee')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ordersError || !baseOrders) {
        setLoading(false);
        return;
      }

      // Step 2: fetch order_items in a separate query and merge (best-effort)
      try {
        const orderIds = baseOrders.map(o => o.id);
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('order_id, menu_item_id, item_name, quantity, item_price')
          .in('order_id', orderIds);

        const itemsByOrder: Record<string, Order['order_items']> = {};
        (itemsData || []).forEach((it: any) => {
          if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [] as any;
          itemsByOrder[it.order_id].push({
            menu_item_id: it.menu_item_id,
            item_name: it.item_name,
            quantity: it.quantity,
            item_price: it.item_price,
          });
        });

        const merged = baseOrders.map((o: any) => ({
          ...o,
          order_items: itemsByOrder[o.id] || [],
        }));

        setOrders(merged as any);
      } catch (e) {
        // If items fetch fails due to RLS, still show orders without items
        setOrders(baseOrders.map((o: any) => ({ ...o, order_items: [] })) as any);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-20">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Package className="w-24 h-24 mx-auto text-muted-foreground/30 mb-6" />
              <h1 className="text-3xl font-display text-foreground mb-4">No Orders Yet</h1>
              <p className="text-muted-foreground mb-8">
                You haven't placed any orders yet. Start ordering delicious food!
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/menu">Browse Menu</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pt-32 pb-20">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-display text-gradient-gold mb-4">
              Order History
            </h1>
            <p className="text-muted-foreground">
              Track and manage your orders
            </p>
          </motion.div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-display text-lg text-primary">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{orderDate}</p>
                    </div>
                    <div className={`flex items-center gap-2 ${status.color}`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-medium">{status.label}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-border pt-4 mb-4">
                    {order.order_items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.item_name}
                        </span>
                        <span className="text-foreground">₹{item.item_price * item.quantity}</span>
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{order.order_items.length - 3} more items
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg text-foreground">
                      Total: <span className="text-primary">₹{order.total_amount}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                      {order.status === 'delivered' && (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setReviewOpen(true);
                            setReviewData({ itemName: order.order_items[0]?.item_name || '', rating: 5, comment: '' });
                          }}
                        >
                          Write a Review
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Order Details Dialog removed in favor of dedicated page */}

      {/* Write Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Item</Label>
                <select
                  className="w-full bg-muted border border-border rounded-md px-3 py-2"
                  value={reviewData.itemName}
                  onChange={(e) => setReviewData(prev => ({ ...prev, itemName: e.target.value }))}
                >
                  {selectedOrder.order_items.map((it, i) => (
                    <option key={i} value={it.item_name}>{it.item_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Rating</Label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(r => (
                    <Button key={r} variant={reviewData.rating === r ? 'gold' : 'outline'} size="sm" onClick={() => setReviewData(prev => ({ ...prev, rating: r }))}>{r}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Comment</Label>
                <Textarea rows={4} value={reviewData.comment} onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))} placeholder="Share your experience..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!selectedOrder) return;
                try {
                  const sel = selectedOrder.order_items.find(it => it.item_name === reviewData.itemName) || selectedOrder.order_items[0];
                  if (!sel) { setReviewOpen(false); return; }
                  const { data: { session } } = await supabase.auth.getSession();
                  let menu_item_id = sel.menu_item_id;
                  if (!menu_item_id) {
                    // Fallback: try find menu item by name
                    const { data: mi } = await supabase
                      .from('menu_items')
                      .select('id')
                      .ilike('name', sel.item_name)
                      .limit(1)
                      .maybeSingle();
                    menu_item_id = (mi as any)?.id;
                  }
                  if (!menu_item_id) {
                    toast({ title: 'Cannot submit review', description: 'Menu item not found for this order item.', variant: 'destructive' });
                    return;
                  }
                  const { error } = await supabase.from('reviews').insert({ 
                    menu_item_id,
                    rating: reviewData.rating, 
                    comment: reviewData.comment,
                    order_id: selectedOrder.id,
                    user_id: session?.user?.id || null,
                  });
                  if (error) {
                    toast({ title: 'Review failed', description: error.message, variant: 'destructive' });
                  } else {
                    toast({ title: 'Review submitted', description: 'Thank you for your feedback!' });
                    setReviewOpen(false);
                  }
                } catch (e) {
                  toast({ title: 'Review failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
                }
              }}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Orders;

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  UtensilsCrossed,
  TrendingUp,
  Clock
} from 'lucide-react';

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  totalMenuItems: number;
  pendingOrders: number;
  todayOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
    // Realtime: refresh stats and recent orders when orders change
    const channel = supabase
      .channel('admin-dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStats();
        fetchRecentOrders();
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch menu items count
      const { count: menuCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

      // Fetch pending orders count
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered');

      const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      // Today's orders
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      setStats({
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        totalRevenue,
        totalMenuItems: menuCount || 0,
        pendingOrders: pendingCount || 0,
        todayOrders: todayCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    setRecentOrders(data || []);
  };

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-green-500' },
    { title: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-gold' },
    { title: 'Menu Items', value: stats.totalMenuItems, icon: UtensilsCrossed, color: 'text-purple-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-orange-500' },
    { title: "Today's Orders", value: stats.todayOrders, icon: TrendingUp, color: 'text-teal-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{Number(order.total_amount).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'preparing' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

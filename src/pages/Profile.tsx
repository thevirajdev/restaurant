import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Award, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

interface ProfileData {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  loyalty_points: number;
  total_orders: number;
}

interface UserReservation {
  id: string;
  date: string | null;
  time: string | null;
  party_size: number | null;
  status: string | null;
  created_at: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    loyalty_points: 0,
    total_orders: 0,
  });
  const [resLoading, setResLoading] = useState(true);
  const [myReservations, setMyReservations] = useState<UserReservation[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      // Try to load profile; if missing, initialize from auth user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      let nextProfile = {
        full_name: data?.full_name || (session.user.user_metadata?.full_name as string) || '',
        phone: data?.phone || (session.user.phone as string) || '',
        email: data?.email || session.user.email || '',
        address: data?.address || '',
        city: data?.city || '',
        pincode: data?.pincode || '',
        loyalty_points: data?.loyalty_points || 0,
        total_orders: data?.total_orders || 0,
      } as ProfileData;

      if (error || !data) {
        // Create/ensure a profile row exists using defaults from auth
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert({
            user_id: session.user.id,
            full_name: nextProfile.full_name,
            phone: nextProfile.phone,
            email: nextProfile.email,
            address: nextProfile.address,
            city: nextProfile.city,
            pincode: nextProfile.pincode,
          }, { onConflict: 'user_id' });
        if (upsertErr) {
          console.error('Failed to initialize profile:', upsertErr);
        }
      }

      // Compute total orders from orders table for accuracy
      try {
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
        nextProfile.total_orders = ordersCount || 0;
      } catch (e) {
        // ignore count error, keep default
      }

      setProfile(nextProfile);
      setLoading(false);

      // Load user's reservations history
      setResLoading(true);
      const { data: reservations, error: resErr } = await supabase
        .from('reservations')
        .select('id, date, time, party_size, status, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (resErr) {
        console.error('Failed to load user reservations:', resErr);
        setMyReservations([]);
      } else {
        setMyReservations(reservations || []);
      }
      setResLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: session.user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        city: profile.city,
        pincode: profile.pincode,
      }, { onConflict: 'user_id' });

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
  };

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
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-display text-gradient-gold mb-4">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 gap-4 mb-8"
          >
            <div className="glass-card rounded-xl p-6 text-center">
              <Award className="w-10 h-10 mx-auto text-primary mb-2" />
              <p className="text-3xl font-display text-foreground">{profile.loyalty_points}</p>
              <p className="text-sm text-muted-foreground">Loyalty Points</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <User className="w-10 h-10 mx-auto text-primary mb-2" />
              <p className="text-3xl font-display text-foreground">{profile.total_orders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Your delivery address"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="gold" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* My Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-xl p-6 mt-8"
            id="my-reservations"
          >
            <div className="mb-4">
              <h2 className="text-xl font-display text-foreground">My Reservations</h2>
              <p className="text-sm text-muted-foreground">Your recent bookings</p>
            </div>

            {resLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : myReservations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reservations found.</p>
            ) : (
              <div className="space-y-3">
                {myReservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div>
                      <p className="font-display text-foreground">
                        {r.date || '-'} at {r.time || '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Party of {r.party_size ?? '-'} • {r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '-'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      r.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                      r.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {r.status ? String(r.status).toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

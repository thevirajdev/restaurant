import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Shield, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    orderUpdates: true,
    promotions: false,
    darkMode: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate('/');
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Preference updated",
      description: "Your settings have been saved.",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-8 section-padding bg-gradient-to-b from-card to-background">
        <div className="container-custom">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-body text-muted-foreground"
          >
            Manage your account preferences and notifications
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-2xl space-y-8">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-gold" />
              <h2 className="font-display text-xl font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-body text-foreground">Email Notifications</p>
                  <p className="font-body text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch 
                  checked={preferences.emailNotifications} 
                  onCheckedChange={() => handleToggle('emailNotifications')} 
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-body text-foreground">SMS Notifications</p>
                  <p className="font-body text-sm text-muted-foreground">Receive updates via SMS</p>
                </div>
                <Switch 
                  checked={preferences.smsNotifications} 
                  onCheckedChange={() => handleToggle('smsNotifications')} 
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-body text-foreground">Order Updates</p>
                  <p className="font-body text-sm text-muted-foreground">Get notified about order status</p>
                </div>
                <Switch 
                  checked={preferences.orderUpdates} 
                  onCheckedChange={() => handleToggle('orderUpdates')} 
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-body text-foreground">Promotions & Offers</p>
                  <p className="font-body text-sm text-muted-foreground">Receive special offers</p>
                </div>
                <Switch 
                  checked={preferences.promotions} 
                  onCheckedChange={() => handleToggle('promotions')} 
                />
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              {preferences.darkMode ? <Moon className="w-5 h-5 text-gold" /> : <Sun className="w-5 h-5 text-gold" />}
              <h2 className="font-display text-xl font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-body text-foreground">Dark Mode</p>
                <p className="font-body text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch 
                checked={preferences.darkMode} 
                onCheckedChange={() => handleToggle('darkMode')} 
              />
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-gold" />
              <h2 className="font-display text-xl font-semibold text-foreground">Account</h2>
            </div>
            <div className="space-y-4">
              <div className="py-3 border-b border-border">
                <p className="font-body text-foreground">Phone Number</p>
                <p className="font-body text-sm text-muted-foreground">{user?.phone || 'Not set'}</p>
              </div>
              <div className="py-3">
                <p className="font-body text-foreground">Email</p>
                <p className="font-body text-sm text-muted-foreground">{user?.email || 'Not set'}</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Settings;

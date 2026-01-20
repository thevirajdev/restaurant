import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Check } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import interior from '@/assets/interior.jpg';
import { supabase } from '@/integrations/supabase/client';

const timeSlots = ['5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'];
const partySizes = [2, 3, 4, 5, 6, 7, 8];

const Reservations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Require authentication before creating a reservation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to complete your reservation.',
        });
        setIsSubmitting(false);
        navigate('/auth');
        return;
      }
      const userId = session.user.id;
      console.log('Submitting reservation to project:', (import.meta as any).env?.VITE_SUPABASE_URL, 'as user:', userId);

      const { data: inserted, error } = await supabase
        .from('reservations')
        .insert([
          {
            user_id: userId,
            name: formData.name || null,
            phone: formData.phone || null,
            email: formData.email || null,
            date: formData.date || null,
            time: formData.time || null,
            party_size: formData.guests || null,
            status: 'pending',
            notes: formData.specialRequests || null,
          },
        ])
        .select('id')
        .single();

      if (error || !inserted?.id) {
        if (error) console.error('Reservation insert error:', error);
        toast({
          title: 'Reservation Failed',
          description: error?.message || 'Could not save your reservation. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Reservation inserted with id:', inserted.id);

      // Double-check persistence by reading the row back once
      const { data: verifyRow, error: verifyError } = await supabase
        .from('reservations')
        .select('id')
        .eq('id', inserted.id)
        .single();

      if (verifyError || !verifyRow?.id) {
        console.error('Reservation verify read failed:', verifyError);
        toast({
          title: 'Reservation Saved? Please Verify',
          description: 'We could not immediately verify the reservation in the database. Please refresh Admin → Reservations after a moment.',
        });
        setStep(4);
        return;
      }

      toast({
        title: 'Reservation Confirmed!',
        description: `Your table for ${formData.guests} on ${formData.date} at ${formData.time} has been reserved. Ref: ${inserted.id}`,
      });

      setStep(4);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.date && formData.time && formData.guests;
    if (step === 2) return formData.name && formData.email && formData.phone;
    return true;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 section-padding bg-gradient-to-b from-card to-background">
        <div className="container-custom text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block"
          >
            Book Your Experience
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-6"
          >
            Reservations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body text-muted-foreground max-w-2xl mx-auto"
          >
            Secure your table for an unforgettable dining experience.
          </motion.p>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {['Date & Time', 'Your Details', 'Confirm'].map((label, index) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-body text-sm font-semibold transition-colors ${
                      step > index + 1
                        ? 'bg-gold text-primary-foreground'
                        : step === index + 1
                        ? 'bg-gold text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step > index + 1 ? <Check size={18} /> : index + 1}
                  </div>
                  <span className={`hidden sm:block font-body text-sm ${
                    step >= index + 1 ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-12 h-px ${step > index + 1 ? 'bg-gold' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-3xl p-8 sm:p-12"
          >
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <label className="flex items-center gap-2 font-body text-sm text-foreground mb-4">
                    <Calendar className="w-4 h-4 text-gold" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold font-body"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-body text-sm text-foreground mb-4">
                    <Clock className="w-4 h-4 text-gold" />
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({ ...formData, time })}
                        className={`px-4 py-3 rounded-lg font-body text-sm transition-all ${
                          formData.time === time
                            ? 'bg-gold text-primary-foreground'
                            : 'bg-muted border border-border text-foreground hover:border-gold'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 font-body text-sm text-foreground mb-4">
                    <Users className="w-4 h-4 text-gold" />
                    Party Size
                  </label>
                  <div className="flex gap-3">
                    {partySizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, guests: size })}
                        className={`w-12 h-12 rounded-lg font-body text-sm transition-all ${
                          formData.guests === size
                            ? 'bg-gold text-primary-foreground'
                            : 'bg-muted border border-border text-foreground hover:border-gold'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="px-4 h-12 rounded-lg bg-muted border border-border text-muted-foreground font-body text-sm"
                    >
                      8+
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-body text-sm text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold font-body"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-sm text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold font-body"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-body text-sm text-foreground mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold font-body"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm text-foreground mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold font-body resize-none"
                    placeholder="Allergies, dietary restrictions, celebrations..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-8">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Confirm Your Reservation
                </h3>
                <div className="grid sm:grid-cols-2 gap-6 text-left">
                  <div className="glass-card p-6 rounded-xl">
                    <p className="font-body text-sm text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-display text-lg text-foreground">
                      {formData.date} at {formData.time}
                    </p>
                  </div>
                  <div className="glass-card p-6 rounded-xl">
                    <p className="font-body text-sm text-muted-foreground mb-1">Party Size</p>
                    <p className="font-display text-lg text-foreground">
                      {formData.guests} Guests
                    </p>
                  </div>
                  <div className="glass-card p-6 rounded-xl">
                    <p className="font-body text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-display text-lg text-foreground">{formData.name}</p>
                  </div>
                  <div className="glass-card p-6 rounded-xl">
                    <p className="font-body text-sm text-muted-foreground mb-1">Contact</p>
                    <p className="font-display text-lg text-foreground">{formData.email}</p>
                  </div>
                </div>
                {formData.specialRequests && (
                  <div className="glass-card p-6 rounded-xl text-left">
                    <p className="font-body text-sm text-muted-foreground mb-1">Special Requests</p>
                    <p className="font-body text-foreground">{formData.specialRequests}</p>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-full bg-gold/20 flex items-center justify-center"
                >
                  <Check className="w-12 h-12 text-gold" />
                </motion.div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-4">
                  Reservation Confirmed!
                </h3>
                <p className="font-body text-muted-foreground mb-8">
                  We've sent a confirmation email to {formData.email}.<br />
                  We look forward to welcoming you!
                </p>
                <div className="glass-card p-6 rounded-xl inline-block">
                  <p className="font-body text-sm text-muted-foreground mb-2">Your reservation</p>
                  <p className="font-display text-xl text-gold">
                    {formData.date} at {formData.time}
                  </p>
                  <p className="font-body text-foreground">
                    Party of {formData.guests}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step < 4 && (
              <div className="flex justify-between mt-10 pt-8 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                >
                  Back
                </Button>
                {step < 3 ? (
                  <Button
                    type="button"
                    variant="gold"
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gold"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section-padding bg-card">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { title: 'Cancellation Policy', description: 'Free cancellation up to 24 hours before your reservation.' },
              { title: 'Large Parties', description: 'For parties of 8 or more, please contact us directly.' },
              { title: 'Private Events', description: 'Our private dining room is available for special occasions.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-2xl"
              >
                <h3 className="font-display text-lg font-semibold text-gold mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Reservations;

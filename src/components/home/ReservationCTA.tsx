import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import interior from '@/assets/interior.jpg';

const ReservationCTA = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={interior}
          alt="Restaurant ambiance"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block">
            Make a Reservation
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Join Us for an
            <br />
            <span className="text-gradient-gold">Unforgettable Evening</span>
          </h2>
          <p className="font-body text-foreground/70 text-lg mb-12 leading-relaxed">
            Secure your table and embark on a culinary journey that will delight your senses 
            and create lasting memories.
          </p>

          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {[
              { icon: Calendar, label: 'Open Tue - Sun' },
              { icon: Clock, label: '5:30 PM - 10:30 PM' },
              { icon: Users, label: 'Parties of 2-12' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <item.icon className="w-5 h-5 text-gold" />
                <span className="font-body text-foreground/80 text-sm">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button variant="gold" size="xl" className="gold-glow" asChild>
              <Link to="/reservations">Reserve Your Table Now</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReservationCTA;

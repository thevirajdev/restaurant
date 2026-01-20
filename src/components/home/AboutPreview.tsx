import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import chef from '@/assets/chef.jpg';
import interior from '@/assets/interior.jpg';

const AboutPreview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section ref={containerRef} className="section-padding bg-card overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <div className="relative">
            <motion.div
              style={{ y: y1 }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={interior}
                  alt="Restaurant interior"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              style={{ y: y2 }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute -bottom-20 -right-8 lg:right-8 w-2/3 z-20"
            >
              <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border-4 border-background">
                <img
                  src={chef}
                  alt="Executive Chef"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 border border-gold/20 rounded-full" />
            <div className="absolute -bottom-8 left-1/4 w-24 h-24 border border-gold/10 rounded-full" />
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:pl-8 pt-24 lg:pt-0"
          >
            <span className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block">
              Our Story
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              A Legacy of
              <br />
              <span className="text-gradient-gold">Culinary Excellence</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Since 2010, AURELIA has been a beacon of fine dining in the heart of Manhattan. 
              Our philosophy is simple: source the finest ingredients, treat them with respect, 
              and create dishes that inspire and delight.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Under the guidance of Executive Chef Marcus Rivera, our kitchen team pushes the 
              boundaries of contemporary cuisine while honoring timeless techniques passed down 
              through generations.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: '15+', label: 'Years of Excellence' },
                { value: '2', label: 'Michelin Stars' },
                { value: '50+', label: 'Awards Won' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl font-bold text-gold mb-1">
                    {stat.value}
                  </div>
                  <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="gold-outline" size="lg" asChild>
              <Link to="/about">Discover Our Story</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;

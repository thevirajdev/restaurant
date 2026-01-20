import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Layout from '@/components/layout/Layout';
import chef from '@/assets/chef.jpg';
import interior from '@/assets/interior.jpg';
import heroBg from '@/assets/hero-bg.jpg';

const timeline = [
  { year: '2010', title: 'The Beginning', description: 'Chef Marcus Rivera opens AURELIA with a vision of redefining fine dining in Manhattan.' },
  { year: '2012', title: 'First Recognition', description: 'Named "Best New Restaurant" by New York Magazine and awarded our first Michelin star.' },
  { year: '2015', title: 'Second Star', description: 'Awarded our second Michelin star, cementing our place among the world\'s finest restaurants.' },
  { year: '2018', title: 'Expansion', description: 'Opened our private dining room and launched our seasonal tasting menu program.' },
  { year: '2023', title: 'New Heights', description: 'Named one of the World\'s 50 Best Restaurants, celebrating over a decade of excellence.' },
];

const values = [
  { title: 'Quality', description: 'We source only the finest ingredients from trusted purveyors around the world.' },
  { title: 'Innovation', description: 'Our kitchen constantly pushes boundaries while honoring classical techniques.' },
  { title: 'Service', description: 'Every guest receives personalized attention and genuine hospitality.' },
  { title: 'Sustainability', description: 'We are committed to responsible sourcing and minimal environmental impact.' },
];

const About = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={interior}
            alt="Restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/70" />
        </div>
        
        <div className="relative z-10 container-custom text-center px-4">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block"
          >
            Est. 2010
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6"
          >
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body text-foreground/70 text-lg max-w-2xl mx-auto"
          >
            A journey of passion, precision, and the relentless pursuit of culinary perfection.
          </motion.p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block">
                Our Philosophy
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                Where Tradition Meets
                <br />
                <span className="text-gradient-gold">Innovation</span>
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                At AURELIA, we believe that exceptional dining is an art form that engages all 
                the senses. Every dish that leaves our kitchen is a canvas of flavors, textures, 
                and aromas, painted with precision and passion.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                Our commitment to excellence extends beyond the plate. From the moment you step 
                through our doors, you become part of our story—a narrative woven with warmth, 
                elegance, and unforgettable moments.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <h3 className="font-display text-lg font-semibold text-gold mb-2">
                    {value.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chef Section */}
      <section ref={parallaxRef} className="relative py-32 overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          <img
            src={heroBg}
            alt="Kitchen background"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-background/90" />
        </motion.div>

        <div className="container-custom relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={chef}
                  alt="Executive Chef Marcus Rivera"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-gold/20 rounded-full" />
              <div className="absolute -top-6 -left-6 w-24 h-24 border border-gold/10 rounded-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block">
                Meet Our Chef
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Marcus Rivera
              </h2>
              <p className="font-body text-xl text-gold mb-6 italic">
                Executive Chef & Founder
              </p>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                With over two decades of experience in the world's most prestigious kitchens, 
                Chef Marcus Rivera brings a unique perspective to contemporary American cuisine. 
                Trained under legendary chefs in Paris, Tokyo, and New York, his cooking style 
                is a harmonious blend of classical French technique and global influences.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                "Cooking is a conversation between the chef and the diner. Every dish I create 
                is an invitation to experience something beautiful, something memorable."
              </p>
              <p className="font-display text-gold mt-4 italic">— Chef Marcus Rivera</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block">
              Our Journey
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
              Milestones
            </h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-gold/50 to-transparent" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-start gap-8 mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold gold-glow z-10" />

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <span className="font-display text-3xl font-bold text-gold">{item.year}</span>
                  <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;

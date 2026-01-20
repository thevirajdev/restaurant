import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dish1 from '@/assets/dish-1.jpg';
import dish2 from '@/assets/dish-2.jpg';
import dish3 from '@/assets/dish-3.jpg';

const dishes = [
  {
    id: 1,
    name: 'Wagyu Ribeye',
    description: 'Prime A5 Wagyu with truffle butter, roasted bone marrow',
    price: '$185',
    image: dish1,
    category: 'Signature',
  },
  {
    id: 2,
    name: 'Maine Lobster',
    description: 'Butter-poached lobster tail, champagne beurre blanc',
    price: '$145',
    image: dish2,
    category: 'Seafood',
  },
  {
    id: 3,
    name: 'Chocolate Fondant',
    description: 'Valrhona dark chocolate, gold leaf, raspberry coulis',
    price: '$28',
    image: dish3,
    category: 'Dessert',
  },
];

const FeaturedDishes = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block">
            Chef's Selection
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Signature Creations
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Discover our most celebrated dishes, each crafted with artistry and the finest ingredients.
          </p>
        </motion.div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="group glass-card-hover rounded-2xl overflow-hidden">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 font-body text-xs tracking-widest uppercase px-3 py-1 bg-gold/20 backdrop-blur-sm border border-gold/30 rounded-full text-gold">
                    {dish.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {dish.name}
                    </h3>
                    <span className="font-display text-xl text-gold font-bold">
                      {dish.price}
                    </span>
                  </div>
                  <p className="font-body text-muted-foreground text-sm line-clamp-2">
                    {dish.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button variant="gold-outline" size="lg" asChild>
            <Link to="/menu" className="gap-2">
              View Full Menu <ArrowRight size={18} />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedDishes;

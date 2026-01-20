import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Leaf, Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import dish1 from '@/assets/dish-1.jpg';
import dish2 from '@/assets/dish-2.jpg';
import dish3 from '@/assets/dish-3.jpg';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discounted_price: number | null;
  category_id: string | null;
  image_url: string | null;
  is_spicy: boolean | null;
  is_vegetarian: boolean | null;
  is_signature: boolean | null;
  is_available: boolean | null;
  categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

const fallbackImages = [dish1, dish2, dish3];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart, userId } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order');
      
      if (catData) {
        setCategories(['All', ...catData.map(c => c.name)]);
      }

      // Fetch menu items with category names
      const { data: itemsData } = await supabase
        .from('menu_items')
        .select('*, categories(name)')
        .eq('is_available', true)
        .order('display_order');
      
      if (itemsData) {
        setMenuItems(itemsData as MenuItem[]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const categoryName = item.categories?.name || '';
    const matchesCategory = activeCategory === 'All' || categoryName === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getQuantity = (itemId: string) => quantities[itemId] || 1;

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta)
    }));
  };

  const handleAddToCart = async (item: MenuItem) => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to add items to cart.",
        variant: "destructive"
      });
      return;
    }
    
    await addToCart(item.id, getQuantity(item.id));
    toast({
      title: "Added to cart",
      description: `${item.name} x${getQuantity(item.id)} added to your cart.`
    });
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const getImage = (item: MenuItem, index: number) => {
    return item.image_url || fallbackImages[index % fallbackImages.length];
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(0)}`;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 section-padding bg-gradient-to-b from-card to-background">
        <div className="container-custom text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body text-gold text-sm tracking-[0.3em] uppercase mb-4 block"
          >
            Culinary Excellence
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-6"
          >
            Our Menu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body text-muted-foreground max-w-2xl mx-auto"
          >
            Each dish is a testament to our commitment to quality, crafted with 
            the finest seasonal ingredients and presented with artistic flair.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[72px] z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'gold' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold font-body text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="glass-card-hover rounded-2xl overflow-hidden">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={getImage(item, index)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          {item.is_signature && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-gold/20 backdrop-blur-sm border border-gold/30 rounded-full text-gold text-xs font-body">
                              <Star size={12} /> Signature
                            </span>
                          )}
                        </div>
                        
                        {/* Icons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          {item.is_spicy && (
                            <span className="w-8 h-8 flex items-center justify-center bg-accent/80 backdrop-blur-sm rounded-full text-accent-foreground" title="Spicy">
                              <Flame size={16} />
                            </span>
                          )}
                          {item.is_vegetarian && (
                            <span className="w-8 h-8 flex items-center justify-center bg-emerald-500/80 backdrop-blur-sm rounded-full text-foreground" title="Vegetarian">
                              <Leaf size={16} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-body text-xs text-gold uppercase tracking-wider mb-1">
                              {item.categories?.name || 'Menu'}
                            </p>
                            <h3 className="font-display text-xl font-semibold text-foreground">
                              {item.name}
                            </h3>
                          </div>
                          <div className="text-right">
                            {item.discounted_price ? (
                              <>
                                <span className="font-display text-lg text-muted-foreground line-through mr-2">
                                  {formatPrice(item.price)}
                                </span>
                                <span className="font-display text-xl text-gold font-bold">
                                  {formatPrice(item.discounted_price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-display text-xl text-gold font-bold whitespace-nowrap">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="font-body text-muted-foreground text-sm line-clamp-2 mb-4">
                          {item.description}
                        </p>

                        {/* Add to Cart */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-body text-sm">
                              {getQuantity(item.id)}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <Button 
                            variant="gold" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart size={16} className="mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="font-body text-muted-foreground text-lg">
                No dishes found matching your criteria.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Menu;

import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedDishes from '@/components/home/FeaturedDishes';
import AboutPreview from '@/components/home/AboutPreview';
import Testimonials from '@/components/home/Testimonials';
import ReservationCTA from '@/components/home/ReservationCTA';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedDishes />
      <AboutPreview />
      <Testimonials />
      <ReservationCTA />
    </Layout>
  );
};

export default Index;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-display text-8xl font-bold text-gradient-gold mb-4"
        >
          404
        </motion.h1>
        <p className="font-display text-2xl text-foreground mb-4">Page Not Found</p>
        <p className="font-body text-muted-foreground mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Button variant="gold" size="lg" asChild>
          <Link to="/" className="gap-2">
            <Home size={18} /> Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

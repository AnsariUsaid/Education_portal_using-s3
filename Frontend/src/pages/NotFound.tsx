import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="glass-effect rounded-2xl p-8 shadow-glow animate-scale-in text-center">
          <CardContent>
            <div className="animate-bounce-in mb-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-gradient mb-4 animate-fade-in-up">404</h1>
            <h2 className="text-2xl font-bold mb-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Page Not Found
            </h2>
            <p className="text-muted-foreground mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                className="glass-effect hover:scale-105 transition-all duration-300 flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-primary hover:scale-105 transition-all duration-300 button-glow flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;

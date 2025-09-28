import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Users, FileText, ArrowRight, Sparkles, Upload, Download } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in and redirect to appropriate dashboard
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    }
  }, [navigate]);

  const features = [
    {
      icon: Upload,
      title: "Easy Upload",
      description: "Teachers can quickly upload question papers with detailed descriptions",
      color: "text-primary"
    },
    {
      icon: Download,
      title: "Instant Access",
      description: "Students can browse and download question papers by course",
      color: "text-success"
    },
    {
      icon: FileText,
      title: "Answer Submission",
      description: "Submit your answers securely and track submission status",
      color: "text-warning"
    },
    {
      icon: Users,
      title: "Class Management",
      description: "Teachers can view and manage student submissions efficiently",
      color: "text-secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in-up">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-gradient">EduPortal</span>
            </div>
            
            <div className="flex items-center gap-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <Link to="/login">
                <Button variant="outline" className="glass-effect hover:scale-105 transition-all duration-300">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-primary hover:scale-105 transition-all duration-300 button-glow">
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="animate-bounce-in">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary animate-glow" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <span className="text-gradient">Education</span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              A modern platform connecting teachers and students through seamless question paper sharing and answer submission
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-primary hover:scale-110 transition-all duration-300 button-glow text-lg px-8 py-4">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="glass-effect hover:scale-110 transition-all duration-300 text-lg px-8 py-4">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gradient mb-4 animate-fade-in-up">
              Why Choose EduPortal?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Streamline your educational workflow with our intuitive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="card-hover animate-scale-in glass-effect"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-primary mx-auto mb-4 flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="glass-effect card-hover animate-scale-in max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold text-gradient mb-6">
                Ready to Transform Your Educational Experience?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of educators and students who are already using EduPortal to streamline their academic workflow
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-success hover:scale-110 transition-all duration-300 button-glow text-lg px-12 py-4">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-border/50">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 EduPortal. Empowering education through technology.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;

import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Menu, 
  X, 
  BookOpen, 
  Upload, 
  Download, 
  Users, 
  GraduationCap,
  FileText
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: 'teacher' | 'student';
}

export default function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    
    navigate('/');
  };

  const teacherNavItems = [
    { icon: Upload, label: 'Upload QP', href: '#upload' },
    { icon: FileText, label: 'My QPs', href: '#my-qps' },
    { icon: Users, label: 'Student Submissions', href: '#submissions' },
  ];

  const studentNavItems = [
    { icon: BookOpen, label: 'Browse Courses', href: '#courses' },
    { icon: Download, label: 'Download QPs', href: '#download' },
    { icon: Upload, label: 'Upload Answers', href: '#upload-answer' },
  ];

  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in-up"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gradient-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">EduPortal</h1>
                <p className="text-xs text-muted-foreground capitalize">{role} Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm animate-fade-in-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4 p-3 bg-accent/30 rounded-lg">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{username}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full justify-start gap-2 hover:scale-105 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <h2 className="text-2xl font-bold text-gradient animate-fade-in-up">{title}</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                Online
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
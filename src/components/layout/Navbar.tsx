import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  MessageSquare, 
  Sparkles, 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Monitor,
  Crown,
  Coins,
  Shield
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium': return <Crown className="h-3 w-3 text-accent" />;
      case 'standard': return <Sparkles className="h-3 w-3 text-primary" />;
      default: return <Coins className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'text-accent';
      case 'standard': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2 transition-smooth hover:scale-105">
          <div className="relative">
            <MessageSquare className="h-8 w-8 text-primary" />
            <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
          </div>
          <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            ChatAI
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center space-x-4">
          {user && (
            <>
              {/* Admin Badge */}
              {user.role === 'admin' && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-accent/10 rounded-full">
                  <Shield className="h-3 w-3 text-accent" />
                  <span className="text-xs font-medium text-accent">Admin</span>
                </div>
              )}

              {/* Token Count for Users */}
              {user.role !== 'admin' && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-full">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {user.tokens.toLocaleString()}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <div className="flex items-center space-x-1">
                      {getPlanIcon(user.plan)}
                      <p className={`text-xs leading-none capitalize ${getPlanColor(user.plan)}`}>
                        {user.plan} Plan
                      </p>
                    </div>
                    {user.role !== 'admin' && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.tokens.toLocaleString()} tokens remaining
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/plans">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </Link>
                </DropdownMenuItem>
                
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
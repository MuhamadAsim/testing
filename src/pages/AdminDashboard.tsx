import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  Crown,
  Sparkles,
  Coins,
  Calendar,
  Mail,
  Shield,
  BarChart3
} from 'lucide-react';

// Mock user data for admin dashboard
const mockUsers = [
  {
    id: '1',
    email: 'user@example.com',
    plan: 'basic',
    tokens: 850,
    maxTokens: 1000,
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date('2024-01-20')
  },
  {
    id: '2',
    email: 'premium.user@example.com',
    plan: 'premium',
    tokens: 12500,
    maxTokens: 15000,
    joinedAt: new Date('2023-12-01'),
    lastActive: new Date('2024-01-21')
  },
  {
    id: '3',
    email: 'standard.user@example.com',
    plan: 'standard',
    tokens: 3200,
    maxTokens: 5000,
    joinedAt: new Date('2024-01-10'),
    lastActive: new Date('2024-01-19')
  },
  {
    id: '4',
    email: 'jane.doe@example.com',
    plan: 'basic',
    tokens: 100,
    maxTokens: 1000,
    joinedAt: new Date('2024-01-18'),
    lastActive: new Date('2024-01-21')
  },
  {
    id: '5',
    email: 'enterprise.user@company.com',
    plan: 'premium',
    tokens: 14800,
    maxTokens: 15000,
    joinedAt: new Date('2023-11-15'),
    lastActive: new Date('2024-01-21')
  }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted">
        <Navbar />
        <div className="container mx-auto px-6 py-12 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === 'all' || user.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [searchTerm, planFilter]);

  const stats = useMemo(() => {
    return {
      totalUsers: mockUsers.length,
      basicUsers: mockUsers.filter(u => u.plan === 'basic').length,
      standardUsers: mockUsers.filter(u => u.plan === 'standard').length,
      premiumUsers: mockUsers.filter(u => u.plan === 'premium').length,
      totalTokensUsed: mockUsers.reduce((acc, user) => acc + (user.maxTokens - user.tokens), 0),
      averageTokenUsage: mockUsers.reduce((acc, user) => 
        acc + ((user.maxTokens - user.tokens) / user.maxTokens), 0) / mockUsers.length * 100
    };
  }, []);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium': return <Crown className="h-4 w-4 text-accent" />;
      case 'standard': return <Sparkles className="h-4 w-4 text-primary" />;
      default: return <Coins className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-accent/10 text-accent border-accent/20';
      case 'standard': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span>Admin Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users and monitor platform usage
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active registered users
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Crown className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTokensUsed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all users this month
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageTokenUsage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average token utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="gradient-card shadow-medium">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage all registered users
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users List */}
            <ScrollArea className="h-[500px]">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((userItem) => (
                    <div
                      key={userItem.id}
                      className="flex items-center justify-between p-4 rounded-lg border transition-smooth hover:bg-muted/30"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{userItem.email}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPlanBadgeStyle(userItem.plan)}`}
                            >
                              <div className="flex items-center space-x-1">
                                {getPlanIcon(userItem.plan)}
                                <span className="capitalize">{userItem.plan}</span>
                              </div>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {userItem.tokens.toLocaleString()} / {userItem.maxTokens.toLocaleString()} tokens
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {formatDate(userItem.joinedAt)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last active {formatDate(userItem.lastActive)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
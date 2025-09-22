import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import {
  Check,
  Crown,
  Sparkles,
  Coins,
  Zap,
  Users,
  FileText,
  MessageCircle,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  tokens: number;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const Plans = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      tokens: 1000,
      features: [
        '1,000 AI tokens per month',
        'Basic chat functionality',
        'File upload support',
        'Chat history storage',
        'Email support'
      ],
      icon: <Coins className="h-6 w-6" />
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 19.99,
      tokens: 5000,
      features: [
        '5,000 AI tokens per month',
        'Advanced chat features',
        'Priority file processing',
        'Extended chat history',
        'Priority support',
        'Custom prompts'
      ],
      popular: true,
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 39.99,
      tokens: 15000,
      features: [
        '15,000 AI tokens per month',
        'All chat features',
        'Unlimited file uploads',
        'Complete chat archive',
        '24/7 priority support',
        'Custom integrations',
        'API access'
      ],
      icon: <Crown className="h-6 w-6" />
    }
  ];

  const handleUpgrade = async (planId: string) => {
    setIsLoading(planId);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Plan upgraded!",
        description: `Successfully upgraded to ${planId} plan. Your tokens have been updated.`,
      });
      setIsLoading(null);
    }, 1500);
  };

  const getPlanBadgeStyle = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium': return 'bg-accent text-accent-foreground';
      case 'standard': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCurrentPlanFeatures = () => {
    if (!user) return [];
    
    switch (user.plan) {
      case 'premium':
        return [
          'Unlimited AI conversations',
          'Advanced file processing',
          'Priority support',
          'Custom integrations'
        ];
      case 'standard':
        return [
          '5,000 tokens per month',
          'Priority processing',
          'Extended features'
        ];
      default:
        return [
          '1,000 tokens per month',
          'Basic features',
          'Standard support'
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Choose Your <span className="gradient-primary bg-clip-text text-transparent">Plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI with our flexible pricing plans
          </p>
        </div>

        {/* Current Plan Status */}
        {user && (
          <Card className="max-w-2xl mx-auto mb-12 gradient-card shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Current Plan</span>
                  </CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </div>
                <Badge className={getPlanBadgeStyle(user.plan)}>
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{user.tokens.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Tokens Remaining</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{Math.floor(user.tokens / 10)}</p>
                  <p className="text-sm text-muted-foreground">Messages Left</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">∞</p>
                  <p className="text-sm text-muted-foreground">File Uploads</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Plan Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getCurrentPlanFeatures().map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative gradient-card shadow-medium transition-smooth hover:shadow-strong hover:scale-105 ${
                plan.popular ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>
                  {plan.tokens.toLocaleString()} tokens per month
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={plan.popular ? 'gradient' : 'outline'}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading === plan.id || user?.plan === plan.id}
                >
                  {isLoading === plan.id ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : user?.plan === plan.id ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      {user && plans.findIndex(p => p.id === user.plan) < plans.findIndex(p => p.id === plan.id)
                        ? 'Upgrade'
                        : user && plans.findIndex(p => p.id === user.plan) > plans.findIndex(p => p.id === plan.id)
                        ? 'Downgrade'
                        : 'Choose Plan'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">What are tokens?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tokens are used to measure AI usage. Each message costs approximately 10 tokens, 
                  depending on length and complexity.
                </p>
              </CardContent>
            </Card>
            
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. 
                  Changes take effect immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
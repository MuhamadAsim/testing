import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  plan: 'basic' | 'standard' | 'premium';
  tokens: number;
  maxTokens: number;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  updateTokens: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    role: 'user',
    plan: 'basic',
    tokens: 850,
    maxTokens: 1000
  },
  {
    id: '2',
    email: 'admin@example.com',
    role: 'admin',
    plan: 'premium',
    tokens: 999999,
    maxTokens: 999999
  }
];

const mockCredentials = [
  { email: 'user@example.com', password: 'user123' },
  { email: 'admin@example.com', password: 'admin123' }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const credentials = mockCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (credentials) {
      const userData = mockUsers.find(u => u.email === email);
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        return true;
      }
    }

    toast({
      title: "Sign in failed",
      description: "Invalid email or password.",
      variant: "destructive",
    });
    return false;
  };

  const signUp = async (email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      toast({
        title: "Sign up failed",
        description: "An account with this email already exists.",
        variant: "destructive",
      });
      return false;
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      role: 'user',
      plan: 'basic',
      tokens: 1000,
      maxTokens: 1000
    };

    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    toast({
      title: "Account created!",
      description: "Welcome to our LLM Chat Platform.",
    });
    return true;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const updateTokens = (amount: number) => {
    if (user && user.role !== 'admin') {
      const newTokens = Math.max(0, user.tokens - amount);
      const updatedUser = { ...user, tokens: newTokens };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, updateTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
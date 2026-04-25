import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with username:', username);
      // ✅ LOGIN (returns user)
      const user = await login(username, password);

      console.log('Login successful, user:', user);
      toast.success('Login successful!');

      // ✅ SAFETY CHECK (important)
      if (!user) {
        toast.error('Login failed: no user returned');
        return;
      }

      // ✅ ROLE-BASED REDIRECT
      switch (user.role) {
        case 'admin':
          setLocation('/admin');
          break;

        case 'agent':
          setLocation('/agent');
          break;

        default:
          setLocation('/');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">SmartSeason</CardTitle>
          <CardDescription>Field Monitoring System</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Agent:</strong> agent / securepass@123</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
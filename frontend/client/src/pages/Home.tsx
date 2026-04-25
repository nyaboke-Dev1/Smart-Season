import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, BarChart3, Users, Lock, Zap, Globe } from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Leaf,
      title: 'Field Management',
      description: 'Create, manage, and track multiple fields with detailed crop information and planting dates.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Monitoring',
      description: 'Monitor field progress with automatic status tracking and visual dashboards.',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Separate interfaces for administrators and field agents with appropriate permissions.',
    },
    {
      icon: Lock,
      title: 'Secure Authentication',
      description: 'JWT-based authentication ensures secure access to the system.',
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Field agents can quickly update field stages and add observations in real-time.',
    },
    {
      icon: Globe,
      title: 'Responsive Design',
      description: 'Access the system from any device with a fully responsive interface.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold">SmartSeason</h1>
          </div>

          <Button onClick={() => setLocation('/login')}>
            Login
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-4">
          Smart Field Monitoring System
        </h2>
        <p className="text-gray-600 mb-6">
          Track crops, monitor fields, and manage agriculture operations.
        </p>

        <Button onClick={() => setLocation('/login')}>
          Get Started
        </Button>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-white">
        <h3 className="text-3xl font-bold mb-10">Features</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i}>
                <CardHeader>
                  <Icon className="w-10 h-10 text-green-600" />
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{f.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

    </div>
  );
}
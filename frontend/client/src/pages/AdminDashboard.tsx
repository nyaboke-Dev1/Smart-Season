import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Field {
  id: number;
  name: string;
  crop_type: string;
  planting_date: string;
  current_stage: string;
  agent_name: string;
  status: string;
}

interface Agent {
  id: number;
  username: string;
}

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [fields, setFields] = useState<Field[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newField, setNewField] = useState({ name: '', crop_type: '', planting_date: '', agent: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL + '/api';
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fieldsRes, agentsRes] = await Promise.all([
        axios.get(`${API_URL}/fields/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/users/agents/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setFields(fieldsRes.data);
      setAgents(agentsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async () => {
    if (!newField.name || !newField.crop_type || !newField.planting_date || !newField.agent) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await axios.post(
        `${API_URL}/fields/`,
        newField,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Field created successfully');
      setNewField({ name: '', crop_type: '', planting_date: '', agent: '' });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create field');
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const statusCounts = {
    active: fields.filter(f => f.status === 'Active').length,
    atRisk: fields.filter(f => f.status === 'At Risk').length,
    completed: fields.filter(f => f.status === 'Completed').length,
  };

  const chartData = [
    { name: 'Active', value: statusCounts.active },
    { name: 'At Risk', value: statusCounts.atRisk },
    { name: 'Completed', value: statusCounts.completed },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">SmartSeason Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.username}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fields.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statusCounts.atRisk}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Field Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Create Field Button */}
        <div className="mb-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Field</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Field</DialogTitle>
                <DialogDescription>Add a new field to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Field Name</label>
                  <Input
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="e.g., North Field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Crop Type</label>
                  <Input
                    value={newField.crop_type}
                    onChange={(e) => setNewField({ ...newField, crop_type: e.target.value })}
                    placeholder="e.g., Corn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Planting Date</label>
                  <Input
                    type="date"
                    value={newField.planting_date}
                    onChange={(e) => setNewField({ ...newField, planting_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign to Agent</label>
                  <Select value={newField.agent} onValueChange={(value) => setNewField({ ...newField, agent: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateField} className="w-full">Create Field</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Fields Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Fields</CardTitle>
            <CardDescription>Monitor all fields and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Crop</th>
                    <th className="px-4 py-2 text-left">Stage</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Agent</th>
                    <th className="px-4 py-2 text-left">Planted</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => (
                    <tr key={field.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{field.name}</td>
                      <td className="px-4 py-2">{field.crop_type}</td>
                      <td className="px-4 py-2 capitalize">{field.current_stage}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          field.status === 'Active' ? 'bg-green-100 text-green-800' :
                          field.status === 'At Risk' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {field.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{field.agent_name}</td>
                      <td className="px-4 py-2">{new Date(field.planting_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

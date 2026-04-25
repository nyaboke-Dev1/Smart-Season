import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

interface Field {
  id: number;
  name: string;
  crop_type: string;
  planting_date: string;
  current_stage: string;
  status: string;
  updates: FieldUpdate[];
}

interface FieldUpdate {
  id: number;
  stage: string;
  notes: string;
  timestamp: string;
}

export default function AgentDashboard() {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [updateData, setUpdateData] = useState({ stage: '', notes: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const API_URL = 'http://localhost:8000/api';
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await axios.get(`${API_URL}/fields/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFields(response.data);
    } catch (error) {
      toast.error('Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async () => {
    if (!selectedField || !updateData.stage) {
      toast.error('Please select a stage');
      return;
    }
    try {
      await axios.post(
        `${API_URL}/fields/${selectedField.id}/update_stage/`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Field updated successfully');
      setUpdateData({ stage: '', notes: '' });
      setIsDialogOpen(false);
      fetchFields();
    } catch (error) {
      toast.error('Failed to update field');
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">SmartSeason Field Agent</h1>
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
              <CardTitle className="text-sm font-medium">My Fields</CardTitle>
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

        {/* Fields List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <Card key={field.id}>
              <CardHeader>
                <CardTitle>{field.name}</CardTitle>
                <CardDescription>{field.crop_type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Current Stage</p>
                    <p className="font-semibold capitalize">{field.current_stage}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-semibold ${
                      field.status === 'Active' ? 'text-green-600' :
                      field.status === 'At Risk' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {field.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Planted</p>
                    <p className="font-semibold">{new Date(field.planting_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Recent Updates */}
                {field.updates.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Recent Updates</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {field.updates.slice(-3).map((update) => (
                        <div key={update.id} className="text-xs bg-gray-50 p-2 rounded">
                          <p className="font-medium capitalize">{update.stage}</p>
                          {update.notes && <p className="text-gray-600">{update.notes}</p>}
                          <p className="text-gray-500">{new Date(update.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Button */}
                <Dialog open={isDialogOpen && selectedField?.id === field.id} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (open) setSelectedField(field);
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Update Field</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update {field.name}</DialogTitle>
                      <DialogDescription>Record a new observation or stage update</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">New Stage</label>
                        <Select value={updateData.stage} onValueChange={(value) => setUpdateData({ ...updateData, stage: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planted">Planted</SelectItem>
                            <SelectItem value="growing">Growing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="harvested">Harvested</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                        <Textarea
                          value={updateData.notes}
                          onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                          placeholder="Add any observations or notes..."
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleUpdateField} className="w-full">Submit Update</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {fields.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No fields assigned to you yet.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus, Search, X, GripVertical, Zap, FileText, Users, CheckCircle } from 'lucide-react';
import { adminAuth } from '@/lib/adminAuth';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  // Widget management
  const [widgetOrder, setWidgetOrder] = useState(['plans', 'work', 'tasks']);
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);

  useEffect(() => {
    // Verify admin access
    const adminToken = adminAuth.getAdminToken();
    if (!adminToken) {
      window.location.href = '/admin/login';
      return;
    }
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/gst-clients`, config);
      setClients(response.data.data?.clients || []);
    } catch (err) {
      console.error('Failed to fetch GST clients:', err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.emailAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || client.state === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setShowModal(true);
  };

  // Widget drag handlers
  const handleDragStart = (e: React.DragEvent, widget: string) => {
    setDraggingWidget(widget);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetWidget: string) => {
    e.preventDefault();
    if (!draggingWidget) return;

    const newOrder = [...widgetOrder];
    const dragIndex = newOrder.indexOf(draggingWidget);
    const targetIndex = newOrder.indexOf(targetWidget);

    [newOrder[dragIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[dragIndex]];
    setWidgetOrder(newOrder);
    setDraggingWidget(null);
  };

  // Render widget component
  const renderWidget = (widgetId: string) => {
    const isDragging = draggingWidget === widgetId;

    switch (widgetId) {
      case 'plans':
        return (
          <div
            key="plans"
            draggable
            onDragStart={(e) => handleDragStart(e, 'plans')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'plans')}
            className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all ${
              isDragging ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 cursor-move">
              <GripVertical size={16} className="text-gray-400" />
              <Zap size={16} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900 flex-1">Plans & Subscriptions</h3>
            </div>
            <div className="p-4">
              {selectedClient ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase">Current Plan</p>
                      <p className="text-lg font-bold text-blue-900">{selectedClient.currentPlan || 'Basic'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600 font-medium">₹{selectedClient.planAmount || '5000'}</p>
                      <p className="text-xs text-blue-500">per month</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Available Services</p>
                    {['GST Filing', 'ITR Filing', 'Compliance', 'Consultation'].map((service, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-sm text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    Upgrade Plan
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-8">Select a client to view plans</p>
              )}
            </div>
          </div>
        );

      case 'work':
        return (
          <div
            key="work"
            draggable
            onDragStart={(e) => handleDragStart(e, 'work')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'work')}
            className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all ${
              isDragging ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 cursor-move">
              <GripVertical size={16} className="text-gray-400" />
              <FileText size={16} className="text-purple-600" />
              <h3 className="font-semibold text-gray-900 flex-1">Assign Work</h3>
            </div>
            <div className="p-4">
              {selectedClient ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Work Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                      <option value="">Choose work type...</option>
                      <option value="gst">GST Filing & Compliance</option>
                      <option value="itr">Income Tax Filing</option>
                      <option value="audit">Audit & Books</option>
                      <option value="compliance">Regulatory Compliance</option>
                      <option value="payroll">Payroll Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                      <option value="">Select team member...</option>
                      <option value="emp1">Admin User (You)</option>
                      <option value="emp2">Accountant 1</option>
                      <option value="emp3">Consultant 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                  <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                    Assign Work
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-8">Select a client to assign work</p>
              )}
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div
            key="tasks"
            draggable
            onDragStart={(e) => handleDragStart(e, 'tasks')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'tasks')}
            className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all ${
              isDragging ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 cursor-move">
              <GripVertical size={16} className="text-gray-400" />
              <Users size={16} className="text-green-600" />
              <h3 className="font-semibold text-gray-900 flex-1">Active Tasks</h3>
            </div>
            <div className="p-4">
              {selectedClient ? (
                <div className="space-y-2">
                  {[
                    { id: 1, task: 'GST Return Filing', status: 'In Progress', due: '2026-05-15', priority: 'High' },
                    { id: 2, task: 'Document Collection', status: 'Pending', due: '2026-05-10', priority: 'High' },
                    { id: 3, task: 'Compliance Review', status: 'Completed', due: '2026-04-20', priority: 'Medium' },
                  ].map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm text-gray-900">{task.task}</p>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span
                          className={`px-2 py-1 rounded ${
                            task.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {task.status}
                        </span>
                        <span>Due: {task.due}</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full mt-3 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition text-sm font-medium">
                    View All Tasks
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-8">Select a client to view tasks</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GST Client Master</h1>
            <p className="text-gray-600 mt-1">Manage clients, assign work, and track tasks</p>
          </div>
          <button
            onClick={() => {
              setEditingClient(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={18} />
            Add New Client
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Clients List */}
        <div className="flex-1 flex flex-col border-r border-gray-200 overflow-hidden">
          {/* Search and Filter */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by company name, GSTIN, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
              >
                <option value="all">All States</option>
                <option value="Bihar">Bihar</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>
          </div>

          {/* Clients List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading clients...</div>
            ) : filteredClients.length > 0 ? (
              <div className="space-y-2 p-4">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedClient?.id === client.id
                        ? 'bg-blue-50 border-blue-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{client.companyName}</h3>
                        <p className="text-xs text-gray-600 font-mono mt-1">{client.gstin}</p>
                        <p className="text-sm text-gray-700 mt-2">{client.emailAddress}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{client.typeOfReg}</span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{client.state}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                          className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client.id);
                          }}
                          className="p-2 hover:bg-red-100 rounded transition text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No clients found</div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="bg-white border-t border-gray-200 px-6 py-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Clients</p>
              <p className="text-lg font-bold text-gray-900">{clients.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Regular GST</p>
              <p className="text-lg font-bold text-gray-900">{clients.filter((c) => c.typeOfReg === 'Regular').length}</p>
            </div>
            <div>
              <p className="text-gray-600">Bihar State</p>
              <p className="text-lg font-bold text-gray-900">{clients.filter((c) => c.state === 'Bihar').length}</p>
            </div>
          </div>
        </div>

        {/* Right: Fixed Draggable Widgets */}
        <div className="w-96 bg-gray-50 overflow-y-auto flex flex-col gap-4 p-4">
          {selectedClient && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-900">{selectedClient.companyName}</h2>
                <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-600">{selectedClient.emailAddress}</p>
            </div>
          )}

          {/* Draggable Widgets */}
          {widgetOrder.map((widgetId) => renderWidget(widgetId))}

          {!selectedClient && (
            <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
              <Users size={32} className="mx-auto text-blue-400 mb-3" />
              <p className="text-gray-600">Select a client from the left to manage plans and assign work</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

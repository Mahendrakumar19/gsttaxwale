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
      window.location.href = '/auth/admin-login';
      return;
    }
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/gst-clients`, config);
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
            className={`bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all shadow-sm ${
              isDragging ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 border-b border-slate-100 cursor-move">
              <GripVertical size={14} className="text-slate-300" />
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] flex-1">Global Subscriptions</h3>
              <Zap size={14} className="text-slate-400" />
            </div>
            <div className="p-8">
              {selectedClient ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Tier</p>
                      <p className="text-base font-bold text-slate-900 tracking-tight">{selectedClient.currentPlan || 'Standard Tier'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">₹{selectedClient.planAmount || '5,000'}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Settlement</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Entitlements</p>
                    {['GST Filing', 'ITR Filing', 'Audit Support'].map((service, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <CheckCircle size={14} className="text-slate-900" />
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{service}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 px-6 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg active:scale-95">
                    Modify Subscription
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Awaiting Entity Selection</p>
                </div>
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
            className={`bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all shadow-sm ${
              isDragging ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 border-b border-slate-100 cursor-move">
              <GripVertical size={14} className="text-slate-300" />
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] flex-1">Assignment Portal</h3>
              <FileText size={14} className="text-slate-400" />
            </div>
            <div className="p-8">
              {selectedClient ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Service Type</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-900 outline-none transition-all cursor-pointer">
                      <option value="">Select work category...</option>
                      <option value="gst">Tax Compliance</option>
                      <option value="itr">Filing & Audit</option>
                      <option value="compliance">Regulatory Review</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Executive</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-900 outline-none transition-all cursor-pointer">
                      <option value="">Internal Staff...</option>
                      <option value="emp1">Current User</option>
                      <option value="emp2">Senior Associate</option>
                    </select>
                  </div>
                  <button className="w-full px-6 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg active:scale-95">
                    Confirm Assignment
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Awaiting Entity Selection</p>
                </div>
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
            className={`bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all shadow-sm ${
              isDragging ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 border-b border-slate-100 cursor-move">
              <GripVertical size={14} className="text-slate-300" />
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] flex-1">Operational Pipeline</h3>
              <Users size={14} className="text-slate-400" />
            </div>
            <div className="p-8">
              {selectedClient ? (
                <div className="space-y-4">
                  {[
                    { id: 1, task: 'Quarterly Audit', status: 'Active', priority: 'Urgent' },
                    { id: 2, task: 'Data Validation', status: 'Pending', priority: 'Routine' },
                  ].map((task) => (
                    <div key={task.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-900 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-900 tracking-tight">{task.task}</p>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest ${task.priority === 'Urgent' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.status}</span>
                        <div className="h-1 w-12 bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-slate-900 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full mt-2 px-6 py-3 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest">
                    Pipeline History
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Awaiting Entity Selection</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Master Database...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50/50 overflow-hidden animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-10 py-8 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Entity Master</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Strategic governance of tax compliance and reporting structures</p>
          </div>
          <button
            onClick={() => {
              setEditingClient(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} />
            Initialize Registration
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Clients List */}
        <div className="flex-1 flex flex-col border-r border-slate-200 overflow-hidden bg-white">
          <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  placeholder="Search master directory (Name, GSTIN, Contact)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-6 py-3.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 uppercase tracking-widest focus:border-slate-900 outline-none cursor-pointer shadow-sm"
              >
                <option value="all">Jurisdiction: GLOBAL</option>
                <option value="Bihar">Jurisdiction: BIHAR</option>
                <option value="Delhi">Jurisdiction: DELHI</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredClients.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-8 rounded-3xl border-2 transition-all duration-500 relative group cursor-pointer ${
                      selectedClient?.id === client.id
                        ? 'bg-slate-50 border-slate-900 shadow-xl scale-[1.02]'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                           <div className={`w-2 h-2 rounded-full ${selectedClient?.id === client.id ? 'bg-slate-900 animate-pulse' : 'bg-slate-200'}`} />
                           <h3 className="text-base font-bold text-slate-900 tracking-tight">{client.companyName}</h3>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 font-mono tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           {client.gstin}
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          <span className="text-[9px] font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase tracking-widest">{client.typeOfReg}</span>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-200">{client.state}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                          className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}
                          className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                   <Search size={32} className="opacity-20" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No matching entities in master directory</p>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="bg-slate-50/50 border-t border-slate-100 px-10 py-6 grid grid-cols-3 gap-10">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Asset Registry Total</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{clients.length}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Compliance Matrix Index</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">98.2%</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Regional Nodes Active</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">12 Hubs</p>
            </div>
          </div>
        </div>

        {/* Right: Widgets */}
        <div className="w-[450px] bg-slate-50/30 overflow-y-auto p-8 space-y-8 border-l border-slate-100 shadow-inner">
          {selectedClient ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Entity Analytics</p>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{selectedClient.companyName}</h2>
                </div>
                <button onClick={() => setSelectedClient(null)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-2xl shadow-sm border border-transparent hover:border-slate-200">
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                <span className="text-slate-200">📧</span>
                <span className="truncate">{selectedClient.emailAddress}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[200px] shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
                 <Users size={24} className="text-slate-200" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-[220px] leading-relaxed">Select institutional entity to engage operational analytics</p>
            </div>
          )}

          {/* Draggable Widgets */}
          <div className="space-y-8">
            {widgetOrder.map((widgetId) => renderWidget(widgetId))}
          </div>
        </div>
      </div>
    </div>
  );
}

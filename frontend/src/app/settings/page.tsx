'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function SettingsPage(){
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const u = localStorage.getItem('user');
    if(u){
      try{ setUser(JSON.parse(u)) }catch(e){ setUser(null) }
    }
    setLoading(false);
  },[])

  if(loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <div className="bg-white p-6 rounded shadow space-y-4">
        <div><strong>Name:</strong> {user?.name || '-'}</div>
        <div><strong>Email:</strong> {user?.email || '-'}</div>
        <div><strong>Role:</strong> {user?.role || '-'}</div>
      </div>
    </div>
  )
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DownloadsPage(){
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{fetchFiles()},[]);

  const fetchFiles = async () => {
    try{
      const res = await api.get('/downloads');
      setFiles(res.data || []);
    }catch(err){
      console.error(err);
      setFiles([]);
    }finally{setLoading(false)}
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Downloads</h1>
      {loading? <p className="text-gray-600">Loading...</p> : (
        files.length===0? <p className="text-gray-600">No files available</p> : (
          <ul className="space-y-2">
            {files.map(f => (
              <li key={f.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                <div>{f.name}</div>
                <a href={f.url} className="text-indigo-600">Download</a>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}

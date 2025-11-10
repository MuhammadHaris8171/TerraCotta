import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);

  useEffect(()=>{ api.get('/audit').then(r=>setLogs(r.data.logs)).catch(()=>{}); }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Audit Trail</h2>
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full text-sm">
          <thead><tr><th>Time</th><th>Entity</th><th>Action</th><th>By</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map(l=>(
              <tr key={l.id}>
                <td className="p-2">{new Date(l.performed_at).toLocaleString()}</td>
                <td className="p-2">{l.entity_type}/{l.entity_id}</td>
                <td className="p-2">{l.action}</td>
                <td className="p-2">{l.performed_by}</td>
                <td className="p-2"><pre className="whitespace-pre-wrap max-w-xs">{JSON.stringify(l.changes || {}, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

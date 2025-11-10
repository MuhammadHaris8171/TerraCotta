import React, { useState } from 'react';
import api from '../utils/apiClient';

export default function Monthly() {
  const [month, setMonth] = useState('01');
  const [year, setYear] = useState(new Date().getFullYear());
  const [memberId, setMemberId] = useState('');
  const [report, setReport] = useState(null);

  async function load(e) {
    e && e.preventDefault();
    const res = await api.get('/reports/monthly', { params: { month, year, member_id: memberId || undefined }});
    setReport(res.data);
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Monthly Report</h2>
      <form onSubmit={load} className="flex gap-2 items-end mb-4">
        <div>
          <label className="block text-sm">Month</label>
          <select value={month} onChange={e=>setMonth(e.target.value)} className="border p-2 rounded">
            {Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')).map(m=><option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Year</label>
          <input type="number" value={year} onChange={e=>setYear(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Member ID (optional)</label>
          <input value={memberId} onChange={e=>setMemberId(e.target.value)} className="border p-2 rounded"/>
        </div>
        <button className="py-2 px-4 bg-indigo-600 text-white rounded">Run</button>
      </form>

      {report && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {report.totals.map(t=>(
              <div className="p-4 bg-white rounded shadow" key={t.type}>
                <div className="text-sm">{t.type.toUpperCase()}</div>
                <div className="text-2xl font-bold">{Number(t.total).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Transactions</h3>
            <table className="w-full">
              <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Category</th><th>Description</th></tr></thead>
              <tbody>
                {report.transactions.map(tx=>(
                  <tr key={tx.id}>
                    <td className="p-2">{tx.date}</td>
                    <td className="p-2">{tx.type}</td>
                    <td className="p-2">{Number(tx.amount).toFixed(2)}</td>
                    <td className="p-2">{tx.category}</td>
                    <td className="p-2">{tx.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

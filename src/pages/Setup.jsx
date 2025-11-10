import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient';

export default function Setup() {
  const [setup, setSetup] = useState(null);

  useEffect(() => {
    api.get('/setup').then(res => setSetup(res.data.setup)).catch(()=>{});
  }, []);

  async function save(e) {
    e.preventDefault();
    const payload = { fiscal_year_start: setup.fiscal_year_start, reporting_months: setup.reporting_months, categories: setup.categories };
    await api.put('/setup', payload);
    alert('Saved');
  }

  if (!setup) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">System Setup</h2>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm">Fiscal Year Start</label>
          <input type="date" value={setup.fiscal_year_start ? setup.fiscal_year_start.slice(0,10) : ''} onChange={e=>setSetup({...setup,fiscal_year_start:e.target.value})} className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block text-sm">Reporting Months (JSON array)</label>
          <textarea rows="4" value={JSON.stringify(setup.reporting_months || [], null, 2)} onChange={e=>setSetup({...setup,reporting_months: JSON.parse(e.target.value)})} className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block text-sm">Categories (JSON)</label>
          <textarea rows="4" value={JSON.stringify(setup.categories || {}, null, 2)} onChange={e=>setSetup({...setup,categories: JSON.parse(e.target.value)})} className="w-full border p-2 rounded"/>
        </div>
        <button className="py-2 px-4 bg-indigo-600 text-white rounded">Save</button>
      </form>
    </div>
  );
}

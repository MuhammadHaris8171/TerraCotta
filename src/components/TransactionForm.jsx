import React, { useState } from 'react';
import api from '../utils/apiClient';

export default function TransactionForm({ type = 'income', initial = {}, onSaved }) {
  const [form, setForm] = useState({ member_id: initial.member_id || '', amount: initial.amount || '', category: initial.category || '', description: initial.description || '', date: initial.date || new Date().toISOString().slice(0,10) });

  async function submit(e) {
    e.preventDefault();
    await api.post('/transactions', { ...form, type });
    if (onSaved) onSaved();
    setForm({ member_id:'', amount:'', category:'', description:'', date:new Date().toISOString().slice(0,10) });
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-3 bg-white p-4 rounded shadow">
      <h3 className="text-lg font-medium">{type === 'income' ? 'Add Income' : 'Add Expense'}</h3>
      <div>
        <label className="text-sm">Member ID (optional)</label>
        <input value={form.member_id} onChange={e=>setForm({...form,member_id:e.target.value})} className="w-full border p-2 rounded"/>
      </div>
      <div>
        <label className="text-sm">Amount</label>
        <input required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} type="number" step="0.01" className="w-full border p-2 rounded"/>
      </div>
      <div>
        <label className="text-sm">Category</label>
        <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border p-2 rounded"/>
      </div>
      <div>
        <label className="text-sm">Description</label>
        <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border p-2 rounded"/>
      </div>
      <div>
        <label className="text-sm">Date</label>
        <input value={form.date} onChange={e=>setForm({...form,date:e.target.value})} type="date" className="w-full border p-2 rounded"/>
      </div>
      <button className="py-2 px-4 bg-green-600 text-white rounded">Save</button>
    </form>
  );
}

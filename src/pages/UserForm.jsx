import React, { useState, useEffect } from 'react';
import api from '../utils/apiClient';
import { useNavigate, useParams } from 'react-router-dom';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', username:'', password:'', role:'member', status:'active' });

  useEffect(() => {
    if (id) {
      api.get(`/users`, { params: { page:1, limit:1, search: '' } }).catch(()=>{}); // optional
      api.get(`/users/${id}`).then(res => setForm(res.data.user)).catch(()=>{});
    }
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    if (id) {
      await api.put(`/users/${id}`, form);
    } else {
      await api.post('/users', form);
    }
    navigate('/users');
  }

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-semibold mb-4">{id ? 'Edit User' : 'Create User'}</h2>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="block text-sm">Email</label><input required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border p-2 rounded"/></div>
        <div><label className="block text-sm">Username</label><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} className="w-full border p-2 rounded"/></div>
        {!id && <div><label className="block text-sm">Password</label><input required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" className="w-full border p-2 rounded"/></div>}
        <div><label className="block text-sm">Role</label>
          <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full border p-2 rounded">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div><label className="block text-sm">Status</label>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full border p-2 rounded">
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
        <button className="py-2 px-4 bg-indigo-600 text-white rounded">{id ? 'Save' : 'Create'}</button>
      </form>
    </div>
  );
}

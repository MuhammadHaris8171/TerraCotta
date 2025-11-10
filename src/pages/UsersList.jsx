import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/apiClient';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  async function fetchUsers() {
    const res = await api.get('/users', { params: { search: q, page }});
    setUsers(res.data.users);
  }

  useEffect(() => { fetchUsers(); }, [page]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <Link to="/users/new" className="btn">Create user</Link>
      </div>
      <div className="mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search email or username" className="border p-2 rounded w-full"/>
        <button onClick={()=>{setPage(1); fetchUsers();}} className="mt-2 py-2 px-4 bg-indigo-600 text-white rounded">Search</button>
      </div>
      <div className="bg-white shadow rounded">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-3">{u.email}</td>
                <td className="px-6 py-3">{u.username}</td>
                <td className="px-6 py-3">{u.role}</td>
                <td className="px-6 py-3">{u.status}</td>
                <td className="px-6 py-3">
                  <Link to={`/users/${u.id}/edit`} className="text-indigo-600">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import UserForm from './pages/UserForm';
import AddIncome from './pages/AddIncome';
import AddExpense from './pages/AddExpense';
import Setup from './pages/Setup';
import Monthly from './pages/Monthly';
import AuditTrail from './pages/AuditTrail';
import { AuthProvider, AuthContext } from './context/AuthContext';

function Protected({ children }) {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <Protected>
              <Dashboard />
            </Protected>
          } />
          {/* Users (admin) */}
          <Route path="/users" element={<Protected><UsersList/></Protected>} />
          <Route path="/users/new" element={<Protected><UserForm/></Protected>} />
          <Route path="/users/:id/edit" element={<Protected><UserForm/></Protected>} />

          {/* Transactions */}
          <Route path="/transactions/income" element={<Protected><AddIncome/></Protected>} />
          <Route path="/transactions/expense" element={<Protected><AddExpense/></Protected>} />

          {/* Setup */}
          <Route path="/setup" element={<Protected><Setup/></Protected>} />

          {/* Reports */}
          <Route path="/reports/monthly" element={<Protected><Monthly/></Protected>} />

          {/* Audit */}
          <Route path="/audit" element={<Protected><AuditTrail/></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

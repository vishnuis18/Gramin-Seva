import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import CitizenHome from './components/citizen/CitizenHome';
import CitizenComplaints from './components/citizen/CitizenComplaints';
import Dashboard from './components/admin/Dashboard';
import AllComplaints from './components/admin/AllComplaints';
import Technicians from './components/admin/Technicians';
import Reports from './components/admin/Reports';
import AssignedComplaints from './components/technician/AssignedComplaints';
import './i18n';

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'technician') {
      setActivePage('dashboard');
    } else {
      setActivePage('home');
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    if (user?.role === 'citizen') {
      if (activePage === 'complaints') return <CitizenComplaints key={`complaints-${Date.now()}`} />;
      return <CitizenHome setActivePage={setActivePage} />;
    }
    if (user?.role === 'technician') {
      if (activePage === 'assigned') return <AssignedComplaints />;
      return <Dashboard />;
    }
    if (user?.role === 'admin') {
      if (activePage === 'complaints') return <AllComplaints />;
      if (activePage === 'technicians') return <Technicians />;
      if (activePage === 'reports') return <Reports />;
      return <Dashboard />;
    }
    return <CitizenHome setActivePage={setActivePage} />;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF9' }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

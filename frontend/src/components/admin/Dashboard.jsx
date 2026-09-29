import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { categoryIcons, categoryColors } from '../../utils/constants';
import api from '../../utils/api';
import StatusBadge from '../ui/StatusBadge';
import Card from '../ui/Card';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { label: t('dashboard.totalComplaints'), value: '...', icon: FileText, color: '#3B82F6' },
    { label: t('dashboard.pending'), value: '...', icon: Clock, color: '#EAB308' },
    { label: t('dashboard.inProgress'), value: '...', icon: AlertCircle, color: '#F97316' },
    { label: t('dashboard.resolved'), value: '...', icon: CheckCircle, color: '#16A34A' },
  ]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (user?.role === 'admin') {
          const data = await api('/reports/dashboard');
          const o = data.overview;
          setStats([
            { label: t('dashboard.totalComplaints'), value: String(o.totalComplaints), icon: FileText, color: '#3B82F6' },
            { label: t('dashboard.pending'), value: String(o.pendingComplaints), icon: Clock, color: '#EAB308' },
            { label: t('dashboard.inProgress'), value: String(o.inProgressComplaints), icon: AlertCircle, color: '#F97316' },
            { label: t('dashboard.resolved'), value: String(o.resolvedComplaints), icon: CheckCircle, color: '#16A34A' },
          ]);
          setRecentComplaints(o.recentComplaints || []);
        } else {
          const data = await api('/complaints');
          const complaints = data.complaints || [];
          setStats([
            { label: t('dashboard.totalComplaints'), value: String(complaints.length), icon: FileText, color: '#3B82F6' },
            { label: t('complaints.assigned'), value: String(complaints.filter(c => c.status === 'assigned').length), icon: Clock, color: '#EAB308' },
            { label: t('dashboard.inProgress'), value: String(complaints.filter(c => c.status === 'in-progress').length), icon: AlertCircle, color: '#F97316' },
            { label: t('dashboard.resolved'), value: String(complaints.filter(c => c.status === 'closed').length), icon: CheckCircle, color: '#16A34A' },
          ]);
          setRecentComplaints(complaints.slice(0, 10));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      }
    };
    fetchDashboard();
  }, [user, t]);

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{t('dashboard.overview')}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>{stat.label}</p>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                  </div>
                  <div style={{ width: '56px', height: '56px', backgroundColor: stat.color + '20', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={28} color={stat.color} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <Card>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>{t('dashboard.recentComplaints')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentComplaints.length === 0 ? (
              <p style={{ color: '#78716C' }}>{t('dashboard.noComplaints')}</p>
            ) : recentComplaints.map((c) => {
              const Icon = categoryIcons[c.category] || AlertCircle;
              return (
                <div key={c._id || c.complaintId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={20} color={categoryColors[c.category] || '#2B5A3D'} />
                    <div>
                      <p style={{ fontWeight: '500', margin: 0 }}>{c.complaintId}</p>
                      <p style={{ fontSize: '14px', color: '#78716C', margin: 0, textTransform: 'capitalize' }}>{c.category} Issue</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

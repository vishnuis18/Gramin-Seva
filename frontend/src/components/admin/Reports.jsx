import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Card from '../ui/Card';

const Reports = () => {
  const { t } = useTranslation();
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const data = await api(`/reports/monthly?month=${month}&year=${year}`);
      setReport(data.report);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  }, [month, year]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({ label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), month: d.getMonth() + 1, year: d.getFullYear() });
  }

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{t('reports.monthlyReports')}</h1>
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#57534E', marginBottom: '8px' }}>Select Month</label>
            <select value={`${month}-${year}`} onChange={(e) => { const [m, y] = e.target.value.split('-'); setMonth(Number(m)); setYear(Number(y)); }}
              style={{ padding: '12px 16px', border: '2px solid #E7E5E4', borderRadius: '10px', fontSize: '16px', fontFamily: 'inherit', outline: 'none' }}>
              {months.map((m) => (
                <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>{m.label}</option>
              ))}
            </select>
          </div>

          {loadingReport ? (
            <p style={{ color: '#78716C' }}>Loading report...</p>
          ) : report ? (
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>Report Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Total Complaints', value: report.summary.totalComplaints },
                  { label: 'Resolved', value: report.summary.resolved },
                  { label: 'Avg Resolution Time', value: report.summary.avgResolutionTime },
                  { label: 'Month-over-Month', value: report.summary.monthOverMonthChange },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '16px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                    <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>{label}</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
              {report.technicianPerformance?.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>Technician Performance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {report.technicianPerformance.map((tp, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                        <span style={{ fontWeight: '500' }}>{tp.name}</span>
                        <span style={{ fontSize: '14px', color: '#78716C' }}>Assigned: {tp.assigned} | Resolved: {tp.resolved}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#78716C' }}>No data available for this month.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Reports;

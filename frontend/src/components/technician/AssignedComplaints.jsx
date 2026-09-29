import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Camera, X } from 'lucide-react';
import { categoryIcons, categoryColors } from '../../utils/constants';
import api from '../../utils/api';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AssignedComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveComplaint, setResolveComplaint] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolveImages, setResolveImages] = useState([]);
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const data = await api('/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch assigned complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await api(`/complaints/${complaintId}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  const openResolveModal = (complaint) => {
    setResolveComplaint(complaint);
    setResolveNote('');
    setResolveImages([]);
    setResolveModalOpen(true);
  };

  const handleTechnicianResolve = async () => {
    setResolveSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('note', resolveNote);
      resolveImages.forEach(img => fd.append('images', img));
      await api(`/complaints/${resolveComplaint._id}/technician-resolve`, { method: 'POST', body: fd });
      setResolveModalOpen(false);
      setResolveComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    } finally {
      setResolveSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{t('assigned.assignedComplaints')}</h1>

        {loadingComplaints ? (
          <p style={{ color: '#78716C' }}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p style={{ color: '#78716C' }}>No complaints assigned to you.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((complaint) => {
              const Icon = categoryIcons[complaint.category] || AlertCircle;
              const catColor = categoryColors[complaint.category] || '#2B5A3D';
              return (
                <Card key={complaint._id} hover>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: `${catColor}1A`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} color={catColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>{complaint.complaintId}</h3>
                          <p style={{ fontSize: '14px', color: '#78716C', margin: 0 }}>{complaint.location?.address || 'N/A'}</p>
                        </div>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p style={{ color: '#57534E', margin: '0 0 12px 0' }}>{complaint.description}</p>

                      {complaint.status === 'pending_verification' && complaint.technicianResolution?.resolvedAt && (
                        <div style={{ padding: '10px 14px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '12px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#78716C', margin: '0 0 4px' }}>Your Resolution</p>
                          <p style={{ fontSize: '13px', color: '#15803D', margin: '0 0 2px' }}>✓ Submitted — awaiting citizen confirmation</p>
                          {complaint.technicianResolution.note && <p style={{ fontSize: '12px', color: '#57534E', margin: 0 }}>{complaint.technicianResolution.note}</p>}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {complaint.status === 'assigned' && (
                          <Button variant="primary" size="sm" onClick={() => handleStatusChange(complaint._id, 'in-progress')}>Mark In Progress</Button>
                        )}
                        {complaint.status === 'in-progress' && (
                          <Button variant="primary" size="sm" onClick={() => openResolveModal(complaint)}>Mark Resolved</Button>
                        )}
                        {complaint.status === 'reopened' && (
                          <Button variant="primary" size="sm" onClick={() => openResolveModal(complaint)}>Re-submit Resolution</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {resolveModalOpen && resolveComplaint && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Mark as Resolved</h2>
            <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 20px 0' }}>{resolveComplaint.complaintId}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Resolution Note (optional)</label>
                <textarea value={resolveNote} onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Describe what was done to fix the issue..."
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E7E5E4', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '90px', boxSizing: 'border-box', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#2B5A3D'}
                  onBlur={(e) => e.target.style.borderColor = '#E7E5E4'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Proof Photos (optional, up to 3)</label>
                <input type="file" accept="image/*" multiple id="resolve-upload" style={{ display: 'none' }} onChange={(e) => setResolveImages(Array.from(e.target.files).slice(0, 3))} />
                <label htmlFor="resolve-upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '2px dashed #D6D3D1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#78716C' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D6D3D1'}>
                  <Camera size={18} /> Upload Photos
                </label>
                {resolveImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {resolveImages.map((img, i) => (
                      <img key={i} src={URL.createObjectURL(img)} alt="" style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Button variant="outline" onClick={() => setResolveModalOpen(false)} style={{ flex: 1 }} disabled={resolveSubmitting}>Cancel</Button>
              <Button variant="primary" onClick={handleTechnicianResolve} disabled={resolveSubmitting} style={{ flex: 1 }}>
                {resolveSubmitting ? 'Submitting...' : 'Submit Resolution'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, X, Camera, ZoomIn } from 'lucide-react';
import { categoryIcons, categoryColors } from '../../utils/constants';
import api from '../../utils/api';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AllComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [closureComplaint, setClosureComplaint] = useState(null);
  const [closureNote, setClosureNote] = useState('');
  const [closureSubmitting, setClosureSubmitting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const resolveUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
  };

  const fetchComplaints = useCallback(async () => {
    try {
      const data = await api('/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const openAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedTechnicianId('');
    setAssignModalOpen(true);
    try {
      const data = await api('/technicians');
      setTechnicians(data.technicians || []);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    }
  };

  const handleAssign = async () => {
    if (!selectedTechnicianId || !selectedComplaint) return;
    setAssigning(true);
    try {
      await api(`/complaints/${selectedComplaint._id}/assign`, { method: 'POST', body: JSON.stringify({ technicianId: selectedTechnicianId }) });
      setAssignModalOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await api(`/complaints/${complaintId}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  const openClosureModal = (complaint) => {
    setClosureComplaint(complaint);
    setClosureNote('');
    setClosureModalOpen(true);
  };

  const handleAdminClose = async (action) => {
    setClosureSubmitting(true);
    try {
      await api(`/complaints/${closureComplaint._id}/admin-close`, { method: 'POST', body: JSON.stringify({ action, note: closureNote }) });
      setClosureModalOpen(false);
      setClosureComplaint(null);
      fetchComplaints();
      if (action === 'reassigned') openAssignModal(closureComplaint);
    } catch (err) {
      alert(err.message);
    } finally {
      setClosureSubmitting(false);
    }
  };

  const ImageStrip = ({ images }) => {
    if (!images?.length) return null;
    return (
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
        {images.map((img, i) => (
          <div key={i} onClick={() => setLightboxUrl(resolveUrl(img.url))} style={{ position: 'relative', cursor: 'zoom-in' }}>
            <img src={resolveUrl(img.url)} alt={`proof-${i + 1}`}
              style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '2px solid #E7E5E4', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.25)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'}>
              <ZoomIn size={18} color="white" style={{ opacity: 0.9 }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{t('complaints.allComplaints')}</h1>

        {loadingComplaints ? (
          <p style={{ color: '#78716C' }}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p style={{ color: '#78716C' }}>No complaints found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((complaint) => {
              const Icon = categoryIcons[complaint.category] || AlertCircle;
              const catColor = categoryColors[complaint.category] || '#2B5A3D';
              const awaitingClosure = complaint.status === 'pending_verification' &&
                complaint.technicianResolution?.resolvedAt && complaint.citizenVerification?.respondedAt;

              return (
                <Card key={complaint._id} hover>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: `${catColor}1A`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} color={catColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>{complaint.complaintId}</h3>
                          <p style={{ fontSize: '14px', color: '#78716C', margin: 0, textTransform: 'capitalize' }}>{complaint.category} • {complaint.location?.address || 'N/A'}</p>
                        </div>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p style={{ color: '#57534E', margin: '0 0 12px 0' }}>{complaint.description}</p>

                      {complaint.status === 'pending_verification' && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          {[
                            { label: 'Technician', resolved: complaint.technicianResolution?.resolvedAt, resolvedText: '✓ Marked resolved', pendingText: 'Awaiting update', note: complaint.technicianResolution?.note, images: complaint.technicianResolution?.images },
                            { label: 'Citizen', resolved: complaint.citizenVerification?.respondedAt, resolvedText: complaint.citizenVerification?.confirmed ? '✓ Confirmed fixed' : '✗ Says not fixed', pendingText: 'Awaiting response', note: complaint.citizenVerification?.note, images: complaint.citizenVerification?.images, confirmed: complaint.citizenVerification?.confirmed },
                          ].map(side => (
                            <div key={side.label} style={{ flex: 1, minWidth: 200, padding: '10px 14px', backgroundColor: side.resolved ? '#F0FDF4' : '#FFF7ED', borderRadius: '8px', border: `1px solid ${side.resolved ? '#BBF7D0' : '#FED7AA'}` }}>
                              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716C', margin: '0 0 4px' }}>{side.label}</p>
                              {side.resolved ? (
                                <>
                                  <p style={{ fontSize: '13px', fontWeight: 500, color: side.confirmed === false ? '#DC2626' : '#15803D', margin: '0 0 2px' }}>{side.resolvedText}</p>
                                  {side.note && <p style={{ fontSize: '12px', color: '#57534E', margin: 0 }}>{side.note}</p>}
                                  <ImageStrip images={side.images} />
                                </>
                              ) : <p style={{ fontSize: '13px', color: '#EA580C', margin: 0 }}>{side.pendingText}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {complaint.assignedTo ? (
                          <span style={{ fontSize: '14px', color: '#2B5A3D', fontWeight: '500' }}>Assigned to: {complaint.assignedTo.name || 'Technician'}</span>
                        ) : (
                          <Button variant="primary" size="sm" onClick={() => openAssignModal(complaint)}>Assign Technician</Button>
                        )}
                        {complaint.status === 'submitted' && (
                          <Button variant="danger" size="sm" onClick={() => handleStatusChange(complaint._id, 'rejected')}>Reject</Button>
                        )}
                        {awaitingClosure && (
                          <Button variant="primary" size="sm" onClick={() => openClosureModal(complaint)}>Review & Close</Button>
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

      {lightboxUrl && (
        <div onClick={() => setLightboxUrl(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px', cursor: 'zoom-out' }}>
          <button onClick={() => setLightboxUrl(null)} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 28 }}>×</button>
          <img src={lightboxUrl} alt="preview" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}

      {assignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Assign Technician</h2>
            <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 24px 0' }}>Complaint: {selectedComplaint?.complaintId} — <span style={{ textTransform: 'capitalize' }}>{selectedComplaint?.category}</span></p>
            {technicians.length === 0 ? (
              <p style={{ color: '#78716C' }}>Loading technicians...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {technicians.map((tech) => {
                  const matchesCategory = tech.specialization?.includes(selectedComplaint?.category);
                  return (
                    <div key={tech._id} onClick={() => setSelectedTechnicianId(tech._id)} style={{ padding: '16px', borderRadius: '10px', border: `2px solid ${selectedTechnicianId === tech._id ? '#2B5A3D' : '#E7E5E4'}`, backgroundColor: selectedTechnicianId === tech._id ? 'rgba(43,90,61,0.05)' : 'white', cursor: 'pointer', opacity: matchesCategory ? 1 : 0.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>{tech.name}</p>
                          <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>{tech.phone}</p>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {tech.specialization?.map((s) => (
                              <span key={s} style={{ padding: '2px 8px', backgroundColor: s === selectedComplaint?.category ? '#D1FAE5' : '#F5F5F4', borderRadius: '4px', fontSize: '12px', textTransform: 'capitalize' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '12px', color: '#78716C', margin: '0 0 2px 0' }}>Active: {tech.activeComplaints || 0}</p>
                          {!matchesCategory && <p style={{ fontSize: '11px', color: '#DC2626', margin: 0 }}>Specialization mismatch</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={() => setAssignModalOpen(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button variant="primary" onClick={handleAssign} disabled={!selectedTechnicianId || assigning} style={{ flex: 1 }}>
                {assigning ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {closureModalOpen && closureComplaint && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Review & Close</h2>
            <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 20px 0' }}>{closureComplaint.complaintId}</p>
            <div style={{ marginBottom: '12px', padding: '14px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#78716C', margin: '0 0 6px' }}>Technician Response</p>
              <p style={{ fontSize: '14px', color: '#15803D', fontWeight: 500, margin: '0 0 4px' }}>✓ Marked as resolved</p>
              {closureComplaint.technicianResolution?.note && <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 6px' }}>{closureComplaint.technicianResolution.note}</p>}
              <ImageStrip images={closureComplaint.technicianResolution?.images} />
            </div>
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: closureComplaint.citizenVerification?.confirmed ? '#F0FDF4' : '#FEF2F2', borderRadius: '10px', border: `1px solid ${closureComplaint.citizenVerification?.confirmed ? '#BBF7D0' : '#FECACA'}` }}>
              <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#78716C', margin: '0 0 6px' }}>Citizen Response</p>
              <p style={{ fontSize: '14px', fontWeight: 500, color: closureComplaint.citizenVerification?.confirmed ? '#15803D' : '#DC2626', margin: '0 0 4px' }}>
                {closureComplaint.citizenVerification?.confirmed ? '✓ Confirmed issue is fixed' : '✗ Says issue is not fixed'}
              </p>
              {closureComplaint.citizenVerification?.note && <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 6px' }}>{closureComplaint.citizenVerification.note}</p>}
              <ImageStrip images={closureComplaint.citizenVerification?.images} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Admin Note (optional)</label>
              <textarea value={closureNote} onChange={(e) => setClosureNote(e.target.value)}
                placeholder="Add a note before closing or re-assigning..."
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #E7E5E4', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#2B5A3D'}
                onBlur={(e) => e.target.style.borderColor = '#E7E5E4'} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline" onClick={() => setClosureModalOpen(false)} style={{ flex: 1 }} disabled={closureSubmitting}>Cancel</Button>
              <Button variant="danger" size="md" onClick={() => handleAdminClose('reassigned')} disabled={closureSubmitting} style={{ flex: 1 }}>Re-assign</Button>
              <Button variant="primary" size="md" onClick={() => handleAdminClose('closed')} disabled={closureSubmitting} style={{ flex: 1 }}>
                {closureSubmitting ? 'Closing...' : 'Close Complaint'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AllComplaints;

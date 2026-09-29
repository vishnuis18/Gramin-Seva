import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock, Camera, X, CheckCircle } from 'lucide-react';
import { categoryIcons, categoryColors } from '../../utils/constants';
import api from '../../utils/api';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';

const CitizenComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyComplaint, setVerifyComplaint] = useState(null);
  const [verifyConfirmed, setVerifyConfirmed] = useState(null);
  const [verifyNote, setVerifyNote] = useState('');
  const [verifyImages, setVerifyImages] = useState([]);
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const data = await api('/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints, refreshKey]);

  const openVerifyModal = (complaint) => {
    setVerifyComplaint(complaint);
    setVerifyConfirmed(null);
    setVerifyNote('');
    setVerifyImages([]);
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async () => {
    if (verifyConfirmed === null) return;
    setVerifySubmitting(true);
    try {
      const fd = new FormData();
      fd.append('confirmed', verifyConfirmed);
      fd.append('note', verifyNote);
      verifyImages.forEach(img => fd.append('images', img));
      await api(`/complaints/${verifyComplaint._id}/citizen-verify`, { method: 'POST', body: fd });
      setVerifyModalOpen(false);
      setVerifyComplaint(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifySubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{t('citizen.myComplaints')}</h1>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} disabled={loadingComplaints}>Refresh</Button>
        </div>

        {loadingComplaints ? (
          <p style={{ color: '#78716C' }}>{t('citizen.loadingComplaints')}</p>
        ) : complaints.length === 0 ? (
          <p style={{ color: '#78716C' }}>{t('citizen.noComplaints')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((complaint) => {
              const Icon = categoryIcons[complaint.category] || AlertCircle;
              const catColor = categoryColors[complaint.category] || '#2B5A3D';
              const needsVerification = complaint.status === 'pending_verification' && !complaint.citizenVerification?.respondedAt;
              return (
                <Card key={complaint.complaintId} hover>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: `${catColor}1A`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} color={catColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>{complaint.complaintId}</h3>
                          <p style={{ fontSize: '14px', color: '#78716C', textTransform: 'capitalize', margin: 0 }}>
                            {t(`citizen.${complaint.category}`)} • {complaint.location.address}
                          </p>
                        </div>
                        <StatusBadge status={complaint.status} label={t(`complaints.${complaint.status}`)} />
                      </div>
                      <p style={{ color: '#57534E', margin: '0 0 12px 0' }}>{complaint.description}</p>

                      {needsVerification && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FFF7ED', borderRadius: '10px', border: '1px solid #FED7AA', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <AlertCircle size={18} color="#D97706" />
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', margin: '0 0 2px' }}>Action required</p>
                              <p style={{ fontSize: '13px', color: '#B45309', margin: 0 }}>The technician has marked this as resolved. Was your issue fixed?</p>
                            </div>
                          </div>
                          <Button variant="primary" size="sm" onClick={() => openVerifyModal(complaint)}>Respond</Button>
                        </div>
                      )}

                      {complaint.status === 'pending_verification' && complaint.citizenVerification?.respondedAt && (
                        <div style={{ padding: '10px 14px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '12px' }}>
                          <p style={{ fontSize: '13px', color: '#15803D', fontWeight: 500, margin: 0 }}>✓ Your response submitted — awaiting admin review</p>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#78716C' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={16} />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {verifyModalOpen && verifyComplaint && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Was your issue resolved?</h2>
            <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 24px 0' }}>{verifyComplaint.complaintId}</p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {[
                { value: true, label: "Yes, it's fixed", bg: '#F0FDF4', border: '#16A34A', color: '#15803D' },
                { value: false, label: "No, still an issue", bg: '#FEF2F2', border: '#DC2626', color: '#B91C1C' },
              ].map(opt => (
                <button key={String(opt.value)} type="button" onClick={() => setVerifyConfirmed(opt.value)} style={{
                  flex: 1, padding: '16px 12px', borderRadius: '10px',
                  border: `2px solid ${verifyConfirmed === opt.value ? opt.border : '#E7E5E4'}`,
                  backgroundColor: verifyConfirmed === opt.value ? opt.bg : 'white',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                  color: verifyConfirmed === opt.value ? opt.color : '#57534E', transition: 'all 0.15s',
                }}>
                  {opt.value ? '✓' : '✗'} {opt.label}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Additional note <span style={{ color: '#A8A29E', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea value={verifyNote} onChange={(e) => setVerifyNote(e.target.value)}
                placeholder={verifyConfirmed === false ? 'Describe what is still not working...' : 'Any additional feedback...'}
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #E7E5E4', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#2B5A3D'}
                onBlur={(e) => e.target.style.borderColor = '#E7E5E4'}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Photo proof <span style={{ color: '#A8A29E', fontWeight: 400 }}>(optional, up to 3)</span>
              </label>
              <input type="file" accept="image/*" multiple id="verify-upload" style={{ display: 'none' }} onChange={(e) => setVerifyImages(Array.from(e.target.files).slice(0, 3))} />
              <label htmlFor="verify-upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '2px dashed #D6D3D1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#78716C' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D6D3D1'}>
                <Camera size={16} /> Upload Photos
              </label>
              {verifyImages.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {verifyImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={URL.createObjectURL(img)} alt="" style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover' }} />
                      <button type="button" onClick={() => setVerifyImages(verifyImages.filter((_, idx) => idx !== i))}
                        style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline" onClick={() => setVerifyModalOpen(false)} style={{ flex: 1 }} disabled={verifySubmitting}>Cancel</Button>
              <Button variant="primary" onClick={handleVerifySubmit} disabled={verifyConfirmed === null || verifySubmitting} style={{ flex: 1 }}>
                {verifySubmitting ? 'Submitting...' : 'Submit Response'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CitizenComplaints;

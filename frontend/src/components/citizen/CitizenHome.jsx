import { useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText, MapPin, Phone, Camera, Send, CheckCircle, AlertCircle,
  LayoutGrid, Check, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import api from '../../utils/api';
import { categoryColors, categoryIcons } from '../../utils/constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const CitizenHome = ({ setActivePage }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ category: '', description: '', phone: '', location: { address: '' } });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  const TOTAL_STEPS = 4;

  const categories = [
    { id: 'water', label: t('citizen.water'), icon: categoryIcons.water },
    { id: 'electricity', label: t('citizen.electricity'), icon: categoryIcons.electricity },
    { id: 'roads', label: t('citizen.roads'), icon: categoryIcons.roads },
    { id: 'sanitation', label: t('citizen.sanitation'), icon: categoryIcons.sanitation },
    { id: 'drainage', label: t('citizen.drainage'), icon: categoryIcons.drainage },
    { id: 'streetlight', label: t('citizen.streetlight'), icon: categoryIcons.streetlight },
  ];

  const stepMeta = [
    { label: t('steps.category'), icon: LayoutGrid },
    { label: t('steps.details'), icon: FileText },
    { label: t('steps.location'), icon: MapPin },
    { label: t('steps.review'), icon: CheckCircle },
  ];

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('category', formData.category);
      fd.append('description', formData.description);
      fd.append('citizenPhone', formData.phone);
      fd.append('location[address]', formData.location.address);
      fd.append('location[latitude]', '0');
      fd.append('location[longitude]', '0');
      images.forEach((img) => fd.append('images', img));
      const data = await api('/complaints', { method: 'POST', body: fd });
      setComplaintId(data.complaint.complaintId);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setFormData({ category: '', description: '', phone: '', location: { address: '' } });
        setImages([]);
        setComplaintId('');
      }, 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={styles.pageWrap}>
        <Card style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
          <div style={styles.successOrb}><CheckCircle size={40} color="#065F46" /></div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px' }}>{t('citizen.successTitle')}</h2>
          <p style={{ color: '#57534E', margin: '0 0 6px' }}>{t('citizen.successMessage')}</p>
          <p style={{ color: '#78716C', margin: '0 0 6px', fontSize: 13 }}>{t('citizen.complaintId')}</p>
          <p style={{ fontSize: 34, fontWeight: 800, color: '#2B5A3D', margin: '0 0 28px', letterSpacing: 2 }}>{complaintId}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" icon={FileText} onClick={() => setActivePage('complaints')}>{t('citizen.myComplaints', 'View My Complaints')}</Button>
            <Button variant="outline" size="lg" onClick={() => { setSuccess(false); setStep(1); }}>{t('citizen.submitAnother')}</Button>
          </div>
        </Card>
      </div>
    );
  }

  const ProgressHeader = () => (
    <div style={styles.progressHeader}>
      <div style={styles.stepRow}>
        {stepMeta.map((s, idx) => {
          const num = idx + 1;
          const isActive = step === num;
          const isDone = step > num;
          const Icon = s.icon;
          return (
            <Fragment key={num}>
              {idx > 0 && <div style={{ ...styles.connector, backgroundColor: isDone ? '#2B5A3D' : '#E7E5E4' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  ...styles.stepDot,
                  backgroundColor: isDone ? '#2B5A3D' : isActive ? '#2B5A3D' : 'white',
                  border: `2px solid ${isActive || isDone ? '#2B5A3D' : '#D6D3D1'}`,
                  color: isActive || isDone ? 'white' : '#A8A29E',
                  transform: isActive ? 'scale(1.35)' : 'scale(1.25)',
                  boxShadow: isActive ? '0 0 0 4px rgba(43,90,61,0.15)' : 'none',
                }}>
                  {isDone ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? '#2B5A3D' : isDone ? '#57534E' : '#A8A29E', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );

  const Step1 = (
    <div style={styles.stepBody}>
      <div style={styles.stepHeading}>
        <h2>{t('citizen.issueTitle')}</h2>
        <p>{t('citizen.issueSubtitle')}</p>
      </div>
      <div style={styles.categoryGrid}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = formData.category === cat.id;
          return (
            <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.id })} style={{
              ...styles.catBtn,
              border: `2px solid ${isSelected ? '#2B5A3D' : '#E7E5E4'}`,
              backgroundColor: isSelected ? 'rgba(43,90,61,0.07)' : 'white',
              boxShadow: isSelected ? '0 0 0 3px rgba(43,90,61,0.12)' : 'none',
            }}>
              <div style={{ ...styles.catIconWrap, backgroundColor: isSelected ? 'rgba(43,90,61,0.12)' : '#F5F5F4' }}>
                <Icon size={28} color={categoryColors[cat.id] || (isSelected ? '#2B5A3D' : '#78716C')} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? '#2B5A3D' : '#292524', marginTop: 8 }}>{cat.label}</span>
              {isSelected && <div style={styles.catCheck}><Check size={10} color="white" /></div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const Step2 = (
    <div style={styles.stepBody}>
      <div style={styles.stepHeading}>
        <h2 style={styles.stepTitle}>{t('citizen.detailsTitle')}</h2>
        <p style={styles.stepSubtitle}>{t('citizen.detailsSubtitle')}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={styles.label}>{t('citizen.description')}</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('citizen.descriptionPlaceholder')} required style={styles.textarea}
            onFocus={(e) => { e.target.style.borderColor = '#2B5A3D'; e.target.style.boxShadow = '0 0 0 3px rgba(43,90,61,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E7E5E4'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <Input label={t('citizen.contactNumber')} type="tel" placeholder={t('citizen.contactPlaceholder')}
          value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
          icon={Phone} maxLength="10" required />
      </div>
    </div>
  );

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        setFormData({ ...formData, location: { address: data.display_name, latitude, longitude } });
      } catch (err) { alert('Failed to fetch address'); }
    }, () => alert('Location permission denied'));
  };

  const Step3 = (
    <div style={styles.stepBody}>
      <div style={styles.stepHeading}>
        <h2 style={styles.stepTitle}>{t('citizen.locationTitle')}</h2>
        <p style={styles.stepSubtitle}>{t('citizen.locationSubtitle')}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Button variant="primary" size="sm" onClick={handleGetLocation}>📍 {t('citizen.useCurrentLocation')}</Button>
        <Input label={t('citizen.location')} type="text" placeholder={t('citizen.locationPlaceholder')}
          value={formData.location.address} onChange={(e) => setFormData({ ...formData, location: { address: e.target.value } })}
          icon={MapPin} required />
        <div>
          <label style={styles.label}>{t('citizen.uploadPhotos')}</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} id="image-upload" />
          <label htmlFor="image-upload" style={styles.uploadZone}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D6D3D1'}>
            <Camera size={32} color="#A8A29E" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px', color: '#57534E' }}>{t('citizen.clickUpload')}</p>
            <p style={{ fontSize: 11, color: '#A8A29E', margin: 0 }}>{t('citizen.uptoImages')}</p>
          </label>
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
              {images.map((img, idx) => (
                <div key={idx} style={styles.thumbWrap}>
                  <img src={URL.createObjectURL(img)} alt={`Upload ${idx + 1}`} style={styles.thumb} />
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} style={styles.thumbRemove}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const cat = categories.find((c) => c.id === formData.category);
  const CatIcon = cat?.icon;

  const Step4 = (
    <div style={styles.stepBody}>
      <div style={styles.stepHeading}>
        <h2 style={styles.stepTitle}>{t('citizen.reviewTitle', 'Review your complaint')}</h2>
        <p style={styles.stepSubtitle}>{t('citizen.reviewSubtitle', "Everything look good? Submit when you're ready.")}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { heading: t('common.category', 'Category'), content: (<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{CatIcon && <CatIcon size={16} color={categoryColors[formData.category] || '#2B5A3D'} />}<span style={{ fontWeight: 500 }}>{cat?.label}</span></div>), editStep: 1 },
          { heading: t('citizen.description', 'Description'), content: <span style={{ color: '#57534E', lineHeight: 1.6 }}>{formData.description}</span>, editStep: 2 },
          { heading: t('citizen.contactNumber', 'Contact'), content: <span style={{ color: '#57534E' }}>{formData.phone}</span>, editStep: 2 },
          { heading: t('citizen.location', 'Location'), content: <span style={{ color: '#57534E' }}>{formData.location.address}</span>, editStep: 3 },
          images.length > 0 && { heading: `${t('citizen.uploadPhotos', 'Photos')} (${images.length})`, content: (<div style={{ display: 'flex', gap: 8 }}>{images.map((img, idx) => <img key={idx} src={URL.createObjectURL(img)} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />)}</div>), editStep: 3 },
        ].filter(Boolean).map((row) => (
          <div key={row.heading} style={styles.reviewRow}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={styles.reviewLabel}>{row.heading}</span>
              <button type="button" onClick={() => setStep(row.editStep)} style={styles.editBtn}>{t('common.edit', 'Edit')}</button>
            </div>
            <div style={{ marginTop: 4 }}>{row.content}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const canProceed = () => {
    if (step === 1) return !!formData.category;
    if (step === 2) return formData.description.trim().length > 0 && formData.phone.trim().length > 0;
    if (step === 3) return formData.location.address.trim().length > 0;
    return true;
  };

  const stepComponents = [Step1, Step2, Step3, Step4];

  return (
    <div style={styles.pageWrap}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>{t('citizen.registerComplaint')}</h1>
          <p style={{ color: '#78716C', margin: 0, fontSize: 14 }}>{t('steps.stepCount', { step, total: TOTAL_STEPS, defaultValue: `Step ${step} of ${TOTAL_STEPS}` })} — {stepMeta[step - 1].label}</p>
        </div>
        <ProgressHeader />
        <Card style={{ marginTop: 24, padding: '28px 24px', minHeight: 340 }}>
          {stepComponents[step - 1]}
        </Card>
        <div style={styles.navRow}>
          {step > 1 ? <Button variant="outline" size="md" icon={ChevronLeft} onClick={goBack}>{t('common.back')}</Button> : <div />}
          {step < TOTAL_STEPS ? (
            <Button variant="primary" size="md" disabled={!canProceed()} onClick={goNext} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {t('common.continue')} <ChevronRight size={16} />
            </Button>
          ) : (
            <Button variant="primary" size="md" icon={Send} disabled={submitting || !canProceed()} onClick={handleSubmit}>
              {submitting ? t('citizen.submitting') : t('citizen.submitComplaint')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrap: { padding: '32px 16px' },
  successOrb: { width: 80, height: 80, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
  progressHeader: { display: 'flex', flexDirection: 'column', gap: 10 },
  stepRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  connector: { flex: 1, height: 2, marginTop: 14, borderRadius: 1, transition: 'background-color 0.3s' },
  stepDot: { width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease', cursor: 'default' },
  stepBody: { display: 'flex', flexDirection: 'column', gap: 20 },
  stepHeading: { marginBottom: 4 },
  stepTitle: { fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: '#1C1917' },
  stepSubtitle: { fontSize: 14, color: '#78716C', margin: 0 },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 },
  catBtn: { padding: '16px 12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', outline: 'none' },
  catIconWrap: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.18s' },
  catCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#2B5A3D', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#57534E', marginBottom: 7 },
  textarea: { width: '100%', padding: '12px 14px', border: '2px solid #E7E5E4', borderRadius: 10, fontSize: 15, resize: 'vertical', minHeight: 120, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', color: '#1C1917', lineHeight: 1.6, transition: 'border-color 0.15s, box-shadow 0.15s' },
  uploadZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 20px', border: '2px dashed #D6D3D1', borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.2s' },
  thumbWrap: { position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #E7E5E4' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbRemove: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' },
  reviewRow: { padding: '14px 16px', backgroundColor: '#FAFAF9', borderRadius: 10, border: '1px solid #E7E5E4' },
  reviewLabel: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A8A29E' },
  editBtn: { fontSize: 12, color: '#2B5A3D', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'inherit' },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
};

export default CitizenHome;

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import api from '../utils/api';

const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('citizen');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await api('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp, role }),
      });
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: "url('https://terralingua.org/wp-content/uploads/2020/08/Langscape-Magazine_Borde_01.jpg')",
      display: 'flex',
      backgroundSize: 'cover',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <Card style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', backgroundColor: '#2B5A3D',
            borderRadius: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <FileText size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1C1917', margin: '0 0 1px 0' }}>
            {t('app.name')}
          </h1>
          <p style={{ color: '#57534E', margin: 0 }}>{t('app.tagline')}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Input
              label={t('login.mobileLabel')}
              type="tel"
              placeholder={t('login.mobilePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={Phone}
              maxLength="10"
              error={error}
            />
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#57534E', marginBottom: '12px' }}>
                {t('login.selectRole')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {['citizen', 'technician', 'admin'].map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)} style={{
                    padding: '12px', borderRadius: '10px',
                    border: `2px solid ${role === r ? '#2B5A3D' : '#E7E5E4'}`,
                    backgroundColor: role === r ? 'rgba(43, 90, 61, 0.1)' : 'white',
                    color: role === r ? '#2B5A3D' : '#1C1917',
                    fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                  }}>
                    {t(`login.${r}`)}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? t('login.sending') : t('login.sendOtp')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '16px' }}>
                {t('login.otpSent', { phone })}
              </p>
              <Input
                label={t('login.enterOtp')}
                type="text"
                placeholder={t('login.otpPlaceholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                error={error}
              />
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#78716C' }}>
                {t('login.testOtp')} <strong>123456</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button type="button" variant="outline" size="lg"
                onClick={() => { setStep(1); setOtp(''); setError(''); }} style={{ flex: 1 }}>
                {t('login.back')}
              </Button>
              <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ flex: 1 }}>
                {loading ? t('login.verifying') : t('login.verifyOtp')}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;

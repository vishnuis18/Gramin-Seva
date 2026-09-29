import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, FileText, Users, BarChart3, Languages, X, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const Navbar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLangMenuOpen(false);
  };

  const navigation = {
    citizen: [
      { id: 'home', label: t('nav.home'), icon: Home },
      { id: 'complaints', label: t('nav.myComplaints'), icon: FileText },
    ],
    technician: [
      { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
      { id: 'assigned', label: t('nav.assigned'), icon: FileText },
    ],
    admin: [
      { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
      { id: 'complaints', label: t('nav.complaints'), icon: FileText },
      { id: 'technicians', label: t('nav.technicians'), icon: Users },
      { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
    ],
  };

  const navItems = navigation[user?.role] || navigation.citizen;

  return (
    <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #E7E5E4', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#2B5A3D', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} color="white" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('app.name')}</span>
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setActivePage(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                  borderRadius: '10px', fontWeight: '500',
                  backgroundColor: activePage === item.id ? '#2B5A3D' : 'transparent',
                  color: activePage === item.id ? 'white' : '#57534E',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                }}>
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isMobile && (
              <>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setLangMenuOpen(!langMenuOpen)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                    backgroundColor: 'transparent', border: '2px solid #E7E5E4', borderRadius: '10px',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', color: '#57534E', transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E7E5E4'}
                  >
                    <Languages size={18} />
                    {languages.find(l => l.code === i18n.language)?.name || 'English'}
                  </button>
                  {langMenuOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px' }}>
                      {languages.map((lang, idx) => (
                        <button key={lang.code} onClick={() => changeLanguage(lang.code)} style={{
                          width: '100%', padding: '10px 16px', textAlign: 'left',
                          backgroundColor: i18n.language === lang.code ? 'rgba(43, 90, 61, 0.1)' : 'transparent',
                          color: i18n.language === lang.code ? '#2B5A3D' : '#57534E',
                          border: 'none', cursor: 'pointer', fontSize: '14px',
                          fontWeight: i18n.language === lang.code ? '600' : '400', fontFamily: 'inherit',
                          borderRadius: idx === 0 ? '10px 10px 0 0' : idx === languages.length - 1 ? '0 0 10px 10px' : '0',
                        }}
                          onMouseEnter={(e) => { if (i18n.language !== lang.code) e.currentTarget.style.backgroundColor = '#F5F5F4'; }}
                          onMouseLeave={(e) => { if (i18n.language !== lang.code) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{user?.name}</p>
                  <p style={{ fontSize: '12px', color: '#78716C', textTransform: 'capitalize', margin: 0 }}>{user?.role}</p>
                </div>
                <Button variant="ghost" icon={LogOut} onClick={logout}>{t('nav.logout')}</Button>
              </>
            )}
            {isMobile && (
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'flex', padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '10px' }}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {isMobile && mobileMenuOpen && (
          <div style={{ paddingTop: '16px', paddingBottom: '16px', borderTop: '1px solid #E7E5E4' }}>
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                fontWeight: '500', backgroundColor: activePage === item.id ? 'rgba(43, 90, 61, 0.1)' : 'transparent',
                color: activePage === item.id ? '#2B5A3D' : '#57534E', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
              }}>
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #E7E5E4', marginTop: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#78716C', marginBottom: '8px', textTransform: 'uppercase' }}>Language / भाषा</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => { changeLanguage(lang.code); setMobileMenuOpen(false); }} style={{
                    padding: '8px 12px',
                    backgroundColor: i18n.language === lang.code ? '#2B5A3D' : 'transparent',
                    color: i18n.language === lang.code ? 'white' : '#57534E',
                    border: `2px solid ${i18n.language === lang.code ? '#2B5A3D' : '#E7E5E4'}`,
                    borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={logout} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              color: '#DC2626', fontWeight: '500', backgroundColor: 'transparent', border: 'none',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', marginTop: '8px', borderTop: '1px solid #E7E5E4',
            }}>
              <LogOut size={20} />
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

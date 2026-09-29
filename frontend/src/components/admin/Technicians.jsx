import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';
import api from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const Technicians = () => {
  const { t } = useTranslation();
  const [technicians, setTechnicians] = useState([]);
  const [loadingTech, setLoadingTech] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTech, setNewTech] = useState({ name: '', phone: '', specialization: [] });
  const [adding, setAdding] = useState(false);

  const fetchTechnicians = useCallback(async () => {
    try {
      const data = await api('/technicians');
      setTechnicians(data.technicians || []);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    } finally {
      setLoadingTech(false);
    }
  }, []);

  useEffect(() => { fetchTechnicians(); }, [fetchTechnicians]);

  const handleAddTechnician = async () => {
    if (!newTech.name || !newTech.phone || newTech.specialization.length === 0) {
      alert('Please fill all fields');
      return;
    }
    setAdding(true);
    try {
      await api('/technicians', { method: 'POST', body: JSON.stringify(newTech) });
      setNewTech({ name: '', phone: '', specialization: [] });
      setShowAddForm(false);
      fetchTechnicians();
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const toggleSpec = (spec) => {
    setNewTech(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec],
    }));
  };

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Technicians</h1>
          <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Technician'}
          </Button>
        </div>

        {showAddForm && (
          <Card style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>Add New Technician</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Name" placeholder="Technician name" value={newTech.name} onChange={(e) => setNewTech({ ...newTech, name: e.target.value })} />
              <Input label="Phone" type="tel" placeholder="10-digit mobile number" value={newTech.phone} onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })} maxLength="10" icon={Phone} />
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#57534E', marginBottom: '8px' }}>Specialization</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['water', 'electricity', 'roads', 'sanitation', 'drainage', 'streetlight'].map(spec => (
                    <button key={spec} type="button" onClick={() => toggleSpec(spec)} style={{
                      padding: '6px 14px', borderRadius: '8px',
                      border: `2px solid ${newTech.specialization.includes(spec) ? '#2B5A3D' : '#E7E5E4'}`,
                      backgroundColor: newTech.specialization.includes(spec) ? 'rgba(43,90,61,0.1)' : 'white',
                      color: newTech.specialization.includes(spec) ? '#2B5A3D' : '#1C1917',
                      fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit',
                    }}>
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="primary" onClick={handleAddTechnician} disabled={adding}>
                {adding ? 'Adding...' : 'Add Technician'}
              </Button>
            </div>
          </Card>
        )}

        {loadingTech ? (
          <p style={{ color: '#78716C' }}>Loading technicians...</p>
        ) : technicians.length === 0 ? (
          <p style={{ color: '#78716C' }}>No technicians found. Add one above.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {technicians.map((tech) => (
              <Card key={tech._id}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>{tech.name}</h3>
                  <p style={{ fontSize: '14px', color: '#78716C', margin: 0 }}>{tech.phone}</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#57534E', margin: '0 0 8px 0' }}>Specialization:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tech.specialization?.map((spec) => (
                      <span key={spec} style={{ padding: '4px 12px', backgroundColor: '#F5F5F4', borderRadius: '6px', fontSize: '12px', textTransform: 'capitalize' }}>{spec}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#78716C', margin: '0 0 4px 0' }}>Active</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{tech.activeComplaints || 0}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#78716C', margin: '0 0 4px 0' }}>Resolved</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{tech.resolvedCount || 0}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Technicians;

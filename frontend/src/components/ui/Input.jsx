const Input = ({ label, error, icon: Icon, style = {}, ...props }) => {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#57534E',
          marginBottom: '8px',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#78716C',
            pointerEvents: 'none',
          }}>
            <Icon size={20} />
          </div>
        )}
        <input
          style={{
            width: '100%',
            padding: '12px 16px',
            paddingLeft: Icon ? '44px' : '16px',
            backgroundColor: 'white',
            border: `2px solid ${error ? '#DC2626' : '#E7E5E4'}`,
            borderRadius: '10px',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2B5A3D';
            e.target.style.boxShadow = '0 0 0 3px rgba(43, 90, 61, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#DC2626' : '#E7E5E4';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {error && <p style={{ marginTop: '4px', fontSize: '14px', color: '#DC2626' }}>{error}</p>}
    </div>
  );
};

export default Input;

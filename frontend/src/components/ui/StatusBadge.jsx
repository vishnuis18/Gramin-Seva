const StatusBadge = ({ status, label }) => {
  const statusConfig = {
    submitted: { bg: '#FEF3C7', text: '#92400E' },
    assigned: { bg: '#DBEAFE', text: '#1E3A8A' },
    'in-progress': { bg: '#FED7AA', text: '#9A3412' },
    pending_verification: { bg: '#EDE9FE', text: '#5B21B6' },
    closed: { bg: '#D1FAE5', text: '#065F46' },
    reopened: { bg: '#FEE2E2', text: '#991B1B' },
  };

  const config = statusConfig[status] || { bg: '#E5E7EB', text: '#374151' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '7px 20px',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {label || status}
    </span>
  );
};

export default StatusBadge;

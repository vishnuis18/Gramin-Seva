const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  disabled,
  type = 'button',
  style = {},
  ...props
}) => {
  const variants = {
    primary: { backgroundColor: '#2B5A3D', color: 'white', border: 'none' },
    secondary: { backgroundColor: '#D97F3B', color: 'white', border: 'none' },
    outline: { backgroundColor: 'white', color: '#1C1917', border: '2px solid #E7E5E4' },
    ghost: { backgroundColor: 'transparent', color: '#1C1917', border: 'none' },
    danger: { backgroundColor: '#DC2626', color: 'white', border: 'none' },
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '14px' },
    md: { padding: '10px 16px', fontSize: '16px' },
    lg: { padding: '14px 24px', fontSize: '18px' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '10px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};

export default Button;

import { useState } from 'react';

const Card = ({ children, hover = false, style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #E7E5E4',
        padding: '24px',
        transition: 'box-shadow 0.2s',
        boxShadow: isHovered && hover ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Card;

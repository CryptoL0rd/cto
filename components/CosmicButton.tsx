import React from 'react';

interface CosmicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'cosmic' | 'galaxy';
  className?: string;
}

export default function CosmicButton({
  children,
  onClick,
  variant = 'cosmic',
  className = '',
}: CosmicButtonProps) {
  const variantClass = variant === 'cosmic' ? 'btn-cosmic' : 'btn-galaxy';

  return (
    <button onClick={onClick} className={`${variantClass} ${className}`}>
      {children}
    </button>
  );
}

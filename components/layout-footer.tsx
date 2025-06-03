import React from 'react';

interface LayoutFooterProps {
  children: React.ReactNode;
  variant?: 'default' | 'themed';
  theme?: {
    background?: string;
  };
  size?: 'default' | 'large';
}

export function LayoutFooter({ children, variant = 'default', theme, size = 'default' }: LayoutFooterProps) {
  const paddingClass = size === 'large' ? 'py-6' : 'py-4';
  
  const footerClasses = variant === 'themed' && theme?.background
    ? `flex-shrink-0 ${paddingClass}`
    : `flex-shrink-0 ${paddingClass}`;

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto flex items-center justify-center max-w-7xl px-4">
        {children}
      </div>
    </footer>
  );
} 
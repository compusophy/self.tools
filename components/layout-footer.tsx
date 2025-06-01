import React from 'react';

interface LayoutFooterProps {
  children: React.ReactNode;
  variant?: 'default' | 'themed';
  theme?: {
    background?: string;
  };
  size?: 'default' | 'large';
  borderColor?: string;
}

export function LayoutFooter({ children, variant = 'default', theme, size = 'default', borderColor }: LayoutFooterProps) {
  const paddingClass = size === 'large' ? 'py-6' : 'py-4';
  
  const getBorderClass = () => {
    if (borderColor) return borderColor;
    return variant === 'themed' ? 'border-white/20' : 'border-border';
  };
  
  const footerClasses = variant === 'themed' && theme?.background
    ? `flex-shrink-0 ${paddingClass} border-t ${getBorderClass()}`
    : `flex-shrink-0 ${paddingClass} border-t ${getBorderClass()}`;

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto flex items-center justify-center max-w-7xl px-4">
        {children}
      </div>
    </footer>
  );
} 
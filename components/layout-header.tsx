import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, Edit3, ArrowLeft } from 'lucide-react';
import { protocol, rootDomain } from '@/lib/utils';
import GitHub from '@/components/icons/github';

interface LayoutHeaderProps {
  showHomeLink?: boolean;
  showSourceButton?: boolean;
  showAdminButton?: boolean;
  showEditButton?: boolean;
  editButton?: React.ReactNode;
  theme?: {
    textSecondary: string;
    textPrimary: string;
    background?: string;
  };
  variant?: 'default' | 'themed';
  size?: 'default' | 'large';
  homeButtonStyle?: 'link' | 'button';
}

export function LayoutHeader({ 
  showHomeLink = false, 
  showSourceButton = false,
  showAdminButton = false, 
  showEditButton = false,
  editButton,
  theme,
  variant = 'default',
  size = 'default',
  homeButtonStyle = 'link'
}: LayoutHeaderProps) {
  const paddingClass = size === 'large' ? 'py-6' : 'py-4';
  
  const headerClasses = variant === 'themed' && theme?.background
    ? `flex-shrink-0 ${paddingClass} px-4 border-b border-white/20`
    : `flex-shrink-0 ${paddingClass} px-4 border-b border-border`;

  const linkClasses = variant === 'themed' 
    ? `text-sm ${theme?.textSecondary || 'text-white/70'} hover:${theme?.textPrimary || 'text-white'} transition-colors`
    : `text-sm text-muted-foreground hover:text-foreground transition-colors`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        {/* Left side - Home link and Source button */}
        <div className="flex items-center gap-4">
          {showHomeLink && (
            homeButtonStyle === 'button' ? (
              <Button
                asChild
                variant={variant === 'themed' ? 'secondary' : 'outline'}
                size="sm"
                className="shadow-lg"
              >
                <Link href={`${protocol}://${rootDomain}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {rootDomain}
                </Link>
              </Button>
            ) : (
              <Link
                href={`${protocol}://${rootDomain}`}
                className={linkClasses}
              >
                ← {rootDomain}
              </Link>
            )
          )}
          
          {showSourceButton && (
            <Button
              asChild
              variant={variant === 'themed' ? 'secondary' : 'outline'}
              size="sm"
              className="shadow-lg"
            >
              <Link href="https://github.com/compusophy/self.tools" target="_blank" rel="noopener noreferrer">
                <GitHub />
                <span className="ml-2">Source</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          {showAdminButton && (
            <Button
              asChild
              variant={variant === 'themed' ? 'secondary' : 'outline'}
              size="sm"
              className="shadow-lg"
            >
              <Link href="/admin">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          )}
          
          {showEditButton && editButton}
        </div>
      </div>
    </header>
  );
} 
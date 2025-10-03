import { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ContentWrapperProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function ContentWrapper({ children, className, as: Component = 'div' }: ContentWrapperProps) {
  const { currentTheme } = useTheme();
  const { sectionSpacing, cardStyle } = currentTheme.layout;

  const spacingClasses = {
    compact: 'space-y-4',
    normal: 'space-y-6',
    spacious: 'space-y-8 md:space-y-12',
  };

  const cardStyleClasses = {
    bordered: 'border-2',
    elevated: 'shadow-lg',
    flat: 'shadow-none',
  };

  return (
    <Component
      className={cn(
        spacingClasses[sectionSpacing],
        className
      )}
      data-card-style={cardStyle}
    >
      {children}
    </Component>
  );
}

export function ThemeCard({ children, className }: { children: ReactNode; className?: string }) {
  const { currentTheme } = useTheme();
  const { cardStyle } = currentTheme.layout;

  const cardStyleClasses = {
    bordered: 'border-2 shadow-sm',
    elevated: 'shadow-xl border-0',
    flat: 'shadow-none border-0 bg-transparent',
  };

  return (
    <div className={cn(
      'rounded-lg p-6',
      cardStyleClasses[cardStyle],
      className
    )}>
      {children}
    </div>
  );
}

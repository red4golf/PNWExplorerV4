import { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  const { currentTheme } = useTheme();
  const { contentLayout, containerMaxWidth } = currentTheme.layout;

  const layoutClasses = {
    sidebar: 'grid lg:grid-cols-[300px_1fr] gap-6',
    centered: 'flex flex-col items-center',
    fullwidth: 'w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto px-4',
        layoutClasses[contentLayout],
        className
      )}
      style={{
        maxWidth: contentLayout === 'fullwidth' ? '100%' : containerMaxWidth,
      }}
    >
      {children}
    </div>
  );
}

export function PageLayoutSidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="hidden lg:block">
      {children}
    </aside>
  );
}

export function PageLayoutMain({ children }: { children: ReactNode }) {
  const { currentTheme } = useTheme();
  const { contentLayout } = currentTheme.layout;

  return (
    <main className={cn(
      contentLayout === 'centered' && 'w-full max-w-full'
    )}>
      {children}
    </main>
  );
}

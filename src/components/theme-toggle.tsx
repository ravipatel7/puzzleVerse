// src/components/theme-toggle.tsx
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme'; // Import the custom theme hook

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  // Ensure the component is mounted before rendering the switch
  // to avoid hydration mismatch issues.
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Avoid rendering the switch until the component is mounted
  if (!isMounted) {
    // You can render a placeholder or null during server-side rendering & hydration
     return <div className="h-6 w-[70px]"></div>; // Placeholder with similar size
  }

  return (
    <div className="flex items-center space-x-2">
      <Sun className={`h-5 w-5 transition-colors ${theme === 'light' ? 'text-accent' : 'text-muted-foreground'}`} />
      <Switch
        id="theme-toggle"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      />
      <Moon className={`h-5 w-5 transition-colors ${theme === 'dark' ? 'text-accent' : 'text-muted-foreground'}`} />
       {/* Hidden label for accessibility */}
       <Label htmlFor="theme-toggle" className="sr-only">
         Toggle theme
       </Label>
    </div>
  );
};

export default ThemeToggle;

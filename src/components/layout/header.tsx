import React from 'react';
import { Puzzle } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle'; // Import the new ThemeToggle component

const Header: React.FC = () => {
  return (
    // Apply glassmorphism: backdrop blur, semi-transparent background, remove border, keep shadow
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-primary/70 dark:bg-primary/60 text-primary-foreground shadow-md"> {/* Removed border-b border-border */}
      <div className="container mx-auto px-4 flex items-center justify-between h-16"> {/* Standard height */}
        <div className="flex items-center">
           <Puzzle className="h-8 w-8 mr-2" />
           <h1 className="text-2xl font-bold">PuzzleVerse</h1>
        </div>
        <ThemeToggle /> {/* Add the theme toggle button */}
      </div>
    </header>
  );
};

export default Header;

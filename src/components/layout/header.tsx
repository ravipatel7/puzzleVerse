import React from 'react';
import { Puzzle } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle'; // Import the new ThemeToggle component

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
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

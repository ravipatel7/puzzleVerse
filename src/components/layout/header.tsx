import React from 'react';
import { Puzzle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center">
         <Puzzle className="h-8 w-8 mr-2" />
        <h1 className="text-2xl font-bold">PuzzleVerse</h1>
      </div>
    </header>
  );
};

export default Header;

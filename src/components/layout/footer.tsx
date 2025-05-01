import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-auto backdrop-blur bg-secondary/80 dark:bg-secondary/70 text-secondary-foreground py-4 border-t border-white/10 dark:border-white/5">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; {currentYear} PuzzleVerse. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

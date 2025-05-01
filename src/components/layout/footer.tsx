import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    // Apply glassmorphism: backdrop blur, semi-transparent background, remove border
    <footer className="mt-auto backdrop-blur-md bg-secondary/70 dark:bg-secondary/60 text-secondary-foreground py-4 shadow-inner"> {/* Removed border-t border-border, added shadow-inner */}
      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; {currentYear} PuzzleVerse. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-secondary text-secondary-foreground py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; {currentYear} PuzzleVerse. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

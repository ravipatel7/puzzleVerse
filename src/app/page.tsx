import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PuzzleGame from '@/components/puzzle-game';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Updated main for better centering and padding */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {/* The PuzzleGame component will now handle its own sizing and layout */}
        <PuzzleGame />
      </main>
      <Footer />
    </div>
  );
}
    
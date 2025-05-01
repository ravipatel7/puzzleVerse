import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PuzzleGame from '@/components/puzzle-game';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <PuzzleGame />
      </main>
      <Footer />
    </div>
  );
}

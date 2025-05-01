'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, RotateCcw, Star } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size'; // Assuming a hook for window size

type Tile = number | null;
type Grid = Tile[][];

// --- Puzzle Logic ---

const createSolvedGrid = (size: number): Grid => {
  const grid: Grid = [];
  let count = 1;
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = count++;
    }
  }
  grid[size - 1][size - 1] = null; // Empty tile
  return grid;
};

const shuffleGrid = (grid: Grid, moves: number): Grid => {
  let newGrid = grid.map(row => [...row]); // Deep copy
  const size = newGrid.length;
  let emptyRow = size - 1;
  let emptyCol = size - 1;

  const possibleMoves = [
    [-1, 0], // Up
    [1, 0], // Down
    [0, -1], // Left
    [0, 1], // Right
  ];

  for (let i = 0; i < moves; i++) {
    const validMoves = possibleMoves.filter(([dr, dc]) => {
      const nr = emptyRow + dr;
      const nc = emptyCol + dc;
      return nr >= 0 && nr < size && nc >= 0 && nc < size;
    });

    const [moveDr, moveDc] = validMoves[Math.floor(Math.random() * validMoves.length)];
    const targetRow = emptyRow + moveDr;
    const targetCol = emptyCol + moveDc;

    // Swap empty tile with target tile
    [newGrid[emptyRow][emptyCol], newGrid[targetRow][targetCol]] = [newGrid[targetRow][targetCol], newGrid[emptyRow][emptyCol]];

    emptyRow = targetRow;
    emptyCol = targetCol;
  }

   // Ensure it's solvable (not implemented fully here, just basic shuffling)
   // A more robust shuffle would check solvability.
   // For simplicity, we assume the shuffle creates a solvable state.
   // If the empty tile ends up back at the start, shuffle again slightly
   if (emptyRow === size - 1 && emptyCol === size - 1) {
     return shuffleGrid(grid, moves + 1); // Recursive call for slightly more shuffling
   }


  return newGrid;
};

const isSolved = (grid: Grid): boolean => {
  const size = grid.length;
  let count = 1;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === size - 1 && j === size - 1) {
        if (grid[i][j] !== null) return false;
      } else {
        if (grid[i][j] !== count++) return false;
      }
    }
  }
  return true;
};

const findEmptyTile = (grid: Grid): [number, number] => {
  const size = grid.length;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === null) {
        return [i, j];
      }
    }
  }
  return [-1, -1]; // Should not happen in a valid grid
};

// --- Component ---

const PuzzleGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3); // Start with 3x3
  const [grid, setGrid] = useState<Grid>(() => shuffleGrid(createSolvedGrid(3), 20)); // Initial shuffle
  const [moves, setMoves] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { width, height } = useWindowSize(); // For confetti

  const resetPuzzle = useCallback((size: number, shuffleMoves: number) => {
    setGrid(shuffleGrid(createSolvedGrid(size), shuffleMoves));
    setMoves(0);
    setIsWin(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  useEffect(() => {
    // Initialize puzzle on mount
    resetPuzzle(gridSize, 20 + (level - 1) * 10); // Increase shuffle moves with level
  }, [level, gridSize, resetPuzzle]); // Depend on level and gridSize

   // Timer effect
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (startTime && !isWin) {
      timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (timerInterval) {
      clearInterval(timerInterval);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [startTime, isWin]);


  const handleTileClick = (rowIndex: number, colIndex: number) => {
    if (isWin || grid[rowIndex][colIndex] === null) return; // Ignore clicks on empty or if won

    const [emptyRow, emptyCol] = findEmptyTile(grid);

    // Check if the clicked tile is adjacent to the empty tile
    const isAdjacent =
      (Math.abs(rowIndex - emptyRow) === 1 && colIndex === emptyCol) ||
      (Math.abs(colIndex - emptyCol) === 1 && rowIndex === emptyRow);

    if (isAdjacent) {
      const newGrid = grid.map(row => [...row]);
      // Swap tiles
      [newGrid[rowIndex][colIndex], newGrid[emptyRow][emptyCol]] = [
        newGrid[emptyRow][emptyCol],
        newGrid[rowIndex][colIndex],
      ];

      setGrid(newGrid);
      setMoves(m => m + 1);

      // Check for win condition
      if (isSolved(newGrid)) {
        setIsWin(true);
        if (startTime) {
           setElapsedTime(Math.floor((Date.now() - startTime) / 1000)); // Final time
        }
      }
    }
  };

  const nextLevel = () => {
    const nextLevelNum = level + 1;
    let nextGridSize = gridSize;
    // Increase grid size every 3 levels (adjust as needed)
    if (nextLevelNum % 3 === 1 && nextLevelNum > 1) {
       nextGridSize = Math.min(gridSize + 1, 6); // Cap grid size at 6x6 for now
    }
    setLevel(nextLevelNum);
    setGridSize(nextGridSize);
    // resetPuzzle is called by useEffect due to level/gridSize change
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
       <AnimatePresence>
        {isWin && width && height && (
           <Confetti
             width={width}
             height={height}
             recycle={false}
             numberOfPieces={300}
           />
        )}
      </AnimatePresence>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
           <Star className="text-accent"/> Level {level}
        </CardTitle>
         <div className="text-sm text-muted-foreground flex justify-center gap-4 mt-2">
            <span>Moves: {moves}</span>
            <span>Time: {formatTime(elapsedTime)}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {isWin && (
          <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0 }}
             className="w-full"
          >
            <Alert variant="default" className="bg-accent/10 border-accent text-accent-foreground">
              <CheckCircle className="h-5 w-5 text-accent" />
              <AlertTitle className="font-bold">Congratulations!</AlertTitle>
              <AlertDescription>
                You solved the puzzle in {moves} moves and {formatTime(elapsedTime)}!
              </AlertDescription>
              <Button onClick={nextLevel} className="mt-4 w-full bg-accent hover:bg-accent/90">
                Next Level
              </Button>
            </Alert>
          </motion.div>
        )}

        <div
          className="grid gap-1 bg-secondary p-2 rounded-md shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            aspectRatio: '1 / 1', // Maintain square aspect ratio
             maxWidth: '300px', // Limit max width
            width: '90%', // Responsive width
          }}
        >
          <AnimatePresence>
             {grid.flat().map((tile, index) => {
               const rowIndex = Math.floor(index / gridSize);
               const colIndex = index % gridSize;
                const isEmpty = tile === null;

               return (
                 <motion.div
                   key={isEmpty ? 'empty' : tile} // Use tile value as key for animation, 'empty' for the null tile
                   layout // Enable automatic layout animation
                   initial={false} // Don't run initial animation on load
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.8, opacity: 0 }}
                   transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                   className={`flex items-center justify-center rounded font-bold text-lg select-none aspect-square
                     ${
                       isEmpty
                         ? 'bg-secondary cursor-default' // Style for the empty space
                         : 'bg-card text-card-foreground shadow cursor-pointer hover:bg-primary/10 transition-colors duration-150'
                     }`}
                   onClick={() => handleTileClick(rowIndex, colIndex)}
                   aria-label={isEmpty ? "Empty tile" : `Tile ${tile}`}
                   role="button"
                 >
                    {!isEmpty ? tile : ''}
                 </motion.div>
               );
             })}
          </AnimatePresence>
        </div>

         <Button
             variant="outline"
             onClick={() => resetPuzzle(gridSize, 20 + (level - 1) * 10)}
             disabled={isWin}
             className="flex items-center gap-2"
           >
             <RotateCcw className="h-4 w-4" />
             Reset Puzzle
           </Button>
      </CardContent>
    </Card>
  );
};

export default PuzzleGame;

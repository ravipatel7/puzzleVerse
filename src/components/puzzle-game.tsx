'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, RotateCcw, Star, Info } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

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

    if (validMoves.length === 0) continue; // Should not happen in a > 1x1 grid

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
   // If the empty tile ends up back at the start after minimal shuffles, shuffle again slightly
   if (emptyRow === size - 1 && emptyCol === size - 1 && moves < size * size) {
     return shuffleGrid(grid, moves + 5); // Recursive call for more shuffling
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
  console.error("Empty tile not found in grid:", grid); // Log error if empty tile is missing
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
    // Initialize puzzle on mount or when level/gridSize changes
    const initialShuffleMoves = 20 + (level - 1) * 10 + (gridSize - 3) * 15; // Increase shuffle moves with level and grid size
    resetPuzzle(gridSize, initialShuffleMoves);
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
    if (emptyRow === -1) return; // Exit if empty tile wasn't found (error state)


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
    if (nextLevelNum > 1 && nextLevelNum % 3 === 1) {
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
    // Apply glassmorphism styles to the card, remove border, enhance shadow
    <Card className="w-full max-w-md shadow-xl bg-card/80 dark:bg-card/70 backdrop-blur-lg text-card-foreground overflow-hidden"> {/* Enhanced backdrop blur, removed border */}
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
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
           <Star className="text-accent"/> Level {level} <span className="text-lg font-normal text-muted-foreground">({gridSize}x{gridSize})</span>
        </CardTitle>
         <div className="text-sm text-muted-foreground flex justify-center gap-4 mt-1">
            <span>Moves: {moves}</span>
            <span>Time: {formatTime(elapsedTime)}</span>
        </div>
         <CardDescription className="text-sm text-muted-foreground mt-3 px-2 flex items-start gap-2">
             <Info className="h-4 w-4 mt-0.5 shrink-0 text-accent"/>
             <span>Click a tile next to the empty space to slide it. Arrange the tiles in numerical order from top-left to bottom-right to win!</span>
         </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-4">
        {isWin && (
          <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0 }}
             className="w-full"
          >
            {/* Adjusted Alert styling, remove border */}
            <Alert variant="default" className="bg-accent/90 text-accent-foreground backdrop-blur-sm shadow-md">
              <CheckCircle className="h-5 w-5 text-accent-foreground" /> {/* Ensure icon matches text color */}
              <AlertTitle className="font-bold">Congratulations!</AlertTitle>
              <AlertDescription>
                You solved Level {level} in {moves} moves and {formatTime(elapsedTime)}!
              </AlertDescription>
              <Button onClick={nextLevel} className="mt-4 w-full bg-accent-foreground text-accent hover:bg-accent-foreground/90 shadow">
                 Next Level {level + 1}
              </Button>
            </Alert>
          </motion.div>
        )}

        {/* Grid background adjusted for glassmorphism, remove border */}
        <div
          className="grid gap-1 bg-secondary/70 dark:bg-secondary/60 p-2 rounded-md shadow-inner backdrop-blur-md" // Removed border, increased blur
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
                   className={`flex items-center justify-center rounded font-bold text-lg select-none aspect-square transition-colors duration-150
                     ${
                       isEmpty
                         ? 'bg-transparent cursor-default' // Empty space becomes transparent
                         : 'bg-card/90 dark:bg-card/80 text-card-foreground shadow-md cursor-pointer hover:bg-primary/20 active:bg-primary/30' // Removed border, added shadow-md
                     }`}
                   onClick={() => handleTileClick(rowIndex, colIndex)}
                   aria-label={isEmpty ? "Empty tile" : `Tile ${tile}`}
                   role="button"
                   tabIndex={isEmpty ? -1 : 0} // Make tiles focusable, but not the empty one
                 >
                    {!isEmpty ? tile : ''}
                 </motion.div>
               );
             })}
          </AnimatePresence>
        </div>

         <Button
             variant="outline"
             onClick={() => resetPuzzle(gridSize, 20 + (level - 1) * 10 + (gridSize - 3) * 15)}
             disabled={isWin}
             // Apply subtle glass effect to buttons too, remove border, add shadow
             className="flex items-center gap-2 bg-background/70 dark:bg-background/60 backdrop-blur-sm hover:bg-accent/80 hover:text-accent-foreground shadow" // Removed border, added shadow
           >
             <RotateCcw className="h-4 w-4" />
             Reset Puzzle
           </Button>
      </CardContent>
    </Card>
  );
};

export default PuzzleGame;

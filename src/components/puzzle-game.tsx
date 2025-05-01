// src/components/puzzle-game.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, RotateCcw, Star, Info, Play, Settings, Timer } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Tile = number | null;
type Grid = Tile[][];
type GameState = 'configuring' | 'playing' | 'won';

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
  if (size <= 0) return []; // Handle empty grid case

  // Find initial empty tile position
  let emptyRow = -1, emptyCol = -1;
  for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
          if (newGrid[r][c] === null) {
              emptyRow = r;
              emptyCol = c;
              break;
          }
      }
      if (emptyRow !== -1) break;
  }

  if (emptyRow === -1) {
      console.error("Initial empty tile not found during shuffle setup");
      // Fallback: set last tile as empty if missing (though this shouldn't happen with createSolvedGrid)
      emptyRow = size - 1;
      emptyCol = size - 1;
      newGrid[emptyRow][emptyCol] = null;
  }


  const possibleMoves = [
    [-1, 0], // Up
    [1, 0], // Down
    [0, -1], // Left
    [0, 1], // Right
  ];

  let lastMove: [number, number] | null = null; // Prevent immediate reversal

  for (let i = 0; i < moves; i++) {
    const validMoves = possibleMoves.filter(([dr, dc]) => {
      const nr = emptyRow + dr;
      const nc = emptyCol + dc;
      // Check bounds and prevent reversing the last move
      return nr >= 0 && nr < size && nc >= 0 && nc < size &&
             !(lastMove && dr === -lastMove[0] && dc === -lastMove[1]);
    });


    if (validMoves.length === 0) {
      // If no valid moves (e.g., only the reverse move is possible), allow the reverse move
      const fallbackMoves = possibleMoves.filter(([dr, dc]) => {
        const nr = emptyRow + dr;
        const nc = emptyCol + dc;
        return nr >= 0 && nr < size && nc >= 0 && nc < size;
      });
       if (fallbackMoves.length === 0) continue; // Should not happen in a > 1x1 grid
       const [moveDr, moveDc] = fallbackMoves[Math.floor(Math.random() * fallbackMoves.length)];
       const targetRow = emptyRow + moveDr;
       const targetCol = emptyCol + moveDc;
       [newGrid[emptyRow][emptyCol], newGrid[targetRow][targetCol]] = [newGrid[targetRow][targetCol], newGrid[emptyRow][emptyCol]];
       emptyRow = targetRow;
       emptyCol = targetCol;
       lastMove = [moveDr, moveDc];
       continue; // Continue to next shuffle step
    }


    const [moveDr, moveDc] = validMoves[Math.floor(Math.random() * validMoves.length)];
    const targetRow = emptyRow + moveDr;
    const targetCol = emptyCol + moveDc;

    // Swap empty tile with target tile
    [newGrid[emptyRow][emptyCol], newGrid[targetRow][targetCol]] = [newGrid[targetRow][targetCol], newGrid[emptyRow][emptyCol]];

    emptyRow = targetRow;
    emptyCol = targetCol;
    lastMove = [moveDr, moveDc]; // Record the last move
  }

   // Ensure it's solvable (basic check: odd width -> inversions must be even, even width -> inversions + empty row must be odd/even based on position)
   // For simplicity, we rely on sufficient shuffling from solved state.
   // If the empty tile ends up back at the start after minimal shuffles, shuffle again slightly
   if (emptyRow === size - 1 && emptyCol === size - 1 && moves < size * size) {
     console.log("Empty tile ended at goal after shuffle, reshuffling...");
     return shuffleGrid(createSolvedGrid(size), moves + 10); // Use original solved grid for reshuffle
   }


  return newGrid;
};

const isSolved = (grid: Grid): boolean => {
    const size = grid.length;
    if (size === 0 || !grid[0]) return false; // Handle empty or malformed grid
    let count = 1;
    for (let i = 0; i < size; i++) {
      if (!grid[i]) return false; // Row is undefined/null
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
  if (size === 0) return [-1, -1]; // Handle empty grid
  for (let i = 0; i < size; i++) {
    if (!grid[i]) continue; // Skip if row is missing
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
  const [gameState, setGameState] = useState<GameState>('configuring');
  const [level, setLevel] = useState(1);
  const [selectedGridSize, setSelectedGridSize] = useState<number>(3); // For config screen
  const [gridSize, setGridSize] = useState(3); // Actual game grid size
  const [grid, setGrid] = useState<Grid>([]); // Initialize empty
  const [moves, setMoves] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { width, height } = useWindowSize(); // For confetti

  const getShuffleMoves = useCallback((lvl: number, size: number): number => {
     // More moves for larger grids and higher levels
     return 30 + (lvl - 1) * 10 + Math.pow(size - 2, 2) * 15;
  }, []);

  const initializePuzzle = useCallback((size: number, lvl: number) => {
    const shuffleMoves = getShuffleMoves(lvl, size);
    console.log(`Initializing puzzle: Size=${size}, Level=${lvl}, ShuffleMoves=${shuffleMoves}`);
    const solvedGrid = createSolvedGrid(size);
    setGrid(shuffleGrid(solvedGrid, shuffleMoves));
    setMoves(0);
    setIsWin(false);
    setStartTime(Date.now()); // Start timer when game initialized
    setElapsedTime(0);
    setGridSize(size); // Ensure gridSize state matches
    setLevel(lvl);     // Ensure level state matches
    setGameState('playing'); // Move to playing state
  }, [getShuffleMoves]); // Add dependency

  const resetCurrentPuzzle = useCallback(() => {
     if (gameState !== 'playing' && gameState !== 'won') return;
      const shuffleMoves = getShuffleMoves(level, gridSize);
      console.log(`Resetting puzzle: Size=${gridSize}, Level=${level}, ShuffleMoves=${shuffleMoves}`);
      const solvedGrid = createSolvedGrid(gridSize);
      setGrid(shuffleGrid(solvedGrid, shuffleMoves));
      setMoves(0);
      setIsWin(false);
      setStartTime(Date.now());
      setElapsedTime(0);
      // Ensure game state remains 'playing' if it was 'won'
      if (gameState === 'won') {
          setGameState('playing');
      }
  }, [gridSize, level, gameState, getShuffleMoves]);


   // Timer effect - Runs only when game is in 'playing' state
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (gameState === 'playing' && startTime && !isWin) {
      timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (timerInterval) {
      clearInterval(timerInterval);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameState, startTime, isWin]);


  const handleTileClick = (rowIndex: number, colIndex: number) => {
     // Only allow moves when playing
    if (gameState !== 'playing' || isWin || grid[rowIndex]?.[colIndex] === null) return;

    const [emptyRow, emptyCol] = findEmptyTile(grid);
    if (emptyRow === -1) {
      console.error("Cannot handle tile click, empty tile not found.");
      return;
    }


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
        setGameState('won'); // Update game state to won
        if (startTime) {
           setElapsedTime(Math.floor((Date.now() - startTime) / 1000)); // Final time
        }
      }
    }
  };

  const startNextLevel = () => {
    const nextLevelNum = level + 1;
    let nextGridSize = gridSize;
     // Increase grid size logic (e.g., every 3 levels)
     if (nextLevelNum > 1 && nextLevelNum % 3 === 1) {
        nextGridSize = Math.min(gridSize + 1, 6); // Cap grid size at 6x6
     }
     // Re-initialize with new level and potentially new size
     initializePuzzle(nextGridSize, nextLevelNum);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleStartGame = () => {
    console.log("Starting game with size:", selectedGridSize);
    initializePuzzle(selectedGridSize, 1); // Start at level 1 with selected size
  };

  const handleConfigureNewGame = () => {
      setGameState('configuring');
      setIsWin(false); // Reset win state
      setGrid([]); // Clear grid
      setStartTime(null); // Reset timer start time
      setElapsedTime(0); // Reset elapsed time
      setMoves(0); // Reset moves
      // Reset level and selected size? Optional, could keep last selection.
      // setLevel(1);
      // setSelectedGridSize(3);
  };


  // --- Render Logic ---

  const renderConfigurationScreen = () => (
    <Card className="w-full max-w-md shadow-xl bg-card/80 dark:bg-card/70 backdrop-blur-lg text-card-foreground overflow-hidden">
       <CardHeader className="text-center">
         <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
           <Settings className="text-accent" /> Configure Puzzle
         </CardTitle>
         <CardDescription className="text-sm text-muted-foreground mt-2">
           Choose your challenge! Select the grid size to begin.
         </CardDescription>
       </CardHeader>
       <CardContent className="flex flex-col items-center gap-6 pt-4">
         <div className="w-full max-w-xs">
           <Label htmlFor="grid-size-select" className="mb-2 block text-center font-medium text-card-foreground">
             Select Grid Size:
           </Label>
           <Select
              value={String(selectedGridSize)}
              onValueChange={(value) => setSelectedGridSize(Number(value))}
            >
             <SelectTrigger id="grid-size-select" className="w-full bg-background/80 dark:bg-background/70 backdrop-blur-sm shadow">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-popover/90 backdrop-blur-md">
                <SelectItem value="3">3 x 3 (Standard)</SelectItem>
                <SelectItem value="4">4 x 4 (Challenging)</SelectItem>
                <SelectItem value="5">5 x 5 (Expert)</SelectItem>
                <SelectItem value="6">6 x 6 (Master)</SelectItem>
              </SelectContent>
           </Select>
         </div>
          {/* Placeholder for timer options if added later */}
          {/* <div className="w-full max-w-xs">
             <Label className="mb-2 block text-center font-medium text-card-foreground">Timer Options:</Label>
             <p className="text-sm text-muted-foreground text-center">(Timer starts automatically)</p>
           </div> */}
       </CardContent>
       <CardFooter className="pt-6">
         <Button onClick={handleStartGame} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow">
           <Play className="mr-2 h-4 w-4" /> Start Game
         </Button>
       </CardFooter>
    </Card>
  );

  const renderGameScreen = () => (
    <Card className="w-full max-w-md shadow-xl bg-card/80 dark:bg-card/70 backdrop-blur-lg text-card-foreground overflow-hidden">
       <AnimatePresence>
        {isWin && width && height && (
           <Confetti
             width={width}
             height={height}
             recycle={false}
             numberOfPieces={300}
             gravity={0.15} // Adjust gravity for effect
           />
        )}
      </AnimatePresence>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
           <Star className="text-accent"/> Level {level} <span className="text-lg font-normal text-muted-foreground">({gridSize}x{gridSize})</span>
        </CardTitle>
         <div className="text-sm text-muted-foreground flex justify-center items-center gap-4 mt-1">
            <span>Moves: {moves}</span>
            <span className="flex items-center gap-1"><Timer className="h-4 w-4" /> {formatTime(elapsedTime)}</span>
        </div>
         <CardDescription className="text-sm text-muted-foreground mt-3 px-2 flex items-start gap-2">
             <Info className="h-4 w-4 mt-0.5 shrink-0 text-accent"/>
             <span>Click a tile next to the empty space to slide it. Arrange the tiles in order to win!</span>
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
            <Alert variant="default" className="bg-accent/90 text-accent-foreground backdrop-blur-sm shadow-md border-0"> {/* Explicitly remove border */}
              <CheckCircle className="h-5 w-5 text-accent-foreground" /> {/* Ensure icon matches text color */}
              <AlertTitle className="font-bold">Congratulations!</AlertTitle>
              <AlertDescription>
                You solved Level {level} in {moves} moves and {formatTime(elapsedTime)}!
              </AlertDescription>
              <Button onClick={startNextLevel} className="mt-4 w-full bg-accent-foreground text-accent hover:bg-accent-foreground/90 shadow">
                 Next Level {level + 1}
              </Button>
            </Alert>
          </motion.div>
        )}

        {/* Grid container */}
        <div
          className="grid gap-1 bg-secondary/70 dark:bg-secondary/60 p-2 rounded-md shadow-inner backdrop-blur-md" // Glassmorphic grid background
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            aspectRatio: '1 / 1',
            maxWidth: '300px',
            width: '90%',
          }}
        >
          <AnimatePresence>
             {grid.flat().map((tile, index) => {
               const rowIndex = Math.floor(index / gridSize);
               const colIndex = index % gridSize;
               const isEmpty = tile === null;

               // Ensure valid indices before accessing grid
               if (rowIndex >= grid.length || !grid[rowIndex] || colIndex >= grid[rowIndex].length) {
                  console.warn(`Invalid index encountered: [${rowIndex}, ${colIndex}] for grid size ${gridSize}`);
                  return null; // Skip rendering this tile if indices are out of bounds
               }


               return (
                 <motion.div
                   key={isEmpty ? 'empty' : tile} // Use tile value as key
                   layout // Enable layout animation
                   initial={false}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.8, opacity: 0 }}
                   transition={{ type: 'spring', stiffness: 350, damping: 30 }} // Slightly faster animation
                   className={`flex items-center justify-center rounded font-bold text-lg select-none aspect-square transition-colors duration-150
                     ${
                       isEmpty
                         ? 'bg-transparent cursor-default opacity-50' // Make empty space slightly transparent
                         : 'bg-card/90 dark:bg-card/80 text-card-foreground shadow-md cursor-pointer hover:bg-primary/20 active:bg-primary/30'
                     }`}
                   onClick={() => handleTileClick(rowIndex, colIndex)}
                   aria-label={isEmpty ? "Empty tile" : `Tile ${tile}`}
                   role="button"
                   tabIndex={isEmpty ? -1 : 0}
                 >
                    {!isEmpty ? tile : ''}
                 </motion.div>
               );
             })}
          </AnimatePresence>
        </div>

         <div className="flex gap-2 w-full justify-center">
             <Button
               variant="outline"
               onClick={resetCurrentPuzzle}
               disabled={isWin} // Disable reset button if already won (use Next Level)
               className="flex items-center gap-2 bg-background/70 dark:bg-background/60 backdrop-blur-sm hover:bg-accent/80 hover:text-accent-foreground shadow"
             >
               <RotateCcw className="h-4 w-4" />
               Reset Level
             </Button>
              <Button
                 variant="outline"
                 onClick={handleConfigureNewGame}
                 className="flex items-center gap-2 bg-background/70 dark:bg-background/60 backdrop-blur-sm hover:bg-destructive/80 hover:text-destructive-foreground shadow"
               >
                 <Settings className="h-4 w-4" />
                 New Game
               </Button>
         </div>
      </CardContent>
    </Card>
  );


    // --- Main Render ---
    return (
      <>
        {gameState === 'configuring' && renderConfigurationScreen()}
        {(gameState === 'playing' || gameState === 'won') && renderGameScreen()}
      </>
    );
};

export default PuzzleGame;
    
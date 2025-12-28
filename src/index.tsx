import React, { useState, useEffect, useCallback } from 'react';

interface Game2048Props {
  onClose: () => void;
}

type Grid = number[][];

const TILE_COLORS: Record<number, string> = {
  0: 'bg-gray-300/50',
  2: 'bg-gray-200 text-gray-800',
  4: 'bg-gray-300 text-gray-800',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-orange-500 text-white',
  64: 'bg-orange-600 text-white',
  128: 'bg-yellow-400 text-white',
  256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white',
  1024: 'bg-yellow-700 text-white',
  2048: 'bg-yellow-500 text-white',
};

const Game2048: React.FC<Game2048Props> = ({ onClose }) => {
  const [grid, setGrid] = useState<Grid>(() => initGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('zos-2048-best');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function initGrid(): Grid {
    const grid: Grid = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(grid);
    addRandomTile(grid);
    return grid;
  }

  function addRandomTile(grid: Grid): boolean {
    const empty: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return false;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  function canMove(grid: Grid): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) return true;
        if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
        if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
      }
    }
    return false;
  }

  function slide(row: number[]): { row: number[]; score: number } {
    let arr = row.filter(x => x !== 0);
    let scoreGain = 0;
    
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        scoreGain += arr[i];
        arr.splice(i + 1, 1);
      }
    }
    
    while (arr.length < 4) arr.push(0);
    return { row: arr, score: scoreGain };
  }

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    const newGrid = grid.map(row => [...row]);
    let totalScore = 0;
    let moved = false;

    const processRow = (row: number[]): number[] => {
      const { row: newRow, score } = slide(row);
      totalScore += score;
      if (JSON.stringify(row) !== JSON.stringify(newRow)) moved = true;
      return newRow;
    };

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        newGrid[r] = processRow(newGrid[r]);
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        newGrid[r] = processRow([...newGrid[r]].reverse()).reverse();
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        const newCol = processRow(col);
        for (let r = 0; r < 4; r++) newGrid[r][c] = newCol[r];
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
        const newCol = processRow(col);
        for (let r = 0; r < 4; r++) newGrid[3 - r][c] = newCol[r];
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(s => {
        const newScore = s + totalScore;
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('zos-2048-best', newScore.toString());
        }
        return newScore;
      });

      // Check for 2048
      if (!won && newGrid.flat().includes(2048)) {
        setWon(true);
      }

      // Check game over
      if (!canMove(newGrid)) {
        setGameOver(true);
      }
    }
  }, [grid, gameOver, won, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right',
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        move(dir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const restart = () => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#faf8ef] p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-5xl font-bold text-[#776e65]">2048</h1>
          <div className="flex gap-2">
            <div className="bg-[#bbada0] rounded px-3 py-1 text-center">
              <div className="text-xs text-[#eee4da] uppercase">Score</div>
              <div className="text-xl font-bold text-white">{score}</div>
            </div>
            <div className="bg-[#bbada0] rounded px-3 py-1 text-center">
              <div className="text-xs text-[#eee4da] uppercase">Best</div>
              <div className="text-xl font-bold text-white">{bestScore}</div>
            </div>
          </div>
        </div>

        <button
          onClick={restart}
          className="mb-4 px-4 py-2 bg-[#8f7a66] text-white rounded font-bold hover:bg-[#9f8b77]"
        >
          New Game
        </button>

        {/* Grid */}
        <div className="relative bg-[#bbada0] rounded-lg p-3">
          <div className="grid grid-cols-4 gap-3">
            {grid.flat().map((value, i) => (
              <div
                key={i}
                className={`
                  aspect-square rounded-md flex items-center justify-center font-bold
                  transition-all duration-100
                  ${TILE_COLORS[value] || 'bg-[#3c3a32] text-white'}
                  ${value > 64 ? 'text-2xl' : 'text-3xl'}
                  ${value > 512 ? 'text-xl' : ''}
                `}
              >
                {value > 0 ? value : ''}
              </div>
            ))}
          </div>

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-white/80 rounded-lg flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-[#776e65] mb-4">Game Over!</div>
              <button
                onClick={restart}
                className="px-6 py-3 bg-[#8f7a66] text-white rounded font-bold hover:bg-[#9f8b77]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Win Overlay */}
          {won && !gameOver && (
            <div className="absolute inset-0 bg-yellow-400/80 rounded-lg flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-white mb-2">You Win!</div>
              <div className="text-white mb-4">You reached 2048!</div>
              <button
                onClick={() => setWon(false)}
                className="px-6 py-3 bg-[#8f7a66] text-white rounded font-bold hover:bg-[#9f8b77]"
              >
                Keep Playing
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[#776e65] text-sm">
          Use arrow keys or WASD to move tiles
        </p>
      </div>
    </div>
  );
};

export default Game2048;

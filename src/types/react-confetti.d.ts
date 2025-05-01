// src/types/react-confetti.d.ts
declare module 'react-confetti' {
  import * as React from 'react';

  // Define the props based on the library's documentation or source code
  export interface ReactConfettiProps {
    width?: number;
    height?: number;
    numberOfPieces?: number;
    confettiSource?: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    recycle?: boolean;
    run?: boolean; // Typically defaults to true
    gravity?: number;
    wind?: number;
    friction?: number;
    initialVelocityX?: number | { min: number; max: number };
    initialVelocityY?: number | { min: number; max: number };
    opacity?: number;
    colors?: string[];
    drawShape?: (ctx: CanvasRenderingContext2D) => void;
    onConfettiComplete?: () => void; // Callback when animation might finish
    tweenDuration?: number;
    className?: string;
    style?: React.CSSProperties;
    canvasRef?: (node: HTMLCanvasElement | null) => void;
  }

  // Define the component type
  const Confetti: React.FC<ReactConfettiProps>;

  export default Confetti;
}
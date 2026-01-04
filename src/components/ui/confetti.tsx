'use client';

import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  shape: 'square' | 'circle' | 'rectangle';
}

const COLORS = [
  'var(--primary)',
  'var(--success)',
  'var(--warning)',
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#A78BFA',
];

interface ConfettiProps {
  duration?: number;
  count?: number;
}

export function Confetti({ duration = 3000, count = 100 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Generate confetti pieces
    const shapes: Array<'square' | 'circle' | 'rectangle'> = ['square', 'circle', 'rectangle'];
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        delay: Math.random() * 2, // More spread out timing
        duration: 2.5 + Math.random() * 3, // Longer fall
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8, // 8-16px
        shape: shapes[Math.floor(Math.random() * shapes.length)]!,
      });
    }
    setPieces(newPieces);

    // Hide after duration
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const getShapeStyle = (piece: ConfettiPiece) => {
    switch (piece.shape) {
      case 'circle':
        return { width: piece.size, height: piece.size, borderRadius: '50%' };
      case 'rectangle':
        return { width: piece.size * 0.4, height: piece.size, borderRadius: '2px' };
      default:
        return { width: piece.size, height: piece.size, borderRadius: '2px' };
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            ...getShapeStyle(piece),
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  );
}

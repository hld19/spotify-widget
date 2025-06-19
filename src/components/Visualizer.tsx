/**
 * Music Visualizer Component
 * Animated bars that react to music playback
 */

import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

interface VisualizerProps {
  isPlaying: boolean;
  className?: string;
}

export default function Visualizer({ isPlaying, className = '' }: VisualizerProps) {
  const { currentTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize bars
    const barCount = 64;
    const barWidth = canvas.width / barCount;
    
    // Initialize bar heights with random values
    if (barsRef.current.length === 0) {
      for (let i = 0; i < barCount; i++) {
        barsRef.current.push(Math.random() * 0.3 + 0.1);
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, currentTheme.primary);
      gradient.addColorStop(0.5, currentTheme.secondary);
      gradient.addColorStop(1, currentTheme.accent);

      ctx.fillStyle = gradient;

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        if (isPlaying) {
          // Animate bars when playing
          const targetHeight = Math.random() * 0.8 + 0.2;
          barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.1;
        } else {
          // Slowly decrease when paused
          barsRef.current[i] *= 0.95;
          if (barsRef.current[i] < 0.1) {
            barsRef.current[i] = 0.1;
          }
        }

        const barHeight = barsRef.current[i] * canvas.height;
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        
        // Draw bar with slight gap
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTheme]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
}
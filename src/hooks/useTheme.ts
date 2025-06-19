/**
 * 🎨 useTheme Hook - Dynamic Album-Based Theming
 * Extracts colors from album artwork and creates beautiful adaptive themes
 */

import { useState, useEffect, useCallback } from 'react';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  shadow: string;
}

interface ThemeColors {
  light: ColorPalette;
  dark: ColorPalette;
}

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [albumArt, setAlbumArt] = useState<string>('');
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    light: getDefaultLightTheme(),
    dark: getDefaultDarkTheme(),
  });
  const [isExtracting, setIsExtracting] = useState(false);

  // Extract dominant colors from image
  const extractColorsFromImage = useCallback(async (imageUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(['#1db954', '#191414', '#ffffff']); // Fallback Spotify colors
            return;
          }

          // Resize for performance
          const size = 64;
          canvas.width = size;
          canvas.height = size;
          
          ctx.drawImage(img, 0, 0, size, size);
          const imageData = ctx.getImageData(0, 0, size, size);
          const data = imageData.data;
          
          // Color frequency map
          const colorMap = new Map<string, number>();
          
          // Sample pixels (skip some for performance)
          for (let i = 0; i < data.length; i += 16) { // Skip pixels for performance
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent or very dark/light pixels
            if (a < 128 || (r < 30 && g < 30 && b < 30) || (r > 225 && g > 225 && b > 225)) {
              continue;
            }
            
            // Group similar colors (reduce precision)
            const rGroup = Math.floor(r / 32) * 32;
            const gGroup = Math.floor(g / 32) * 32;
            const bGroup = Math.floor(b / 32) * 32;
            
            const colorKey = `${rGroup},${gGroup},${bGroup}`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
          }
          
          // Get most frequent colors
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color]) => {
              const [r, g, b] = color.split(',').map(Number);
              return `rgb(${r}, ${g}, ${b})`;
            });
          
          resolve(sortedColors.length > 0 ? sortedColors : ['#1db954', '#191414', '#ffffff']);
        } catch (error) {
          console.error('Color extraction failed:', error);
          resolve(['#1db954', '#191414', '#ffffff']);
        }
      };
      
      img.onerror = () => {
        resolve(['#1db954', '#191414', '#ffffff']);
      };
      
      img.src = imageUrl;
    });
  }, []);

  // Convert RGB to HSL for better color manipulation
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return [h * 360, s * 100, l * 100];
  };

  // Convert HSL back to RGB
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Generate theme from extracted colors
  const generateTheme = useCallback((colors: string[]): ThemeColors => {
    if (colors.length === 0) {
      return { light: getDefaultLightTheme(), dark: getDefaultDarkTheme() };
    }

    // Parse the primary color
    const primaryColor = colors[0];
    const rgbMatch = primaryColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    
    if (!rgbMatch) {
      return { light: getDefaultLightTheme(), dark: getDefaultDarkTheme() };
    }

    const [, rStr, gStr, bStr] = rgbMatch;
    const r = parseInt(rStr);
    const g = parseInt(gStr);
    const b = parseInt(bStr);
    
    const [h, s, l] = rgbToHsl(r, g, b);

    // Generate color variations
    const generateColorVariation = (hue: number, sat: number, light: number, alpha = 1) => {
      const [r, g, b] = hslToRgb(hue, sat, light);
      return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Dark theme (your preferred style)
    const darkTheme: ColorPalette = {
      primary: generateColorVariation(h, Math.min(s, 85), Math.max(l, 45)),
      secondary: generateColorVariation(h, Math.max(s - 20, 30), Math.max(l - 10, 35)),
      accent: generateColorVariation(h, Math.min(s + 10, 90), Math.min(l + 15, 65)),
      background: generateColorVariation(h, Math.max(s - 40, 10), 8),
      backgroundSecondary: generateColorVariation(h, Math.max(s - 35, 15), 12),
      text: '#ffffff',
      textSecondary: generateColorVariation(h, Math.max(s - 30, 20), 75),
      textMuted: generateColorVariation(h, Math.max(s - 40, 10), 55),
      border: generateColorVariation(h, Math.max(s - 30, 15), 20, 0.3),
      shadow: generateColorVariation(h, Math.min(s, 50), 5, 0.5),
    };

    // Light theme (fixed and improved)
    const lightTheme: ColorPalette = {
      primary: generateColorVariation(h, Math.min(s, 80), Math.max(Math.min(l, 45), 35)),
      secondary: generateColorVariation(h, Math.max(s - 15, 40), Math.max(Math.min(l + 10, 55), 45)),
      accent: generateColorVariation(h, Math.min(s + 5, 85), Math.max(Math.min(l - 5, 40), 30)),
      background: '#ffffff',
      backgroundSecondary: generateColorVariation(h, Math.max(s - 50, 5), 96),
      text: '#1a1a1a',
      textSecondary: generateColorVariation(h, Math.max(s - 20, 25), 35),
      textMuted: generateColorVariation(h, Math.max(s - 30, 15), 55),
      border: generateColorVariation(h, Math.max(s - 40, 10), 85, 0.6),
      shadow: generateColorVariation(h, Math.min(s, 30), 20, 0.15),
    };

    return { light: lightTheme, dark: darkTheme };
  }, []);

  // Update theme when album art changes
  const updateTheme = useCallback(async (imageUrl: string) => {
    if (!imageUrl || imageUrl === albumArt) return;
    
    setIsExtracting(true);
    setAlbumArt(imageUrl);
    
    try {
      const colors = await extractColorsFromImage(imageUrl);
      const newTheme = generateTheme(colors);
      setThemeColors(newTheme);
    } catch (error) {
      console.error('Theme update failed:', error);
    } finally {
      setIsExtracting(false);
    }
  }, [albumArt, extractColorsFromImage, generateTheme]);

  // Get current theme
  const currentTheme = themeColors[isDarkMode ? 'dark' : 'light'];

  // CSS custom properties for dynamic theming
  const cssVariables = {
    '--color-primary': currentTheme.primary,
    '--color-secondary': currentTheme.secondary,
    '--color-accent': currentTheme.accent,
    '--color-background': currentTheme.background,
    '--color-background-secondary': currentTheme.backgroundSecondary,
    '--color-text': currentTheme.text,
    '--color-text-secondary': currentTheme.textSecondary,
    '--color-text-muted': currentTheme.textMuted,
    '--color-border': currentTheme.border,
    '--color-shadow': currentTheme.shadow,
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateCustomTheme = (customColors: ColorPalette) => {
    // Save custom theme to localStorage
    localStorage.setItem('customTheme', JSON.stringify(customColors));
    
    // Update the current theme
    Object.entries(customColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    
    // Update state to trigger re-renders
    setIsDarkMode(prev => !prev);
    setTimeout(() => setIsDarkMode(prev => !prev), 0);
  };

  return {
    isDarkMode,
    setIsDarkMode,
    currentTheme,
    themeColors,
    updateTheme,
    isExtracting,
    cssVariables,
    toggleTheme,
    updateCustomTheme
  };
}

// Default themes
function getDefaultDarkTheme(): ColorPalette {
  return {
    primary: '#1db954',
    secondary: '#1ed760',
    accent: '#1db954',
    background: '#191414',
    backgroundSecondary: '#282828',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    textMuted: '#737373',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.5)',
  };
}

function getDefaultLightTheme(): ColorPalette {
  return {
    primary: '#1db954',
    secondary: '#1ed760',
    accent: '#159943',
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    text: '#1a1a1a',
    textSecondary: '#4a4a4a',
    textMuted: '#737373',
    border: 'rgba(0, 0, 0, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  };
} 
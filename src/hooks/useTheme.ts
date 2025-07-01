import { useState, useCallback, useEffect } from 'react';

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
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    light: getDefaultLightTheme(),
    dark: getDefaultDarkTheme(),
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasCustomTheme, setHasCustomTheme] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-renders when needed

  // Load custom theme from localStorage on initialization
  useEffect(() => {
    const savedCustomTheme = localStorage.getItem('customTheme');
    const savedIsDarkMode = localStorage.getItem('isDarkMode');
    const savedCustomThemeMode = localStorage.getItem('customThemeMode');
    
    if (savedIsDarkMode !== null) {
      setIsDarkMode(savedIsDarkMode === 'true');
    }
    
    if (savedCustomTheme && savedCustomThemeMode) {
      try {
        const customColors = JSON.parse(savedCustomTheme);
        setThemeColors(prev => ({
          ...prev,
          [savedCustomThemeMode]: customColors
        }));
        setHasCustomTheme(true);
        console.log('🎨 Loaded custom theme from localStorage');
      } catch (error) {
        console.error('Failed to load custom theme:', error);
        localStorage.removeItem('customTheme');
        localStorage.removeItem('customThemeMode');
      }
    }
  }, []);

  // Get current theme - this needs to be reactive
  const currentTheme = themeColors[isDarkMode ? 'dark' : 'light'];
  
  // Apply CSS variables whenever currentTheme changes
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    console.log('🎨 Applied CSS variables:', currentTheme);
  }, [currentTheme, forceUpdate]); // Added forceUpdate as dependency

  const extractColorsFromImage = useCallback(async (imageUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(['#1db954', '#191414', '#ffffff']);
            return;
          }

          const size = 100;
          canvas.width = size;
          canvas.height = size;
          
          ctx.drawImage(img, 0, 0, size, size);
          const imageData = ctx.getImageData(0, 0, size, size);
          const data = imageData.data;
          const colorMap = new Map<string, number>();
          for (let i = 0; i < data.length; i += 8) { // Less aggressive skipping
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a < 200) continue;
            const brightness = (r + g + b) / 3;
            if (brightness < 20 || brightness > 240) continue;
            
            const rGroup = Math.floor(r / 20) * 20;
            const gGroup = Math.floor(g / 20) * 20;
            const bGroup = Math.floor(b / 20) * 20;
            
            const colorKey = `${rGroup},${gGroup},${bGroup}`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
          }
          
          const sortedColors = Array.from(colorMap.entries())
            .map(([color, count]) => {
              const [r, g, b] = color.split(',').map(Number);
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              const vibrancy = max - min;
              return { color: `rgb(${r}, ${g}, ${b})`, count, vibrancy, r, g, b };
            })
            .filter(item => item.vibrancy > 30) // Only vibrant colors
            .sort((a, b) => (b.count * b.vibrancy) - (a.count * a.vibrancy)) // Sort by frequency * vibrancy
            .slice(0, 3)
            .map(item => item.color);
          
          console.log('🎨 Extracted colors:', sortedColors);
          resolve(sortedColors.length > 0 ? sortedColors : ['#1db954', '#191414', '#ffffff']);
        } catch (error) {
          console.error('Color extraction failed:', error);
          resolve(['#1db954', '#191414', '#ffffff']);
        }
      };
      
      img.onerror = () => {
        console.log('🖼️ Image load failed, using fallback colors');
        resolve(['#1db954', '#191414', '#ffffff']);
      };
      
      img.src = imageUrl;
    });
  }, []);

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

  const generateTheme = useCallback((colors: string[]): ThemeColors => {
    if (colors.length === 0) {
      return { light: getDefaultLightTheme(), dark: getDefaultDarkTheme() };
    }

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

    const generateColorVariation = (hue: number, sat: number, light: number, alpha = 1) => {
      const [r, g, b] = hslToRgb(hue, sat, light);
      return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const darkTheme: ColorPalette = {
      primary: generateColorVariation(h, Math.min(s, 75), Math.max(l, 50)),
      secondary: generateColorVariation(h, Math.max(s - 15, 35), Math.max(l - 5, 40)),
      accent: generateColorVariation(h, Math.min(s + 5, 80), Math.min(l + 10, 60)),
      background: generateColorVariation(h, Math.max(s - 30, 15), 12),
      backgroundSecondary: generateColorVariation(h, Math.max(s - 25, 20), 18),
      text: '#ffffff',
      textSecondary: generateColorVariation(h, Math.max(s - 20, 25), 80),
      textMuted: generateColorVariation(h, Math.max(s - 30, 15), 60),
      border: generateColorVariation(h, Math.max(s - 20, 20), 25, 0.4),
      shadow: generateColorVariation(h, Math.min(s, 50), 5, 0.5),
    };

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

  const updateTheme = useCallback(async (imageUrl: string) => {
    if (!imageUrl || hasCustomTheme) return; // Don't override custom themes
    
    console.log('🎨 Updating theme for image:', imageUrl);
    setIsExtracting(true);
    
    try {
      const colors = await extractColorsFromImage(imageUrl);
      const newTheme = generateTheme(colors);
      setThemeColors(newTheme);
      setForceUpdate(prev => prev + 1); // Force re-render
      console.log('✅ Theme updated with colors:', colors);
    } catch (error) {
      console.error('❌ Theme update failed:', error);
      const fallbackTheme = generateTheme(['#1db954', '#191414', '#ffffff']);
      setThemeColors(fallbackTheme);
      setForceUpdate(prev => prev + 1);
    } finally {
      setIsExtracting(false);
    }
  }, [extractColorsFromImage, generateTheme, hasCustomTheme]);

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
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', newMode.toString());
    setForceUpdate(prev => prev + 1); // Force re-render when switching modes
  };

  const updateCustomTheme = (customColors: ColorPalette) => {
    const currentMode = isDarkMode ? 'dark' : 'light';
    
    // Update the theme state immediately
    setThemeColors(prev => ({
      ...prev,
      [currentMode]: customColors
    }));
    
    // Save to localStorage with current mode info
    localStorage.setItem('customTheme', JSON.stringify(customColors));
    localStorage.setItem('customThemeMode', currentMode);
    setHasCustomTheme(true);
    
    // Force re-render to ensure all components get the new theme
    setForceUpdate(prev => prev + 1);
    
    console.log('🎨 Custom theme applied:', customColors);
  };

  const resetToDefaultTheme = () => {
    localStorage.removeItem('customTheme');
    localStorage.removeItem('customThemeMode');
    setHasCustomTheme(false);
    setThemeColors({
      light: getDefaultLightTheme(),
      dark: getDefaultDarkTheme(),
    });
    setForceUpdate(prev => prev + 1); // Force re-render
    console.log('🎨 Theme reset to default');
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
    updateCustomTheme,
    resetToDefaultTheme,
    hasCustomTheme
  };
}

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

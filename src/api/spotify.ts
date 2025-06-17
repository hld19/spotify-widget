/**
 * 🎵 Spotify API Module - Completely Revamped
 * Simple, reliable, and bulletproof Spotify integration
 */

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Types
interface SpotifyToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
}

interface SpotifyPlaybackState {
  device: {
    id: string;
    is_active: boolean;
    name: string;
  };
  shuffle_state: boolean;
  repeat_state: string;
  timestamp: number;
  context: any;
  progress_ms: number;
  item: SpotifyTrack;
  currently_playing_type: string;
  is_playing: boolean;
}

// Simple state management
class SpotifyAPI {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl = 'https://api.spotify.com/v1';
  private authListenerSetup = false;
  
  constructor() {
    this.loadTokens();
    this.setupAuthListener();
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('spotify_access_token');
    this.refreshToken = localStorage.getItem('spotify_refresh_token');
    console.log('📱 Loaded tokens from storage:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken
    });
  }

  private saveTokens(token: SpotifyToken) {
    console.log('💾 Saving new tokens to storage');
    this.accessToken = token.access_token;
    if (token.refresh_token) {
      this.refreshToken = token.refresh_token;
      localStorage.setItem('spotify_refresh_token', token.refresh_token);
    }
    localStorage.setItem('spotify_access_token', token.access_token);
    localStorage.setItem('spotify_token_expires', (Date.now() + token.expires_in * 1000).toString());
  }

  private async setupAuthListener() {
    if (this.authListenerSetup) return;
    
    try {
      console.log('🎧 Setting up auth listener...');
      await listen<SpotifyToken>('spotify-auth-token', (event) => {
        console.log('✅ Received Spotify auth token from backend!');
        console.log('Token payload:', {
          hasAccessToken: !!event.payload.access_token,
          hasRefreshToken: !!event.payload.refresh_token,
          expiresIn: event.payload.expires_in
        });
        
        this.saveTokens(event.payload);
        
        // Notify the app that authentication is complete
        console.log('🔄 Reloading app to apply authentication...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
      
      this.authListenerSetup = true;
      console.log('✅ Auth listener setup complete');
    } catch (error) {
      console.error('❌ Failed to setup auth listener:', error);
    }
  }

  // Use arrow functions to preserve 'this' context
  login = async () => {
    try {
      console.log('🔐 Starting Spotify login process...');
      
      // Ensure auth listener is set up
      await this.setupAuthListener();
      
      // Clear any existing tokens
      this.logout();
      
      // Start the OAuth flow
      await invoke('login');
      console.log('🌐 OAuth flow initiated - browser should open');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw new Error('Failed to start login process');
    }
  }

  logout = () => {
    console.log('🚪 Logging out and clearing all tokens...');
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires');
  }

  isAuthenticated = (): boolean => {
    const hasToken = !!this.accessToken;
    console.log('🔍 Checking authentication status:', hasToken);
    return hasToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      console.log('🔄 Token expired, attempting refresh...');
      await this.refreshAccessToken();
      // Retry with new token
      return this.request(endpoint, options);
    }

    if (response.status === 429) {
      console.log('⏳ Rate limited, waiting...');
      const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return this.request(endpoint, options);
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('http://127.0.0.1:14700/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const token = await response.json();
      this.saveTokens(token);
      console.log('✅ Token refreshed successfully');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  // API Methods with arrow functions
  getCurrentPlayback = async (): Promise<SpotifyPlaybackState | null> => {
    try {
      return await this.request<SpotifyPlaybackState>('/me/player');
    } catch (error) {
      console.error('Error getting playback state:', error);
      return null;
    }
  }

  play = async (contextUri?: string): Promise<void> => {
    const body = contextUri ? { context_uri: contextUri } : {};
    await this.request('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  pause = async (): Promise<void> => {
    await this.request('/me/player/pause', { method: 'PUT' });
  }

  skipToNext = async (): Promise<void> => {
    await this.request('/me/player/next', { method: 'POST' });
  }

  skipToPrevious = async (): Promise<void> => {
    await this.request('/me/player/previous', { method: 'POST' });
  }

  seek = async (positionMs: number): Promise<void> => {
    try {
      const seekPosition = Math.max(0, Math.floor(positionMs));
      console.log(`🎯 API: Seeking to ${seekPosition}ms (${Math.floor(seekPosition / 1000)}s)`);
      
      await this.request(`/me/player/seek?position_ms=${seekPosition}`, { 
        method: 'PUT' 
      });
      
      console.log(`✅ Seek successful to ${seekPosition}ms`);
    } catch (error) {
      console.error('❌ Seek failed:', error);
      throw error;
    }
  }

  setVolume = async (volumePercent: number): Promise<void> => {
    await this.request(`/me/player/volume?volume_percent=${volumePercent}`, {
      method: 'PUT',
    });
  }
}

// Export singleton instance
export const spotify = new SpotifyAPI();

// Export individual functions for convenience
export const login = spotify.login;
export const logout = spotify.logout;
export const isAuthenticated = spotify.isAuthenticated;
export const getCurrentPlayback = spotify.getCurrentPlayback;
export const play = spotify.play;
export const pause = spotify.pause;
export const skipToNext = spotify.skipToNext;
export const skipToPrevious = spotify.skipToPrevious;
export const seek = spotify.seek;
export const setVolume = spotify.setVolume;

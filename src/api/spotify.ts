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
  uri: string;
}

interface SpotifyPlaybackState {
  device: {
    id: string;
    is_active: boolean;
    name: string;
    volume_percent?: number;
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

interface SpotifyPlaylistItem {
  id: string;
  name: string;
  description: string;
  images: { url: string; width: number; height: number }[];
  tracks: {
    total: number;
    href: string;
  };
  uri: string;
}

interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: string;
    uri: string;
  };
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
    // Save token expiration for 30 days
    const expirationTime = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
    localStorage.setItem('spotify_token_expires', expirationTime.toString());
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
    const tokenExpiry = localStorage.getItem('spotify_token_expires');
    const isTokenValid = !tokenExpiry || Date.now() < parseInt(tokenExpiry);
    
    console.log('🔍 Checking authentication status:', {
      hasToken,
      isTokenValid,
      expiresAt: tokenExpiry ? new Date(parseInt(tokenExpiry)).toISOString() : 'N/A'
    });
    
    return hasToken && isTokenValid;
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

    // Handle 204 No Content response (no active playback)
    if (response.status === 204) {
      return null as any;
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      throw new Error(`Spotify API error: ${response.status}`);
    }

    // Check if response has content before parsing JSON
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return null as any;
    }

    try {
      return await response.json();
    } catch (e) {
      // If JSON parsing fails, return null (empty response)
      return null as any;
    }
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

  play = async (contextUri?: string, uris?: string[]): Promise<void> => {
    let body: any = {};
    
    if (contextUri) {
      body.context_uri = contextUri;
    } else if (uris && uris.length > 0) {
      body.uris = uris;
    }
    
    await this.request('/me/player/play', {
      method: 'PUT',
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });
  }

  playTrack = async (trackUri: string): Promise<void> => {
    // Ensure we have the full URI format
    const uri = trackUri.startsWith('spotify:track:') ? trackUri : `spotify:track:${trackUri}`;
    await this.request('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify({ uris: [uri] }),
    });
  }

  playContext = async (contextUri: string, offset?: number): Promise<void> => {
    const body: any = { context_uri: contextUri };
    if (offset !== undefined) {
      body.offset = { position: offset };
    }
    
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

  // New methods for enhanced functionality
  getRecentlyPlayed = async (limit: number = 20): Promise<SpotifyRecentlyPlayedItem[]> => {
    try {
      const response = await this.request<{ items: SpotifyRecentlyPlayedItem[] }>(
        `/me/player/recently-played?limit=${limit}`
      );
      return response?.items || [];
    } catch (error) {
      console.error('Error getting recently played:', error);
      return [];
    }
  }

  getUserPlaylists = async (limit: number = 50): Promise<SpotifyPlaylistItem[]> => {
    try {
      const response = await this.request<{ items: SpotifyPlaylistItem[] }>(
        `/me/playlists?limit=${limit}`
      );
      return response?.items || [];
    } catch (error) {
      console.error('Error getting playlists:', error);
      return [];
    }
  }

  getPlaylistTracks = async (playlistId: string): Promise<SpotifyTrack[]> => {
    try {
      const response = await this.request<{ items: Array<{ track: SpotifyTrack }> }>(
        `/playlists/${playlistId}/tracks`
      );
      return response?.items?.map(item => item.track).filter(track => track !== null) || [];
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      return [];
    }
  }

  setShuffle = async (state: boolean): Promise<void> => {
    await this.request(`/me/player/shuffle?state=${state}`, { method: 'PUT' });
  }

  setRepeat = async (state: 'track' | 'context' | 'off'): Promise<void> => {
    await this.request(`/me/player/repeat?state=${state}`, { method: 'PUT' });
  }

  getDevices = async () => {
    try {
      const response = await this.request<{ devices: Array<{
        id: string;
        is_active: boolean;
        name: string;
        type: string;
        volume_percent: number;
      }> }>('/me/player/devices');
      return response.devices;
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  }

  transferPlayback = async (deviceId: string, play: boolean = true): Promise<void> => {
    await this.request('/me/player', {
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [deviceId],
        play
      })
    });
  }

  search = async (query: string, types: string[] = ['track'], limit: number = 20) => {
    try {
      const typeString = types.join(',');
      const response = await this.request<any>(
        `/search?q=${encodeURIComponent(query)}&type=${typeString}&limit=${limit}`
      );
      return response;
    } catch (error) {
      console.error('Error searching:', error);
      return null;
    }
  }

  addToQueue = async (uri: string): Promise<void> => {
    await this.request(`/me/player/queue?uri=${uri}`, { method: 'POST' });
  }

  async getQueue(): Promise<any> {
    const response = await this.request<any>('/me/player/queue');
    if (response.status === 204) {
      return { queue: [] };
    }
    return response.json();
  }

  async saveTrack(trackId: string, save: boolean = true): Promise<void> {
    const method = save ? 'PUT' : 'DELETE';
    await this.request(`/me/tracks?ids=${trackId}`, {
      method,
    });
  }

  async checkSavedTracks(trackIds: string[]): Promise<boolean[]> {
    const response = await this.request<boolean[]>(
      `/me/tracks/contains?ids=${trackIds.join(',')}`
    );
    return response;
  }

  async getRecommendations(trackIds: string[], limit: number = 20): Promise<any> {
    const seedTracks = trackIds.slice(0, 5).join(','); // API limits to 5 seed tracks
    return this.request<any>(`/recommendations?seed_tracks=${seedTracks}&limit=${limit}`);
  }

  async getTrackFeatures(trackId: string): Promise<any> {
    return this.request<any>(`/audio-features/${trackId}`);
  }

  async getRelatedArtists(artistId: string): Promise<any> {
    return this.request<any>(`/artists/${artistId}/related-artists`);
  }

  async getArtistTopTracks(artistId: string, market: string = 'US'): Promise<any> {
    return this.request<any>(`/artists/${artistId}/top-tracks?market=${market}`);
  }

  async getAlbum(albumId: string): Promise<any> {
    return this.request<any>(`/albums/${albumId}`);
  }

  async getArtist(artistId: string): Promise<any> {
    return this.request<any>(`/artists/${artistId}`);
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
export const playTrack = spotify.playTrack;
export const playContext = spotify.playContext;
export const pause = spotify.pause;
export const skipToNext = spotify.skipToNext;
export const skipToPrevious = spotify.skipToPrevious;
export const seek = spotify.seek;
export const setVolume = spotify.setVolume;
export const getRecentlyPlayed = spotify.getRecentlyPlayed;
export const getUserPlaylists = spotify.getUserPlaylists;
export const getPlaylistTracks = spotify.getPlaylistTracks;
export const setShuffle = spotify.setShuffle;
export const setRepeat = spotify.setRepeat;
export const getDevices = spotify.getDevices;
export const transferPlayback = spotify.transferPlayback;
export const search = spotify.search;
export const addToQueue = spotify.addToQueue;
export const getQueue = spotify.getQueue;
export const saveTrack = spotify.saveTrack;
export const checkSavedTracks = spotify.checkSavedTracks;
export const getRecommendations = spotify.getRecommendations;
export const getTrackFeatures = spotify.getTrackFeatures;
export const getRelatedArtists = spotify.getRelatedArtists;
export const getArtistTopTracks = spotify.getArtistTopTracks;
export const getAlbum = spotify.getAlbum;
export const getArtist = spotify.getArtist;

// Export types
export type { SpotifyTrack, SpotifyPlaybackState, SpotifyPlaylistItem, SpotifyRecentlyPlayedItem };

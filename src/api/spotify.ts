import { invoke } from '@tauri-apps/api/core';
import SpotifyWebApi from 'spotify-web-api-node';

// Spotify API configuration
const CLIENT_ID = '1875ce4aa1164cb8a5fcfa6959524da1'; // ← Replace this with your Client ID from Spotify Dashboard
const REDIRECT_URI = 'http://127.0.0.1:3000';
const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state'
];

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI
});

// Generate PKCE challenge and verifier
async function generatePKCEChallenge() {
  const verifier = await invoke<string>('generate_code_verifier');
  const challenge = await invoke<string>('generate_code_challenge', { verifier });
  return { verifier, challenge };
}

// Get authorization URL
export async function getAuthUrl() {
  const { verifier, challenge } = await generatePKCEChallenge();
  
  // Store verifier in localStorage for later use
  localStorage.setItem('code_verifier', verifier);
  
  // Build authorization URL manually with PKCE
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES.join(' ')
  });
  
  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log("Generated Auth URL:", authUrl);
  return authUrl;
}

// Handle OAuth callback
export async function handleCallback(code: string) {
  const verifier = localStorage.getItem('code_verifier');
  if (!verifier) throw new Error('No code verifier found');
  
  try {
    // Use fetch directly since SpotifyWebApi doesn't support PKCE properly
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    
    // Set access token for future API calls
    spotifyApi.setAccessToken(data.access_token);
    
    return data;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
}

// Get currently playing track
export async function getCurrentTrack() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found');
    
    spotifyApi.setAccessToken(token);
    const response = await spotifyApi.getMyCurrentPlayingTrack();
    return response.body;
  } catch (error) {
    console.error('Error getting current track:', error);
    throw error;
  }
}

// Refresh access token
export async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token found');
    
    // Use fetch directly for token refresh
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update access token
    localStorage.setItem('access_token', data.access_token);
    spotifyApi.setAccessToken(data.access_token);
    
    // Update refresh token if provided
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
      spotifyApi.setRefreshToken(data.refresh_token);
    }
    
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

// Logout
export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('code_verifier');
} 
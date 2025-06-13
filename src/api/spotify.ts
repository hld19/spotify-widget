
import SpotifyWebApi from 'spotify-web-api-node';
import pkceChallenge from 'pkce-challenge';

// Spotify API configuration
const CLIENT_ID = '0d719dbb994743bc9a8af7a7d0b4f3f1'; // ← Replace this with your Client ID from Spotify Dashboard
const REDIRECT_URI = 'https://spotify-topaz-five.vercel.app/';
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
  const { code_verifier, code_challenge } = await pkceChallenge();
  return { verifier: code_verifier, challenge: code_challenge };
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
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
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
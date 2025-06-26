# Architecture Documentation

This document provides a comprehensive overview of the Spotify Desktop Widget's architecture, design patterns, and technical implementation.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Authentication System](#authentication-system)
- [Theme System](#theme-system)
- [Performance Considerations](#performance-considerations)
- [Security Model](#security-model)

## System Overview

The Spotify Desktop Widget is a cross-platform desktop application built using the Tauri framework, which combines a Rust backend with a React frontend. The application provides a native desktop experience while maintaining web technology flexibility.

### Core Principles

- **Performance**: Minimal resource usage with native performance
- **Security**: Secure authentication and API communication
- **Responsiveness**: Real-time synchronization with Spotify
- **Extensibility**: Modular architecture for easy feature additions
- **Cross-platform**: Consistent experience across Windows, macOS, and Linux

## Technology Stack

### Frontend
- **React 18**: Component-based UI framework
- **TypeScript**: Type-safe JavaScript development
- **TailwindCSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

### Backend
- **Rust**: Systems programming language for performance
- **Tauri**: Framework for building desktop apps with web technologies
- **Tokio**: Asynchronous runtime for Rust
- **Serde**: Serialization/deserialization framework

### Development Tools
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Desktop Application                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │   React Frontend │    │          Rust Backend               │ │
│  │                 │    │                                     │ │
│  │  ┌─────────────┐│    │  ┌─────────────┐ ┌─────────────────┐│ │
│  │  │ UI Components││    │  │ Tauri Core  │ │ Spotify API     ││ │
│  │  └─────────────┘│    │  └─────────────┘ │ Client          ││ │
│  │  ┌─────────────┐│    │  ┌─────────────┐ └─────────────────┘│ │
│  │  │ State Mgmt  ││    │  │ File System │ ┌─────────────────┐│ │
│  │  └─────────────┘│    │  │ Access      │ │ Local Storage   ││ │
│  │  ┌─────────────┐│    │  └─────────────┘ │ Management      ││ │
│  │  │ API Client  ││    │  ┌─────────────┐ └─────────────────┘│ │
│  │  └─────────────┘│    │  │ OAuth 2.0   │ ┌─────────────────┐│ │
│  └─────────────────┘    │  │ Handler     │ │ Theme Generator ││ │
│                         │  └─────────────┘ └─────────────────┘│ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────┐
                    │        Spotify Web API          │
                    └─────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── NotificationContainer
├── Background
└── Router
    ├── Player (Main Interface)
    │   ├── PlayerSkeleton (Loading State)
    │   ├── TabNavigation
    │   ├── AlbumArt
    │   ├── TrackInfo
    │   ├── PlayerControls
    │   ├── ProgressBar
    │   ├── VolumeControl
    │   └── TabContent
    │       ├── RecentTracks
    │       ├── Playlists
    │       ├── Search
    │       └── Devices
    ├── Settings
    │   ├── ThemeCustomizer
    │   ├── AudioSettings
    │   ├── LocalFileSettings
    │   └── GeneralSettings
    └── AuthenticationFlow
```

### State Management Pattern

The application uses a combination of React hooks and context for state management:

```typescript
// Global State Structure
interface AppState {
  // Authentication
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  
  // Playback State
  playerState: SpotifyPlayerState | null;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  
  // UI State
  activeTab: TabType;
  showTabs: boolean;
  compactMode: boolean;
  miniMode: boolean;
  transparentMode: boolean;
  
  // Theme State
  currentTheme: ThemeColors;
  customTheme: CustomThemeSettings;
  
  // Settings
  settings: ApplicationSettings;
}
```

### Custom Hooks

- **useSpotify**: Manages Spotify API interactions and player state
- **useTheme**: Handles theme generation and application
- **useNotification**: Manages user notifications
- **useLocalStorage**: Provides persistent storage utilities
- **useGestures**: Handles touch and mouse gestures
- **useSleepTimer**: Manages auto-pause functionality

## Backend Architecture

### Tauri Command Structure

```rust
// Core Commands
#[tauri::command]
async fn authenticate_spotify() -> Result<AuthResponse, String>

#[tauri::command]
async fn refresh_token(refresh_token: String) -> Result<TokenResponse, String>

#[tauri::command]
async fn get_player_state() -> Result<PlayerState, String>

#[tauri::command]
async fn control_playback(action: PlaybackAction) -> Result<(), String>

// File System Commands
#[tauri::command]
async fn find_local_album_art(
    artist: String,
    album: String,
    track: String,
    music_directory: Option<String>
) -> Result<Option<String>, String>

#[tauri::command]
async fn save_settings(settings: Settings) -> Result<(), String>
```

### Module Organization

```
src-tauri/src/
├── main.rs              # Application entry point and command registration
├── lib.rs               # Library exports and shared functionality
├── auth/                # Authentication module
│   ├── mod.rs           # Module declaration
│   ├── oauth.rs         # OAuth 2.0 PKCE implementation
│   └── token_manager.rs # Token storage and refresh logic
├── spotify/             # Spotify API integration
│   ├── mod.rs           # Module declaration
│   ├── client.rs        # HTTP client configuration
│   ├── endpoints.rs     # API endpoint definitions
│   └── types.rs         # Spotify data structures
├── file_system/         # Local file operations
│   ├── mod.rs           # Module declaration
│   └── album_art.rs     # Album art detection logic
├── theme/               # Theme generation
│   ├── mod.rs           # Module declaration
│   └── color_extractor.rs # Color analysis algorithms
└── utils/               # Utility functions
    ├── mod.rs           # Module declaration
    ├── crypto.rs        # Cryptographic utilities
    └── storage.rs       # Local storage management
```

## Data Flow

### Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Login  │───▶│ Generate    │───▶│ Open Browser│───▶│ User        │
│ Request     │    │ PKCE        │    │ with Auth   │    │ Authorizes  │
└─────────────┘    │ Challenge   │    │ URL         │    │ App         │
                   └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│ Store Tokens│◀───│ Exchange    │◀───│ Receive     │◀────────┘
│ Locally     │    │ Code for    │    │ Auth Code   │
└─────────────┘    │ Tokens      │    │ via Callback│
                   └─────────────┘    └─────────────┘
```

### Real-time Data Synchronization

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Spotify API │───▶│ Polling     │───▶│ State       │
│ (1s interval)│    │ Service     │    │ Update      │
└─────────────┘    └─────────────┘    └─────────────┘
                                               │
┌─────────────┐    ┌─────────────┐           │
│ UI Update   │◀───│ React State │◀──────────┘
│ (Re-render) │    │ Management  │
└─────────────┘    └─────────────┘
```

### Theme Generation Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Album Art   │───▶│ Canvas      │───▶│ Color       │
│ Image URL   │    │ Processing  │    │ Extraction  │
└─────────────┘    └─────────────┘    └─────────────┘
                                               │
┌─────────────┐    ┌─────────────┐           │
│ CSS         │◀───│ Theme       │◀──────────┘
│ Variables   │    │ Generation  │
└─────────────┘    └─────────────┘
```

## State Management

### React Context Pattern

```typescript
// Theme Context
const ThemeContext = createContext<{
  currentTheme: ThemeColors;
  setCustomTheme: (theme: Partial<ThemeColors>) => void;
  generateThemeFromImage: (imageUrl: string) => Promise<void>;
}>({} as any);

// Spotify Context
const SpotifyContext = createContext<{
  playerState: SpotifyPlayerState | null;
  playback: PlaybackControls;
  library: LibraryData;
  search: SearchFunctions;
}>({} as any);
```

### Local Storage Strategy

```typescript
// Persistent Storage Keys
const STORAGE_KEYS = {
  AUTH_TOKENS: 'spotify_auth_tokens',
  USER_SETTINGS: 'user_settings',
  THEME_SETTINGS: 'theme_settings',
  LOCAL_MUSIC_PATH: 'local_music_path',
  ALBUM_ART_CACHE: 'album_art_cache',
} as const;

// Storage Interface
interface StorageManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
```

## Authentication System

### OAuth 2.0 PKCE Implementation

The application implements the Authorization Code Flow with Proof Key for Code Exchange (PKCE) for secure authentication:

```rust
// PKCE Challenge Generation
pub struct PKCEChallenge {
    pub code_verifier: String,
    pub code_challenge: String,
    pub code_challenge_method: String,
}

impl PKCEChallenge {
    pub fn new() -> Self {
        let code_verifier = generate_random_string(128);
        let code_challenge = base64_url_encode(&sha256(&code_verifier));
        
        Self {
            code_verifier,
            code_challenge,
            code_challenge_method: "S256".to_string(),
        }
    }
}
```

### Token Management

```rust
#[derive(Serialize, Deserialize)]
pub struct TokenSet {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: u64,
    pub token_type: String,
}

impl TokenSet {
    pub fn is_expired(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        now >= self.expires_at
    }
}
```

## Theme System

### Color Extraction Algorithm

```typescript
interface ColorExtractionOptions {
  canvasSize: number;
  colorGroups: number;
  vibrancyThreshold: number;
  frequencyWeight: number;
}

const extractDominantColors = async (
  imageUrl: string,
  options: ColorExtractionOptions
): Promise<string[]> => {
  // 1. Load image onto canvas
  // 2. Sample pixels at regular intervals
  // 3. Group similar colors
  // 4. Calculate color frequency and vibrancy
  // 5. Sort by weighted score
  // 6. Return top colors
};
```

### Theme Generation

```typescript
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

const generateTheme = (dominantColors: string[]): ThemeColors => {
  // Apply color theory principles
  // Generate harmonious color palette
  // Ensure accessibility contrast ratios
  // Return complete theme object
};
```

## Performance Considerations

### Frontend Optimizations

- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Memoize expensive calculations
- **Lazy Loading**: Load components on demand
- **Virtual Scrolling**: Handle large lists efficiently

### Backend Optimizations

- **Connection Pooling**: Reuse HTTP connections
- **Request Batching**: Combine multiple API calls
- **Caching Strategy**: Cache frequently accessed data
- **Async Processing**: Non-blocking operations

### Resource Management

```typescript
// Polling Strategy
const useSpotifyPolling = (interval: number) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Adjust polling frequency based on visibility
  const activeInterval = isVisible ? interval : interval * 3;
  
  // Implementation...
};
```

## Security Model

### API Security

- **HTTPS Only**: All API communications use TLS
- **Token Encryption**: Sensitive data encrypted at rest
- **PKCE Flow**: Prevents authorization code interception
- **Scope Limitation**: Request minimal required permissions

### Local Security

- **Sandboxed Environment**: Tauri provides OS-level sandboxing
- **File System Access**: Limited to specified directories
- **Network Restrictions**: Only allowed domains can be accessed
- **Code Signing**: Application binaries are signed

### Data Protection

```rust
// Token Encryption
use aes_gcm::{Aes256Gcm, Key, Nonce};

pub fn encrypt_token(token: &str, key: &[u8]) -> Result<Vec<u8>, CryptoError> {
    let cipher = Aes256Gcm::new(Key::from_slice(key));
    let nonce = Nonce::from_slice(&generate_nonce());
    
    cipher.encrypt(nonce, token.as_bytes())
        .map_err(|_| CryptoError::EncryptionFailed)
}
```

This architecture ensures a robust, secure, and performant desktop application that provides an excellent user experience while maintaining code quality and maintainability. 
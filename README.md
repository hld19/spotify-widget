# Spotify Desktop Widget

<div align="center">

**A modern, feature-rich Spotify controller widget for desktop environments.**

*Built with performance, aesthetics, and enhanced functionality in mind.*

</div>

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Performance](#performance)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

This project is an advanced desktop widget for controlling Spotify playback with extended functionality. It provides a beautiful, responsive interface that allows you to not only control current playback but also browse and play from your recently played tracks, playlists, search for music, and manage playback devices.

The widget is built using Tauri, React, and TypeScript, resulting in a lightweight, secure, and cross-platform application that feels native on Windows, macOS, and Linux. It features a modern horizontal layout with tabs, adaptive theming based on album artwork, and comprehensive playback controls.

## Features

### Core Playback
- Real-time Spotify playback control (play, pause, skip, previous)
- Volume control with visual feedback
- Shuffle and repeat mode toggles
- Progress bar with seek functionality
- Device selection and transfer

### Advanced UI/UX
- **Mini Player Mode** - Ultra-compact view for minimal screen usage
- **Multiple Tabs** - Now Playing, Recent, Playlists, Search, Devices, Stats, Queue, Discover
- **Theme Customization** - 5 preset themes + full custom color control
- **Compact Mode** - Reduce UI element sizes for smaller screens
- **Gesture Controls** - Swipe navigation, pinch zoom, double tap controls
- **Drag & Drop** - Draggable window with custom positioning presets

### Smart Features
- **Recommendations Engine** - Discover similar tracks based on current playback
- **Track History & Statistics** - Local tracking with play counts and listening insights
- **Sleep Timer** - Auto-pause after set duration (15min to 2 hours)
- **Smart Home Integration** - Voice commands, MIDI controller, gamepad support
- **Collaborative Sessions** - Listen together with friends, shared control

### Audio Enhancement
- **10-Band Equalizer** - With 9 presets (Rock, Pop, Jazz, etc.)
- **Audio Settings** - Crossfade, normalization, gapless playback
- **Playback Speed Control** - For podcasts (0.5x to 2.0x)
- **Visual Feedback** - Animated music visualizer

### Content Features
- **Lyrics Display** - Synchronized lyrics viewer (provider integration ready)
- **Queue Management** - View and manage upcoming tracks
- **Advanced Search** - Search tracks, artists, albums, playlists
- **Podcast Enhancements** - Skip intervals, bookmarks, chapter navigation
- **Social Sharing** - Share current track via native share or clipboard

### Productivity
- **Keyboard Shortcuts** - Comprehensive shortcuts with visual guide
- **Notification System** - Smart notifications with different priority levels
- **Auto-login** - Credentials saved for 30 days
- **Update Intervals** - Configurable sync frequency
- **Widget Positioning** - 7 preset positions + custom coordinates

### Technical Features
- OAuth 2.0 PKCE authentication
- Transparent, frameless window
- Always-on-top option
- Responsive design
- Hardware acceleration
- Cross-platform (Windows, macOS, Linux)

---

## Quick Start

### Prerequisites

- **Node.js** (v18 or later)
- **Rust** and Cargo
- A **Spotify Account** (Free or Premium)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/spotify-widget.git
cd spotify-widget

# Install dependencies
npm install
```

### 2. Configuration

This application requires a Spotify Developer App to communicate with the API.

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and log in
2. Click `Create App`
3. Give your app a name and description (e.g., "Desktop Widget")
4. Once created, find your **Client ID** and copy it
5. Go to `App settings` for the app you just created
6. In the `Redirect URIs` field, add exactly: `http://127.0.0.1:14700/callback`
7. Save the settings

Now, update the backend with your Client ID:

- **File**: `spotify-widget/src-tauri/src/main.rs`
- **Line to edit**: Find the `CLIENT_ID` constant and replace with your Client ID

```rust
const CLIENT_ID: &str = "YOUR_CLIENT_ID_HERE";
```

### 3. Launch

```bash
# Start the application in development mode
npm run tauri dev
```

The widget will start, and you'll be prompted to log in with Spotify.

---

## Architecture

### Project Structure

```
spotify-widget/
├── src/                      # Frontend source code (React, TypeScript)
│   ├── api/
│   │   └── spotify.ts        # Spotify API client with extended functionality
│   ├── components/           # React components
│   │   ├── Player.tsx        # Main player component with tabs
│   │   ├── ProgressBar.tsx   # Smooth progress bar with seeking
│   │   └── Settings.tsx      # Settings page
│   ├── hooks/                # Custom React hooks
│   │   ├── useSpotify.ts     # Spotify state management
│   │   └── useTheme.ts       # Theme management
│   ├── App.tsx               # Main application component
│   └── main.tsx              # Frontend entry point
├── src-tauri/                # Backend source code (Rust)
│   ├── src/
│   │   └── main.rs           # Rust backend logic
│   └── tauri.conf.json       # Tauri configuration
├── index.html                # HTML entry point
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

### Authentication Flow

The application uses the OAuth 2.0 Authorization Code Flow with PKCE for secure authentication:

1. User clicks login, backend generates PKCE challenge
2. Browser opens Spotify authorization page
3. User grants permissions, Spotify redirects to local callback
4. Backend exchanges authorization code for tokens
5. Tokens are stored locally for 30 days
6. Frontend receives authentication confirmation and reloads

### New Features Implementation

- **Tab System**: The player now features a tab navigation system for different views
- **Recently Played**: Fetches and displays the last 20 played tracks
- **Playlist Integration**: Lists user playlists and allows direct playback
- **Search**: Real-time search integration with the Spotify API
- **Device Management**: Shows available devices and allows transfer of playback

---

## Performance

### State Management

- **Real-time Updates**: The widget polls Spotify every 1 second when visible (3 seconds when hidden)
- **Optimistic Updates**: UI updates immediately on user actions for responsive feel
- **Smart Caching**: Recently played and playlists are cached and refreshed periodically

### Resource Efficiency

- **Tauri Framework**: Native webview with Rust backend for minimal resource usage
- **Lazy Loading**: Components and API calls are loaded on demand
- **Efficient Rendering**: React with optimized re-renders and memoization

---

## Troubleshooting

### Common Issues

- **Widget doesn't resize properly**
  - Ensure you're using the latest version
  - Try restarting the application
  - Check if your OS scaling settings are affecting the window

- **Can't play from playlists or recently played**
  - Ensure you have an active Spotify session on one of your devices
  - Check that your Spotify account has the necessary permissions
  - Try refreshing the authentication by logging out and back in

- **Search not working**
  - Verify your internet connection
  - Check if you're being rate limited (wait a few seconds and try again)
  - Ensure your access token is valid

- **Login expires too quickly**
  - The app now saves credentials for 30 days
  - If issues persist, clear browser cache and re-authenticate

### Debugging

Access the developer console by right-clicking in the widget and selecting `Inspect`. Check the console for error messages or network issues.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

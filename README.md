# Spotify Mini-Player

A sleek and modern desktop widget for controlling your Spotify playback. Built with Tauri, React, and Tailwind CSS, this mini-player provides a seamless and stylish way to manage your music without interrupting your workflow.

![Spotify Widget Screenshot](https://i.imgur.com/your-screenshot.png) <!-- TODO: Replace with a real, high-quality screenshot -->

## ✨ Features

- **Minimalist Interface**: A beautiful, unobtrusive UI that shows album art, track, and artist information.
- **Playback Controls**: Essential controls at your fingertips: play, pause, next, and previous.
- **Interactive Progress Bar**: Click or drag the progress bar to seek to any part of the track.
- **Always-On-Top**: The widget stays on top of other windows for easy access.
- **Draggable & Transparent**: Move it anywhere on your screen. The transparent, borderless design blends with your desktop.
- **Secure Authentication**: Uses the OAuth 2.0 flow with PKCE for secure connection to your Spotify account.
- **Global Hotkeys (Coming Soon!)**: Control playback from any application.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Rust](https://www.rust-lang.org/tools/install) and Cargo

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/spotify-widget.git
    cd spotify-widget
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Spotify API Credentials:**
    This application requires you to set up your own Spotify application to communicate with the API.

    - Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and log in.
    - Click `Create App`.
    - Give your app a name and description.
    - Once created, go to `App settings`.
    - Add `http://localhost:14700/callback` to the "Redirect URIs".
    - Your `Client ID` will be visible on this page. *Note: The `Client Secret` is not required for this application.*

4.  **Run the Application:**
    Launch the widget in development mode.
    ```bash
    npm run tauri dev
    ```

## 🛠️ Built With

- **[Tauri](https://tauri.app/)**: A framework for building lightweight, secure, and cross-platform desktop apps.
- **[React](https://reactjs.org/)**: A library for building modern user interfaces.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid styling.
- **[Spotify Web API](https://developer.spotify.com/documentation/web-api/)**: For all playback control and track information.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/spotify-widget/issues).

---

<p align="center">Made with ❤️ by [Your Name](https://github.com/your-username)</p>

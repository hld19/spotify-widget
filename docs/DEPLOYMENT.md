# Deployment Guide

This guide covers building, packaging, and distributing the Spotify Desktop Widget across different platforms.

## Table of Contents

- [Build Requirements](#build-requirements)
- [Development Build](#development-build)
- [Production Build](#production-build)
- [Platform-Specific Builds](#platform-specific-builds)
- [Code Signing](#code-signing)
- [Distribution](#distribution)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

## Build Requirements

### System Requirements

**All Platforms:**
- Node.js 18 or later
- Rust 1.70 or later
- Git

**Windows:**
- Microsoft C++ Build Tools
- Windows 10 SDK

**macOS:**
- Xcode Command Line Tools
- macOS 10.15 or later

**Linux:**
- build-essential package
- libwebkit2gtk-4.0-dev
- libssl-dev
- libgtk-3-dev
- libayatana-appindicator3-dev
- librsvg2-dev

### Installation

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
cargo install tauri-cli

# Install Node.js dependencies
npm install
```

## Development Build

### Quick Start

```bash
# Start development server
npm run tauri dev

# Alternative: Frontend only
npm run dev
```

### Development Configuration

Create `.env.development`:

```env
VITE_SPOTIFY_CLIENT_ID=your_development_client_id
VITE_API_BASE_URL=https://api.spotify.com/v1
VITE_AUTH_REDIRECT_URI=http://127.0.0.1:14700/callback
VITE_LOG_LEVEL=debug
```

### Development Features

- Hot reload for frontend changes
- Rust compilation on save
- Debug logging enabled
- DevTools accessible via right-click

## Production Build

### Build Process

```bash
# Build for production
npm run tauri build

# Build frontend only
npm run build

# Clean build artifacts
npm run clean
```

### Build Configuration

Create `.env.production`:

```env
VITE_SPOTIFY_CLIENT_ID=your_production_client_id
VITE_API_BASE_URL=https://api.spotify.com/v1
VITE_AUTH_REDIRECT_URI=http://127.0.0.1:14700/callback
VITE_LOG_LEVEL=error
```

### Build Optimization

The production build includes:

- Minified JavaScript/CSS
- Optimized Rust binary
- Compressed assets
- Tree-shaken dependencies
- Source map generation (optional)

### Build Output

```
src-tauri/target/release/
├── bundle/                    # Platform-specific installers
│   ├── msi/                  # Windows MSI installer
│   ├── deb/                  # Debian package
│   ├── dmg/                  # macOS disk image
│   └── appimage/             # Linux AppImage
├── spotify-desktop-widget    # Executable binary
└── deps/                     # Dependencies
```

## Platform-Specific Builds

### Windows

#### Requirements
```bash
# Install Windows-specific dependencies
npm install --save-dev @tauri-apps/cli-win32
```

#### Build Commands
```bash
# Build MSI installer
npm run tauri build -- --target x86_64-pc-windows-msvc

# Build for 32-bit Windows
npm run tauri build -- --target i686-pc-windows-msvc
```

#### Configuration
```json
// tauri.conf.json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": "",
        "wix": {
          "language": ["en-US"],
          "template": "assets/windows/main.wxs"
        }
      }
    }
  }
}
```

### macOS

#### Requirements
```bash
# Add macOS target
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
```

#### Build Commands
```bash
# Build for Intel Macs
npm run tauri build -- --target x86_64-apple-darwin

# Build for Apple Silicon
npm run tauri build -- --target aarch64-apple-darwin

# Universal binary
npm run tauri build -- --target universal-apple-darwin
```

#### Configuration
```json
// tauri.conf.json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "frameworks": [],
        "minimumSystemVersion": "10.15",
        "exceptionDomain": "",
        "signingIdentity": null,
        "providerShortName": null,
        "entitlements": null
      }
    }
  }
}
```

### Linux

#### Requirements
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Fedora
sudo dnf install webkit2gtk3-devel.x86_64 \
  openssl-devel \
  curl \
  wget \
  libappindicator-gtk3 \
  librsvg2-devel

# Arch Linux
sudo pacman -S webkit2gtk \
  base-devel \
  curl \
  wget \
  openssl \
  appmenu-gtk-module \
  gtk3 \
  libappindicator-gtk3 \
  librsvg \
  libvips
```

#### Build Commands
```bash
# Build AppImage
npm run tauri build -- --target x86_64-unknown-linux-gnu

# Build Debian package
npm run tauri build -- --bundles deb

# Build RPM package (requires rpm-build)
npm run tauri build -- --bundles rpm
```

## Code Signing

### Windows Code Signing

```bash
# Using signtool
signtool sign /f certificate.p12 /p password /t http://timestamp.digicert.com target/release/spotify-desktop-widget.exe

# Using tauri.conf.json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}
```

### macOS Code Signing

```bash
# Sign the application
codesign --force --options runtime --sign "Developer ID Application: Your Name" target/release/bundle/macos/Spotify\ Desktop\ Widget.app

# Notarize with Apple
xcrun notarytool submit target/release/bundle/dmg/Spotify\ Desktop\ Widget_1.0.0_x64.dmg \
  --apple-id your-apple-id@example.com \
  --password your-app-specific-password \
  --team-id YOUR_TEAM_ID
```

### Linux Signing

```bash
# GPG signing for packages
gpg --detach-sign --armor target/release/bundle/deb/spotify-desktop-widget_1.0.0_amd64.deb
```

## Distribution

### Release Preparation

1. **Version Management**
   ```bash
   # Update version in package.json and Cargo.toml
   npm version patch|minor|major
   
   # Update tauri.conf.json version
   # Update CHANGELOG.md
   ```

2. **Build All Platforms**
   ```bash
   # Windows
   npm run build:windows
   
   # macOS
   npm run build:macos
   
   # Linux
   npm run build:linux
   ```

3. **Create Release Assets**
   ```bash
   # Generate checksums
   sha256sum target/release/bundle/* > checksums.txt
   
   # Create release archive
   tar -czf spotify-desktop-widget-v1.0.0.tar.gz target/release/bundle/
   ```

### Distribution Channels

#### GitHub Releases
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Release
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: app-v__VERSION__
          releaseName: 'App v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: true
          prerelease: false
```

#### Package Managers

**Windows (Chocolatey)**
```xml
<!-- spotify-desktop-widget.nuspec -->
<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://schemas.microsoft.com/packaging/2015/06/nuspec.xsd">
  <metadata>
    <id>spotify-desktop-widget</id>
    <version>1.0.0</version>
    <title>Spotify Desktop Widget</title>
    <authors>Your Name</authors>
    <description>Modern desktop widget for Spotify control</description>
    <projectUrl>https://github.com/your-username/spotify-desktop-widget</projectUrl>
    <licenseUrl>https://github.com/your-username/spotify-desktop-widget/blob/main/LICENSE</licenseUrl>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <tags>spotify music widget desktop</tags>
  </metadata>
</package>
```

**macOS (Homebrew)**
```ruby
# Formula/spotify-desktop-widget.rb
class SpotifyDesktopWidget < Formula
  desc "Modern desktop widget for Spotify control"
  homepage "https://github.com/your-username/spotify-desktop-widget"
  url "https://github.com/your-username/spotify-desktop-widget/releases/download/v1.0.0/spotify-desktop-widget-v1.0.0.tar.gz"
  sha256 "sha256_hash_here"
  license "MIT"

  def install
    bin.install "spotify-desktop-widget"
  end

  test do
    system "#{bin}/spotify-desktop-widget", "--version"
  end
end
```

**Linux (Snap)**
```yaml
# snap/snapcraft.yaml
name: spotify-desktop-widget
version: '1.0.0'
summary: Modern desktop widget for Spotify control
description: |
  A lightweight, feature-rich desktop widget for controlling Spotify
  with advanced theming and local file support.

grade: stable
confinement: strict

apps:
  spotify-desktop-widget:
    command: bin/spotify-desktop-widget
    plugs: [network, audio-playback, desktop]

parts:
  spotify-desktop-widget:
    plugin: rust
    source: .
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Setup Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
        
    - name: Install dependencies (Ubuntu)
      if: matrix.os == 'ubuntu-latest'
      run: |
        sudo apt update
        sudo apt install libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
    
    - name: Install npm dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Build application
      run: npm run tauri build

  release:
    needs: test
    runs-on: ${{ matrix.os }}
    if: startsWith(github.ref, 'refs/tags/')
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and Release
      uses: tauri-apps/tauri-action@v0
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
        TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
      with:
        tagName: ${{ github.ref_name }}
        releaseName: 'Spotify Desktop Widget ${{ github.ref_name }}'
        releaseBody: 'See the assets to download and install.'
        releaseDraft: true
```

## Troubleshooting

### Common Build Issues

#### Windows

**Issue**: Missing Visual Studio Build Tools
```bash
# Solution: Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
```

**Issue**: WebView2 not found
```bash
# Solution: Install WebView2 Runtime
# Download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
```

#### macOS

**Issue**: Code signing failed
```bash
# Solution: Check certificate and provisioning profile
security find-identity -v -p codesigning
```

**Issue**: Notarization failed
```bash
# Solution: Check notarization status
xcrun notarytool log --apple-id your-apple-id@example.com --password your-password submission-id
```

#### Linux

**Issue**: Missing system dependencies
```bash
# Solution: Install all required packages
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

**Issue**: AppImage not executable
```bash
# Solution: Set executable permissions
chmod +x target/release/bundle/appimage/spotify-desktop-widget_1.0.0_amd64.AppImage
```

### Build Optimization

#### Reduce Binary Size
```toml
# Cargo.toml
[profile.release]
opt-level = "s"
lto = true
codegen-units = 1
panic = "abort"
strip = true
```

#### Faster Builds
```toml
# .cargo/config.toml
[build]
target-dir = "target"

[target.x86_64-unknown-linux-gnu]
linker = "clang"
rustflags = ["-C", "link-arg=-fuse-ld=lld"]
```

### Debug Information

Enable debug logging:
```bash
# Set environment variable
export RUST_LOG=debug
npm run tauri dev
```

Check build logs:
```bash
# Verbose Tauri build
npm run tauri build -- --verbose
```

This guide should help you successfully build and distribute the Spotify Desktop Widget across all supported platforms. 
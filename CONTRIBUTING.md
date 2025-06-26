# Contributing to Spotify Desktop Widget

We welcome contributions to the Spotify Desktop Widget project. This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Project Structure](#project-structure)
- [Contribution Workflow](#contribution-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before contributing, ensure you have the following installed:

- Node.js (v18 or later)
- Rust (v1.70 or later)
- Git
- A Spotify Developer account

### Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/spotify-desktop-widget.git
   cd spotify-desktop-widget
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Spotify API**
   - Create a Spotify Developer App
   - Add your Client ID to `src-tauri/src/main.rs`
   - Set redirect URI to `http://127.0.0.1:14700/callback`

4. **Start Development Server**
   ```bash
   npm run tauri dev
   ```

## Development Setup

### Available Scripts

```bash
# Development
npm run tauri dev          # Start development server
npm run dev               # Frontend development only

# Building
npm run tauri build       # Build production application
npm run build            # Build frontend only

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
```

### Environment Configuration

Create a `.env.local` file for local development:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_API_BASE_URL=https://api.spotify.com/v1
VITE_AUTH_REDIRECT_URI=http://127.0.0.1:14700/callback
```

## Code Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type usage
- Use proper type annotations for function parameters and return types

```typescript
// Good
interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  duration_ms: number;
}

const handleTrackPlay = (track: SpotifyTrack): Promise<void> => {
  // Implementation
};

// Avoid
const handleTrackPlay = (track: any) => {
  // Implementation
};
```

### React Component Guidelines

- Use functional components with hooks
- Implement proper error boundaries
- Follow the single responsibility principle
- Use meaningful component and prop names

```typescript
// Good
interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button onClick={onPrevious} aria-label="Previous track">
        ⏮️
      </button>
      <button onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? "⏸️" : "▶️"}
      </button>
      <button onClick={onNext} aria-label="Next track">
        ⏭️
      </button>
    </div>
  );
};
```

### Styling Guidelines

- Use TailwindCSS for all styling
- Follow responsive design principles
- Implement dark mode compatibility
- Use semantic color names

```typescript
// Good
<div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
    Now Playing
  </h2>
</div>

// Avoid inline styles
<div style={{ backgroundColor: '#fff', padding: '16px' }}>
  <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
    Now Playing
  </h2>
</div>
```

### Rust Guidelines

- Follow Rust naming conventions
- Use proper error handling with `Result<T, E>`
- Implement comprehensive logging
- Document public functions and structs

```rust
// Good
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct SpotifyTokens {
    access_token: String,
    refresh_token: String,
    expires_in: u64,
}

#[command]
pub async fn refresh_spotify_token(
    refresh_token: String,
) -> Result<SpotifyTokens, String> {
    // Implementation with proper error handling
    match spotify_api::refresh_token(&refresh_token).await {
        Ok(tokens) => Ok(tokens),
        Err(e) => {
            log::error!("Failed to refresh token: {}", e);
            Err(format!("Token refresh failed: {}", e))
        }
    }
}
```

## Project Structure

### Frontend Architecture

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── Player.tsx       # Main player component
│   ├── Settings.tsx     # Configuration panel
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useSpotify.ts    # Spotify API integration
│   ├── useTheme.ts      # Theme management
│   └── ...
├── contexts/            # React contexts
├── api/                 # API client functions
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # Global styles and Tailwind config
```

### Backend Architecture

```
src-tauri/src/
├── main.rs              # Application entry point
├── lib.rs               # Library exports
├── spotify/             # Spotify API integration
│   ├── auth.rs          # Authentication logic
│   ├── api.rs           # API client
│   └── types.rs         # Data structures
├── utils/               # Utility functions
└── commands/            # Tauri commands
```

### Component Organization

- **UI Components**: Reusable, stateless components
- **Feature Components**: Components with specific functionality
- **Layout Components**: Components that handle layout and structure
- **Page Components**: Top-level route components

## Contribution Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or updates

Examples:
- `feature/lyrics-integration`
- `fix/theme-color-extraction`
- `refactor/spotify-api-client`

### Commit Messages

Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting changes
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

Examples:
```
feat(player): add shuffle and repeat controls
fix(auth): handle expired token refresh
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **PR Requirements**
   - Clear description of changes
   - Screenshots for UI changes
   - Test coverage for new features
   - Documentation updates

## Testing Guidelines

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

### Testing Tools

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerControls } from '../PlayerControls';

describe('PlayerControls', () => {
  const mockProps = {
    isPlaying: false,
    onPlayPause: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
  };

  it('should render play button when not playing', () => {
    render(<PlayerControls {...mockProps} />);
    
    const playButton = screen.getByLabelText('Play');
    expect(playButton).toBeInTheDocument();
  });

  it('should call onPlayPause when play button is clicked', () => {
    render(<PlayerControls {...mockProps} />);
    
    const playButton = screen.getByLabelText('Play');
    fireEvent.click(playButton);
    
    expect(mockProps.onPlayPause).toHaveBeenCalledTimes(1);
  });
});
```

## Documentation

### Code Documentation

- Use JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Include usage examples for utility functions

```typescript
/**
 * Extracts dominant colors from an image for theme generation
 * @param imageUrl - URL of the image to analyze
 * @param colorCount - Number of colors to extract (default: 5)
 * @returns Promise resolving to array of hex color strings
 * @example
 * const colors = await extractColors('https://example.com/image.jpg', 3);
 * // Returns: ['#ff0000', '#00ff00', '#0000ff']
 */
export const extractColors = async (
  imageUrl: string,
  colorCount: number = 5
): Promise<string[]> => {
  // Implementation
};
```

### README Updates

- Update feature lists when adding new functionality
- Include screenshots for visual changes
- Update installation instructions if dependencies change

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Focus on the code, not the person

### Communication

- Use clear, descriptive language
- Provide context for your changes
- Ask questions if requirements are unclear
- Share knowledge and best practices

### Issue Reporting

When reporting issues:

1. Use the issue template
2. Provide clear reproduction steps
3. Include system information
4. Add screenshots for UI issues
5. Check for existing similar issues

### Feature Requests

When requesting features:

1. Explain the use case
2. Describe the expected behavior
3. Consider implementation complexity
4. Discuss alternatives if applicable

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check the README and code comments
- **Code Review**: Learn from existing pull requests

Thank you for contributing to the Spotify Desktop Widget project! 
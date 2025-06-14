import React from 'react';

interface ControlsProps {
  isPlaying?: boolean;
  trackName?: string;
  artistName?: string;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  trackName,
  artistName,
  onPlayPause,
  onNext,
  onPrevious,
}) => {
  return (
    <div className="flex-grow text-center">
      <div className="mb-2">
        <h3 className="text-white font-semibold truncate">{trackName || 'No track'}</h3>
        <p className="text-gray-300 text-sm truncate">{artistName || 'No artist'}</p>
      </div>
      <div className="flex justify-center items-center space-x-4">
        <button onClick={onPrevious} className="text-white hover:text-gray-300 p-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button onClick={onPlayPause} className="text-white hover:text-gray-300 p-2 rounded-full bg-white bg-opacity-10">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            {isPlaying ? (
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
        </button>
        <button onClick={onNext} className="text-white hover:text-gray-300 p-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Controls; 
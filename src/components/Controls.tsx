import React from 'react';

interface ControlsProps {
  isPlaying?: boolean;
  trackName?: string;
  artistName?: string;
}

const Controls: React.FC<ControlsProps> = ({ isPlaying, trackName, artistName }) => {
  return (
    <div className="text-center">
      <div className="mb-2">
        <h3 className="text-white font-semibold truncate">{trackName || 'No track'}</h3>
        <p className="text-gray-300 text-sm truncate">{artistName || 'No artist'}</p>
      </div>
      <div className="flex justify-center space-x-4">
        <button className="text-white hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="text-white hover:text-gray-300">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isPlaying ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            )}
          </svg>
        </button>
        <button className="text-white hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Controls; 
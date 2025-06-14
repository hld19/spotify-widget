import React from 'react';

interface AlbumCoverProps {
  imageUrl?: string;
}

const AlbumCover: React.FC<AlbumCoverProps> = ({ imageUrl }) => {
  return (
    <div className="w-16 h-16 flex-shrink-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Album Cover"
          className="w-full h-full rounded-md shadow-lg"
        />
      ) : (
        <div className="w-full h-full rounded-md bg-gray-700 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AlbumCover; 
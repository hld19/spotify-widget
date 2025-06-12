import React from 'react';

interface AlbumCoverProps {
  imageUrl?: string;
}

const AlbumCover: React.FC<AlbumCoverProps> = ({ imageUrl }) => {
  return (
    <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden shadow-lg">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Album cover" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <span className="text-gray-400">No cover</span>
        </div>
      )}
    </div>
  );
};

export default AlbumCover; 
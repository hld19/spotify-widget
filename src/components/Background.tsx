import React from 'react';

interface BackgroundProps {
  imageUrl?: string;
}

const Background: React.FC<BackgroundProps> = ({ imageUrl }) => {
  return (
    <div 
      className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-xl"
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default Background; 
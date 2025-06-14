import React from 'react';

interface BackgroundProps {
  imageUrl?: string;
}

const Background: React.FC<BackgroundProps> = ({ imageUrl }) => {
  return (
    <div
      className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
    >
      <div className="absolute inset-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-md"></div>
    </div>
  );
};

export default Background; 
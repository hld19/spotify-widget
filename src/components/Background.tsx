import React from 'react';

const Background = ({ imageUrl }: { imageUrl?: string }) => {
  return (
    <div
      className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500"
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
    />
  );
};

export default Background; 
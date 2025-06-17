import React from 'react';

const PlayerSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col text-neutral-900 dark:text-white font-sans p-3 sm:p-4 md:p-6">
      <div className="flex flex-row items-center h-full">
        
        {/* Album Art Skeleton */}
        <div className="flex-shrink-0 mr-3 sm:mr-4 md:mr-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-[2rem] sm:rounded-[2.5rem] animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="flex flex-col flex-grow min-w-0">
          
          {/* Track Info Skeleton */}
          <div className="flex flex-row items-center justify-between mb-3 sm:mb-4 md:mb-5">
            <div className="flex-grow min-w-0 mr-2 sm:mr-3 md:mr-4">
              <div className="h-5 sm:h-6 md:h-7 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-xl mb-2 animate-pulse"></div>
              <div className="h-4 sm:h-5 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-lg w-3/4 animate-pulse"></div>
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-2xl animate-pulse"></div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-2xl animate-pulse"></div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-2xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Playback Controls Skeleton */}
          <div className="flex items-center justify-between space-x-3 sm:space-x-4 md:space-x-5 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-2xl animate-pulse"></div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-300 to-green-400 dark:from-green-600 dark:to-green-700 rounded-full animate-pulse shadow-xl"></div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-2xl animate-pulse"></div>
          </div>
          
          {/* Progress Bar Skeleton */}
          <div className="w-full space-y-3 mt-2">
            <div className="relative h-2 bg-neutral-200/60 dark:bg-neutral-700/60 rounded-full">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-green-300 to-green-400 dark:from-green-500 dark:to-green-600 rounded-full animate-pulse"></div>
            </div>
            
            {/* Time Display Skeleton */}
            <div className="flex justify-between">
              <div className="w-12 sm:w-14 h-6 sm:h-7 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-lg animate-pulse"></div>
              <div className="w-12 sm:w-14 h-6 sm:h-7 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSkeleton; 
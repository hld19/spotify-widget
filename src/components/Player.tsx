import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import { PlayIcon, PauseIcon, BackwardIcon, ForwardIcon, ChevronUpIcon, ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useSpotify } from '../hooks/useSpotify';

const isTrack = (item: SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObject): item is SpotifyApi.TrackObjectFull => {
    return item.type === 'track';
}

const Player: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isReady, isAuthenticated, playerState, login, controls } = useSpotify();

  if (!isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100/90 dark:bg-black/40 backdrop-blur-xl rounded-2xl text-neutral-900 dark:text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-400/20 to-green-600/20 dark:from-green-500/20 dark:to-green-700/20 backdrop-blur-xl rounded-2xl text-neutral-900 dark:text-white p-6 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold text-xl">♪</span>
              </div>
              <h1 className="text-xl font-bold mb-2">Spotify Widget</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Connect your Spotify account to get started</p>
              <button 
                onClick={login} 
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Connect Spotify
              </button>
            </div>
        </div>
    );
  }

  if (!playerState || !playerState.item) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100/90 dark:bg-black/40 backdrop-blur-xl rounded-2xl text-neutral-900 dark:text-white p-6 text-center shadow-xl">
            <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-3">
              <span className="text-neutral-500 dark:text-neutral-400 text-xl">♪</span>
            </div>
            <h2 className="text-lg font-semibold mb-1">Nothing is playing</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Open Spotify and play some music!</p>
        </div>
    );
  }

  const { item, is_playing, progress_ms } = playerState;
  
  const albumArt = isTrack(item) && item.album.images.length > 0 ? item.album.images[0].url : '/placeholder.png';
  const title = item.name;
  const artist = isTrack(item) ? item.artists.map(a => a.name).join(', ') : item.show.name;

  return (
    <div 
      data-tauri-drag-region 
      className="w-full h-full flex flex-col bg-white/90 dark:bg-black/40 backdrop-blur-xl rounded-2xl text-neutral-900 dark:text-white font-sans overflow-hidden transition-all duration-300 shadow-xl border border-white/20 dark:border-white/10" 
    >
      <div className={`flex p-4 transition-all duration-500 ease-in-out ${isExpanded ? 'flex-col items-center' : 'flex-row items-center h-full'}`}>
        
        {/* Album Art */}
        <div className={`flex-shrink-0 transition-all duration-500 ease-in-out ${isExpanded ? 'mb-4' : 'mr-4'}`}>
          <img
            src={albumArt}
            alt="Album Art"
            className={`aspect-square object-cover rounded-xl shadow-lg transition-all duration-500 ease-in-out ${
              isExpanded ? 'w-48 h-48' : 'w-16 h-16'
            }`}
            style={{ viewTransitionName: 'album-art' }}
          />
        </div>

        {/* Content */}
        <div className={`flex flex-col flex-grow transition-all duration-500 ease-in-out ${isExpanded ? 'w-full' : 'min-w-0'}`}>
          
          {/* Track Info and Controls */}
          <div className={`flex ${isExpanded ? 'flex-col' : 'flex-row'} ${isExpanded ? 'items-center text-center' : 'items-center justify-between'} mb-3`}>
            <div className={`${isExpanded ? 'mb-4' : 'flex-grow min-w-0 mr-4'}`}>
              <h2 className={`font-bold transition-all duration-500 truncate ${isExpanded ? 'text-2xl mb-1' : 'text-base'}`}>
                {title}
              </h2>
              <p className={`text-neutral-600 dark:text-neutral-400 transition-all duration-500 truncate ${isExpanded ? 'text-lg' : 'text-sm'}`}>
                {artist}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
              </button>
              <Link 
                to="/settings" 
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Playback Controls */}
          <div className={`flex items-center ${isExpanded ? 'justify-center space-x-8 mb-6' : 'justify-between space-x-3'}`}>
            <button 
              onClick={controls.previous} 
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <BackwardIcon className={`${isExpanded ? 'w-7 h-7' : 'w-5 h-5'}`} />
            </button>
            
            <button 
              onClick={() => is_playing ? controls.pause() : controls.play()} 
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-lg hover:scale-105 transition-all duration-200"
            >
              {is_playing ? 
                <PauseIcon className={`${isExpanded ? 'w-8 h-8' : 'w-6 h-6'}`} /> : 
                <PlayIcon className={`${isExpanded ? 'w-8 h-8' : 'w-6 h-6'}`} />
              }
            </button>
            
            <button 
              onClick={controls.next} 
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ForwardIcon className={`${isExpanded ? 'w-7 h-7' : 'w-5 h-5'}`} />
            </button>
          </div>
          
          {/* Progress Bar - always visible */}
          <div className="w-full">
            <ProgressBar
              duration={item.duration_ms}
              progress={progress_ms || 0}
              onSeek={controls.seek}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player; 
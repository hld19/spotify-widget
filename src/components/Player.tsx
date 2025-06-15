import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import { PlayIcon, PauseIcon, BackwardIcon, ForwardIcon, ChevronUpIcon, ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useSpotify } from '../hooks/useSpotify';

const isTrack = (item: SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObject): item is SpotifyApi.TrackObjectFull => {
    return item.type === 'track';
}

const Player: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { isReady, isAuthenticated, playerState, login, controls } = useSpotify();

  if (!isReady) {
    return <div className="w-full h-full flex items-center justify-center bg-neutral-100/80 dark:bg-black/30 backdrop-blur-2xl rounded-lg text-neutral-900 dark:text-white">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100/80 dark:bg-black/30 backdrop-blur-2xl rounded-lg text-neutral-900 dark:text-white p-4">
            <h1 className="text-xl font-bold mb-4">Spotify Widget</h1>
            <button onClick={login} className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 transition-colors">
                Login with Spotify
            </button>
        </div>
    );
  }

  if (!playerState || !playerState.item) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100/80 dark:bg-black/30 backdrop-blur-2xl rounded-lg text-neutral-900 dark:text-white p-4 text-center">
            <h2 className="text-lg font-semibold">Nothing is playing</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Open Spotify and play some music!</p>
        </div>
    );
  }

  const { item, is_playing, progress_ms } = playerState;
  
  const albumArt = isTrack(item) && item.album.images.length > 0 ? item.album.images[0].url : '/placeholder.png';
  const title = item.name;
  const artist = isTrack(item) ? item.artists.map(a => a.name).join(', ') : item.show.name;

  return (
    <div data-tauri-drag-region className="w-full h-full flex flex-col bg-neutral-100/80 dark:bg-black/30 backdrop-blur-2xl rounded-lg text-neutral-900 dark:text-white font-sans overflow-hidden transition-colors" >
      <div className={`flex p-4 transition-all duration-500 ease-in-out ${isExpanded ? 'flex-row items-start' : 'flex-col items-center'}`}>
        <img
          src={albumArt}
          alt="Album Art"
          className={`aspect-square object-cover rounded-md shadow-lg transition-all duration-500 ease-in-out ${isExpanded ? 'w-48 h-48' : 'w-full'}`}
          style={{ viewTransitionName: 'album-art' }}
        />
        <div className={`flex flex-col flex-grow transition-all duration-500 ease-in-out ${isExpanded ? 'ml-4 w-auto' : 'mt-4 w-full'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`font-bold transition-all duration-500 ${isExpanded ? 'text-2xl' : 'text-lg'}`}>{title}</h2>
              <p className={`text-neutral-800/70 dark:text-white/70 transition-all duration-500 ${isExpanded ? 'text-lg' : 'text-base'}`}>{artist}</p>
            </div>
            <div className="flex items-center space-x-1">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-neutral-600/50 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    {isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                </button>
                <Link to="/settings" className="text-neutral-600/50 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <Cog6ToothIcon className="w-5 h-5" />
                </Link>
            </div>
          </div>
          
          <div className={`flex-grow flex flex-col justify-end ${isExpanded ? 'mt-0' : 'mt-4'}`}>
            <div className="flex items-center justify-center space-x-6 my-4">
              <button onClick={controls.previous} className="text-neutral-800/70 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <BackwardIcon className="w-7 h-7" />
              </button>
              <button onClick={() => is_playing ? controls.pause() : controls.play()} className="bg-black text-white dark:bg-white dark:text-black rounded-full p-3 shadow-lg hover:scale-105 transition-transform">
                {is_playing ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
              </button>
              <button onClick={controls.next} className="text-neutral-800/70 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <ForwardIcon className="w-7 h-7" />
              </button>
            </div>
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
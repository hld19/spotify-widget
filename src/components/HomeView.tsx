import React from 'react';

interface HomeViewProps {
  recentlyPlayed: any[];
  onPlay: (contextUri: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ recentlyPlayed, onPlay }) => {
  const uniqueAlbums = recentlyPlayed.reduce((acc, current) => {
    if (!acc.find((item: any) => item.track.album.id === current.track.album.id)) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <div data-tauri-drag-region className="w-full h-full flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-xl rounded-xl p-4">
        <h2 className="text-lg font-bold text-white mb-4 self-start">Recently Played</h2>
        <div className="grid grid-cols-2 gap-4 w-full">
            {uniqueAlbums.slice(0, 4).map(({ track }: { track: any }) => (
            <div
                key={track.album.id}
                className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/70 transition-colors group"
                onClick={() => onPlay(track.album.uri)}
            >
                <img src={track.album.images[0].url} alt={track.album.name} className="w-full h-auto aspect-square" />
                <div className="p-2">
                <p className="text-white text-sm font-bold truncate">{track.album.name}</p>
                <p className="text-gray-400 text-xs truncate">{track.artists[0].name}</p>
                </div>
            </div>
            ))}
        </div>
    </div>
  );
};

export default HomeView; 
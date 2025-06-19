/**
 * Track History Hook
 * Manages local track history with persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { SpotifyTrack } from '../api/spotify';

interface TrackHistoryItem {
  track: SpotifyTrack;
  playedAt: string;
  duration: number;
}

const MAX_HISTORY_ITEMS = 100;
const STORAGE_KEY = 'spotify-track-history';

export function useTrackHistory() {
  const [history, setHistory] = useState<TrackHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save track history:', error);
    }
  }, [history]);

  const addTrack = useCallback((track: SpotifyTrack) => {
    setHistory(prev => {
      // Don't add if the same track was just played (within last minute)
      const lastTrack = prev[0];
      if (lastTrack && lastTrack.track.id === track.id) {
        const timeDiff = Date.now() - new Date(lastTrack.playedAt).getTime();
        if (timeDiff < 60000) { // 1 minute
          return prev;
        }
      }

      const newItem: TrackHistoryItem = {
        track,
        playedAt: new Date().toISOString(),
        duration: track.duration_ms,
      };

      // Keep only the most recent MAX_HISTORY_ITEMS
      const newHistory = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getStats = useCallback(() => {
    const totalTracks = history.length;
    const uniqueTracks = new Set(history.map(item => item.track.id)).size;
    const totalDuration = history.reduce((sum, item) => sum + item.duration, 0);
    const mostPlayedTrack = getMostPlayedTrack();
    const mostPlayedArtist = getMostPlayedArtist();

    return {
      totalTracks,
      uniqueTracks,
      totalDuration,
      mostPlayedTrack,
      mostPlayedArtist,
    };
  }, [history]);

  const getMostPlayedTrack = () => {
    const trackCounts = history.reduce((acc, item) => {
      const key = item.track.id;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let maxCount = 0;
    let mostPlayed = null;

    for (const [trackId, count] of Object.entries(trackCounts)) {
      if (count > maxCount) {
        maxCount = count;
        const historyItem = history.find(item => item.track.id === trackId);
        mostPlayed = historyItem ? { track: historyItem.track, count } : null;
      }
    }

    return mostPlayed;
  };

  const getMostPlayedArtist = () => {
    const artistCounts = history.reduce((acc, item) => {
      item.track.artists.forEach(artist => {
        acc[artist.name] = (acc[artist.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    let maxCount = 0;
    let mostPlayed = null;

    for (const [artist, count] of Object.entries(artistCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostPlayed = { artist, count };
      }
    }

    return mostPlayed;
  };

  const getRecentlyPlayed = (limit: number = 20) => {
    return history.slice(0, limit);
  };

  const searchHistory = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return history.filter(item => 
      item.track.name.toLowerCase().includes(lowerQuery) ||
      item.track.artists.some(artist => artist.name.toLowerCase().includes(lowerQuery)) ||
      item.track.album.name.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    history,
    addTrack,
    clearHistory,
    getStats,
    getRecentlyPlayed,
    searchHistory,
  };
} 
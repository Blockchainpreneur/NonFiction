
import { Playlist, Fragment } from '../types';

const PLAYLISTS_KEY = 'nonfiction_playlists';
const FRAGMENTS_KEY = 'nonfiction_fragments';
const USER_KEY = 'nonfiction_user';

export const StorageService = {
  savePlaylist: (playlist: Playlist) => {
    try {
      const playlists = StorageService.getPlaylists();
      const filtered = playlists.filter(p => p.id !== playlist.id);
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify([playlist, ...filtered]));
    } catch (e) {
      console.warn("Storage quota exceeded for playlists. Cleaning up oldest entries.");
      const playlists = StorageService.getPlaylists();
      if (playlists.length > 5) {
        localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists.slice(0, 5)));
      }
    }
  },

  getPlaylists: (): Playlist[] => {
    const data = localStorage.getItem(PLAYLISTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveFragments: (playlistId: string, fragments: Fragment[]) => {
    try {
      const allFragments = StorageService.getAllFragments();
      const filtered = allFragments.filter(f => f.playlist_id !== playlistId);
      localStorage.setItem(FRAGMENTS_KEY, JSON.stringify([...filtered, ...fragments]));
    } catch (e) {
      console.warn("Storage quota exceeded for fragments. Clearing audio cache to make room.");
      // If we can't save new fragments, clear all cached audio data from existing fragments
      // as audio blobs are the primary cause of quota issues.
      const allFragments = StorageService.getAllFragments();
      const cleaned = allFragments.map(f => ({ ...f, audio_url: undefined }));
      try {
        localStorage.setItem(FRAGMENTS_KEY, JSON.stringify([...cleaned, ...fragments]));
      } catch (innerE) {
        // If still failing, clear older fragments entirely
        localStorage.setItem(FRAGMENTS_KEY, JSON.stringify(fragments));
      }
    }
  },

  updateFragmentAudio: (fragmentId: string, audioBase64: string) => {
    try {
      const allFragments = StorageService.getAllFragments();
      const updated = allFragments.map(f => 
        f.id === fragmentId ? { ...f, audio_url: audioBase64 } : f
      );
      localStorage.setItem(FRAGMENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to cache audio: Storage quota exceeded.");
      // Audio caching is optional, we don't throw an error here.
    }
  },

  getFragments: (playlistId: string): Fragment[] => {
    const allFragments = StorageService.getAllFragments();
    return allFragments.filter(f => f.playlist_id === playlistId).sort((a, b) => a.order - b.order);
  },

  getAllFragments: (): Fragment[] => {
    const data = localStorage.getItem(FRAGMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  }
};

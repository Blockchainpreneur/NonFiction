
export enum FragmentStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  READY = 'ready',
  FAILED = 'failed'
}

export interface Fragment {
  id: string;
  playlist_id: string;
  book_title: string;
  author: string;
  text_original: string;
  audio_url?: string;
  order: number;
  status: FragmentStatus;
}

export interface Playlist {
  id: string;
  title: string;
  prompt_original: string;
  tags: string[];
  total_fragments: number;
  total_listens: number;
  status: string;
  created_at: number;
}

export interface User {
  id: string;
  email: string;
  is_subscribed: boolean;
  subscription_type: 'monthly' | 'yearly' | 'none';
  playlist_generation_count: number;
}


import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, ChevronUp, ChevronDown, BookOpen, Loader2 } from 'lucide-react';
import { Fragment } from '../types';

interface AudioPlayerProps {
  currentFragment: Fragment | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkip: () => void;
  audioData?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  currentFragment, 
  isPlaying, 
  onTogglePlay, 
  onSkip,
  audioData 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  // Implementación manual de decodificación de Base64 a PCM
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000); // Gemini TTS usa 24kHz mono
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
  };

  const playBuffer = async (base64: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    stopAudio();
    setIsDecoding(true);
    try {
      const rawData = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(rawData, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        if (isPlaying) onSkip();
      };
      source.start(0);
      sourceNodeRef.current = source;
    } catch (err) {
      console.error("Audio Playback Error:", err);
    } finally {
      setIsDecoding(false);
    }
  };

  useEffect(() => {
    if (audioData && isPlaying) {
      playBuffer(audioData);
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [audioData, isPlaying]);

  if (!currentFragment) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isExpanded ? 'h-full bg-white pt-12' : 'h-24'}`}>
      <div className={`h-full glass-morphism ios-shadow px-6 flex ${isExpanded ? 'flex-col' : 'items-center justify-between'}`}>
        
        {isExpanded && (
          <button onClick={() => setIsExpanded(false)} className="self-center mb-8 text-gray-300 active:scale-90 transition-transform">
            <ChevronDown size={40} />
          </button>
        )}

        <div className={`flex items-center gap-4 ${isExpanded ? 'flex-col text-center mb-10 mt-4' : 'flex-1 overflow-hidden'}`}>
          <div className={`bg-gray-900 rounded-[1.5rem] flex items-center justify-center text-white transition-all shadow-xl ${isExpanded ? 'w-64 h-64 mb-8' : 'w-12 h-12'}`}>
            <BookOpen size={isExpanded ? 80 : 20} />
          </div>
          <div className={`${isExpanded ? 'w-full px-4' : 'flex-1 overflow-hidden'}`}>
            <h3 className={`font-bold text-gray-900 truncate ${isExpanded ? 'text-2xl mb-2' : 'text-sm'}`}>
              {currentFragment.book_title}
            </h3>
            <p className={`text-gray-400 font-medium truncate ${isExpanded ? 'text-lg uppercase tracking-widest' : 'text-xs uppercase tracking-tighter'}`}>
              {currentFragment.author}
            </p>
          </div>
        </div>

        {isExpanded && (
          <div className="flex-1 overflow-y-auto mb-10 px-6 py-4">
             <div className="relative">
                <span className="absolute -left-4 -top-4 text-6xl text-indigo-50 font-serif">“</span>
                <p className="text-gray-700 font-medium italic leading-relaxed text-xl relative z-10">
                  {currentFragment.text_original}
                </p>
             </div>
          </div>
        )}

        <div className={`flex items-center gap-8 ${isExpanded ? 'justify-center w-full pb-16' : ''}`}>
          <div className="flex items-center gap-6">
            <button onClick={onTogglePlay} className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
              {(isDecoding || (!audioData && isPlaying)) ? (
                <Loader2 className="animate-spin" size={28} />
              ) : (
                isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />
              )}
            </button>
            <button onClick={onSkip} className="w-12 h-12 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center active:scale-90 transition-transform">
              <SkipForward size={24} fill="currentColor" />
            </button>
          </div>
          {!isExpanded && (
            <button onClick={() => setIsExpanded(true)} className="text-gray-300 ml-2 p-2">
              <ChevronUp size={24} />
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-12 overflow-hidden px-8">
            <div className="w-1/3 h-full bg-indigo-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;

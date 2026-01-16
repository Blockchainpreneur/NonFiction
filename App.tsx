
import React, { useState, useEffect } from 'react';
import { Plus, Search, Home as HomeIcon, Library, User as UserIcon, Loader2, Play } from 'lucide-react';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Paywall from './components/Paywall';
import AudioPlayer from './components/AudioPlayer';
import { generatePlaylistContent, generateSpeechForFragment } from './services/geminiService';
import { StorageService } from './services/storageService';
import { Playlist, Fragment, FragmentStatus } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [activeFragments, setActiveFragments] = useState<Fragment[]>([]);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | undefined>(undefined);

  useEffect(() => {
    const savedUser = StorageService.getUser();
    if (savedUser) {
      setUser(savedUser);
      setOnboardingComplete(true);
    }
    setPlaylists(StorageService.getPlaylists());
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    StorageService.saveUser(userData);
  };

  const handleCreatePlaylist = async () => {
    if (!promptInput.trim()) return;
    
    const count = playlists.length;
    if (count > 0 && count % 3 === 0 && !user?.is_subscribed) {
      setShowPaywall(true);
      return;
    }

    setIsLoading(true);
    setIsCreating(false);
    try {
      const data = await generatePlaylistContent(promptInput);
      
      const newPlaylist: Playlist = {
        id: 'pl_' + Math.random().toString(36).substr(2, 9),
        title: data.title,
        prompt_original: promptInput,
        tags: data.tags,
        total_fragments: data.fragments.length,
        total_listens: 0,
        status: 'ready',
        created_at: Date.now(),
      };

      const newFragments: Fragment[] = data.fragments.map((f: any, i: number) => ({
        id: 'fr_' + Math.random().toString(36).substr(2, 9),
        playlist_id: newPlaylist.id,
        book_title: f.book_title,
        author: f.author,
        text_original: f.text_original,
        order: i,
        status: FragmentStatus.READY,
      }));

      StorageService.savePlaylist(newPlaylist);
      StorageService.saveFragments(newPlaylist.id, newFragments);
      
      setPlaylists([newPlaylist, ...playlists]);
      await playPlaylist(newPlaylist, newFragments);
    } catch (error) {
      console.error("Error generating playlist:", error);
      alert("Hubo un error con el API de Gemini. Reintenta.");
    } finally {
      setIsLoading(false);
      setPromptInput('');
    }
  };

  const playPlaylist = async (playlist: Playlist, fragments?: Fragment[]) => {
    const targetFragments = fragments || StorageService.getFragments(playlist.id);
    setActivePlaylist(playlist);
    setActiveFragments(targetFragments);
    setCurrentFragmentIndex(0);
    setIsPlaying(true);
    
    if (targetFragments.length > 0) {
      await loadAudio(targetFragments[0]);
    }
  };

  const loadAudio = async (fragment: Fragment) => {
    setCurrentAudio(undefined);
    
    // Si ya tenemos el audio persistido en el fragmento, lo usamos
    if (fragment.audio_url) {
      setCurrentAudio(fragment.audio_url);
      return;
    }

    try {
      const audio = await generateSpeechForFragment(fragment.text_original);
      if (audio) {
        setCurrentAudio(audio);
        // Persistir el audio generado para no gastar tokens después
        StorageService.updateFragmentAudio(fragment.id, audio);
      }
    } catch (e) {
      console.error("Speech generation failed", e);
    }
  };

  const handleNext = async () => {
    if (currentFragmentIndex < activeFragments.length - 1) {
      const nextIdx = currentFragmentIndex + 1;
      setCurrentFragmentIndex(nextIdx);
      await loadAudio(activeFragments[nextIdx]);
    } else {
      setIsPlaying(false);
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;
  if (!onboardingComplete) return <Onboarding onComplete={() => setOnboardingComplete(true)} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="px-6 pt-12 pb-6 bg-white sticky top-0 z-40 ios-shadow flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nonfiction</h1>
          <p className="text-gray-500 text-sm">Escucha sabiduría, {user.name.split(' ')[0]}.</p>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-indigo-100">
          <UserIcon size={20} className="text-gray-600" />
        </button>
      </header>

      <main className="px-6 pt-6 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
            Tu Biblioteca <span className="text-xs text-indigo-600 font-semibold uppercase tracking-widest">{playlists.length} temas</span>
          </h2>
          {playlists.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center ios-shadow border border-indigo-50">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Library size={32} />
              </div>
              <p className="text-gray-900 font-bold text-lg mb-2">Tu mente está en blanco</p>
              <p className="text-gray-500 text-sm mb-6">Genera una playlist para empezar a aprender de los mejores libros.</p>
              <button onClick={() => setIsCreating(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all">Crear Playlist</button>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {playlists.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => playPlaylist(p)}
                  className={`min-w-[240px] rounded-3xl p-6 flex flex-col justify-between ios-shadow active:scale-95 transition-all cursor-pointer border ${activePlaylist?.id === p.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-900 border-gray-50'}`}
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${activePlaylist?.id === p.id ? 'bg-white text-indigo-600' : 'bg-gray-900 text-white'}`}>
                      <Play size={22} fill="currentColor" />
                    </div>
                    <h3 className="font-bold leading-tight mb-2 text-xl">{p.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map(t => (
                        <span key={t} className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter ${activePlaylist?.id === p.id ? 'bg-indigo-500 text-indigo-100' : 'bg-indigo-50 text-indigo-600'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`mt-6 text-[10px] font-bold uppercase ${activePlaylist?.id === p.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {p.total_fragments} Lecciones en audio
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Descubrir Temas</h2>
          <div className="grid grid-cols-2 gap-4">
            {['Inversión 101', 'Biohacking', 'Deep Work', 'Marketing'].map(topic => (
              <button 
                key={topic} 
                onClick={() => { setPromptInput(topic); setIsCreating(true); }}
                className="p-5 bg-white rounded-2xl ios-shadow font-bold text-gray-800 flex items-center justify-between active:bg-gray-50 transition-colors border border-gray-50"
              >
                {topic}
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Plus size={16} />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <button 
        onClick={() => setIsCreating(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform z-50 border-4 border-white"
      >
        <Plus size={32} />
      </button>

      {isCreating && (
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 ios-shadow animate-in slide-in-from-bottom-20 duration-500">
            <h2 className="text-2xl font-bold mb-2">Nueva Playlist</h2>
            <p className="text-gray-500 mb-6 text-sm font-medium">Extraeremos fragmentos verbatim de libros top.</p>
            <textarea
              autoFocus
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ej: Cómo mejorar mi inteligencia financiera..."
              className="w-full h-32 p-5 bg-gray-50 rounded-2xl text-lg outline-none focus:ring-2 ring-indigo-500 transition-all resize-none mb-6 border border-gray-100"
            />
            <div className="flex gap-4">
              <button onClick={() => setIsCreating(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">Cerrar</button>
              <button onClick={handleCreatePlaylist} disabled={isLoading || !promptInput.trim()} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Generar Audio'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center px-6 z-40">
        <NavItem icon={<HomeIcon size={24} />} label="Inicio" active />
        <NavItem icon={<Search size={24} />} label="Explorar" />
        <NavItem icon={<Library size={24} />} label="Guardado" />
      </nav>

      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
          <div className="relative mb-12">
             <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-indigo-600 font-black text-xl">N</span>
             </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Escaneando Libros</h2>
          <p className="text-gray-500 text-lg max-w-xs font-medium italic">"Analizando bibliotecas globales para encontrar los fragmentos exactos..."</p>
        </div>
      )}

      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} onSubscribe={() => setShowPaywall(false)} />}
      
      <AudioPlayer 
        currentFragment={activeFragments[currentFragmentIndex] || null} 
        isPlaying={isPlaying} 
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSkip={handleNext}
        audioData={currentAudio}
      />
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </div>
);

export default App;

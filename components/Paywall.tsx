
import React from 'react';
import { X, Check, Zap } from 'lucide-react';

interface PaywallProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onClose, onSubscribe }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-white p-8 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
      <button onClick={onClose} className="self-end p-2 text-gray-400 hover:text-gray-900">
        <X size={24} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-200">
          <Zap size={40} fill="currentColor" />
        </div>
        
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Desbloquea el Conocimiento Infinito</h2>
        <p className="text-lg text-gray-500 mb-12">Escucha fragmentos exactos de los mejores libros de no ficción sin límites.</p>

        <div className="w-full space-y-4 mb-12">
          <div className="p-6 border-2 border-indigo-600 rounded-3xl bg-indigo-50 flex items-center justify-between text-left">
            <div>
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Anual</span>
              <h3 className="text-2xl font-bold text-gray-900">$250 USD <span className="text-sm font-normal text-gray-500">/ año</span></h3>
            </div>
            <div className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold">AHORRA 25%</div>
          </div>

          <div className="p-6 border-2 border-gray-100 rounded-3xl flex items-center justify-between text-left hover:border-indigo-200 transition-all cursor-pointer">
            <div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Mensual</span>
              <h3 className="text-2xl font-bold text-gray-900">$29 USD <span className="text-sm font-normal text-gray-500">/ mes</span></h3>
            </div>
          </div>
        </div>

        <ul className="text-left w-full space-y-4 mb-12">
          <li className="flex items-center gap-3 text-gray-700 font-medium">
            <Check size={20} className="text-indigo-600" /> Playlists ilimitadas por tema
          </li>
          <li className="flex items-center gap-3 text-gray-700 font-medium">
            <Check size={20} className="text-indigo-600" /> Audio de alta calidad (TTS Premium)
          </li>
          <li className="flex items-center gap-3 text-gray-700 font-medium">
            <Check size={20} className="text-indigo-600" /> Acceso a todas las playlists de la comunidad
          </li>
        </ul>

        <button 
          onClick={onSubscribe}
          className="w-full py-5 bg-gray-900 text-white rounded-2xl text-xl font-bold shadow-xl active:scale-95 transition-all mb-4"
        >
          Empezar Ahora
        </button>
        <p className="text-xs text-gray-400">Cancela en cualquier momento. Sin compromiso.</p>
      </div>
    </div>
  );
};

export default Paywall;
